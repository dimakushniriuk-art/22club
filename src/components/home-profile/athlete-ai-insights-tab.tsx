// ============================================================
// Componente Tab AI Insights Profilo Atleta Home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Brain } from 'lucide-react'

interface AthleteAIInsightsTabProps {
  aiData: {
    engagement_score?: number
    raccomandazioni?: string | null
  } | null
}

export function AthleteAIInsightsTab({ aiData }: AthleteAIInsightsTabProps) {
  if (!aiData) {
    return (
      <Card
        variant="default"
        className="relative border-teal-500/30 bg-transparent [background-image:none!important]"
      >
        <CardContent className="p-6 text-center">
          <p className="text-text-secondary">Nessun dato AI disponibile</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      variant="default"
      className="relative border-teal-500/30 bg-transparent [background-image:none!important]"
    >
      <CardHeader className="relative">
        <CardTitle size="md" className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-teal-400" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {aiData.engagement_score !== undefined && (
          <div className="p-4 rounded-lg bg-background-tertiary/50 border border-teal-500/10">
            <p className="text-text-secondary text-xs mb-2">Engagement Score</p>
            <p className="text-text-primary text-2xl font-bold">{aiData.engagement_score}</p>
          </div>
        )}
        {aiData.raccomandazioni && (
          <div className="p-4 rounded-lg bg-background-tertiary/50 border border-teal-500/10">
            <p className="text-text-secondary text-xs mb-2">Raccomandazioni</p>
            <p className="text-text-primary text-sm">{aiData.raccomandazioni}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
