'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaCheckinList,
  mapNutrizionistaCheckinListError,
  type NutrizionistaCheckinAthleteOption,
  type NutrizionistaCheckinRow,
} from '@/lib/dashboard/fetch-nutrizionista-checkin-list'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000
const EMPTY_ROWS: NutrizionistaCheckinRow[] = []
const EMPTY_ATHLETES: NutrizionistaCheckinAthleteOption[] = []

export function useNutrizionistaCheckinList(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.nutrition.checkinsList(staffProfileId)
        : (['nutrition', 'checkins-list', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { rows: EMPTY_ROWS, athletes: EMPTY_ATHLETES }
      }
      return fetchNutrizionistaCheckinList(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.checkinsList(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const errorMessage =
    query.error != null ? mapNutrizionistaCheckinListError(query.error) : null

  return {
    rows: query.data?.rows ?? EMPTY_ROWS,
    athletes: query.data?.athletes ?? EMPTY_ATHLETES,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
