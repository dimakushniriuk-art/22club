'use client'

import { useMemo } from 'react'
import { createLogger } from '@/lib/logger'
import { validateWeight } from '@/lib/utils/validation'
import type { Tables } from '@/types/supabase'

const logger = createLogger('hooks:use-progress-data')

export type ProgressData = {
  type: 'weight'
  current: number
  previous: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  period: string
} | null

/**
 * Hook per calcolare i dati progressi dal database
 * Estratto da page.tsx per migliorare performance e manutenibilità
 */
export function useProgressData(
  progressLogs: Tables<'progress_logs'>[] | null | undefined,
): ProgressData {
  // Estrai valori chiave da progressLogs per dipendenze stabili (ottimizzazione performance)
  const progressLogsKey = useMemo(() => {
    if (!progressLogs || progressLogs.length === 0) return null
    // Crea una chiave stabile basata sui valori chiave dei log (non sulla reference)
    const validLogs = progressLogs.filter(
      (log) =>
        log.id &&
        log.date &&
        typeof log.weight_kg === 'number' &&
        !isNaN(log.weight_kg) &&
        log.weight_kg > 0,
    )

    if (validLogs.length === 0) return null

    // Serializza valori chiave per confronto stabile
    return JSON.stringify(
      validLogs.map((log) => ({
        id: log.id,
        date: log.date,
        weight_kg: log.weight_kg,
      })),
    )
  }, [progressLogs])

  // Calcola progressData (memoizzato per evitare ricalcoli inutili)
  const progressData = useMemo((): ProgressData => {
    if (!progressLogs || progressLogs.length === 0 || !progressLogsKey) {
      return null
    }

    try {
      // Ordina per data (più recente prima)
      const sortedLogs = [...progressLogs]
        .filter(
          (log) =>
            log.date &&
            typeof log.weight_kg === 'number' &&
            !isNaN(log.weight_kg) &&
            log.weight_kg > 0,
        )
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateB - dateA // Più recente prima
        })

      if (sortedLogs.length === 0) {
        return null
      }

      // Prendi ultimo e penultimo peso
      const current = sortedLogs[0]?.weight_kg ?? 0
      const previous = sortedLogs.length > 1 ? (sortedLogs[1]?.weight_kg ?? current) : current

      // Valida che i valori siano numeri validi
      if (isNaN(current) || isNaN(previous) || current <= 0 || previous <= 0) {
        logger.warn('Dati peso non validi', undefined, { current, previous, sortedLogs })
        return null
      }

      // Valida peso con range 40-150 kg
      const currentValidation = validateWeight(current, { min: 40, max: 150 })
      const previousValidation = validateWeight(previous, { min: 40, max: 150 })

      if (!currentValidation.valid || !previousValidation.valid) {
        logger.warn('Peso fuori range valido', undefined, {
          current,
          previous,
          currentError: currentValidation.error,
          previousError: previousValidation.error,
        })
        return null
      }

      // Calcola trend
      const difference = current - previous
      const trend: 'up' | 'down' | 'stable' =
        difference > 0.1 ? 'up' : difference < -0.1 ? 'down' : 'stable'

      // Calcola periodo (differenza giorni tra ultimo e penultimo)
      let period = 'questa settimana'
      if (sortedLogs.length > 1) {
        try {
          const date1 = new Date(sortedLogs[0].date).getTime()
          const date2 = new Date(sortedLogs[1].date).getTime()
          const daysDiff = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24))
          if (daysDiff <= 7) {
            period = 'questa settimana'
          } else if (daysDiff <= 30) {
            period = 'questo mese'
          } else {
            period = 'ultimi mesi'
          }
        } catch {
          period = 'questa settimana'
        }
      }

      return {
        type: 'weight',
        current,
        previous,
        unit: 'kg',
        trend,
        period,
      }
    } catch (err) {
      logger.error('Errore nel calcolo progressData', err, { progressLogs })
      return null
    }
  }, [progressLogsKey, progressLogs]) // Usa progressLogsKey invece di progressLogs direttamente

  return progressData
}
