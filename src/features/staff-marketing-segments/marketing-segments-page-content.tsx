'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Layers, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applySegmentRules, type SegmentRules } from '@/lib/marketing/segment-rules'
import {
  StaffMarketingDataBlockSkeleton,
  StaffMarketingSegmentSkeleton,
} from '@/components/layout/route-loading-skeletons'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import {
  useMarketingAthletes,
  useMarketingSegments,
  useMarketingSegmentMutations,
} from '@/hooks/use-marketing-segments'
import { formatMarketingDate } from '@/lib/marketing/format'

export function MarketingSegmentsPageContent() {
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data: segments, loading, error } = useMarketingSegments(canAccess)
  const { data: athletes } = useMarketingAthletes(canAccess)
  const { setSegmentActive } = useMarketingSegmentMutations()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const estimatedCount = (rules: SegmentRules | null | undefined) =>
    applySegmentRules(athletes, rules ?? undefined).length

  const handleToggleActive = async (segmentId: string, isActive: boolean) => {
    setTogglingId(segmentId)
    try {
      await setSegmentActive.mutateAsync({ segmentId, isActive: !isActive })
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
            <Layers className="h-6 w-6 text-cyan-400" />
            Segmenti
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Crea e gestisci segmenti di atleti (dati da vista marketing).
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/dashboard/marketing/segments/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo segmento
          </Link>
        </Button>
      </header>

      {loading ? (
        <StaffMarketingDataBlockSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : segments.length === 0 ? (
        <Card className="border-border bg-background-secondary/80">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="mb-3 h-12 w-12 text-text-muted" />
            <p className="text-center text-sm text-text-secondary">Nessun segmento. Creane uno.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/marketing/segments/new">Nuovo segmento</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">Elenco segmenti</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {segments.map((seg) => (
                <li
                  key={seg.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-background-tertiary/30 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{seg.name}</span>
                      {seg.is_active ? (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-400">
                          Attivo
                        </span>
                      ) : (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                          Disattivo
                        </span>
                      )}
                    </div>
                    {seg.description && (
                      <p className="mt-0.5 truncate text-xs text-text-muted">{seg.description}</p>
                    )}
                    <p className="mt-1 text-xs text-text-tertiary">
                      ~{estimatedCount(seg.rules as SegmentRules)} atleti · aggiornato{' '}
                      {formatMarketingDate(seg.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(seg.id, seg.is_active)}
                      disabled={togglingId === seg.id}
                      className="rounded p-1 text-text-muted hover:bg-background-tertiary hover:text-text-primary disabled:opacity-50"
                      title={seg.is_active ? 'Disattiva' : 'Attiva'}
                    >
                      {seg.is_active ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/marketing/segments/${seg.id}`}>Dettaglio</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
