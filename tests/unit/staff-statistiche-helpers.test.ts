import { describe, expect, it } from 'vitest'
import {
  calculateStaffStatisticheGrowthMetrics,
  staffStatisticheBoundariesForPeriod,
  staffStatisticheDaysForPeriod,
} from '@/lib/analytics/staff-statistiche-helpers'

describe('staff-statistiche-helpers', () => {
  it('maps period to configured day ranges', () => {
    expect(staffStatisticheDaysForPeriod('week')).toBe(7)
    expect(staffStatisticheDaysForPeriod('month')).toBe(30)
  })

  it('returns zero growth for short trends', () => {
    expect(calculateStaffStatisticheGrowthMetrics([])).toEqual({
      workouts_growth: 0,
      documents_growth: 0,
      hours_growth: 0,
    })
  })

  it('builds inclusive period boundaries', () => {
    const { start, end } = staffStatisticheBoundariesForPeriod(7)
    expect(start.getHours()).toBe(0)
    expect(end.getHours()).toBe(23)
    const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    expect(diffDays).toBeGreaterThanOrEqual(6)
  })
})
