import { beforeEach, describe, expect, it } from 'vitest'
import {
  STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY,
  STAFF_WORKOUTS_SLOTS_SESSION_KEY,
  isRestorableStaffWorkoutsQuery,
  mergeMissingWorkoutsPaneParamsFromSaved,
  persistStaffWorkoutSlots,
  persistStaffWorkoutsFullQuery,
  readStaffWorkoutSlotsFromSession,
  readStaffWorkoutsFullQuery,
} from '@/lib/embed/staff-workouts-slots-session'

const ATHLETE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const OTHER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

describe('staff workouts slots session', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('persists and reads valid slot ids', () => {
    persistStaffWorkoutSlots(ATHLETE, OTHER)
    expect(readStaffWorkoutSlotsFromSession()).toEqual({ p1: ATHLETE, p2: OTHER })
  })

  it('drops invalid slot ids on read', () => {
    sessionStorage.setItem(
      STAFF_WORKOUTS_SLOTS_SESSION_KEY,
      JSON.stringify({ p1: 'bad', p2: OTHER }),
    )
    expect(readStaffWorkoutSlotsFromSession()).toEqual({ p1: '', p2: OTHER })
  })

  it('clears session keys when both slots are empty', () => {
    persistStaffWorkoutSlots(ATHLETE, OTHER)
    persistStaffWorkoutsFullQuery('p1=foo')
    persistStaffWorkoutSlots('', '')
    expect(sessionStorage.getItem(STAFF_WORKOUTS_SLOTS_SESSION_KEY)).toBeNull()
    expect(sessionStorage.getItem(STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY)).toBeNull()
  })

  it('detects restorable workouts query', () => {
    expect(isRestorableStaffWorkoutsQuery(`p1=${ATHLETE}&p1view=home`)).toBe(true)
    expect(isRestorableStaffWorkoutsQuery('p1=bad')).toBe(false)
  })

  it('merges missing pane params when athlete ids match', () => {
    persistStaffWorkoutsFullQuery(
      `p1=${ATHLETE}&p1view=oggi&p1dayId=22222222-2222-4222-8222-222222222222`,
    )
    const merged = mergeMissingWorkoutsPaneParamsFromSaved(new URLSearchParams(`p1=${ATHLETE}`))
    expect(merged).toContain('p1view=oggi')
    expect(merged).toContain('p1dayId=22222222-2222-4222-8222-222222222222')
    expect(readStaffWorkoutsFullQuery()).toBe(
      `p1=${ATHLETE}&p1view=oggi&p1dayId=22222222-2222-4222-8222-222222222222`,
    )
  })

  it('does not merge when athlete id differs', () => {
    persistStaffWorkoutsFullQuery(`p1=${ATHLETE}&p1view=oggi`)
    expect(mergeMissingWorkoutsPaneParamsFromSaved(new URLSearchParams(`p1=${OTHER}`))).toBeNull()
  })
})
