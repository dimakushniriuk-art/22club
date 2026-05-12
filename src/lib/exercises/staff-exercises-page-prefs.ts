import { STAFF_DASHBOARD_LOCAL_STORAGE_KEYS } from '@/lib/dashboard/staff-route-contracts'

export const STAFF_EXERCISES_VIEW_KEY = STAFF_DASHBOARD_LOCAL_STORAGE_KEYS.eserciziPageView
export const STAFF_EXERCISES_SORT_KEY = STAFF_DASHBOARD_LOCAL_STORAGE_KEYS.eserciziPageSort

export type StaffExercisesSortField =
  | 'name'
  | 'muscle_group'
  | 'equipment'
  | 'difficulty'
  | 'updated_at'

export type StaffExercisesSort = {
  field: StaffExercisesSortField
  direction: 'asc' | 'desc'
}

const SORT_FIELDS: StaffExercisesSortField[] = [
  'name',
  'muscle_group',
  'equipment',
  'difficulty',
  'updated_at',
]

export function getStoredStaffExercisesView(): 'grid' | 'table' {
  if (typeof window === 'undefined') return 'grid'
  const v = localStorage.getItem(STAFF_EXERCISES_VIEW_KEY)
  return v === 'table' ? 'table' : 'grid'
}

export function getStoredStaffExercisesSort(): StaffExercisesSort {
  if (typeof window === 'undefined') return { field: 'name', direction: 'asc' }
  try {
    const raw = localStorage.getItem(STAFF_EXERCISES_SORT_KEY)
    if (!raw) return { field: 'name', direction: 'asc' }
    const parsed = JSON.parse(raw) as { field?: string; direction?: string }
    const field = SORT_FIELDS.includes(parsed?.field as StaffExercisesSortField)
      ? (parsed.field as StaffExercisesSortField)
      : 'name'
    const direction = parsed?.direction === 'desc' ? 'desc' : 'asc'
    return { field, direction }
  } catch {
    return { field: 'name', direction: 'asc' }
  }
}
