/**
 * Supabase Auth usa navigator.locks con opzione steal: richieste concorrenti
 * possono far abortire la precedente con questo messaggio. Non è un errore di rete/RLS.
 */
export function isSupabaseAuthLockStealAbortError(error: unknown): boolean {
  const textParts: string[] = []
  let name = ''

  if (error instanceof Error) {
    textParts.push(error.message)
    name = error.name
  } else if (typeof error === 'object' && error !== null) {
    const o = error as Record<string, unknown>
    for (const key of ['message', 'details', 'hint'] as const) {
      const v = o[key]
      if (typeof v === 'string' && v.length > 0) textParts.push(v)
    }
    if ('name' in o && typeof o.name === 'string') name = o.name
  } else {
    textParts.push(String(error ?? ''))
  }

  const combined = textParts.join(' ').toLowerCase()
  const lockSteal =
    combined.includes('lock broken') &&
    (combined.includes('steal') || combined.includes("'steal'"))
  if (!lockSteal) return false
  return (
    name === 'AbortError' ||
    combined.includes('aborterror') ||
    combined.includes('abort')
  )
}
