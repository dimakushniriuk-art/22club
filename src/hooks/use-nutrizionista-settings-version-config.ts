'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS,
  DEFAULT_NUTRIZIONISTA_AUTO_CONFIG,
  fetchNutrizionistaSettingsVersionConfig,
} from '@/lib/dashboard/fetch-nutrizionista-settings-version-config'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export function useNutrizionistaSettingsVersionConfig(
  versionId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const queryKey = useMemo(
    () =>
      versionId
        ? queryKeys.nutrition.settingsVersionConfig(versionId)
        : (['nutrition', 'settings-version-config', '__disabled__'] as const),
    [versionId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!versionId) {
        return {
          autoConfig: DEFAULT_NUTRIZIONISTA_AUTO_CONFIG,
          adaptiveSettings: DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS,
          autoConfigLoaded: false,
          adaptiveLoaded: false,
        }
      }
      return fetchNutrizionistaSettingsVersionConfig(supabase, versionId)
    },
    enabled: enabled && Boolean(versionId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!versionId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.nutrition.settingsVersionConfig(versionId),
    })
  }, [queryClient, versionId])

  const errorMessage =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore caricamento configurazione'
      : null

  return {
    data: query.data,
    loading: Boolean(versionId && enabled && query.isPending),
    error: errorMessage,
    reload,
  }
}
