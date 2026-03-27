// ============================================================
// Hook per gestione esercizi workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Exercise } from '@/types/workout'
import type { Tables } from '@/types/supabase'
import { transformExercises } from '@/lib/workouts/workout-transformers'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:workouts:use-workout-exercises')

type ExerciseRow = Tables<'exercises'>

type UseWorkoutExercisesOptions = {
  /** Se false, non esegue il fetch (es. pagina atleta che non usa il catalogo globale). */
  enabled?: boolean
}

export function useWorkoutExercises(options?: UseWorkoutExercisesOptions) {
  const enabled = options?.enabled !== false

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

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
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    void fetchExercises()
  }, [enabled, fetchExercises])

  return {
    exercises,
    loading,
    error,
    fetchExercises,
  }
}
