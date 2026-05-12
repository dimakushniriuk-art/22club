'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAdminUsers } from '@/lib/admin/fetch-admin-users'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 60 * 1000

export function useAdminUsersList(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.admin.usersList,
    queryFn: fetchAdminUsers,
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersList })
  }, [queryClient])

  return {
    users: query.data ?? [],
    loading: enabled && query.isPending,
    error: query.error,
    reload,
  }
}
