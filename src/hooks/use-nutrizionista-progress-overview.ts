'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaProgressOverview,
  type NutrizionistaProgressAssignedAthlete,
  type NutrizionistaProgressAthleteOverviewRow,
  type NutrizionistaProgressTimelineRow,
} from '@/lib/dashboard/fetch-nutrizionista-progress-overview'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000
const EMPTY_TIMELINE: NutrizionistaProgressTimelineRow[] = []
const EMPTY_OVERVIEW: NutrizionistaProgressAthleteOverviewRow[] = []
const EMPTY_ATHLETES: NutrizionistaProgressAssignedAthlete[] = []

export function useNutrizionistaProgressOverview(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.nutrition.progressOverview(staffProfileId)
        : (['nutrition', 'progress-overview', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return {
          timelineRows: EMPTY_TIMELINE,
          athleteOverviewRows: EMPTY_OVERVIEW,
          assignedAthletes: EMPTY_ATHLETES,
        }
      }
      return fetchNutrizionistaProgressOverview(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.progressOverview(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore caricamento'
      : null

  return {
    timelineRows: query.data?.timelineRows ?? EMPTY_TIMELINE,
    athleteOverviewRows: query.data?.athleteOverviewRows ?? EMPTY_OVERVIEW,
    assignedAthletes: query.data?.assignedAthletes ?? EMPTY_ATHLETES,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
