/**
 * Hook ottimizzato per progressi
 * Usa RPC function invece di query manuale per migliori performance
 */

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProgressStats } from '@/types/progress'
import type { Tables } from '@/types/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('useProgressOptimized')

export function useProgressOptimized(userId: string | null) {
  const supabase = createClient()

  const getProgressStats = useCallback(async (): Promise<ProgressStats | null> => {
    if (!userId) return null

    try {
      // Usa RPC function invece di query manuale
      const { data, error } = await supabase.rpc('get_progress_stats', {
        athlete_uuid: userId,
      } as never)

      if (error) {
        // Fallback a query manuale se RPC non disponibile
        logger.warn('RPC fallback, using manual query', { error })
        return getProgressStatsFallback(userId)
      }

      if (!data || typeof data !== 'object') {
        return null
      }

      // Parse JSON result
      const stats = data as {
        total_logs?: number
        total_photos?: number
        avg_weight?: number
        weight_change_30d?: number
        latest_measurements?: {
          chest_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          biceps_cm?: number | null
          thighs_cm?: number | null
        }
      }

      return {
        total_logs: stats.total_logs,
        avg_weight: stats.avg_weight,
        total_photos: stats.total_photos,
        weight_change_30d: stats.weight_change_30d,
        latest_measurements: stats.latest_measurements,
      }
    } catch (err) {
      logger.error('Error fetching progress stats', err, { userId })
      return null
    }
  }, [userId, supabase])

  return {
    getProgressStats,
  }
}

/**
 * Fallback a query manuale se RPC non disponibile
 */
async function getProgressStatsFallback(userId: string): Promise<ProgressStats | null> {
  const supabase = createClient()

  try {
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

    type ProgressLogRow = Pick<
      Tables<'progress_logs'>,
      'weight_kg' | 'chest_cm' | 'waist_cm' | 'hips_cm' | 'biceps_cm' | 'thighs_cm'
    >
    const typedLogs = (logs ?? []) as ProgressLogRow[]
    const latest = typedLogs?.[0]
    const previous = typedLogs?.[1]

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

    return {
      total_logs: typedLogs?.length ?? 0,
      avg_weight: avgWeight,
      total_photos: photos?.length ?? 0,
      weight_change_30d: weightChange,
      latest_measurements: latestMeasurements,
    }
  } catch (err) {
    logger.error('Error fetching progress stats (fallback)', err, { userId })
    return null
  }
}
