// ============================================================
// Hook per statistiche workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { WorkoutStats } from '@/types/workout'
import type { Tables } from '@/types/supabase'

const logger = createLogger('hooks:workouts:use-workout-stats')

type WorkoutPlanWithDays = Pick<Tables<'workout_plans'>, 'id' | 'is_active' | 'created_at'> & {
  workout_days?: Array<{
    workout_day_exercises?: Array<{
      exercise_id: string | null
      workout_sets?: Array<{
        completed_at?: string | null
      }>
    }>
  }>
}

export function useWorkoutStats() {
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const supabase = createClient()

  const fetchStats = useCallback(
    async (userId: string) => {
      try {
        // Query semplice per workout_plans (senza relazioni complesse che potrebbero non esistere)
        // Le statistiche verranno calcolate principalmente da workout_logs
        const { data: workoutPlans, error: plansError } = await supabase
          .from('workout_plans')
          .select('id, is_active, created_at')
          .eq('athlete_id', userId)

        if (plansError) throw plansError

        // Tipizzazione esplicita per il risultato della query
        type WorkoutPlanQueryResult = Pick<
          Tables<'workout_plans'>,
          'id' | 'is_active' | 'created_at'
        >
        const typedWorkoutPlans = (workoutPlans ?? []) as WorkoutPlanQueryResult[]

        // Prova a recuperare workout_days separatamente se esiste workout_plan_id
        // Nota: workout_days potrebbe avere workout_plan_id o workout_id (legacy)
        const workoutDaysMap: Record<string, WorkoutPlanWithDays['workout_days']> = {}

        if (typedWorkoutPlans && typedWorkoutPlans.length > 0) {
          const workoutPlanIds = typedWorkoutPlans
            .map((wp) => wp.id)
            .filter((id): id is string => !!id)

          if (workoutPlanIds.length > 0) {
            try {
              // Prova prima con workout_plan_id (nuova struttura)
              const { data: workoutDays, error: daysError } = await supabase
                .from('workout_days')
                .select(
                  `
                  workout_plan_id,
                  workout_day_exercises(
                    exercise_id,
                    workout_sets(*)
                  )
                `,
                )
                .in('workout_plan_id', workoutPlanIds)

              if (!daysError && workoutDays) {
                workoutDays.forEach(
                  (day: { workout_plan_id?: string; workout_day_exercises?: unknown }) => {
                    if (day.workout_plan_id) {
                      if (!workoutDaysMap[day.workout_plan_id]) {
                        workoutDaysMap[day.workout_plan_id] = []
                      }
                      const workoutPlanId = day.workout_plan_id
                      const workoutDaysArray = workoutDaysMap[workoutPlanId]
                      if (workoutDaysArray) {
                        workoutDaysArray.push({
                          workout_day_exercises: (day.workout_day_exercises || []) as Array<{
                            exercise_id: string | null
                            workout_sets?: Array<{ completed_at?: string | null }>
                          }>,
                        })
                      }
                    }
                  },
                )
              } else if (daysError) {
                // Se workout_plan_id non esiste, prova con workout_id (legacy) o ignora
                logger.warn(
                  'Errore recupero workout_days con workout_plan_id, continuando senza',
                  daysError,
                  {
                    userId,
                  },
                )
              }
            } catch (daysErr) {
              // Se workout_days non è disponibile o la relazione non funziona, continua senza
              logger.warn('Errore recupero workout_days, continuando senza', daysErr, { userId })
            }
          }
        }

        // Combina workout_plans con workout_days
        const data: WorkoutPlanWithDays[] =
          typedWorkoutPlans?.map((wp) => ({
            ...wp,
            workout_days: workoutDaysMap[wp.id] || [],
          })) || []

        const totalWorkouts = data?.length || 0
        const completedWorkouts = data?.filter((w) => w.is_active === false).length || 0
        const totalSets =
          data?.reduce(
            (total: number, workout) =>
              total +
              (workout.workout_days ?? []).reduce(
                (dayTotal: number, day) =>
                  dayTotal +
                  (day.workout_day_exercises ?? []).reduce(
                    (exTotal: number, ex) => exTotal + (ex.workout_sets?.length ?? 0),
                    0,
                  ),
                0,
              ),
            0,
          ) || 0
        const completedSets =
          data?.reduce(
            (total: number, workout) =>
              total +
              (workout.workout_days ?? []).reduce(
                (dayTotal: number, day) =>
                  dayTotal +
                  (day.workout_day_exercises ?? []).reduce(
                    (exTotal: number, ex) =>
                      exTotal +
                      (ex.workout_sets ?? []).filter((set) => Boolean(set.completed_at)).length,
                    0,
                  ),
                0,
              ),
            0,
          ) || 0

        // Calcola statistiche aggiuntive da workout_logs
        let totalSessions = 0
        let totalDuration = 0
        let totalExercises = 0

        try {
          const { data: workoutLogs, error: logsError } = await supabase
            .from('workout_logs')
            .select('durata_minuti, esercizi_completati, esercizi_totali, stato')
            .or(`atleta_id.eq.${userId},athlete_id.eq.${userId}`)
            .in('stato', ['completato', 'completed'])

          if (!logsError && workoutLogs) {
            type WorkoutLogStatsRow = Pick<
              Tables<'workout_logs'>,
              'durata_minuti' | 'esercizi_completati' | 'esercizi_totali' | 'stato'
            >
            const typedWorkoutLogs = (workoutLogs ?? []) as WorkoutLogStatsRow[]
            totalSessions = typedWorkoutLogs.length
            totalDuration =
              typedWorkoutLogs.reduce((sum, log) => sum + (log.durata_minuti || 0), 0) || 0
            totalExercises =
              typedWorkoutLogs.reduce(
                (sum, log) => sum + (log.esercizi_totali || log.esercizi_completati || 0),
                0,
              ) || 0
          }
        } catch (logsErr) {
          logger.warn('Error fetching workout logs for stats', logsErr, { userId })
        }

        // Conta esercizi unici dai workout_plans
        let uniqueExercises = 0
        try {
          const uniqueExerciseIds = new Set<string>()
          data?.forEach((workout) => {
            workout.workout_days?.forEach((day) => {
              day.workout_day_exercises?.forEach((ex) => {
                if (ex.exercise_id) {
                  uniqueExerciseIds.add(ex.exercise_id)
                }
              })
            })
          })
          uniqueExercises = uniqueExerciseIds.size
        } catch (exErr) {
          logger.warn('Error counting unique exercises', exErr, { userId })
        }

        const finalTotalExercises = totalExercises > 0 ? totalExercises : uniqueExercises
        const activeWorkouts = totalWorkouts - completedWorkouts

        const statsData: WorkoutStats = {
          total_workouts: totalWorkouts,
          completed_workouts: completedWorkouts,
          active_workouts: activeWorkouts,
          total_sets: totalSets,
          completed_sets: completedSets,
          average_completion_rate:
            totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
          last_workout_date: data?.[0]?.created_at,
          total_sessions: totalSessions,
          total_duration: totalDuration,
          total_exercises: finalTotalExercises,
        }

        setStats(statsData)
      } catch (err) {
        logger.error('Error fetching stats', err, { userId })
      }
    },
    [supabase],
  )

  return {
    stats,
    fetchStats,
  }
}
