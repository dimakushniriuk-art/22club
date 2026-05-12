import { createLogger } from '@/lib/logger'
import type { AnalyticsData, TrendData } from '@/lib/analytics'
import { classifyWorkoutAppointmentForTrend } from '@/lib/analytics-workout-bookings-trend'
import { EMPTY_STAFF_LEGACY_ANALYTICS } from '@/lib/analytics/staff-statistiche-helpers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('lib:analytics:fetch-staff-legacy-analytics')

export async function fetchStaffLegacyAnalytics(
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
    return { ...EMPTY_STAFF_LEGACY_ANALYTICS }
  }
}