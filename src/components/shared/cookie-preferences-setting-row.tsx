'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Cookie, ExternalLink } from 'lucide-react'
import { requestOpenCookiePreferences } from '@/lib/cookie-consent-storage'

type CookiePreferencesSettingRowProps = {
  /** Variante compatta per footer pagine dense */
  compact?: boolean
}

/**
 * Blocco riusabile: link a Privacy/Cookie Policy + apertura pannello preferenze (banner globale).
 */
export function CookiePreferencesSettingRow({ compact = false }: CookiePreferencesSettingRowProps) {
  return (
    <div
      className={
        compact
          ? 'rounded-lg border border-white/10 bg-white/[0.02] p-4'
          : 'rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Cookie className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">Cookie e dati sul dispositivo</p>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Gestisci analitica (Sentry) e funzioni opzionali. I cookie di sessione restano necessari per
              l&apos;accesso.{' '}
              <Link
                href="/privacy#cookie-policy"
                className="inline-flex items-center gap-0.5 text-primary underline hover:text-primary/90"
              >
                Cookie Policy
                <ExternalLink className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
              </Link>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full shrink-0 border-white/15 bg-transparent min-h-[44px] sm:w-auto"
          onClick={() => requestOpenCookiePreferences()}
        >
          Preferenze cookie
        </Button>
      </div>
    </div>
  )
}
