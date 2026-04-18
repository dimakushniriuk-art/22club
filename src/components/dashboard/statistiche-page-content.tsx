'use client'

import { Suspense } from 'react'
import { cn } from '@/lib/utils'
import { TrendChart, MultiTrendChart } from '@/components/shared/analytics/trend-chart'
import {
  DistributionChart,
  HorizontalBarChart,
  VerticalBarChart,
} from '@/components/shared/analytics/distribution-chart'
import { KPIMetrics, PerformanceMetrics } from '@/components/shared/analytics/kpi-metrics'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { ExportReportButton } from '@/components/dashboard/export-report-button'
import { TrainerStatisticheDashboard } from '@/components/dashboard/trainer-statistiche-dashboard'
import type { AnalyticsData } from '@/lib/analytics'
import type { TrainerAnalyticsReport } from '@/lib/trainer-analytics'

export type StatsPeriod = 'week' | 'month' | '6months' | 'year'

export type StatisticheViewTab = 'trainer' | 'legacy'

export const STATS_PERIODS: { id: StatsPeriod; label: string; days: number }[] = [
  { id: 'week', label: 'Settimana', days: 7 },
  { id: 'month', label: 'Mese', days: 30 },
  { id: '6months', label: '6 mesi', days: 183 },
  { id: 'year', label: 'Anno', days: 365 },
]

interface StatistichePageContentProps {
  selectedPeriod: StatsPeriod
  onPeriodChange: (period: StatsPeriod) => void
  isRefreshing?: boolean
  /** False durante bootstrap auth: niente vista legacy/trainer finché il ruolo non è noto */
  authReady: boolean
  /** Vista trainer / admin analytics PT */
  trainerMode: boolean
  trainerReport: TrainerAnalyticsReport | null
  trainerPanelLoading?: boolean
  trainerPanelHint?: 'no_org' | 'no_trainers' | 'none_selected' | null
  trainerOptions: { id: string; label: string }[]
  selectedTrainerIds: string[]
  onToggleTrainerId: (id: string) => void
  /** Admin: tab tra analytics trainer e vista legacy organizzazione */
  showAdminLegacyTab: boolean
  activeTab: StatisticheViewTab
  onActiveTabChange: (tab: StatisticheViewTab) => void
  /** Dati legacy (organizzazione) */
  legacyData: AnalyticsData
  legacyGrowth: {
    workouts_growth: number
    documents_growth: number
    hours_growth: number
  }
}

export function StatistichePageContent({
  selectedPeriod,
  onPeriodChange,
  isRefreshing = false,
  authReady,
  trainerMode,
  trainerReport,
  trainerPanelLoading = false,
  trainerPanelHint = null,
  trainerOptions,
  selectedTrainerIds,
  onToggleTrainerId,
  showAdminLegacyTab,
  activeTab,
  onActiveTabChange,
  legacyData,
  legacyGrowth,
}: StatistichePageContentProps) {
  const showTrainerPanel = authReady && trainerMode && activeTab === 'trainer'
  const showLegacyPanel =
    authReady && (!trainerMode || (showAdminLegacyTab && activeTab === 'legacy'))
  const showStatsAuthSkeleton = !authReady

  return (
    <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
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
              {!authReady
                ? 'Caricamento profilo…'
                : trainerMode
                  ? 'Analytics trainer: attività atleti, attività del trainer ed economia'
                  : 'Dashboard analytics per monitorare le performance e i trend'}
            </p>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
            {authReady && trainerMode && showAdminLegacyTab && (
              <div
                role="tablist"
                aria-label="Tipo statistiche"
                className="inline-flex flex-wrap gap-1 rounded-lg border border-white/15 bg-white/5 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'trainer'}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    activeTab === 'trainer'
                      ? 'bg-teal-500/25 text-teal-200'
                      : 'text-text-secondary hover:bg-white/5',
                  )}
                  onClick={() => onActiveTabChange('trainer')}
                >
                  Trainer
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'legacy'}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    activeTab === 'legacy'
                      ? 'bg-teal-500/25 text-teal-200'
                      : 'text-text-secondary hover:bg-white/5',
                  )}
                  onClick={() => onActiveTabChange('legacy')}
                >
                  Organizzazione
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div
                role="group"
                aria-label="Periodo statistiche"
                className="inline-flex flex-wrap items-center gap-1 rounded-lg border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-1 shadow-md shadow-teal-500/10"
              >
                {STATS_PERIODS.map(({ id, label }) => {
                  const selected = selectedPeriod === id
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isRefreshing}
                      aria-pressed={selected}
                      onClick={() => onPeriodChange(id)}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        selected
                          ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50 shadow-sm'
                          : 'text-text-secondary border border-transparent hover:bg-white/5 hover:text-text-primary',
                        isRefreshing && 'opacity-60 cursor-wait',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <ExportReportButton
                legacyAnalyticsData={legacyData}
                trainerReport={showTrainerPanel ? trainerReport : null}
              />
            </div>
          </div>
        </div>

        {trainerMode && showTrainerPanel && trainerOptions.length > 1 && (
          <details className="rounded-xl border border-white/10 bg-background-secondary/60 p-4">
            <summary className="cursor-pointer text-sm font-medium text-text-primary">
              Trainer selezionati ({selectedTrainerIds.length}/{trainerOptions.length})
            </summary>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {trainerOptions.map((o) => {
                const checked = selectedTrainerIds.includes(o.id)
                return (
                  <label
                    key={o.id}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-white/20"
                      checked={checked}
                      onChange={() => onToggleTrainerId(o.id)}
                    />
                    {o.label}
                  </label>
                )
              })}
            </div>
          </details>
        )}

        {showStatsAuthSkeleton && (
          <div
            className="space-y-4 sm:space-y-6"
            aria-busy="true"
            aria-label="Caricamento statistiche"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={120} />
              ))}
            </div>
            <Skeleton height={280} />
          </div>
        )}

        {showTrainerPanel && (
          <div className="space-y-4">
            {trainerPanelHint === 'no_org' && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Associa un&apos;organizzazione al profilo per caricare le statistiche trainer.
              </p>
            )}
            {trainerPanelHint === 'no_trainers' && (
              <p className="text-text-secondary text-sm">
                Nessun trainer in questa organizzazione.
              </p>
            )}
            {trainerPanelHint === 'none_selected' && (
              <p className="text-text-secondary text-sm">Seleziona almeno un trainer.</p>
            )}
            {trainerPanelLoading && !trainerReport && !trainerPanelHint && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} height={88} />
                ))}
              </div>
            )}
            {!trainerReport &&
              !trainerPanelLoading &&
              !trainerPanelHint &&
              selectedTrainerIds.length > 0 && (
                <p className="text-text-secondary text-sm">
                  Impossibile caricare l&apos;analytics trainer. Riprova tra poco.
                </p>
              )}
            {trainerReport && <TrainerStatisticheDashboard report={trainerReport} />}
          </div>
        )}

        {showLegacyPanel && (
          <>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height={120} />
                  ))}
                </div>
              }
            >
              <KPIMetrics summary={legacyData.summary} growth={legacyGrowth} />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<Skeleton height={320} />}>
                <TrendChart data={legacyData.trend} />
              </Suspense>

              <Suspense fallback={<Skeleton height={320} />}>
                <MultiTrendChart data={legacyData.trend} />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Suspense fallback={<Skeleton height={280} />}>
                <DistributionChart data={legacyData.distribution} />
              </Suspense>

              <Suspense fallback={<Skeleton height={280} />}>
                <HorizontalBarChart data={legacyData.distribution} />
              </Suspense>

              <Suspense fallback={<Skeleton height={280} />}>
                <VerticalBarChart data={legacyData.distribution} />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<Skeleton height={400} />}>
                <PerformanceMetrics performance={legacyData.performance} />
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
                        Dettagli performance
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                        <span className="text-text-secondary font-medium">
                          Allenamenti completati
                        </span>
                        <span className="font-bold text-white text-lg">
                          {legacyData.summary.total_workouts}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                        <span className="text-text-secondary font-medium">
                          Ore totali di allenamento
                        </span>
                        <span className="font-bold text-white text-lg">
                          {legacyData.summary.total_hours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                        <span className="text-text-secondary font-medium">Documenti caricati</span>
                        <span className="font-bold text-white text-lg">
                          {legacyData.summary.total_documents}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200">
                        <span className="text-text-secondary font-medium">Atleti attivi</span>
                        <span className="font-bold text-white text-lg">
                          {legacyData.summary.active_athletes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
