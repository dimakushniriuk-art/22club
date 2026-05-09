'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

type BannerMode = 'hidden' | 'offline' | 'restored'

/**
 * Barra fissa in alto quando la connessione cade / torna (mobile e desktop)
 * o quando l’auth è in stato degradato dopo errori di rete.
 */
function initialBannerMode(): BannerMode {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'hidden'
  return navigator.onLine ? 'hidden' : 'offline'
}

export function ConnectionStatusBanner() {
  const [mode, setMode] = useState<BannerMode>(initialBannerMode)
  const [initializing, setInitializing] = useState(false)
  const { authRecovery, retryAuthSession } = useAuth()

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

  const showAuthIssue =
    authRecovery !== 'idle' && typeof navigator !== 'undefined' && navigator.onLine
  const isBusy = authRecovery === 'retrying' || initializing

  const handleInitialize = async () => {
    if (isBusy) return
    setInitializing(true)
    try {
      await retryAuthSession()
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
      setInitializing(false)
    }
  }

  if (mode === 'hidden' && !showAuthIssue) return null

  if (mode === 'offline') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-none fixed left-0 right-0 z-[95] flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium shadow-md',
          'top-[env(safe-area-inset-top,0px)]',
          'border-b border-amber-500/35 bg-amber-950/95 text-amber-50 backdrop-blur-sm',
        )}
      >
        <WifiOff className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <span>Sei offline: i dati potrebbero non aggiornarsi finché non torni in rete.</span>
      </div>
    )
  }

  if (mode === 'restored') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-none fixed left-0 right-0 z-[95] flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium shadow-md',
          'top-[env(safe-area-inset-top,0px)]',
          'border-b border-emerald-500/35 bg-emerald-950/95 text-emerald-50 backdrop-blur-sm',
        )}
      >
        <Wifi className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <span>Connessione ripristinata.</span>
      </div>
    )
  }

  const handleHardReload = () => {
    if (typeof window === 'undefined') return
    window.location.reload()
  }

  if (showAuthIssue) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed left-0 right-0 z-[95] flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-center text-sm font-medium shadow-md',
          'top-[env(safe-area-inset-top,0px)]',
          'border-b border-amber-500/40 bg-amber-950/95 text-amber-50 backdrop-blur-sm',
        )}
      >
        <span className="flex min-w-0 flex-[1_1_220px] items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Connessione al server instabile: i dati potrebbero non aggiornarsi.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleInitialize()}
            className={cn(
              'rounded-md border border-amber-400/50 bg-amber-900/80 px-3 py-1.5 text-xs font-semibold text-amber-50',
              'hover:bg-amber-800/90 disabled:opacity-60',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80',
            )}
          >
            {isBusy ? 'Inizializzazione…' : 'Inizializza'}
          </button>
          <button
            type="button"
            onClick={handleHardReload}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-amber-300/45 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-50',
              'hover:bg-amber-900/70',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80',
            )}
          >
            <RefreshCw className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            Ricarica pagina
          </button>
        </div>
      </div>
    )
  }

  return null
}
