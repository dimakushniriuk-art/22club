'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { RangeStatusMeter } from '@/components/dashboard/range-status-meter'
import type { WorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import { buildWorkoutExerciseSeries } from '@/lib/workout-exercise-chart-series'
import { Dumbbell } from 'lucide-react'

interface WorkoutExerciseChartsProps {
  data: WorkoutExerciseStats
  /**
   * Base path senza trailing slash, es. `/dashboard/atleti/[id]/progressi/allenamenti`
   * → link `Dettagli` → `[base]/[exerciseId]`.
   */
  detailBasePath?: string
}

export function WorkoutExerciseCharts({ data, detailBasePath }: WorkoutExerciseChartsProps) {
  const exerciseCharts = useMemo(() => {
    return data.exercises
      .map((exercise) => ({
        exercise,
        series: buildWorkoutExerciseSeries(exercise),
      }))
      .filter(({ series }) => series.hasWeight)
  }, [data.exercises])

  if (exerciseCharts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center px-2">
        <p className="text-text-primary text-sm font-medium">
          Nessun esercizio con peso registrato
        </p>
        <p className="text-text-tertiary mt-1 text-xs max-w-md">
          In questa griglia compaiono solo esercizi con almeno una serie con peso negli allenamenti
          completati (tempo o sole reps non sono mostrati qui).
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {exerciseCharts.map(({ exercise, series }) => {
        const noDataYet = series.chartData.length === 0
        const detailHref =
          detailBasePath !== undefined && detailBasePath.length > 0
            ? `${detailBasePath.replace(/\/$/, '')}/${encodeURIComponent(exercise.exercise_id)}`
            : undefined

        return (
          <div
            key={exercise.exercise_id}
            className="min-w-0 rounded-lg border border-white/10 bg-white/[0.02] p-3"
          >
            {noDataYet ? (
              <div className="w-full">
                <div className="mb-2 grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1">
                  <div className="min-w-0 col-start-1 row-start-1">
                    <h3 className="text-text-primary text-sm font-semibold">{exercise.exercise_name}</h3>
                  </div>
                  {detailHref ? (
                    <div className="col-start-2 row-start-1 row-span-2 justify-self-end self-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 px-2.5 text-xs text-primary"
                        asChild
                      >
                        <Link href={detailHref} aria-label={`Dettagli ${exercise.exercise_name}`}>
                          Dettagli
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col items-center justify-center py-8 px-1">
                  <Dumbbell className="h-9 w-9 text-text-tertiary mb-2 opacity-60" />
                  <p className="text-text-secondary text-xs font-medium text-center">
                    Nessun dato ancora
                  </p>
                  <p className="text-text-tertiary text-[11px] text-center mt-1 leading-snug">
                    Completa un allenamento che include questo esercizio per vedere i progressi.
                  </p>
                </div>
              </div>
            ) : (
              <RangeStatusMeter
                value={series.currentValue}
                history={series.history}
                title={exercise.exercise_name}
                unit={series.unit}
                showValue={series.currentValue != null}
                height={150}
                detailHref={detailHref}
                misurazioneField={series.sentimentField}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
