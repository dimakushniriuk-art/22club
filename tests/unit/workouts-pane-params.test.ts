import { describe, expect, it } from 'vitest'
import {
  applyWorkoutsPaneViewToSearchParams,
  parseWorkoutsPaneView,
} from '@/features/staff-workouts/lib/workouts-pane-params'

const PLAN = '11111111-1111-4111-8111-111111111111'
const DAY = '22222222-2222-4222-8222-222222222222'
const EX = '33333333-3333-4333-8333-333333333333'
const LOG = '44444444-4444-4444-8444-444444444444'

describe('parseWorkoutsPaneView', () => {
  it('parses oggi with valid UUID params', () => {
    const params = new URLSearchParams({
      p1workoutPlanId: PLAN,
      p1dayId: DAY,
      p1exerciseId: EX,
    })
    expect(parseWorkoutsPaneView('oggi', params, 'p1')).toEqual({
      kind: 'oggi',
      workoutPlanId: PLAN,
      dayId: DAY,
      exerciseId: EX,
    })
  })

  it('drops invalid UUIDs on oggi', () => {
    const params = new URLSearchParams({
      p2workoutPlanId: 'bad',
      p2dayId: DAY,
    })
    expect(parseWorkoutsPaneView('oggi', params, 'p2')).toEqual({
      kind: 'oggi',
      workoutPlanId: undefined,
      dayId: DAY,
      exerciseId: undefined,
    })
  })

  it('falls back to home for invalid scheda id', () => {
    const params = new URLSearchParams({ p1workoutPlanId: 'x' })
    expect(parseWorkoutsPaneView('scheda', params, 'p1')).toEqual({ kind: 'home' })
  })

  it('parses giorno when plan and day are valid', () => {
    const params = new URLSearchParams({ p1workoutPlanId: PLAN, p1dayId: DAY })
    expect(parseWorkoutsPaneView('giorno', params, 'p1')).toEqual({
      kind: 'giorno',
      workoutPlanId: PLAN,
      dayId: DAY,
    })
  })

  it('parses riepilogo with workoutLogId', () => {
    const params = new URLSearchParams({ p2workoutLogId: LOG })
    expect(parseWorkoutsPaneView('riepilogo', params, 'p2')).toEqual({
      kind: 'riepilogo',
      workoutLogId: LOG,
    })
  })
})

describe('applyWorkoutsPaneViewToSearchParams', () => {
  it('writes prefixed view params and clears stale keys', () => {
    const base = new URLSearchParams({
      p1view: 'home',
      p1workoutPlanId: PLAN,
      p1dayId: DAY,
      p1exerciseId: EX,
      p1workoutLogId: LOG,
    })
    applyWorkoutsPaneViewToSearchParams('p1', { kind: 'home' }, base)
    expect(base.get('p1view')).toBe('home')
    expect(base.has('p1workoutPlanId')).toBe(false)
    expect(base.has('p1dayId')).toBe(false)
    expect(base.has('p1exerciseId')).toBe(false)
    expect(base.has('p1workoutLogId')).toBe(false)
  })

  it('writes scheda workoutPlanId', () => {
    const base = new URLSearchParams()
    applyWorkoutsPaneViewToSearchParams('p2', { kind: 'scheda', workoutPlanId: PLAN }, base)
    expect(base.get('p2view')).toBe('scheda')
    expect(base.get('p2workoutPlanId')).toBe(PLAN)
  })
})
