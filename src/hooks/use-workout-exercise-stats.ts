'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from './use-supabase'
import { createLogger } from '@/lib/logger'
import { getProfileIdFromUserId } from '@/lib/utils/profile-id-utils'

const logger = createLogger('hooks:use-workout-exercise-stats')

export interface ExerciseStat {
  exercise_id: string
  exercise_name: string
  exercise_category?: string | null
  total_sessions: number
  total_sets: number
  average_weight: number | null
  max_weight: number | null
  min_weight: number | null
  first_date: string | null
  last_date: string | null
  dataPoints: Array<{
    date: string
    weight_kg: number
    reps?: number | null
    set_number: number
  }>
}

export interface WorkoutExerciseStats {
  exercises: ExerciseStat[]
  total_exercises: number
  total_sessions: number
  date_range: {
    from: string | null
    to: string | null
  }
}

/**
 * Hook per recuperare statistiche degli esercizi completati da un atleta
 * Recupera solo gli esercizi che sono stati effettivamente eseguiti (con set completati)
 *
 * @param athleteUserId - user_id dell'atleta (profiles.user_id, che è auth.uid())
 */
export function useWorkoutExerciseStats(athleteUserId: string | null) {
  const { supabase } = useSupabase()

  const { data, isLoading, error, refetch } = useQuery<WorkoutExerciseStats>({
    queryKey: ['workout-exercise-stats', athleteUserId],
    queryFn: async () => {
      if (!athleteUserId) {
        return {
          exercises: [],
          total_exercises: 0,
          total_sessions: 0,
          date_range: { from: null, to: null },
        }
      }

      logger.debug('Fetching workout exercise stats', undefined, { athleteUserId })

      try {
        // STEP 1: Converti user_id in profile_id (workout_plans.athlete_id è FK a profiles.id)
        let athleteProfileId: string | null = null
        try {
          athleteProfileId = await getProfileIdFromUserId(athleteUserId)
          if (!athleteProfileId) {
            logger.warn('Profile not found for user_id', undefined, { athleteUserId })
            return {
              exercises: [],
              total_exercises: 0,
              total_sessions: 0,
              date_range: { from: null, to: null },
            }
          }
        } catch (conversionError) {
          logger.warn('Errore conversione user_id a profile_id', conversionError, { athleteUserId })
          return {
            exercises: [],
            total_exercises: 0,
            total_sessions: 0,
            date_range: { from: null, to: null },
          }
        }

        // STEP 2: Recupera tutti i workout_plans dell'atleta
        const { data: workoutPlans, error: plansError } = await supabase
          .from('workout_plans')
          .select('id')
          .eq('athlete_id', athleteProfileId)

        if (plansError) {
          logger.error('Error fetching workout plans', plansError, { athleteProfileId })
          throw plansError
        }

        if (!workoutPlans || workoutPlans.length === 0) {
          logger.debug('No workout plans found for athlete', undefined, { athleteProfileId })
          return {
            exercises: [],
            total_exercises: 0,
            total_sessions: 0,
            date_range: { from: null, to: null },
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const planIds = (workoutPlans as any[]).map((p: any) => p.id)

        // STEP 3: Recupera tutti i workout_days per questi piani
        const { data: workoutDays, error: daysError } = await supabase
          .from('workout_days')
          .select('id')
          .in('workout_plan_id', planIds)

        if (daysError) {
          logger.error('Error fetching workout days', daysError, { planIds })
          throw daysError
        }

        if (!workoutDays || workoutDays.length === 0) {
          logger.debug('No workout days found', undefined, { planIds })
          return {
            exercises: [],
            total_exercises: 0,
            total_sessions: 0,
            date_range: { from: null, to: null },
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayIds = (workoutDays as any[]).map((d: any) => d.id)

        // STEP 4: Recupera tutti i workout_day_exercises per questi giorni
        const { data: workoutDayExercises, error: exercisesError } = await supabase
          .from('workout_day_exercises')
          .select('id, exercise_id')
          .in('workout_day_id', dayIds)

        if (exercisesError) {
          logger.error('Error fetching workout day exercises', exercisesError, { dayIds })
          throw exercisesError
        }

        if (!workoutDayExercises || workoutDayExercises.length === 0) {
          logger.debug('No workout day exercises found', undefined, { dayIds })
          return {
            exercises: [],
            total_exercises: 0,
            total_sessions: 0,
            date_range: { from: null, to: null },
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workoutDayExerciseIds = (workoutDayExercises as any[]).map((e: any) => e.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uniqueExerciseIds = [...new Set((workoutDayExercises as any[]).map((e: any) => e.exercise_id))]

        // STEP 5: Recupera i nomi degli esercizi
        const { data: exercisesData, error: exercisesNamesError } = await supabase
          .from('exercises')
          .select('id, name, category')
          .in('id', uniqueExerciseIds)

        if (exercisesNamesError) {
          logger.error('Error fetching exercises names', exercisesNamesError, { uniqueExerciseIds })
          throw exercisesNamesError
        }

        const exercisesMap = new Map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((exercisesData as any[]) || []).map((e: any) => [e.id, { name: e.name, category: e.category }]),
        )

        // STEP 6: Recupera tutti i workout_sets completati per questi workout_day_exercises
        const { data: workoutSets, error: setsError } = await supabase
          .from('workout_sets')
          .select('id, workout_day_exercise_id, set_number, reps, weight_kg, completed_at')
          .in('workout_day_exercise_id', workoutDayExerciseIds)
          .not('completed_at', 'is', null)
          .not('weight_kg', 'is', null)
          .order('completed_at', { ascending: true })

        if (setsError) {
          logger.error('Error fetching workout sets', setsError, { workoutDayExerciseIds })
          throw setsError
        }

        if (!workoutSets || workoutSets.length === 0) {
          logger.debug('No completed workout sets found', undefined, { workoutDayExerciseIds })
          return {
            exercises: [],
            total_exercises: 0,
            total_sessions: 0,
            date_range: { from: null, to: null },
          }
        }

        // STEP 7: Raggruppa i set per esercizio
        const exerciseStatsMap = new Map<string, ExerciseStat>()

        // Crea una mappa workout_day_exercise_id -> exercise_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exerciseIdMap = new Map((workoutDayExercises as any[]).map((e: any) => [e.id, e.exercise_id]))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const set of workoutSets as any[]) {
          const exerciseId = exerciseIdMap.get(set.workout_day_exercise_id as string)
          if (!exerciseId) continue

          const exerciseInfo = exercisesMap.get(exerciseId)
          if (!exerciseInfo) continue

          const date = set.completed_at
            ? new Date(set.completed_at as string).toISOString().split('T')[0]
            : null
          if (!date) continue

          if (!exerciseStatsMap.has(exerciseId)) {
            exerciseStatsMap.set(exerciseId, {
              exercise_id: exerciseId,
              exercise_name: exerciseInfo.name,
              exercise_category: exerciseInfo.category,
              total_sessions: 0,
              total_sets: 0,
              average_weight: null,
              max_weight: null,
              min_weight: null,
              first_date: null,
              last_date: null,
              dataPoints: [],
            })
          }

          const stat = exerciseStatsMap.get(exerciseId)!
          stat.dataPoints.push({
            date,
            weight_kg: Number(set.weight_kg),
            reps: set.reps,
            set_number: set.set_number,
          })
        }

        // STEP 8: Calcola statistiche per ogni esercizio
        const exercises: ExerciseStat[] = []
        const allDates: string[] = []

        for (const [, stat] of exerciseStatsMap.entries()) {
          // Raggruppa per data per contare le sessioni
          const datesSet = new Set(stat.dataPoints.map((dp) => dp.date))
          stat.total_sessions = datesSet.size
          stat.total_sets = stat.dataPoints.length

          // Calcola pesi
          const weights = stat.dataPoints.map((dp) => dp.weight_kg).filter((w) => w > 0)
          if (weights.length > 0) {
            stat.average_weight = weights.reduce((a, b) => a + b, 0) / weights.length
            stat.max_weight = Math.max(...weights)
            stat.min_weight = Math.min(...weights)
          }

          // Calcola date
          const dates = Array.from(datesSet).sort()
          if (dates.length > 0) {
            stat.first_date = dates[0]
            stat.last_date = dates[dates.length - 1]
            allDates.push(...dates)
          }

          // Ordina dataPoints per data
          stat.dataPoints.sort((a, b) => a.date.localeCompare(b.date))

          exercises.push(stat)
        }

        // Ordina esercizi per nome
        exercises.sort((a, b) => a.exercise_name.localeCompare(b.exercise_name))

        // Calcola date range totale
        const sortedDates = [...new Set(allDates)].sort()
        const date_range = {
          from: sortedDates.length > 0 ? sortedDates[0] : null,
          to: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null,
        }

        // Conta sessioni totali (date uniche tra tutti gli esercizi)
        const totalSessions = new Set(allDates).size

        logger.debug('Workout exercise stats fetched', undefined, {
          total_exercises: exercises.length,
          total_sessions: totalSessions,
          date_range,
        })

        return {
          exercises,
          total_exercises: exercises.length,
          total_sessions: totalSessions,
          date_range,
        }
      } catch (error) {
        logger.error('Error in useWorkoutExerciseStats', error, { athleteUserId })
        throw error
      }
    },
    enabled: !!athleteUserId,
    staleTime: 1000 * 60 * 5, // 5 minuti
    refetchOnMount: true,
  })

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}
