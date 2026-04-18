'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:schede:[id]:modifica:page')
import { useWorkoutDetail } from '@/hooks/workout/use-workout-detail'
import { useWorkoutPlans } from '@/hooks/workout-plans/use-workout-plans'
import { WorkoutWizardContent } from '@/components/workout/workout-wizard-content'
import { ErrorState } from '@/components/dashboard/error-state'
import { StaffDashboardSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'
import type { Workout, WorkoutWizardData, WorkoutDayExerciseData, DayItem } from '@/types/workout'
import { WORKOUT_PLAN_NO_ATHLETE_VALUE } from '@/lib/constants/workout-plan-wizard'
import type { WorkoutWizardSaveOptions } from '@/hooks/workout/use-workout-wizard'

function workoutDetailToWizardData(detail: {
  name: string
  description: string | null
  objective: string | null
  athlete_id: string | null
  difficulty: Workout['difficulty']
  days: Array<{
    day_number: number
    title: string
    sessions_until_refresh?: number | null
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
  const daySessions = (day: { sessions_until_refresh?: number | null }) => {
    const s = day.sessions_until_refresh
    return typeof s === 'number' && Number.isFinite(s) && s >= 1 ? s : null
  }

  return {
    title: detail.name,
    notes: detail.description ?? undefined,
    difficulty: detail.difficulty,
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
          sessions_until_refresh: daySessions(day),
          exercises,
          items,
        }
      }
      return {
        name: day.title,
        title: day.title,
        day_number: day.day_number,
        sessions_until_refresh: daySessions(day),
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
  const { athletes, exercises, wizardDataLoading, exercisesLoadError, handleUpdateWorkout } =
    useWorkoutPlans({ skipWorkoutList: true })
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
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <ErrorState
          message="ID scheda non valido"
          onRetry={() => router.push('/dashboard/schede')}
        />
      </div>
    )
  }

  if (detailLoading || wizardDataLoading) {
    return (
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <span>Caricamento scheda in corso...</span>
        </div>
      </div>
    )
  }

  if (detailError) {
    return (
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <ErrorState message={detailError.message} onRetry={() => router.refresh()} />
      </div>
    )
  }

  if (exercisesLoadError) {
    return (
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <ErrorState message={exercisesLoadError} onRetry={() => router.refresh()} />
      </div>
    )
  }

  if (!workout || !initialData) {
    return (
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col">
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
    <Suspense fallback={<StaffDashboardSegmentSkeleton />}>
      <ModificaSchedaContent />
    </Suspense>
  )
}
