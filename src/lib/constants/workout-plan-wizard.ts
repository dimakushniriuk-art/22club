/** Valore sentinella nel wizard: scheda senza atleta (solo bozza finché non assegni un profilo) */
export const WORKOUT_PLAN_NO_ATHLETE_VALUE = '__bozza_no_athlete__'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isWorkoutPlanRealAthleteId(raw?: string | null): boolean {
  const id = raw?.trim()
  if (!id || id === WORKOUT_PLAN_NO_ATHLETE_VALUE) return false
  return UUID_REGEX.test(id)
}
