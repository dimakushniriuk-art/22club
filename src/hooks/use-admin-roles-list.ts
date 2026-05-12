'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAdminRoles } from '@/lib/admin/fetch-admin-roles'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 60 * 1000

export function useAdminRolesList(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.admin.rolesList,
    queryFn: fetchAdminRoles,
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.rolesList })
  }, [queryClient])

  return {
    roles: query.data ?? [],
    loading: enabled && query.isPending,
    error: query.error,
    reload,
  }
}
