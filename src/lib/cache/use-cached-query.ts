/**
 * Hook per query con caching avanzato
 * Combina React Query con localStorage cache per persistenza
 */

import {
  AUTH_TOKEN_REFRESHED_EVENT,
  SESSION_RESUMED_EVENT,
} from '@/lib/session-stability/app-events'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { localStorageCache } from './local-storage-cache'
import { useEffect, useMemo } from 'react'

interface UseCachedQueryOptions<T> {
  queryKey: string[]
  queryFn: () => Promise<T>
  staleTime?: number // Tempo in ms prima che i dati siano considerati stale
  cacheTime?: number // Tempo in ms prima che i dati vengano rimossi dalla cache
  enabled?: boolean
  localStorageKey?: string // Chiave per localStorage (opzionale)
  localStorageTtl?: number // TTL per localStorage in ms (default: 5 minuti)
  /** Solo query leggere: altrimenti lasciare false (allineato al default globale). */
  refetchOnWindowFocus?: boolean
}

export function useCachedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 60 * 1000,
  cacheTime = 15 * 60 * 1000,
  enabled = true,
  localStorageKey,
  localStorageTtl = 5 * 60 * 1000, // 5 minuti
  refetchOnWindowFocus = false,
}: UseCachedQueryOptions<T>) {
  // Nota: queryClient potrebbe essere usato in futuro per invalidazione cache
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const queryClient = useQueryClient()
  const storageKey = localStorageKey || queryKey.join('-')

  // Recupera dati da localStorage come initialData
  const initialData = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return localStorageCache.get<T>(storageKey) || undefined
  }, [storageKey])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn()

      // Salva in localStorage dopo fetch
      if (typeof window !== 'undefined') {
        localStorageCache.set(storageKey, data, localStorageTtl)
      }

      return data
    },
    staleTime,
    gcTime: cacheTime, // React Query v5 usa gcTime invece di cacheTime
    enabled,
    initialData,
    refetchOnMount: true,
    refetchOnWindowFocus,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const refetch = () => {
      void query.refetch()
    }
    window.addEventListener(SESSION_RESUMED_EVENT, refetch)
    window.addEventListener(AUTH_TOKEN_REFRESHED_EVENT, refetch)
    return () => {
      window.removeEventListener(SESSION_RESUMED_EVENT, refetch)
      window.removeEventListener(AUTH_TOKEN_REFRESHED_EVENT, refetch)
    }
  }, [query])

  return query
}
