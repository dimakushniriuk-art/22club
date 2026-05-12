'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaPlansList,
  type NutrizionistaPlanVersionRow,
  type NutrizionistaPlansAssignedAthlete,
} from '@/lib/dashboard/fetch-nutrizionista-plans-list'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000
const EMPTY_ROWS: NutrizionistaPlanVersionRow[] = []
const EMPTY_ATHLETES: NutrizionistaPlansAssignedAthlete[] = []

export function useNutrizionistaPlansList(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.nutrition.plansList(staffProfileId)
        : (['nutrition', 'plans-list', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { rows: EMPTY_ROWS, assignedAthletes: EMPTY_ATHLETES }
      }
      return fetchNutrizionistaPlansList(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.plansList(staffProfileId),
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
