// ============================================================
// Hook per gestione dati profilo atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import {
  EMPTY_ATHLETE_PROFILE_STATS,
  fetchAthleteProfileData,
  fetchAthleteProfileStats,
  type AthleteProfileStats,
} from '@/hooks/athlete-profile/fetch-athlete-profile-data'

const logger = createLogger('hooks:athlete-profile:use-athlete-profile-data')

export type { AthleteProfileStats }

export function useAthleteProfileData(athleteId: string) {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: queryKeys.athleteProfile.byId(athleteId),
    queryFn: async () => {
      try {
        return await fetchAthleteProfileData(athleteId)
      } catch (err) {
        logger.error('Errore caricamento atleta', err, { athleteId })
        throw err
      }
    },
    enabled: Boolean(athleteId),
    staleTime: 3 * 60 * 1000,
  })

  const athlete = profileQuery.data?.athlete ?? null
  const athleteUserId = profileQuery.data?.athleteUserId ?? null

  const statsQuery = useQuery({
    queryKey: queryKeys.athleteProfile.stats(athleteId, athleteUserId ?? ''),
    queryFn: () =>
      fetchAthleteProfileStats(athleteId, athleteUserId!, athlete?.ultimo_accesso ?? null),
    enabled: Boolean(athleteId && athleteUserId),
    staleTime: 3 * 60 * 1000,
  })

  const loadAthleteData = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.athleteProfile.byId(athleteId),
    })
  }, [queryClient, athleteId])

  const loadAthleteStats = useCallback(() => {
    if (!athleteUserId) return
    void queryClient.invalidateQueries({
      queryKey: queryKeys.athleteProfile.stats(athleteId, athleteUserId),
    })
  }, [queryClient, athleteId, athleteUserId])

  const error =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : profileQuery.error
        ? String(profileQuery.error)
        : null

  return {
    athlete,
    stats: statsQuery.data?.stats ?? EMPTY_ATHLETE_PROFILE_STATS,
    statsError: statsQuery.data?.statsError ?? null,
    loading: profileQuery.isLoading,
    error,
    athleteUserId,
    loadAthleteData,
    loadAthleteStats,
  }
}
