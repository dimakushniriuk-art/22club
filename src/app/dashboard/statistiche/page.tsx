'use client'

import { useEffect, useState } from 'react'
import { StatistichePageContent } from '@/components/dashboard/statistiche-page-content'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import type { AnalyticsData, TrendData, DistributionData, PerformanceData } from '@/lib/analytics'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { Skeleton } from '@/components/shared/ui/skeleton'

const logger = createLogger('StatistichePage')

// Funzione client-side per calcolare growth metrics
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
  const workouts_growth = firstWorkouts > 0 ? ((secondWorkouts - firstWorkouts) / firstWorkouts) * 100 : 0

  const firstDocuments = firstHalf.reduce((sum, d) => sum + d.documenti, 0)
  const secondDocuments = secondHalf.reduce((sum, d) => sum + d.documenti, 0)
  const documents_growth = firstDocuments > 0 ? ((secondDocuments - firstDocuments) / firstDocuments) * 100 : 0

  const firstHours = firstHalf.reduce((sum, d) => sum + d.ore_totali, 0)
  const secondHours = secondHalf.reduce((sum, d) => sum + d.ore_totali, 0)
  const hours_growth = firstHours > 0 ? ((secondHours - firstHours) / firstHours) * 100 : 0

  return {
    workouts_growth: Math.round(workouts_growth * 10) / 10,
    documents_growth: Math.round(documents_growth * 10) / 10,
    hours_growth: Math.round(hours_growth * 10) / 10,
  }
}

// Funzione client-side per ottenere dati analytics
async function getAnalyticsDataClient(
  supabase: SupabaseClient<Database>,
  _orgId: string | null, // Prefisso _ indica che è intenzionalmente non usato (previsto per filtri futuri)
): Promise<AnalyticsData> {
  try {
    const days = 14
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Query per allenamenti giornalieri
    const { data: workoutLogs } = await supabase
      .from('workout_logs')
      .select('data, durata_minuti, stato')
      .gte('data', startDate.toISOString().split('T')[0])
      .lte('data', endDate.toISOString().split('T')[0])
      .in('stato', ['completato', 'completed', 'in_corso', 'in_progress'])

    // Query per documenti giornalieri
    const { data: documents } = await supabase
      .from('documents')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Raggruppa per giorno
    const trendMap = new Map<
      string,
      { allenamenti: number; documenti: number; ore_totali: number }
    >()

    // Inizializza tutti i giorni con 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dayKey = date.toISOString().split('T')[0]
      trendMap.set(dayKey, { allenamenti: 0, documenti: 0, ore_totali: 0 })
    }

    // Popola allenamenti
    if (workoutLogs) {
      workoutLogs.forEach((log: { data: string | null; durata_minuti: number | null; stato: string | null }) => {
        const logData = log.data as string | Date | unknown
        let dayKey: string
        if (typeof logData === 'string') {
          dayKey = logData.split('T')[0]
        } else if (logData instanceof Date) {
          dayKey = logData.toISOString().split('T')[0]
        } else {
          dayKey = String(logData).split('T')[0]
        }

        const existing = trendMap.get(dayKey) || { allenamenti: 0, documenti: 0, ore_totali: 0 }
        existing.allenamenti += 1
        existing.ore_totali += (log.durata_minuti || 0) / 60
        trendMap.set(dayKey, existing)
      })
    }

    // Popola documenti
    if (documents) {
      documents.forEach((doc: { created_at: string | null }) => {
        const docDate = (doc.created_at ?? '') as string | Date
        const dayKey =
          typeof docDate === 'string'
            ? docDate.split('T')[0]
            : docDate instanceof Date
              ? docDate.toISOString().split('T')[0]
              : String(docDate).split('T')[0]

        const existing = trendMap.get(dayKey) || { allenamenti: 0, documenti: 0, ore_totali: 0 }
        existing.documenti += 1
        trendMap.set(dayKey, existing)
      })
    }

    // Converti in array
    const trend: TrendData[] = Array.from(trendMap.entries())
      .map(([day, data]) => ({
        day,
        allenamenti: data.allenamenti,
        documenti: data.documenti,
        ore_totali: Math.round(data.ore_totali * 10) / 10,
      }))
      .sort((a, b) => a.day.localeCompare(b.day))

    // Query per distribuzione (semplificata)
    const { data: allWorkouts } = await supabase
      .from('workout_logs')
      .select('stato')
      .gte('data', startDate.toISOString().split('T')[0])

    const distribution: DistributionData[] = []
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

    // Query per performance (semplificata)
    const { data: performanceData } = await supabase
      .from('workout_logs')
      .select('athlete_id, durata_minuti, stato')
      .gte('data', startDate.toISOString().split('T')[0])

    const performance: PerformanceData[] = []
    if (performanceData) {
      const athleteMap = new Map<
        string,
        { workouts: number; totalDuration: number; completed: number }
      >()

      performanceData.forEach((w: { athlete_id: string | null; durata_minuti: number | null; stato: string | null }) => {
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
      })

      // Converti in array (semplificato, senza nome atleta)
      athleteMap.forEach((data, athleteId) => {
        performance.push({
          athlete_id: athleteId,
          athlete_name: `Atleta ${athleteId.slice(0, 8)}`,
          total_workouts: data.workouts,
          avg_duration: data.workouts > 0 ? Math.round(data.totalDuration / data.workouts) : 0,
          completion_rate: data.workouts > 0 ? Math.round((data.completed / data.workouts) * 100) : 0,
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
    return {
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
  }
}

export default function StatistichePage() {
  const { org_id } = useAuth()
  const supabase = useSupabaseClient()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true)
      try {
        const analyticsData = await getAnalyticsDataClient(supabase, org_id)
        if (cancelled) return
        setData(analyticsData)
      } catch (error) {
        if (!cancelled) logger.error('Errore caricamento statistiche', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [org_id, supabase])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const growth = calculateGrowthMetrics(data.trend)

  return <StatistichePageContent data={data} growth={growth} />
}
