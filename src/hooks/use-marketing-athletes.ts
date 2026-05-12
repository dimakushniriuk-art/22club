'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import type { MarketingAthleteRow } from '@/app/api/marketing/athletes/route'
import { fetchMarketingJson, MarketingApiError } from '@/lib/marketing/api-fetch'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 3 * 60 * 1000

export function useMarketingAthletes(enabled: boolean) {
  const router = useRouter()
  const query = useQuery({
    queryKey: queryKeys.marketing.athletes,
    queryFn: async () => {
      const json = await fetchMarketingJson<{ data: MarketingAthleteRow[] }>(
        '/api/marketing/athletes',
      )
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
