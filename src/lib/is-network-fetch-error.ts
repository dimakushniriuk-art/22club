/**
 * Errori di rete transitori (offline, tab in background, CORS, server irraggiungibile).
 * Non vanno trattati come failure applicativi in console.error.
 */
export function isLikelyNetworkFetchFailure(err: unknown): boolean {
  const parts: string[] = []
  if (typeof err === 'string') {
    parts.push(err)
  } else if (err instanceof Error) {
    parts.push(err.message, err.stack ?? '')
  }
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    for (const k of ['message', 'details', 'hint'] as const) {
      if (typeof o[k] === 'string') parts.push(o[k] as string)
    }
  }
  const t = parts.join(' ').toLowerCase()
  return (
    t.includes('failed to fetch') ||
    t.includes('networkerror') ||
    t.includes('network request failed') ||
    t.includes('fetch failed') ||
    t.includes('load failed') ||
    t.includes('err_network_changed')
  )
}
