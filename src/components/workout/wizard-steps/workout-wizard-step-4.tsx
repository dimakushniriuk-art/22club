// ============================================================
// Componente Step 4 - Target (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Label } from '@/components/ui'
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react'
import type {
  WorkoutWizardData,
  Exercise,
  WorkoutDayExerciseData,
  WorkoutSetDetail,
} from '@/types/workout'
import { validateWorkoutTarget, type WorkoutTarget } from '@/lib/validations/workout-target'

interface WorkoutWizardStep4Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  onExerciseUpdate: (
    dayIndex: number,
    exerciseIndex: number,
    data: Partial<WorkoutDayExerciseData>,
  ) => void
  onExerciseRemove: (dayIndex: number, exerciseIndex: number) => void
}

export function WorkoutWizardStep4({
  wizardData,
  exercises,
  onExerciseUpdate,
  onExerciseRemove,
}: WorkoutWizardStep4Props) {
  const [validations, setValidations] = useState<
    Record<string, { errors: string[]; warnings: string[] }>
  >({})

  // Valida tutti gli esercizi quando cambiano i dati
  useEffect(() => {
    const newValidations: Record<string, { errors: string[]; warnings: string[] }> = {}

    wizardData.days.forEach((day, dayIndex) => {
      day.exercises.forEach((exercise, exerciseIndex) => {
        const key = `${dayIndex}-${exerciseIndex}`
        const target: WorkoutTarget = {
          target_sets: exercise.target_sets,
          target_reps: exercise.target_reps,
          target_weight: exercise.target_weight,
          rest_timer_sec: exercise.rest_timer_sec,
        }

        const validation = validateWorkoutTarget(target)
        newValidations[key] = {
          errors: validation.errors,
          warnings: validation.warnings,
        }
      })
    })

    setValidations(newValidations)
  }, [wizardData])

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-text-primary mb-2 text-xl font-bold">Target e parametri</h3>
        <p className="text-text-secondary text-sm">
          Imposta serie, ripetizioni, pesi e tempi di recupero per ogni esercizio
        </p>
      </div>

      <div className="space-y-6">
        {wizardData.days.map((day, dayIndex) => (
          <Card
            key={dayIndex}
            variant="trainer"
            className="relative overflow-hidden border-surface-300/30 bg-background-secondary/30 shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
            <CardHeader className="relative border-b border-surface-300/30">
              <CardTitle size="sm" className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  size="sm"
                  className="bg-teal-500/20 text-teal-400 border-teal-500/40 shadow-sm"
                >
                  Giorno {day.day_number}
                </Badge>
                <span>{day.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-5 pt-6">
              {day.exercises.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-text-tertiary text-sm">
                    Nessun esercizio aggiunto a questo giorno
                  </p>
                </div>
              ) : (
                day.exercises.map((exercise, exerciseIndex) => {
                  const exerciseData = exercises.find((e) => e.id === exercise.exercise_id)
                  return (
                    <div
                      key={exerciseIndex}
                      className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-background-tertiary/50 p-5 hover:border-teal-500/50 transition-all duration-200 shadow-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                      <div className="relative mb-5 flex items-center justify-start pt-2.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-text-primary font-semibold text-base">
                            {exerciseData?.name || 'Esercizio'}
                          </h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onExerciseRemove(dayIndex, exerciseIndex)}
                          className="relative text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Tabella target base */}
                      <div className="relative overflow-hidden rounded-xl border border-surface-300/30 bg-background-tertiary/30 mb-4 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
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
                                    onExerciseUpdate(dayIndex, exerciseIndex, {
                                      target_sets: Number(e.target.value),
                                    })
                                  }
                                  min="0"
                                  max="20"
                                  className="w-full"
                                />
                              </td>
                              <td className="px-4 py-4 border-l border-surface-300/30">
                                <Input
                                  type="number"
                                  value={exercise.target_reps || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, exerciseIndex, {
                                      target_reps: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                  max="100"
                                  className="w-full"
                                />
                              </td>
                              <td className="px-4 py-4 border-l border-surface-300/30">
                                <Input
                                  type="number"
                                  value={exercise.target_weight || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, exerciseIndex, {
                                      target_weight: Number(e.target.value) || 0,
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
                                  value={exercise.execution_time_sec || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, exerciseIndex, {
                                      execution_time_sec: Number(e.target.value) || 0,
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
                                  value={exercise.rest_timer_sec || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, exerciseIndex, {
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

                      {/* Campo Note Esercizio */}
                      <div className="relative mt-4 mb-4">
                        <Label
                          htmlFor={`exercise-note-${dayIndex}-${exerciseIndex}`}
                          className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 block"
                        >
                          Note Esercizio (opzionale)
                        </Label>
                        <Textarea
                          id={`exercise-note-${dayIndex}-${exerciseIndex}`}
                          value={exercise.note || ''}
                          onChange={(e) =>
                            onExerciseUpdate(dayIndex, exerciseIndex, {
                              note: e.target.value || undefined,
                            })
                          }
                          placeholder="Inserisci note specifiche per questo esercizio (es. tecnica, respirazione, posizione, ecc.)"
                          className="w-full min-h-[80px] resize-y bg-background-secondary/50 border-surface-300/30 text-text-primary placeholder:text-text-tertiary focus:border-teal-500/50 focus:ring-teal-500/20"
                          rows={3}
                        />
                        {exercise.note && (
                          <p className="text-text-tertiary text-xs mt-1">
                            {exercise.note.length} caratteri
                          </p>
                        )}
                      </div>

                      {/* Pulsante aggiungi serie */}
                      <div className="mb-4 flex items-center justify-between relative z-10">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentSets = exercise.sets_detail || []
                            // La serie 1 è sempre nella tabella (valori base), le serie aggiunte partono dalla 2
                            const newSet: WorkoutSetDetail = {
                              id: `set-${Date.now()}-${Math.random()}`,
                              set_number: currentSets.length + 2, // Serie 1 è nella tabella, quindi partiamo da 2
                              reps: exercise.target_reps || 10,
                              weight_kg: exercise.target_weight || undefined,
                              execution_time_sec: exercise.execution_time_sec || undefined,
                              rest_timer_sec: exercise.rest_timer_sec || undefined,
                            }
                            onExerciseUpdate(dayIndex, exerciseIndex, {
                              sets_detail: [...currentSets, newSet],
                              target_sets: currentSets.length + 2, // Totale serie: 1 (tabella) + serie aggiunte
                            })
                          }}
                          className="border-teal-500/40 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/60 transition-all duration-200 shadow-sm hover:shadow-md relative z-10"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Aggiungi serie
                        </Button>
                        {exercise.sets_detail && exercise.sets_detail.length > 0 && (
                          <span className="text-text-tertiary text-xs">
                            {exercise.sets_detail.length}{' '}
                            {exercise.sets_detail.length === 1
                              ? 'serie configurata'
                              : 'serie configurate'}
                          </span>
                        )}
                      </div>

                      {/* Lista serie aggiunte */}
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
                                className="relative overflow-hidden flex items-start gap-3 p-4 rounded-lg border border-surface-300/30 bg-background-tertiary/30 hover:border-surface-300/50 hover:bg-background-tertiary/40 transition-all duration-200"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-cyan-500/5" />
                                <div className="relative flex-shrink-0 w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border-2 border-teal-500/40 shadow-sm">
                                  {set.set_number}
                                </div>
                                <div className="relative flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <Input
                                    label="Ripetizioni"
                                    type="number"
                                    value={set.reps || ''}
                                    onChange={(e) => {
                                      const updatedSets = [...exercise.sets_detail!]
                                      updatedSets[setIndex] = {
                                        ...updatedSets[setIndex],
                                        reps: Number(e.target.value),
                                      }
                                      onExerciseUpdate(dayIndex, exerciseIndex, {
                                        sets_detail: updatedSets,
                                      })
                                    }}
                                    min="1"
                                    max="100"
                                  />
                                  <Input
                                    label="Peso (kg)"
                                    type="number"
                                    value={set.weight_kg || ''}
                                    onChange={(e) => {
                                      const updatedSets = [...exercise.sets_detail!]
                                      updatedSets[setIndex] = {
                                        ...updatedSets[setIndex],
                                        weight_kg: Number(e.target.value) || undefined,
                                      }
                                      onExerciseUpdate(dayIndex, exerciseIndex, {
                                        sets_detail: updatedSets,
                                      })
                                    }}
                                    min="0"
                                    step="0.5"
                                    placeholder="0"
                                  />
                                  <Input
                                    label="Tempo esecuzione (sec)"
                                    type="number"
                                    value={set.execution_time_sec || ''}
                                    onChange={(e) => {
                                      const updatedSets = [...exercise.sets_detail!]
                                      updatedSets[setIndex] = {
                                        ...updatedSets[setIndex],
                                        execution_time_sec: Number(e.target.value) || undefined,
                                      }
                                      onExerciseUpdate(dayIndex, exerciseIndex, {
                                        sets_detail: updatedSets,
                                      })
                                    }}
                                    min="0"
                                    max="3600"
                                    placeholder="0"
                                  />
                                  <Input
                                    label="Recupero (sec)"
                                    type="number"
                                    value={set.rest_timer_sec || ''}
                                    onChange={(e) => {
                                      const updatedSets = [...exercise.sets_detail!]
                                      updatedSets[setIndex] = {
                                        ...updatedSets[setIndex],
                                        rest_timer_sec: Number(e.target.value) || undefined,
                                      }
                                      onExerciseUpdate(dayIndex, exerciseIndex, {
                                        sets_detail: updatedSets,
                                      })
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
                                    const updatedSets = exercise.sets_detail!.filter(
                                      (_, idx) => idx !== setIndex,
                                    )
                                    // Rinumera le serie (serie 1 è nella tabella, quindi partiamo da 2)
                                    const renumberedSets = updatedSets.map((s, idx) => ({
                                      ...s,
                                      set_number: idx + 2, // Serie 1 è nella tabella, quindi partiamo da 2
                                    }))
                                    onExerciseUpdate(dayIndex, exerciseIndex, {
                                      sets_detail: renumberedSets,
                                      target_sets:
                                        renumberedSets.length + 1 || exercise.target_sets || 1, // +1 per la serie nella tabella
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
                      )}

                      {/* Validazione target workout (P4-009) */}
                      {(() => {
                        const key = `${dayIndex}-${exerciseIndex}`
                        const validation = validations[key]
                        if (
                          !validation ||
                          (validation.errors.length === 0 && validation.warnings.length === 0)
                        ) {
                          return null
                        }

                        return (
                          <div className="mt-3 space-y-1">
                            {validation.errors.length > 0 && (
                              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2">
                                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  {validation.errors.map((error, idx) => (
                                    <p key={idx} className="text-red-400 text-xs">
                                      {error}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                            {validation.warnings.length > 0 && (
                              <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-2">
                                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  {validation.warnings.map((warning, idx) => (
                                    <p key={idx} className="text-yellow-400 text-xs">
                                      {warning}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
