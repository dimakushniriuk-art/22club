'use client'

import { useAthleteWorkoutHistory } from '@/hooks/use-athlete-workout-history'

export {
  isCompletedStato,
  type AthleteWorkoutHistoryLog as StoricoWorkoutRow,
  type AthleteWorkoutHistoryStats as StoricoWorkoutStats,
} from '@/hooks/use-athlete-workout-history'

export function useStoricoAllenamentiProfile(
  profileId: string | null,
  selectedPeriod: '7d' | '30d' | '90d' | 'all',
) {
  const query = useAthleteWorkoutHistory(profileId, selectedPeriod)

  return {
    workouts: query.data?.workouts ?? [],
    stats: query.data?.stats ?? { solo_count: 0, coached_count: 0, total_hours: 0 },
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : String(query.error)
      : null,
    reload: query.refetch,
  }
}
