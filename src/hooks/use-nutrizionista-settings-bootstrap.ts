'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNutrizionistaSettingsBootstrap,
  type NutrizionistaSettingsAssignedAthlete,
  type NutrizionistaSettingsPlan,
} from '@/lib/dashboard/fetch-nutrizionista-settings-bootstrap'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000
const EMPTY_ATHLETES: NutrizionistaSettingsAssignedAthlete[] = []
const EMPTY_PLANS: NutrizionistaSettingsPlan[] = []

export function useNutrizionistaSettingsBootstrap(
  staffProfileId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.nutrition.settingsBootstrap(staffProfileId)
        : (['nutrition', 'settings-bootstrap', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { assignedAthletes: EMPTY_ATHLETES, plans: EMPTY_PLANS }
      }
      return fetchNutrizionistaSettingsBootstrap(supabase, staffProfileId)
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.settingsBootstrap(staffProfileId),
    })
  }, [queryClient, staffProfileId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore caricamento'
      : null

  return {
    assignedAthletes: query.data?.assignedAthletes ?? EMPTY_ATHLETES,
    plans: query.data?.plans ?? EMPTY_PLANS,
    loading: Boolean(staffProfileId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
