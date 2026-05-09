/**
 * Tag Sentry lato client senza PII (niente email/nome; solo route, ruolo normalizzato, org opzionale).
 */

export type SentryAppTags = {
  route: string
  role: string
  org_id: string
}

export function setSentryClientAppTags(tags: SentryAppTags): void {
  if (typeof window === 'undefined') return
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/nextjs') as typeof import('@sentry/nextjs')
    if (typeof Sentry.setTag === 'function') {
      Sentry.setTag('app.route', tags.route)
      Sentry.setTag('app.role', tags.role)
      Sentry.setTag('app.org_id', tags.org_id)
    }
  } catch {
    // SDK assente o non inizializzato
  }
}
