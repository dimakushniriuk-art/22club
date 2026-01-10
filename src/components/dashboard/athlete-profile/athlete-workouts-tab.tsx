// ============================================================
// Componente Tab Allenamenti Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Dumbbell, ArrowLeft } from 'lucide-react'

interface AthleteWorkoutsTabProps {
  athleteId: string
  schedeAttive: number
}

export function AthleteWorkoutsTab({ athleteId, schedeAttive }: AthleteWorkoutsTabProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-teal-500/20 hover:border-teal-400/50 transition-all duration-200 !bg-transparent"
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-text-primary text-xl font-bold mb-2 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-teal-400" />
              Schede di Allenamento
            </h3>
            <p className="text-text-secondary text-sm">
              {schedeAttive} {schedeAttive === 1 ? 'scheda attiva' : 'schede attive'}
            </p>
          </div>
          <Link href={`/dashboard/schede?athlete_id=${athleteId}`}>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200">
              Vedi tutte le schede
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </Link>
        </div>
        {schedeAttive === 0 ? (
          <div className="text-center py-12">
            <div className="bg-teal-500/20 text-teal-400 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Dumbbell className="h-8 w-8" />
            </div>
            <p className="text-text-primary font-medium mb-2">Nessuna scheda attiva</p>
            <p className="text-text-secondary text-sm mb-4">
              Crea una nuova scheda di allenamento per questo atleta
            </p>
            <Link href={`/dashboard/schede?athlete_id=${athleteId}&new=true`}>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200">
                Crea Prima Scheda
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placeholder per schede future - qui si potrebbero mostrare le schede attive */}
            <div className="p-4 rounded-lg border border-teal-500/10">
              <p className="text-text-secondary text-sm">
                Le schede attive verranno visualizzate qui
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
