import { catalogExerciseIdFromSessionExercise } from '@/lib/workout/catalog-exercise-id'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import type { WorkoutSession, WorkoutSetData } from '@/types/workout'

export function getWorkoutColumnsTemplate(columnCount: number, hasRest: boolean): string {
  const columns = `repeat(${columnCount}, minmax(0, 1fr))`
  return hasRest ? `${columns} 2.5rem` : columns
}

export function resolveSetWeightKgForPicker(
  set: Record<string, unknown>,
  exercise: Record<string, unknown>,
): number {
  const sw = set.weight_kg as number | null | undefined
  const tw = exercise.target_weight as number | null | undefined
  if (sw !== null && sw !== undefined && Number.isFinite(sw)) return sw
  if (tw !== null && tw !== undefined && Number.isFinite(tw)) return tw
  return 0
}

/** Target o ripetizioni eseguite: mostra MAX se il trainer ha impostato il sentinel -1. */
export function displayWorkoutRepsCell(
  setReps: number | null | undefined,
  targetReps: number | null | undefined,
): string | number {
  const resolved = setReps ?? targetReps
  if (resolved == null) return 0
  if (resolved === WORKOUT_REPS_MAX_SENTINEL) return 'MAX'
  return resolved
}

export function workoutDayExerciseRowId(ex: unknown): string {
  if (!ex || typeof ex !== 'object') return ''
  const o = ex as Record<string, unknown>
  const raw = o.id ?? o.workout_day_exercise_id ?? o.workoutDayExerciseId
  if (raw === null || raw === undefined) return ''
  return String(raw).trim()
}

/** Serie da persistere sul workout_log al termine (stesso shape di saveCompletedBlockToDb). */
export type SessionExerciseSetsForLog = {
  id: string
  exercise_id?: string | null
  sets: Array<{
    set_number: number
    reps?: number | null
    weight_kg?: number | null
    execution_time_sec?: number | null
    rest_timer_sec?: number | null
  }>
}

export function sessionExercisesToPersistPayload(
  exercises: unknown[] | undefined,
): SessionExerciseSetsForLog[] {
  if (!exercises?.length) return []
  const out: SessionExerciseSetsForLog[] = []
  for (const ex of exercises) {
    const id = workoutDayExerciseRowId(ex)
    if (!id) continue
    const rec = ex as Record<string, unknown>
    const rawSets = (rec.sets as unknown[] | undefined) ?? []
    const exCatalogId = catalogExerciseIdFromSessionExercise(ex)

    const sets: SessionExerciseSetsForLog['sets'] = []
    for (const s of rawSets) {
      if (!s || typeof s !== 'object') continue
      const row = s as Record<string, unknown>
      sets.push({
        set_number: Number(row.set_number ?? 0),
        reps: row.reps != null && row.reps !== '' ? Number(row.reps) : null,
        weight_kg: row.weight_kg != null && row.weight_kg !== '' ? Number(row.weight_kg) : null,
        execution_time_sec:
          row.execution_time_sec != null && row.execution_time_sec !== ''
            ? Number(row.execution_time_sec)
            : null,
        rest_timer_sec:
          row.rest_timer_sec != null && row.rest_timer_sec !== ''
            ? Number(row.rest_timer_sec)
            : null,
      })
    }
    out.push({ id, ...(exCatalogId ? { exercise_id: exCatalogId } : {}), sets })
  }
  return out
}

/** Serie segnata come eseguita (tollerante a valori numerici da JSON/API). */
export function isWorkoutSetCompleted(s: Record<string, unknown>): boolean {
  const c = s.completed
  return c === true || c === 1
}

export function resolveExerciseIndexInSession(
  exercises: unknown[] | undefined,
  exercise: unknown,
): number {
  if (!exercises?.length) return -1
  const id = workoutDayExerciseRowId(exercise)
  if (!id) return -1
  return exercises.findIndex((e) => workoutDayExerciseRowId(e) === id)
}

export function applyExerciseSetPatch(
  prev: WorkoutSession,
  exerciseIndex: number,
  setNumber: number,
  updates: Partial<WorkoutSetData>,
): WorkoutSession | null {
  if (!prev.exercises?.length) return null
  if (exerciseIndex < 0 || exerciseIndex >= prev.exercises.length) return null
  const targetN = Number(setNumber)
  const exercises = prev.exercises.map((ex, idx) => {
    if (idx !== exerciseIndex) return ex
    const rawSets = (ex as { sets?: unknown }).sets
    const prevSets = Array.isArray(rawSets) ? (rawSets as Record<string, unknown>[]) : []
    const newSets = prevSets.map((set) =>
      Number(set.set_number) === targetN ? { ...set, ...updates } : set,
    )
    const allSetsDone = newSets.length > 0 && newSets.every((s) => isWorkoutSetCompleted(s))
    return { ...ex, sets: newSets, is_completed: allSetsDone }
  })
  const completedCount = exercises.filter(
    (ex) => (ex as { is_completed?: boolean }).is_completed === true,
  ).length
  const total = Math.max(prev.total_exercises || 1, 1)
  return {
    ...prev,
    exercises,
    completed_exercises: completedCount,
    progress_percentage: Math.round((completedCount / total) * 100),
  }
}
