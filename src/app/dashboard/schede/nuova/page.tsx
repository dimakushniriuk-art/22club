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

function NuovaSchedaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { athletes, exercises, loading, error, handleCreateWorkout } = useWorkoutPlans()
  const { addToast } = useToast()

  const initialAthleteId = searchParams.get('athlete_id') || undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (workoutData: any) => {
    try {
      await handleCreateWorkout(workoutData)
      addToast({
        title: 'Scheda creata',
        message: 'La scheda di allenamento è stata creata con successo.',
        variant: 'success',
      })
      router.push('/dashboard/schede')
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

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <ErrorState message={error} onRetry={() => router.refresh()} />
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
