'use client'

import { Suspense } from 'react'
import { TrendChart, MultiTrendChart } from '@/components/shared/analytics/trend-chart'
import {
  DistributionChart,
  HorizontalBarChart,
  VerticalBarChart,
} from '@/components/shared/analytics/distribution-chart'
import { KPIMetrics, PerformanceMetrics } from '@/components/shared/analytics/kpi-metrics'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { ExportReportButton } from '@/components/dashboard/export-report-button'
import type { AnalyticsData } from '@/lib/analytics'

interface StatisticheContentProps {
  data: AnalyticsData
  growth: {
    workouts_growth: number
    documents_growth: number
    hours_growth: number
  }
}

export function StatisticheContent({ data, growth }: StatisticheContentProps) {
  return (
    <>
      {/* Export Button */}
      <ExportReportButton analyticsData={data} />

      {/* KPI Metrics */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={120} />
            ))}
          </div>
        }
      >
        <KPIMetrics summary={data.summary} growth={growth} />
      </Suspense>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton height={320} />}>
          <TrendChart data={data.trend} />
        </Suspense>

        <Suspense fallback={<Skeleton height={320} />}>
          <MultiTrendChart data={data.trend} />
        </Suspense>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<Skeleton height={280} />}>
          <DistributionChart data={data.distribution} />
        </Suspense>

        <Suspense fallback={<Skeleton height={280} />}>
          <HorizontalBarChart data={data.distribution} />
        </Suspense>

        <Suspense fallback={<Skeleton height={280} />}>
          <VerticalBarChart data={data.distribution} />
        </Suspense>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton height={400} />}>
          <PerformanceMetrics performance={data.performance} />
        </Suspense>

        <Suspense fallback={<Skeleton height={400} />}>
          <div className="relative p-6 rounded-lg border border-teal-500/30">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              📊 Dettagli Performance
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-lg border border-teal-500/20 bg-background-secondary/30">
                <span className="text-text-secondary">Allenamenti completati</span>
                <span className="font-bold text-white">{data.summary.total_workouts}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg border border-teal-500/20 bg-background-secondary/30">
                <span className="text-text-secondary">Ore totali di allenamento</span>
                <span className="font-bold text-white">{data.summary.total_hours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg border border-teal-500/20 bg-background-secondary/30">
                <span className="text-text-secondary">Documenti caricati</span>
                <span className="font-bold text-white">{data.summary.total_documents}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg border border-teal-500/20 bg-background-secondary/30">
                <span className="text-text-secondary">Atleti attivi</span>
                <span className="font-bold text-white">{data.summary.active_athletes}</span>
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </>
  )
}
