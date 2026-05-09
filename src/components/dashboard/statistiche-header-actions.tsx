'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { ExportReportButton } from '@/components/dashboard/export-report-button'
import type { AnalyticsData } from '@/lib/analytics'
import type { TrainerAnalyticsReport } from '@/lib/trainer-analytics'
import {
  STATS_PERIODS,
  type StatsPeriod,
  type StatisticheViewTab,
} from '@/components/dashboard/statistiche-constants'

export interface StatisticheHeaderActionsProps {
  authReady: boolean
  trainerMode: boolean
  showAdminLegacyTab: boolean
  activeTab: StatisticheViewTab
  onActiveTabChange: (tab: StatisticheViewTab) => void
  selectedPeriod: StatsPeriod
  onPeriodChange: (period: StatsPeriod) => void
  isRefreshing: boolean
  legacyData: AnalyticsData
  /** Report per PDF trainer; `null` se la vista attiva non è analytics trainer */
  trainerReportForExport: TrainerAnalyticsReport | null
}

export function StatisticheHeaderActions({
  authReady,
  trainerMode,
  showAdminLegacyTab,
  activeTab,
  onActiveTabChange,
  selectedPeriod,
  onPeriodChange,
  isRefreshing,
  legacyData,
  trainerReportForExport,
}: StatisticheHeaderActionsProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      {authReady && trainerMode && showAdminLegacyTab && (
        <div
          role="tablist"
          aria-label="Tipo statistiche"
          className="inline-flex flex-wrap gap-1 rounded-lg border border-cyan-400/30 bg-cyan-500/5 p-0.5"
        >
          <Button
            type="button"
            role="tab"
            variant={activeTab === 'trainer' ? 'primary' : 'ghost'}
            size="sm"
            aria-selected={activeTab === 'trainer'}
            onClick={() => onActiveTabChange('trainer')}
            className={cn(
              'rounded-md px-3',
              activeTab !== 'trainer' && 'text-cyan-300/80 hover:bg-cyan-500/10 border-transparent',
            )}
          >
            Trainer
          </Button>
          <Button
            type="button"
            role="tab"
            variant={activeTab === 'legacy' ? 'primary' : 'ghost'}
            size="sm"
            aria-selected={activeTab === 'legacy'}
            onClick={() => onActiveTabChange('legacy')}
            className={cn(
              'rounded-md px-3',
              activeTab !== 'legacy' && 'text-cyan-300/80 hover:bg-cyan-500/10 border-transparent',
            )}
          >
            Organizzazione
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-stretch gap-2 sm:items-center sm:justify-end">
        <div
          role="group"
          aria-label="Periodo statistiche"
          className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-500/5 p-0.5"
        >
          {STATS_PERIODS.map(({ id, label }) => {
            const selected = selectedPeriod === id
            return (
              <Button
                key={id}
                type="button"
                disabled={isRefreshing}
                variant={selected ? 'primary' : 'ghost'}
                size="sm"
                aria-pressed={selected}
                onClick={() => onPeriodChange(id)}
                className={cn(
                  'rounded-md px-2.5 sm:px-3',
                  !selected && 'text-cyan-300/80 hover:bg-cyan-500/10 border-transparent',
                  isRefreshing && 'cursor-wait opacity-60',
                )}
              >
                {label}
              </Button>
            )
          })}
        </div>
        <ExportReportButton
          legacyAnalyticsData={legacyData}
          trainerReport={trainerReportForExport}
        />
      </div>
    </div>
  )
}
