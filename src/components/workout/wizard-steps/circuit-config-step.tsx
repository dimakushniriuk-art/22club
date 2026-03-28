'use client'

import Image from 'next/image'
import { Button, SimpleSelect } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Label } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'
import {
  buildWorkoutRepsSelectOptions,
  workoutRepsFromSelectValue,
  workoutRepsToSelectValue,
} from '@/lib/constants/workout-reps-select'
import { isWorkoutExerciseConfigured } from '@/lib/validations/workout-target'
import {
  ExecutionSecondsField,
  RestSecondsField,
  WeightKgField,
} from '@/components/workout/workout-exercise-target-panel'
import { cn } from '@/lib/utils'
import type { Exercise, WorkoutDayExerciseData, WorkoutSetDetail } from '@/types/workout'

function isValidHttpUrl(u: unknown): u is string {
  return (
    typeof u === 'string' &&
    u.trim() !== '' &&
    (u.startsWith('http://') || u.startsWith('https://'))
  )
}

interface CircuitConfigStepProps {
  exercises: Exercise[]
  params: WorkoutDayExerciseData[]
  onUpdate: (index: number, data: Partial<WorkoutDayExerciseData>) => void
}

export function CircuitConfigStep({ exercises, params, onUpdate }: CircuitConfigStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {params.map((exercise, exerciseIndex) => {
          const exerciseData = exercises.find((e) => e.id === exercise.exercise_id)
          const noteFieldId = `circuit-note-${exerciseIndex}`
          const targetConfigured = isWorkoutExerciseConfigured(exercise)
          const mainRepsOptions = buildWorkoutRepsSelectOptions(exercise.target_reps)
          const hasVideoUrl = isValidHttpUrl(exerciseData?.video_url)
          const posterUrl = exerciseData?.thumb_url || exerciseData?.image_url || null
          const showExerciseMedia = hasVideoUrl || isValidHttpUrl(posterUrl)

          return (
            <div
              key={exercise.exercise_id}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-[#141414] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200"
            >
              <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <h4 className="text-text-primary font-semibold text-base">
                    {exerciseData?.name || 'Esercizio'}
                  </h4>
                  <Badge
                    variant="outline"
                    size="sm"
                    className={
                      targetConfigured
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shrink-0'
                        : 'border-amber-500/40 bg-amber-500/15 text-amber-300 shrink-0'
                    }
                  >
                    {targetConfigured ? 'Configurato' : 'Da configurare'}
                  </Badge>
                </div>
              </div>

              <div
                className={cn(
                  'flex flex-col gap-4 items-stretch',
                  showExerciseMedia && 'lg:flex-row lg:items-start',
                )}
              >
                {showExerciseMedia ? (
                  <div
                    className={cn(
                      'relative mx-auto aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]',
                      'max-w-md lg:mx-0 lg:w-64 xl:w-72',
                    )}
                  >
                    {hasVideoUrl && exerciseData?.video_url ? (
                      <video
                        src={exerciseData.video_url}
                        poster={isValidHttpUrl(posterUrl) ? posterUrl : undefined}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        controls
                      />
                    ) : isValidHttpUrl(posterUrl) ? (
                      <Image
                        src={posterUrl}
                        alt={exerciseData?.name ?? 'Esercizio'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 288px"
                        unoptimized
                      />
                    ) : null}
                  </div>
                ) : null}
                <div className="min-w-0 w-full flex-1">
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] mb-4 overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-left bg-white/[0.02]">
                            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                              Serie
                            </span>
                          </th>
                          <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                              Ripetizioni
                            </span>
                          </th>
                          <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                              Peso (kg)
                            </span>
                          </th>
                          <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                              Tempo esecuzione (sec)
                            </span>
                          </th>
                          <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                              Recupero (sec)
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-4 align-middle">
                            <div className="flex justify-center sm:justify-start">
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm"
                                aria-label="Serie 1"
                              >
                                1
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-l border-white/10">
                            <SimpleSelect
                              value={workoutRepsToSelectValue(exercise.target_reps)}
                              onValueChange={(v) =>
                                onUpdate(exerciseIndex, {
                                  target_reps: workoutRepsFromSelectValue(v),
                                })
                              }
                              options={mainRepsOptions}
                              placeholder="Ripetizioni"
                              className="w-full min-w-[8rem]"
                            />
                          </td>
                          <td className="px-4 py-4 border-l border-white/10">
                            <WeightKgField
                              value={exercise.target_weight}
                              onChange={(kg) => onUpdate(exerciseIndex, { target_weight: kg ?? 0 })}
                              className="w-full"
                            />
                          </td>
                          <td className="px-4 py-4 border-l border-white/10">
                            <ExecutionSecondsField
                              value={exercise.execution_time_sec}
                              onChange={(sec) =>
                                onUpdate(exerciseIndex, { execution_time_sec: sec ?? 0 })
                              }
                              className="w-full"
                            />
                          </td>
                          <td className="px-4 py-4 border-l border-white/10">
                            <RestSecondsField
                              value={exercise.rest_timer_sec}
                              onChange={(sec) => onUpdate(exerciseIndex, { rest_timer_sec: sec })}
                              className="w-full"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="relative mt-4 mb-4">
                    <Label
                      htmlFor={noteFieldId}
                      className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 block"
                    >
                      Note Esercizio (opzionale)
                    </Label>
                    <Textarea
                      id={noteFieldId}
                      value={exercise.note ?? ''}
                      onChange={(e) =>
                        onUpdate(exerciseIndex, { note: e.target.value || undefined })
                      }
                      placeholder="Inserisci note specifiche per questo esercizio (es. tecnica, respirazione, posizione, ecc.)"
                      className="w-full min-h-[80px] resize-y bg-white/[0.04] border border-white/10 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:ring-primary/20"
                      rows={3}
                    />
                    {exercise.note ? (
                      <p className="text-text-tertiary text-xs mt-1">
                        {exercise.note.length} caratteri
                      </p>
                    ) : null}
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentSets = exercise.sets_detail ?? []
                        const newSet: WorkoutSetDetail = {
                          id: `set-${Date.now()}-${Math.random()}`,
                          set_number: currentSets.length + 2,
                          reps: exercise.target_reps ?? 10,
                          weight_kg: exercise.target_weight,
                          execution_time_sec: exercise.execution_time_sec ?? undefined,
                          rest_timer_sec: exercise.rest_timer_sec ?? undefined,
                        }
                        onUpdate(exerciseIndex, {
                          sets_detail: [...currentSets, newSet],
                          target_sets: currentSets.length + 2,
                        })
                      }}
                      className="border-primary/25 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi serie
                    </Button>
                    {exercise.sets_detail && exercise.sets_detail.length > 0 ? (
                      <span className="text-text-tertiary text-xs">
                        {exercise.sets_detail.length}{' '}
                        {exercise.sets_detail.length === 1
                          ? 'serie configurata'
                          : 'serie configurate'}
                      </span>
                    ) : null}
                  </div>

                  {exercise.sets_detail && exercise.sets_detail.length > 0 ? (
                    <div className="space-y-3 mt-4 pt-5 border-t border-white/10">
                      <h5 className="text-text-secondary text-sm font-semibold mb-4 flex items-center gap-2">
                        <span>Serie configurate</span>
                        <Badge
                          variant="outline"
                          size="sm"
                          className="border-0 bg-primary/10 text-primary"
                        >
                          {exercise.sets_detail.length}
                        </Badge>
                      </h5>
                      <div className="space-y-2.5">
                        {exercise.sets_detail.map((set, setIndex) => (
                          <div
                            key={set.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-white/10 bg-white/[0.04] hover:border-white/20 transition-all duration-200"
                          >
                            <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {set.set_number}
                            </div>
                            <div className="relative flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-text-secondary text-xs font-medium">
                                  Ripetizioni
                                </span>
                                <SimpleSelect
                                  value={workoutRepsToSelectValue(set.reps)}
                                  onValueChange={(v) => {
                                    const updated = [...exercise.sets_detail!]
                                    updated[setIndex] = {
                                      ...updated[setIndex],
                                      reps: workoutRepsFromSelectValue(v),
                                    }
                                    onUpdate(exerciseIndex, { sets_detail: updated })
                                  }}
                                  options={buildWorkoutRepsSelectOptions(set.reps)}
                                  placeholder="Ripetizioni"
                                  className="w-full"
                                />
                              </div>
                              <WeightKgField
                                label="Peso (kg)"
                                value={set.weight_kg}
                                onChange={(kg) => {
                                  const updated = [...exercise.sets_detail!]
                                  updated[setIndex] = {
                                    ...updated[setIndex],
                                    weight_kg: kg,
                                  }
                                  onUpdate(exerciseIndex, { sets_detail: updated })
                                }}
                              />
                              <ExecutionSecondsField
                                label="Tempo esecuzione (sec)"
                                value={set.execution_time_sec}
                                onChange={(sec) => {
                                  const updated = [...exercise.sets_detail!]
                                  updated[setIndex] = {
                                    ...updated[setIndex],
                                    execution_time_sec: sec,
                                  }
                                  onUpdate(exerciseIndex, { sets_detail: updated })
                                }}
                              />
                              <RestSecondsField
                                label="Recupero (sec)"
                                value={set.rest_timer_sec}
                                onChange={(sec) => {
                                  const updated = [...exercise.sets_detail!]
                                  updated[setIndex] = {
                                    ...updated[setIndex],
                                    rest_timer_sec: sec,
                                  }
                                  onUpdate(exerciseIndex, { sets_detail: updated })
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = exercise.sets_detail!.filter(
                                  (_, idx) => idx !== setIndex,
                                )
                                const renumbered = updated.map((s, idx) => ({
                                  ...s,
                                  set_number: idx + 2,
                                }))
                                onUpdate(exerciseIndex, {
                                  sets_detail: renumbered,
                                  target_sets: renumbered.length + 1 || 1,
                                })
                              }}
                              className="relative text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
