// ============================================================
// Componente Statistiche Rapide Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { Calendar, TrendingUp, Activity } from 'lucide-react'

interface AthleteStatsCardsProps {
  stats: {
    allenamenti_mese: number
    progress_score: number
    allenamenti_totali: number
    lezioni_rimanenti: number
  }
}

const statCardBase =
  'relative overflow-hidden rounded-xl border bg-background-secondary/80 [background-image:none!important] transition-all duration-200 active:scale-[0.98]'

export function AthleteStatsCards({ stats }: AthleteStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Card
        variant="default"
        className={`${statCardBase} border-teal-500/30 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10`}
      >
        <CardContent className="p-3 sm:p-4 text-center relative">
          <div className="absolute top-1.5 right-1.5 opacity-25">
            <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white relative z-10 tabular-nums">
            {stats.allenamenti_mese}
          </div>
          <div className="text-text-secondary text-[11px] sm:text-xs font-medium relative z-10 mt-0.5 leading-tight">
            Allenamenti mese
          </div>
        </CardContent>
      </Card>
      <Card
        variant="default"
        className={`${statCardBase} border-green-500/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10`}
      >
        <CardContent className="p-3 sm:p-4 text-center relative">
          <div className="absolute top-1.5 right-1.5 opacity-25">
            <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white relative z-10 tabular-nums">
            {stats.lezioni_rimanenti}
          </div>
          <div className="text-text-secondary text-[11px] sm:text-xs font-medium relative z-10 mt-0.5 leading-tight">
            Lezioni rimanenti
          </div>
        </CardContent>
      </Card>
      <Card
        variant="default"
        className={`${statCardBase} border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10`}
      >
        <CardContent className="p-3 sm:p-4 text-center relative">
          <div className="absolute top-1.5 right-1.5 opacity-25">
            <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white relative z-10 tabular-nums">
            {stats.allenamenti_totali}
          </div>
          <div className="text-text-secondary text-[11px] sm:text-xs font-medium relative z-10 mt-0.5 leading-tight">
            Totale sessioni
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
