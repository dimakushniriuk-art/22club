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
            // Dati considerati freschi per 5 minuti (ottimizzazione performance)
            // Riduce drasticamente refetch inutili durante navigazione
            staleTime: 5 * 60 * 1000, // 5 minuti (da 30 secondi)
            // Non refetch automatico se dati sono ancora freschi (staleTime)
            // Riduce query duplicate durante navigazione
            refetchOnMount: false, // Cambiato da true
            // Non refetch quando la finestra riprende focus (migliora UX)
            // I dati sono ancora freschi grazie a staleTime più lungo
            refetchOnWindowFocus: false, // Cambiato da true
            // Refetch su riconnessione di rete (mantenuto per dati aggiornati)
            refetchOnReconnect: true,
            // Retry intelligente: solo su errori transienti (network, 5xx), max 1 tentativo
            // Ridotto da 3 a 1 per risposta più veloce su errori
            retry: (failureCount, error) => {
              // Max 1 tentativo (ridotto da 3)
              if (failureCount >= 1) {
                return false
              }
              // Ritenta solo se è un errore transiente
              return shouldRetryError(error)
            },
            // Backoff esponenziale: 1s (ridotto da 1s, 2s, 4s)
            retryDelay: (attemptIndex) => Math.min(1000, calculateRetryDelay(attemptIndex)),
            // Mantieni i dati in cache per 10 minuti (aumentato da 5)
            // Dati in cache più a lungo = meno query al database
            gcTime: 10 * 60 * 1000, // 10 minuti (aumentato da 5)
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
