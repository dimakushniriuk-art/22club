// ============================================================
// Componente Sezione Fattori Rischio AI Data (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { AlertTriangle } from 'lucide-react'

interface AIDataRiskFactorsSectionProps {
  fattoriRischio: string[]
}

export function AIDataRiskFactorsSection({ fattoriRischio }: AIDataRiskFactorsSectionProps) {
  if (fattoriRischio.length === 0) return null

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-teal-400" />
          Fattori di Rischio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {fattoriRischio.map((fattore, index) => (
            <Badge key={index} variant="destructive">
              {fattore}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
