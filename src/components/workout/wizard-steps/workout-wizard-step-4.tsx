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
import { X, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react'
import type {
  WorkoutWizardData,
  Exercise,
  WorkoutDayExerciseData,
  WorkoutSetDetail,
  DayItem,
} from '@/types/workout'
import { validateWorkoutTarget, type WorkoutTarget } from '@/lib/validations/workout-target'
import { Zap } from 'lucide-react'

interface WorkoutWizardStep4Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>
  getDayItems?: (day: { items?: DayItem[]; exercises?: WorkoutDayExerciseData[]; name?: string }) => DayItem[]
  onExerciseUpdate: (
    dayIndex: number,
    itemIndex: number,
    data: Partial<WorkoutDayExerciseData>,
  ) => void
  onExerciseRemove: (dayIndex: number, itemIndex: number) => void
  onReorderItem?: (dayIndex: number, fromIndex: number, toIndex: number) => void
}

function getDayItemsFallback(
  day: { items?: DayItem[]; exercises?: WorkoutDayExerciseData[] },
): DayItem[] {
  if (day.items && day.items.length > 0) return day.items
  return (day.exercises || []).map((e) => ({ type: 'exercise' as const, exercise: e }))
}

export function WorkoutWizardStep4({
  wizardData,
  exercises,
  circuitList = [],
  getDayItems = getDayItemsFallback,
  onExerciseUpdate,
  onExerciseRemove,
  onReorderItem,
}: WorkoutWizardStep4Props) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const t = e.currentTarget
    if (t.getAttribute('data-drag-over') !== '1') {
      t.setAttribute('data-drag-over', '1')
      t.classList.add('ring-2', 'ring-teal-500/50', 'rounded-xl')
    }
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.removeAttribute('data-drag-over')
    e.currentTarget.classList.remove('ring-2', 'ring-teal-500/50', 'rounded-xl')
  }
  const handleDrop = (
    e: React.DragEvent,
    dayIndex: number,
    toIndex: number,
  ) => {
    e.preventDefault()
    e.currentTarget.removeAttribute('data-drag-over')
    e.currentTarget.classList.remove('ring-2', 'ring-teal-500/50', 'rounded-xl')
    const data = e.dataTransfer.getData('application/json')
    if (!data || !onReorderItem) return
    try {
      const { dayIndex: fromDay, fromIndex } = JSON.parse(data)
      if (fromDay === dayIndex && fromIndex !== toIndex) {
        onReorderItem(dayIndex, fromIndex, toIndex)
      }
    } catch {
      // ignore
    }
  }
  const [validations, setValidations] = useState<
    Record<string, { errors: string[]; warnings: string[] }>
  >({})

  // Valida solo gli esercizi (non i circuiti) quando cambiano i dati
  useEffect(() => {
    const newValidations: Record<string, { errors: string[]; warnings: string[] }> = {}

    wizardData.days.forEach((day, dayIndex) => {
      const items = getDayItems(day)
      items.forEach((item, itemIndex) => {
        if (item.type !== 'exercise') return
        const key = `${dayIndex}-${itemIndex}`
        const target: WorkoutTarget = {
          target_sets: item.exercise.target_sets,
          target_reps: item.exercise.target_reps,
          target_weight: item.exercise.target_weight,
          rest_timer_sec: item.exercise.rest_timer_sec,
        }
        const validation = validateWorkoutTarget(target)
        newValidations[key] = {
          errors: validation.errors,
          warnings: validation.warnings,
        }
      })
    })

    setValidations(newValidations)
  }, [wizardData, getDayItems])

  return (
    <Card
      variant="default"
      className="relative overflow-hidden transition-all duration-200"
    >
      <CardContent className="p-6 sm:p-8">
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
            variant="default"
            className="relative overflow-hidden transition-all duration-200 hover:border-white/20"
          >
            <CardHeader className="border-b border-white/10">
              <CardTitle size="sm" className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  size="sm"
                  className="border-0 bg-primary/10 text-primary"
                >
                  Giorno {day.day_number}
                </Badge>
                <span>{day.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {(() => {
                const items = getDayItems(day)
                if (items.length === 0) {
                  return (
                    <div className="py-8 text-center">
                      <p className="text-text-tertiary text-sm">
                        Nessun esercizio aggiunto a questo giorno
                      </p>
                    </div>
                  )
                }
                return items.map((item, itemIndex) => {
                  if (item.type === 'circuit') {
                    const circuit = circuitList.find((c) => c.id === item.circuitId)
                    if (!circuit) return null
                    const block = (
                      <div
                        key={`circuit-${item.circuitId}`}
                        className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />
                        <div className="relative z-10 flex items-center gap-2 mb-3">
                          <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                          <h4 className="text-text-primary font-semibold text-base">
                            Circuito
                          </h4>
                          <Badge
                            variant="outline"
                            size="sm"
                            className="bg-amber-500/15 text-amber-400 border-amber-500/25"
                          >
                            {circuit.params.length} esercizi
                          </Badge>
                          <span className="text-text-tertiary text-sm ml-auto">Solo lettura</span>
                        </div>
                        <ul className="space-y-1.5 text-sm">
                          {circuit.params.map((param, idx) => {
                            const ex = exercises.find((e) => e.id === param.exercise_id)
                            const details = [
                              param.target_sets != null && `${param.target_sets} serie`,
                              param.target_reps != null && `${param.target_reps} rip`,
                              param.target_weight != null &&
                                param.target_weight > 0 &&
                                `${param.target_weight} kg`,
                            ]
                              .filter(Boolean)
                              .join(' · ')
                            return (
                              <li
                                key={param.exercise_id}
                                className="flex items-center gap-2 text-text-secondary"
                              >
                                <span className="text-amber-400/80 font-medium w-6">{idx + 1}.</span>
                                <span className="text-text-primary">{ex?.name ?? 'Esercizio'}</span>
                                {details && (
                                  <span className="text-text-tertiary text-xs">({details})</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                    return onReorderItem ? (
                      <div
                        key={`${dayIndex}-${itemIndex}-circuit`}
                        className="flex gap-2 items-stretch transition-[box-shadow]"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, dayIndex, itemIndex)}
                      >
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation()
                            e.dataTransfer.setData(
                              'application/json',
                              JSON.stringify({ dayIndex, fromIndex: itemIndex }),
                            )
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-200/50 shrink-0 mt-1"
                          title="Trascina per riordinare"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">{block}</div>
                      </div>
                    ) : (
                      block
                    )
                  }
                  const exercise = item.exercise
                  const exerciseData = exercises.find((e) => e.id === exercise.exercise_id)
                  const hasVideoUrl =
                    exerciseData?.video_url &&
                    typeof exerciseData.video_url === 'string' &&
                    exerciseData.video_url.trim() !== '' &&
                    (exerciseData.video_url.startsWith('http://') ||
                      exerciseData.video_url.startsWith('https://'))
                  const posterUrl =
                    exerciseData?.thumb_url || exerciseData?.image_url || null

                  const exerciseBlock = (
                    <div
                      key={`${dayIndex}-${itemIndex}-ex`}
                      className="relative overflow-hidden rounded-lg border border-white/10 bg-[#141414] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200"
                    >
                      {/* Titolo a tutta larghezza sopra video e tabella */}
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-text-primary font-semibold text-base">
                          {exerciseData?.name || 'Esercizio'}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onExerciseRemove(dayIndex, itemIndex)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-4 items-start">
                        {/* Colonna sinistra: video (allineato alla tabella) */}
                        {hasVideoUrl && exerciseData?.video_url && (
                          <div className="shrink-0 w-64 sm:w-72 rounded-lg overflow-hidden border border-white/10 bg-white/[0.04] aspect-video">
                            <video
                              src={exerciseData.video_url}
                              poster={posterUrl || undefined}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              controls
                            />
                          </div>
                        )}
                        {/* Colonna destra: tabella, note, serie */}
                        <div className="flex-1 min-w-0">
                          {/* Tabella target base */}
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] mb-4 overflow-hidden">
                        <table className="w-full">
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
                              <td className="px-4 py-4">
                                <Input
                                  type="number"
                                  value={exercise.target_sets ?? 1}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, itemIndex, {
                                      target_sets: Number(e.target.value),
                                    })
                                  }
                                  min="0"
                                  max="20"
                                  className="w-full"
                                />
                              </td>
                              <td className="px-4 py-4 border-l border-white/10">
                                <Input
                                  type="number"
                                  value={exercise.target_reps || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, itemIndex, {
                                      target_reps: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                  max="100"
                                  className="w-full"
                                />
                              </td>
<td className="px-4 py-4 border-l border-white/10">
                                  <Input
                                    type="number"
                                    value={exercise.target_weight || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, itemIndex, {
                                      target_weight: Number(e.target.value) || 0,
                                    })
                                  }
                                  min="0"
                                  step="0.5"
                                  placeholder="0"
                                  className="w-full"
                                />
                              </td>
                              <td className="px-4 py-4 border-l border-white/10">
                                <Input
                                  type="number"
                                  value={exercise.execution_time_sec || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, itemIndex, {
                                      execution_time_sec: Number(e.target.value) || 0,
                                    })
                                  }
                                  min="0"
                                  max="3600"
                                  placeholder="0"
                                  className="w-full"
                                />
                              </td>
                              <td className="px-4 py-4 border-l border-white/10">
                                <Input
                                  type="number"
                                  value={exercise.rest_timer_sec || ''}
                                  onChange={(e) =>
                                    onExerciseUpdate(dayIndex, itemIndex, {
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
                          htmlFor={`exercise-note-${dayIndex}-${itemIndex}`}
                          className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 block"
                        >
                          Note Esercizio (opzionale)
                        </Label>
                        <Textarea
                          id={`exercise-note-${dayIndex}-${itemIndex}`}
                          value={exercise.note || ''}
                          onChange={(e) =>
                            onExerciseUpdate(dayIndex, itemIndex, {
                              note: e.target.value || undefined,
                            })
                          }
                          placeholder="Inserisci note specifiche per questo esercizio (es. tecnica, respirazione, posizione, ecc.)"
                          className="w-full min-h-[80px] resize-y bg-white/[0.04] border border-white/10 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:ring-primary/20"
                          rows={3}
                        />
                        {exercise.note && (
                          <p className="text-text-tertiary text-xs mt-1">
                            {exercise.note.length} caratteri
                          </p>
                        )}
                      </div>

                      {/* Pulsante aggiungi serie */}
                      <div className="mb-4 flex items-center justify-between">
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
                            onExerciseUpdate(dayIndex, itemIndex, {
                              sets_detail: [...currentSets, newSet],
                              target_sets: currentSets.length + 2, // Totale serie: 1 (tabella) + serie aggiunte
                            })
                          }}
                          className="border-primary/25 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md"
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
                                      onExerciseUpdate(dayIndex, itemIndex, {
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
                                      onExerciseUpdate(dayIndex, itemIndex, {
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
                                      onExerciseUpdate(dayIndex, itemIndex, {
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
                                      onExerciseUpdate(dayIndex, itemIndex, {
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
                                    onExerciseUpdate(dayIndex, itemIndex, {
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
                        const key = `${dayIndex}-${itemIndex}`
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
                      </div>
                    </div>
                  )
                  return onReorderItem ? (
                    <div
                      key={`${dayIndex}-${itemIndex}-ex`}
                      className="flex gap-2 items-stretch transition-[box-shadow]"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dayIndex, itemIndex)}
                    >
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation()
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({ dayIndex, fromIndex: itemIndex }),
                          )
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-200/50 shrink-0 mt-1"
                        title="Trascina per riordinare"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">{exerciseBlock}</div>
                    </div>
                  ) : (
                    exerciseBlock
                  )
                })
              })()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
      </CardContent>
    </Card>
  )
}
