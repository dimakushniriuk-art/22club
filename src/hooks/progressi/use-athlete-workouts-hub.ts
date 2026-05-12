'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchAthleteWorkoutsHubData } from '@/hooks/progressi/fetch-athlete-workouts-hub-data'

export type AthleteWorkoutsHubSection =
  | 'overview'
  | 'schede'
  | 'sessioni-aperte'
  | 'appuntamenti'
  | 'completati'

export function athleteWorkoutsHubQueryEnabled(
  athleteId: string,
  hubSection: AthleteWorkoutsHubSection | undefined,
  embedded: boolean,
): boolean {
  if (!athleteId) return false
  if (embedded || !hubSection) return true
  return hubSection !== 'completati'
}

export function useAthleteWorkoutsHub(
  athleteId: string,
  options?: {
    hubSection?: AthleteWorkoutsHubSection
    embedded?: boolean
  },
) {
  const embedded = options?.embedded ?? false
  const hubSection = options?.hubSection

  return useQuery({
    queryKey: queryKeys.progressi.workoutsHub(athleteId),
    queryFn: () => fetchAthleteWorkoutsHubData(athleteId),
    enabled: athleteWorkoutsHubQueryEnabled(athleteId, hubSection, embedded),
    staleTime: 3 * 60 * 1000,
  })
}
