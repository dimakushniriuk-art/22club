/**
 * Payload atomico per RPC `create_workout_plan_bundle` / `replace_workout_plan_bundle`.
 * Mantiene la stessa semantica di getExercisesWithCircuitBlock + buildWorkoutDayExerciseInsertPayload.
 */

import type {
  WorkoutWizardData,
  WorkoutDayData,
  WorkoutDayExerciseData,
  DayItem,
} from '@/types/workout'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type WorkoutPlanBundleRpcExercise = {
  exercise_id: string
  target_sets?: number
  sets?: number
  target_reps?: number
  reps_min?: number
  target_weight?: number | null
  weight_kg?: number | null
  execution_time_sec?: number | null
  rest_timer_sec?: number | null
  rest_seconds?: number | null
  note?: string | null
  circuit_block_id?: string | null
  sets_detail?: WorkoutDayExerciseData['sets_detail']
}

export type WorkoutPlanBundlePayload = {
  plan: {
    name: string
    description: string | null
    objective: string | null
    difficulty: string | null
    athlete_id: string | null
    is_draft: boolean
    is_active: boolean
  }
  days: Array<{
    title: string
    day_name: string
    sessions_until_refresh: number | null
  }>
  exercises_by_day: WorkoutPlanBundleRpcExercise[][]
}

function getDayItems(day: WorkoutDayData): DayItem[] {
  if (day.items && day.items.length > 0) return day.items
  return (day.exercises || []).map((e) => ({ type: 'exercise' as const, exercise: e }))
}

export function getExercisesWithCircuitBlock(
  day: WorkoutDayData,
  circuitList: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
): Array<{ exercise: WorkoutDayExerciseData; circuit_block_id: string | null }> {
  const items = getDayItems(day)
  const result: Array<{ exercise: WorkoutDayExerciseData; circuit_block_id: string | null }> = []
  for (const item of items) {
    if (item.type === 'exercise') {
      result.push({ exercise: item.exercise, circuit_block_id: null })
    } else {
      const circuit = circuitList.find((c) => c.id === item.circuitId)
      const params = circuit?.params ?? []
      const blockId =
        params.length > 0
          ? UUID_REGEX.test(item.circuitId)
            ? item.circuitId
            : crypto.randomUUID()
          : null
      for (const p of params) {
        result.push({ exercise: p, circuit_block_id: blockId })
      }
    }
  }
  return result
}

function toRpcExercise(
  ex: WorkoutDayExerciseData,
  circuit_block_id: string | null,
): WorkoutPlanBundleRpcExercise {
  const ts = Math.max(1, ex.target_sets ?? ex.sets ?? 3)
  return {
    exercise_id: ex.exercise_id,
    target_sets: ts,
    sets: ts,
    target_reps: ex.target_reps,
    reps_min: ex.reps_min,
    target_weight: ex.target_weight ?? null,
    weight_kg: ex.weight_kg ?? null,
    execution_time_sec: ex.execution_time_sec ?? null,
    rest_timer_sec: ex.rest_timer_sec ?? ex.rest_seconds ?? null,
    rest_seconds: ex.rest_seconds ?? null,
    note: ex.note ?? null,
    circuit_block_id,
    sets_detail: ex.sets_detail,
  }
}

export function buildWorkoutPlanBundlePayload(
  workoutData: WorkoutWizardData,
  circuitList: Array<{ id: string; params: WorkoutDayExerciseData[] }> | undefined,
  options: { draft: boolean; athleteId: string | null },
): WorkoutPlanBundlePayload {
  const isDraft = options.draft === true
  const planName = workoutData.title.trim() || (isDraft ? 'Bozza' : workoutData.title)

  const days = workoutData.days.map((day, dayIndex) => {
    const sur = day.sessions_until_refresh
    const sessionsUntilRefresh =
      typeof sur === 'number' && Number.isFinite(sur) && sur >= 1
        ? Math.min(Math.floor(sur), 999)
        : null
    const title = day.title || day.name || `Giorno ${dayIndex + 1}`
    const dayName = day.name || day.title || `Giorno ${dayIndex + 1}`
    return {
      title,
      day_name: dayName,
      sessions_until_refresh: sessionsUntilRefresh,
    }
  })

  const exercises_by_day: WorkoutPlanBundleRpcExercise[][] = workoutData.days.map((day) => {
    const flat =
      circuitList && circuitList.length > 0
        ? getExercisesWithCircuitBlock(day, circuitList)
        : (day.exercises || []).map((ex) => ({
            exercise: ex,
            circuit_block_id: null as string | null,
          }))
    const out: WorkoutPlanBundleRpcExercise[] = []
    for (const { exercise, circuit_block_id } of flat) {
      if (!exercise.exercise_id?.trim()) continue
      out.push(toRpcExercise(exercise, circuit_block_id))
    }
    return out
  })

  return {
    plan: {
      name: planName,
      description: workoutData.notes || null,
      objective: workoutData.objective || null,
      difficulty: workoutData.difficulty || null,
      athlete_id: options.athleteId,
      is_draft: isDraft,
      is_active: !isDraft,
    },
    days,
    exercises_by_day,
  }
}
