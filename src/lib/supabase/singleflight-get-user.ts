import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

type GetUserResult = Awaited<ReturnType<SupabaseClient['auth']['getUser']>>

export function isAuthNetworkLikeError(error: unknown): boolean {
  if (!error) return false
  const o = error as Record<string, unknown>
  const msg =
    error instanceof Error
      ? error.message
      : typeof o.message === 'string'
        ? o.message
        : String(error)
  const name = error instanceof Error ? error.name : typeof o.name === 'string' ? o.name : ''
  return (
    msg === 'Failed to fetch' ||
    name === 'AuthRetryableFetchError' ||
    msg.toLowerCase().includes('network') ||
    (name === 'TypeError' && msg.toLowerCase().includes('failed'))
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * getUser con fallback 429 (getSession) e retry leggeri su errori di rete.
 * Ogni tentativo usa una nuova `getUser()` (no singleflight interno) così i retry sono effettivi.
 */
export async function getUserResilient(
  client: SupabaseClient,
  options?: { networkRetries?: number },
): Promise<{ user: User | null; error: GetUserResult['error'] }> {
  const maxNet = options?.networkRetries ?? 3

  for (let attempt = 0; attempt < maxNet; attempt++) {
    const { data, error } = await client.auth.getUser()

    const is429 = !!error && (error.code === 'over_request_rate_limit' || error.status === 429)
    if ((error || !data.user) && is429) {
      const {
        data: { session: stored },
        error: sessionError,
      } = await client.auth.getSession()
      if (!sessionError && stored?.user) {
        return { user: stored.user, error: null }
      }
    }

    if (!error && data.user) {
      return { user: data.user, error: null }
    }

    if (error && !isAuthNetworkLikeError(error)) {
      return { user: data.user ?? null, error }
    }

    if (attempt < maxNet - 1 && isAuthNetworkLikeError(error)) {
      await sleep(400 * (attempt + 1))
      continue
    }

    return { user: data.user ?? null, error }
  }

  return { user: null, error: null }
}
