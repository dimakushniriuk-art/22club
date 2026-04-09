'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  StatistichePageContent,
  STATS_PERIODS,
  type StatsPeriod,
  type StatisticheViewTab,
} from '@/components/dashboard/statistiche-page-content'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import type { AnalyticsData, TrendData } from '@/lib/analytics'
import { classifyWorkoutAppointmentForTrend } from '@/lib/analytics-workout-bookings-trend'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import {
  fetchOrgTrainerOptions,
  fetchTrainerAnalyticsReport,
  type TrainerAnalyticsReport,
} from '@/lib/trainer-analytics'

const logger = createLogger('StatistichePage')

const EMPTY_LEGACY: AnalyticsData = {
  trend: [],
  distribution: [],
  performance: [],
  summary: {
    total_workouts: 0,
    total_documents: 0,
    total_hours: 0,
    active_athletes: 0,
  },
}

function calculateGrowthMetrics(trend: TrendData[]) {
  if (trend.length < 2) {
    return {
      workouts_growth: 0,
      documents_growth: 0,
      hours_growth: 0,
    }
  }

  const firstHalf = trend.slice(0, Math.floor(trend.length / 2))
  const secondHalf = trend.slice(Math.floor(trend.length / 2))

  const firstWorkouts = firstHalf.reduce((sum, d) => sum + d.allenamenti, 0)
  const secondWorkouts = secondHalf.reduce((sum, d) => sum + d.allenamenti, 0)
  const workouts_growth =
    firstWorkouts > 0 ? ((secondWorkouts - firstWorkouts) / firstWorkouts) * 100 : 0

  const firstDocuments = firstHalf.reduce((sum, d) => sum + d.documenti, 0)
  const secondDocuments = secondHalf.reduce((sum, d) => sum + d.documenti, 0)
  const documents_growth =
    firstDocuments > 0 ? ((secondDocuments - firstDocuments) / firstDocuments) * 100 : 0

  const firstHours = firstHalf.reduce((sum, d) => sum + d.ore_totali, 0)
  const secondHours = secondHalf.reduce((sum, d) => sum + d.ore_totali, 0)
  const hours_growth = firstHours > 0 ? ((secondHours - firstHours) / firstHours) * 100 : 0

  return {
    workouts_growth: Math.round(workouts_growth * 10) / 10,
    documents_growth: Math.round(documents_growth * 10) / 10,
    hours_growth: Math.round(hours_growth * 10) / 10,
  }
}

async function getAnalyticsDataClient(
  supabase: SupabaseClient<Database>,
  orgId: string | null,
  rangeDays: number,
): Promise<AnalyticsData> {
  try {
    const days = Math.max(1, Math.min(rangeDays, 366 * 2))
    const endBoundary = new Date()
    endBoundary.setHours(23, 59, 59, 999)

    const startBoundary = new Date()
    startBoundary.setDate(endBoundary.getDate() - (days - 1))
    startBoundary.setHours(0, 0, 0, 0)

    const startDayKey = startBoundary.toISOString().split('T')[0]
    const endDayKey = endBoundary.toISOString().split('T')[0]

    const { data: workoutLogs } = await supabase
      .from('workout_logs')
      .select('data, durata_minuti, stato')
      .gte('data', startDayKey)
      .lte('data', endDayKey)
      .in('stato', ['completato', 'completed', 'in_corso', 'in_progress'])

    let documentsQuery = supabase
      .from('documents')
      .select('created_at')
      .gte('created_at', startBoundary.toISOString())
      .lte('created_at', endBoundary.toISOString())
    if (orgId) {
      documentsQuery = documentsQuery.eq('org_id', orgId)
    }
    const { data: documents } = await documentsQuery

    let appointmentsQuery = supabase
      .from('appointments')
      .select('starts_at, status, cancelled_at, athlete_id, type')
      .gte('starts_at', startBoundary.toISOString())
      .lte('starts_at', endBoundary.toISOString())
    if (orgId) {
      appointmentsQuery = appointmentsQuery.eq('org_id', orgId)
    }
    const { data: workoutAppointments } = await appointmentsQuery

    type TrendAgg = {
      allenamenti: number
      documenti: number
      ore_totali: number
      prenotati: number
      eseguiti: number
      annullati: number
      cancellati: number
    }

    const emptyAgg = (): TrendAgg => ({
      allenamenti: 0,
      documenti: 0,
      ore_totali: 0,
      prenotati: 0,
      eseguiti: 0,
      annullati: 0,
      cancellati: 0,
    })

    const trendMap = new Map<string, TrendAgg>()

    for (let i = 0; i < days; i++) {
      const date = new Date(startBoundary)
      date.setDate(date.getDate() + i)
      const dayKey = date.toISOString().split('T')[0]
      trendMap.set(dayKey, emptyAgg())
    }

    if (workoutLogs) {
      workoutLogs.forEach(
        (log: { data: string | null; durata_minuti: number | null; stato: string | null }) => {
          const logData = log.data as string | Date | unknown
          let dayKey: string
          if (typeof logData === 'string') {
            dayKey = logData.split('T')[0]
          } else if (logData instanceof Date) {
            dayKey = logData.toISOString().split('T')[0]
          } else {
            dayKey = String(logData).split('T')[0]
          }

          if (!trendMap.has(dayKey)) return

          const existing = trendMap.get(dayKey) ?? emptyAgg()
          existing.allenamenti += 1
          existing.ore_totali += (log.durata_minuti || 0) / 60
          trendMap.set(dayKey, existing)
        },
      )
    }

    if (documents) {
      documents.forEach((doc: { created_at: string | null }) => {
        const docDate = (doc.created_at ?? '') as string | Date
        const dayKey =
          typeof docDate === 'string'
            ? docDate.split('T')[0]
            : docDate instanceof Date
              ? docDate.toISOString().split('T')[0]
              : String(docDate).split('T')[0]

        if (!trendMap.has(dayKey)) return

        const existing = trendMap.get(dayKey) ?? emptyAgg()
        existing.documenti += 1
        trendMap.set(dayKey, existing)
      })
    }

    if (workoutAppointments) {
      for (const raw of workoutAppointments) {
        const bucket = classifyWorkoutAppointmentForTrend({
          athlete_id: raw.athlete_id,
          type: raw.type,
          status: raw.status,
          cancelled_at: raw.cancelled_at,
        })
        if (!bucket) continue
        const dayKey = new Date(raw.starts_at).toISOString().split('T')[0]
        if (!trendMap.has(dayKey)) continue
        const existing = trendMap.get(dayKey) ?? emptyAgg()
        existing[bucket] += 1
        trendMap.set(dayKey, existing)
      }
    }

    const trend: TrendData[] = Array.from(trendMap.entries())
      .map(([day, data]) => ({
        day,
        allenamenti: data.allenamenti,
        documenti: data.documenti,
        ore_totali: Math.round(data.ore_totali * 10) / 10,
        prenotati: data.prenotati,
        eseguiti: data.eseguiti,
        annullati: data.annullati,
        cancellati: data.cancellati,
      }))
      .sort((a, b) => a.day.localeCompare(b.day))

    const { data: allWorkouts } = await supabase
      .from('workout_logs')
      .select('stato')
      .gte('data', startDayKey)
      .lte('data', endDayKey)

    const distribution: AnalyticsData['distribution'] = []
    if (allWorkouts) {
      const statusCounts = new Map<string, number>()
      allWorkouts.forEach((w: { stato: string | null }) => {
        const status = (w.stato as string) || 'unknown'
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
      })

      const total = allWorkouts.length
      statusCounts.forEach((count, type) => {
        distribution.push({
          type,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        })
      })
    }

    const { data: performanceData } = await supabase
      .from('workout_logs')
      .select('athlete_id, durata_minuti, stato')
      .gte('data', startDayKey)
      .lte('data', endDayKey)

    const performance: AnalyticsData['performance'] = []
    if (performanceData) {
      const athleteMap = new Map<
        string,
        { workouts: number; totalDuration: number; completed: number }
      >()

      performanceData.forEach(
        (w: { athlete_id: string | null; durata_minuti: number | null; stato: string | null }) => {
          const athleteId = (w.athlete_id as string) || 'unknown'
          const existing = athleteMap.get(athleteId) || {
            workouts: 0,
            totalDuration: 0,
            completed: 0,
          }
          existing.workouts += 1
          existing.totalDuration += w.durata_minuti || 0
          if (w.stato === 'completato' || w.stato === 'completed') {
            existing.completed += 1
          }
          athleteMap.set(athleteId, existing)
        },
      )

      athleteMap.forEach((data, athleteId) => {
        performance.push({
          athlete_id: athleteId,
          athlete_name: `Atleta ${athleteId.slice(0, 8)}`,
          total_workouts: data.workouts,
          avg_duration: data.workouts > 0 ? Math.round(data.totalDuration / data.workouts) : 0,
          completion_rate:
            data.workouts > 0 ? Math.round((data.completed / data.workouts) * 100) : 0,
        })
      })
    }

    return {
      trend,
      distribution,
      performance,
      summary: {
        total_workouts: trend.reduce((sum, d) => sum + d.allenamenti, 0),
        total_documents: trend.reduce((sum, d) => sum + d.documenti, 0),
        total_hours: Math.round(trend.reduce((sum, d) => sum + d.ore_totali, 0) * 10) / 10,
        active_athletes: performance.length,
      },
    }
  } catch (error) {
    logger.error('Errore nel caricamento dati analytics', error)
    return { ...EMPTY_LEGACY }
  }
}

function daysForPeriod(period: StatsPeriod): number {
  const found = STATS_PERIODS.find((p) => p.id === period)
  return found?.days ?? 30
}

function boundariesForPeriod(rangeDays: number): { start: Date; end: Date } {
  const days = Math.max(1, Math.min(rangeDays, 366 * 2))
  const endBoundary = new Date()
  endBoundary.setHours(23, 59, 59, 999)
  const startBoundary = new Date()
  startBoundary.setDate(endBoundary.getDate() - (days - 1))
  startBoundary.setHours(0, 0, 0, 0)
  return { start: startBoundary, end: endBoundary }
}

export default function StatistichePage() {
  const { org_id, role, user, loading: authLoading } = useAuth()
  const supabase = useSupabaseClient()
  const [period, setPeriod] = useState<StatsPeriod>('month')
  const [activeTab, setActiveTab] = useState<StatisticheViewTab>('trainer')
  const [legacyData, setLegacyData] = useState<AnalyticsData>(EMPTY_LEGACY)
  const [legacyLoading, setLegacyLoading] = useState(false)
  const [trainerReport, setTrainerReport] = useState<TrainerAnalyticsReport | null>(null)
  const [trainerLoading, setTrainerLoading] = useState(false)
  const [trainerOptions, setTrainerOptions] = useState<{ id: string; label: string }[]>([])
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>([])
  const [adminTrainersReady, setAdminTrainersReady] = useState(role !== 'admin')

  const trainerMode = role === 'trainer' || role === 'admin'
  const showAdminLegacyTab = role === 'admin'
  /** Senza questo, con role ancora null si mostra (e si fetcha) la vista organizzazione → flash al refresh. */
  const shouldLoadLegacy = !authLoading && (!trainerMode || role === 'admin')

  const rangeDays = useMemo(() => daysForPeriod(period), [period])

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
    if (role !== 'admin' || !org_id) {
      if (role !== 'admin') {
        setAdminTrainersReady(true)
      } else {
        setAdminTrainersReady(true)
        setTrainerOptions([])
        setSelectedTrainerIds([])
      }
      return
    }
    let cancelled = false
    setAdminTrainersReady(false)
    void (async () => {
      try {
        const opts = await fetchOrgTrainerOptions(supabase, org_id)
        if (cancelled) return
        setTrainerOptions(opts)
        setSelectedTrainerIds(opts.map((o) => o.id))
      } catch (e) {
        logger.error('Caricamento lista trainer', e)
        if (!cancelled) {
          setTrainerOptions([])
          setSelectedTrainerIds([])
        }
      } finally {
        if (!cancelled) setAdminTrainersReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [role, user, org_id, supabase])

  useEffect(() => {
    if (!shouldLoadLegacy) {
      setLegacyData(EMPTY_LEGACY)
      return
    }
    let cancelled = false
    setLegacyLoading(true)
    void (async () => {
      try {
        const data = await getAnalyticsDataClient(supabase, org_id ?? null, rangeDays)
        if (!cancelled) setLegacyData(data)
      } catch (e) {
        logger.error('Caricamento legacy statistiche', e)
        if (!cancelled) setLegacyData({ ...EMPTY_LEGACY })
      } finally {
        if (!cancelled) setLegacyLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [shouldLoadLegacy, org_id, supabase, rangeDays])

  useEffect(() => {
    if (!trainerMode || !org_id || !adminTrainersReady) {
      setTrainerReport(null)
      return
    }
    if (selectedTrainerIds.length === 0) {
      setTrainerReport(null)
      return
    }
    let cancelled = false
    setTrainerLoading(true)
    const { start, end } = boundariesForPeriod(rangeDays)
    void (async () => {
      try {
        const rep = await fetchTrainerAnalyticsReport(supabase, {
          orgId: org_id,
          trainerIds: selectedTrainerIds,
          startBoundary: start,
          endBoundary: end,
        })
        if (!cancelled) setTrainerReport(rep)
      } catch (e) {
        logger.error('Caricamento analytics trainer', e)
        if (!cancelled) setTrainerReport(null)
      } finally {
        if (!cancelled) setTrainerLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    trainerMode,
    org_id,
    adminTrainersReady,
    selectedTrainerIds,
    supabase,
    rangeDays,
  ])

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

  const data = legacyData
  const growth = calculateGrowthMetrics(data.trend)

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

  return (
    <StatistichePageContent
      selectedPeriod={period}
      onPeriodChange={setPeriod}
      isRefreshing={authLoading || trainerTabWaiting || legacyTabWaiting}
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
      onActiveTabChange={setActiveTab}
      legacyData={data}
      legacyGrowth={growth}
    />
  )
}
