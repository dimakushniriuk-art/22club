/**
 * @fileoverview Cache in-memory per server-side utilities
 * @description
 * ⚠️ IMPORTANTE: Questo modulo è principalmente per server-side utilities.
 * Per client-side, usa React Query hooks (useAppointments, useDocuments, useClienti).
 *
 * fetchWithCache è mantenuto per:
 * - Server-side API routes
 * - Server Components (se presenti)
 * - Utility functions che non possono usare React Query
 *
 * NON usare fetchWithCache in:
 * - Client Components ('use client')
 * - React hooks
 * - Componenti che possono usare React Query
 */
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'

type CacheEntry<T> = {
  data: T
  expiresAt: number
}

interface FetchWithCacheOptions {
  ttlMs?: number
  timeoutMs?: number
  forceRefresh?: boolean
}

const cache = new Map<string, CacheEntry<unknown>>()

function withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
  if (!timeoutMs) {
    return promise
  }

  let timeoutId: NodeJS.Timeout | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}

export async function fetchWithCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: FetchWithCacheOptions = {},
): Promise<T> {
  // TTL esplicito richiesto: warning in dev mode se non passato
  if (process.env.NODE_ENV === 'development' && options.ttlMs === undefined) {
    console.warn(
      `[fetchWithCache] TTL non esplicito per key "${key}". Usa TTL appropriato: 5min per dati statici, 30s per dati dinamici.`,
    )
  }

  // Default TTL: 30s per dati dinamici (più conservativo del precedente 60s)
  // NOTA: Le funzioni wrapper dovrebbero sempre passare TTL esplicito
  const { ttlMs = 30_000, timeoutMs, forceRefresh = false } = options
  const cachedEntry = cache.get(key) as CacheEntry<T> | undefined
  const now = Date.now()

  if (!forceRefresh && cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.data
  }

  const data = await withTimeout(fn(), timeoutMs)
  cache.set(key, { data, expiresAt: now + ttlMs })
  return data
}

type AppointmentRow = Tables<'appointments'>
type ProfileRow = Tables<'profiles'>
type DocumentRow = Tables<'documents'>

// ============================================================================
// ⚠️ SERVER-SIDE ONLY FUNCTIONS
// ============================================================================
// Le seguenti funzioni sono deprecate per uso client-side.
// Per client-side, usa React Query hooks:
// - useAppointments() invece di getAppointmentsCached()
// - useDocuments() invece di getDocumentsCached()
// - useClienti() invece di getClientiStatsCached()
// ============================================================================

// TTL per appointments: 30s (dati dinamici - cambiano frequentemente)
const APPOINTMENTS_TTL_MS = 30_000 // 30 secondi

/**
 * @deprecated Per client-side, usa useAppointments() hook con React Query
 * Questa funzione è mantenuta solo per compatibilità server-side
 */
export async function getAppointmentsCached(ttlMs?: number) {
  const supabase = createClient()
  return fetchWithCache<AppointmentRow[]>(
    'appointments',
    async () => {
      const { data, error } = await supabase.from('appointments').select('*')
      if (error) throw error
      return data as AppointmentRow[]
    },
    { ttlMs: ttlMs ?? APPOINTMENTS_TTL_MS },
  )
}

// TTL per clienti stats: 5min (dati statici - cambiano raramente)
const CLIENTI_STATS_TTL_MS = 5 * 60 * 1000 // 5 minuti

/**
 * @deprecated Per client-side, usa useClienti() hook con React Query
 * Questa funzione è mantenuta solo per compatibilità server-side
 */
export async function getClientiStatsCached(ttlMs?: number) {
  const supabase = createClient()
  return fetchWithCache<Pick<ProfileRow, 'role' | 'created_at'>[]>(
    'clienti-stats',
    async () => {
      const { data, error } = await supabase.from('profiles').select('role, created_at')
      if (error) throw error
      return data as Pick<ProfileRow, 'role' | 'created_at'>[]
    },
    { ttlMs: ttlMs ?? CLIENTI_STATS_TTL_MS },
  )
}

// TTL per documents: 30s (dati dinamici - cambiano quando si caricano nuovi documenti)
const DOCUMENTS_TTL_MS = 30_000 // 30 secondi

/**
 * @deprecated Per client-side, usa useDocuments() hook con React Query
 * Questa funzione è mantenuta solo per compatibilità server-side
 */
export async function getDocumentsCached(ttlMs?: number) {
  const supabase = createClient()
  return fetchWithCache<DocumentRow[]>(
    'documents',
    async () => {
      const { data, error } = await supabase.from('documents').select('*')
      if (error) throw error
      return data as DocumentRow[]
    },
    { ttlMs: ttlMs ?? DOCUMENTS_TTL_MS },
  )
}

// Funzione per invalidare la cache
export function invalidateCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
