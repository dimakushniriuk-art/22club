'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { shouldRetryError, calculateRetryDelay } from '@/lib/retry-policy'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dati considerati freschi per 30 secondi (bilanciamento performance/aggiornamento)
            staleTime: 30 * 1000, // 30 secondi
            // Refetch automatico quando il componente viene montato (se dati stantii)
            refetchOnMount: true,
            // Refetch quando la finestra riprende focus (utente torna alla tab)
            refetchOnWindowFocus: true,
            // Refetch su riconnessione di rete
            refetchOnReconnect: true,
            // Retry intelligente: solo su errori transienti (network, 5xx), max 3 tentativi
            retry: (failureCount, error) => {
              // Max 3 tentativi
              if (failureCount >= 3) {
                return false
              }
              // Ritenta solo se è un errore transiente
              return shouldRetryError(error)
            },
            // Backoff esponenziale: 1s, 2s, 4s (max 30s)
            retryDelay: (attemptIndex) => calculateRetryDelay(attemptIndex),
            // Mantieni i dati in cache per 5 minuti
            gcTime: 5 * 60 * 1000, // 5 minuti (precedentemente cacheTime)
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
