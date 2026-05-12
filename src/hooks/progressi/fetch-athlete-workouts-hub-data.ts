import { createClient } from '@/lib/supabase/client'

export interface AthleteWorkoutsHubSchedaRow {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  created_at: string | null
  description: string | null
  objective: string | null
  difficulty: string | null
  is_draft: boolean
}

export interface AthleteWorkoutsHubLogRow {
  id: string
  data: string | null
  completato: boolean | null
  scheda_id: string | null
  created_at: string | null
  durata_minuti: number | null
  duration_minutes: number | null
  esercizi_completati: number | null
  esercizi_totali: number | null
  stato: string | null
  is_coached: boolean
  workout_day_id: string | null
}

export interface AthleteWorkoutsHubDayRow {
  id: string
  day_name: string
  day_number: number
  title: string | null
}

export interface AthleteWorkoutsHubAppointmentRow {
  id: string
  starts_at: string
  status: string | null
  type: string
  trainer_name: string | null
}

export interface AthleteWorkoutsHubData {
  schede: AthleteWorkoutsHubSchedaRow[]
  workoutLogs: AthleteWorkoutsHubLogRow[]
  appointments: AthleteWorkoutsHubAppointmentRow[]
  workoutDaysById: Record<string, AthleteWorkoutsHubDayRow>
  giorniPerScheda: Record<string, number>
}

export async function fetchAthleteWorkoutsHubData(
  athleteId: string,
): Promise<AthleteWorkoutsHubData> {
  const supabase = createClient()

  const [workoutPlans, workoutLogsRes, athleteAppointments] = await Promise.all([
    supabase
      .from('workout_plans')
      .select(
        'id, name, start_date, end_date, is_active, created_at, description, objective, difficulty, is_draft',
      )
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false }),
    supabase
      .from('workout_logs')
      .select(
        'id, data, completato, scheda_id, created_at, durata_minuti, duration_minutes, esercizi_completati, esercizi_totali, stato, is_coached, workout_day_id',
      )
      .or(`atleta_id.eq.${athleteId},athlete_id.eq.${athleteId}`)
      .order('data', { ascending: false, nullsFirst: false })
      .limit(100),
    supabase
      .from('appointments')
      .select('id, starts_at, status, type, trainer_name')
      .eq('athlete_id', athleteId)
      .order('starts_at', { ascending: false })
      .limit(100),
  ])

  const errs = [workoutPlans.error, workoutLogsRes.error, athleteAppointments.error].filter(
    Boolean,
  ) as { message: string }[]

  if (errs.length > 0) {
    throw new Error(errs.map((e) => e.message).join(' · '))
  }

  const plansData = (workoutPlans.data ?? []) as AthleteWorkoutsHubSchedaRow[]
  const logsData = (workoutLogsRes.data ?? []) as AthleteWorkoutsHubLogRow[]

  const planIds = plansData.map((p) => p.id)
  const dayIds = [
    ...new Set(
      logsData
        .map((l) => l.workout_day_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  ]

  let dayByPlanRows: { workout_plan_id: string | null }[] | null = null
  if (planIds.length > 0) {
    const dayCountRes = await supabase
      .from('workout_days')
      .select('workout_plan_id')
      .in('workout_plan_id', planIds)
    if (dayCountRes.error) {
      throw new Error(dayCountRes.error.message)
    }
    dayByPlanRows = dayCountRes.data
  }

  let dayDetailRows: AthleteWorkoutsHubDayRow[] | null = null
  if (dayIds.length > 0) {
    const dayDetailRes = await supabase
      .from('workout_days')
      .select('id, day_name, day_number, title')
      .in('id', dayIds)
    if (dayDetailRes.error) {
      throw new Error(dayDetailRes.error.message)
    }
    dayDetailRows = (dayDetailRes.data ?? []) as AthleteWorkoutsHubDayRow[]
  }

  const giorniCount: Record<string, number> = {}
  if (dayByPlanRows) {
    for (const row of dayByPlanRows) {
      const pid = row.workout_plan_id
      if (pid) giorniCount[pid] = (giorniCount[pid] ?? 0) + 1
    }
  }

  const dayMap: Record<string, AthleteWorkoutsHubDayRow> = {}
  if (dayDetailRows) {
    for (const d of dayDetailRows) {
      dayMap[d.id] = d
    }
  }

  return {
    schede: plansData,
    workoutLogs: logsData,
    appointments: (athleteAppointments.data ?? []) as AthleteWorkoutsHubAppointmentRow[],
    workoutDaysById: dayMap,
    giorniPerScheda: giorniCount,
  }
}
