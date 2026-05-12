'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

export type WorkoutHistoryPeriod = '7d' | '30d' | '90d' | 'all'

export interface AthleteWorkoutHistoryLog {
  id: string
  atleta_id: string
  scheda_id: string | null
  data: string
  stato: string | null
  durata_minuti: number | null
  note: string | null
  created_at: string | null
  started_at: string
  completed_at: string | null
  duration_minutes: number | null
  is_coached: boolean
  workout: {
    titolo: string
    descrizione: string | null
  } | null
}

export interface AthleteWorkoutHistoryStats {
  solo_count: number
  coached_count: number
  total_hours: number
}

const COMPLETED_STATI = ['completato', 'completed'] as const

export function isCompletedStato(stato: string | null | undefined): boolean {
  if (!stato) return false
  const s = stato.toLowerCase().trim()
  return COMPLETED_STATI.includes(s as (typeof COMPLETED_STATI)[number])
}

/** YYYY-MM-DD nel fuso locale (evita shift rispetto a toISOString().split('T')[0]). */
function toLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function resolveStartDateKey(period: WorkoutHistoryPeriod): string | null {
  if (period === 'all') return null
  const startOfPeriod = new Date()
  startOfPeriod.setHours(0, 0, 0, 0)
  if (period === '7d') {
    startOfPeriod.setDate(startOfPeriod.getDate() - 7)
  } else if (period === '30d') {
    startOfPeriod.setDate(startOfPeriod.getDate() - 30)
  } else {
    startOfPeriod.setDate(startOfPeriod.getDate() - 90)
  }
  return toLocalYmd(startOfPeriod)
}

async function fetchAthleteWorkoutHistory(
  profileId: string,
  period: WorkoutHistoryPeriod,
): Promise<{ workouts: AthleteWorkoutHistoryLog[]; stats: AthleteWorkoutHistoryStats }> {
  const supabase = createClient()
  const startDateKey = resolveStartDateKey(period)

  let query = supabase
    .from('workout_logs')
    .select(
      `
      id,
      atleta_id,
      scheda_id,
      data,
      stato,
      completato,
      durata_minuti,
      note,
      created_at,
      is_coached,
      completed_at,
      scheda:workout_plans (
        name,
        description
      )
    `,
    )
    .or(`atleta_id.eq.${profileId},athlete_id.eq.${profileId}`)

  if (startDateKey) {
    query = query.or(`data.gte.${startDateKey},completed_at.gte.${startDateKey}`)
  }

  query = query
    .or('stato.eq.completato,stato.eq.completed,completato.eq.true')
    .order('data', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })

  const { data: workoutData, error: workoutError } = await query
  if (workoutError) throw workoutError

  const rows = (workoutData ?? []) as Array<{
    id: string
    atleta_id: string
    scheda_id: string | null
    data: string
    stato: string | null
    completato?: boolean | null
    durata_minuti: number | null
    note: string | null
    created_at: string | null
    is_coached?: boolean
    completed_at?: string | null
    scheda?: { name?: string; description?: string | null } | null
  }>

  const workouts = rows.map((w) => {
    const scheda = Array.isArray(w.scheda) ? w.scheda[0] : w.scheda
    const dataOrCreated = w.data || w.created_at || new Date().toISOString()
    const done = isCompletedStato(w.stato) || w.completato === true
    return {
      id: w.id,
      atleta_id: w.atleta_id,
      scheda_id: w.scheda_id,
      data: w.data,
      stato: w.stato,
      durata_minuti: w.durata_minuti,
      note: w.note,
      created_at: w.created_at,
      started_at: dataOrCreated,
      completed_at: done ? (w.completed_at ?? w.created_at ?? dataOrCreated) : null,
      duration_minutes: w.durata_minuti,
      is_coached: w.is_coached ?? false,
      workout: scheda
        ? { titolo: scheda.name ?? 'Allenamento', descrizione: scheda.description ?? null }
        : null,
    }
  })

  const totalMinutes = rows.reduce((sum, w) => sum + (w.durata_minuti ?? 0), 0)
  const coachedCount = rows.filter((w) => Boolean(w.is_coached)).length

  return {
    workouts,
    stats: {
      solo_count: rows.length - coachedCount,
      coached_count: coachedCount,
      total_hours: Math.round((totalMinutes / 60) * 10) / 10,
    },
  }
}

export function useAthleteWorkoutHistory(
  profileId: string | null,
  period: WorkoutHistoryPeriod,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.progressi.workoutHistory(profileId ?? '', period),
    queryFn: () => fetchAthleteWorkoutHistory(profileId!, period),
    enabled: Boolean(profileId) && (options?.enabled ?? true),
    staleTime: 3 * 60 * 1000,
  })
}
