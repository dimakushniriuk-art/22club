// ============================================================
// Componente Sezione Pattern Rilevati AI Data (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { TrendingUp } from 'lucide-react'
import type { PatternRilevato } from '@/types/athlete-profile'

interface AIDataPatternsSectionProps {
  patternRilevati: PatternRilevato[]
}

export function AIDataPatternsSection({ patternRilevati }: AIDataPatternsSectionProps) {
  if (patternRilevati.length === 0) return null

  return (
    <Card
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background-secondary/40 backdrop-blur-xl shadow-[0_0_30px_rgba(2,179,191,0.08)] hover:shadow-[0_0_40px_rgba(2,179,191,0.15)] transition-all duration-300"
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Pattern Rilevati
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patternRilevati.map((pattern, index) => (
            <div
              key={index}
              className="p-4 bg-background-tertiary/30 rounded-lg border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" size="sm">
                  {pattern.tipo}
                </Badge>
                <span className="text-text-secondary text-sm">Frequenza: {pattern.frequenza}</span>
              </div>
              <p className="text-text-primary">{pattern.descrizione}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
