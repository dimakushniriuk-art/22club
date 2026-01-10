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

export function AthleteStatsCards({ stats }: AthleteStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card
        variant="default"
        className="group relative overflow-hidden border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 hover:from-teal-500/15 hover:to-cyan-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20 hover:scale-[1.02] [background-image:none!important]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardContent className="p-5 text-center relative">
          <div className="absolute top-2 right-2 opacity-20">
            <Calendar className="h-12 w-12 text-teal-400" />
          </div>
          <div className="text-brand mb-1 text-3xl font-bold text-white relative z-10">
            {stats.allenamenti_mese}
          </div>
          <div className="text-text-secondary text-xs font-medium relative z-10">
            Allenamenti mese
          </div>
        </CardContent>
      </Card>
      <Card
        variant="default"
        className="group relative overflow-hidden border-green-500/40 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5 hover:border-green-400/60 hover:from-green-500/15 hover:to-emerald-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 hover:scale-[1.02] [background-image:none!important]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
        <CardContent className="p-5 text-center relative">
          <div className="absolute top-2 right-2 opacity-20">
            <TrendingUp className="h-12 w-12 text-green-400" />
          </div>
          <div className="text-state-valid mb-1 text-3xl font-bold text-white relative z-10">
            {stats.lezioni_rimanenti}
          </div>
          <div className="text-text-secondary text-xs font-medium relative z-10">
            Lezioni Rimanenti
          </div>
        </CardContent>
      </Card>
      <Card
        variant="default"
        className="group relative overflow-hidden border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 hover:border-cyan-400/60 hover:from-cyan-500/15 hover:to-blue-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.02] [background-image:none!important]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />
        <CardContent className="p-5 text-center relative">
          <div className="absolute top-2 right-2 opacity-20">
            <Activity className="h-12 w-12 text-cyan-400" />
          </div>
          <div className="text-brand mb-1 text-3xl font-bold text-white relative z-10">
            {stats.allenamenti_totali}
          </div>
          <div className="text-text-secondary text-xs font-medium relative z-10">
            Totale sessioni
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
