// ============================================================
// Hook per dettaglio workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-detail-modal.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('hooks:workout:use-workout-detail')

interface WorkoutDetail {
  id: string
  name: string
  description: string | null
  objective: string | null
  status: string
  difficulty: string | null
  created_at: string
  updated_at: string
  athlete_id: string | null
  athlete_name: string
  staff_name: string
  days: Array<{
    id: string
    day_number: number
    title: string
    exercises: Array<{
      id: string
      exercise_id: string | null
      exercise_name: string
      video_url?: string | null
      image_url?: string | null
      target_sets: number
      target_reps: number
      target_weight: number | null
      rest_timer_sec: number
      order_index: number
      sets?: Array<{
        id: string
        set_number: number
        reps: number
        weight_kg: number | null
        execution_time_sec: number | null
        rest_timer_sec: number | null
      }>
    }>
  }>
}

type WorkoutDayRow = {
  id: string
  workout_plan_id?: string | null
  day_number?: number | null
  day_name?: string | null
  title?: string | null
  order_index?: number | null
  created_at?: string | null
}

type WorkoutDayExerciseJoined = {
  id: string
  exercise_id: string | null
  order_index: number | null
  target_sets: number | null
  target_reps: number | null
  target_weight: number | null
  rest_timer_sec: number | null
  note: string | null
  workout_day_id: string | null
  exercises: {
    id: string | null
    name: string | null
    video_url: string | null
    image_url: string | null
  } | null
}

type ProfileMinimal = {
  id: string
  nome: string | null
  cognome: string | null
}

interface WorkoutDayWithExercises extends WorkoutDayRow {
  exercises: WorkoutDayExerciseJoined[]
}

export function useWorkoutDetail(workoutId: string | null, open: boolean) {
  const supabase = createClient()
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchWorkoutDetail = useCallback(async () => {
    if (!workoutId || !open) return

    try {
      setLoading(true)
      setError(null)

      // Recupera scheda base
      const { data: workoutBaseRaw, error: workoutBaseError } = await supabase
        .from('workout_plans')
        .select(
          `
          id,
          name,
          description,
          objective,
          is_active,
          athlete_id,
          created_by,
          created_at,
          updated_at
        `,
        )
        .eq('id', workoutId)
        .single()

      if (workoutBaseError) {
        throw new Error(workoutBaseError.message || 'Errore nel recupero della scheda')
      }

      if (!workoutBaseRaw) {
        setError(new Error('Scheda non trovata'))
        return
      }

      type WorkoutPlanRow = Pick<
        Tables<'workout_plans'>,
        | 'id'
        | 'name'
        | 'description'
        | 'is_active'
        | 'athlete_id'
        | 'created_by'
        | 'created_at'
        | 'updated_at'
      > & { objective?: string | null }
      const workoutBase = workoutBaseRaw as WorkoutPlanRow

      // Recupera giorni
      type WorkoutDayRowFromDb = Pick<
        Tables<'workout_days'>,
        'id' | 'workout_plan_id' | 'day_number' | 'day_name' | 'title' | 'order_num' | 'created_at'
      >
      let daysData: WorkoutDayRowFromDb[] = []

      try {
        const daysResult = await supabase
          .from('workout_days')
          .select('*')
          .eq('workout_plan_id', workoutId)
          .order('day_number', { ascending: true })

        if (daysResult.error) {
          const errorMessage = String(daysResult.error.message || '')
          const errorCode = String(daysResult.error.code || '')

          if (
            errorCode === '42P01' ||
            errorCode === 'PGRST301' ||
            errorMessage.includes('does not exist') ||
            errorMessage.includes('permission denied') ||
            errorMessage.includes('relation') ||
            errorMessage.includes('could not find')
          ) {
            logger.warn(
              'Tabella workout_days non disponibile, continuando senza giorni',
              undefined,
              { errorCode, workoutId },
            )
            daysData = []
          } else {
            logger.warn('Errore nel recupero dei giorni, continuando senza giorni', undefined, {
              errorMessage,
            })
            daysData = []
          }
        } else {
          daysData = (daysResult.data ?? []) as WorkoutDayRowFromDb[]
        }
      } catch (err) {
        logger.error('Exception during workout_days query', err, { workoutId })
        daysData = []
      }

      // Per ogni giorno, recupera gli esercizi (senza join - due query separate)
      const daysWithExercises: WorkoutDayWithExercises[] = await Promise.all(
        daysData.map(async (day) => {
          let exercisesData: WorkoutDayExerciseJoined[] = []
          try {
            // Query 1: Recupera esercizi da workout_day_exercises (senza join)
            const exercisesResult = await supabase
              .from('workout_day_exercises')
              .select('*')
              .eq('workout_day_id', day.id)
              .order('order_index', { ascending: true })

            if (exercisesResult.error) {
              logger.warn('Error fetching exercises for day', undefined, {
                dayId: day.id,
                error: exercisesResult.error.message,
              })
              exercisesData = []
            } else {
              type WorkoutDayExerciseRow = Pick<
                Tables<'workout_day_exercises'>,
                | 'id'
                | 'exercise_id'
                | 'target_sets'
                | 'target_reps'
                | 'target_weight'
                | 'rest_timer_sec'
                | 'order_index'
                | 'workout_day_id'
                | 'note'
              >
              const workoutDayExercises = (exercisesResult.data ?? []) as WorkoutDayExerciseRow[]

              // Query 2: Recupera i nomi degli esercizi dalla tabella exercises
              if (workoutDayExercises.length > 0) {
                const exerciseIds = workoutDayExercises
                  .map((ex) => ex.exercise_id)
                  .filter((id): id is string => id !== null)

                if (exerciseIds.length > 0) {
                  const exercisesDetailsResult = await supabase
                    .from('exercises')
                    .select('id, name, video_url, image_url')
                    .in('id', exerciseIds)

                  type ExerciseDetailsRow = Pick<
                    Tables<'exercises'>,
                    'id' | 'name' | 'video_url' | 'image_url'
                  >
                  const typedExercisesDetails = (exercisesDetailsResult.data ??
                    []) as ExerciseDetailsRow[]
                  const exercisesMap = new Map(typedExercisesDetails.map((ex) => [ex.id, ex]))

                  // Query 3: Recupera i set per ogni esercizio
                  const exerciseIdsForSets = workoutDayExercises
                    .map((ex) => ex.id)
                    .filter((id): id is string => id !== null)

                  let setsMap = new Map<
                    string,
                    Array<{
                      id: string
                      set_number: number
                      reps: number
                      weight_kg: number | null
                      execution_time_sec: number | null
                      rest_timer_sec: number | null
                    }>
                  >()

                  if (exerciseIdsForSets.length > 0) {
                    const setsResult = await supabase
                      .from('workout_sets')
                      .select(
                        'id, workout_day_exercise_id, set_number, reps, weight_kg, completed_at',
                      )
                      .in('workout_day_exercise_id', exerciseIdsForSets)
                      .order('set_number', { ascending: true })

                    if (!setsResult.error && setsResult.data) {
                      type WorkoutSetRow = Pick<
                        Tables<'workout_sets'>,
                        | 'id'
                        | 'workout_day_exercise_id'
                        | 'set_number'
                        | 'reps'
                        | 'weight_kg'
                        | 'completed_at'
                      >
                      const typedSetsData = (setsResult.data ?? []) as WorkoutSetRow[]
                      setsMap = new Map(
                        exerciseIdsForSets.map((exId) => [
                          exId,
                          typedSetsData
                            .filter((s) => s.workout_day_exercise_id === exId)
                            .map((s) => ({
                              id: s.id,
                              set_number: s.set_number,
                              reps: (s.reps ?? 0) as number,
                              weight_kg: (s.weight_kg ?? null) as number | null,
                              execution_time_sec: null as number | null, // Campo non presente nella tabella
                              rest_timer_sec: null as number | null, // Campo non presente nella tabella
                            })),
                        ]),
                      )
                    }
                  }

                  // Combina i dati: workout_day_exercises + exercises + sets
                  exercisesData = workoutDayExercises.map((wde) => ({
                    ...wde,
                    exercises: exercisesMap.get(wde.exercise_id || '') || null,
                    sets: setsMap.get(wde.id) || [],
                  })) as (WorkoutDayExerciseJoined & {
                    sets?: Array<{
                      id: string
                      set_number: number
                      reps: number
                      weight_kg: number | null
                      execution_time_sec: number | null
                      rest_timer_sec: number | null
                    }>
                  })[]
                } else {
                  exercisesData = workoutDayExercises.map((wde) => ({
                    ...wde,
                    exercises: null,
                    sets: [],
                  })) as (WorkoutDayExerciseJoined & {
                    sets?: Array<{
                      id: string
                      set_number: number
                      reps: number
                      weight_kg: number | null
                      execution_time_sec: number | null
                      rest_timer_sec: number | null
                    }>
                  })[]
                }
              }
            }
          } catch (err) {
            logger.error('Exception fetching exercises for day', err, { dayId: day.id, workoutId })
            exercisesData = []
          }

          return {
            ...day,
            exercises: exercisesData ?? [],
          } as WorkoutDayWithExercises
        }),
      )

      // Recupera profili per nomi
      const athleteId = workoutBase.athlete_id
      const staffUserId = workoutBase.created_by

      const [athleteResult, staffResult] = await Promise.all([
        athleteId
          ? supabase
              .from('profiles')
              .select('id, nome, cognome')
              .eq('id', athleteId)
              .returns<ProfileMinimal>()
              .single()
          : Promise.resolve({ data: null, error: null }),
        staffUserId
          ? supabase
              .from('profiles')
              .select('user_id, nome, cognome')
              .eq('user_id', staffUserId)
              .returns<ProfileMinimal & { user_id: string }>()
              .single()
          : Promise.resolve({ data: null, error: null }),
      ])

      type ProfileAthleteRow = Pick<Tables<'profiles'>, 'id' | 'nome' | 'cognome'>
      type ProfileStaffRow = Pick<Tables<'profiles'>, 'user_id' | 'nome' | 'cognome'>
      const athlete = (athleteResult.data ?? null) as ProfileAthleteRow | null
      const staff = (staffResult.data ?? null) as ProfileStaffRow | null

      // Trasforma i dati
      const transformedWorkout: WorkoutDetail = {
        id: workoutBase.id,
        name: workoutBase.name ?? 'Scheda senza titolo',
        description: workoutBase.description ?? null,
        objective: workoutBase.objective ?? null,
        status: workoutBase.is_active ? 'attivo' : 'completato',
        difficulty: null,
        created_at: workoutBase.created_at ?? new Date().toISOString(),
        updated_at: workoutBase.updated_at ?? workoutBase.created_at ?? new Date().toISOString(),
        athlete_id: workoutBase.athlete_id,
        athlete_name: athlete
          ? `${athlete.nome || ''} ${athlete.cognome || ''}`.trim() || 'Sconosciuto'
          : 'Sconosciuto',
        staff_name: staff
          ? `${staff.nome || ''} ${staff.cognome || ''}`.trim() || 'Sconosciuto'
          : 'Sconosciuto',
        days: daysWithExercises.map((day) => ({
          id: day.id,
          day_number: day.day_number || 0,
          title:
            day.title ||
            (day as WorkoutDayRow & { day_name?: string }).day_name ||
            `Giorno ${day.day_number || 0}`,
          exercises: (day.exercises ?? [])
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            .map((wde) => {
              const exerciseDetails =
                typeof wde.exercises === 'object' && wde.exercises ? wde.exercises : null
              return {
                id: wde.id,
                exercise_id: wde.exercise_id,
                exercise_name: exerciseDetails?.name || 'Esercizio sconosciuto',
                video_url: exerciseDetails?.video_url || null,
                image_url: exerciseDetails?.image_url || null,
                target_sets: wde.target_sets || 0,
                target_reps: wde.target_reps || 0,
                target_weight: wde.target_weight || null,
                rest_timer_sec: wde.rest_timer_sec || 60,
                order_index: wde.order_index || 0,
                note: wde.note || null,
                sets:
                  (
                    wde as WorkoutDayExerciseJoined & {
                      sets?: Array<{
                        id: string
                        set_number: number
                        reps: number
                        weight_kg: number | null
                        execution_time_sec: number | null
                        rest_timer_sec: number | null
                      }>
                    }
                  ).sets || [],
              }
            }),
        })),
      }

      setWorkout(transformedWorkout)
    } catch (err) {
      logger.error('Error fetching workout detail', err, { workoutId })
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Errore nel caricamento della scheda'
      setError(new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [workoutId, open, supabase])

  useEffect(() => {
    fetchWorkoutDetail()
  }, [fetchWorkoutDetail])

  return {
    workout,
    loading,
    error,
  }
}
