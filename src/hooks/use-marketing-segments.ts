'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { Database } from '@/lib/supabase/types'
import { queryKeys } from '@/lib/query-keys'

export { useMarketingAthletes } from '@/hooks/use-marketing-athletes'

const STALE_MS = 2 * 60 * 1000

export type MarketingSegmentRow = Database['public']['Tables']['marketing_segments']['Row']
type MarketingSegmentUpdate = Database['public']['Tables']['marketing_segments']['Update']
type MarketingSegmentInsert = Database['public']['Tables']['marketing_segments']['Insert']

function segmentsErrorMessage(error: unknown): string | null {
  if (error == null) return null
  return error instanceof Error ? error.message : 'Errore nel caricamento'
}

export function useMarketingSegments(enabled: boolean) {
  const supabase = useSupabaseClient()
  const query = useQuery({
    queryKey: queryKeys.marketing.segments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_segments')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as MarketingSegmentRow[]
    },
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    data: query.data ?? [],
    loading: enabled && query.isPending,
    error: segmentsErrorMessage(query.error),
    reload: () => query.refetch(),
  }
}

export function useMarketingSegment(segmentId: string | null, enabled: boolean) {
  const supabase = useSupabaseClient()
  const query = useQuery({
    queryKey: segmentId
      ? queryKeys.marketing.segment(segmentId)
      : (['marketing', 'segment', '__disabled__'] as const),
    queryFn: async () => {
      if (!segmentId) return null
      const { data, error } = await supabase
        .from('marketing_segments')
        .select('*')
        .eq('id', segmentId)
        .single()
      if (error) throw error
      return data as MarketingSegmentRow
    },
    enabled: enabled && Boolean(segmentId),
    staleTime: STALE_MS,
  })

  return {
    data: query.data ?? null,
    loading: enabled && Boolean(segmentId) && query.isPending,
    error: segmentsErrorMessage(query.error),
    reload: () => query.refetch(),
  }
}

export function useMarketingSegmentMutations() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const invalidateSegmentQueries = async (segmentId?: string) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.marketing.segments })
    await queryClient.invalidateQueries({ queryKey: queryKeys.marketing.automationSegments })
    if (segmentId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.marketing.segment(segmentId) })
    }
  }

  const createSegment = useMutation({
    mutationFn: async (payload: MarketingSegmentInsert) => {
      const { error } = await supabase.from('marketing_segments').insert(payload)
      if (error) throw error
    },
    onSuccess: async () => {
      await invalidateSegmentQueries()
    },
  })

  const updateSegment = useMutation({
    mutationFn: async ({
      segmentId,
      payload,
    }: {
      segmentId: string
      payload: MarketingSegmentUpdate
    }) => {
      const { error } = await supabase
        .from('marketing_segments')
        .update(payload)
        .eq('id', segmentId)
      if (error) throw error
    },
    onSuccess: async (_data, variables) => {
      await invalidateSegmentQueries(variables.segmentId)
    },
  })

  const setSegmentActive = useMutation({
    mutationFn: async ({ segmentId, isActive }: { segmentId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('marketing_segments')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', segmentId)
      if (error) throw error
      return isActive
    },
    onSuccess: async (isActive, variables) => {
      queryClient.setQueryData<MarketingSegmentRow>(
        queryKeys.marketing.segment(variables.segmentId),
        (prev) => (prev ? { ...prev, is_active: isActive } : prev),
      )
      queryClient.setQueryData<MarketingSegmentRow[]>(queryKeys.marketing.segments, (prev) =>
        (prev ?? []).map((row) =>
          row.id === variables.segmentId ? { ...row, is_active: isActive } : row,
        ),
      )
    },
  })

  return {
    createSegment,
    updateSegment,
    setSegmentActive,
  }
}
