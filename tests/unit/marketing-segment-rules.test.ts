import { describe, expect, it } from 'vitest'
import { applySegmentRules } from '@/lib/marketing/segment-rules'

const baseAthlete = {
  athlete_id: 'a1',
  last_workout_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  workouts_coached_7d: 2,
  workouts_solo_7d: 1,
  workouts_coached_30d: 5,
  workouts_solo_30d: 3,
}

describe('applySegmentRules', () => {
  it('returns all athletes when rules are empty', () => {
    expect(applySegmentRules([baseAthlete], null)).toHaveLength(1)
    expect(applySegmentRules([baseAthlete], {})).toHaveLength(1)
  })

  it('filters by inactivity_days', () => {
    const active = {
      ...baseAthlete,
      athlete_id: 'a2',
      last_workout_at: new Date().toISOString(),
    }
    const result = applySegmentRules([baseAthlete, active], { inactivity_days: 30 })
    expect(result.map((a) => a.athlete_id)).toEqual(['a1'])
  })

  it('filters by min_workouts_coached_7d', () => {
    const low = { ...baseAthlete, athlete_id: 'low', workouts_coached_7d: 0 }
    const result = applySegmentRules([baseAthlete, low], { min_workouts_coached_7d: 2 })
    expect(result.map((a) => a.athlete_id)).toEqual(['a1'])
  })
})
