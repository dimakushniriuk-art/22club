// ============================================================
// Componente Step 4 - Target (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Zap } from 'lucide-react'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import type { WorkoutWizardData, Exercise, WorkoutDayExerciseData, DayItem } from '@/types/workout'
import { validateWorkoutTarget, type WorkoutTarget } from '@/lib/validations/workout-target'
import { WorkoutExerciseTargetPanel } from '../workout-exercise-target-panel'

interface WorkoutWizardStep4Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  /** Allineato ai tab giorno (header wizard) */
  selectedDayIndex: number
  circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>
  getDayItems?: (day: {
    items?: DayItem[]
    exercises?: WorkoutDayExerciseData[]
    name?: string
  }) => DayItem[]
  onExerciseUpdate: (
    dayIndex: number,
    itemIndex: number,
    data: Partial<WorkoutDayExerciseData>,
  ) => void
  onExerciseRemove: (dayIndex: number, itemIndex: number) => void
}

function getDayItemsFallback(day: {
  items?: DayItem[]
  exercises?: WorkoutDayExerciseData[]
}): DayItem[] {
  if (day.items && day.items.length > 0) return day.items
  return (day.exercises || []).map((e) => ({ type: 'exercise' as const, exercise: e }))
}

export function WorkoutWizardStep4({
  wizardData,
  exercises,
  selectedDayIndex,
  circuitList = [],
  getDayItems = getDayItemsFallback,
  onExerciseUpdate,
  onExerciseRemove,
}: WorkoutWizardStep4Props) {
  const dayIndex = Math.min(selectedDayIndex, Math.max(0, wizardData.days.length - 1))

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
    <Card variant="default" className="relative overflow-hidden transition-all duration-200">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="text-text-primary mb-2 text-xl font-bold">Target e parametri</h3>
            <p className="text-text-secondary text-sm">
              Giorno selezionato sopra: esercizi modificabili; circuiti in sintesi (parametri e
              ordine nel passo Esercizi).
            </p>
          </div>

          <div className="space-y-6">
            {wizardData.days.length === 0
              ? null
              : (() => {
                  const day = wizardData.days[dayIndex]!
                  const items = getDayItems(day)

                  return (
                    <Card
                      id={`day-${dayIndex}`}
                      key={dayIndex}
                      variant="default"
                      className="relative overflow-hidden transition-all duration-200 hover:border-white/20 scroll-mt-4"
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
                        {items.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-text-tertiary text-sm">
                              Nessun esercizio aggiunto a questo giorno
                            </p>
                          </div>
                        ) : (
                          items.map((item, itemIndex) => {
                            if (item.type === 'circuit') {
                              const circuit = circuitList.find((c) => c.id === item.circuitId)
                              if (!circuit) return null
                              return (
                                <div
                                  key={`${dayIndex}-${itemIndex}-circuit-${item.circuitId}`}
                                  className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />
                                  <div className="relative z-10 flex items-center gap-2 mb-3 flex-wrap">
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
                                    <span className="text-text-tertiary text-sm ml-auto">
                                      Solo lettura — modifica nel passo Esercizi
                                    </span>
                                  </div>
                                  <ul className="relative z-10 space-y-1.5 text-sm">
                                    {circuit.params.map((param, idx) => {
                                      const ex = exercises.find((e) => e.id === param.exercise_id)
                                      const details = [
                                        param.target_sets != null && `${param.target_sets} serie`,
                                        param.target_reps != null &&
                                          `${param.target_reps === WORKOUT_REPS_MAX_SENTINEL ? 'MAX' : param.target_reps} rip`,
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
                                          <span className="text-amber-400/80 font-medium w-6">
                                            {idx + 1}.
                                          </span>
                                          <span className="text-text-primary">
                                            {ex?.name ?? 'Esercizio'}
                                          </span>
                                          {details && (
                                            <span className="text-text-tertiary text-xs">
                                              ({details})
                                            </span>
                                          )}
                                        </li>
                                      )
                                    })}
                                  </ul>
                                </div>
                              )
                            }

                            const exercise = item.exercise
                            const exerciseData = exercises.find(
                              (e) => e.id === exercise.exercise_id,
                            )
                            const vKey = `${dayIndex}-${itemIndex}`
                            return (
                              <WorkoutExerciseTargetPanel
                                key={`${dayIndex}-${itemIndex}-ex`}
                                exercise={exercise}
                                catalogExercise={exerciseData}
                                dayIndex={dayIndex}
                                itemIndex={itemIndex}
                                onUpdate={(patch) => onExerciseUpdate(dayIndex, itemIndex, patch)}
                                validation={validations[vKey]}
                                anchorId={`workout-target-${dayIndex}-${itemIndex}`}
                                onRemove={() => onExerciseRemove(dayIndex, itemIndex)}
                              />
                            )
                          })
                        )}
                      </CardContent>
                    </Card>
                  )
                })()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
