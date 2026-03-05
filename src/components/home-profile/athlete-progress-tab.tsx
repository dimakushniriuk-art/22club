// ============================================================
// Componente Tab Progressi Profilo Atleta Home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { TrendingUp, Activity } from 'lucide-react'

interface AthleteProgressTabProps {
  stats: {
    progress_score: number
    allenamenti_totali: number
  }
}

export function AthleteProgressTab({ stats }: AthleteProgressTabProps) {
  const router = useRouter()

  return (
    <Card
      variant="default"
      className="relative border-teal-500/30 bg-transparent [background-image:none!important]"
    >
      <CardHeader className="relative">
        <CardTitle size="md" className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          Progressi e Statistiche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background-tertiary/50 border border-teal-500/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-500/20 text-teal-400 rounded-lg p-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-text-secondary text-xs">Progress Score</p>
            </div>
            <p className="text-text-primary text-2xl font-bold">{stats.progress_score}</p>
          </div>
          <div className="p-4 rounded-lg bg-background-tertiary/50 border border-teal-500/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyan-500/20 text-cyan-400 rounded-lg p-2">
                <Activity className="h-4 w-4" />
              </div>
              <p className="text-text-secondary text-xs">Allenamenti Totali</p>
            </div>
            <p className="text-text-primary text-2xl font-bold">{stats.allenamenti_totali}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-teal-500/50 text-white hover:bg-teal-500/10 hover:border-teal-400"
          onClick={() => router.push('/home/progressi')}
        >
          Vedi dettagli completi
        </Button>
      </CardContent>
    </Card>
  )
}
