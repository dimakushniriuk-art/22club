const DEFAULT_RETRIES = 2
const DEFAULT_DELAY_MS = 700

function isLikelyTransientNetworkError(e: unknown): boolean {
  if (e == null) return false
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const msg = String((e as { message?: string }).message).toLowerCase()
    if (msg.includes('failed to fetch')) return true
    if (msg.includes('network')) return true
    if (msg.includes('load failed')) return true
    if (msg.includes('aborted')) return true
  }
  if (typeof e === 'object' && e !== null && 'code' in e) {
    const code = String((e as { code?: string }).code)
    if (code === 'ECONNRESET' || code === 'ETIMEDOUT') return true
  }
  return false
}

/**
 * Riesegue un’operazione async in caso di errori di rete transitori (salvataggi critici).
 */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  options?: { retries?: number; delayMs?: number },
): Promise<T> {
  const retries = options?.retries ?? DEFAULT_RETRIES
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (e) {
      lastError = e
      const canRetry = attempt < retries && isLikelyTransientNetworkError(e)
      if (!canRetry) throw e
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)))
    }
  }
  throw lastError
}
