/**
 * @fileoverview Retry policy intelligente per React Query
 * @description Distingue tra errori transienti (network, 5xx) e permanenti (4xx)
 * @module lib/retry-policy
 */

/**
 * Determina se un errore dovrebbe essere ritentato
 *
 * @param error - L'errore da valutare
 * @returns true se l'errore dovrebbe essere ritentato, false altrimenti
 *
 * @example
 * ```ts
 * const shouldRetry = shouldRetryError(new Error('Network request failed'))
 * // true
 *
 * const shouldRetry = shouldRetryError({ status: 404, message: 'Not Found' })
 * // false
 * ```
 */
export function shouldRetryError(error: unknown): boolean {
  // Se non è un errore, non ritentare
  if (!error) {
    return false
  }

  // Errori di rete: sempre ritentare
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('econnreset')
    ) {
      return true
    }

    // TypeError spesso indica problemi di rete
    if (error instanceof TypeError && message.includes('failed')) {
      return true
    }
  }

  // Errori HTTP con status code
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>

    // Se ha una proprietà status (come errori Supabase/HTTP)
    if ('status' in errorObj && typeof errorObj.status === 'number') {
      const status = errorObj.status

      // 5xx: errori server, ritentare
      if (status >= 500 && status < 600) {
        return true
      }

      // 4xx: errori client, NON ritentare (404, 401, 403, etc.)
      if (status >= 400 && status < 500) {
        return false
      }
    }

    // Se ha una proprietà code (come errori Supabase)
    if ('code' in errorObj && typeof errorObj.code === 'string') {
      const code = errorObj.code.toLowerCase()

      // Codici Supabase che indicano errori transienti
      const transientCodes = [
        'pgrst_001', // Connection error
        'pgrst_002', // Timeout
        'pgrst_003', // Network error
      ]

      if (transientCodes.includes(code)) {
        return true
      }
    }
  }

  // Default: non ritentare se non è chiaramente un errore transiente
  return false
}

/**
 * Calcola il delay per il retry con backoff esponenziale
 *
 * @param attemptIndex - Indice del tentativo (0-based)
 * @param baseDelayMs - Delay base in millisecondi (default: 1000)
 * @param maxDelayMs - Delay massimo in millisecondi (default: 30000)
 * @returns Delay in millisecondi
 *
 * @example
 * ```ts
 * const delay1 = calculateRetryDelay(0) // 1000ms
 * const delay2 = calculateRetryDelay(1) // 2000ms
 * const delay3 = calculateRetryDelay(2) // 4000ms
 * ```
 */
export function calculateRetryDelay(
  attemptIndex: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000,
): number {
  // Backoff esponenziale: baseDelay * 2^attemptIndex
  const delay = baseDelayMs * Math.pow(2, attemptIndex)

  // Non superare il delay massimo
  return Math.min(delay, maxDelayMs)
}
