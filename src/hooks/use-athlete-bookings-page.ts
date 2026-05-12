'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { fetchAthleteBookingsPageData } from '@/lib/prenotazioni/fetch-athlete-bookings-page'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export function useAthleteBookingsPage(athleteId: string | null | undefined) {
  const supabase = useSupabaseClient()

  const queryKey = useMemo(
    () =>
      athleteId
        ? queryKeys.prenotazioni.athletePage(athleteId)
        : (['prenotazioni', 'athlete-page', '__disabled__'] as const),
    [athleteId],
  )

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAthleteBookingsPageData(supabase, athleteId!),
    enabled: Boolean(athleteId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    profile: query.data?.profile ?? null,
    appointments: query.data?.appointments ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: query.refetch,
  }
}
