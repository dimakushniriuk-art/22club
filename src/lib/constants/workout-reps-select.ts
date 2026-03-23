/** Valore persistito per “ripetizioni a cedimento” (MAX / AMRAP). */
export const WORKOUT_REPS_MAX_SENTINEL = -1

/** 1–20 tutti, poi fino a 50 a step 5. */
export const WORKOUT_REPS_DROPDOWN_VALUES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50,
] as const

const DROPDOWN_SET = new Set<number>(WORKOUT_REPS_DROPDOWN_VALUES)

export type WorkoutRepsSelectOption = { value: string; label: string }

export function buildWorkoutRepsSelectOptions(
  currentReps?: number | null,
): WorkoutRepsSelectOption[] {
  const opts: WorkoutRepsSelectOption[] = [
    { value: 'max', label: 'MAX' },
    ...WORKOUT_REPS_DROPDOWN_VALUES.map((n) => ({ value: String(n), label: String(n) })),
  ]
  if (
    currentReps != null &&
    currentReps !== 0 &&
    currentReps !== WORKOUT_REPS_MAX_SENTINEL &&
    !DROPDOWN_SET.has(currentReps)
  ) {
    opts.splice(1, 0, { value: String(currentReps), label: String(currentReps) })
  }
  return opts
}

export function workoutRepsFromSelectValue(v: string): number {
  if (v === 'max') return WORKOUT_REPS_MAX_SENTINEL
  return Number(v)
}

export function workoutRepsToSelectValue(reps: number | undefined | null): string {
  if (reps === WORKOUT_REPS_MAX_SENTINEL) return 'max'
  if (reps == null || reps === 0) return ''
  return String(reps)
}

export function formatWorkoutRepsLabel(reps: number | null | undefined): string {
  if (reps == null) return '—'
  if (reps === WORKOUT_REPS_MAX_SENTINEL) return 'MAX'
  return String(reps)
}
