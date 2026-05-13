'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { queryKeys } from '@/lib/query-keys'
import { createLogger } from '@/lib/logger'
import type { Workout } from '@/types/workout'

const logger = createLogger('hooks:use-athlete-workout-plan-detail')

export type AthleteWorkoutPlanDayRow = {
  id: string
  day_number: number | null
  day_name: string | null
  title: string | null
}

export type AthleteWorkoutPlanDetail = {
  planName: string
  planDescription: string | null
  staffName: string | null
  days: AthleteWorkoutPlanDayRow[]
  dayCompletedById: Record<string, number>
}

function formatStaffName(
  row: { nome?: string | null; cognome?: string | null } | null,
): string | null {
  if (!row) return null
  const name = `${row.nome ?? ''} ${row.cognome ?? ''}`.trim()
  return name || null
}

async function fetchAthleteWorkoutPlanDetail(
  supabase: SupabaseClient<Database>,
  athleteProfileId: string,
  planId: string,
  cachedPlan?: Workout,
): Promise<AthleteWorkoutPlanDetail> {
  let planName = 'Scheda'
  let planDescription: string | null = null
  let staffName: string | null = null
  let creatorId: string | null = null
  const planFromCache = cachedPlan?.id === planId ? cachedPlan : undefined

  if (planFromCache) {
    planName = (planFromCache.name ?? 'Scheda').trim() || 'Scheda'
    planDescription = planFromCache.description?.trim() ? planFromCache.description : null
    const cachedStaff = planFromCache.staff_name?.trim()
    staffName = cachedStaff || null
    creatorId = !cachedStaff ? (planFromCache.created_by_staff_id ?? null) : null
  } else {
    const { data: plan, error: planErr } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', planId)
      .eq('athlete_id', athleteProfileId)
      .maybeSingle()

    if (planErr) {
      logger.error('Errore caricamento workout_plans', planErr, { planId })
      throw planErr
    }
    if (!plan || (plan as { is_draft?: boolean | null }).is_draft) {
      throw new Error('Scheda non trovata')
    }

    const row = plan as {
      name?: string | null
      description?: string | null
      created_by_profile_id?: string | null
    }
    planName = (row.name ?? 'Scheda').trim() || 'Scheda'
    planDescription = row.description?.trim() ? row.description : null
    creatorId = row.created_by_profile_id ?? null
  }

  const [daysResult, creatorResult] = await Promise.all([
    supabase
      .from('workout_days')
      .select('id, day_number, day_name, title')
      .eq('workout_plan_id', planId)
      .order('day_number', { ascending: true }),
    creatorId
      ? supabase.from('profiles').select('nome, cognome').eq('id', creatorId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const { data: daysData, error: daysErr } = daysResult
  if (daysErr) {
    logger.error('Errore caricamento workout_days', daysErr, { planId })
    throw daysErr
  }

  const creatorStaffName = formatStaffName(
    creatorResult.data as { nome?: string | null; cognome?: string | null } | null,
  )
  if (creatorStaffName) {
    staffName = creatorStaffName
  }

  const dayRows = (daysData ?? []) as AthleteWorkoutPlanDayRow[]
  const dayCompletedById: Record<string, number> = {}
  for (const day of dayRows) {
    dayCompletedById[day.id] = 0
  }

  if (dayRows.length > 0) {
    const dayIds = dayRows.map((day) => day.id)
    const { data: completedLogs, error: logsErr } = await supabase
      .from('workout_logs')
      .select('workout_day_id')
      .eq('atleta_id', athleteProfileId)
      .eq('scheda_id', planId)
      .in('workout_day_id', dayIds)
      .in('stato', ['completato', 'completed'])

    if (logsErr) {
      logger.warn('Errore conteggio workout_logs per scheda', logsErr, { planId })
    } else {
      for (const row of completedLogs ?? []) {
        const dayId = (row as { workout_day_id?: string | null }).workout_day_id
        if (!dayId) continue
        dayCompletedById[dayId] = (dayCompletedById[dayId] ?? 0) + 1
      }
    }
  }

  return {
    planName,
    planDescription,
    staffName,
    days: dayRows,
    dayCompletedById,
  }
}

export function useAthleteWorkoutPlanDetail(
  athleteProfileId: string | null,
  planId: string | null,
  options?: { enabled?: boolean; athleteSubjectProfileId?: string | null },
) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const subjectProfileId = options?.athleteSubjectProfileId?.trim() ?? ''
  const queryEnabled = Boolean(athleteProfileId && planId) && (options?.enabled ?? true)

  return useQuery({
    queryKey: queryKeys.allenamenti.planDetail(athleteProfileId ?? '', planId ?? ''),
    queryFn: async () => {
      const cachedPlans = queryClient.getQueryData<Workout[]>(
        queryKeys.allenamenti.plans(athleteProfileId!, subjectProfileId),
      )
      const cachedPlan = cachedPlans?.find((workout) => workout.id === planId)
      return fetchAthleteWorkoutPlanDetail(supabase, athleteProfileId!, planId!, cachedPlan)
    },
    enabled: queryEnabled,
    staleTime: 3 * 60 * 1000,
  })
}
