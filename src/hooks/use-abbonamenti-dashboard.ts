'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import {
  ABBONAMENTI_PER_PAGE,
  fetchAbbonamentiDashboard,
  type AbbonamentoAthleteRow,
  type KpiPaymentRow,
} from '@/lib/abbonamenti/fetch-abbonamenti-dashboard'
import type { ServiceType } from '@/lib/abbonamenti-service-type'
import { queryKeys } from '@/lib/query-keys'
import { invalidateAbbonamentiStaffListQueries } from '@/lib/react-query/post-mutation-cache'

const STALE_MS = 2 * 60 * 1000

export type UseAbbonamentiDashboardArgs = {
  serviceType: ServiceType
  page: number
  enablePagination: boolean
  role: string | null
  profileId: string | null
}

export function useAbbonamentiDashboard({
  serviceType,
  page,
  enablePagination,
  role,
  profileId,
}: UseAbbonamentiDashboardArgs) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const queryKey = useMemo(
    () =>
      queryKeys.payments.abbonamentiStaffList(
        serviceType,
        page,
        enablePagination,
        role,
        profileId,
      ),
    [serviceType, page, enablePagination, role, profileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetchAbbonamentiDashboard({
        supabase,
        serviceType,
        page,
        enablePagination,
        role,
        profileId,
      }),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const refetchRef = useRef(query.refetch)
  refetchRef.current = query.refetch

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void refetchRef.current()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const invalidateList = () => invalidateAbbonamentiStaffListQueries(queryClient)

  return {
    abbonamenti: (query.data?.abbonamenti ?? []) as AbbonamentoAthleteRow[],
    kpiPayments: (query.data?.kpiPayments ?? []) as KpiPaymentRow[],
    totalCount: query.data?.totalCount ?? 0,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: query.refetch,
    invalidateList,
    perPage: ABBONAMENTI_PER_PAGE,
  }
}
