'use client'

import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { ServiceType } from '@/lib/abbonamenti-service-type'
import { queryKeys } from '@/lib/query-keys'
import { invalidateStaffAthletePaymentsPageQueries } from '@/lib/react-query/post-mutation-cache'
import { fetchStaffAthletePaymentsPageDataSafe } from '@/features/staff-athlete-payments/fetch-staff-athlete-payments-page-data'

const STALE_MS = 2 * 60 * 1000

export function useStaffAthletePaymentsPageData(
  athleteId: string | null | undefined,
  serviceType: ServiceType,
) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const queryKey = useMemo(
    () =>
      athleteId
        ? queryKeys.payments.staffAthletePage(athleteId, serviceType)
        : (['payments', 'staff-athlete-page', '__disabled__'] as const),
    [athleteId, serviceType],
  )

  const query = useQuery({
    queryKey,
    queryFn: () => fetchStaffAthletePaymentsPageDataSafe(supabase, athleteId!, serviceType),
    enabled: Boolean(athleteId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = async () => {
    if (!athleteId) return
    await invalidateStaffAthletePaymentsPageQueries(queryClient, athleteId, serviceType)
    await query.refetch()
  }

  return {
    athlete: query.data?.athlete ?? null,
    payments: query.data?.payments ?? [],
    counter: query.data?.counter ?? null,
    debits: query.data?.debits ?? [],
    movements: query.data?.movements ?? [],
    loading: query.isLoading,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    reload,
    refetch: query.refetch,
  }
}
