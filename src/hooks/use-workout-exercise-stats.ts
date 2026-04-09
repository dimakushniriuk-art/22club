'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from './use-supabase'
import { createLogger } from '@/lib/logger'
import { getProfileIdFromUserId } from '@/lib/utils/profile-id-utils'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

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
    workout_log_id?: string | null
    workout_day_exercise_id?: string | null
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
 * Include tutti gli esercizi assegnati nelle schede attuali (anche mai eseguiti).
 * I set completati provengono da tutti i workout_logs dell’atleta (anche con schede
 * non più attuali), più eventuali set legati ai WDE dei piani (deduplicati per id set).
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

        // Sessioni totali: conteggio da workout_logs (una riga per sessione)
        let totalSessionsFromLogs = 0
        const { count: logsCount } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', athleteProfileId)
        if (logsCount != null) totalSessionsFromLogs = logsCount

        const LOG_PAGE_SIZE = 1000
        const logIds: string[] = []
        let logRangeFrom = 0
        for (;;) {
          const { data: logPage, error: logsListError } = await supabase
            .from('workout_logs')
            .select('id')
            .eq('atleta_id', athleteProfileId)
            .order('id', { ascending: true })
            .range(logRangeFrom, logRangeFrom + LOG_PAGE_SIZE - 1)
          if (logsListError) {
            logger.error('Error fetching workout_logs ids', logsListError, { athleteProfileId })
            throw logsListError
          }
          const rows = (logPage ?? []) as { id: string }[]
          logIds.push(...rows.map((r) => r.id))
          if (rows.length < LOG_PAGE_SIZE) break
          logRangeFrom += LOG_PAGE_SIZE
        }

        // STEP 2: Piani attuali → WDE assegnati (placeholder senza dati + seconda fonte set)
        const { data: workoutPlans, error: plansError } = await supabase
          .from('workout_plans')
          .select('id')
          .eq('athlete_id', athleteProfileId)

        if (plansError) {
          logger.error('Error fetching workout plans', plansError, { athleteProfileId })
          throw plansError
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const planIds = ((workoutPlans ?? []) as any[]).map((p: any) => p.id)

        type WdeRow = { id: string; exercise_id: string }
        const planWdeRows: WdeRow[] = []

        if (planIds.length > 0) {
          const workoutDays: { id: string }[] = []
          for (const planChunk of chunkForSupabaseIn(planIds)) {
            const { data: daysChunk, error: daysError } = await supabase
              .from('workout_days')
              .select('id')
              .in('workout_plan_id', planChunk)
            if (daysError) {
              logger.error('Error fetching workout days', daysError, { planIds })
              throw daysError
            }
            workoutDays.push(...((daysChunk ?? []) as { id: string }[]))
          }

          const dayIds = workoutDays.map((d) => d.id)
          for (const dayChunk of chunkForSupabaseIn(dayIds)) {
            const { data: wdeChunk, error: exercisesError } = await supabase
              .from('workout_day_exercises')
              .select('id, exercise_id')
              .in('workout_day_id', dayChunk)
            if (exercisesError) {
              logger.error('Error fetching workout day exercises', exercisesError, { dayIds })
              throw exercisesError
            }
            planWdeRows.push(...((wdeChunk ?? []) as WdeRow[]))
          }
        }

        const planWdeIds = planWdeRows.map((e) => e.id)
        const uniqueExerciseIdsFromPlan = [...new Set(planWdeRows.map((e) => e.exercise_id))]

        type SetRow = {
          id: string
          workout_day_exercise_id: string
          set_number: number
          reps?: number | null
          reps_completed?: number | null
          weight_kg?: number | null
          weight_used?: number | null
          completed_at: string | null
          execution_time_sec?: number | null
          workout_log_id?: string | null
        }

        const setsById = new Map<string, SetRow>()
        const selectSets =
          'id, workout_day_exercise_id, set_number, reps, reps_completed, weight_kg, weight_used, completed_at, execution_time_sec, workout_log_id'

        for (const logChunk of chunkForSupabaseIn(logIds)) {
          const { data: workoutSets, error: setsError } = await supabase
            .from('workout_sets')
            .select(selectSets)
            .in('workout_log_id', logChunk)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: true })
          if (setsError) {
            logger.error('Error fetching workout_sets by log', setsError, { athleteProfileId })
            throw setsError
          }
          for (const row of (workoutSets ?? []) as SetRow[]) {
            setsById.set(row.id, row)
          }
        }

        for (const wdeChunk of chunkForSupabaseIn(planWdeIds)) {
          const { data: workoutSets, error: setsError } = await supabase
            .from('workout_sets')
            .select(selectSets)
            .in('workout_day_exercise_id', wdeChunk)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: true })
          if (setsError) {
            logger.error('Error fetching workout_sets by wde', setsError, { planWdeIds })
            throw setsError
          }
          for (const row of (workoutSets ?? []) as SetRow[]) {
            setsById.set(row.id, row)
          }
        }

        const setsMerged = Array.from(setsById.values())
        setsMerged.sort((a, b) =>
          (a.completed_at ?? '').localeCompare(b.completed_at ?? '', undefined, {
            sensitivity: 'base',
          }),
        )

        const rawSets = setsMerged

        const effectiveWeightKg = (s: SetRow): number | null => {
          if (s.weight_kg != null && Number.isFinite(Number(s.weight_kg))) {
            return Number(s.weight_kg)
          }
          if (s.weight_used != null && Number.isFinite(Number(s.weight_used))) {
            return Number(s.weight_used)
          }
          return null
        }

        const effectiveReps = (s: SetRow): number | null => {
          if (s.reps != null && s.reps > 0) return s.reps
          if (s.reps_completed != null && s.reps_completed > 0) return s.reps_completed
          return null
        }

        const exerciseIdMap = new Map(planWdeRows.map((e) => [e.id, e.exercise_id]))
        const wdeIdsFromSets = [...new Set(rawSets.map((s) => s.workout_day_exercise_id))]
        const missingWdeIds = wdeIdsFromSets.filter((id) => !exerciseIdMap.has(id))

        for (const wdeChunk of chunkForSupabaseIn(missingWdeIds)) {
          const { data: wdeExtra, error: wdeExtraErr } = await supabase
            .from('workout_day_exercises')
            .select('id, exercise_id')
            .in('id', wdeChunk)
          if (wdeExtraErr) {
            logger.error('Error fetching workout_day_exercises for sets', wdeExtraErr, {
              missingWdeIds,
            })
            throw wdeExtraErr
          }
          for (const row of (wdeExtra ?? []) as WdeRow[]) {
            exerciseIdMap.set(row.id, row.exercise_id)
          }
        }

        const exerciseIdsForNames = [
          ...new Set([...uniqueExerciseIdsFromPlan, ...exerciseIdMap.values()]),
        ]

        type ExRow = { id: string; name: string; category?: string | null }
        const exercisesAccum: ExRow[] = []
        for (const exChunk of chunkForSupabaseIn(exerciseIdsForNames)) {
          const { data: exercisesData, error: exercisesNamesError } = await supabase
            .from('exercises')
            .select('id, name, category')
            .in('id', exChunk)
          if (exercisesNamesError) {
            logger.error('Error fetching exercises names', exercisesNamesError, {
              exerciseIdsForNames,
            })
            throw exercisesNamesError
          }
          exercisesAccum.push(...((exercisesData ?? []) as ExRow[]))
        }

        const exercisesMap = new Map(
          exercisesAccum.map((e) => [e.id, { name: e.name, category: e.category }]),
        )

        const uniqueExerciseIds = uniqueExerciseIdsFromPlan

        // Set con almeno un dato utile (peso, reps o tempo)
        const setsWithData = rawSets.filter((s) => {
          const w = effectiveWeightKg(s)
          const r = effectiveReps(s)
          return (
            (w != null && w >= 0) ||
            (r != null && r > 0) ||
            (s.execution_time_sec != null && s.execution_time_sec > 0)
          )
        })

        // STEP 7: Raggruppa i set per esercizio
        const exerciseStatsMap = new Map<string, ExerciseStat>()
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
          const wKg = effectiveWeightKg(set)
          stat.dataPoints.push({
            date,
            weight_kg: wKg != null ? wKg : 0,
            reps: effectiveReps(set),
            execution_time_sec: set.execution_time_sec ?? null,
            set_number: set.set_number,
            workout_log_id: set.workout_log_id ?? null,
            workout_day_exercise_id: set.workout_day_exercise_id,
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
          const sessionKeys = new Set(
            stat.dataPoints.map((dp) => dp.workout_log_id ?? `${dp.date}-${dp.set_number}`),
          )
          const datesSet = new Set(stat.dataPoints.map((dp) => dp.date))
          stat.total_sessions = sessionKeys.size
          stat.total_sets = stat.dataPoints.length

          const weights = stat.dataPoints.map((dp) => dp.weight_kg).filter((w) => w > 0)
          if (weights.length > 0) {
            stat.average_weight = weights.reduce((a, b) => a + b, 0) / weights.length
            stat.max_weight = Math.max(...weights)
            stat.min_weight = Math.min(...weights)
          }

          const repsList = stat.dataPoints
            .map((dp) => dp.reps)
            .filter((r): r is number => r != null && r > 0)
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
