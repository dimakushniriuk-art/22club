'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Wifi, WifiOff } from 'lucide-react'

type BannerMode = 'hidden' | 'offline' | 'restored'

/**
 * Barra fissa in alto quando la connessione cade / torna (mobile e desktop).
 * Non blocca l’interazione; aria-live per lettori schermo.
 */
function initialBannerMode(): BannerMode {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'hidden'
  return navigator.onLine ? 'hidden' : 'offline'
}

export function ConnectionStatusBanner() {
  const [mode, setMode] = useState<BannerMode>(initialBannerMode)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return

    const applyNavigatorState = () => {
      setMode(navigator.onLine ? 'hidden' : 'offline')
    }

    applyNavigatorState()

    const onOffline = () => setMode('offline')
    const onOnline = () => {
      setMode((prev) => (prev === 'offline' ? 'restored' : 'hidden'))
    }

    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)

    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'restored') return
    const t = window.setTimeout(() => setMode('hidden'), 2800)
    return () => window.clearTimeout(t)
  }, [mode])

  if (mode === 'hidden') return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed left-0 right-0 z-[95] flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium shadow-md',
        'top-[env(safe-area-inset-top,0px)]',
        mode === 'offline' &&
          'border-b border-amber-500/35 bg-amber-950/95 text-amber-50 backdrop-blur-sm',
        mode === 'restored' &&
          'border-b border-emerald-500/35 bg-emerald-950/95 text-emerald-50 backdrop-blur-sm',
      )}
    >
      {mode === 'offline' ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span>Sei offline: i dati potrebbero non aggiornarsi finché non torni in rete.</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span>Connessione ripristinata.</span>
        </>
      )}
    </div>
  )
}
