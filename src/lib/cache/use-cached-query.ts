/**
 * Hook per query con caching avanzato
 * Combina React Query con localStorage cache per persistenza
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { localStorageCache } from './local-storage-cache'
import { useMemo } from 'react'

interface UseCachedQueryOptions<T> {
  queryKey: string[]
  queryFn: () => Promise<T>
  staleTime?: number // Tempo in ms prima che i dati siano considerati stale
  cacheTime?: number // Tempo in ms prima che i dati vengano rimossi dalla cache
  enabled?: boolean
  localStorageKey?: string // Chiave per localStorage (opzionale)
  localStorageTtl?: number // TTL per localStorage in ms (default: 5 minuti)
}

export function useCachedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minuti
  cacheTime = 10 * 60 * 1000, // 10 minuti
  enabled = true,
  localStorageKey,
  localStorageTtl = 5 * 60 * 1000, // 5 minuti
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
    // Refetch on mount se i dati sono stale
    refetchOnMount: true,
    // Non refetch su window focus per performance
    refetchOnWindowFocus: false,
  })

  return query
}
