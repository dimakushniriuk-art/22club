'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchNutrizionistaCheckinDetail } from '@/lib/dashboard/fetch-nutrizionista-checkin-detail'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export function useNutrizionistaCheckinDetail(
  checkinId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      checkinId
        ? queryKeys.nutrition.checkinDetail(checkinId)
        : (['nutrition', 'checkin-detail', '__disabled__'] as const),
    [checkinId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!checkinId) return null
      return fetchNutrizionistaCheckinDetail(supabase, checkinId)
    },
    enabled: enabled && Boolean(checkinId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!checkinId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.checkinDetail(checkinId),
    })
  }, [queryClient, checkinId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore caricamento'
      : null

  return {
    data: query.data,
    loading: Boolean(checkinId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
