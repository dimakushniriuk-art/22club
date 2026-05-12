'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { Database } from '@/lib/supabase/types'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export type MarketingAutomationRow = Database['public']['Tables']['marketing_automations']['Row']
type MarketingAutomationInsert = Database['public']['Tables']['marketing_automations']['Insert']

export type MarketingAutomationSegmentName = Pick<
  Database['public']['Tables']['marketing_segments']['Row'],
  'id' | 'name'
>

function automationsErrorMessage(error: unknown): string | null {
  if (error == null) return null
  return error instanceof Error ? error.message : 'Errore nel caricamento'
}

export function useMarketingAutomations(enabled: boolean) {
  const supabase = useSupabaseClient()
  const query = useQuery({
    queryKey: queryKeys.marketing.automations,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_automations')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as MarketingAutomationRow[]
    },
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    data: query.data ?? [],
    loading: enabled && query.isPending,
    error: automationsErrorMessage(query.error),
    reload: () => query.refetch(),
  }
}

export function useMarketingAutomationSegmentNames(enabled: boolean) {
  const supabase = useSupabaseClient()
  const query = useQuery({
    queryKey: queryKeys.marketing.automationSegments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_segments')
        .select('id, name')
        .order('name')
      if (error) throw error
      return (data ?? []) as MarketingAutomationSegmentName[]
    },
    enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    data: query.data ?? [],
    loading: enabled && query.isPending,
    error: automationsErrorMessage(query.error),
    reload: () => query.refetch(),
  }
}

export function useMarketingAutomation(automationId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: automationId
      ? queryKeys.marketing.automation(automationId)
      : (['marketing', 'automation', '__disabled__'] as const),
    queryFn: async () => {
      if (!automationId) return null
      const res = await fetch(`/api/marketing/automations/${automationId}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json.error as string) ?? 'Non trovato')
      }
      const json = await res.json()
      const automation = (json.data?.automation ?? null) as MarketingAutomationRow | null
      if (!automation) {
        throw new Error('Non trovato')
      }
      return {
        automation,
        segment: (json.data?.segment ?? null) as MarketingAutomationSegmentName | null,
      }
    },
    enabled: enabled && Boolean(automationId),
    staleTime: STALE_MS,
  })

  return {
    automation: query.data?.automation ?? null,
    segment: query.data?.segment ?? null,
    loading: enabled && Boolean(automationId) && query.isPending,
    error: automationsErrorMessage(query.error),
    reload: () => query.refetch(),
  }
}

export function useMarketingAutomationMutations() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const invalidateAutomationQueries = async (automationId?: string) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.marketing.automations })
    if (automationId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.marketing.automation(automationId) })
    }
  }

  const createAutomation = useMutation({
    mutationFn: async (payload: MarketingAutomationInsert) => {
      const { error } = await supabase.from('marketing_automations').insert(payload)
      if (error) throw error
    },
    onSuccess: async () => {
      await invalidateAutomationQueries()
    },
  })

  const setAutomationActive = useMutation({
    mutationFn: async ({ automationId, isActive }: { automationId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('marketing_automations')
        .update({ is_active: isActive })
        .eq('id', automationId)
      if (error) throw error
      return isActive
    },
    onSuccess: async (isActive, variables) => {
      queryClient.setQueryData<MarketingAutomationRow[]>(queryKeys.marketing.automations, (prev) =>
        (prev ?? []).map((row) =>
          row.id === variables.automationId ? { ...row, is_active: isActive } : row,
        ),
      )
    },
  })

  const runAutomation = useMutation({
    mutationFn: async (automationId: string) => {
      const res = await fetch(`/api/marketing/automations/${automationId}/run`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((json.error as string) ?? 'Esecuzione non riuscita')
      }
      return json.data as { athletes_count: number; last_run_at?: string }
    },
    onSuccess: async (data, automationId) => {
      queryClient.setQueryData<MarketingAutomationRow[]>(queryKeys.marketing.automations, (prev) =>
        (prev ?? []).map((row) =>
          row.id === automationId
            ? { ...row, last_run_at: data.last_run_at ?? row.last_run_at }
            : row,
        ),
      )
      queryClient.setQueryData<{ automation: MarketingAutomationRow; segment: MarketingAutomationSegmentName | null }>(
        queryKeys.marketing.automation(automationId),
        (prev) =>
          prev?.automation
            ? {
                ...prev,
                automation: {
                  ...prev.automation,
                  last_run_at: data.last_run_at ?? prev.automation.last_run_at,
                },
              }
            : prev,
      )
    },
  })

  return {
    createAutomation,
    setAutomationActive,
    runAutomation,
  }
}
