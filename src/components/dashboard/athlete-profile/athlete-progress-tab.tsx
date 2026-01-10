// ============================================================
// Componente Tab Progressi Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { BarChart3, TrendingUp, Activity, Award, ArrowLeft } from 'lucide-react'

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
      className="relative overflow-hidden border-teal-500/20 hover:border-teal-400/50 transition-all duration-200 !bg-transparent"
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-text-primary text-xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-400" />
              Progressi e Statistiche
            </h3>
            <p className="text-text-secondary text-sm">
              Analisi dettagliata dei progressi e delle performance dell&apos;atleta
            </p>
          </div>
          <Link href={`/dashboard/atleti/${athleteId}/progressi`}>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200">
              Dettagli completi
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </Link>
        </div>

        {/* Statistiche rapide progressi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-teal-500/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-500/20 text-teal-400 rounded-lg p-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-text-secondary text-xs">Peso Attuale</p>
            </div>
            <p className="text-text-primary text-xl font-bold">
              {stats.peso_attuale ? `${stats.peso_attuale} kg` : 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-teal-500/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyan-500/20 text-cyan-400 rounded-lg p-2">
                <Activity className="h-4 w-4" />
              </div>
              <p className="text-text-secondary text-xs">Allenamenti Totali</p>
            </div>
            <p className="text-text-primary text-xl font-bold">{stats.allenamenti_totali}</p>
          </div>
          <div className="p-4 rounded-lg border border-teal-500/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-500/20 text-green-400 rounded-lg p-2">
                <Award className="h-4 w-4" />
              </div>
              <p className="text-text-secondary text-xs">Questo Mese</p>
            </div>
            <p className="text-text-primary text-xl font-bold">{stats.allenamenti_mese}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
