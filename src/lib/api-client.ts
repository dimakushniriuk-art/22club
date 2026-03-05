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
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn: () => Promise<T>,
): Promise<T> {
  // Se siamo su mobile o API non disponibili, usa fallback
  if (!isApiAvailable()) {
    logger.debug('API non disponibile, usando fallback Supabase', { endpoint })
    return fallbackFn()
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      // Se API fallisce, prova fallback
      logger.warn('API call failed, using fallback', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
      })
      return fallbackFn()
    }

    const text = await response.text()
    if (!text || text.trim().length === 0) {
      logger.warn('API returned empty response, using fallback', { endpoint })
      return fallbackFn()
    }

    const data = JSON.parse(text)
    
    // Gestisci risposte con struttura { data, error }
    if (data.error) {
      logger.warn('API returned error, using fallback', {
        endpoint,
        error: data.error,
      })
      return fallbackFn()
    }

    // Restituisci data se presente, altrimenti l'intero oggetto
    return (data.data !== undefined ? data.data : data) as T
  } catch (error) {
    // Se c'è un errore (rete, parsing, ecc.), usa fallback
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
  const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
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
  )
}

/**
 * Helper per chiamate PUT
 */
export async function apiPut<T>(
  endpoint: string,
  body: unknown | (() => Promise<T>),
  fallbackFn?: () => Promise<T>,
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
  )
}

/**
 * Helper per chiamate DELETE
 */
export async function apiDelete<T>(
  endpoint: string,
  fallbackFn: () => Promise<T>,
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'DELETE' }, fallbackFn)
}
