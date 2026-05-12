'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaDocumentsList,
  type NutrizionistaDocumentRow,
  type NutrizionistaDocumentsAssignedAthlete,
} from '@/lib/dashboard/fetch-nutrizionista-documents-list'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000
const EMPTY_ROWS: NutrizionistaDocumentRow[] = []
const EMPTY_ATHLETES: NutrizionistaDocumentsAssignedAthlete[] = []

export function useNutrizionistaDocumentsList(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.nutrition.documentsList(staffProfileId)
        : (['nutrition', 'documents-list', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return {
          rows: EMPTY_ROWS,
          assignedAthletes: EMPTY_ATHLETES,
          myOrgId: null,
          myOrgIdText: null,
        }
      }
      return fetchNutrizionistaDocumentsList(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.documentsList(staffProfileId),
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
    myOrgId: query.data?.myOrgId ?? null,
    myOrgIdText: query.data?.myOrgIdText ?? null,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
