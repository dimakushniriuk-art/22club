'use client'

import { useWakeLock } from '@/hooks/use-wake-lock'

/** Opt-in esplicito: niente Wake Lock globale “a sorpresa”. Abilitare solo dove il prodotto lo richiede. */
const wakeLockGloballyEnabled =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WAKE_LOCK === '1'

export function WakeLockProvider({ children }: { children: React.ReactNode }) {
  useWakeLock(wakeLockGloballyEnabled)
  return <>{children}</>
}
