'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

/**
 * Ogni cambio route dashboard: rinnova lettura sessione lato client (niente soglie temporali).
 * I dati restano aggiornati dal polso globale `SessionDataPulse` + Realtime + invalidazioni mirate.
 */
export function DashboardNavigationRecover() {
  const pathname = usePathname()
  const prevPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    const prev = prevPathnameRef.current
    prevPathnameRef.current = pathname
    if (prev !== null && prev === pathname) return
    void supabase.auth.getSession()
  }, [pathname])

  return null
}
