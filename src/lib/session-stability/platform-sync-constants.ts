/**
 * Intervalli e debounce condivisi tra sessione, React Query e Realtime staff.
 * Modificare qui per tuning globale (evitare duplicati sparsi nei layout).
 *
 * Latenza prodotto (riferimento QA):
 * - **Live** (Supabase Realtime su tabella pubblicata + RLS): obiettivo tipico < 2s dalla
 *   commit Postgres a invalidazione/refetch lato client.
 * - **Quasi-live**: `SessionDataPulse` + whitelist `session-query-invalidation`, refetch on
 *   visibility dove già previsto nei singoli hook — non sostituisce il live dove serve sync multi-utente.
 */

/** Debounce invalidazione RQ + `router.refresh` dopo `session-resumed` / `auth-token-refreshed`. */
export const SESSION_QUERY_SYNC_DEBOUNCE_MS = 450

/**
 * Poll leggero con tab **visibile**: `getSession` + invalidazione whitelist (stessa famiglia del post-risveglio).
 */
export const PLATFORM_DATA_PULSE_MS = 25_000

/** Throttle invalidazioni appuntamenti da `postgres_changes` nel layout dashboard staff. */
export const STAFF_DASHBOARD_APPOINTMENTS_REALTIME_THROTTLE_MS = 450

/** Throttle invalidazioni lista clienti (profili atleta) da Realtime nel layout dashboard staff. */
export const STAFF_DASHBOARD_PROFILES_REALTIME_THROTTLE_MS = 600

/** Debounce salvataggio bozze form browser (`useBrowserFormDraft`). */
export const PLATFORM_FORM_AUTOSAVE_DEBOUNCE_MS = 450

/** Minimo tempo tab in background prima del recovery auth su visibility. */
export const AUTH_VISIBILITY_MIN_HIDDEN_MS = 3000

/** Anti-storm tra recovery visibility / focus / online. */
export const AUTH_VISIBILITY_RECOVERY_THROTTLE_MS = 2500

/**
 * Realtime nel layout `/dashboard`: default **on**.
 * Rollback rapido: `NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME=0` (o `false`) nella build.
 *
 * Disattivazione selettiva (stessa build): `NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE=appointments,profiles`
 * (valori separati da virgola; `notifications` opzionale). Ignora spazi e maiuscole.
 */
export type StaffDashboardRealtimeTableKey = 'appointments' | 'profiles' | 'notifications'

function parseStaffDashboardRealtimeDisableSet(): ReadonlySet<StaffDashboardRealtimeTableKey> {
  const raw = (process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE ?? '').trim()
  if (!raw) return new Set()
  const out = new Set<StaffDashboardRealtimeTableKey>()
  for (const part of raw.split(',')) {
    const t = part.trim().toLowerCase()
    if (t === 'appointments' || t === 'profiles' || t === 'notifications') {
      out.add(t)
    }
  }
  return out
}

export function isStaffDashboardRealtimeEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME
  if (v === '0' || v === 'false') return false
  return true
}

export function isStaffDashboardRealtimeTableEnabled(key: StaffDashboardRealtimeTableKey): boolean {
  if (!isStaffDashboardRealtimeEnabled()) return false
  return !parseStaffDashboardRealtimeDisableSet().has(key)
}
