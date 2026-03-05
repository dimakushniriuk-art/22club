'use client'

/**
 * Hook di compatibilità che reindirizza al nuovo AuthProvider.
 * Storicamente questo hook era autonomo, ma ora consuma il contesto globale.
 *
 * @deprecated Usa direttamente `useAuth` da `@/providers/auth-provider`
 */
import { useAuth as useAuthContext } from '@/providers/auth-provider'

export function useAuth() {
  const context = useAuthContext()

  return {
    ...context,
    // Per compatibilità con i siti che si aspettano 'error' come stato locale
    // In questo nuovo modello l'errore è restituito dalle funzioni stesse (es. signIn)
    // o gestito globalmente nel provider se necessario.
    error: null,
  }
}
