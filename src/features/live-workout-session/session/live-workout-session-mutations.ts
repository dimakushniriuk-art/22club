import { useCallback } from 'react'
import { createLogger } from '@/lib/logger'
import type { WorkoutSession, WorkoutSetData } from '@/types/workout'
import {
  applyExerciseSetPatch,
  workoutDayExerciseRowId,
} from '@/features/live-workout-session/lib/live-workout-session-helpers'

const logger = createLogger('app:home:allenamenti:oggi:page')

type UseLiveWorkoutSessionMutationsArgs = {
  markEmbedDirty: () => void
  setWorkoutSession: React.Dispatch<React.SetStateAction<WorkoutSession | null>>
}

export function useLiveWorkoutSessionMutations({
  markEmbedDirty,
  setWorkoutSession,
}: UseLiveWorkoutSessionMutationsArgs) {
  const updateSetByIndex = useCallback(
    (exerciseIndex: number, setNumber: number, updates: Partial<WorkoutSetData>) => {
      markEmbedDirty()
      setWorkoutSession((prev) => {
        if (!prev) return prev
        const next = applyExerciseSetPatch(prev, exerciseIndex, setNumber, updates)
        return next ?? prev
      })
    },
    [markEmbedDirty, setWorkoutSession],
  )

  const updateSet = useCallback(
    (exerciseId: string, setNumber: number, updates: Partial<WorkoutSetData>) => {
      markEmbedDirty()
      const idNorm = String(exerciseId ?? '').trim()
      setWorkoutSession((prev) => {
        if (!prev?.exercises?.length) return prev
        const idx = prev.exercises.findIndex((ex) => workoutDayExerciseRowId(ex) === idNorm)
        if (idx < 0) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('updateSet: id esercizio (workout_day_exercise) non trovato nella sessione', {
              idNorm,
              targetN: Number(setNumber),
            })
          }
          return prev
        }
        const next = applyExerciseSetPatch(prev, idx, setNumber, updates)
        return next ?? prev
      })
    },
    [markEmbedDirty, setWorkoutSession],
  )

  return {
    updateSetByIndex,
    updateSet,
  }
}
