/**
 * Utility per rilevare se siamo in ambiente di test E2E
 * Disabilita agent logging e altre funzionalità di debug durante i test
 */
export function isTestEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  // Disabilita durante localhost:3001 (dove girano i test E2E)
  return (
    window.location.hostname === 'localhost' &&
    window.location.port === '3001'
  )
}
