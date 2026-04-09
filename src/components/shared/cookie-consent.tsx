'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { X, ChevronDown, ChevronUp, Cookie } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getCookiePreferences,
  OPEN_COOKIE_PREFERENCES_EVENT,
  saveCookiePreferences,
  type CookiePreferencesV1,
} from '@/lib/cookie-consent-storage'

function collectFocusables(panel: HTMLElement): HTMLElement[] {
  const nodes = panel.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute('disabled') && !el.closest('[aria-hidden="true"]'),
  )
}

function shouldReloadForSentry(
  prev: CookiePreferencesV1 | null,
  next: CookiePreferencesV1,
): boolean {
  if (prev == null) return next.analytics === true
  return prev.analytics !== next.analytics
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [draftAnalytics, setDraftAnalytics] = useState(false)
  const [draftFunctional, setDraftFunctional] = useState(true)
  const [liveMessage, setLiveMessage] = useState('')

  const modalPanelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<Element | null>(null)

  useEffect(() => {
    setMounted(true)
    const p = getCookiePreferences()
    setBannerOpen(p == null)
    if (p) {
      setDraftAnalytics(p.analytics)
      setDraftFunctional(p.functional)
    }
  }, [])

  const openManage = useCallback(() => {
    const p = getCookiePreferences()
    setDraftAnalytics(p?.analytics ?? false)
    setDraftFunctional(p?.functional ?? true)
    setManageOpen(true)
    setCustomizeOpen(false)
  }, [])

  useEffect(() => {
    const onOpenRequest = () => openManage()
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, onOpenRequest)
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, onOpenRequest)
  }, [openManage])

  useEffect(() => {
    if (!manageOpen) return
    const panel = modalPanelRef.current
    if (!panel) return

    previouslyFocusedRef.current = document.activeElement

    const focusFirst = () => {
      const list = collectFocusables(panel)
      window.requestAnimationFrame(() => list[0]?.focus())
    }
    focusFirst()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setManageOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        collectFocusables(panel)[0]?.focus()
        return
      }
      const list = collectFocusables(panel)
      if (list.length === 0) return
      const firstEl = list[0]
      const lastEl = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      const prev = previouslyFocusedRef.current
      if (prev instanceof HTMLElement) {
        try {
          prev.focus()
        } catch {
          /* ignore */
        }
      }
    }
  }, [manageOpen])

  const applyAndPersist = useCallback((next: Omit<CookiePreferencesV1, 'v' | 'decidedAt'>) => {
    const prev = getCookiePreferences()
    const saved = saveCookiePreferences(next)
    setBannerOpen(false)
    setManageOpen(false)
    setCustomizeOpen(false)
    const willReload = typeof window !== 'undefined' && shouldReloadForSentry(prev, saved)
    if (willReload) {
      window.location.reload()
      return
    }
    setLiveMessage('Preferenze cookie salvate.')
    window.setTimeout(() => setLiveMessage(''), 5000)
  }, [])

  const handleNecessaryOnly = useCallback(() => {
    applyAndPersist({ analytics: false, functional: true })
  }, [applyAndPersist])

  const handleAcceptAll = useCallback(() => {
    applyAndPersist({ analytics: true, functional: true })
  }, [applyAndPersist])

  const handleSaveCustom = useCallback(() => {
    applyAndPersist({ analytics: draftAnalytics, functional: draftFunctional })
  }, [applyAndPersist, draftAnalytics, draftFunctional])

  if (!mounted) return null

  const panel = (opts: { variant: 'banner' | 'modal' }) => (
    <div
      ref={opts.variant === 'modal' ? modalPanelRef : undefined}
      className={cn(
        'border border-white/10 bg-background-secondary/95 text-text-primary shadow-2xl backdrop-blur-md',
        opts.variant === 'banner'
          ? 'relative mx-auto max-w-4xl rounded-2xl p-4 sm:p-6'
          : 'relative w-full max-w-lg rounded-2xl p-5 sm:p-6',
      )}
      role={opts.variant === 'modal' ? 'dialog' : 'region'}
      aria-modal={opts.variant === 'modal' ? true : undefined}
      aria-labelledby="cookie-consent-title"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-center md:text-left">
          <h3
            id="cookie-consent-title"
            className="flex items-center justify-center gap-2 text-base font-semibold text-white md:justify-start"
          >
            <Cookie className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            Utilizziamo cookie e dati locali
          </h3>
          <p className="readable-prose-max mx-auto text-sm leading-relaxed text-text-secondary md:mx-0">
            I <strong className="font-medium text-text-primary">cookie tecnici</strong> (es.
            sessione Supabase) sono necessari per accedere all&apos;account. Con il tuo consenso
            possiamo attivare{' '}
            <strong className="font-medium text-text-primary">statistiche e diagnostica</strong>{' '}
            (es. Sentry: replay e performance) e alcune{' '}
            <strong className="font-medium text-text-primary">funzioni opzionali</strong> (es.
            suggerimento installazione app). Dettagli in{' '}
            <Link
              href="/privacy#cookie-policy"
              className="text-primary underline hover:text-primary/90"
            >
              Privacy e Cookie Policy
            </Link>
            .
          </p>

          <button
            type="button"
            onClick={() => setCustomizeOpen((o) => !o)}
            className="mx-auto flex min-h-[44px] items-center gap-1 text-sm font-medium text-primary hover:underline md:mx-0 md:min-h-0 touch-manipulation"
            aria-expanded={customizeOpen}
          >
            Personalizza
            {customizeOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {customizeOpen ? (
            <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
              <label className="flex cursor-pointer items-start gap-3 touch-manipulation">
                <input
                  type="checkbox"
                  checked={draftAnalytics}
                  onChange={(e) => setDraftAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Analitica e diagnostica</span> —
                  migliora stabilità e qualità del servizio (Sentry: errori, session replay
                  campionato, metriche).
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 touch-manipulation">
                <input
                  type="checkbox"
                  checked={draftFunctional}
                  onChange={(e) => setDraftFunctional(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Funzionalità opzionali</span> —
                  es. suggerimento &quot;Aggiungi alla schermata Home&quot; e preferenze salvate sul
                  dispositivo.
                </span>
              </label>
              <Button
                type="button"
                onClick={handleSaveCustom}
                className="w-full min-h-[44px] bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              >
                Salva preferenze
              </Button>
            </div>
          ) : null}
        </div>

        {!customizeOpen ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:flex-col md:shrink-0">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] border-white/15 bg-transparent text-text-primary hover:bg-white/5"
              onClick={handleNecessaryOnly}
            >
              Solo necessari
            </Button>
            <Button
              type="button"
              className="w-full min-h-[44px] bg-gradient-to-r from-teal-600 to-cyan-600 font-semibold text-white"
              onClick={handleAcceptAll}
            >
              Accetta tutto
            </Button>
          </div>
        ) : null}
      </div>

      {opts.variant === 'banner' ? (
        <button
          type="button"
          onClick={handleNecessaryOnly}
          className="absolute right-3 top-3 min-h-[44px] min-w-[44px] rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary touch-manipulation sm:right-4 sm:top-4"
          aria-label="Chiudi e accetta solo cookie necessari"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setManageOpen(false)}
          className="absolute right-3 top-3 min-h-[44px] min-w-[44px] rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary touch-manipulation"
          aria-label="Chiudi"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {bannerOpen ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-[110] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 motion-reduce:animate-none animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="region"
          aria-label="Consenso cookie"
        >
          {panel({ variant: 'banner' })}
        </div>
      ) : null}

      {manageOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onClick={() => setManageOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
            {panel({ variant: 'modal' })}
          </div>
        </div>
      ) : null}
    </>
  )
}
