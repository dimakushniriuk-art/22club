// ============================================================
// Componente Sezione Insights Aggregati AI Data (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Brain } from 'lucide-react'

interface AIDataInsightsSectionProps {
  insightsAggregati: Record<string, unknown>
}

export function AIDataInsightsSection({ insightsAggregati }: AIDataInsightsSectionProps) {
  if (!insightsAggregati || Object.keys(insightsAggregati).length === 0) return null

  return (
    <Card variant="default" className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Insights Aggregati
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(insightsAggregati).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded border border-white/10 bg-white/[0.02]"
            >
              <span className="text-text-secondary text-sm font-medium capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="text-text-primary text-sm font-semibold">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
