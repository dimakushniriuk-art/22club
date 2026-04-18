'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { NotificationType } from '@/lib/notifications/types'

const logger = createLogger('hooks:use-notifications')

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  link?: string | null
  type: NotificationType
  sent_at: string | null
  read_at?: string | null
  action_text?: string | null
  is_push_sent: boolean
  created_at: string
}

interface UseNotificationsProps {
  userId?: string | null
}

export function useNotifications({ userId }: UseNotificationsProps = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setNotifications((data || []) as Notification[])
      setUnreadCount(data?.filter((n: { read_at?: string | null }) => !n.read_at).length || 0)
    } catch (err) {
      logger.error('Error fetching notifications', err, { userId })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle notifiche')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        setError(null)

        if (!userId) throw new Error('User ID is required')

        const { error: updateError } = await supabase
          .from('notifications')
          .update({
            read_at: new Date().toISOString(),
          })
          .eq('id', notificationId)
          .eq('user_id', userId)

        if (updateError) throw updateError

        // Aggiorna lo stato locale
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  read_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : n,
          ),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        logger.error('Error marking notification as read', err, { notificationId })
        setError(err instanceof Error ? err.message : 'Errore nel marcare la notifica come letta')
        throw err
      }
    },
    [userId],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null)

      if (!userId) throw new Error('User ID is required')

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .is('read_at', null)

      if (updateError) throw updateError

      // Aggiorna lo stato locale
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      )
      setUnreadCount(0)
    } catch (err) {
      logger.error('Error marking all notifications as read', err, { userId })
      setError(
        err instanceof Error ? err.message : 'Errore nel marcare tutte le notifiche come lette',
      )
      throw err
    }
  }, [userId])

  const createNotification = useCallback(
    async (
      title: string,
      body: string,
      type: Notification['type'],
      link?: string,
      actionText?: string,
      options?: { recipientUserId?: string | null },
    ) => {
      const raw = options?.recipientUserId
      const recipient =
        typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null
      const targetUserId = recipient ?? userId ?? null
      if (!targetUserId) {
        setError('User ID is required to create notification')
        return null
      }

      try {
        setError(null)

        const { data, error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            title,
            body,
            type,
            link,
            action_text: actionText,
          })
          .select()
          .single()

        if (insertError) throw insertError

        if (userId && targetUserId === userId) {
          setNotifications((prev) => [data as Notification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }

        return data
      } catch (err) {
        logger.error('Error creating notification', err, { type, title })
        setError(err instanceof Error ? err.message : 'Errore nella creazione della notifica')
        throw err
      }
    },
    [userId],
  )

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        setError(null)

        if (!userId) throw new Error('User ID is required')

        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', userId)

        if (deleteError) throw deleteError

        // Aggiorna lo stato locale
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        setUnreadCount((prev) => {
          const notification = notifications.find((n) => n.id === notificationId)
          return notification && !notification.read_at ? Math.max(0, prev - 1) : prev
        })
      } catch (err) {
        logger.error('Error deleting notification', err, { notificationId })
        setError(err instanceof Error ? err.message : "Errore nell'eliminazione della notifica")
        throw err
      }
    },
    [userId, notifications],
  )

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.read_at)
  }, [notifications])

  const getNotificationsByType = useCallback(
    (type: Notification['type']) => {
      return notifications.filter((n) => n.type === type)
    },
    [notifications],
  )

  const hasUnread = unreadCount > 0

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasUnread,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    getUnreadNotifications,
    getNotificationsByType,
  }
}
