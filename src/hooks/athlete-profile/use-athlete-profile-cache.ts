/**
 * Hook per cache profilo atleta
 * Gestisce cache intelligente per dati profilo atleta con invalidazione automatica
 */

import { useCallback } from 'react'
import { athleteProfileCache } from '@/lib/cache/cache-strategies'
import { useQueryClient } from '@tanstack/react-query'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:athlete-profile:use-athlete-profile-cache')

export type AthleteProfileSection =
  | 'anagrafica'
  | 'medical'
  | 'fitness'
  | 'nutrition'
  | 'motivational'
  | 'administrative'
  | 'massage'
  | 'smart-tracking'
  | 'ai-data'
  | 'full'

export function useAthleteProfileCache(athleteId: string) {
  const queryClient = useQueryClient()

  /**
   * Ottiene dati profilo dalla cache
   */
  const getCached = useCallback(
    <T>(section?: AthleteProfileSection): T | null => {
      return athleteProfileCache.get<T>(athleteId, section)
    },
    [athleteId],
  )

  /**
   * Salva dati profilo nella cache
   */
  const setCached = useCallback(
    <T>(data: T, section?: AthleteProfileSection): void => {
      athleteProfileCache.set(athleteId, data, section)
    },
    [athleteId],
  )

  /**
   * Invalida cache per una sezione specifica
   */
  const invalidate = useCallback(
    (section?: AthleteProfileSection): void => {
      athleteProfileCache.invalidate(athleteId, section)

      // Invalida anche React Query cache
      if (section) {
        queryClient.invalidateQueries({
          queryKey: ['athlete-profile', athleteId, section],
        })
      } else {
        queryClient.invalidateQueries({
          queryKey: ['athlete-profile', athleteId],
        })
      }
    },
    [athleteId, queryClient],
  )

  /**
   * Invalida tutta la cache del profilo atleta
   */
  const invalidateAll = useCallback((): void => {
    athleteProfileCache.invalidateAll(athleteId)

    // Invalida anche React Query cache
    queryClient.invalidateQueries({
      queryKey: ['athlete-profile', athleteId],
    })
  }, [athleteId, queryClient])

  /**
   * Prefetch dati profilo (per performance)
   */
  const prefetch = useCallback(
    async <T>(queryFn: () => Promise<T>, section?: AthleteProfileSection): Promise<T | null> => {
      // Controlla cache prima
      const cached = getCached<T>(section)
      if (cached) {
        return cached
      }

      // Fetch e cache
      try {
        const data = await queryFn()
        setCached(data, section)
        return data
      } catch (error) {
        logger.error('Prefetch failed', error, { section, athleteId })
        return null
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCached, setCached],
  )

  return {
    getCached,
    setCached,
    invalidate,
    invalidateAll,
    prefetch,
  }
}
