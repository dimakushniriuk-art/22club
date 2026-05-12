'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  StaffMarketingDataBlockSkeleton,
  StaffMarketingSegmentSkeleton,
} from '@/components/layout/route-loading-skeletons'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import {
  useMarketingAutomations,
  useMarketingAutomationMutations,
  useMarketingAutomationSegmentNames,
} from '@/hooks/use-marketing-automations'
import { MARKETING_AUTOMATION_ACTION_LABELS } from '@/lib/marketing/labels'
import { formatMarketingDateTime } from '@/lib/marketing/format'

export function MarketingAutomationsPageContent() {
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data: automations, loading, error } = useMarketingAutomations(canAccess)
  const { data: segments } = useMarketingAutomationSegmentNames(canAccess)
  const { setAutomationActive } = useMarketingAutomationMutations()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const segmentName = (segmentId: string) =>
    segments.find((s) => s.id === segmentId)?.name ?? segmentId

  const handleToggleActive = async (automationId: string, isActive: boolean) => {
    setTogglingId(automationId)
    try {
      await setAutomationActive.mutateAsync({ automationId, isActive: !isActive })
    } finally {
      setTogglingId(null)
    }
  }

  if (showLoader) {
    return <StaffMarketingSegmentSkeleton />
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
            <Zap className="h-6 w-6 text-cyan-400" />
            Automazioni
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Azioni su segmenti: suggerimenti campagne, log eventi.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/dashboard/marketing/automations/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuova
          </Link>
        </Button>
      </header>

      {loading ? (
        <StaffMarketingDataBlockSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : (
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">
              Elenco ({automations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {automations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Zap className="mb-3 h-12 w-12 text-text-muted" />
                <p className="text-center text-sm text-text-secondary">
                  Nessuna automazione. Creane una.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/marketing/automations/new">Nuova automazione</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {automations.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-sm text-text-muted">
                        Segmento: {segmentName(row.segment_id)} ·{' '}
                        {MARKETING_AUTOMATION_ACTION_LABELS[row.action_type] ?? row.action_type}
                      </p>
                      <p className="text-xs text-text-muted">
                        Ultima esecuzione: {formatMarketingDateTime(row.last_run_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(row.id, row.is_active)}
                        disabled={togglingId === row.id}
                      >
                        {row.is_active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        {row.is_active ? 'Attiva' : 'Disattiva'}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/marketing/automations/${row.id}`}>Dettaglio</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
