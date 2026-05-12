'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchMassaggiatoreDashboardStats,
  type MassaggiatoreDashboardStats,
} from '@/lib/dashboard/fetch-massaggiatore-dashboard-stats'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

const EMPTY_STATS: MassaggiatoreDashboardStats = {
  clientiSeguiti: 0,
  massaggiEseguiti: 0,
  massaggiTotali: 0,
  fattureEmesse: 0,
  appuntamentiOggi: 0,
  appuntamentiSettimana: 0,
  prossimiAppuntamenti: [],
}

export function useMassaggiatoreDashboardStats(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])

  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.dashboard.massaggiatoreStats(staffProfileId)
        : (['dashboard', 'massaggiatore-stats', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) return EMPTY_STATS
      return fetchMassaggiatoreDashboardStats(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.massaggiatoreStats(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore nel caricamento'
      : null

  return {
    stats: query.data ?? EMPTY_STATS,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
