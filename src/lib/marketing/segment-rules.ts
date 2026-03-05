/**
 * Regole segmento (MVP). Salvate in marketing_segments.rules (jsonb).
 * Filtro applicato client-side sui dati da view marketing_athletes.
 */
export type SegmentRules = {
  inactivity_days?: number
  min_workouts_coached_7d?: number
  min_workouts_solo_7d?: number
  min_workouts_coached_30d?: number
  min_workouts_solo_30d?: number
  last_workout_exists?: boolean
}

export type MarketingAthleteForFilter = {
  athlete_id: string
  last_workout_at: string | null
  workouts_coached_7d: number | null
  workouts_solo_7d: number | null
  workouts_coached_30d: number | null
  workouts_solo_30d: number | null
}

export function applySegmentRules<T extends MarketingAthleteForFilter>(
  athletes: T[],
  rules: SegmentRules | null | undefined,
): T[] {
  if (!rules || Object.keys(rules).length === 0) return athletes
  return athletes.filter((a) => {
    if (rules.inactivity_days != null) {
      const days = a.last_workout_at
        ? (Date.now() - new Date(a.last_workout_at).getTime()) / (24 * 60 * 60 * 1000)
        : 9999
      if (days < rules.inactivity_days) return false
    }
    if (rules.last_workout_exists === true && !a.last_workout_at) return false
    if (rules.last_workout_exists === false && a.last_workout_at) return false
    const c7 = Number(a.workouts_coached_7d ?? 0)
    const s7 = Number(a.workouts_solo_7d ?? 0)
    const c30 = Number(a.workouts_coached_30d ?? 0)
    const s30 = Number(a.workouts_solo_30d ?? 0)
    if (rules.min_workouts_coached_7d != null && c7 < rules.min_workouts_coached_7d) return false
    if (rules.min_workouts_solo_7d != null && s7 < rules.min_workouts_solo_7d) return false
    if (rules.min_workouts_coached_30d != null && c30 < rules.min_workouts_coached_30d) return false
    if (rules.min_workouts_solo_30d != null && s30 < rules.min_workouts_solo_30d) return false
    return true
  })
}
