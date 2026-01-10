'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:use-progress-reminders')

interface UseProgressRemindersProps {
  userId?: string | null
  role?: string | null
}

export function useProgressReminders({ userId, role }: UseProgressRemindersProps) {
  const [reminders, setReminders] = useState<{
    needsMeasurement: boolean
    needsPhoto: boolean
    lastMeasurementDate: string | null
    lastPhotoDate: string | null
    daysSinceMeasurement: number | null
    daysSincePhoto: number | null
  }>({
    needsMeasurement: false,
    needsPhoto: false,
    lastMeasurementDate: null,
    lastPhotoDate: null,
    daysSinceMeasurement: null,
    daysSincePhoto: null,
  })

  const supabase = createClient()

  const sendReminderNotification = useCallback(
    async (needsMeasurement: boolean, needsPhoto: boolean) => {
      if (!userId) return

      try {
        const notifications = []

        if (needsMeasurement) {
          notifications.push({
            user_id: userId,
            title: 'È ora di aggiornare i tuoi progressi 💪',
            body: "Sono passati 7 giorni dall'ultima misurazione. Registra peso, circonferenze e forza!",
            link: '/home/progressi',
            type: 'progress_reminder',
          })
        }

        if (needsPhoto) {
          notifications.push({
            user_id: userId,
            title: 'Carica nuove foto per vedere il tuo cambiamento 📸',
            body: "Sono passati 14 giorni dall'ultima foto. Scatta nuove foto per monitorare i progressi!",
            link: '/home/progressi/foto',
            type: 'photo_reminder',
          })
        }

        // Inserisci le notifiche
        for (const notification of notifications) {
          const { error } = await supabase.from('notifications').insert(notification)

          if (error) {
            logger.error('Error creating notification', error, { userId, type: notification.type })
          }
        }
      } catch (error) {
        logger.error('Error sending reminder notification', error, {
          userId,
          needsMeasurement,
          needsPhoto,
        })
      }
    },
    [userId, supabase],
  )

  const checkReminders = useCallback(async () => {
    if (!userId || role !== 'atleta') return

    try {
      // Ottieni l'ultima misurazione
      const { data: latestLog, error: logError } = await supabase
        .from('progress_logs')
        .select('date')
        .eq('athlete_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      // Ottieni l'ultima foto
      const { data: latestPhoto, error: photoError } = await supabase
        .from('progress_photos')
        .select('date')
        .eq('athlete_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (logError && logError.code !== 'PGRST116') {
        logger.error('Error fetching latest log', logError, { userId })
      }

      if (photoError && photoError.code !== 'PGRST116') {
        logger.error('Error fetching latest photo', photoError, { userId })
      }

      const now = new Date()
      const lastMeasurementDate = latestLog?.date || null
      const lastPhotoDate = latestPhoto?.date || null

      // Calcola giorni dall'ultima misurazione
      const daysSinceMeasurement = lastMeasurementDate
        ? Math.floor(
            (now.getTime() - new Date(lastMeasurementDate).getTime()) / (1000 * 60 * 60 * 24),
          )
        : null

      // Calcola giorni dall'ultima foto
      const daysSincePhoto = lastPhotoDate
        ? Math.floor((now.getTime() - new Date(lastPhotoDate).getTime()) / (1000 * 60 * 60 * 24))
        : null

      // Determina se servono reminder
      const needsMeasurement = daysSinceMeasurement !== null && daysSinceMeasurement >= 7
      const needsPhoto = daysSincePhoto !== null && daysSincePhoto >= 14

      setReminders({
        needsMeasurement,
        needsPhoto,
        lastMeasurementDate,
        lastPhotoDate,
        daysSinceMeasurement,
        daysSincePhoto,
      })

      // Invia notifiche se necessario
      if (needsMeasurement || needsPhoto) {
        await sendReminderNotification(needsMeasurement, needsPhoto)
      }
    } catch (error) {
      logger.error('Error checking reminders', error, { userId, role })
    }
  }, [userId, role, supabase, sendReminderNotification])

  const markReminderAsSent = async (type: 'measurement' | 'photo') => {
    try {
      // TODO: Implementare tabella reminder_tracking nel database
      // Per ora usiamo localStorage per evitare notifiche duplicate
      if (typeof window !== 'undefined') {
        const key = `reminder_sent_${userId}_${type}`
        localStorage.setItem(key, new Date().toISOString())
      }
    } catch (error) {
      logger.error('Error marking reminder as sent', error, { userId, type })
    }
  }

  useEffect(() => {
    if (!userId) return

    // Controlla i reminder al mount
    checkReminders()

    // Controlla ogni ora
    const interval = setInterval(checkReminders, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [userId, checkReminders])

  return {
    reminders,
    checkReminders,
    markReminderAsSent,
  }
}
