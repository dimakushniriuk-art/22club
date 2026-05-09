/**
 * Recupero pianificato in anteprima scheda: la serie ha priorità sull’esercizio,
 * coerente con use-workout-detail e persistenza use-workout-plans.
 */
export function resolveScheduledRestSeconds(
  setRest: number | null | undefined,
  exerciseRest: number | null | undefined,
): number | null {
  if (setRest !== null && setRest !== undefined) return setRest
  if (exerciseRest !== null && exerciseRest !== undefined) return exerciseRest
  return null
}

/**
 * Come `use-workout-detail`: `rest_timer_sec` con fallback su `rest_seconds` (NOT NULL in DB).
 */
export function coalesceWorkoutDayExerciseRest(
  rest_timer_sec: number | null | undefined,
  rest_seconds: number | null | undefined,
): number | null {
  if (rest_timer_sec !== null && rest_timer_sec !== undefined) return rest_timer_sec
  if (rest_seconds !== null && rest_seconds !== undefined) return rest_seconds
  return null
}

/** Cella tabella anteprima: assente → em dash; incluso 0 secondi se valorizzato nel DB. */
export function formatScheduledRestTableCell(seconds: number | null): string {
  if (seconds === null) return '—'
  return `${seconds}s`
}
