// ============================================================
// Componente Tab Documenti Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { FileText, ArrowLeft, AlertCircle } from 'lucide-react'

interface AthleteDocumentsTabProps {
  athleteId: string
  documentiScadenza: number
}

export function AthleteDocumentsTab({ athleteId, documentiScadenza }: AthleteDocumentsTabProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-teal-500/20 hover:border-teal-400/50 transition-all duration-200 !bg-transparent"
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-text-primary text-xl font-bold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              Documenti
            </h3>
            <p className="text-text-secondary text-sm">
              Certificati, liberatorie e documenti dell&apos;atleta
            </p>
          </div>
          <Link href={`/dashboard/documenti?atleta=${athleteId}`}>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200">
              Vedi tutti i documenti
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </Link>
        </div>

        {documentiScadenza > 0 && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 text-red-400 rounded-full p-2">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-red-400 font-semibold mb-1">
                  {documentiScadenza} {documentiScadenza === 1 ? 'documento' : 'documenti'} in
                  scadenza
                </p>
                <p className="text-red-300/80 text-sm">
                  Richiedi il rinnovo dei documenti scaduti o in scadenza
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center py-12">
          <div className="bg-blue-500/20 text-blue-400 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8" />
          </div>
          <p className="text-text-primary font-medium mb-2">Gestione Documenti</p>
          <p className="text-text-secondary text-sm mb-4">
            Visualizza e gestisci tutti i documenti dell&apos;atleta
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
