'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui'
import { BarChart3 } from 'lucide-react'
import type { ChartData } from './stats-charts'

// Lazy load del componente pesante
const StatsCharts = lazy(() =>
  import('./stats-charts').then((module) => ({
    default: module.StatsCharts,
  })),
)

interface LazyStatsChartsProps {
  data: ChartData
}

export function LazyStatsCharts({ data }: LazyStatsChartsProps) {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 backdrop-blur-xl shadow-2xl shadow-teal-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
              <CardContent className="p-6 relative">
                <div className="animate-pulse">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                      <BarChart3 className="h-5 w-5 text-teal-400" />
                    </div>
                    <div className="h-6 w-48 bg-background-tertiary rounded" />
                  </div>
                  <div className="h-80 bg-background-tertiary rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      <StatsCharts data={data} />
    </Suspense>
  )
}
