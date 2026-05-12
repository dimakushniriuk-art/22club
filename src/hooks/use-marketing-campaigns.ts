'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { Database } from '@/lib/supabase/types'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export type MarketingCampaignRow = Database['public']['Tables']['marketing_campaigns']['Row']
type MarketingCampaignUpdate = Database['public']['Tables']['marketing_campaigns']['Update']
type MarketingCampaignInsert = Database['public']['Tables']['marketing_campaigns']['Insert']

function campaignsErrorMessage(error: unknown): string | null {
  if (error == null) return null
  return error instanceof Error ? error.message : 'Errore nel caricamento'
}

export function useMarketingCampaigns(enabled: boolean) {
  const supabase = useSupabaseClient()
  const query = useQuery({
    queryKey: queryKeys.marketing.campaigns,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as MarketingCampaignRow[]
    },
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    data: query.data ?? [],
    loading: enabled && query.isPending,
    error: campaignsErrorMessage(query.error),
    reload: () => query.refetch(),
  }
}

export function useMarketingCampaign(campaignId: string | null, enabled: boolean) {
  const supabase = useSupabaseClient()
  const query = useQuery({
    queryKey: campaignId
      ? queryKeys.marketing.campaign(campaignId)
      : (['marketing', 'campaign', '__disabled__'] as const),
    queryFn: async () => {
      if (!campaignId) return null
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()
      if (error) throw error
      return data as MarketingCampaignRow
    },
    enabled: enabled && Boolean(campaignId),
    staleTime: STALE_MS,
  })

  return {
    data: query.data ?? null,
    loading: enabled && Boolean(campaignId) && query.isPending,
    error: campaignsErrorMessage(query.error),
    reload: () => query.refetch(),
  }
}

export function useMarketingCampaignMutations() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const invalidateCampaignQueries = async (campaignId?: string) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.marketing.campaigns })
    if (campaignId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.marketing.campaign(campaignId) })
    }
  }

  const createCampaign = useMutation({
    mutationFn: async (payload: MarketingCampaignInsert) => {
      const { error } = await supabase.from('marketing_campaigns').insert(payload)
      if (error) throw error
    },
    onSuccess: async () => {
      await invalidateCampaignQueries()
    },
  })

  const updateCampaign = useMutation({
    mutationFn: async ({
      campaignId,
      payload,
    }: {
      campaignId: string
      payload: MarketingCampaignUpdate
    }) => {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update(payload)
        .eq('id', campaignId)
      if (error) throw error
    },
    onSuccess: async (_data, variables) => {
      await invalidateCampaignQueries(variables.campaignId)
    },
  })

  const updateCampaignStatus = useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: {
      campaignId: string
      status: MarketingCampaignRow['status']
    }) => {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status })
        .eq('id', campaignId)
      if (error) throw error
      return status
    },
    onSuccess: async (status, variables) => {
      queryClient.setQueryData<MarketingCampaignRow>(
        queryKeys.marketing.campaign(variables.campaignId),
        (prev) => (prev ? { ...prev, status } : prev),
      )
      queryClient.setQueryData<MarketingCampaignRow[]>(queryKeys.marketing.campaigns, (prev) =>
        (prev ?? []).map((row) =>
          row.id === variables.campaignId ? { ...row, status } : row,
        ),
      )
    },
  })

  return {
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
  }
}
