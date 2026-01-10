// ============================================================
// Componente Sezione Raccomandazioni AI Data (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { BadgeProps } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'
import type { Raccomandazione } from '@/types/athlete-profile'

interface AIDataRecommendationsSectionProps {
  raccomandazioni: Raccomandazione[]
  getPrioritaBadge: (priorita: 'alta' | 'media' | 'bassa') => {
    color: string
    text: string
  }
}

export function AIDataRecommendationsSection({
  raccomandazioni,
  getPrioritaBadge,
}: AIDataRecommendationsSectionProps) {
  if (raccomandazioni.length === 0) return null

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-teal-400" />
          Raccomandazioni
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {raccomandazioni.map((raccomandazione, index) => {
            const prioritaBadge = getPrioritaBadge(raccomandazione.priorita)
            return (
              <div
                key={index}
                className="p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={prioritaBadge.color as BadgeProps['variant']} size="sm">
                      {prioritaBadge.text}
                    </Badge>
                    <span className="text-text-primary font-semibold">{raccomandazione.tipo}</span>
                  </div>
                </div>
                <p className="text-text-primary mb-2">{raccomandazione.descrizione}</p>
                {raccomandazione.azione && (
                  <p className="text-text-secondary text-sm">
                    <strong>Azione:</strong> {raccomandazione.azione}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
