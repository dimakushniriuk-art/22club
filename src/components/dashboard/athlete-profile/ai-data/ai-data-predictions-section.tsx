// ============================================================
// Componente Sezione Predizioni Performance AI Data (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Target } from 'lucide-react'
import type { PredizionePerformance } from '@/types/athlete-profile'

interface AIDataPredictionsSectionProps {
  predizioniPerformance: PredizionePerformance[]
}

export function AIDataPredictionsSection({ predizioniPerformance }: AIDataPredictionsSectionProps) {
  if (predizioniPerformance.length === 0) return null

  return (
    <Card
      variant="default"
      className="overflow-hidden"
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Predizioni Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predizioniPerformance.map((predizione, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-primary font-semibold">{predizione.metrica}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-sm">
                    Target: {new Date(predizione.data_target).toLocaleDateString('it-IT')}
                  </span>
                  <Badge variant="secondary" size="sm">
                    {predizione.confidenza}% confidenza
                  </Badge>
                </div>
              </div>
              <p className="text-text-primary text-lg font-bold">
                Valore predetto: {predizione.valore_predetto}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
