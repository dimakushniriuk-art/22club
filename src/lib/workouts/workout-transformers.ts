// ============================================================
// Utility per trasformazione dati workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import type { Workout, Exercise } from '@/types/workout'
import type { Tables } from '@/types/supabase'

type ExerciseRow = Tables<'exercises'> & {
  updated_at?: string | null
  category?: string | null
  org_id?: string | null
  muscle_group?: string | null
  image_url?: string | null
  video_url?: string | null
  description?: string | null
  equipment?: string | null
  difficulty?: string | null
}

const difficultyMap: Record<string, Workout['difficulty']> = {
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

export function transformExercise(exercise: ExerciseRow): Exercise {
  return {
    id: exercise.id ?? '',
    org_id: exercise.org_id ?? '',
    name: exercise.name ?? '',
    category: exercise.category ?? 'Generale',
    muscle_group: exercise.muscle_group ?? '',
    equipment: exercise.equipment ?? null,
    difficulty:
      exercise.difficulty === 'bassa' ||
      exercise.difficulty === 'media' ||
      exercise.difficulty === 'alta'
        ? exercise.difficulty
        : (difficultyMap[exercise.difficulty ?? ''] ?? 'media'),
    video_url: exercise.video_url ?? null,
    description: exercise.description ?? null,
    image_url: exercise.image_url ?? null,
    created_at: exercise.created_at ?? new Date().toISOString(),
    updated_at: exercise.updated_at ?? new Date().toISOString(),
  }
}

export function transformExercises(exercises: ExerciseRow[]): Exercise[] {
  return exercises.map(transformExercise)
}

export function getDifficultyFromDb(value?: string | null): Workout['difficulty'] {
  return (
    difficultyMap[value ?? ''] ??
    (value === 'bassa' || value === 'media' || value === 'alta' ? value : 'media')
  )
}
