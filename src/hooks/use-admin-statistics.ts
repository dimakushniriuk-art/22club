'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAdminStatistics } from '@/lib/admin/fetch-admin-statistics'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export function useAdminStatistics(enabled = true) {
  const query = useQuery({
    queryKey: queryKeys.admin.statistics,
    queryFn: fetchAdminStatistics,
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
