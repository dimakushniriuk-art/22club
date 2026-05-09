'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { shouldRetryError, calculateRetryDelay } from '@/lib/retry-policy'
import { applyLightRefetchOnWindowFocusDefaults } from '@/lib/react-query/refetch-on-window-focus-defaults'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // Dati “freschi” 1 min: meno UI obsoleta dopo salvataggi/navigazione; dedup automatico di React Query.
          staleTime: 60 * 1000,
          // Se stale, ricarica al mount (cambio pagina). Focus finestra disattivato per ridurre rifetch su query pesanti.
          refetchOnMount: true,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          // Retry: fino a 2 tentativi su errori transienti (rete, 5xx, PGRST301 JWT scaduto).
          retry: (failureCount, error) => {
            if (failureCount >= 2) {
              return false
            }
            return shouldRetryError(error)
          },
          // Backoff esponenziale: 1s (ridotto da 1s, 2s, 4s)
          retryDelay: (attemptIndex) => Math.min(1000, calculateRetryDelay(attemptIndex)),
          // Mantieni i dati in cache per 10 minuti (aumentato da 5)
          // Dati in cache più a lungo = meno query al database
          gcTime: 10 * 60 * 1000, // 10 minuti (aumentato da 5)
        },
      },
    })
    applyLightRefetchOnWindowFocusDefaults(client)
    return client
  })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
