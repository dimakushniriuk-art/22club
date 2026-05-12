'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchMassaggiatoreClientiList,
  type MassaggiatoreClienteProfileRow,
  type MassaggiatoreUnifiedClienteRow,
} from '@/lib/dashboard/fetch-massaggiatore-clienti-list'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

const EMPTY_LIST: MassaggiatoreUnifiedClienteRow[] = []
const EMPTY_PROFILES: Record<string, MassaggiatoreClienteProfileRow> = {}

export function useMassaggiatoreClientiList(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])

  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.clienti.massaggiatoreStaffList(staffProfileId)
        : (['clienti', 'massaggiatore-list', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { unified: EMPTY_LIST, profiles: EMPTY_PROFILES }
      }
      return fetchMassaggiatoreClientiList(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.clienti.massaggiatoreStaffList(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const profileById = useMemo(() => {
    const map = new Map<string, MassaggiatoreClienteProfileRow>()
    const profiles = query.data?.profiles ?? EMPTY_PROFILES
    for (const [id, row] of Object.entries(profiles)) {
      map.set(id, row)
    }
    return map
  }, [query.data?.profiles])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore nel caricamento'
      : null

  return {
    unified: query.data?.unified ?? EMPTY_LIST,
    profileById,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
