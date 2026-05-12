import { describe, expect, it } from 'vitest'
import {
  getStoredStaffExercisesSort,
  getStoredStaffExercisesView,
  STAFF_EXERCISES_SORT_KEY,
  STAFF_EXERCISES_VIEW_KEY,
} from '@/lib/exercises/staff-exercises-page-prefs'

describe('staff exercises page prefs', () => {
  it('uses stable localStorage keys from staff route contracts', () => {
    expect(STAFF_EXERCISES_VIEW_KEY).toBe('esercizi-page-view')
    expect(STAFF_EXERCISES_SORT_KEY).toBe('esercizi-page-sort')
  })

  it('defaults view and sort when storage is empty', () => {
    expect(getStoredStaffExercisesView()).toBe('grid')
    expect(getStoredStaffExercisesSort()).toEqual({ field: 'name', direction: 'asc' })
  })
})
