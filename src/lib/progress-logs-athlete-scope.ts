/**
 * progress_logs.athlete_id in DB è profiles.user_id (auth.users.id).
 * Nelle route staff l’ID in URL è di solito profiles.id: combiniamo entrambi per .or() Supabase.
 */
export function progressLogsAthleteIdOrFilter(
  profileId: string,
  profileUserId: string | null,
): string {
  const ids = [...new Set([profileId, profileUserId].filter((x): x is string => Boolean(x)))]
  if (ids.length === 0) return `athlete_id.eq.${profileId}`
  return ids.map((id) => `athlete_id.eq.${id}`).join(',')
}
