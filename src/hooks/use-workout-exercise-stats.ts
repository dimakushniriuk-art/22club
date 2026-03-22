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
  average_reps: number | null
  average_seconds: number | null
  first_date: string | null
  last_date: string | null
  dataPoints: Array<{
    date: string
    weight_kg: number
    reps?: number | null
    execution_time_sec?: number | null
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
 * Hook per recuperare statistiche degli esercizi per un atleta.
 * Include tutti gli esercizi assegnati nelle schede (anche mai eseguiti).
 * Per ogni esercizio: dati da workout_sets (peso, reps, tempo) e statistiche.
 *
 * @param athleteUserId - user_id dell'atleta (profiles.user_id, auth.uid())
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

        // Sessioni totali: conteggio da workout_logs (una riga per sessione completata)
        let totalSessionsFromLogs = 0
        const { count: logsCount } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', athleteProfileId)
        if (logsCount != null) totalSessionsFromLogs = logsCount

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

        type WdeRow = { id: string; exercise_id: string }
        const wdeRows = workoutDayExercises as WdeRow[]
        const workoutDayExerciseIds = wdeRows.map((e) => e.id)
        const uniqueExerciseIds = [...new Set(wdeRows.map((e) => e.exercise_id))]

        // STEP 5: Recupera i nomi degli esercizi
        const { data: exercisesData, error: exercisesNamesError } = await supabase
          .from('exercises')
          .select('id, name, category')
          .in('id', uniqueExerciseIds)

        if (exercisesNamesError) {
          logger.error('Error fetching exercises names', exercisesNamesError, { uniqueExerciseIds })
          throw exercisesNamesError
        }

        type ExRow = { id: string; name: string; category?: string | null }
        const exercisesMap = new Map(
          ((exercisesData as ExRow[] | null) ?? []).map((e) => [e.id, { name: e.name, category: e.category }]),
        )

        // STEP 6: Recupera tutti i workout_sets completati (con almeno completed_at; includiamo anche set senza peso per reps/tempo)
        const { data: workoutSets, error: setsError } = await supabase
          .from('workout_sets')
          .select('id, workout_day_exercise_id, set_number, reps, weight_kg, completed_at, execution_time_sec')
          .in('workout_day_exercise_id', workoutDayExerciseIds)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: true })

        if (setsError) {
          logger.error('Error fetching workout sets', setsError, { workoutDayExerciseIds })
          throw setsError
        }

        const rawSets = (workoutSets ?? []) as Array<{
          workout_day_exercise_id: string
          set_number: number
          reps?: number | null
          weight_kg?: number | null
          completed_at: string | null
          execution_time_sec?: number | null
        }>

        // Set con almeno un dato utile (peso, reps o tempo)
        const setsWithData = rawSets.filter(
          (s) =>
            (s.weight_kg != null && Number(s.weight_kg) >= 0) ||
            (s.reps != null && s.reps > 0) ||
            (s.execution_time_sec != null && s.execution_time_sec > 0),
        )

        // STEP 7: Raggruppa i set per esercizio
        const exerciseStatsMap = new Map<string, ExerciseStat>()
        // Crea una mappa workout_day_exercise_id -> exercise_id
        const exerciseIdMap = new Map(wdeRows.map((e) => [e.id, e.exercise_id]))

        for (const set of setsWithData) {
          const exerciseId = exerciseIdMap.get(set.workout_day_exercise_id)
          if (!exerciseId) continue

          const exerciseInfo = exercisesMap.get(exerciseId)
          if (!exerciseInfo) continue

          const date = set.completed_at
            ? new Date(set.completed_at).toISOString().split('T')[0]
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
              average_reps: null,
              average_seconds: null,
              first_date: null,
              last_date: null,
              dataPoints: [],
            })
          }

          const stat = exerciseStatsMap.get(exerciseId)!
          stat.dataPoints.push({
            date,
            weight_kg: set.weight_kg != null ? Number(set.weight_kg) : 0,
            reps: set.reps ?? null,
            execution_time_sec: set.execution_time_sec ?? null,
            set_number: set.set_number,
          })
        }

        // Esercizi assegnati ma mai eseguiti: aggiungi alla mappa con dati vuoti
        for (const exerciseId of uniqueExerciseIds) {
          if (exerciseStatsMap.has(exerciseId)) continue
          const exerciseInfo = exercisesMap.get(exerciseId)
          if (!exerciseInfo) continue
          exerciseStatsMap.set(exerciseId, {
            exercise_id: exerciseId,
            exercise_name: exerciseInfo.name,
            exercise_category: exerciseInfo.category,
            total_sessions: 0,
            total_sets: 0,
            average_weight: null,
            max_weight: null,
            min_weight: null,
            average_reps: null,
            average_seconds: null,
            first_date: null,
            last_date: null,
            dataPoints: [],
          })
        }

        // STEP 8: Calcola statistiche per ogni esercizio
        const exercises: ExerciseStat[] = []
        const allDates: string[] = []

        for (const [, stat] of exerciseStatsMap.entries()) {
          const datesSet = new Set(stat.dataPoints.map((dp) => dp.date))
          stat.total_sessions = datesSet.size
          stat.total_sets = stat.dataPoints.length

          const weights = stat.dataPoints.map((dp) => dp.weight_kg).filter((w) => w > 0)
          if (weights.length > 0) {
            stat.average_weight = weights.reduce((a, b) => a + b, 0) / weights.length
            stat.max_weight = Math.max(...weights)
            stat.min_weight = Math.min(...weights)
          }

          const repsList = stat.dataPoints.map((dp) => dp.reps).filter((r): r is number => r != null && r > 0)
          if (repsList.length > 0) {
            stat.average_reps = repsList.reduce((a, b) => a + b, 0) / repsList.length
          }

          const secondsList = stat.dataPoints
            .map((dp) => dp.execution_time_sec)
            .filter((s): s is number => s != null && s > 0)
          if (secondsList.length > 0) {
            stat.average_seconds = secondsList.reduce((a, b) => a + b, 0) / secondsList.length
          }

          const dates = Array.from(datesSet).sort()
          if (dates.length > 0) {
            stat.first_date = dates[0]
            stat.last_date = dates[dates.length - 1]
            allDates.push(...dates)
          }

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

        // Sessioni totali da workout_logs (tutte le sessioni completate), non dalle date dei set
        const totalSessions = totalSessionsFromLogs

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
