'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000

/**
 * Richiama periodicamente `getSession` se il tab è visibile, per rinnovare il JWT
 * durante sessioni lunghe (form, wizard). Può essere usato per pagina; per utenti
 * autenticati è anche attivo globalmente in `AuthProvider`.
 */
export function useSupabaseSessionKeepalive(enabled: boolean, intervalMs = DEFAULT_INTERVAL_MS) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      void supabase.auth.getSession()
    }

    const id = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(id)
  }, [enabled, intervalMs])
}
