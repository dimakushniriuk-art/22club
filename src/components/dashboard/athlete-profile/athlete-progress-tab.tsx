// ============================================================
// Componente Tab Progressi Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Card, CardContent, Button } from '@/components/ui'
import { BarChart3, TrendingUp, Activity, Award, ArrowLeft } from 'lucide-react'

const DS_KPI_CARD =
  'rounded-lg border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 transition'

interface AthleteProgressTabProps {
  athleteId: string
  stats: {
    peso_attuale: number | null
    allenamenti_totali: number
    allenamenti_mese: number
  }
  loadError?: string | null
  /** Su `/dashboard/atleti/[id]/progressi` nascondere il CTA verso la stessa pagina */
  showDetailsLink?: boolean
}

export function AthleteProgressTab({
  athleteId,
  stats,
  loadError = null,
  showDetailsLink = true,
}: AthleteProgressTabProps) {
  return (
    <Card variant="default" className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-text-primary text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Progressi e Statistiche
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              Analisi dettagliata dei progressi e delle performance dell&apos;atleta
            </p>
            <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
          </div>
          {showDetailsLink ? (
            <Link href={`/dashboard/atleti/${athleteId}/progressi`}>
              <Button variant="default" size="sm">
                Dettagli completi
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </Link>
          ) : null}
        </div>

        {loadError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {loadError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={DS_KPI_CARD}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
                Peso Attuale
              </p>
            </div>
            <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              {stats.peso_attuale != null ? `${stats.peso_attuale} kg` : 'N/A'}
            </p>
          </div>
          <div className={DS_KPI_CARD}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
                Allenamenti Totali
              </p>
            </div>
            <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              {stats.allenamenti_totali}
            </p>
          </div>
          <div className={DS_KPI_CARD}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-amber-400">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
                Questo Mese
              </p>
            </div>
            <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              {stats.allenamenti_mese}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
