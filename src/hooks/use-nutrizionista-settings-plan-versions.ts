'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaSettingsPlanVersions,
  type NutrizionistaSettingsPlanVersion,
} from '@/lib/dashboard/fetch-nutrizionista-settings-plan-versions'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000
const EMPTY_VERSIONS: NutrizionistaSettingsPlanVersion[] = []

export function useNutrizionistaSettingsPlanVersions(
  planId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      planId
        ? queryKeys.nutrition.settingsPlanVersions(planId)
        : (['nutrition', 'settings-plan-versions', '__disabled__'] as const),
    [planId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!planId) return EMPTY_VERSIONS
      return fetchNutrizionistaSettingsPlanVersions(supabase, planId)
    },
    enabled: enabled && Boolean(planId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!planId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.settingsPlanVersions(planId),
    })
  }, [queryClient, planId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore caricamento versioni'
      : null

  return {
    versions: query.data ?? EMPTY_VERSIONS,
    loading: Boolean(planId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
