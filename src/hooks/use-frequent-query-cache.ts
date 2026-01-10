/**
 * Hook per cache query frequenti
 * Gestisce cache per query che vengono eseguite frequentemente
 * (clienti, appuntamenti, workout, etc.)
 */

import { useCallback } from 'react'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import { useQueryClient } from '@tanstack/react-query'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:use-frequent-query-cache')

export type FrequentQueryType =
  | 'clienti'
  | 'clienti-stats'
  | 'appointments'
  | 'workouts'
  | 'workout-plans'
  | 'documents'
  | 'payments'
  | 'notifications'

export function useFrequentQueryCache() {
  const queryClient = useQueryClient()

  /**
   * Ottiene dati dalla cache
   */
  const getCached = useCallback(<T>(queryType: FrequentQueryType, key?: string): T | null => {
    const cacheKey = key ? `${queryType}:${key}` : queryType
    return frequentQueryCache.get<T>(cacheKey)
  }, [])

  /**
   * Salva dati nella cache
   */
  const setCached = useCallback(<T>(queryType: FrequentQueryType, data: T, key?: string): void => {
    const cacheKey = key ? `${queryType}:${key}` : queryType
    frequentQueryCache.set(cacheKey, data)
  }, [])

  /**
   * Invalida cache per query type
   */
  const invalidate = useCallback(
    (queryType: FrequentQueryType, key?: string): void => {
      const cacheKey = key ? `${queryType}:${key}` : queryType
      frequentQueryCache.invalidate(cacheKey)

      // Invalida anche React Query cache
      queryClient.invalidateQueries({
        queryKey: [queryType, key].filter(Boolean),
      })
    },
    [queryClient],
  )

  /**
   * Prefetch query (per performance)
   */
  const prefetch = useCallback(
    async <T>(
      queryType: FrequentQueryType,
      queryFn: () => Promise<T>,
      key?: string,
    ): Promise<T | null> => {
      // Controlla cache prima
      const cached = getCached<T>(queryType, key)
      if (cached) {
        return cached
      }

      // Fetch e cache
      try {
        const data = await queryFn()
        setCached(queryType, data, key)
        return data
      } catch (error) {
        logger.error('Prefetch failed', error, { queryType, key })
        return null
      }
    },
    [getCached, setCached],
  )

  return {
    getCached,
    setCached,
    invalidate,
    prefetch,
  }
}
