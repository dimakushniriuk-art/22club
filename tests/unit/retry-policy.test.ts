import { describe, it, expect } from 'vitest'
import { shouldRetryError, calculateRetryDelay } from '../../src/lib/retry-policy'

describe('Retry Policy', () => {
  describe('shouldRetryError', () => {
    it('should retry on network errors', () => {
      const networkError = new Error('Network request failed')
      expect(shouldRetryError(networkError)).toBe(true)
    })

    it('should retry on fetch errors', () => {
      const fetchError = new Error('Failed to fetch')
      expect(shouldRetryError(fetchError)).toBe(true)
    })

    it('should retry on timeout errors', () => {
      const timeoutError = new Error('Request timeout')
      expect(shouldRetryError(timeoutError)).toBe(true)
    })

    it('should retry on connection errors', () => {
      const connectionError = new Error('ECONNREFUSED')
      expect(shouldRetryError(connectionError)).toBe(true)

      const connectionResetError = new Error('ECONNRESET')
      expect(shouldRetryError(connectionResetError)).toBe(true)
    })

    it('should retry on ENOTFOUND errors', () => {
      const notFoundError = new Error('ENOTFOUND')
      expect(shouldRetryError(notFoundError)).toBe(true)
    })

    it('should retry on TypeError with "failed" message', () => {
      const typeError = new TypeError('Failed to fetch')
      expect(shouldRetryError(typeError)).toBe(true)
    })

    it('should retry on 5xx server errors', () => {
      const serverError500 = { status: 500, message: 'Internal Server Error' }
      expect(shouldRetryError(serverError500)).toBe(true)

      const serverError502 = { status: 502, message: 'Bad Gateway' }
      expect(shouldRetryError(serverError502)).toBe(true)

      const serverError503 = { status: 503, message: 'Service Unavailable' }
      expect(shouldRetryError(serverError503)).toBe(true)
    })

    it('should not retry on 4xx client errors', () => {
      const clientError400 = { status: 400, message: 'Bad Request' }
      expect(shouldRetryError(clientError400)).toBe(false)

      const clientError404 = { status: 404, message: 'Not Found' }
      expect(shouldRetryError(clientError404)).toBe(false)

      const clientError422 = { status: 422, message: 'Unprocessable Entity' }
      expect(shouldRetryError(clientError422)).toBe(false)
    })

    it('should not retry on 401 Unauthorized', () => {
      const authError = { status: 401, message: 'Unauthorized' }
      expect(shouldRetryError(authError)).toBe(false)
    })

    it('should not retry on 403 Forbidden', () => {
      const forbiddenError = { status: 403, message: 'Forbidden' }
      expect(shouldRetryError(forbiddenError)).toBe(false)
    })

    it('should retry on Supabase transient error codes', () => {
      // Codici Supabase transienti (lowercase)
      const pgrstError1 = { code: 'pgrst_001', message: 'Connection error' }
      expect(shouldRetryError(pgrstError1)).toBe(true)

      const pgrstError2 = { code: 'pgrst_002', message: 'Timeout' }
      expect(shouldRetryError(pgrstError2)).toBe(true)

      const pgrstError3 = { code: 'pgrst_003', message: 'Network error' }
      expect(shouldRetryError(pgrstError3)).toBe(true)
    })

    it('should not retry on unknown errors by default', () => {
      const unknownError = new Error('Unknown error')
      expect(shouldRetryError(unknownError)).toBe(false)

      const genericObject = { message: 'Some error' }
      expect(shouldRetryError(genericObject)).toBe(false)
    })

    it('should handle null/undefined gracefully', () => {
      expect(shouldRetryError(null)).toBe(false)
      expect(shouldRetryError(undefined)).toBe(false)
    })
  })

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff correctly with defaults', () => {
      // Tentativo 0: baseDelay * 2^0 = 1000ms (default)
      expect(calculateRetryDelay(0)).toBe(1000)

      // Tentativo 1: baseDelay * 2^1 = 2000ms
      expect(calculateRetryDelay(1)).toBe(2000)

      // Tentativo 2: baseDelay * 2^2 = 4000ms
      expect(calculateRetryDelay(2)).toBe(4000)

      // Tentativo 3: baseDelay * 2^3 = 8000ms
      expect(calculateRetryDelay(3)).toBe(8000)
    })

    it('should calculate exponential backoff with custom base delay', () => {
      // Base delay personalizzato: 1000ms
      expect(calculateRetryDelay(0, 1000)).toBe(1000)
      expect(calculateRetryDelay(1, 1000)).toBe(2000)
      expect(calculateRetryDelay(2, 1000)).toBe(4000)
      expect(calculateRetryDelay(3, 1000)).toBe(8000)
    })

    it('should respect max delay limit', () => {
      // Tentativo 5: 1000 * 2^5 = 32000ms, ma limitato a maxDelay (30000ms)
      const delay = calculateRetryDelay(5, 1000, 30000)
      expect(delay).toBe(30000)
      expect(delay).toBeLessThanOrEqual(30000)

      // Tentativo 10: dovrebbe essere limitato a maxDelay
      const delay10 = calculateRetryDelay(10, 1000, 30000)
      expect(delay10).toBe(30000)
    })

    it('should use default max delay (30000ms) when not provided', () => {
      // Tentativo 5: 1000 * 2^5 = 32000, ma limitato a 30000 (default)
      const delay = calculateRetryDelay(5)
      expect(delay).toBe(30000)
      expect(delay).toBeLessThanOrEqual(30000)
    })

    it('should handle custom base delay', () => {
      // Base delay personalizzato: 500ms
      expect(calculateRetryDelay(0, 500)).toBe(500)
      expect(calculateRetryDelay(1, 500)).toBe(1000)
      expect(calculateRetryDelay(2, 500)).toBe(2000)
    })

    it('should handle custom max delay', () => {
      // Max delay personalizzato: 10000ms
      const delay = calculateRetryDelay(5, 1000, 10000)
      expect(delay).toBeLessThanOrEqual(10000)
      expect(delay).toBe(10000) // 1000 * 2^5 = 32000, limitato a 10000
    })

    it('should calculate correct delays for multiple attempts', () => {
      const delays = [0, 1, 2, 3, 4].map((attempt) => calculateRetryDelay(attempt, 1000, 30000))

      expect(delays[0]).toBe(1000) // 1s
      expect(delays[1]).toBe(2000) // 2s
      expect(delays[2]).toBe(4000) // 4s
      expect(delays[3]).toBe(8000) // 8s
      expect(delays[4]).toBe(16000) // 16s

      // Tutti dovrebbero essere <= maxDelay
      delays.forEach((delay) => {
        expect(delay).toBeLessThanOrEqual(30000)
      })
    })
  })
})
