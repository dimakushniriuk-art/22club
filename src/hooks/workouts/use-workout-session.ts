// ============================================================
// Hook per sessione workout corrente (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { WorkoutSession } from '@/types/workout'
import type { Tables } from '@/types/supabase'

const logger = createLogger('hooks:workouts:use-workout-session')

const generateTempId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const difficultyMap: Record<string, 'bassa' | 'media' | 'alta'> = {
  bassa: 'bassa',
  media: 'media',
  alta: 'alta',
  easy: 'bassa',
  medium: 'media',
  hard: 'alta',
  beginner: 'bassa',
  intermediate: 'media',
  advanced: 'alta',
}

export function useWorkoutSession() {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null)
  const supabase = createClient()

  const fetchCurrentWorkout = useCallback(
    async (userId: string, workoutPlanId?: string, workoutDayId?: string) => {
      try {
        // STEP 1: Recupera workout_plans (senza join)
        let planQuery = supabase.from('workout_plans').select('*').eq('athlete_id', userId)

        if (workoutPlanId) {
          planQuery = planQuery.eq('id', workoutPlanId)
        } else {
          planQuery = planQuery
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
        }

        const { data: planData, error: planError } = await planQuery.single()

        if (planError) {
          if (planError.code === 'PGRST116') {
            setCurrentWorkout(null)
            return
          }
          logger.error('Error fetching workout plan', planError, { userId, workoutPlanId })
          setCurrentWorkout(null)
          return
        }

        if (!planData) {
          logger.warn('Workout plan not found', undefined, { userId, workoutPlanId })
          setCurrentWorkout(null)
          return
        }

        type WorkoutPlanRow = Pick<Tables<'workout_plans'>, 'id' | 'created_at'>
        const typedPlanData = planData as WorkoutPlanRow
        const planId = typedPlanData.id

        // STEP 2: Recupera workout_days per questa scheda
        let daysQuery = supabase.from('workout_days').select('*').eq('workout_plan_id', planId)

        // Se è specificato workoutDayId, filtra per quel giorno
        if (workoutDayId) {
          daysQuery = daysQuery.eq('id', workoutDayId)
        }

        daysQuery = daysQuery.order('day_number', { ascending: true })

        const { data: daysData, error: daysError } = await daysQuery

        if (daysError) {
          logger.warn('Error fetching workout days', undefined, {
            planId,
            workoutDayId,
            error: daysError.message,
          })
          // Crea una sessione vuota
          setCurrentWorkout({
            id: planId,
            workout_id: planId,
            date: typedPlanData.created_at || new Date().toISOString(),
            exercises: [],
            total_exercises: 0,
            completed_exercises: 0,
            progress_percentage: 0,
          })
          return
        }

        type WorkoutDayRow = Pick<Tables<'workout_days'>, 'id' | 'day_name' | 'title'>
        const typedDaysData = (daysData ?? []) as WorkoutDayRow[]
        if (typedDaysData.length === 0) {
          logger.warn('Workout plan has no days', undefined, { planId, workoutDayId })
          setCurrentWorkout({
            id: planId,
            workout_id: planId,
            date: typedPlanData.created_at || new Date().toISOString(),
            exercises: [],
            total_exercises: 0,
            completed_exercises: 0,
            progress_percentage: 0,
          })
          return
        }

        // STEP 3: Prendi il giorno specificato o il primo
        const selectedDay = workoutDayId
          ? typedDaysData.find((day) => day.id === workoutDayId) || typedDaysData[0]
          : typedDaysData[0]

        // STEP 4: Recupera workout_day_exercises per il giorno selezionato (senza join)
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('workout_day_exercises')
          .select('*')
          .eq('workout_day_id', selectedDay.id)
          .order('order_index', { ascending: true })

        if (exercisesError) {
          logger.warn('Error fetching workout day exercises', undefined, {
            dayId: selectedDay.id,
            error: exercisesError.message,
          })
          setCurrentWorkout({
            id: selectedDay.id,
            workout_id: planId,
            workout_day_id: selectedDay.id,
            day_title: selectedDay.day_name || selectedDay.title || '',
            date: typedPlanData.created_at || new Date().toISOString(),
            exercises: [],
            total_exercises: 0,
            completed_exercises: 0,
            progress_percentage: 0,
          })
          return
        }

        type WorkoutDayExerciseRow = Pick<
          Tables<'workout_day_exercises'>,
          | 'id'
          | 'exercise_id'
          | 'target_sets'
          | 'target_reps'
          | 'target_weight'
          | 'rest_timer_sec'
          | 'order_index'
          | 'note'
        >
        const workoutDayExercises = (exercisesData ?? []) as WorkoutDayExerciseRow[]
        if (workoutDayExercises.length === 0) {
          setCurrentWorkout({
            id: selectedDay.id,
            workout_id: planId,
            workout_day_id: selectedDay.id,
            day_title: selectedDay.day_name || selectedDay.title || '',
            date: typedPlanData.created_at || new Date().toISOString(),
            exercises: [],
            total_exercises: 0,
            completed_exercises: 0,
            progress_percentage: 0,
          })
          return
        }

        // STEP 5: Recupera exercises details (query separata)
        const exerciseIds = workoutDayExercises
          .map((ex) => ex.exercise_id)
          .filter((id): id is string => id !== null)

        let exercisesMap = new Map<
          string,
          Pick<
            Tables<'exercises'>,
            'id' | 'name' | 'muscle_group' | 'difficulty' | 'video_url' | 'image_url' | 'thumb_url' | 'description'
          >
        >()

        if (exerciseIds.length > 0) {
          const { data: exercisesDetails, error: exercisesDetailsError } = await supabase
            .from('exercises')
            .select('id, name, muscle_group, difficulty, video_url, image_url, thumb_url, description')
            .in('id', exerciseIds)

          if (!exercisesDetailsError && exercisesDetails) {
            type ExerciseDetailsRow = Pick<
              Tables<'exercises'>,
              | 'id'
              | 'name'
              | 'muscle_group'
              | 'difficulty'
              | 'video_url'
              | 'image_url'
              | 'thumb_url'
              | 'description'
            >
            const typedExercisesDetails = (exercisesDetails ?? []) as ExerciseDetailsRow[]
            exercisesMap = new Map(typedExercisesDetails.map((ex) => [ex.id, ex]))
          }
        }

        // STEP 6: Recupera workout_sets per ogni esercizio (opzionale, ma presente nella logica)
        const exerciseIdsForSets = workoutDayExercises
          .map((ex) => ex.id)
          .filter((id): id is string => id !== null)
        type WorkoutSetRow = Pick<
          Tables<'workout_sets'>,
          | 'id'
          | 'workout_day_exercise_id'
          | 'set_number'
          | 'reps'
          | 'weight_kg'
          | 'execution_time_sec'
          | 'rest_timer_sec'
          | 'completed_at'
        >
        const setsMap = new Map<
          string,
          Array<{
            id: string
            set_number: number | null
            reps?: number
            weight_kg?: number | null
            execution_time_sec?: number | null
            rest_timer_sec?: number | null
            completed_at: string | null
          }>
        >()

        if (exerciseIdsForSets.length > 0) {
          const { data: setsData, error: setsError } = await supabase
            .from('workout_sets')
            .select('*')
            .in('workout_day_exercise_id', exerciseIdsForSets)

          if (!setsError && setsData) {
            // Raggruppa i sets per workout_day_exercise_id
            const typedSetsData = (setsData ?? []) as WorkoutSetRow[]
            typedSetsData.forEach((set) => {
              const exerciseId = set.workout_day_exercise_id
              if (exerciseId) {
                if (!setsMap.has(exerciseId)) {
                  setsMap.set(exerciseId, [])
                }
                setsMap.get(exerciseId)!.push({
                  id: set.id,
                  set_number: set.set_number,
                  reps: (set.reps ?? undefined) as number | undefined,
                  weight_kg: (set.weight_kg ?? null) as number | null,
                  execution_time_sec: (set.execution_time_sec ?? null) as number | null,
                  rest_timer_sec: (set.rest_timer_sec ?? null) as number | null,
                  completed_at: set.completed_at,
                })
              }
            })
          }
        }

        // STEP 7: Combina i dati manualmente
        const exercisesArray = workoutDayExercises.map((exerciseRow) => {
          const relatedExercise = exerciseRow.exercise_id
            ? exercisesMap.get(exerciseRow.exercise_id)
            : null

          // Recupera i set esistenti dal database
          // Nota: rest_timer_sec non esiste nella tabella workout_sets, va preso dall'esercizio
          const existingSets =
            setsMap.get(exerciseRow.id)?.map((setRow) => ({
              id: setRow.id ?? generateTempId('set'),
              set_number: setRow.set_number ?? 1,
              reps: setRow.reps ?? 0,
              weight_kg: setRow.weight_kg ?? null,
              execution_time_sec: setRow.execution_time_sec ?? null,
              // rest_timer_sec non esiste nella tabella workout_sets, usa quello dell'esercizio
              rest_timer_sec: exerciseRow.rest_timer_sec ?? null,
              completed_at: setRow.completed_at ?? null,
              completed: Boolean(setRow.completed_at),
            })) ?? []

          // Crea sempre target_sets set, unendo quelli esistenti con quelli nuovi se necessario
          const targetSets = exerciseRow.target_sets ?? 0
          let sets: Array<{
            id: string
            set_number: number
            reps: number
            weight_kg: number | null
            execution_time_sec: number | null
            rest_timer_sec: number | null
            completed_at: string | null
            completed: boolean
          }> = []

          if (targetSets > 0) {
            // Crea sempre target_sets set
            sets = Array.from({ length: targetSets }, (_, index) => {
              const setNumber = index + 1
              // Cerca se esiste già un set con questo set_number
              const existingSet = existingSets.find((s) => s.set_number === setNumber)

              if (existingSet) {
                // Usa il set esistente
                return existingSet
              } else {
                // Crea un nuovo set con valori di default
                return {
                  id: generateTempId('set'),
                  set_number: setNumber,
                  reps: exerciseRow.target_reps ?? 0,
                  weight_kg: exerciseRow.target_weight ?? null,
                  execution_time_sec: null,
                  rest_timer_sec: exerciseRow.rest_timer_sec ?? null,
                  completed_at: null,
                  completed: false,
                }
              }
            })
          } else if (existingSets.length > 0) {
            // Se target_sets è 0 ma ci sono set esistenti, usali comunque
            sets = existingSets
          }

          // Un esercizio è completato solo se:
          // 1. Ci sono set (array non vuoto)
          // 2. Tutti i set sono completati (hanno completed)
          const isCompleted = sets.length > 0 && sets.every((set) => set.completed)

          return {
            id: exerciseRow.id,
            exercise: relatedExercise
              ? {
                  id: relatedExercise.id ?? '',
                  name: relatedExercise.name ?? '',
                  muscle_group: relatedExercise.muscle_group ?? null,
                  difficulty:
                    difficultyMap[relatedExercise.difficulty ?? ''] ??
                    (relatedExercise.difficulty === 'bassa' ||
                    relatedExercise.difficulty === 'media' ||
                    relatedExercise.difficulty === 'alta'
                      ? relatedExercise.difficulty
                      : 'media'),
                  video_url: relatedExercise.video_url ?? null,
                  image_url: relatedExercise.image_url ?? null,
                  thumb_url: relatedExercise.thumb_url ?? null,
                  description: relatedExercise.description ?? null,
                }
              : null,
            target_sets: exerciseRow.target_sets ?? 0,
            target_reps: exerciseRow.target_reps ?? 0,
            target_weight: exerciseRow.target_weight ?? null,
            rest_timer_sec: exerciseRow.rest_timer_sec ?? 60,
            order_index: exerciseRow.order_index ?? 0,
            note: exerciseRow.note ?? null,
            sets,
            is_completed: isCompleted,
          }
        })

        const totalExercises = exercisesArray.length
        const completedExercises = exercisesArray.filter(
          (ex: { is_completed?: boolean }) => ex.is_completed,
        ).length

        const workoutSession: WorkoutSession = {
          id: selectedDay.id ?? planId ?? generateTempId('session'),
          workout_id: planId,
          workout_day_id: selectedDay.id ?? '',
          day_title: selectedDay.day_name || selectedDay.title || '',
          date: typedPlanData.created_at || new Date().toISOString(),
          total_exercises: totalExercises,
          completed_exercises: completedExercises,
          progress_percentage:
            totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
          exercises: exercisesArray as Record<string, unknown>[],
        }

        setCurrentWorkout(workoutSession)
      } catch (err) {
        logger.error('Error fetching current workout', err, { userId, workoutPlanId })
        setCurrentWorkout(null)
      }
    },
    [supabase],
  )

  return {
    currentWorkout,
    fetchCurrentWorkout,
  }
}
