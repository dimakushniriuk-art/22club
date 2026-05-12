'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAdminDashboardStats } from '@/lib/admin/fetch-admin-dashboard-stats'
import { queryKeys } from '@/lib/query-keys'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

const STALE_MS = 2 * 60 * 1000

export function useAdminDashboardStats(enabled = true) {
  const supabase = useSupabaseClient()

  const query = useQuery({
    queryKey: queryKeys.admin.dashboardStats,
    queryFn: () => fetchAdminDashboardStats(supabase),
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    stats: query.data ?? null,
    loading: enabled && query.isPending,
    error: query.error,
    reload: query.refetch,
  }
}
