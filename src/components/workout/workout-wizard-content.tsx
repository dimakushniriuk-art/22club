'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { ExerciseCatalog } from './exercise-catalog'
import { ChevronLeft, ChevronRight, Check, Zap, Plus, Pencil, Trash2, Save } from 'lucide-react'
import type {
  Exercise,
  WorkoutWizardData,
  WorkoutDayExerciseData,
  WorkoutDayData,
  DayItem,
} from '@/types/workout'
import { useWorkoutWizard, type WorkoutWizardSaveOptions } from '@/hooks/workout/use-workout-wizard'
import {
  WorkoutWizardStep1,
  WorkoutWizardStep2,
  WorkoutWizardStep3,
  WorkoutWizardStep4,
  WorkoutWizardStep5,
} from './wizard-steps'
import { CircuitConfigStep } from './wizard-steps/circuit-config-step'
import { List, Calendar, Dumbbell, Target } from 'lucide-react'
import { Badge } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import Image from 'next/image'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import { isWorkoutPlanRealAthleteId } from '@/lib/constants/workout-plan-wizard'
import { validateWorkoutTarget, type WorkoutTarget } from '@/lib/validations/workout-target'
import { WorkoutExerciseTargetPanel } from './workout-exercise-target-panel'

/** Indici in `items` che compaiono nella strip verticale (circuiti + esercizi non nel circuito). */
function buildStripToItemIndices(
  items: DayItem[],
  circuitList: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
): number[] {
  const circuitExerciseIdsInDay = new Set<string>()
  for (const item of items) {
    if (item.type === 'circuit') {
      const c = circuitList.find((x) => x.id === item.circuitId)
      c?.params.forEach((p) => circuitExerciseIdsInDay.add(p.exercise_id))
    }
  }
  const out: number[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type === 'circuit') {
      out.push(i)
      continue
    }
    if (circuitExerciseIdsInDay.has(item.exercise.exercise_id)) continue
    out.push(i)
  }
  return out
}

function itemIndexForStripSlot(
  stripIndex: number,
  items: DayItem[],
  circuitList: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
): number | null {
  const map = buildStripToItemIndices(items, circuitList)
  const idx = map[stripIndex]
  return idx === undefined ? null : idx
}

interface WorkoutWizardContentProps {
  /** (workoutData, circuitList, options) – circuitList opzionale per persistenza circuiti in Supabase */
  onSave: (
    workoutData: WorkoutWizardData,
    circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
    options?: WorkoutWizardSaveOptions,
  ) => Promise<void>
  athletes: Array<{ id: string; name: string; email: string }>
  exercises: Exercise[]
  initialAthleteId?: string
  initialData?: WorkoutWizardData
  /** Circuiti caricati da DB (modifica scheda) */
  initialCircuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>
  onCancel?: () => void
}

const STEPS = [
  { id: 1, title: 'Info generali', description: 'Nome, atleta e note della scheda', icon: List },
  { id: 2, title: 'Giorni', description: 'Organizza i giorni di allenamento', icon: Calendar },
  {
    id: 3,
    title: 'Esercizi',
    description: 'Scegli gli esercizi per ogni giorno',
    icon: Dumbbell,
  },
  { id: 4, title: 'Target', description: 'Imposta serie, ripetizioni e pesi', icon: Target },
  {
    id: 5,
    title: 'Riepilogo',
    description: 'Verifica e conferma la scheda',
    icon: Check,
  },
]

export function WorkoutWizardContent({
  onSave,
  athletes,
  exercises,
  initialAthleteId,
  initialData,
  initialCircuitList,
  onCancel,
}: WorkoutWizardContentProps) {
  const [circuitList, setCircuitList] = useState<
    Array<{ id: string; params: WorkoutDayExerciseData[] }>
  >(initialCircuitList ?? [])

  const {
    currentStep,
    progress: _progress,
    wizardData,
    setWizardData,
    isLoading,
    handleNext,
    handlePrevious,
    handleSave,
    handleSaveDraft,
    addDay,
    updateDay,
    addExerciseToDay,
    addCircuitToDay,
    removeCircuitFromDay,
    updateExercise,
    removeExercise,
    reorderDayItems,
    canProceed,
    getDayItems,
  } = useWorkoutWizard({
    isOpen: true,
    initialAthleteId,
    initialData,
    onSave: async (data, options) => {
      await onSave(data, circuitList, options)
    },
  })

  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [stripTargetItemModalIndex, setStripTargetItemModalIndex] = useState<number | null>(null)
  const [exerciseTargetModalDraft, setExerciseTargetModalDraft] =
    useState<WorkoutDayExerciseData | null>(null)

  useEffect(() => {
    if (wizardData.days.length > 0 && selectedDayIndex >= wizardData.days.length) {
      setSelectedDayIndex(Math.max(0, wizardData.days.length - 1))
    }
  }, [wizardData.days.length, selectedDayIndex])

  const [circuitPickerOpen, setCircuitPickerOpen] = useState(false)
  const [circuitPickerStep, setCircuitPickerStep] = useState<'select' | 'configure'>('select')
  const [circuitExerciseIds, setCircuitExerciseIds] = useState<string[]>([])
  const [circuitExerciseParams, setCircuitExerciseParams] = useState<WorkoutDayExerciseData[]>([])
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null)

  const toggleCircuitExercise = useCallback((exercise: Exercise) => {
    setCircuitExerciseIds((prev) => {
      const id = exercise.id
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return [...prev, id]
    })
  }, [])

  const openNewCircuit = useCallback(() => {
    setEditingCircuitId(null)
    setCircuitExerciseIds([])
    setCircuitExerciseParams([])
    setCircuitPickerStep('select')
    setCircuitPickerOpen(true)
  }, [])

  const openCircuitConfig = useCallback(() => {
    if (circuitExerciseIds.length === 0) return
    setCircuitExerciseParams(
      circuitExerciseIds.map((exercise_id) => ({
        exercise_id,
        sets: 1,
        target_sets: 1,
        target_reps: 10,
        rest_timer_sec: 60,
      })),
    )
    setCircuitPickerStep('configure')
  }, [circuitExerciseIds])

  const closeCircuitModal = useCallback(() => {
    setCircuitPickerOpen(false)
    setCircuitPickerStep('select')
    setEditingCircuitId(null)
  }, [])

  const confirmCircuitAndClose = useCallback(() => {
    if (circuitExerciseParams.length === 0) return
    if (editingCircuitId) {
      setCircuitList((prev) =>
        prev.map((c) =>
          c.id === editingCircuitId ? { ...c, params: [...circuitExerciseParams] } : c,
        ),
      )
    } else {
      const newId = `circuit-${Date.now()}`
      setCircuitList((prev) => [...prev, { id: newId, params: [...circuitExerciseParams] }])
      addCircuitToDay(selectedDayIndex, newId)
    }
    setCircuitExerciseIds([])
    setCircuitExerciseParams([])
    closeCircuitModal()
  }, [
    editingCircuitId,
    circuitExerciseParams,
    closeCircuitModal,
    addCircuitToDay,
    selectedDayIndex,
  ])

  const _toggleCircuitInDay = useCallback(
    (circuitId: string) => {
      const day = wizardData.days[selectedDayIndex]
      const inDay =
        day && getDayItems(day).some((i) => i.type === 'circuit' && i.circuitId === circuitId)
      if (inDay) removeCircuitFromDay(selectedDayIndex, circuitId)
      else addCircuitToDay(selectedDayIndex, circuitId)
    },
    [wizardData.days, selectedDayIndex, getDayItems, addCircuitToDay, removeCircuitFromDay],
  )

  const _removeCircuit = useCallback(
    (id: string) => {
      setCircuitList((prev) => prev.filter((c) => c.id !== id))
      wizardData.days.forEach((_, dayIndex) => removeCircuitFromDay(dayIndex, id))
    },
    // wizardData.days identity non necessario, length evita loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wizardData.days.length, removeCircuitFromDay],
  )

  const editCircuit = useCallback((circuit: { id: string; params: WorkoutDayExerciseData[] }) => {
    setEditingCircuitId(circuit.id)
    setCircuitExerciseIds(circuit.params.map((p) => p.exercise_id))
    setCircuitExerciseParams(circuit.params.map((p) => ({ ...p })))
    setCircuitPickerStep('configure')
    setCircuitPickerOpen(true)
  }, [])

  const updateCircuitParam = useCallback((index: number, data: Partial<WorkoutDayExerciseData>) => {
    setCircuitExerciseParams((prev) => prev.map((p, i) => (i === index ? { ...p, ...data } : p)))
  }, [])

  /** Wrapper per gli step che accettano day con name opzionale */
  const getDayItemsForStep = useCallback(
    (day: { items?: DayItem[]; exercises?: WorkoutDayExerciseData[]; name?: string }): DayItem[] =>
      getDayItems(day as WorkoutDayData),
    [getDayItems],
  )

  const closeStripExerciseTargetModal = useCallback(() => {
    setStripTargetItemModalIndex(null)
    setExerciseTargetModalDraft(null)
  }, [])

  const handleStripItemClick = useCallback(
    (stripIndex: number) => {
      const day = wizardData.days[selectedDayIndex]
      if (!day) return
      const items = getDayItems(day)
      const itemIndex = itemIndexForStripSlot(stripIndex, items, circuitList)
      if (itemIndex == null) return
      const item = items[itemIndex]
      if (item.type === 'circuit') {
        const c = circuitList.find((x) => x.id === item.circuitId)
        if (c) editCircuit(c)
        return
      }
      setExerciseTargetModalDraft(structuredClone(item.exercise))
      setStripTargetItemModalIndex(itemIndex)
    },
    [wizardData.days, selectedDayIndex, circuitList, getDayItems, editCircuit],
  )

  const handleReorderStripItems = useCallback(
    (fromStrip: number, toStrip: number) => {
      if (fromStrip === toStrip) return
      const day = wizardData.days[selectedDayIndex]
      if (!day) return
      const items = getDayItems(day)
      const map = buildStripToItemIndices(items, circuitList)
      const fromItem = map[fromStrip]
      const toItem = map[toStrip]
      if (fromItem === undefined || toItem === undefined) return
      reorderDayItems(selectedDayIndex, fromItem, toItem)
    },
    [wizardData.days, selectedDayIndex, circuitList, getDayItems, reorderDayItems],
  )

  const saveStripExerciseTargetModal = useCallback(() => {
    if (stripTargetItemModalIndex == null || exerciseTargetModalDraft == null) return
    updateExercise(selectedDayIndex, stripTargetItemModalIndex, exerciseTargetModalDraft)
    closeStripExerciseTargetModal()
  }, [
    stripTargetItemModalIndex,
    exerciseTargetModalDraft,
    selectedDayIndex,
    updateExercise,
    closeStripExerciseTargetModal,
  ])

  const stripExerciseTargetModalMeta = useMemo(() => {
    if (stripTargetItemModalIndex == null || exerciseTargetModalDraft == null) return null
    const catalogEx = exercises.find((e) => e.id === exerciseTargetModalDraft.exercise_id)
    const target: WorkoutTarget = {
      target_sets: exerciseTargetModalDraft.target_sets,
      target_reps: exerciseTargetModalDraft.target_reps,
      target_weight: exerciseTargetModalDraft.target_weight,
      rest_timer_sec: exerciseTargetModalDraft.rest_timer_sec,
    }
    const v = validateWorkoutTarget(target)
    return {
      catalogExercise: catalogEx,
      itemIndex: stripTargetItemModalIndex,
      validation: { errors: v.errors, warnings: v.warnings },
    }
  }, [stripTargetItemModalIndex, exerciseTargetModalDraft, exercises])

  useEffect(() => {
    if (stripTargetItemModalIndex == null) return
    const day = wizardData.days[selectedDayIndex]
    if (!day) {
      closeStripExerciseTargetModal()
      return
    }
    const items = getDayItems(day)
    const item = items[stripTargetItemModalIndex]
    if (!item || item.type !== 'exercise') {
      closeStripExerciseTargetModal()
    }
  }, [
    wizardData,
    selectedDayIndex,
    stripTargetItemModalIndex,
    getDayItems,
    closeStripExerciseTargetModal,
  ])

  useEffect(() => {
    closeStripExerciseTargetModal()
  }, [selectedDayIndex, closeStripExerciseTargetModal])

  const removeDay = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index),
    }))
  }

  /** Rimuove il circuito solo dal giorno corrente (non elimina la definizione) */
  const removeCircuitFromCurrentDay = useCallback(
    (circuitId: string) => {
      removeCircuitFromDay(selectedDayIndex, circuitId)
    },
    [selectedDayIndex, removeCircuitFromDay],
  )

  const renderCircuitSection = () => {
    const currentDay = wizardData.days[selectedDayIndex]
    const dayLabel =
      currentDay?.title?.trim() || (currentDay ? `Giorno ${currentDay.day_number}` : '')
    const dayItems = currentDay ? getDayItems(currentDay) : []
    const circuitIdsInDay = dayItems
      .filter((i): i is { type: 'circuit'; circuitId: string } => i.type === 'circuit')
      .map((i) => i.circuitId)
    const circuitsInThisDay = circuitIdsInDay
      .map((id) => circuitList.find((c) => c.id === id))
      .filter((c): c is { id: string; params: WorkoutDayExerciseData[] } => Boolean(c))
    const circuitsNotInThisDay = circuitList.filter((c) => !circuitIdsInDay.includes(c.id))

    const renderCircuitCard = (
      circuit: { id: string; params: WorkoutDayExerciseData[] },
      options: { inThisDay: boolean; onRemove?: () => void },
    ) => (
      <Card
        key={circuit.id}
        variant="default"
        role={options.inThisDay ? undefined : 'button'}
        tabIndex={options.inThisDay ? undefined : 0}
        onClick={
          options.inThisDay ? undefined : () => addCircuitToDay(selectedDayIndex, circuit.id)
        }
        onKeyDown={
          options.inThisDay
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  addCircuitToDay(selectedDayIndex, circuit.id)
                }
              }
        }
        className={`relative w-full transition-all duration-200 border-teal-500/20 shadow-md hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-400/40 ${
          options.inThisDay
            ? 'ring-2 ring-teal-500/60 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-cyan-500/10 border-teal-500/40 shadow-teal-500/20'
            : 'cursor-pointer hover:scale-[1.01] bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-amber-500/20 bg-amber-500/5'
        }`}
      >
        {options.inThisDay && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="inline-flex items-center bg-green-500 text-white border border-green-500 px-2 py-1 text-xs font-medium rounded-lg shadow-sm">
              ✓ In questo giorno
            </span>
          </div>
        )}
        <CardContent className="relative p-4">
          <div className="flex gap-4">
            <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-[132px] h-[132px] shrink-0">
              {Array.from({ length: 9 }).map((_, cellIndex) => {
                const param = circuit.params[cellIndex]
                if (!param) {
                  return (
                    <div
                      key={`empty-${circuit.id}-${cellIndex}`}
                      className="rounded-lg bg-surface-300/20 border border-surface-300/30"
                    />
                  )
                }
                const ex = exercises.find((e) => e.id === param.exercise_id)
                const posterUrl = ex?.thumb_url || ex?.image_url || null
                const videoUrl =
                  ex?.video_url &&
                  typeof ex.video_url === 'string' &&
                  ex.video_url.startsWith('http')
                    ? ex.video_url
                    : null
                return (
                  <div
                    key={`${circuit.id}-${param.exercise_id}`}
                    className="relative rounded-lg overflow-hidden border border-amber-500/30 bg-background-tertiary/50 aspect-square"
                  >
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        poster={posterUrl || undefined}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt="Anteprima esercizio"
                        className="w-full h-full object-cover"
                        fill
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-400/60 text-xs">
                        {cellIndex + 1}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                  <span className="text-text-primary font-semibold">Circuito configurato</span>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="bg-amber-500/20 text-amber-400 border-amber-500/40 shrink-0"
                  >
                    {circuit.params.length} esercizi
                  </Badge>
                </div>
                {options.inThisDay && options.onRemove ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        editCircuit(circuit)
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1.5" />
                      Modifica
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        options.onRemove?.()
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Rimuovi da questo giorno
                    </Button>
                  </div>
                ) : (
                  !options.inThisDay && (
                    <span className="text-text-tertiary text-sm shrink-0">
                      Clicca per aggiungere a questo giorno
                    </span>
                  )
                )}
              </div>
              <ul className="mt-3 space-y-1 text-text-secondary text-sm">
                {circuit.params.map((param, idx) => {
                  const ex = exercises.find((e) => e.id === param.exercise_id)
                  const label = ex?.name ?? 'Esercizio'
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
                    <li key={param.exercise_id} className="flex items-center gap-2">
                      <span className="text-amber-400/80 font-medium w-6">{idx + 1}.</span>
                      <span className="text-text-primary">{label}</span>
                      {details && <span className="text-text-tertiary text-xs">({details})</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-text-primary text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Circuito
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              Solo per questo giorno ({dayLabel}). Crea un nuovo circuito o riusa uno esistente da
              un altro giorno.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60 shrink-0"
            onClick={openNewCircuit}
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi esercizi per il circuito
          </Button>
        </div>

        {/* Circuiti presenti in questo giorno */}
        {circuitsInThisDay.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-text-primary text-sm font-semibold">Circuiti in questo giorno</h4>
            {circuitsInThisDay.map((circuit) =>
              renderCircuitCard(circuit, {
                inThisDay: true,
                onRemove: () => removeCircuitFromCurrentDay(circuit.id),
              }),
            )}
          </div>
        )}

        {/* Circuiti esistenti (altri giorni) che si possono aggiungere a questo giorno */}
        {circuitsNotInThisDay.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-text-primary text-sm font-semibold">
              Riusa circuito da un altro giorno
            </h4>
            <div className="space-y-3">
              {circuitsNotInThisDay.map((circuit) =>
                renderCircuitCard(circuit, { inThisDay: false }),
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WorkoutWizardStep1
            wizardData={wizardData}
            athletes={athletes}
            onWizardDataChange={(data) => setWizardData({ ...wizardData, ...data })}
          />
        )
      case 2:
        return (
          <WorkoutWizardStep2
            wizardData={wizardData}
            onAddDay={addDay}
            onUpdateDay={updateDay}
            onRemoveDay={removeDay}
          />
        )
      case 3:
        return (
          <WorkoutWizardStep3
            wizardData={wizardData}
            exercises={exercises}
            onExerciseSelect={addExerciseToDay}
            circuitList={circuitList}
            getDayItems={getDayItemsForStep}
            selectedDayIndex={selectedDayIndex}
            circuitSection={renderCircuitSection()}
            onReorderStripItems={handleReorderStripItems}
            onStripItemClick={handleStripItemClick}
          />
        )
      case 4:
        return (
          <WorkoutWizardStep4
            wizardData={wizardData}
            exercises={exercises}
            selectedDayIndex={selectedDayIndex}
            circuitList={circuitList}
            getDayItems={getDayItemsForStep}
            onExerciseUpdate={updateExercise}
            onExerciseRemove={removeExercise}
          />
        )
      case 5:
        return (
          <WorkoutWizardStep5
            wizardData={wizardData}
            athletes={athletes}
            getDayItems={getDayItemsForStep}
            circuitList={circuitList}
          />
        )
      default:
        return null
    }
  }

  const currentStepData = STEPS[currentStep - 1]
  // Nota: StepIcon potrebbe essere usato in futuro per display icona step corrente
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const StepIcon = currentStepData.icon

  const headerAthleteSuffix = (() => {
    const id = wizardData.athlete_id
    if (!isWorkoutPlanRealAthleteId(id)) return ''
    const name = athletes.find((a) => a.id === id)?.name?.trim()
    return name ? `: ${name}` : ''
  })()

  return (
    <div className="relative flex flex-1 flex-col bg-background min-h-0">
      {/* Header unico: titolo + riga con Indietro, stepper al centro, Annulla/Avanti */}
      <div className="relative flex-shrink-0 border-b border-white/10 bg-background px-4 sm:px-6 py-4">
        <div className="relative z-10 max-w-5xl mx-auto w-full space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-text-primary break-words px-1">
            Nuova Scheda Allenamento{headerAthleteSuffix}
          </h1>

          <div className="flex items-center justify-between gap-4 min-w-0 pt-[10px]">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-shrink-0 border-white/10 text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary hover:border-primary/20 whitespace-nowrap"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>

            {/* Stepper centrato tra i pulsanti */}
            <div className="flex flex-1 items-center justify-center gap-2 overflow-x-auto pb-1 min-w-0 px-2">
              {STEPS.map((step, index) => {
                const StepIconComponent = step.icon
                const isActive = index + 1 === currentStep
                const isCompleted = index + 1 < currentStep

                return (
                  <div
                    key={step.id}
                    className="flex flex-1 items-center min-w-0 max-w-[72px] sm:max-w-none pt-[10px]"
                  >
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className={`flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border-2 transition-all duration-300 flex-shrink-0 ${
                          isActive
                            ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-md shadow-teal-500/20 scale-110'
                            : isCompleted
                              ? 'border-green-500/60 bg-green-500/10 text-green-400'
                              : 'border-white/10 bg-background-secondary/40 text-text-tertiary'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <StepIconComponent className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-[10px] md:text-xs font-medium transition-colors text-center truncate w-full ${
                          isActive
                            ? 'text-teal-400 font-semibold'
                            : isCompleted
                              ? 'text-green-400/80'
                              : 'text-text-tertiary'
                        }`}
                        title={step.title}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`mx-1 md:mx-3 h-px flex-1 min-w-[8px] transition-colors flex-shrink-0 ${
                          isCompleted ? 'bg-green-500/40' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="text-text-secondary hover:text-text-primary hover:bg-background-secondary/50 border border-transparent hover:border-white/10 whitespace-nowrap"
                >
                  Annulla
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="border-amber-500/45 text-amber-300 hover:bg-amber-500/15 hover:border-amber-400/55 hover:text-amber-200 disabled:border-white/10 disabled:text-text-tertiary whitespace-nowrap"
              >
                <Save className="mr-2 h-4 w-4" />
                Salva bozza
              </Button>

              {currentStep === STEPS.length ? (
                <Button
                  onClick={handleSave}
                  disabled={!canProceed() || isLoading}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salva scheda
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all"
                >
                  Avanti
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab giorni (step 3, 4, 5: quantità da wizardData.days aggiunti in step 2) */}
      {currentStep >= 3 && wizardData.days.length > 0 && (
        <div className="relative flex-shrink-0 border-b border-white/10 bg-background px-4 sm:px-6 py-3 w-full min-w-0">
          <div className="w-full min-w-0">
            <div className="flex flex-wrap items-stretch gap-2 gap-y-2 justify-center pb-1 w-full min-w-0">
              {wizardData.days.map((day, index) => {
                const isActive = selectedDayIndex === index
                const label = day.title?.trim() || `Giorno ${day.day_number}`
                const exCount = day.exercises.length
                const exWord = exCount === 1 ? 'esercizio' : 'esercizi'
                const tabLayout =
                  'flex-shrink-0 h-11 min-h-11 justify-start gap-2 pl-4 pr-3 sm:pl-5 sm:pr-4 whitespace-nowrap transition-all'
                return (
                  <Button
                    key={index}
                    type="button"
                    variant={isActive ? undefined : 'outline'}
                    onClick={() => setSelectedDayIndex(index)}
                    className={
                      isActive
                        ? `${tabLayout} bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 border-0`
                        : `${tabLayout} border-white/10 text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary hover:border-primary/20`
                    }
                  >
                    <span className="min-w-0 flex-1 text-center font-semibold truncate">
                      {label}
                    </span>
                    <Badge
                      variant="neutral"
                      size="sm"
                      className="shrink-0 pointer-events-none bg-black text-white border border-white/20 shadow-sm hover:bg-zinc-950 hover:border-white/30"
                    >
                      {exCount} {exWord}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal circuito: step 1 selezione esercizi, step 2 configurazione parametri */}
      <Dialog
        open={circuitPickerOpen}
        onOpenChange={(open) => {
          if (open) setCircuitPickerOpen(true)
          else closeCircuitModal()
        }}
      >
        <DialogContent className="max-w-[1800px] w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              {circuitPickerStep === 'select' ? 'Esercizi per il circuito' : 'Configura circuito'}
            </DialogTitle>
            <DialogDescription>
              {circuitPickerStep === 'select' ? (
                <>
                  Seleziona gli esercizi che compongono il circuito. Verranno eseguiti in sequenza e
                  ripetuti per il numero di giri impostato (un esercizio unico a circuito con più
                  esercizi a ripetizione).
                </>
              ) : (
                <>Imposta serie, ripetizioni, pesi e tempi per ogni esercizio del circuito.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            {circuitPickerStep === 'select' ? (
              <ExerciseCatalog
                exercises={exercises}
                onExerciseSelect={toggleCircuitExercise}
                selectedExercises={circuitExerciseIds}
                showSelectionOrder
              />
            ) : (
              <CircuitConfigStep
                exercises={exercises}
                params={circuitExerciseParams}
                onUpdate={updateCircuitParam}
              />
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-white/10 shrink-0">
            {circuitPickerStep === 'select' ? (
              <>
                <Button type="button" variant="outline" onClick={closeCircuitModal}>
                  Annulla
                </Button>
                <Button
                  type="button"
                  onClick={openCircuitConfig}
                  disabled={circuitExerciseIds.length === 0}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white disabled:opacity-50"
                >
                  Conferma ({circuitExerciseIds.length} esercizi selezionati)
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCircuitPickerStep('select')}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Indietro
                </Button>
                <Button
                  type="button"
                  onClick={confirmCircuitAndClose}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Conferma e chiudi
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={stripTargetItemModalIndex !== null}
        onOpenChange={(open) => {
          if (!open) closeStripExerciseTargetModal()
        }}
      >
        <DialogContent className="max-w-[min(1800px,calc(100vw-2rem))] w-[95vw] max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Target esercizio</DialogTitle>
            <DialogDescription>
              Modifica i campi e premi Salva per applicare; Chiudi annulla le modifiche senza
              salvare.
            </DialogDescription>
          </DialogHeader>
          {exerciseTargetModalDraft && stripExerciseTargetModalMeta ? (
            <WorkoutExerciseTargetPanel
              exercise={exerciseTargetModalDraft}
              catalogExercise={stripExerciseTargetModalMeta.catalogExercise}
              dayIndex={selectedDayIndex}
              itemIndex={stripExerciseTargetModalMeta.itemIndex}
              onUpdate={(patch) =>
                setExerciseTargetModalDraft((d) => (d ? { ...d, ...patch } : null))
              }
              validation={stripExerciseTargetModalMeta.validation}
              showRemoveButton={false}
              rootClassName="shadow-none"
              stackedMediaLayout
            />
          ) : (
            <p className="text-text-tertiary text-sm py-4">Esercizio non disponibile.</p>
          )}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              onClick={saveStripExerciseTargetModal}
              disabled={!exerciseTargetModalDraft}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white disabled:opacity-50"
            >
              Salva
            </Button>
            <Button type="button" variant="outline" onClick={closeStripExerciseTargetModal}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contenuto scrollabile */}
      <div className="relative flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0">
        <div
          className={`relative z-10 mx-auto w-full flex flex-col gap-6 ${
            currentStep === 3 || currentStep === 4
              ? 'max-w-[1800px]'
              : currentStep === 1
                ? 'max-w-7xl'
                : 'max-w-3xl'
          }`}
        >
          <div key={currentStep} className="animate-fade-in">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  )
}
