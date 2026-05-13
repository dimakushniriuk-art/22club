'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import { mergeOrphanWorkoutSetsIntoSetsByWdeIdAndRepair } from '@/lib/workout-sets-repair-orphan-log'
import { requestCoachedSessionDebitClient } from '@/lib/credits/request-coached-session-debit-client'
import type { Tables } from '@/types/supabase'
import { repsForVolumeKgRep } from '@/features/athlete-allenamenti/lib/riepilogo-helpers'
import type { AthleteWorkoutSummary } from '@/features/athlete-allenamenti/types/athlete-workout-summary'

const logger = createLogger('features:athlete-allenamenti:fetch-workout-summary')

export type FetchAthleteWorkoutSummaryArgs = {
  athleteProfileId: string
  workoutLogId?: string | null
  requestCoachedDebit?: boolean
  onCoachedDebitWarning?: () => void
}

export async function fetchAthleteWorkoutSummary(
  supabase: SupabaseClient<Database>,
  args: FetchAthleteWorkoutSummaryArgs,
): Promise<AthleteWorkoutSummary> {
  const {
    athleteProfileId,
    workoutLogId,
    requestCoachedDebit = false,
    onCoachedDebitWarning,
  } = args

  let workoutLog

  if (workoutLogId) {
    const { data, error: logError } = await supabase
      .from('workout_logs')
      .select(
        `
              *,
              scheda:workout_plans(
                id,
                name,
                workout_days(
                  id,
                  day_number,
                  title,
                  day_name,
                  workout_day_exercises(
                    id,
                    exercise_id,
                    target_sets,
                    target_reps,
                    target_weight,
                    exercises(id, name, muscle_group, equipment, difficulty, video_url, thumb_url, image_url, thumbnail_url)
                  )
                )
              )
            `,
      )
      .eq('id', workoutLogId)
      .eq('atleta_id', athleteProfileId)
      .in('stato', ['completato', 'completed'])
      .maybeSingle()

    if (logError) {
      logger.error('Errore query workout_log specifico', logError, {
        workoutLogId,
        athleteProfileId,
        errorCode: logError.code,
        errorMessage: logError.message,
        errorDetails: logError.details,
        errorHint: logError.hint,
      })
      throw logError
    }
    // Se il log non è ancora "completato", prova fallback per id (stesso atleta),
    // così evitiamo errore bloccante durante transizioni di stato.
    if (!data) {
      const { data: anyStateLog, error: anyStateErr } = await supabase
        .from('workout_logs')
        .select(
          `
              *,
              scheda:workout_plans(
                id,
                name,
                workout_days(
                  id,
                  day_number,
                  title,
                  day_name,
                  workout_day_exercises(
                    id,
                    exercise_id,
                    target_sets,
                    target_reps,
                    target_weight,
                    exercises(id, name, muscle_group, equipment, difficulty, video_url, thumb_url, image_url, thumbnail_url)
                  )
                )
              )
            `,
        )
        .eq('id', workoutLogId)
        .eq('atleta_id', athleteProfileId)
        .maybeSingle()

      if (anyStateErr) {
        logger.error('Errore query fallback workout_log specifico', anyStateErr, {
          workoutLogId,
          athleteProfileId,
          errorCode: anyStateErr.code,
          errorMessage: anyStateErr.message,
          errorDetails: anyStateErr.details,
          errorHint: anyStateErr.hint,
        })
        throw anyStateErr
      }
      workoutLog = anyStateLog
    } else {
      workoutLog = data
    }
  } else {
    // Recupera l'ultimo workout_log completato
    const { data, error: logError } = await supabase
      .from('workout_logs')
      .select(
        `
              *,
              scheda:workout_plans(
                id,
                name,
                workout_days(
                  id,
                  day_number,
                  title,
                  day_name,
                  workout_day_exercises(
                    id,
                    exercise_id,
                    target_sets,
                    target_reps,
                    target_weight,
                    exercises(id, name, muscle_group, equipment, difficulty, video_url, thumb_url, image_url, thumbnail_url)
                  )
                )
              )
            `,
      )
      .eq('atleta_id', athleteProfileId)
      .in('stato', ['completato', 'completed'])
      .order('data', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (logError) {
      logger.error('Errore query workout_log ultimo', logError, {
        athleteProfileId,
        errorCode: logError.code,
        errorMessage: logError.message,
        errorDetails: logError.details,
        errorHint: logError.hint,
      })
      throw logError
    }
    workoutLog = data
  }

  if (!workoutLog) {
    throw new Error('Nessun allenamento completato trovato')
  }

  // Type assertion per workoutLog (Supabase restituisce tipo never per query complesse)
  type WorkoutLogWithScheda = Pick<
    Tables<'workout_logs'>,
    'id' | 'scheda_id' | 'data' | 'created_at' | 'durata_minuti'
  > & {
    stato?: string | null
    note?: string | null
    workout_day_id?: string | null
    completed_at?: string | null
    is_coached?: boolean | null
    execution_mode?: string | null
    volume_totale?: number | null
    scheda?: {
      id?: string
      name?: string
      workout_days?: Array<{
        id?: string
        day_number?: number | null
        title?: string
        day_name?: string
        workout_day_exercises?: Array<{
          id?: string
          exercise_id?: string
          target_sets?: number
          target_reps?: number
          target_weight?: number
          exercises?: {
            id?: string
            name?: string
            muscle_group?: string
            equipment?: string
            difficulty?: string
            created_at?: string
            updated_at?: string
            video_url?: string | null
            thumb_url?: string | null
            image_url?: string | null
            thumbnail_url?: string | null
          }
        }>
      }>
    } | null
  }
  const typedWorkoutLog = workoutLog as WorkoutLogWithScheda

  // Carica set reali da workout_sets per questo workout_log (reps, peso eseguiti)
  const loadedWorkoutLogId = typedWorkoutLog.id
  const setsByWdeId = new Map<
    string,
    Array<{ set_number: number; reps: number; weight_kg: number; is_completed: boolean }>
  >()
  if (loadedWorkoutLogId) {
    const { data: setsRows } = await supabase
      .from('workout_sets')
      .select('workout_day_exercise_id, set_number, reps, weight_kg, completed_at')
      .eq('workout_log_id', loadedWorkoutLogId)
      .order('set_number', { ascending: true })
    if (setsRows?.length) {
      for (const row of setsRows as Array<{
        workout_day_exercise_id: string
        set_number: number
        reps: number | null
        weight_kg: number | null
        completed_at: string | null
      }>) {
        const wdeId = row.workout_day_exercise_id
        if (!setsByWdeId.has(wdeId)) setsByWdeId.set(wdeId, [])
        setsByWdeId.get(wdeId)!.push({
          set_number: row.set_number,
          reps: row.reps ?? 0,
          weight_kg: row.weight_kg ?? 0,
          is_completed: Boolean(row.completed_at),
        })
      }
    }
  }

  // Trasforma i dati in formato WorkoutSummary
  // Workaround necessario: Supabase restituisce relazioni annidate non tipizzate
  const scheda = typedWorkoutLog.scheda as unknown as
    | {
        id?: string
        name?: string
        workout_days?: Array<{
          id?: string
          day_number?: number | null
          title?: string
          day_name?: string
          workout_day_exercises?: Array<{
            id?: string
            exercise_id?: string
            target_sets?: number
            target_reps?: number
            target_weight?: number
            exercises?: {
              id?: string
              name?: string
              muscle_group?: string
              equipment?: string
              difficulty?: string
              created_at?: string
              updated_at?: string
              video_url?: string | null
              thumb_url?: string | null
              image_url?: string | null
              thumbnail_url?: string | null
            }
          }>
        }>
      }
    | null
    | undefined

  type DayRow = NonNullable<NonNullable<typeof scheda>['workout_days']>[number]
  const days = scheda?.workout_days ?? []
  const logDayId = typedWorkoutLog.workout_day_id ?? null

  let activeDay: DayRow | null = null
  if (logDayId) {
    activeDay = days.find((d) => d.id === logDayId) ?? null
  }
  if (!activeDay && days.length === 1) {
    activeDay = days[0] ?? null
  }
  const setKeysForDayInfer = [...setsByWdeId.keys()].filter((id) => Boolean(id))
  if (!activeDay && setKeysForDayInfer.length > 0) {
    const idSet = (day: DayRow) => new Set(day.workout_day_exercises?.map((w) => w.id) ?? [])
    activeDay =
      days.find((d) => setKeysForDayInfer.every((id) => idSet(d).has(id))) ??
      days.find((d) => setKeysForDayInfer.some((id) => idSet(d).has(id))) ??
      null
  }

  // Set salvati ma non collegati al log: cerca su TUTTA la scheda nella finestra di chiusura sessione
  // (anche se il log ha già altre serie collegate, così il riepilogo e i grafici vedono gli orfani).
  const allWdeIdsOnPlan = days.flatMap(
    (d) => d.workout_day_exercises?.map((w) => w.id).filter((x): x is string => Boolean(x)) ?? [],
  )
  if (loadedWorkoutLogId && allWdeIdsOnPlan.length > 0) {
    const anchor =
      typedWorkoutLog.completed_at || typedWorkoutLog.created_at || typedWorkoutLog.data
    const fallback = typedWorkoutLog.created_at || typedWorkoutLog.completed_at
    const anchorStr = anchor != null && String(anchor).trim() !== '' ? String(anchor) : ''
    const fallbackStr = fallback != null && String(fallback).trim() !== '' ? String(fallback) : null
    if (anchorStr || fallbackStr) {
      await mergeOrphanWorkoutSetsIntoSetsByWdeIdAndRepair(
        supabase,
        loadedWorkoutLogId,
        allWdeIdsOnPlan,
        anchorStr || (fallbackStr ?? ''),
        fallbackStr,
        setsByWdeId,
      )
    }
  }

  const savedWdeIds = [...setsByWdeId.keys()].filter((id) => Boolean(id))
  if (!activeDay && savedWdeIds.length > 0) {
    const idSet = (day: DayRow) => new Set(day.workout_day_exercises?.map((w) => w.id) ?? [])
    activeDay =
      days.find((d) => savedWdeIds.every((id) => idSet(d).has(id))) ??
      days.find((d) => savedWdeIds.some((id) => idSet(d).has(id))) ??
      null
  }

  const orderInDay = new Map<string, number>()
  if (activeDay?.workout_day_exercises?.length) {
    activeDay.workout_day_exercises.forEach((w, i) => {
      if (w.id) orderInDay.set(w.id, i)
    })
  }
  const wdeIdsForSummary = savedWdeIds
    .filter((id) => (activeDay ? orderInDay.has(id) : true))
    .sort((a, b) => (orderInDay.get(a) ?? 0) - (orderInDay.get(b) ?? 0))

  const exercises = wdeIdsForSummary.flatMap((wdeId, index) => {
    const realSets = setsByWdeId.get(wdeId)
    if (!realSets?.length) return []

    const ex =
      activeDay?.workout_day_exercises?.find((w) => w.id === wdeId) ??
      days.flatMap((d) => d.workout_day_exercises ?? []).find((w) => w.id === wdeId)

    if (!ex) return []

    const exerciseId = ex.exercise_id || `exercise-${index}`
    const exerciseData = ex.exercises || {
      id: exerciseId,
      name: 'Esercizio',
      muscle_group: 'unknown',
      equipment: 'unknown',
      difficulty: 'intermediate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      video_url: null as string | null,
      thumb_url: null as string | null,
      image_url: null as string | null,
      thumbnail_url: null as string | null,
    }
    const sets = realSets.map((s) => ({
      set_number: s.set_number,
      performed_weight: s.weight_kg,
      performed_reps: s.reps,
      is_completed: s.is_completed,
    }))
    return [
      {
        id: wdeId,
        exercise: {
          id: exerciseData.id || exerciseId,
          name: exerciseData.name || 'Esercizio',
          muscle_group: exerciseData.muscle_group || 'unknown',
          equipment: exerciseData.equipment || 'unknown',
          difficulty: exerciseData.difficulty || 'intermediate',
          created_at: exerciseData.created_at || new Date().toISOString(),
          updated_at: exerciseData.updated_at || new Date().toISOString(),
          video_url: exerciseData.video_url ?? null,
          thumb_url: exerciseData.thumb_url ?? null,
          image_url: exerciseData.image_url ?? null,
          thumbnail_url: exerciseData.thumbnail_url ?? null,
        },
        target_sets: ex.target_sets || 0,
        target_reps: ex.target_reps ?? 0,
        target_weight: ex.target_weight || 0,
        sets,
        is_completed: sets.length > 0 && sets.every((s) => s.is_completed),
      },
    ]
  })

  const dayLabel =
    activeDay?.title?.trim() ||
    activeDay?.day_name?.trim() ||
    (activeDay?.day_number != null ? `Giorno ${activeDay.day_number}` : '') ||
    ''
  const planTitle = scheda?.name?.trim() || 'Allenamento'
  const workoutTitleCombined = dayLabel ? `${planTitle} — ${dayLabel}` : planTitle

  const totalExercises = exercises.length
  const completedExercises = exercises.filter((ex) => ex.is_completed).length
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.is_completed).length,
    0,
  )
  const totalVolumeFromSets = exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets.reduce(
        (acc, set) => acc + set.performed_weight * repsForVolumeKgRep(set.performed_reps),
        0,
      ),
    0,
  )

  const volLoggedRaw = typedWorkoutLog.volume_totale
  const volLogged =
    volLoggedRaw != null && !Number.isNaN(Number(volLoggedRaw)) ? Number(volLoggedRaw) : null
  const totalVolumeDisplay =
    volLogged != null && !Number.isNaN(volLogged) && volLogged > 0 ? volLogged : totalVolumeFromSets

  const completionPercent =
    totalSets > 0
      ? Math.round((completedSets / totalSets) * 100)
      : totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0

  const avgLoadPerSet = totalSets > 0 ? Math.round(totalVolumeDisplay / totalSets) : 0

  const summaryData: AthleteWorkoutSummary = {
    workout_log_id: String(typedWorkoutLog.id ?? ''),
    workout_id: typedWorkoutLog.scheda_id || typedWorkoutLog.id,
    workout_title: workoutTitleCombined,
    completed_at:
      typedWorkoutLog.completed_at ||
      typedWorkoutLog.data ||
      typedWorkoutLog.created_at ||
      new Date().toISOString(),
    completion_percent: Math.min(100, Math.max(0, completionPercent)),
    total_exercises: totalExercises,
    completed_exercises: completedExercises,
    total_sets: totalSets,
    completed_sets: completedSets,
    total_time: typedWorkoutLog.durata_minuti || 0,
    session_note: typedWorkoutLog.note?.trim() ? typedWorkoutLog.note.trim() : null,
    is_coached: Boolean(typedWorkoutLog.is_coached),
    execution_mode: typedWorkoutLog.execution_mode ?? null,
    exercises,
    performance_stats: {
      average_weight_increase: 0,
      total_volume: totalVolumeDisplay,
      average_load_per_set: avgLoadPerSet,
      consistency_score:
        totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
      personal_records: 0,
    },
  }

  const stLog = String(typedWorkoutLog.stato ?? '').toLowerCase()
  const logCompleted = stLog === 'completato' || stLog === 'completed'
  const logCoached =
    Boolean(typedWorkoutLog.is_coached) ||
    String(typedWorkoutLog.execution_mode ?? '').toLowerCase() === 'coached'
  if (logCompleted && logCoached && typedWorkoutLog.id && requestCoachedDebit) {
    const debit = await requestCoachedSessionDebitClient(typedWorkoutLog.id)
    if (!debit.ok) {
      onCoachedDebitWarning?.()
    }
  }

  return summaryData
}
