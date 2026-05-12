'use client'

import { useQuery } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { queryKeys } from '@/lib/query-keys'

export type AthleteWorkoutDayExerciseMedia = {
  id: string
  name: string | null
  muscle_group: string | null
  description: string | null
  video_url: string | null
  thumb_url: string | null
  image_url: string | null
}

export type AthleteWorkoutDayExerciseRow = {
  id: string
  order_index: number | null
  target_sets: number | null
  target_reps: number | null
  target_weight: number | null
  rest_timer_sec: number | null
  rest_seconds: number | null
  note: string | null
  circuit_block_id: string | null
  exercises: AthleteWorkoutDayExerciseMedia | null
}

export type AthleteWorkoutDayPreview = {
  planName: string
  dayLabel: string
  rows: AthleteWorkoutDayExerciseRow[]
}

async function fetchAthleteWorkoutDayPreview(
  supabase: SupabaseClient<Database>,
  athleteProfileId: string,
  planId: string,
  dayId: string,
): Promise<AthleteWorkoutDayPreview> {
  const [planResult, dayResult, exResult] = await Promise.all([
    supabase
      .from('workout_plans')
      .select('id, name, is_draft')
      .eq('id', planId)
      .eq('athlete_id', athleteProfileId)
      .maybeSingle(),
    supabase
      .from('workout_days')
      .select('id, day_number, day_name, title, workout_plan_id')
      .eq('id', dayId)
      .maybeSingle(),
    supabase
      .from('workout_day_exercises')
      .select(
        `
            id,
            order_index,
            target_sets,
            target_reps,
            target_weight,
            rest_timer_sec,
            rest_seconds,
            note,
            circuit_block_id,
            exercises ( id, name, muscle_group, description, video_url, thumb_url, image_url )
          `,
      )
      .eq('workout_day_id', dayId)
      .order('order_index', { ascending: true }),
  ])

  const { data: plan, error: planErr } = planResult
  if (planErr) throw planErr
  if (!plan || (plan as { is_draft?: boolean | null }).is_draft) {
    throw new Error('Scheda non trovata')
  }

  const planName = ((plan as { name?: string | null }).name ?? '').trim() || 'Scheda'

  const { data: dayRow, error: dayErr } = dayResult
  if (dayErr) throw dayErr
  const day = dayRow as {
    workout_plan_id?: string | null
    day_number?: number | null
    day_name?: string | null
    title?: string | null
  } | null
  if (!day || day.workout_plan_id !== planId) {
    throw new Error('Giorno non trovato')
  }

  const dayLabel =
    (day.title?.trim() ||
      day.day_name?.trim() ||
      (day.day_number != null ? `Giorno ${day.day_number}` : 'Giorno')) ??
    'Giorno'

  const { data: exData, error: exErr } = exResult
  if (exErr) throw exErr

  return {
    planName,
    dayLabel,
    rows: (exData ?? []) as AthleteWorkoutDayExerciseRow[],
  }
}

export function useAthleteWorkoutDayPreview(
  athleteProfileId: string | null,
  planId: string | null,
  dayId: string | null,
  enabled = true,
) {
  const supabase = useSupabaseClient()
  const queryEnabled = Boolean(athleteProfileId && planId && dayId) && enabled

  return useQuery({
    queryKey: queryKeys.allenamenti.dayPreview(
      athleteProfileId ?? '',
      planId ?? '',
      dayId ?? '',
    ),
    queryFn: () =>
      fetchAthleteWorkoutDayPreview(supabase, athleteProfileId!, planId!, dayId!),
    enabled: queryEnabled,
    staleTime: 3 * 60 * 1000,
  })
}
