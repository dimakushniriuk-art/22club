'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { queryKeys } from '@/lib/query-keys'
import { fetchAthleteWorkoutSummary } from '@/features/athlete-allenamenti/fetch-athlete-workout-summary'

export function useAthleteWorkoutSummary(
  athleteProfileId: string | null,
  workoutLogId: string | null | undefined,
  options?: {
    enabled?: boolean
    requestCoachedDebit?: boolean
    onCoachedDebitWarning?: () => void
  },
) {
  const supabase = useSupabaseClient()
  const logKey = workoutLogId?.trim() ?? ''
  const queryEnabled = Boolean(athleteProfileId) && (options?.enabled ?? true)

  return useQuery({
    queryKey: queryKeys.allenamenti.summary(athleteProfileId ?? '', logKey),
    queryFn: () =>
      fetchAthleteWorkoutSummary(supabase, {
        athleteProfileId: athleteProfileId!,
        workoutLogId: logKey || null,
        requestCoachedDebit: options?.requestCoachedDebit,
        onCoachedDebitWarning: options?.onCoachedDebitWarning,
      }),
    enabled: queryEnabled,
    staleTime: 2 * 60 * 1000,
  })
}
