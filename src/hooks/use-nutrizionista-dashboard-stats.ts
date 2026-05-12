'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaDashboardStats,
  type NutrizionistaDashboardStats,
} from '@/lib/dashboard/fetch-nutrizionista-dashboard-stats'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

const EMPTY_STATS: NutrizionistaDashboardStats = {
  atletiSeguiti: 0,
  visiteCompletate: 0,
  visiteTotali: 0,
  fattureEmesse: 0,
  appuntamentiSettimana: 0,
  prossimiAppuntamenti: [],
}

export function useNutrizionistaDashboardStats(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])

  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.dashboard.nutrizionistaStats(staffProfileId)
        : (['dashboard', 'nutrizionista-stats', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { stats: EMPTY_STATS, error: null }
      }
      return fetchNutrizionistaDashboardStats(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.nutrizionistaStats(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const queryError =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore nel caricamento'
      : null

  return {
    stats: query.data?.stats ?? EMPTY_STATS,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: query.data?.error ?? queryError,
    reload,
  }
}
