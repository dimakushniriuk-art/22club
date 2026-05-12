'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchOrgTrainerOptions } from '@/lib/trainer-analytics'
import { queryKeys } from '@/lib/query-keys'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

const STALE_MS = 5 * 60 * 1000

export function useStaffOrgTrainerOptions(orgId: string | null, enabled: boolean) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: queryKeys.statistics.trainerOptions(orgId ?? ''),
    queryFn: () => fetchOrgTrainerOptions(supabase, orgId!),
    enabled: enabled && !!orgId,
    staleTime: STALE_MS,
  })
}
