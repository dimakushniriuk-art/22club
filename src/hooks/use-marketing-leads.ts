'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MarketingLeadRow } from '@/app/api/marketing/leads/route'
import { fetchMarketingJson, MarketingApiError } from '@/lib/marketing/api-fetch'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export function useMarketingLeads(enabled: boolean) {
  const router = useRouter()
  const query = useQuery({
    queryKey: queryKeys.marketing.leads,
    queryFn: async () => {
      const json = await fetchMarketingJson<{ data: MarketingLeadRow[] }>('/api/marketing/leads')
      return json.data ?? []
    },
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  useEffect(() => {
    if (!(query.error instanceof MarketingApiError)) return
    if (query.error.status === 401) router.replace('/login')
    if (query.error.status === 403) router.replace('/dashboard')
  }, [query.error, router])

  const queryError =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore nel caricamento'
      : null

  return {
    data: query.data ?? [],
    loading: enabled && query.isPending,
    error: queryError,
    reload: () => query.refetch(),
  }
}

export function useMarketingLeadStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const json = await fetchMarketingJson<{ data: MarketingLeadRow }>(
        `/api/marketing/leads/${leadId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      )
      return json.data
    },
    onSuccess: (updated) => {
      if (!updated?.id) return
      queryClient.setQueryData<MarketingLeadRow[]>(queryKeys.marketing.leads, (prev) =>
        (prev ?? []).map((row) => (row.id === updated.id ? { ...row, ...updated } : row)),
      )
    },
  })
}
