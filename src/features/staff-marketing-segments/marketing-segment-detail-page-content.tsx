'use client'

import Link from 'next/link'
import { ArrowLeft, Edit, Users, ToggleLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { applySegmentRules, type SegmentRules } from '@/lib/marketing/segment-rules'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import {
  useMarketingAthletes,
  useMarketingSegment,
  useMarketingSegmentMutations,
} from '@/hooks/use-marketing-segments'
import { formatMarketingDate } from '@/lib/marketing/format'

export function MarketingSegmentDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const resolved = useResolvedParams(params)
  const id = typeof resolved.id === 'string' ? resolved.id : null
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data: segment, loading, error } = useMarketingSegment(id, canAccess)
  const { data: athletes } = useMarketingAthletes(canAccess)
  const { setSegmentActive } = useMarketingSegmentMutations()

  const filteredAthletes = segment ? applySegmentRules(athletes, segment.rules as SegmentRules) : []

  const handleDisattiva = async () => {
    if (!segment?.id) return
    await setSegmentActive.mutateAsync({ segmentId: segment.id, isActive: false })
  }

  if (showLoader || loading) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (error || !segment) {
    return (
      <div className="space-y-4 bg-background p-4 md:p-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/segments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error ?? 'Segmento non trovato'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/marketing/segments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">{segment.name}</h1>
            {segment.description && (
              <p className="text-sm text-text-secondary">{segment.description}</p>
            )}
            <p className="mt-1 text-xs text-text-tertiary">
              {segment.is_active ? (
                <span className="text-emerald-400">Attivo</span>
              ) : (
                <span className="text-amber-400">Disattivo</span>
              )}{' '}
              · Aggiornato {formatMarketingDate(segment.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/marketing/segments/${segment.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Link>
          </Button>
          {segment.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisattiva}
              disabled={setSegmentActive.isPending}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <ToggleLeft className="mr-2 h-4 w-4" />
              Disattiva
            </Button>
          )}
        </div>
      </header>

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-cyan-400" />
            Atleti nel segmento ({filteredAthletes.length})
          </CardTitle>
          <p className="text-xs text-text-muted">
            Dati dalla vista marketing_athletes, filtrati dalle regole del segmento.
          </p>
        </CardHeader>
        <CardContent>
          {filteredAthletes.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-secondary">
              Nessun atleta corrisponde alle regole del segmento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-text-secondary">Nome</TableHead>
                    <TableHead className="text-text-secondary">Email</TableHead>
                    <TableHead className="text-text-secondary">Workout 7d</TableHead>
                    <TableHead className="text-text-secondary">Workout 30d</TableHead>
                    <TableHead className="text-text-secondary">Ultimo workout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAthletes.map((row) => (
                    <TableRow key={row.athlete_id} className="border-border/50">
                      <TableCell className="font-medium">
                        {[row.first_name, row.last_name].filter(Boolean).join(' ') || '–'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-text-muted">
                        {row.email ?? '–'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {Number(row.workouts_coached_7d ?? 0)} coach /{' '}
                        {Number(row.workouts_solo_7d ?? 0)} solo
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {Number(row.workouts_coached_30d ?? 0)} coach /{' '}
                        {Number(row.workouts_solo_30d ?? 0)} solo
                      </TableCell>
                      <TableCell className="text-text-muted">
                        {formatMarketingDate(row.last_workout_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
