// ============================================================
// Componente Sezione Metriche Custom Smart Tracking (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-smart-tracking-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface CustomMetricsSectionProps {
  metricaCustom: Record<string, unknown> | null
}

export function CustomMetricsSection({ metricaCustom }: CustomMetricsSectionProps) {
  if (!metricaCustom || Object.keys(metricaCustom).length === 0) {
    return null
  }

  return (
    <Card variant="default" className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Metriche Custom</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(metricaCustom).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2 bg-background-tertiary/30 rounded"
            >
              <span className="text-text-secondary text-sm font-medium capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="text-text-primary text-sm">{String(value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
