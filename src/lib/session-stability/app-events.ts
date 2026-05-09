/**
 * Eventi finestra per allineare React Query e Realtime dopo pausa / refresh JWT.
 * Nomi stabili per listener e test.
 */

export const SESSION_RESUMED_EVENT = 'app:session-resumed'
export const AUTH_TOKEN_REFRESHED_EVENT = 'app:auth-token-refreshed'
export const REALTIME_RESUBSCRIBE_EVENT = 'app:realtime-resubscribe'
/** Dopo flush riuscito della coda scritture offline (vedi `pending-write-queue`). */
export const PENDING_WRITES_FLUSHED_EVENT = 'app:pending-writes-flushed'

export function dispatchSessionResumed(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SESSION_RESUMED_EVENT, { detail: { at: Date.now() } }))
}

export function dispatchAuthTokenRefreshed(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_REFRESHED_EVENT, { detail: { at: Date.now() } }))
}

export function dispatchRealtimeResubscribe(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(REALTIME_RESUBSCRIBE_EVENT))
}
