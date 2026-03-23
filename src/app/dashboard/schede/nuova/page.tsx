'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:schede:nuova:page')
import { useWorkoutPlans } from '@/hooks/workout-plans/use-workout-plans'
import { WorkoutWizardContent } from '@/components/workout/workout-wizard-content'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { useToast } from '@/components/ui/toast'
import { useSearchParams } from 'next/navigation'
import type { WorkoutWizardData, WorkoutDayExerciseData } from '@/types/workout'
import type { WorkoutWizardSaveOptions } from '@/hooks/workout/use-workout-wizard'

function NuovaSchedaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { athletes, exercises, loading, error, exercisesLoadError, handleCreateWorkout } =
    useWorkoutPlans()
  const { addToast } = useToast()

  const initialAthleteId = searchParams.get('athlete_id') || undefined

  const handleSave = async (
    workoutData: WorkoutWizardData,
    circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
    options?: WorkoutWizardSaveOptions,
  ) => {
    try {
      const newId = await handleCreateWorkout(workoutData, circuitList, options)
      addToast({
        title: options?.draft ? 'Bozza salvata' : 'Scheda creata',
        message: options?.draft
          ? 'Puoi continuare a modificare qui; i prossimi salvataggi aggiornano questa scheda.'
          : 'La scheda di allenamento è stata creata con successo.',
        variant: 'success',
      })
      if (options?.draft && newId) {
        router.replace(`/dashboard/schede/${newId}/modifica`)
      } else {
        router.push('/dashboard/schede')
      }
    } catch (error) {
      logger.error('Errore creazione scheda', error)
      addToast({
        title: 'Errore',
        message: error instanceof Error ? error.message : 'Errore nella creazione della scheda',
        variant: 'error',
      })
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/schede')
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <LoadingState message="Caricamento dati..." />
      </div>
    )
  }

  if (error || exercisesLoadError) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <ErrorState message={error || exercisesLoadError || ''} onRetry={() => router.refresh()} />
      </div>
    )
  }

  return (
    <WorkoutWizardContent
      onSave={handleSave}
      athletes={athletes}
      exercises={exercises}
      initialAthleteId={initialAthleteId}
      onCancel={handleCancel}
    />
  )
}

export default function NuovaSchedaPage() {
  return (
    <Suspense fallback={<LoadingState message="Caricamento..." />}>
      <NuovaSchedaContent />
    </Suspense>
  )
}
