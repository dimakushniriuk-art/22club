'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchMassaggiatoreClienteDetail,
  MassaggiatoreClienteDetailForbiddenError,
} from '@/lib/dashboard/fetch-massaggiatore-cliente-detail'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export function useMassaggiatoreClienteDetail(
  staffProfileId: string | null | undefined,
  athleteProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])

  const queryKey = useMemo(
    () =>
      staffProfileId && athleteProfileId
        ? queryKeys.clienti.massaggiatoreStaffDetail(staffProfileId, athleteProfileId)
        : (['clienti', 'massaggiatore-detail', '__disabled__'] as const),
    [staffProfileId, athleteProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId || !athleteProfileId) {
        return null
      }
      return fetchMassaggiatoreClienteDetail(supabase, staffProfileId, athleteProfileId)
    },
    enabled: enabled && Boolean(staffProfileId && athleteProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId || !athleteProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.clienti.massaggiatoreStaffDetail(staffProfileId, athleteProfileId),
    })
  }, [queryClient, staffProfileId, athleteProfileId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore nel caricamento'
      : null

  const forbidden = query.error instanceof MassaggiatoreClienteDetailForbiddenError

  return {
    profile: query.data?.profile ?? null,
    accessMode: query.data?.accessMode ?? null,
    loading: Boolean(staffProfileId && athleteProfileId && enabled && query.isPending),
    error: errorMessage,
    forbidden,
    reload,
  }
}
