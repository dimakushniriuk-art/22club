'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { supabase } from '@/lib/supabase/client'
import { shouldInvalidateQueryOnSessionResume } from '@/lib/session-stability/session-query-invalidation'
import { PLATFORM_DATA_PULSE_MS } from '@/lib/session-stability/platform-sync-constants'

export { PLATFORM_DATA_PULSE_MS } from '@/lib/session-stability/platform-sync-constants'

/**
 * Poll leggero: sessione Supabase + invalidazione query “critiche” (stessa famiglia del post-risveglio tab).
 * Nessuna soglia “dopo X minuti”: solo tab visibile e login effettivo.
 */
export function SessionDataPulse() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id
  const wasHiddenRef = useRef(false)

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return

    const pulse = () => {
      if (document.visibilityState !== 'visible') return
      void supabase.auth.getSession()
      void queryClient.invalidateQueries({
        predicate: (q) => shouldInvalidateQueryOnSessionResume(q.queryKey as readonly unknown[]),
      })
    }

    const id = window.setInterval(pulse, PLATFORM_DATA_PULSE_MS)

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHiddenRef.current = true
        return
      }
      if (document.visibilityState === 'visible' && wasHiddenRef.current) {
        wasHiddenRef.current = false
        pulse()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    if (document.visibilityState === 'visible') {
      const t = window.setTimeout(pulse, 800)
      return () => {
        window.clearInterval(id)
        document.removeEventListener('visibilitychange', onVisibility)
        window.clearTimeout(t)
      }
    }

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [userId, queryClient])

  return null
}
