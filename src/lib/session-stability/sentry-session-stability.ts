/**
 * Breadcrumb / messaggi opzionali per osservabilità (Sentry) senza dipendenza hard in bundle test.
 */

type SessionStabilityCategory =
  | 'auth_network'
  | 'auth_refresh'
  | 'session_resumed'
  | 'token_refreshed'
  | 'rq_invalidate'
  | 'realtime'
  | 'rate_limit'
  | 'pending_write'

export function sessionStabilityBreadcrumb(
  category: SessionStabilityCategory,
  message: string,
  data?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/nextjs') as typeof import('@sentry/nextjs')
    if (typeof Sentry.addBreadcrumb === 'function') {
      Sentry.addBreadcrumb({
        category: `session_stability.${category}`,
        message,
        level: 'info',
        data,
      })
    }
  } catch {
    // Sentry non inizializzato o DSN assente
  }
}
