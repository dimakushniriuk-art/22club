import { apiGet } from '@/lib/api-client'
import { DEFAULT_EXERCISE_CATEGORY } from '@/lib/exercises-data'
import { createLogger } from '@/lib/logger'
import { supabase } from '@/lib/supabase/client'
import type { Exercise } from '@/types/exercise'

const logger = createLogger('lib:exercises:fetch-staff-exercises-list')

function normalizeDifficulty(value: string | null | undefined): Exercise['difficulty'] {
  if (!value) return 'media'
  switch (value) {
    case 'bassa':
    case 'media':
    case 'alta':
      return value
    case 'easy':
    case 'beginner':
      return 'bassa'
    case 'medium':
      return 'media'
    case 'hard':
    case 'advanced':
      return 'alta'
    default:
      return 'media'
  }
}

export async function fetchStaffExercisesList(): Promise<Exercise[]> {
  try {
    const response = await apiGet<{ data: (Exercise & { difficulty?: string | null })[] }>(
      '/api/exercises',
      {},
      async () => {
        const { data: exercises, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error

        return { data: (exercises || []) as (Exercise & { difficulty?: string | null })[] }
      },
    )

    const exercisesArray = Array.isArray(response) ? response : response?.data || []

    return exercisesArray.map((item) => ({
      ...item,
      category: (item.category && String(item.category).trim()) || DEFAULT_EXERCISE_CATEGORY,
      difficulty: normalizeDifficulty(item.difficulty),
    }))
  } catch (err) {
    logger.error('Errore nel caricamento esercizi', err)
    throw err instanceof Error ? err : new Error(String(err))
  }
}
