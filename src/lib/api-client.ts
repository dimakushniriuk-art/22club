/**
 * Helper per gestire chiamate API con fallback automatico
 *
 * Strategia:
 * - Web: Usa API routes quando disponibili (migliore sicurezza, validazione server-side)
 * - Mobile (Capacitor): Usa Supabase client direttamente (API routes non disponibili)
 */

import { Capacitor } from '@capacitor/core'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:api-client')

export type ApiCallOptions = {
  /**
   * Su web: se l'API risponde con errore HTTP o `{ error }` nel body, lancia invece
   * di usare il fallback Supabase (evita PGRST116 / RLS quando il server ha già risposto).
   */
  throwIfApiError?: boolean
}

/**
 * Verifica se siamo su piattaforma nativa (Capacitor)
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return Capacitor.isNativePlatform()
}

/**
 * Verifica se le API routes sono disponibili
 *
 * Su web: sempre disponibili
 * Su mobile: non disponibili (spostate durante build)
 */
export function isApiAvailable(): boolean {
  // Su mobile, le API routes non sono disponibili
  if (isNativePlatform()) {
    return false
  }

  // Su web, le API routes sono disponibili
  return true
}

/**
 * Esegue una chiamata API con fallback automatico a Supabase
 *
 * @param endpoint - Endpoint API (es. '/api/communications/list')
 * @param options - Opzioni fetch
 * @param fallbackFn - Funzione fallback da eseguire se API non disponibile (mobile)
 *
 * @example
 * ```typescript
 * const data = await apiCall(
 *   '/api/communications/list',
 *   { method: 'GET' },
 *   async () => {
 *     // Fallback Supabase
 *     const { data } = await supabase.from('communications').select('*')
 *     return data
 *   }
 * )
 * ```
 */
function messageFromApiErrorBody(text: string, status: number): string {
  let msg = `Richiesta fallita (${status})`
  try {
    const j = JSON.parse(text) as {
      error?: unknown
      supabase?: { code?: string; message?: string; details?: string | null }
    }
    if (j?.error != null) {
      msg = typeof j.error === 'string' ? j.error : JSON.stringify(j.error)
    }
    const sb = j?.supabase
    if (sb && (sb.code || sb.message || sb.details)) {
      const extra = [sb.code, sb.message, sb.details].filter(Boolean).join(' — ')
      if (extra) msg = `${msg} (${extra})`
    }
  } catch {
    const t = text?.trim()
    if (t) msg = t.length > 300 ? `${t.slice(0, 300)}…` : t
  }
  return msg
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn: () => Promise<T>,
  callOpts?: ApiCallOptions,
): Promise<T> {
  const strictApi = Boolean(callOpts?.throwIfApiError && isApiAvailable())

  // Se siamo su mobile o API non disponibili, usa fallback
  if (!isApiAvailable()) {
    logger.debug('API non disponibile, usando fallback Supabase', { endpoint })
    return fallbackFn()
  }

  try {
    const isGet = (options.method ?? 'GET').toUpperCase() === 'GET'
    const response = await fetch(endpoint, {
      ...options,
      cache: isGet ? 'no-store' : options.cache,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (strictApi) {
        const errText = await response.text()
        throw new Error(messageFromApiErrorBody(errText, response.status))
      }
      logger.warn('API call failed, using fallback', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
      })
      return fallbackFn()
    }

    const text = await response.text()
    if (!text || text.trim().length === 0) {
      if (strictApi) {
        throw new Error('Risposta API vuota')
      }
      logger.warn('API returned empty response, using fallback', { endpoint })
      return fallbackFn()
    }

    const data = JSON.parse(text)

    // Gestisci risposte con struttura { data, error }
    if (data.error) {
      if (strictApi) {
        const msg =
          typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
        throw new Error(msg)
      }
      logger.warn('API returned error, using fallback', {
        endpoint,
        error: data.error,
      })
      return fallbackFn()
    }

    // Restituisci data se presente, altrimenti l'intero oggetto
    return (data.data !== undefined ? data.data : data) as T
  } catch (error) {
    if (strictApi) {
      throw error instanceof Error ? error : new Error(String(error))
    }
    logger.warn('API call error, using fallback', {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
    })
    return fallbackFn()
  }
}

/**
 * Helper per chiamate GET
 */
export async function apiGet<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> | (() => Promise<T>),
  fallbackFn?: () => Promise<T>,
): Promise<T> {
  // Supporta entrambi gli ordini: (endpoint, params, fallback) o (endpoint, fallback)
  if (typeof params === 'function') {
    fallbackFn = params as () => Promise<T>
    params = {}
  }
  if (!fallbackFn) {
    throw new Error('fallbackFn è richiesto')
  }
  const url = new URL(
    endpoint,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  )
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  return apiCall<T>(url.pathname + url.search, { method: 'GET' }, fallbackFn)
}

/**
 * Helper per chiamate POST
 */
export async function apiPost<T>(
  endpoint: string,
  body: unknown | (() => Promise<T>),
  fallbackFn?: () => Promise<T>,
  callOpts?: ApiCallOptions,
): Promise<T> {
  // Supporta entrambi gli ordini: (endpoint, body, fallback) o (endpoint, fallback)
  let finalBody: unknown = body
  let finalFallbackFn: () => Promise<T>
  if (typeof body === 'function') {
    finalFallbackFn = body as () => Promise<T>
    finalBody = undefined
  } else {
    if (!fallbackFn) {
      throw new Error('fallbackFn è richiesto')
    }
    finalFallbackFn = fallbackFn
  }
  return apiCall<T>(
    endpoint,
    {
      method: 'POST',
      body: finalBody ? JSON.stringify(finalBody) : undefined,
    },
    finalFallbackFn,
    callOpts,
  )
}

/**
 * Helper per chiamate PUT
 */
export async function apiPut<T>(
  endpoint: string,
  body: unknown | (() => Promise<T>),
  fallbackFn?: () => Promise<T>,
  callOpts?: ApiCallOptions,
): Promise<T> {
  // Supporta entrambi gli ordini: (endpoint, body, fallback) o (endpoint, fallback)
  let finalBody: unknown = body
  let finalFallbackFn: () => Promise<T>
  if (typeof body === 'function') {
    finalFallbackFn = body as () => Promise<T>
    finalBody = undefined
  } else {
    if (!fallbackFn) {
      throw new Error('fallbackFn è richiesto')
    }
    finalFallbackFn = fallbackFn
  }
  return apiCall<T>(
    endpoint,
    {
      method: 'PUT',
      body: finalBody ? JSON.stringify(finalBody) : undefined,
    },
    finalFallbackFn,
    callOpts,
  )
}

/**
 * Helper per chiamate DELETE
 */
export async function apiDelete<T>(endpoint: string, fallbackFn: () => Promise<T>): Promise<T> {
  return apiCall<T>(endpoint, { method: 'DELETE' }, fallbackFn)
}
