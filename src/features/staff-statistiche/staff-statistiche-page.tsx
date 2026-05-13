'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { StatistichePageContent } from '@/components/dashboard/statistiche-page-content'
import type { StatsPeriod, StatisticheViewTab } from '@/components/dashboard/statistiche-constants'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StatisticheHeaderActions } from '@/components/dashboard/statistiche-header-actions'
import { useStaffOrgTrainerOptions } from '@/hooks/use-staff-org-trainer-options'
import { useStaffStatisticheLegacy } from '@/hooks/use-staff-statistiche-legacy'
import { useStaffTrainerAnalyticsReport } from '@/hooks/use-staff-trainer-analytics-report'
import { useAuth } from '@/providers/auth-provider'
import {
  calculateStaffStatisticheGrowthMetrics,
  staffStatisticheBoundariesForPeriod,
  staffStatisticheDaysForPeriod,
} from '@/lib/analytics/staff-statistiche-helpers'

export function StaffStatistichePageContent() {
  const { org_id, role, user, loading: authLoading } = useAuth()
  const [period, setPeriod] = useState<StatsPeriod>('month')
  const [activeTab, setActiveTab] = useState<StatisticheViewTab>('trainer')
  const [trainerOptions, setTrainerOptions] = useState<{ id: string; label: string }[]>([])
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>([])
  const [adminTrainersReady, setAdminTrainersReady] = useState(role !== 'admin')

  const trainerMode = role === 'trainer' || role === 'admin'
  const showAdminLegacyTab = role === 'admin'
  const shouldLoadLegacy = !authLoading && (!trainerMode || role === 'admin')

  const rangeDays = useMemo(() => staffStatisticheDaysForPeriod(period), [period])
  const { start: reportStart, end: reportEnd } = useMemo(
    () => staffStatisticheBoundariesForPeriod(rangeDays),
    [rangeDays],
  )

  const adminTrainerOptionsQuery = useStaffOrgTrainerOptions(org_id, role === 'admin' && !!org_id)
  const { data: legacyData, loading: legacyLoading } = useStaffStatisticheLegacy(
    org_id ?? null,
    rangeDays,
    shouldLoadLegacy,
  )

  useEffect(() => {
    if (role === 'trainer' && user?.id) {
      const label =
        user.full_name?.trim() ||
        [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
        'Trainer'
      setTrainerOptions([{ id: user.id, label }])
      setSelectedTrainerIds([user.id])
      setAdminTrainersReady(true)
      return
    }

    if (role !== 'admin') {
      setAdminTrainersReady(true)
      return
    }

    if (!org_id) {
      setAdminTrainersReady(true)
      setTrainerOptions([])
      setSelectedTrainerIds([])
      return
    }

    if (adminTrainerOptionsQuery.isLoading) {
      setAdminTrainersReady(false)
      return
    }

    const opts = adminTrainerOptionsQuery.data ?? []
    setTrainerOptions(opts)
    setSelectedTrainerIds(opts.map((o) => o.id))
    setAdminTrainersReady(true)
  }, [role, user, org_id, adminTrainerOptionsQuery.data, adminTrainerOptionsQuery.isLoading])

  const trainerReportEnabled =
    trainerMode && !!org_id && adminTrainersReady && selectedTrainerIds.length > 0

  const trainerReportQuery = useStaffTrainerAnalyticsReport(
    org_id,
    selectedTrainerIds,
    reportStart,
    reportEnd,
    trainerReportEnabled,
  )

  const trainerReport = trainerReportEnabled ? (trainerReportQuery.data ?? null) : null
  const trainerLoading = trainerReportEnabled && trainerReportQuery.isFetching

  const onToggleTrainerId = useCallback((id: string) => {
    setSelectedTrainerIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev
        return prev.filter((x) => x !== id)
      }
      return [...prev, id]
    })
  }, [])

  const trainerTabWaiting =
    trainerMode &&
    activeTab === 'trainer' &&
    (!adminTrainersReady || (selectedTrainerIds.length > 0 && trainerLoading))

  const legacyTabWaiting = shouldLoadLegacy && legacyLoading

  const growth = calculateStaffStatisticheGrowthMetrics(legacyData.trend)

  const trainerPanelHint =
    trainerMode && activeTab === 'trainer'
      ? !org_id
        ? 'no_org'
        : role === 'admin' && adminTrainersReady && trainerOptions.length === 0
          ? 'no_trainers'
          : selectedTrainerIds.length === 0 && adminTrainersReady
            ? 'none_selected'
            : null
      : null

  const trainerPanelLoading =
    trainerMode &&
    activeTab === 'trainer' &&
    !!org_id &&
    selectedTrainerIds.length > 0 &&
    trainerLoading

  const headerRefreshing = authLoading || trainerTabWaiting || legacyTabWaiting
  const showTrainerExportPanel = !authLoading && trainerMode && activeTab === 'trainer'
  const pageDescription = authLoading
    ? 'Caricamento profilo…'
    : trainerMode
      ? 'Metriche trainer: atleti, attività ed economia'
      : 'Performance e trend dell’organizzazione'

  return (
    <StaffContentLayout
      title="Statistiche"
      description={pageDescription}
      theme="teal"
      actions={
        <StatisticheHeaderActions
          authReady={!authLoading}
          trainerMode={trainerMode}
          showAdminLegacyTab={showAdminLegacyTab}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          selectedPeriod={period}
          onPeriodChange={setPeriod}
          isRefreshing={headerRefreshing}
          legacyData={legacyData}
          trainerReportForExport={showTrainerExportPanel ? trainerReport : null}
        />
      }
    >
      <StatistichePageContent
        authReady={!authLoading}
        trainerMode={trainerMode}
        trainerReport={trainerReport}
        trainerPanelLoading={trainerPanelLoading}
        trainerPanelHint={trainerPanelHint}
        trainerOptions={trainerOptions}
        selectedTrainerIds={selectedTrainerIds}
        onToggleTrainerId={onToggleTrainerId}
        showAdminLegacyTab={showAdminLegacyTab}
        activeTab={activeTab}
        legacyData={legacyData}
        legacyGrowth={growth}
      />
    </StaffContentLayout>
  )
}
