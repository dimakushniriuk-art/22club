'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowLeft, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import {
  useMarketingAutomation,
  useMarketingAutomationMutations,
} from '@/hooks/use-marketing-automations'
import { MARKETING_AUTOMATION_ACTION_LABELS } from '@/lib/marketing/labels'
import { formatMarketingDateTime } from '@/lib/marketing/format'

export function MarketingAutomationDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = useResolvedParams(params)
  const id = typeof resolved.id === 'string' ? resolved.id : null
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { automation, segment, loading, error } = useMarketingAutomation(id, canAccess)
  const { runAutomation } = useMarketingAutomationMutations()
  const [runResult, setRunResult] = useState<{ athletes_count: number } | null>(null)

  const handleRun = async () => {
    if (!id) return
    setRunResult(null)
    try {
      const data = await runAutomation.mutateAsync(id)
      setRunResult({ athletes_count: data.athletes_count })
    } catch {
      // mutation error surfaced via runAutomation state if needed
    }
  }

  if (showLoader || loading) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (error || !automation) {
    return (
      <div className="space-y-6 bg-background p-4 md:p-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/automations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error ?? 'Automazione non trovata'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/marketing/automations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
              <Zap className="h-6 w-6 text-cyan-400" />
              {automation.name}
            </h1>
            <p className="text-sm text-text-secondary">
              {MARKETING_AUTOMATION_ACTION_LABELS[automation.action_type] ?? automation.action_type}{' '}
              · Segmento: {segment?.name ?? automation.segment_id}
            </p>
          </div>
        </div>
        <Button onClick={handleRun} disabled={runAutomation.isPending}>
          <Play className="mr-2 h-4 w-4" />
          {runAutomation.isPending ? 'Esecuzione...' : 'Esegui ora'}
        </Button>
      </header>

      {runResult != null && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Esecuzione completata. Atleti nel segmento: {runResult.athletes_count}. last_run_at
          aggiornato.
        </div>
      )}

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="text-base text-text-primary">Dettaglio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-text-muted">Stato:</span>{' '}
            {automation.is_active ? 'Attiva' : 'Disattiva'}
          </div>
          <div>
            <span className="text-text-muted">Segmento:</span>{' '}
            {segment?.name ?? automation.segment_id}
          </div>
          <div>
            <span className="text-text-muted">Azione:</span>{' '}
            {MARKETING_AUTOMATION_ACTION_LABELS[automation.action_type] ?? automation.action_type}
          </div>
          <div>
            <span className="text-text-muted">Ultima esecuzione:</span>{' '}
            {formatMarketingDateTime(automation.last_run_at)}
          </div>
          <div>
            <span className="text-text-muted">Payload:</span>{' '}
            <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs">
              {JSON.stringify(automation.action_payload, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
