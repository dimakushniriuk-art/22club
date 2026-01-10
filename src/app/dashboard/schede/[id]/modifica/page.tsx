'use client'

import { Suspense } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:schede:[id]:modifica:page')
import { useRouter, useParams } from 'next/navigation'
import { useWorkoutPlans } from '@/hooks/workout-plans/use-workout-plans'
import { useWorkoutDetail } from '@/hooks/workout/use-workout-detail'
import { WorkoutWizardContent } from '@/components/workout/workout-wizard-content'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { useToast } from '@/components/ui/toast'
import type { WorkoutWizardData, WorkoutDayData } from '@/types/workout'
import { useMemo } from 'react'

function ModificaSchedaContent() {
  const router = useRouter()
  // Estrai immediatamente il valore per evitare enumerazione di params (Next.js 15.5.9+)
  // Non memorizzare l'oggetto params per evitare enumerazione durante la serializzazione di React DevTools
  // Accedi direttamente alle proprietà senza memorizzare l'oggetto
  const workoutId = useParams().id as string | undefined
  const {
    athletes,
    exercises,
    loading: plansLoading,
    error: plansError,
    handleUpdateWorkout,
  } = useWorkoutPlans()
  const {
    workout,
    loading: detailLoading,
    error: detailError,
  } = useWorkoutDetail(workoutId || null, true)
  const { addToast } = useToast()

  // Trasforma i dati del workout in formato WorkoutWizardData
  const initialData: WorkoutWizardData | undefined = useMemo(() => {
    if (!workout || !exercises.length) return undefined

    const days: WorkoutDayData[] = workout.days.map((day) => ({
      name: day.title || `Giorno ${day.day_number}`,
      title: day.title || `Giorno ${day.day_number}`,
      day_number: day.day_number,
      exercises: day.exercises.map((ex) => {
        // Usa l'exercise_id se disponibile, altrimenti cerca per nome
        let exercise_id = ex.exercise_id || ''
        if (!exercise_id) {
          const exercise = exercises.find((e) => e.name === ex.exercise_name)
          exercise_id = exercise?.id || ''
        }

        // Mappa i set: la serie 1 è già nella tabella (valori base), le serie aggiuntive partono dalla 2
        const sets_detail = (ex.sets || [])
          .filter((set) => set.set_number > 1) // Escludi la serie 1 (è già nella tabella)
          .map((set) => ({
            id: set.id,
            set_number: set.set_number,
            reps: set.reps,
            weight_kg: set.weight_kg ?? undefined,
            execution_time_sec: set.execution_time_sec ?? undefined,
            rest_timer_sec: set.rest_timer_sec ?? undefined,
          }))

        return {
          exercise_id,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight ?? undefined,
          rest_timer_sec: ex.rest_timer_sec,
          sets: ex.target_sets,
          reps_min: ex.target_reps,
          weight_kg: ex.target_weight ?? undefined,
          rest_seconds: ex.rest_timer_sec,
          sets_detail: sets_detail.length > 0 ? sets_detail : undefined,
        }
      }),
    }))

    // Usa l'athlete_id direttamente se disponibile
    const athleteId = workout.athlete_id || ''

    return {
      title: workout.name,
      notes: workout.description || '',
      athlete_id: athleteId,
      objective: workout.objective || undefined,
      difficulty: 'media',
      days,
    }
  }, [workout, exercises])

  const handleSave = async (workoutData: WorkoutWizardData) => {
    if (!workoutId) {
      throw new Error('ID scheda non trovato')
    }

    try {
      await handleUpdateWorkout(workoutId, workoutData)
      addToast({
        title: 'Scheda aggiornata',
        message: 'La scheda di allenamento è stata aggiornata con successo.',
        variant: 'success',
      })
      router.push('/dashboard/schede')
    } catch (error) {
      logger.error('Errore aggiornamento scheda', error, { workoutId })
      addToast({
        title: 'Errore',
        message: error instanceof Error ? error.message : "Errore nell'aggiornamento della scheda",
        variant: 'error',
      })
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/schede')
  }

  const loading = plansLoading || detailLoading
  const error = plansError || (detailError ? detailError.message : null)

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <LoadingState message="Caricamento dati..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <ErrorState message={error} onRetry={() => router.refresh()} />
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <ErrorState message="Scheda non trovata" onRetry={() => router.push('/dashboard/schede')} />
      </div>
    )
  }

  return (
    <WorkoutWizardContent
      onSave={handleSave}
      athletes={athletes}
      exercises={exercises}
      initialData={initialData}
      onCancel={handleCancel}
    />
  )
}

export default function ModificaSchedaPage() {
  return (
    <Suspense fallback={<LoadingState message="Caricamento..." />}>
      <ModificaSchedaContent />
    </Suspense>
  )
}
