'use client'

import { useState, useCallback } from 'react'
import { Progress } from '@/components/ui'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui'
import { ExerciseCatalog } from './exercise-catalog'
import { ChevronLeft, ChevronRight, Check, ArrowLeft, Zap, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Exercise, WorkoutWizardData, WorkoutDayExerciseData, WorkoutDayData, DayItem } from '@/types/workout'
import { useWorkoutWizard } from '@/hooks/workout/use-workout-wizard'
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
import Link from 'next/link'

interface WorkoutWizardContentProps {
  /** (workoutData, circuitList) – circuitList opzionale per persistenza circuiti in Supabase */
  onSave: (
    workoutData: WorkoutWizardData,
    circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
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
    progress,
    wizardData,
    setWizardData,
    isLoading,
    handleNext,
    handlePrevious,
    handleSave,
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
    onSave: async (data) => {
      await onSave(data, circuitList)
    },
  })

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
      addCircuitToDay(0, newId)
    }
    setCircuitExerciseIds([])
    setCircuitExerciseParams([])
    closeCircuitModal()
  }, [editingCircuitId, circuitExerciseParams, closeCircuitModal, addCircuitToDay])

  const toggleCircuitInDay = useCallback(
    (circuitId: string) => {
      const day0 = wizardData.days[0]
      const inDay1 =
        day0 &&
        getDayItems(day0).some((i) => i.type === 'circuit' && i.circuitId === circuitId)
      if (inDay1) removeCircuitFromDay(0, circuitId)
      else addCircuitToDay(0, circuitId)
    },
    [wizardData.days, getDayItems, addCircuitToDay, removeCircuitFromDay],
  )

  const removeCircuit = useCallback(
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
    setCircuitExerciseParams((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...data } : p)),
    )
  }, [])

  /** Wrapper per gli step che accettano day con name opzionale */
  const getDayItemsForStep = useCallback(
    (day: { items?: DayItem[]; exercises?: WorkoutDayExerciseData[]; name?: string }): DayItem[] =>
      getDayItems(day as WorkoutDayData),
    [getDayItems],
  )

  const removeDay = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index),
    }))
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
          />
        )
      case 4:
        return (
          <WorkoutWizardStep4
            wizardData={wizardData}
            exercises={exercises}
            circuitList={circuitList}
            getDayItems={getDayItemsForStep}
            onExerciseUpdate={updateExercise}
            onExerciseRemove={removeExercise}
            onReorderItem={reorderDayItems}
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

  return (
    <div className="relative flex flex-1 flex-col bg-background min-h-0">
      {/* Header fisso */}
      <div className="relative flex-shrink-0 border-b border-white/10 bg-background px-4 sm:px-6 py-4">
        <div className="pb-0 relative z-10 max-w-3xl mx-auto w-full">
          {/* Breadcrumb */}
          <div className="mb-3 hidden">
            <Link
              href="/dashboard/schede"
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-teal-400 transition-colors group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Torna alle schede</span>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate text-text-primary">
                Nuova Scheda Allenamento
              </h1>
            </div>
          </div>

          {/* Progress bar con step indicator */}
          <div>
            <div className="hidden">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-text-primary text-xs font-medium truncate">
                  {currentStepData.title}
                </span>
                <span className="text-text-tertiary text-[10px] whitespace-nowrap">
                  · Passo {currentStep} di {STEPS.length}
                </span>
              </div>
              <span className="text-text-secondary text-xs font-medium whitespace-nowrap ml-2">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5 hidden" />

            {/* Step indicators - compatti per mobile */}
            <div className="flex items-center justify-start gap-2 overflow-x-auto pb-1 pt-2.5">
              {STEPS.map((step, index) => {
                const StepIconComponent = step.icon
                const isActive = index + 1 === currentStep
                const isCompleted = index + 1 < currentStep

                return (
                  <div key={step.id} className="flex flex-1 items-center min-w-0">
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
                        className={`mx-2 md:mx-3 h-px flex-1 min-w-[12px] transition-colors ${
                          isCompleted ? 'bg-green-500/40' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Barra navigazione (sopra il contenuto / prima degli esercizi) */}
      <div className="relative flex-shrink-0 border-b border-white/10 bg-background px-4 sm:px-6 py-4">
        <div className="relative z-10 flex items-center justify-between gap-4 max-w-3xl mx-auto w-full">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-white/10 text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary hover:border-primary/20 whitespace-nowrap"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>

          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-text-secondary hover:text-text-primary hover:bg-background-secondary/50 border border-transparent hover:border-white/10 whitespace-nowrap"
              >
                Annulla
              </Button>
            )}

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

      {/* Sezione Circuito (solo step 3, sotto la barra navigazione) */}
      {currentStep === 3 && (
        <div className="relative shrink-0 border-b border-white/10 bg-background px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto w-full flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-text-primary text-lg font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Circuito
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                Aggiungi esercizi da eseguire a circuito (in sequenza, con eventuali giri)
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
        </div>
      )}

      {/* Lista circuiti configurati: uno sotto l'altro */}
      {currentStep === 3 && circuitList.length > 0 && (
        <div className="shrink-0 border-b border-white/10 bg-background px-4 sm:px-6 py-4 space-y-4">
          {circuitList.map((circuit) => {
            const day0 = wizardData.days[0]
            const isCircuitInDay1 =
              day0 &&
              getDayItems(day0).some((i) => i.type === 'circuit' && i.circuitId === circuit.id)
            return (
              <Card
                key={circuit.id}
                variant="default"
                role="button"
                tabIndex={0}
                onClick={() => toggleCircuitInDay(circuit.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCircuitInDay(circuit.id)
                  }
                }}
                className={`relative w-full cursor-pointer transition-all duration-200 border-teal-500/20 shadow-md hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-400/40 hover:scale-[1.01] ${
                  isCircuitInDay1
                    ? 'ring-2 ring-teal-500/60 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-cyan-500/10 border-teal-500/40 shadow-teal-500/20'
                    : 'bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-amber-500/20 bg-amber-500/5'
                }`}
              >
                {isCircuitInDay1 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 pointer-events-none rounded-[16px]" />
                )}
                {isCircuitInDay1 && (
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="inline-flex items-center bg-green-500 text-white border border-green-500 px-2 py-1 text-xs font-medium rounded-lg shadow-sm">
                      ✓ Selezionato
                    </span>
                  </div>
                )}
                <CardContent className="relative p-4">
                <div className="flex gap-4">
                  {/* Griglia 3x3 anteprime video/immagini a sinistra */}
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
                  {/* Testi a destra */}
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
                            removeCircuit(circuit.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Rimuovi
                        </Button>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1 text-text-secondary text-sm">
                      {circuit.params.map((param, idx) => {
                        const ex = exercises.find((e) => e.id === param.exercise_id)
                        const label = ex?.name ?? 'Esercizio'
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
                          <li key={param.exercise_id} className="flex items-center gap-2">
                            <span className="text-amber-400/80 font-medium w-6">{idx + 1}.</span>
                            <span className="text-text-primary">{label}</span>
                            {details && (
                              <span className="text-text-tertiary text-xs">({details})</span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            )
          })}
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
              {circuitPickerStep === 'select'
                ? 'Esercizi per il circuito'
                : 'Configura circuito'}
            </DialogTitle>
            <DialogDescription>
              {circuitPickerStep === 'select' ? (
                <>
                  Seleziona gli esercizi che compongono il circuito. Verranno eseguiti in sequenza e
                  ripetuti per il numero di giri impostato (un esercizio unico a circuito con più
                  esercizi a ripetizione).
                </>
              ) : (
                <>
                  Imposta serie, ripetizioni, pesi e tempi per ogni esercizio del circuito.
                </>
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

      {/* Contenuto scrollabile */}
      <div className="relative flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0">
        <div
          className={`relative z-10 mx-auto w-full ${
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
