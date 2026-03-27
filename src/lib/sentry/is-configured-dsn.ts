/**
 * True solo se il DSN sembra reale. Evita Sentry.init con placeholder del wizard → "Invalid Sentry Dsn" in console.
 */
export function isConfiguredSentryDsn(dsn: string | undefined | null): boolean {
  if (dsn == null || typeof dsn !== 'string') return false
  const t = dsn.trim()
  if (!t) return false
  const lower = t.toLowerCase()
  if (lower.includes('your-dsn')) return false
  if (lower.includes('changeme') || lower.includes('replace_me')) return false
  if (!lower.includes('@') || !lower.includes('sentry')) return false
  return true
}
