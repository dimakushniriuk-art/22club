'use client'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'
import type { Exercise, WorkoutDayExerciseData, WorkoutSetDetail } from '@/types/workout'

interface CircuitConfigStepProps {
  exercises: Exercise[]
  params: WorkoutDayExerciseData[]
  onUpdate: (index: number, data: Partial<WorkoutDayExerciseData>) => void
}

export function CircuitConfigStep({
  exercises,
  params,
  onUpdate,
}: CircuitConfigStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm">
        Imposta serie, ripetizioni, pesi e tempi per ogni esercizio del circuito
      </p>
      <div className="space-y-6">
        {params.map((exercise, exerciseIndex) => {
          const exerciseData = exercises.find((e) => e.id === exercise.exercise_id)
          return (
            <div
              key={exercise.exercise_id}
              className="relative overflow-hidden rounded-[16px] border border-surface-300/30 bg-background-secondary/30 p-4 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-white focus-within:outline-none from-blue-900 to-indigo-900"
            >
              <div className="p-4 relative space-y-5 pt-6">
                <h4 className="text-text-primary font-semibold text-base">
                  {exerciseData?.name || 'Esercizio'}
                </h4>

                <div className="relative overflow-hidden rounded-xl border border-surface-300/30 bg-background-tertiary/30 mb-4 shadow-sm">
                  <table className="w-full relative">
                    <thead>
                      <tr className="bg-background-tertiary/60 border-b border-surface-300/30">
                        <th className="px-4 py-3 text-left">
                          <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Serie
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left border-l border-surface-300/30">
                          <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Ripetizioni
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left border-l border-surface-300/30">
                          <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Peso (kg)
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left border-l border-surface-300/30">
                          <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Tempo esecuzione (sec)
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left border-l border-surface-300/30">
                          <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Recupero (sec)
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-4">
                          <Input
                            type="number"
                            value={exercise.target_sets ?? 1}
                            onChange={(e) =>
                              onUpdate(exerciseIndex, { target_sets: Number(e.target.value) })
                            }
                            min="0"
                            max="20"
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-4 border-l border-surface-300/30">
                          <Input
                            type="number"
                            value={exercise.target_reps ?? ''}
                            onChange={(e) =>
                              onUpdate(exerciseIndex, { target_reps: Number(e.target.value) })
                            }
                            min="1"
                            max="100"
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-4 border-l border-surface-300/30">
                          <Input
                            type="number"
                            value={exercise.target_weight ?? ''}
                            onChange={(e) =>
                              onUpdate(exerciseIndex, {
                                target_weight: Number(e.target.value) || undefined,
                              })
                            }
                            min="0"
                            step="0.5"
                            placeholder="0"
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-4 border-l border-surface-300/30">
                          <Input
                            type="number"
                            value={exercise.execution_time_sec ?? ''}
                            onChange={(e) =>
                              onUpdate(exerciseIndex, {
                                execution_time_sec: Number(e.target.value) || undefined,
                              })
                            }
                            min="0"
                            max="3600"
                            placeholder="0"
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-4 border-l border-surface-300/30">
                          <Input
                            type="number"
                            value={exercise.rest_timer_sec ?? ''}
                            onChange={(e) =>
                              onUpdate(exerciseIndex, {
                                rest_timer_sec: Number(e.target.value),
                              })
                            }
                            min="10"
                            max="600"
                            className="w-full"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="relative mt-4 mb-4">
                  <Label
                    htmlFor={`circuit-note-${exerciseIndex}`}
                    className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 block"
                  >
                    Note Esercizio (opzionale)
                  </Label>
                  <Textarea
                    id={`circuit-note-${exerciseIndex}`}
                    value={exercise.note ?? ''}
                    onChange={(e) =>
                      onUpdate(exerciseIndex, { note: e.target.value || undefined })
                    }
                    placeholder="Note specifiche per questo esercizio nel circuito"
                    className="w-full min-h-[80px] resize-y bg-background-secondary/50 border-surface-300/30 text-text-primary"
                    rows={3}
                  />
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
                    className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi serie
                  </Button>
                  {exercise.sets_detail && exercise.sets_detail.length > 0 && (
                    <span className="text-text-tertiary text-xs">
                      {exercise.sets_detail.length}{' '}
                      {exercise.sets_detail.length === 1 ? 'serie configurata' : 'serie configurate'}
                    </span>
                  )}
                </div>

                {exercise.sets_detail && exercise.sets_detail.length > 0 && (
                  <div className="space-y-3 mt-4 pt-5 border-t border-surface-300/30">
                    <h5 className="text-text-secondary text-sm font-semibold mb-4 flex items-center gap-2">
                      <span>Serie configurate</span>
                      <Badge
                        variant="outline"
                        size="sm"
                        className="bg-teal-500/10 text-teal-400 border-teal-500/30"
                      >
                        {exercise.sets_detail.length}
                      </Badge>
                    </h5>
                    <div className="space-y-2.5">
                      {exercise.sets_detail.map((set, setIndex) => (
                        <div
                          key={set.id}
                          className="flex items-start gap-3 p-4 rounded-lg border border-surface-300/30 bg-background-tertiary/30"
                        >
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border-2 border-teal-500/40">
                            {set.set_number}
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Input
                              label="Ripetizioni"
                              type="number"
                              value={set.reps ?? ''}
                              onChange={(e) => {
                                const updated = [...exercise.sets_detail!]
                                updated[setIndex] = { ...updated[setIndex], reps: Number(e.target.value) }
                                onUpdate(exerciseIndex, { sets_detail: updated })
                              }}
                              min="1"
                              max="100"
                            />
                            <Input
                              label="Peso (kg)"
                              type="number"
                              value={set.weight_kg ?? ''}
                              onChange={(e) => {
                                const updated = [...exercise.sets_detail!]
                                updated[setIndex] = {
                                  ...updated[setIndex],
                                  weight_kg: Number(e.target.value) || undefined,
                                }
                                onUpdate(exerciseIndex, { sets_detail: updated })
                              }}
                              min="0"
                              step="0.5"
                              placeholder="0"
                            />
                            <Input
                              label="Tempo esecuzione (sec)"
                              type="number"
                              value={set.execution_time_sec ?? ''}
                              onChange={(e) => {
                                const updated = [...exercise.sets_detail!]
                                updated[setIndex] = {
                                  ...updated[setIndex],
                                  execution_time_sec: Number(e.target.value) || undefined,
                                }
                                onUpdate(exerciseIndex, { sets_detail: updated })
                              }}
                              min="0"
                              max="3600"
                              placeholder="0"
                            />
                            <Input
                              label="Recupero (sec)"
                              type="number"
                              value={set.rest_timer_sec ?? ''}
                              onChange={(e) => {
                                const updated = [...exercise.sets_detail!]
                                updated[setIndex] = {
                                  ...updated[setIndex],
                                  rest_timer_sec: Number(e.target.value) || undefined,
                                }
                                onUpdate(exerciseIndex, { sets_detail: updated })
                              }}
                              min="0"
                              max="600"
                              placeholder="0"
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
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
