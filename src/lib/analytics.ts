// 📊 Analytics Engine — 22Club

import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('Analytics')

export interface TrendData {
  day: string
  allenamenti: number
  documenti: number
  ore_totali: number
}

export interface DistributionData {
  type: string
  count: number
  percentage: number
  [key: string]: string | number
}

export interface PerformanceData {
  athlete_id: string
  athlete_name: string
  total_workouts: number
  avg_duration: number
  completion_rate: number
}

export interface AnalyticsData {
  trend: TrendData[]
  distribution: DistributionData[]
  performance: PerformanceData[]
  summary: {
    total_workouts: number
    total_documents: number
    total_hours: number
    active_athletes: number
  }
}

// Mock data per sviluppo
// Nota: DuckDB può essere integrato in futuro per analytics più complessi
// Vedi docs/duckdb-integration-evaluation.md per valutazione
// Nota: mockTrendData potrebbe essere usato in futuro per testing/mock
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockTrendData: TrendData[] = [
  { day: '2024-01-01', allenamenti: 12, documenti: 3, ore_totali: 8.5 },
  { day: '2024-01-02', allenamenti: 15, documenti: 5, ore_totali: 10.2 },
  { day: '2024-01-03', allenamenti: 8, documenti: 2, ore_totali: 6.1 },
  { day: '2024-01-04', allenamenti: 20, documenti: 7, ore_totali: 12.8 },
  { day: '2024-01-05', allenamenti: 18, documenti: 4, ore_totali: 11.5 },
  { day: '2024-01-06', allenamenti: 14, documenti: 6, ore_totali: 9.3 },
  { day: '2024-01-07', allenamenti: 16, documenti: 3, ore_totali: 10.7 },
  { day: '2024-01-08', allenamenti: 22, documenti: 8, ore_totali: 14.2 },
  { day: '2024-01-09', allenamenti: 19, documenti: 5, ore_totali: 12.1 },
  { day: '2024-01-10', allenamenti: 17, documenti: 4, ore_totali: 11.3 },
  { day: '2024-01-11', allenamenti: 21, documenti: 6, ore_totali: 13.8 },
  { day: '2024-01-12', allenamenti: 13, documenti: 3, ore_totali: 8.9 },
  { day: '2024-01-13', allenamenti: 25, documenti: 9, ore_totali: 16.4 },
  { day: '2024-01-14', allenamenti: 23, documenti: 7, ore_totali: 15.1 },
]

const mockDistributionData: DistributionData[] = [
  { type: 'allenamento', count: 45, percentage: 60 },
  { type: 'consulenza', count: 20, percentage: 27 },
  { type: 'valutazione', count: 8, percentage: 11 },
  { type: 'recupero', count: 2, percentage: 2 },
]

const mockPerformanceData: PerformanceData[] = [
  {
    athlete_id: '1',
    athlete_name: 'Mario Rossi',
    total_workouts: 12,
    avg_duration: 65,
    completion_rate: 95,
  },
  {
    athlete_id: '2',
    athlete_name: 'Giulia Bianchi',
    total_workouts: 8,
    avg_duration: 70,
    completion_rate: 88,
  },
  {
    athlete_id: '3',
    athlete_name: 'Luca Verdi',
    total_workouts: 15,
    avg_duration: 55,
    completion_rate: 92,
  },
  {
    athlete_id: '4',
    athlete_name: 'Sofia Neri',
    total_workouts: 6,
    avg_duration: 75,
    completion_rate: 85,
  },
  {
    athlete_id: '5',
    athlete_name: 'Marco Blu',
    total_workouts: 10,
    avg_duration: 60,
    completion_rate: 90,
  },
]

// Funzione principale per ottenere i dati analytics
// Nota: orgId potrebbe essere usato in futuro per multi-tenant
export async function getAnalyticsData(orgId?: string): Promise<AnalyticsData> {
  // Usa unstable_cache per cache di 5 minuti per ridurre query ripetute
  return unstable_cache(
    async () => {
      try {
        const supabase = await createClient()

        // Esegui query in parallelo per migliorare performance
        const [trend, distribution, performance] = await Promise.all([
          // 1. TREND DATA - Ultimi 14 giorni
          getTrendDataFromDB(supabase, 14),
          // 2. DISTRIBUTION DATA - Distribuzione per tipo di appuntamento
          getDistributionDataFromDB(supabase),
          // 3. PERFORMANCE DATA - Performance atleti
          getPerformanceDataFromDB(supabase),
        ])

        // 4. SUMMARY - Calcolato dai dati reali
        const summary = {
          total_workouts: trend.reduce((sum, day) => sum + day.allenamenti, 0),
          total_documents: trend.reduce((sum, day) => sum + day.documenti, 0),
          total_hours: trend.reduce((sum, day) => sum + day.ore_totali, 0),
          active_athletes: performance.length,
        }

        return {
          trend,
          distribution,
          performance,
          summary,
        }
      } catch (error) {
        logger.error('Errore nel caricamento dati analytics', error)

        // Fallback con dati vuoti
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
    },
    [`analytics-${orgId || 'default'}`],
    { revalidate: 300, tags: ['analytics'] }, // Cache di 5 minuti (300 secondi)
  )()
}

// Funzione per ottenere trend data dal database
async function getTrendDataFromDB(
  supabase: Awaited<ReturnType<typeof createClient>>,
  days: number = 14,
): Promise<TrendData[]> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Query per allenamenti giornalieri (workout_logs)
    // Usa CAST per gestire sia DATE che TIMESTAMP
    const { data: workoutLogs, error: workoutsError } = await supabase
      .from('workout_logs')
      .select('data, durata_minuti, stato')
      .gte('data', startDate.toISOString().split('T')[0])
      .lte('data', endDate.toISOString().split('T')[0])
      .in('stato', ['completato', 'completed', 'in_corso', 'in_progress'])

    if (workoutsError) {
      logger.warn('Errore caricamento workout_logs', { error: workoutsError })
    }

    // Query per documenti giornalieri
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (documentsError) {
      logger.warn('Errore caricamento documents', { error: documentsError })
    }

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
      type WorkoutLogRow = {
        data?: string | Date | unknown
        durata_minuti?: number | null
        [key: string]: unknown
      }
      const typedLogs = (workoutLogs as WorkoutLogRow[]) || []
      typedLogs.forEach((log) => {
        // Gestisci sia DATE che TIMESTAMP
        let dayKey: string
        const logData = log.data as string | Date | unknown
        if (typeof logData === 'string') {
          dayKey = logData.split('T')[0]
        } else if (logData instanceof Date) {
          dayKey = logData.toISOString().split('T')[0]
        } else {
          // Se è un oggetto con proprietà date, estrai la stringa
          dayKey = String(logData).split('T')[0]
        }

        const existing = trendMap.get(dayKey) || { allenamenti: 0, documenti: 0, ore_totali: 0 }
        existing.allenamenti += 1
        existing.ore_totali += (log.durata_minuti || 0) / 60 // Converti minuti in ore
        trendMap.set(dayKey, existing)
      })
    }

    // Popola documenti
    if (documents) {
      type DocumentRow = {
        created_at?: string | Date | null
        [key: string]: unknown
      }
      const typedDocs = (documents as DocumentRow[]) || []
      typedDocs.forEach((doc) => {
        const dayKey = new Date(doc.created_at || new Date()).toISOString().split('T')[0]
        const existing = trendMap.get(dayKey) || { allenamenti: 0, documenti: 0, ore_totali: 0 }
        existing.documenti += 1
        trendMap.set(dayKey, existing)
      })
    }

    // Converti in array e ordina
    const trend: TrendData[] = Array.from(trendMap.entries())
      .map(([day, data]) => ({
        day,
        allenamenti: data.allenamenti,
        documenti: data.documenti,
        ore_totali: Math.round(data.ore_totali * 10) / 10, // Arrotonda a 1 decimale
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())

    return trend
  } catch (error) {
    logger.error('Errore getTrendDataFromDB', error)
    return []
  }
}

// Funzione per ottenere distribution data dal database (ottimizzata con RPC)
async function getDistributionDataFromDB(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<DistributionData[]> {
  try {
    // Prova prima con RPC function ottimizzata
    // Workaround necessario per tipizzazione Supabase RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
      'get_analytics_distribution_data',
    )

    type DistributionRpcRow = {
      type: string
      count: number
      percentage: number
    }

    if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      const typedRpcData = rpcData as DistributionRpcRow[]
      return typedRpcData.map((row) => ({
        type: row.type || 'altro',
        count: Number(row.count) || 0,
        percentage: Number(row.percentage) || 0,
      }))
    }

    // Fallback: query diretta se RPC non disponibile
    logger.warn('RPC get_analytics_distribution_data non disponibile, uso query diretta', {
      error: rpcError,
    })

    // Query per distribuzione per tipo di appuntamento
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('type')
      .not('type', 'is', null)

    if (appointmentsError) {
      logger.warn('Errore caricamento appointments', { error: appointmentsError })
      return mockDistributionData
    }

    // Raggruppa per tipo
    const typeCount = new Map<string, number>()
    let total = 0

    if (appointments) {
      type AppointmentRow = {
        type?: string | null
        [key: string]: unknown
      }
      const typedAppointments = (appointments as AppointmentRow[]) || []
      typedAppointments.forEach((apt) => {
        const type = apt.type || 'altro'
        typeCount.set(type, (typeCount.get(type) || 0) + 1)
        total += 1
      })
    }

    // Converti in array con percentuali
    const distribution: DistributionData[] = Array.from(typeCount.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return distribution.length > 0 ? distribution : mockDistributionData
  } catch (error) {
    logger.error('Errore getDistributionDataFromDB', error)
    return mockDistributionData
  }
}

// Funzione per ottenere performance data dal database (ottimizzata con RPC)
async function getPerformanceDataFromDB(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<PerformanceData[]> {
  try {
    // Prova prima con RPC function ottimizzata
    // Workaround necessario per tipizzazione Supabase RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
      'get_analytics_performance_data',
      {
        p_limit: 20,
      },
    )

    type PerformanceRpcRow = {
      athlete_id: string
      athlete_name: string
      total_workouts: number
      avg_duration: number
      completion_rate: number
    }

    if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      const typedRpcData = rpcData as PerformanceRpcRow[]
      return typedRpcData.map((row) => ({
        athlete_id: row.athlete_id || '',
        athlete_name: row.athlete_name || 'Atleta',
        total_workouts: Number(row.total_workouts) || 0,
        avg_duration: Number(row.avg_duration) || 0,
        completion_rate: Number(row.completion_rate) || 0,
      }))
    }

    // Fallback: usa la vista workout_completion_rate_view se disponibile
    logger.warn('RPC get_analytics_performance_data non disponibile, uso vista', {
      error: rpcError,
    })

    const { data: completionRates, error: viewError } = await supabase
      .from('workout_completion_rate_view')
      .select('*')
      .limit(20) // Top 20 atleti

    if (!viewError && completionRates && completionRates.length > 0) {
      // Type assertion per la view
      type WorkoutCompletionRateView = {
        athlete_id: string
        nome_atleta: string
        schede_assegnate: number
        schede_completate: number
        schede_attive: number
        percentuale_completamento: number
      }
      const typedRates = completionRates as unknown as WorkoutCompletionRateView[]

      // Query per durata media allenamenti
      const athleteIds = typedRates.map((cr) => cr.athlete_id)

      // Query workout logs - usa OR per gestire sia atleta_id che athlete_id
      // Query workout logs - filtra per athleteIds
      // Nota: la vista workout_completion_rate_view usa athlete_id che corrisponde a profiles.id
      // workout_logs.atleta_id potrebbe riferirsi a profiles.id o profiles.user_id
      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('atleta_id, athlete_id, durata_minuti, stato')
        .in('stato', ['completato', 'completed'])

      // Type assertion per workout logs
      type WorkoutLogRow = {
        atleta_id?: string | null
        athlete_id?: string | null
        durata_minuti?: number | null
        stato?: string | null
        [key: string]: unknown
      }

      // Filtra per athleteIds (dalla vista, sono già i profili corretti)
      // Gestisci sia atleta_id che athlete_id
      const typedLogs = (workoutLogs as WorkoutLogRow[]) || []
      const filteredLogs = typedLogs.filter((log) => {
        const logAthleteId = log.atleta_id || log.athlete_id
        return logAthleteId && athleteIds.includes(logAthleteId)
      })

      // Calcola durata media per atleta
      const durationMap = new Map<string, { total: number; count: number }>()
      filteredLogs.forEach((log) => {
        const athleteId = log.atleta_id || log.athlete_id
        if (athleteId) {
          const existing = durationMap.get(athleteId) || { total: 0, count: 0 }
          existing.total += log.durata_minuti || 0
          existing.count += 1
          durationMap.set(athleteId, existing)
        }
      })

      // Combina dati
      const performance: PerformanceData[] = typedRates.map((cr) => {
        const duration = durationMap.get(cr.athlete_id)
        const avgDuration = duration && duration.count > 0 ? duration.total / duration.count : 0

        return {
          athlete_id: cr.athlete_id,
          athlete_name: cr.nome_atleta || 'Atleta',
          total_workouts: cr.schede_assegnate || 0,
          avg_duration: Math.round(avgDuration),
          completion_rate: cr.percentuale_completamento || 0,
        }
      })

      return performance
    }

    // Fallback: query diretta se la vista non esiste
    const { data: athletes, error: athletesError } = await supabase
      .from('profiles')
      .select('id, user_id, nome, cognome, first_name, last_name')
      .in('role', ['atleta', 'athlete'])
      .limit(20)

    if (athletesError || !athletes || athletes.length === 0) {
      return mockPerformanceData
    }

    // Type assertion per athletes
    type AthleteRow = {
      id?: string | null
      user_id?: string | null
      nome?: string | null
      cognome?: string | null
      first_name?: string | null
      last_name?: string | null
      [key: string]: unknown
    }

    const typedAthletes = (athletes as AthleteRow[]) || []
    const athleteIds = typedAthletes.map((a) => a.id || a.user_id).filter(Boolean) as string[]

    // Query workout logs per questi atleti
    // Usa OR per gestire sia atleta_id che athlete_id
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('atleta_id, athlete_id, durata_minuti, stato')
      .in('stato', ['completato', 'completed'])

    // Type assertion per logs
    type WorkoutLogRow = {
      atleta_id?: string | null
      athlete_id?: string | null
      durata_minuti?: number | null
      stato?: string | null
      [key: string]: unknown
    }

    // Filtra lato client per gestire sia atleta_id che athlete_id
    const typedLogs = (logs as WorkoutLogRow[]) || []
    const filteredLogs = typedLogs.filter((log) => {
      const logAthleteId = log.atleta_id || log.athlete_id
      return logAthleteId && athleteIds.includes(logAthleteId)
    })

    // Query workout plans per questi atleti
    const { data: plans } = await supabase
      .from('workout_plans')
      .select('athlete_id, is_active')
      .in('athlete_id', athleteIds)

    // Type assertion per plans
    type WorkoutPlanRow = {
      athlete_id?: string | null
      is_active?: boolean | null
      [key: string]: unknown
    }
    const typedPlans = (plans as WorkoutPlanRow[]) || []

    // Calcola statistiche per atleta
    const performance: PerformanceData[] = typedAthletes
      .map((athlete) => {
        const athleteId = athlete.id || athlete.user_id
        if (!athleteId) return null

        const athleteLogs = filteredLogs.filter(
          (log) => (log.atleta_id || log.athlete_id) === athleteId,
        )
        const athletePlans = typedPlans.filter((plan) => plan.athlete_id === athleteId)

        const totalWorkouts = athletePlans.length
        const completedWorkouts = athletePlans.filter((p) => !p.is_active).length
        const completionRate =
          totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0

        const durations = athleteLogs.map((log) => log.durata_minuti || 0).filter((d) => d > 0)
        const avgDuration =
          durations.length > 0
            ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
            : 0

        return {
          athlete_id: athleteId,
          athlete_name:
            `${athlete.nome || athlete.first_name || ''} ${athlete.cognome || athlete.last_name || ''}`.trim() ||
            'Atleta',
          total_workouts: totalWorkouts,
          avg_duration: avgDuration,
          completion_rate: completionRate,
        }
      })
      .filter((p): p is PerformanceData => p !== null)

    return performance.filter((p) => p.total_workouts > 0).slice(0, 20)
  } catch (error) {
    logger.error('Errore getPerformanceDataFromDB', error)
    return mockPerformanceData
  }
}

// Funzione per ottenere trend specifici
export async function getTrendData(orgId?: string, days: number = 14): Promise<TrendData[]> {
  const data = await getAnalyticsData(orgId)
  return data.trend.slice(0, days)
}

// Funzione per ottenere distribuzione per tipo
export async function getDistributionData(orgId?: string): Promise<DistributionData[]> {
  const data = await getAnalyticsData(orgId)
  return data.distribution
}

// Funzione per ottenere performance atleti
export async function getPerformanceData(orgId?: string): Promise<PerformanceData[]> {
  const data = await getAnalyticsData(orgId)
  return data.performance
}

// Funzione per calcolare metriche di crescita
export function calculateGrowthMetrics(trend: TrendData[]) {
  if (trend.length < 2) {
    return { workouts_growth: 0, documents_growth: 0, hours_growth: 0 }
  }

  const current = trend[0]
  const previous = trend[1]

  const workouts_growth =
    previous.allenamenti > 0
      ? ((current.allenamenti - previous.allenamenti) / previous.allenamenti) * 100
      : 0

  const documents_growth =
    previous.documenti > 0
      ? ((current.documenti - previous.documenti) / previous.documenti) * 100
      : 0

  const hours_growth =
    previous.ore_totali > 0
      ? ((current.ore_totali - previous.ore_totali) / previous.ore_totali) * 100
      : 0

  return {
    workouts_growth: Math.round(workouts_growth * 100) / 100,
    documents_growth: Math.round(documents_growth * 100) / 100,
    hours_growth: Math.round(hours_growth * 100) / 100,
  }
}

// Funzione per filtrare dati per periodo
export function filterByPeriod(
  data: TrendData[],
  period: 'week' | 'month' | 'quarter' | 'year',
): TrendData[] {
  const now = new Date()
  const cutoff = new Date()

  switch (period) {
    case 'week':
      cutoff.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoff.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      cutoff.setMonth(now.getMonth() - 3)
      break
    case 'year':
      cutoff.setFullYear(now.getFullYear() - 1)
      break
  }

  return data.filter((item) => new Date(item.day) >= cutoff)
}
