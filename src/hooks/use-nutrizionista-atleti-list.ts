'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaAtletiList,
  type NutrizionistaAthleteListRow,
  type NutrizionistaPendingInviteRow,
} from '@/lib/dashboard/fetch-nutrizionista-atleti-list'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

const EMPTY_ROWS: NutrizionistaAthleteListRow[] = []
const EMPTY_INVITES: NutrizionistaPendingInviteRow[] = []

export function useNutrizionistaAtletiList(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])

  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.clienti.nutrizionistaStaffList(staffProfileId)
        : (['clienti', 'nutrizionista-list', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { rows: EMPTY_ROWS, pendingInvites: EMPTY_INVITES, invitesWarning: null }
      }
      return fetchNutrizionistaAtletiList(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.clienti.nutrizionistaStaffList(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore caricamento clienti'
      : null

  return {
    rows: query.data?.rows ?? EMPTY_ROWS,
    pendingInvites: query.data?.pendingInvites ?? EMPTY_INVITES,
    invitesWarning: query.data?.invitesWarning ?? null,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
