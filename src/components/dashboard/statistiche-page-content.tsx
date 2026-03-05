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

interface StatistichePageContentProps {
  data: AnalyticsData
  growth: {
    workouts_growth: number
    documents_growth: number
    hours_growth: number
  }
}

export function StatistichePageContent({ data, growth }: StatistichePageContentProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 shadow-lg shadow-teal-500/10">
                <svg
                  className="w-6 h-6 text-teal-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Statistiche
              </h1>
            </div>
            <p className="text-text-secondary text-sm sm:text-base ml-16">
              Dashboard analytics per monitorare le performance e i trend
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-lg border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 text-sm text-text-primary font-medium shadow-md shadow-teal-500/10">
              Periodo attuale: <span className="text-teal-400 font-semibold">Ultimo mese</span>
            </div>
            <ExportReportButton analyticsData={data} />
          </div>
        </div>

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
            <div className="relative overflow-hidden rounded-xl border-2 border-blue-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    📊 Dettagli Performance
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                    <span className="text-text-secondary font-medium">Allenamenti completati</span>
                    <span className="font-bold text-white text-lg">
                      {data.summary.total_workouts}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                    <span className="text-text-secondary font-medium">
                      Ore totali di allenamento
                    </span>
                    <span className="font-bold text-white text-lg">
                      {data.summary.total_hours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                    <span className="text-text-secondary font-medium">Documenti caricati</span>
                    <span className="font-bold text-white text-lg">
                      {data.summary.total_documents}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                    <span className="text-text-secondary font-medium">Atleti attivi</span>
                    <span className="font-bold text-white text-lg">
                      {data.summary.active_athletes}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
