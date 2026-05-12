'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchStaffLegacyAnalytics } from '@/lib/analytics/fetch-staff-legacy-analytics'
import { EMPTY_STAFF_LEGACY_ANALYTICS } from '@/lib/analytics/staff-statistiche-helpers'
import { queryKeys } from '@/lib/query-keys'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

const STALE_MS = 60 * 1000

export function useStaffStatisticheLegacy(
  orgId: string | null,
  rangeDays: number,
  enabled: boolean,
) {
  const supabase = useSupabaseClient()

  const query = useQuery({
    queryKey: queryKeys.statistics.legacy(orgId, rangeDays),
    queryFn: () => fetchStaffLegacyAnalytics(supabase, orgId, rangeDays),
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    data: query.data ?? EMPTY_STAFF_LEGACY_ANALYTICS,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
