// ============================================================
// Componente Tab Progressi Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  ArrowLeft,
  Scale,
  ArrowUpRight,
} from 'lucide-react'

const SECTION_KICKER =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary sm:text-[11px] sm:tracking-[0.18em]'

const SECTION_RULE = 'h-px w-full bg-gradient-to-r from-transparent via-white/14 to-transparent'

const KPI_WRAP =
  'group relative flex min-h-[88px] flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] transition-all duration-300 hover:border-white/[0.16] hover:shadow-[0_16px_48px_-20px_rgba(0,0,0,0.75)] sm:min-h-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4'

const KPI_ICON_WRAP =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-transform duration-300 group-hover:scale-[1.04]'

const DETAIL_LINK_BASE =
  'group relative flex min-h-[44px] min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 sm:min-h-[148px] sm:justify-between sm:p-5'

interface AthleteProgressTabProps {
  athleteId: string
  stats: {
    peso_attuale: number | null
    allenamenti_totali: number
    allenamenti_mese: number
  }
  loadError?: string | null
  /** Mostra due accessi (misurazioni / statistiche) sotto i KPI; lo storico è nel tab principale. */
  showDetailLinksBelowKpi?: boolean
}

export function AthleteProgressTab({
  athleteId,
  stats,
  loadError = null,
  showDetailLinksBelowKpi = false,
}: AthleteProgressTabProps) {
  const progressiBase = `/dashboard/atleti/${athleteId}/progressi`

  return (
    <Card variant="default" className="relative overflow-hidden border-white/[0.09]">
      <div
        className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-primary/[0.09] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-cyan-500/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-purple-500/[0.05] blur-3xl"
        aria-hidden
      />

      <CardContent className="relative z-10 space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.09] to-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className={SECTION_KICKER}>Riepilogo</p>
              <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary/90">
                Profilo atleta
              </span>
            </div>
            <h3 className="text-text-primary text-xl font-semibold tracking-tight sm:text-2xl">
              Metriche e accessi
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary/95 sm:text-[15px]">
              Sintesi da misurazioni e sessioni; usa le scorciatoie sotto per trend e carichi. Storico allenamenti dal tab
              Storico.
            </p>
          </div>
        </div>

        {loadError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {loadError}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className={SECTION_RULE} aria-hidden />
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]" />
            <p className={SECTION_KICKER}>Indicatori</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 md:gap-4">
            <div className={cn(KPI_WRAP, 'border-t-[3px] border-t-primary/50')}>
              <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
                <div className={cn(KPI_ICON_WRAP, 'text-primary')}>
                  <TrendingUp className="h-[18px] w-[18px]" aria-hidden />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/90">
                    Peso attuale
                  </p>
                  <p className="text-xs text-text-tertiary">Ultimo valore noto</p>
                </div>
              </div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary sm:text-3xl">
                {stats.peso_attuale != null ? `${stats.peso_attuale} kg` : '—'}
              </p>
            </div>
            <div className={cn(KPI_WRAP, 'border-t-[3px] border-t-cyan-400/50')}>
              <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
                <div className={cn(KPI_ICON_WRAP, 'text-cyan-400')}>
                  <Activity className="h-[18px] w-[18px]" aria-hidden />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/90">
                    Allenamenti totali
                  </p>
                  <p className="text-xs text-text-tertiary">Sessioni completate</p>
                </div>
              </div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary sm:text-3xl">
                {stats.allenamenti_totali}
              </p>
            </div>
            <div className={cn(KPI_WRAP, 'border-t-[3px] border-t-amber-400/55')}>
              <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
                <div className={cn(KPI_ICON_WRAP, 'text-amber-400')}>
                  <Award className="h-[18px] w-[18px]" aria-hidden />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/90">
                    Questo mese
                  </p>
                  <p className="text-xs text-text-tertiary">Nel mese in corso</p>
                </div>
              </div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary sm:text-3xl">
                {stats.allenamenti_mese}
              </p>
            </div>
          </div>
        </div>

        {showDetailLinksBelowKpi ? (
          <div className="space-y-4 pt-1">
            <div className={SECTION_RULE} aria-hidden />
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/90" />
              <p className={SECTION_KICKER}>Approfondisci</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <Link
                href={`${progressiBase}/misurazioni`}
                prefetch
                className={cn(
                  DETAIL_LINK_BASE,
                  'border-white/[0.1] bg-gradient-to-br from-white/[0.06] via-transparent to-transparent hover:border-white/[0.18] hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] focus-visible:ring-white/35',
                )}
                aria-label="Apri misurazioni corpo"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      KPI_ICON_WRAP,
                      'h-11 w-11 text-white/95 group-hover:border-white/[0.2] group-hover:bg-white/[0.09]',
                    )}
                  >
                    <Scale className="h-[18px] w-[18px]" aria-hidden />
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-text-tertiary opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-white"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="block text-base font-semibold tracking-tight text-text-primary">Misurazioni</span>
                  <span className="block text-sm leading-snug text-text-secondary/95">
                    Peso, composizione corporea e trend nel tempo.
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition group-hover:text-white">
                  Apri sezione
                  <ArrowLeft className="h-3 w-3 rotate-180" aria-hidden />
                </span>
              </Link>
              <Link
                href={`${progressiBase}/allenamenti`}
                prefetch
                className={cn(
                  DETAIL_LINK_BASE,
                  'border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.12] via-cyan-500/[0.03] to-transparent hover:border-cyan-400/35 hover:shadow-[0_20px_50px_-20px_rgba(34,211,238,0.12)] focus-visible:ring-cyan-400/45',
                )}
                aria-label="Apri statistiche allenamenti"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      KPI_ICON_WRAP,
                      'h-11 w-11 border-cyan-400/25 bg-cyan-500/10 text-cyan-300 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/[0.16]',
                    )}
                  >
                    <Activity className="h-[18px] w-[18px]" aria-hidden />
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-cyan-400/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-300"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="block text-base font-semibold tracking-tight text-text-primary">Statistiche</span>
                  <span className="block text-sm leading-snug text-text-secondary/95">
                    Carichi, volumi e progressi per esercizio.
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-400/90 transition group-hover:text-cyan-300">
                  Apri statistiche
                  <ArrowLeft className="h-3 w-3 rotate-180" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
