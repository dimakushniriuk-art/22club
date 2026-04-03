// Hook per chiamate API con retry logic e error handling robusto

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  handleApiError,
  handleRetryError,
  handleTimeoutError,
  handleNetworkError,
} from '@/lib/error-handler'
import { logApiCall, logApiRetry, logApiSuccess, logApiError } from '@/lib/api-logger'
import { isSupabaseAuthLockStealAbortError } from '@/lib/supabase/supabase-lock-abort'

interface RetryOptions {
  maxAttempts?: number
  delayMs?: number
  backoffMultiplier?: number
  timeoutMs?: number
}

interface ApiCallOptions {
  retry?: RetryOptions
  context?: string
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastAttempt: number
  totalAttempts: number
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
}

/** Retry rapidi per contesa lock auth Supabase (steal); non consumano i tentativi "business". */
const SUPABASE_LOCK_STEAL_MAX_RETRIES = 24
const SUPABASE_LOCK_STEAL_DELAY_MS = 80

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timeoutId: NodeJS.Timeout | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout dopo ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

export function useApiWithRetry<T>() {
  const isMountedRef = useRef(true)
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastAttempt: 0,
    totalAttempts: 0,
  })

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const executeApiCall = useCallback(
    async (apiCall: () => Promise<T>, options: ApiCallOptions = {}): Promise<T | null> => {
      const { retry = {}, context = 'api-call' } = options
      const retryOptions = { ...defaultRetryOptions, ...retry }
      const callId = logApiCall(context)

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          lastAttempt: 0,
          totalAttempts: 0,
        }))
      }

      let lastError: Error | null = null

      for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
        try {
          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              lastAttempt: attempt,
              totalAttempts: attempt,
            }))
          }

          if (attempt > 1) {
            logApiRetry(callId, attempt, retryOptions.maxAttempts, lastError ?? undefined)
          }

          let stealAttempts = 0
          let result: T | undefined
          while (true) {
            try {
              result = await withTimeout(apiCall(), retryOptions.timeoutMs)
              break
            } catch (innerErr) {
              if (
                isSupabaseAuthLockStealAbortError(innerErr) &&
                stealAttempts < SUPABASE_LOCK_STEAL_MAX_RETRIES
              ) {
                stealAttempts++
                await sleep(SUPABASE_LOCK_STEAL_DELAY_MS)
                continue
              }
              throw innerErr
            }
          }

          logApiSuccess(
            callId,
            result != null && typeof result === 'object'
              ? (result as Record<string, unknown>)
              : undefined,
          )

          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              data: result,
              loading: false,
              error: null,
            }))
          }

          return result as T
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))

          if (isSupabaseAuthLockStealAbortError(lastError)) {
            if (attempt < retryOptions.maxAttempts) {
              const delay = Math.max(
                200,
                retryOptions.delayMs * Math.pow(retryOptions.backoffMultiplier, attempt - 1),
              )
              if (isMountedRef.current) {
                setState((prev) => ({
                  ...prev,
                  error: `Sincronizzazione sessione… tentativo ${attempt}/${retryOptions.maxAttempts}`,
                }))
              }
              await sleep(delay)
              continue
            }
            if (isMountedRef.current) {
              setState((prev) => ({
                ...prev,
                loading: false,
                error: 'Connessione occupata. Aggiorna o riprova tra poco.',
              }))
            }
            return null
          }

          const apiError =
            lastError instanceof Error && lastError.message.includes('Timeout')
              ? handleTimeoutError(retryOptions.timeoutMs, context)
              : lastError instanceof TypeError && lastError.message.includes('fetch')
                ? handleNetworkError(lastError, context)
                : handleApiError(lastError, context)

          if (attempt === retryOptions.maxAttempts) {
            logApiError(callId, { ...apiError })
            if (isMountedRef.current) {
              setState((prev) => ({
                ...prev,
                loading: false,
                error: apiError.message,
              }))
            }
            return null
          }

          const delay = retryOptions.delayMs * Math.pow(retryOptions.backoffMultiplier, attempt - 1)

          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              error: `Tentativo ${attempt}/${retryOptions.maxAttempts} fallito. Riprovo in ${delay}ms...`,
            }))
          }

          await sleep(delay)
        }
      }

      const finalError = handleRetryError(
        lastError,
        retryOptions.maxAttempts,
        retryOptions.maxAttempts,
        context,
      )

      logApiError(callId, { ...finalError })

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: finalError.message,
        }))
      }

      return null
    },
    [],
  )

  const reset = useCallback(() => {
    if (!isMountedRef.current) return
    setState({
      data: null,
      loading: false,
      error: null,
      lastAttempt: 0,
      totalAttempts: 0,
    })
  }, [])

  return {
    ...state,
    executeApiCall,
    reset,
    isRetrying: state.loading && state.lastAttempt > 0,
  }
}

// Hook specializzato per Supabase
export function useSupabaseWithRetry<T>() {
  const apiHook = useApiWithRetry<T | null>()

  const executeSupabaseCall = useCallback(
    async (
      supabaseCall: () => Promise<{ data: T | null; error: Error | null }>,
      options: ApiCallOptions = {},
    ): Promise<T | null> => {
      return apiHook.executeApiCall(
        async () => {
          const { data, error } = await supabaseCall()
          if (error) {
            throw error
          }
          return data
        },
        { ...options, context: options.context || 'supabase-call' },
      )
    },
    [apiHook],
  )

  return {
    ...apiHook,
    executeSupabaseCall,
  }
}
