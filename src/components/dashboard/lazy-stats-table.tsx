'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui'
import type { AthleteStats } from './stats-table'

// Lazy load del componente pesante
const StatsTable = lazy(() =>
  import('./stats-table').then((module) => ({
    default: module.StatsTable,
  })),
)

interface LazyStatsTableProps {
  data: AthleteStats[]
  onExport: () => void
}

export function LazyStatsTable({ data, onExport }: LazyStatsTableProps) {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 bg-background-tertiary rounded mb-4" />
              <div className="h-10 w-full bg-background-tertiary rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full bg-background-tertiary rounded" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      }
    >
      <StatsTable data={data} onExport={onExport} />
    </Suspense>
  )
}
