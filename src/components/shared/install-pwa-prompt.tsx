'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Download, Share2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasCookieDecision, hasFunctionalConsent } from '@/lib/cookie-consent-storage'

const STORAGE_DEFERRED = '22club-pwa-install-dismissed-until'
const STORAGE_IOS = '22club-pwa-ios-hint-dismissed'
const DISMISS_MS = 21 * 24 * 60 * 60 * 1000

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isLikelyIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function dismissedDeferred(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_DEFERRED)
    if (!v) return false
    return Date.now() < Number.parseInt(v, 10)
  } catch {
    return false
  }
}

function dismissedIos(): boolean {
  try {
    return localStorage.getItem(STORAGE_IOS) === '1'
  } catch {
    return false
  }
}

/**
 * Banner non invasivo: Chrome/Edge/Android (beforeinstallprompt) o suggerimento iOS Safari.
 * Non mostrato se l’app è già in modalità standalone.
 */
export function InstallPwaPrompt() {
  const pathname = usePathname()
  const [mode, setMode] = useState<'hidden' | 'deferred' | 'ios'>('hidden')
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)

  const onAllowedRoute =
    pathname != null &&
    (pathname.startsWith('/home') || pathname.startsWith('/dashboard'))

  const consentAllowsOptional = hasCookieDecision() && hasFunctionalConsent()

  const dismiss = useCallback((kind: 'deferred' | 'ios') => {
    if (kind === 'deferred') {
      deferredRef.current = null
    }
    try {
      if (kind === 'deferred') {
        localStorage.setItem(STORAGE_DEFERRED, String(Date.now() + DISMISS_MS))
      } else {
        localStorage.setItem(STORAGE_IOS, '1')
      }
    } catch {
      /* ignore */
    }
    setMode('hidden')
  }, [])

  const onInstallClick = useCallback(async () => {
    const ev = deferredRef.current
    if (!ev) return
    try {
      await ev.prompt()
      await ev.userChoice
    } catch {
      /* ignore */
    }
    deferredRef.current = null
    setMode('hidden')
  }, [])

  /* Cattura sempre l’evento (una tantum per caricamento), così non si perde se il consenso cookie arriva dopo. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV === 'development') return
    if (isStandaloneDisplay()) return
    if (!onAllowedRoute) return

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredRef.current = e as BeforeInstallPromptEvent
      if (
        !dismissedDeferred() &&
        hasCookieDecision() &&
        hasFunctionalConsent()
      ) {
        setMode('deferred')
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [onAllowedRoute])

  /* Consenso funzionale arriva dopo: mostra install se l’evento era già stato salvato. */
  useEffect(() => {
    if (!onAllowedRoute || !consentAllowsOptional) return
    if (deferredRef.current && !dismissedDeferred()) {
      setMode('deferred')
    }
  }, [onAllowedRoute, consentAllowsOptional])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV === 'development') return
    if (isStandaloneDisplay()) return
    if (!onAllowedRoute || !consentAllowsOptional) return
    if (!isLikelyIos() || dismissedIos()) return

    const iosTimer = window.setTimeout(() => {
      setMode((m) => (m === 'deferred' ? 'deferred' : 'ios'))
    }, 12000)
    return () => window.clearTimeout(iosTimer)
  }, [onAllowedRoute, consentAllowsOptional])

  if (mode === 'hidden') return null
  if (!onAllowedRoute || !consentAllowsOptional) return null

  return (
    <div
      role="status"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[90] border-t border-white/10 bg-background-secondary/95 px-3 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md safe-area-inset-bottom',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
      )}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {mode === 'deferred' ? (
          <>
            <div className="flex min-w-0 flex-1 items-start gap-2 text-sm text-text-primary">
              <Download className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p className="leading-snug">
                Installa <span className="font-semibold">22Club</span> sul dispositivo per un accesso
                più rapido e notifiche push (se attive).
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => dismiss('deferred')}
                className="rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-white/5 touch-manipulation min-h-[44px]"
              >
                Non ora
              </button>
              <button
                type="button"
                onClick={() => void onInstallClick()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95 touch-manipulation min-h-[44px]"
              >
                Installa
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 flex-1 items-start gap-2 text-sm text-text-primary">
              <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p className="leading-snug">
                Su iPhone/iPad: tocca <strong className="font-semibold">Condividi</strong> e poi{' '}
                <strong className="font-semibold">Aggiungi alla schermata Home</strong> per usare 22Club
                come app.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismiss('ios')}
              className="self-end rounded-lg p-2 text-text-secondary hover:bg-white/5 touch-manipulation min-h-[44px] min-w-[44px] sm:self-center"
              aria-label="Chiudi suggerimento"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
