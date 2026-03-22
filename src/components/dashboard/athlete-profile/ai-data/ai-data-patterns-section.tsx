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
    <Card variant="default" className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Pattern Rilevati
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patternRilevati.map((pattern, index) => (
            <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
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
