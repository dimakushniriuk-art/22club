'use client'

import { useMemo } from 'react'
import { RangeStatusMeter } from '@/components/dashboard/range-status-meter'
import {
  WorkoutExerciseSessioniByDateList,
  type WorkoutExerciseSessionRow,
} from '@/components/progressi/workout-exercise-sessioni-by-date-list'
import { useWorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import { buildWorkoutExerciseSeries } from '@/lib/workout-exercise-chart-series'

export function WorkoutExerciseStoricoContent({
  exerciseId,
  athleteUserId,
  actionsUnlocked = false,
}: {
  exerciseId: string
  athleteUserId: string | null
  /** Allineato allo storico misurazioni: mostra modifica/elimina su `workout_sets`. */
  actionsUnlocked?: boolean
}) {
  const { data, isLoading, error } = useWorkoutExerciseStats(athleteUserId)

  const exercise = useMemo(
    () => data?.exercises.find((e) => e.exercise_id === exerciseId),
    [data?.exercises, exerciseId],
  )

  const series = useMemo(() => (exercise ? buildWorkoutExerciseSeries(exercise) : null), [exercise])

  const listRows = useMemo((): WorkoutExerciseSessionRow[] => {
    if (!series) return []
    return series.chartData
      .map((row) => {
        const v = series.primaryValue(row)
        if (v == null || !Number.isFinite(v)) return null
        return {
          date: row.date,
          value: v,
          workoutLogId: row.workout_log_id,
          workoutDayExerciseId: row.workout_day_exercise_id,
        }
      })
      .filter((x): x is WorkoutExerciseSessionRow => x != null)
  }, [series])

  const metricKind: 'weight' | 'reps' | 'time' = useMemo(() => {
    if (!series) return 'time'
    if (series.hasWeight) return 'weight'
    if (series.hasReps) return 'reps'
    return 'time'
  }, [series])

  if (!athleteUserId) {
    return (
      <p className="text-text-secondary text-sm py-6 text-center">
        Profilo atleta senza user collegato.
      </p>
    )
  }

  if (isLoading) {
    return <p className="text-text-secondary text-sm py-8 text-center">Caricamento dati...</p>
  }

  if (error) {
    return (
      <p className="text-text-secondary text-sm py-8 text-center">
        {error instanceof Error ? error.message : String(error)}
      </p>
    )
  }

  if (!exercise || !series) {
    return (
      <p className="text-text-secondary text-sm py-8 text-center">
        Esercizio non trovato negli allenamenti dell&apos;atleta.
      </p>
    )
  }

  return (
    <>
      <RangeStatusMeter
        value={series.currentValue}
        history={series.history}
        title={exercise.exercise_name}
        unit={series.unit}
        showValue={series.currentValue != null}
        height={190}
        misurazioneField={series.sentimentField}
      />
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Elenco per data
        </h4>
        <WorkoutExerciseSessioniByDateList
          rows={listRows}
          valueSuffix={series.unit}
          sentimentField={series.sentimentField}
          metricKind={metricKind}
          actionsUnlocked={actionsUnlocked}
          athleteUserId={athleteUserId}
          exerciseLabel={exercise.exercise_name}
        />
      </div>
    </>
  )
}
