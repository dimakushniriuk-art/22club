// ============================================================
// Hook per mutazioni workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

const logger = createLogger('hooks:workouts:use-workout-mutations')

export function useWorkoutMutations() {
  const supabase = createClient()

  const createWorkout = useCallback(
    async (workoutData: TablesInsert<'workout_plans'>) => {
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .insert(workoutData)
          .select()
          .single()

        if (error) throw error

        return data
      } catch (err) {
        logger.error('Error creating workout', err)
        throw err
      }
    },
    [supabase],
  )

  const updateWorkoutSet = useCallback(
    async (
      workoutDayExerciseId: string,
      setData: TablesInsert<'workout_sets'> | TablesUpdate<'workout_sets'>,
    ) => {
      try {
        const { data, error } = await supabase
          .from('workout_sets')
          .upsert(setData)
          .select()
          .single()

        if (error) throw error

        return data
      } catch (err) {
        logger.error('Error updating workout set', err, { workoutDayExerciseId })
        throw err
      }
    },
    [supabase],
  )

  const completeExercise = useCallback(
    async (workoutDayExerciseId: string) => {
      try {
        const { error } = await supabase
          .from('workout_sets')
          .update({ completed_at: new Date().toISOString() })
          .eq('workout_day_exercise_id', workoutDayExerciseId)
          .is('completed_at', null)

        if (error) throw error

        return true
      } catch (err) {
        logger.error('Error completing exercise', err, { workoutDayExerciseId })
        throw err
      }
    },
    [supabase],
  )

  return {
    createWorkout,
    updateWorkoutSet,
    completeExercise,
  }
}
