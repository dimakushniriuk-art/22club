'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMarketingJson } from '@/lib/marketing/api-fetch'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export type MarketingLeadDetailRow = {
  id: string
  org_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  source: string | null
  status: string
  converted_athlete_profile_id: string | null
  converted_at: string | null
  converted_by_profile_id: string | null
  created_at: string
  updated_at: string
}

export type MarketingLeadDetailNote = {
  id: string
  note: string
  author_id: string | null
  created_at: string
}

type MarketingLeadDetailPayload = {
  lead: MarketingLeadDetailRow
  notes: MarketingLeadDetailNote[]
}

export function useMarketingLeadDetail(leadId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.marketing.lead(leadId ?? ''),
    queryFn: async () => {
      const json = await fetchMarketingJson<{ data: MarketingLeadDetailPayload }>(
        `/api/marketing/leads/${leadId}`,
      )
      return json.data ?? { lead: null, notes: [] }
    },
    enabled: enabled && !!leadId,
    staleTime: STALE_MS,
  })

  const queryError =
    query.error != null
      ? query.error instanceof Error
        ? query.error.message
        : 'Errore nel caricamento'
      : null

  return {
    lead: query.data?.lead ?? null,
    notes: query.data?.notes ?? [],
    loading: enabled && !!leadId && query.isPending,
    error: queryError,
    reload: () => query.refetch(),
  }
}
