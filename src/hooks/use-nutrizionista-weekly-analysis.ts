'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaWeeklyAnalysis,
  type NutrizionistaWeeklyAnalysisAssignedAthlete,
  type NutrizionistaWeeklyAnalysisRow,
} from '@/lib/dashboard/fetch-nutrizionista-weekly-analysis'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000
const EMPTY_ROWS: NutrizionistaWeeklyAnalysisRow[] = []
const EMPTY_ATHLETES: NutrizionistaWeeklyAnalysisAssignedAthlete[] = []

export function useNutrizionistaWeeklyAnalysis(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.nutrition.weeklyAnalysis(staffProfileId)
        : (['nutrition', 'weekly-analysis', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { rows: EMPTY_ROWS, assignedAthletes: EMPTY_ATHLETES }
      }
      return fetchNutrizionistaWeeklyAnalysis(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.weeklyAnalysis(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore caricamento'
      : null

  return {
    rows: query.data?.rows ?? EMPTY_ROWS,
    assignedAthletes: query.data?.assignedAthletes ?? EMPTY_ATHLETES,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
