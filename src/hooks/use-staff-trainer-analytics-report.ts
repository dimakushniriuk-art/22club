'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTrainerAnalyticsReport } from '@/lib/trainer-analytics'
import { queryKeys } from '@/lib/query-keys'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

const STALE_MS = 60 * 1000

export function useStaffTrainerAnalyticsReport(
  orgId: string | null,
  trainerIds: string[],
  startBoundary: Date,
  endBoundary: Date,
  enabled: boolean,
) {
  const supabase = useSupabaseClient()
  const trainerIdsKey = useMemo(
    () => [...trainerIds].sort((a, b) => a.localeCompare(b)).join(','),
    [trainerIds],
  )

  return useQuery({
    queryKey: queryKeys.statistics.trainerReport(
      orgId ?? '',
      trainerIdsKey,
      startBoundary.toISOString(),
      endBoundary.toISOString(),
    ),
    queryFn: () =>
      fetchTrainerAnalyticsReport(supabase, {
        orgId: orgId!,
        trainerIds,
        startBoundary,
        endBoundary,
      }),
    enabled: enabled && !!orgId && trainerIds.length > 0,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })
}
