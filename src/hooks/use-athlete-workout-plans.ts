'use client'

import { useQuery } from '@tanstack/react-query'
import type { Workout } from '@/types/workout'
import { queryKeys } from '@/lib/query-keys'

type FetchAthleteWorkoutPlansOptions = {
  athleteSubjectProfileId?: string | null
}

async function fetchAthleteWorkoutPlans(
  options?: FetchAthleteWorkoutPlansOptions,
): Promise<Workout[]> {
  const subjectId = options?.athleteSubjectProfileId?.trim() || null
  if (subjectId) {
    const res = await fetch(
      `/api/staff/athlete-workout-plans?atleta_id=${encodeURIComponent(subjectId)}`,
    )
    const json = (await res.json().catch(() => ({}))) as {
      workouts?: Workout[]
      error?: string
    }
    if (!res.ok) {
      throw new Error(json.error ?? 'Errore nel caricamento delle schede')
    }
    return json.workouts ?? []
  }

  const res = await fetch('/api/athlete/workout-plans')
  const json = (await res.json().catch(() => ({}))) as {
    workouts?: Workout[]
    error?: string
  }
  if (!res.ok) {
    throw new Error(json.error ?? 'Errore nel caricamento delle schede')
  }
  return json.workouts ?? []
}

export function useAthleteWorkoutPlans(
  athleteProfileId: string | null,
  options?: { athleteSubjectProfileId?: string | null; enabled?: boolean },
) {
  const subjectProfileId = options?.athleteSubjectProfileId?.trim() ?? ''
  const enabled = Boolean(athleteProfileId) && (options?.enabled ?? true)

  return useQuery({
    queryKey: queryKeys.allenamenti.plans(athleteProfileId ?? '', subjectProfileId),
    queryFn: () =>
      fetchAthleteWorkoutPlans({
        athleteSubjectProfileId: subjectProfileId || null,
      }),
    enabled,
    staleTime: 3 * 60 * 1000,
  })
}
