'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { statsCache } from '@/lib/cache/cache-strategies'
import type { ProgressLog, ProgressPhoto, ProgressStats } from '@/types/progress'

const logger = createLogger('hooks:use-progress')

// const STATS_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minuti (non utilizzato)

interface UseProgressProps {
  userId?: string | null
  role?: string | null
}

export function useProgress({ userId, role }: UseProgressProps) {
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([])
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProgressLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from('progress_logs').select('*')

      if (role === 'atleta' && userId) {
        query = query.eq('athlete_id', userId)
      } else if ((role === 'admin' || role === 'pt') && userId) {
        // Staff può vedere tutti i progressi
        query = query
      }

      const { data, error: fetchError } = await query.order('date', {
        ascending: false,
      })

      if (fetchError) {
        throw fetchError
      }

      setProgressLogs(data || [])
    } catch (err) {
      logger.error('Error fetching progress logs', err, { userId, role })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei progressi')
    } finally {
      setLoading(false)
    }
  }, [userId, role, supabase])

  const fetchProgressPhotos = useCallback(async () => {
    try {
      setError(null)

      let query = supabase.from('progress_photos').select('*')

      if (role === 'atleta' && userId) {
        query = query.eq('athlete_id', userId)
      } else if ((role === 'admin' || role === 'pt') && userId) {
        // Staff può vedere tutte le foto
        query = query
      }

      const { data, error: fetchError } = await query.order('date', {
        ascending: false,
      })

      if (fetchError) {
        throw fetchError
      }

      setProgressPhotos(data || [])
    } catch (err) {
      logger.error('Error fetching progress photos', err, { userId, role })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle foto')
    }
  }, [userId, role, supabase])

  useEffect(() => {
    if (!userId) return

    fetchProgressLogs()
    fetchProgressPhotos()
  }, [userId, role, fetchProgressLogs, fetchProgressPhotos])

  const createProgressLog = async (
    logData: Omit<ProgressLog, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      setError(null)
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('progress_logs') as any)
        .insert(logData)
        .select()
        .single()

      if (error) throw error

      // Ricarica i progressi
      await fetchProgressLogs()

      return data
    } catch (err) {
      logger.error('Error creating progress log', err, { athleteId: logData.athlete_id })
      setError(err instanceof Error ? err.message : 'Errore nella creazione del progresso')
      throw err
    }
  }

  const createProgressPhoto = async (
    photoData: Omit<ProgressPhoto, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('progress_photos')
        .insert(photoData as never)
        .select()
        .single()

      if (error) throw error

      // Ricarica le foto
      await fetchProgressPhotos()

      return data
    } catch (err) {
      logger.error('Error creating progress photo', err, { athleteId: photoData.athlete_id })
      setError(err instanceof Error ? err.message : 'Errore nella creazione della foto')
      throw err
    }
  }

  const getProgressStats = useCallback(async (): Promise<ProgressStats | null> => {
    if (!userId) return null

    try {
      // Controlla cache prima
      const cacheKey = `progress-stats:${userId}`
      const cached = statsCache.get<ProgressStats>(cacheKey)
      if (cached) {
        return cached
      }

      // Prova prima con RPC (ottimizzata)
      try {
        // Workaround necessario per tipizzazione Supabase RPC
        const { data: rpcData, error: rpcError } =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.rpc as any)('get_progress_stats', {
            athlete_uuid: userId,
          })

        if (!rpcError && rpcData) {
          // La RPC ritorna JSON, convertiamo al formato ProgressStats
          const stats: ProgressStats = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            total_logs: (rpcData as any).total_logs || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            total_photos: (rpcData as any).total_photos || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            avg_weight: (rpcData as any).avg_weight || undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            weight_change_30d: (rpcData as any).weight_change_30d || undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            latest_measurements: (rpcData as any).latest_measurements || undefined,
          }

          // Salva in cache (TTL gestito internamente)
          statsCache.set(cacheKey, stats)

          return stats
        }
      } catch (rpcErr) {
        // Se RPC fallisce, logga ma continua con fallback
        logger.warn('RPC get_progress_stats failed, using fallback', rpcErr, { userId })
      }

      // Fallback: query manuale (compatibilità)
      const { data: logs, error: logsError } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('athlete_id', userId)
        .order('date', { ascending: false })
        .limit(2)

      if (logsError) throw logsError

      const { data: photos, error: photosError } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('athlete_id', userId)
        .order('date', { ascending: false })
        .limit(1)

      if (photosError) throw photosError

      // Type assertions per risultati query
      type ProgressLogRow = {
        weight_kg?: number | null
        chest_cm?: number | null
        waist_cm?: number | null
        hips_cm?: number | null
        biceps_cm?: number | null
        thighs_cm?: number | null
        [key: string]: unknown
      }

      const typedLogs = (logs as ProgressLogRow[]) || []
      const latest = typedLogs[0]
      const previous = typedLogs[1]

      const weights = typedLogs
        .map((log) => log.weight_kg)
        .filter((value): value is number => typeof value === 'number')
      const avgWeight =
        weights.length > 0
          ? weights.reduce((acc, value) => acc + value, 0) / weights.length
          : undefined

      const latestMeasurements = latest
        ? {
            chest_cm: latest.chest_cm ?? null,
            waist_cm: latest.waist_cm ?? null,
            hips_cm: latest.hips_cm ?? null,
            biceps_cm: latest.biceps_cm ?? null,
            thighs_cm: latest.thighs_cm ?? null,
          }
        : undefined

      const weightChange =
        latest && previous ? (latest.weight_kg ?? 0) - (previous.weight_kg ?? 0) : undefined

      const stats: ProgressStats = {
        total_logs: logs?.length ?? 0,
        avg_weight: avgWeight,
        total_photos: photos?.length ?? 0,
        weight_change_30d: weightChange,
        latest_measurements: latestMeasurements,
      }

      // Salva in cache anche il fallback (TTL gestito internamente)
      statsCache.set(cacheKey, stats)

      return stats
    } catch (err) {
      logger.error('Error fetching progress stats', err, { userId })
      return null
    }
  }, [userId, supabase])

  const getLatestProgressLog = useCallback(async (): Promise<ProgressLog | null> => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('athlete_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      return data || null
    } catch (err) {
      logger.error('Error fetching latest progress log', err, { userId })
      return null
    }
  }, [userId, supabase])

  const getPhotosForDate = useCallback(
    (date: string) => {
      return progressPhotos.filter((photo) => photo.date === date)
    },
    [progressPhotos],
  )

  const hasPhotosForDate = useCallback(
    (date: string) => {
      return progressPhotos.some((photo) => photo.date === date)
    },
    [progressPhotos],
  )

  const getWeightChange = useCallback((current: number, previous?: number) => {
    if (!previous) return null
    const change = current - previous
    return {
      value: Math.abs(change),
      isPositive: change < 0, // Perdita di peso è positiva
      percentage: ((change / previous) * 100).toFixed(1),
    }
  }, [])

  const getStrengthChange = useCallback((current: number, previous?: number) => {
    if (!previous) return null
    const change = current - previous
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      percentage: ((change / previous) * 100).toFixed(1),
    }
  }, [])

  return {
    progressLogs,
    progressPhotos,
    loading,
    error,
    fetchProgressLogs,
    fetchProgressPhotos,
    createProgressLog,
    createProgressPhoto,
    getProgressStats,
    getLatestProgressLog,
    getPhotosForDate,
    hasPhotosForDate,
    getWeightChange,
    getStrengthChange,
  }
}
