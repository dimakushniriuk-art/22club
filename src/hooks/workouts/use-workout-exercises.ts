// ============================================================
// Hook per gestione esercizi workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Exercise } from '@/types/workout'
import type { Tables } from '@/types/supabase'
import { transformExercises } from '@/lib/workouts/workout-transformers'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:workouts:use-workout-exercises')

type ExerciseRow = Tables<'exercises'>

export function useWorkoutExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchExercises = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })
        .returns<ExerciseRow[]>()

      if (error) throw error

      const safeData = transformExercises(data ?? [])
      setExercises(safeData)
      setError(null)
    } catch (err) {
      logger.error('Error fetching exercises', err)
      setError('Errore nel caricamento degli esercizi')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  return {
    exercises,
    loading,
    error,
    fetchExercises,
  }
}
