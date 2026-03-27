'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:schede:[id]:modifica:page')
import { useWorkoutDetail } from '@/hooks/workout/use-workout-detail'
import { useWorkoutPlans } from '@/hooks/workout-plans/use-workout-plans'
import { WorkoutWizardContent } from '@/components/workout/workout-wizard-content'
import { ErrorState } from '@/components/dashboard/error-state'
import { useToast } from '@/components/ui/toast'
import type { WorkoutWizardData, WorkoutDayExerciseData, DayItem } from '@/types/workout'
import { WORKOUT_PLAN_NO_ATHLETE_VALUE } from '@/lib/constants/workout-plan-wizard'
import type { WorkoutWizardSaveOptions } from '@/hooks/workout/use-workout-wizard'

function workoutDetailToWizardData(detail: {
  name: string
  description: string | null
  objective: string | null
  athlete_id: string | null
  days: Array<{
    day_number: number
    title: string
    exercises: Array<{
      exercise_id: string | null
      target_sets: number
      target_reps: number
      target_weight: number | null
      rest_timer_sec: number
      note?: string | null
      sets?: Array<{
        id: string
        set_number: number
        reps: number
        weight_kg: number | null
        execution_time_sec: number | null
        rest_timer_sec: number | null
      }>
    }>
  }>
}): WorkoutWizardData {
  const toEx = (ex: {
    exercise_id: string | null
    target_sets?: number | null
    target_reps?: number | null
    target_weight?: number | null
    rest_timer_sec?: number | null
    note?: string | null
    sets?: Array<{
      id: string
      set_number: number
      reps: number
      weight_kg: number | null
      execution_time_sec: number | null
      rest_timer_sec: number | null
    }>
  }): WorkoutDayExerciseData => {
    const setsDetail = ex.sets?.map((s) => ({
      id: s.id,
      set_number: s.set_number,
      reps: s.reps,
      weight_kg: s.weight_kg ?? undefined,
      execution_time_sec: s.execution_time_sec ?? undefined,
      rest_timer_sec: s.rest_timer_sec ?? undefined,
    }))
    return {
      exercise_id: ex.exercise_id ?? '',
      sets: ex.target_sets ?? 1,
      target_sets: ex.target_sets ?? 1,
      target_reps: ex.target_reps ?? 10,
      target_weight: ex.target_weight ?? 0,
      rest_timer_sec: ex.rest_timer_sec ?? 60,
      note: ex.note ?? undefined,
      sets_detail: setsDetail,
    }
  }
  return {
    title: detail.name,
    notes: detail.description ?? undefined,
    difficulty: 'media',
    athlete_id:
      detail.athlete_id == null || detail.athlete_id === ''
        ? WORKOUT_PLAN_NO_ATHLETE_VALUE
        : detail.athlete_id,
    objective: detail.objective ?? undefined,
    days: detail.days.map((day) => {
      const items = (day as { items?: DayItem[] }).items
      const circuitListDetail = (
        detail as { circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }> }
      ).circuitList
      if (items && items.length > 0) {
        const exercises = items.flatMap((i) =>
          i.type === 'exercise'
            ? [i.exercise]
            : (circuitListDetail?.find((c) => c.id === i.circuitId)?.params ?? []),
        )
        return {
          name: day.title,
          title: day.title,
          day_number: day.day_number,
          exercises,
          items,
        }
      }
      return {
        name: day.title,
        title: day.title,
        day_number: day.day_number,
        exercises: day.exercises
          .filter((ex): ex is typeof ex & { exercise_id: string } => ex.exercise_id != null)
          .map((ex) => toEx(ex)),
      }
    }),
  }
}

function ModificaSchedaContent() {
  const router = useRouter()
  const params = useParams()
  const workoutId = typeof params?.id === 'string' ? params.id : null

  const { workout, loading: detailLoading, error: detailError } = useWorkoutDetail(workoutId, true)
  const {
    athletes,
    exercises,
    loading: plansLoading,
    exercisesLoadError,
    handleUpdateWorkout,
  } = useWorkoutPlans()
  const { addToast } = useToast()

  const initialData = useMemo(
    () => (workout ? workoutDetailToWizardData(workout) : undefined),
    [workout],
  )

  const handleSave = async (
    workoutData: WorkoutWizardData,
    circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
    options?: WorkoutWizardSaveOptions,
  ) => {
    if (!workoutId) return
    try {
      await handleUpdateWorkout(workoutId, workoutData, circuitList, options)
      addToast({
        title: options?.draft ? 'Bozza salvata' : 'Scheda aggiornata',
        message: options?.draft
          ? 'Le modifiche sono state salvate come bozza.'
          : 'La scheda di allenamento è stata aggiornata con successo.',
        variant: 'success',
      })
      if (!options?.draft) {
        router.push('/dashboard/schede')
      }
    } catch (error) {
      logger.error('Errore aggiornamento scheda', error)
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

  if (!workoutId) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <ErrorState
          message="ID scheda non valido"
          onRetry={() => router.push('/dashboard/schede')}
        />
      </div>
    )
  }

  if (detailLoading || plansLoading) {
    return null
  }

  if (detailError) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <ErrorState message={detailError.message} onRetry={() => router.refresh()} />
      </div>
    )
  }

  if (exercisesLoadError) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <ErrorState message={exercisesLoadError} onRetry={() => router.refresh()} />
      </div>
    )
  }

  if (!workout || !initialData) {
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
      initialCircuitList={workout.circuitList}
      onCancel={handleCancel}
    />
  )
}

export default function ModificaSchedaPage() {
  return (
    <Suspense fallback={null}>
      <ModificaSchedaContent />
    </Suspense>
  )
}
