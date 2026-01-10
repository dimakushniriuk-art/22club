/**
 * Utility per retry con backoff esponenziale
 * Supporta retry automatico per errori retryable (rete, timeout, server errors)
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryableErrors?: string[]
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 secondo
  maxDelayMs: 10000, // 10 secondi max
  backoffMultiplier: 2,
  retryableErrors: [
    'Failed to fetch',
    'NetworkError',
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    '500',
    '502',
    '503',
    '504',
  ],
}

/**
 * Verifica se un errore è retryable
 */
function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (!error) return false

  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorString = errorMessage.toLowerCase()

  return retryableErrors.some((retryable) => errorString.includes(retryable.toLowerCase()))
}

/**
 * Calcola delay per retry con backoff esponenziale
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt)
  return Math.min(delay, maxDelay)
}

/**
 * Esegue una funzione con retry automatico e backoff esponenziale
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Se non è retryable o è l'ultimo tentativo, lancia l'errore
      if (!isRetryableError(error, opts.retryableErrors) || attempt === opts.maxRetries) {
        throw error
      }

      // Calcola delay per prossimo retry
      const delay = calculateDelay(
        attempt,
        opts.initialDelayMs,
        opts.maxDelayMs,
        opts.backoffMultiplier,
      )

      // Attendi prima di riprovare
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Wrapper per distinguere errori retryable da non retryable
 */
export function isRetryable(error: unknown): boolean {
  return isRetryableError(error, DEFAULT_OPTIONS.retryableErrors)
}
