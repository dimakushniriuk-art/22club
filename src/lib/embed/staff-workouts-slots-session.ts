import { isValidUUID } from '@/lib/utils/type-guards'

/** Slot iframe (p1/p2): la sidebar non porta ?p1=&p2= → persistiamo in sessione tab. */
export const STAFF_WORKOUTS_SLOTS_SESSION_KEY = '22club:staff-workouts-embed-slots-v1' as const

export const STAFF_WORKOUTS_SLOTS_CHANGED_EVENT = '22club:staff-workouts-slots-changed' as const

/** Snapshot query string su `/dashboard/workouts` (include p1view, p1workoutPlanId, …) per ripristino dopo navigazione. */
export const STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY =
  '22club:staff-workouts-full-query-v1' as const

export function readStaffWorkoutSlotsFromSession(): { p1: string; p2: string } {
  if (typeof window === 'undefined') return { p1: '', p2: '' }
  try {
    const raw = sessionStorage.getItem(STAFF_WORKOUTS_SLOTS_SESSION_KEY)
    if (!raw) return { p1: '', p2: '' }
    const o = JSON.parse(raw) as { p1?: unknown; p2?: unknown }
    const p1 = typeof o.p1 === 'string' ? o.p1.trim() : ''
    const p2 = typeof o.p2 === 'string' ? o.p2.trim() : ''
    return {
      p1: isValidUUID(p1) ? p1 : '',
      p2: isValidUUID(p2) ? p2 : '',
    }
  } catch {
    return { p1: '', p2: '' }
  }
}

export function hasStaffWorkoutActiveSlots(): boolean {
  const { p1, p2 } = readStaffWorkoutSlotsFromSession()
  return Boolean(p1 || p2)
}

export function persistStaffWorkoutSlots(p1: string, p2: string) {
  if (typeof window === 'undefined') return
  const a = p1.trim()
  const b = p2.trim()
  if (!a && !b) {
    sessionStorage.removeItem(STAFF_WORKOUTS_SLOTS_SESSION_KEY)
    sessionStorage.removeItem(STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY)
  } else {
    sessionStorage.setItem(STAFF_WORKOUTS_SLOTS_SESSION_KEY, JSON.stringify({ p1: a, p2: b }))
  }
  window.dispatchEvent(new Event(STAFF_WORKOUTS_SLOTS_CHANGED_EVENT))
}

export function persistStaffWorkoutsFullQuery(searchString: string) {
  if (typeof window === 'undefined') return
  const trimmed = searchString.trim()
  if (!trimmed) {
    sessionStorage.removeItem(STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY)
    return
  }
  sessionStorage.setItem(STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY, trimmed)
}

export function readStaffWorkoutsFullQuery(): string | null {
  if (typeof window === 'undefined') return null
  const v = sessionStorage.getItem(STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY)
  return v && v.trim() ? v.trim() : null
}

/** True se la query salvata ha almeno uno slot atleta valido. */
export function isRestorableStaffWorkoutsQuery(searchString: string): boolean {
  const p = new URLSearchParams(searchString)
  const p1 = p.get('p1')?.trim() ?? ''
  const p2 = p.get('p2')?.trim() ?? ''
  return (Boolean(p1) && isValidUUID(p1)) || (Boolean(p2) && isValidUUID(p2))
}

/**
 * Completa i parametri di navigazione pannello (p1view, …) dall’ultimo snapshot se gli atleti coincidono.
 * Non sovrascrive chiavi già presenti nell’URL.
 */
export function mergeMissingWorkoutsPaneParamsFromSaved(current: URLSearchParams): string | null {
  const raw = readStaffWorkoutsFullQuery()
  if (!raw) return null
  const saved = new URLSearchParams(raw)
  const out = new URLSearchParams(current.toString())
  let changed = false
  for (const slot of ['p1', 'p2'] as const) {
    const curAthlete = out.get(slot)?.trim() ?? ''
    const savAthlete = saved.get(slot)?.trim() ?? ''
    if (!curAthlete || curAthlete !== savAthlete) continue
    for (const key of saved.keys()) {
      if (!key.startsWith(slot) || key === slot) continue
      if (!out.has(key)) {
        const v = saved.get(key)
        if (v != null && v !== '') {
          out.set(key, v)
          changed = true
        }
      }
    }
  }
  return changed ? out.toString() : null
}
