/**
 * Convenzioni athlete_id nel dominio nutrizione / progressi.
 *
 * - `progress_logs.athlete_id` → FK verso `profiles.user_id` (stesso valore di `auth.users.id`).
 * - `nutrition_progress`, `nutrition_plan_*`, `staff_atleti.atleta_id`, analisi settimanale → `profiles.id` (PK riga profilo).
 *
 * Per filtri `.or(athlete_id.eq.profileId,athlete_id.eq.userId)` su progress_logs usare
 * `progressLogsAthleteIdOrFilter` in `progress-logs-athlete-scope.ts`.
 */

/** Valore da usare nella colonna progress_logs.athlete_id (mai profiles.id). */
export function athleteIdForProgressLogsColumn(
  profileUserId: string | null | undefined,
): string | null {
  return profileUserId ?? null
}

/** Valore da usare in nutrition_progress e tabelle piano collegate (profiles.id). */
export function athleteIdForNutritionColumn(profileId: string): string {
  return profileId
}
