'use client'

import { useEffect, useRef } from 'react'
import { useWorkoutExercises } from './workouts/use-workout-exercises'
import { useWorkoutPlansList } from './workouts/use-workout-plans-list'
import { useWorkoutSession } from './workouts/use-workout-session'
import { useWorkoutStats } from './workouts/use-workout-stats'
import { useWorkoutMutations } from './workouts/use-workout-mutations'

interface UseWorkoutsProps {
  userId?: string | null
  role?: string | null
  /**
   * true: solo lista piani (es. /home/allenamenti). Evita sessione corrente + stats
   * che non servono alla UI e duplicano query pesanti.
   */
  plansListOnly?: boolean
  /** Trainer/admin: carica schede dell’atleta (profiles.id) via API staff. */
  athleteSubjectProfileId?: string | null
}

export function useWorkouts({
  userId,
  role,
  plansListOnly = false,
  athleteSubjectProfileId = null,
}: UseWorkoutsProps) {
  const isAthleteRole = role === 'athlete' || role === 'atleta'
  const {
    exercises,
    loading: exercisesLoading,
    error: exercisesError,
    fetchExercises,
  } = useWorkoutExercises({ enabled: !isAthleteRole })
  const {
    workouts,
    loading: workoutsLoading,
    error: workoutsError,
    fetchWorkouts,
  } = useWorkoutPlansList()
  const { currentWorkout, fetchCurrentWorkout } = useWorkoutSession()
  const { stats, fetchStats } = useWorkoutStats()
  const { createWorkout, updateWorkoutSet, completeExercise } = useWorkoutMutations()

  // Atleta: il catalogo globale exercises non serve a /home/allenamenti → non bloccare sul suo fetch
  const loading = workoutsLoading || (!isAthleteRole && exercisesLoading)
  const error = exercisesError || workoutsError

  // Usa useRef per tracciare i valori precedenti e evitare fetch inutili
  const prevUserIdRef = useRef<string | null | undefined>(undefined)
  const prevRoleRef = useRef<string | null | undefined>(undefined)
  const prevSubjectRef = useRef<string | null | undefined>(undefined)

  // Carica dati quando userId / ruolo / preview atleta cambiano
  useEffect(() => {
    if (
      prevUserIdRef.current === userId &&
      prevRoleRef.current === role &&
      prevSubjectRef.current === athleteSubjectProfileId
    ) {
      return
    }

    prevUserIdRef.current = userId
    prevRoleRef.current = role
    prevSubjectRef.current = athleteSubjectProfileId

    if (userId) {
      void fetchWorkouts(userId, role || null, {
        athleteSubjectProfileId,
      })
      if (role === 'athlete' && !plansListOnly && !athleteSubjectProfileId) {
        void fetchCurrentWorkout(userId)
        void fetchStats(userId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role, plansListOnly, athleteSubjectProfileId]) // Rimossi fetch* dalle dipendenze per evitare loop

  return {
    workouts,
    exercises,
    currentWorkout,
    stats,
    loading,
    error,
    fetchWorkouts: () =>
      userId && fetchWorkouts(userId, role || null, { athleteSubjectProfileId }),
    fetchCurrentWorkout: () => userId && role === 'athlete' && fetchCurrentWorkout(userId),
    fetchExercises,
    createWorkout,
    updateWorkoutSet,
    completeExercise,
    refetch: () =>
      userId && fetchWorkouts(userId, role || null, { athleteSubjectProfileId }),
  }
}
