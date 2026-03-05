// ============================================================
// Componente Tab Progressi Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { BarChart3, TrendingUp, Activity, Award, ArrowLeft } from 'lucide-react'

const glassSurface =
  'bg-gradient-to-br from-background-secondary/38 via-background-secondary/18 to-cyan-950/22 backdrop-blur-xl'
const framePrimary = 'border border-primary/22 hover:border-primary/30 transition'
const shadowSport = 'shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
const kpiCard =
  'relative overflow-hidden rounded-2xl p-5 bg-background-secondary/20 backdrop-blur-xl border border-white/12 hover:border-white/16 transition shadow-[0_12px_28px_rgba(0,0,0,0.45)]'
const kpiTeal =
  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/22 before:via-transparent before:to-transparent before:content-['']"
const kpiCyan =
  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-400/18 before:via-transparent before:to-transparent before:content-['']"
const kpiAmber =
  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-amber-400/16 before:via-transparent before:to-transparent before:content-['']"

interface AthleteProgressTabProps {
  athleteId: string
  stats: {
    peso_attuale: number | null
    allenamenti_totali: number
    allenamenti_mese: number
  }
}

export function AthleteProgressTab({ athleteId, stats }: AthleteProgressTabProps) {
  return (
    <Card
      variant="trainer"
      className={`relative overflow-hidden rounded-3xl ${glassSurface} ${framePrimary} ${shadowSport}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <CardContent className="p-6 relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-text-primary text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Progressi e Statistiche
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              Analisi dettagliata dei progressi e delle performance dell&apos;atleta
            </p>
            <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          </div>
          <Link
            href={`/dashboard/atleti/${athleteId}/progressi`}
            className="rounded-full px-5 py-2.5 font-bold text-sm bg-gradient-to-br from-primary/30 to-cyan-500/14 border border-primary/26 shadow-[0_0_24px_rgba(2,179,191,0.16)] hover:from-primary/36 hover:to-cyan-500/18 transition inline-flex items-center gap-2"
          >
            Dettagli completi
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${kpiCard} ${kpiTeal}`}>
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/16 text-primary border border-primary/22">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary">Peso Attuale</p>
            </div>
            <p className="relative z-10 mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              {stats.peso_attuale != null ? `${stats.peso_attuale} kg` : 'N/A'}
            </p>
          </div>
          <div className={`${kpiCard} ${kpiCyan}`}>
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/16 text-primary border border-primary/22">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary">Allenamenti Totali</p>
            </div>
            <p className="relative z-10 mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              {stats.allenamenti_totali}
            </p>
          </div>
          <div className={`${kpiCard} ${kpiAmber}`}>
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/16 text-amber-300 border border-amber-400/22">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary">Questo Mese</p>
            </div>
            <p className="relative z-10 mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              {stats.allenamenti_mese}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
