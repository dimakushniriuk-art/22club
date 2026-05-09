'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
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
import {
  SelectedExercisesVerticalStrip,
  type StripEntry,
} from './selected-exercises-vertical-strip'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  Plus,
  Pencil,
  Trash2,
  Save,
  ClipboardList,
  CalendarDays,
  Dumbbell,
  SlidersHorizontal,
  FileCheck2,
} from 'lucide-react'
import type {
  Exercise,
  WorkoutWizardData,
  WorkoutDayExerciseData,
  WorkoutDayData,
  DayItem,
} from '@/types/workout'
import { useWorkoutWizard, type WorkoutWizardSaveOptions } from '@/hooks/workout/use-workout-wizard'
import {
  clearWizardBrowserDraft,
  loadWizardBrowserDraft,
  saveWizardBrowserDraft,
  saveWizardBrowserDraftSync,
  shouldRestoreWizardDraftEdit,
  shouldRestoreWizardDraftNuova,
} from '@/lib/workout-wizard-browser-draft'
import {
  WorkoutWizardStep1,
  WorkoutWizardStep2,
  WorkoutWizardStep3,
  WorkoutWizardStep4,
  WorkoutWizardStep5,
} from './wizard-steps'
import { CircuitConfigStep } from './wizard-steps/circuit-config-step'
import { Badge } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import Image from 'next/image'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import {
  validateWorkoutTarget,
  type WorkoutTarget,
  isWorkoutExerciseConfigured,
} from '@/lib/validations/workout-target'
import { isWorkoutPlanRealAthleteId } from '@/lib/constants/workout-plan-wizard'
import { useToast } from '@/components/ui/toast'
import { WorkoutExerciseTargetPanel } from './workout-exercise-target-panel'
import { useAutoplayPreviewVideo } from '@/hooks/use-autoplay-preview-video'

function WizardCircuitCellVideo({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string
  posterUrl?: string | null
}) {
  const ref = useAutoplayPreviewVideo({ enabled: true, pauseWhenOffscreen: true })
  return (
    <video
      ref={ref}
      src={videoUrl}
      poster={posterUrl || undefined}
      className="w-full h-full object-cover"
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
    />
  )
}

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

function circuitParamsToStripEntries(
  params: WorkoutDayExerciseData[],
  exerciseCatalog: Exercise[],
): StripEntry[] {
  return params.map((p, i) => ({
    kind: 'exercise' as const,
    exerciseId: p.exercise_id,
    exercise: exerciseCatalog.find((e) => e.id === p.exercise_id),
    sequence: i + 1,
    configured: isWorkoutExerciseConfigured(p),
  }))
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
  /** Titolo H1 (default: nuova scheda) */
  pageTitle?: string
  /** Chiave bozza locale (localStorage): es. `nuova` o `edit-{planId}` — riduce perdita dati su refresh/idle */
  localDraftScope?: string
  /** ISO `updated_at` scheda dal server (solo modifica): ripristino locale solo se più recente */
  planServerUpdatedAt?: string | null
}

const STEPS = [
  {
    id: 1,
    title: 'Info generali',
    description: 'Nome, atleta e note della scheda',
    icon: ClipboardList,
  },
  {
    id: 2,
    title: 'Giorni',
    description: 'Organizza i giorni di allenamento',
    icon: CalendarDays,
  },
  {
    id: 3,
    title: 'Esercizi',
    description: 'Scegli gli esercizi per ogni giorno',
    icon: Dumbbell,
  },
  {
    id: 4,
    title: 'Target',
    description: 'Imposta serie, ripetizioni e pesi',
    icon: SlidersHorizontal,
  },
  {
    id: 5,
    title: 'Riepilogo',
    description: 'Verifica e conferma la scheda',
    icon: FileCheck2,
  },
]

/** Larghezza contenuto scrollabile: step 1–2 allineati (wide); 3–4 catalogo; 5 riepilogo compatto. */
function getWizardContentMaxWidthClass(step: number): string {
  switch (step) {
    case 3:
    case 4:
      return 'max-w-[1800px]'
    case 1:
    case 2:
      return 'max-w-7xl'
    case 5:
      return 'max-w-3xl'
    default:
      return 'max-w-3xl'
  }
}

export function WorkoutWizardContent({
  onSave,
  athletes,
  exercises,
  initialAthleteId,
  initialData,
  initialCircuitList,
  onCancel,
  pageTitle = 'Nuova Scheda Allenamento',
  localDraftScope,
  planServerUpdatedAt,
}: WorkoutWizardContentProps) {
  const { addToast } = useToast()
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
    isStepReachable,
    goToStep,
    getDayItems,
    setCurrentStep,
  } = useWorkoutWizard({
    isOpen: true,
    initialAthleteId,
    initialData,
    onSave: async (data, options) => {
      await onSave(data, circuitList, options)
      if (localDraftScope) clearWizardBrowserDraft(localDraftScope)
    },
  })

  const draftRestoreDoneRef = useRef(false)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const persistSnapshotRef = useRef({
    wizardData,
    circuitList,
    currentStep,
  })

  useEffect(() => {
    persistSnapshotRef.current = { wizardData, circuitList, currentStep }
  }, [wizardData, circuitList, currentStep])

  useEffect(() => {
    if (!localDraftScope) return
    const flush = () => {
      const { wizardData: wd, circuitList: cl, currentStep: cs } = persistSnapshotRef.current
      saveWizardBrowserDraftSync(localDraftScope, {
        wizardData: wd,
        circuitList: cl,
        currentStep: cs,
        savedAt: new Date().toISOString(),
      })
    }
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [localDraftScope])

  useEffect(() => {
    if (!localDraftScope) return
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      saveWizardBrowserDraft(localDraftScope, {
        wizardData,
        circuitList,
        currentStep,
        savedAt: new Date().toISOString(),
      })
    }, 450)
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    }
  }, [localDraftScope, wizardData, circuitList, currentStep])

  useEffect(() => {
    if (!localDraftScope || draftRestoreDoneRef.current) return
    const draft = loadWizardBrowserDraft(localDraftScope)
    if (!draft) {
      draftRestoreDoneRef.current = true
      return
    }

    const isEditFlow = localDraftScope.startsWith('edit-')
    if (isEditFlow) {
      if (!shouldRestoreWizardDraftEdit(draft, planServerUpdatedAt ?? null)) {
        clearWizardBrowserDraft(localDraftScope)
        draftRestoreDoneRef.current = true
        return
      }
    } else if (!shouldRestoreWizardDraftNuova(draft)) {
      draftRestoreDoneRef.current = true
      return
    }

    draftRestoreDoneRef.current = true
    setWizardData(draft.wizardData)
    setCircuitList(draft.circuitList)
    setCurrentStep(Math.min(Math.max(1, draft.currentStep), 5))
    addToast({
      title: 'Bozza recuperata',
      message:
        'Ripristinato il lavoro salvato nel browser. Salva bozza o pubblica sul server per confermare.',
      variant: 'success',
    })
  }, [
    localDraftScope,
    planServerUpdatedAt,
    setWizardData,
    setCircuitList,
    setCurrentStep,
    addToast,
  ])

  const handleConfirmPublish = useCallback(async () => {
    if (!isWorkoutPlanRealAthleteId(wizardData.athlete_id)) {
      addToast({
        title: 'Impossibile pubblicare',
        message: 'Seleziona un atleta reale oppure usa «Salva bozza».',
        variant: 'warning',
      })
      return
    }
    await handleSave()
  }, [wizardData.athlete_id, handleSave, addToast])

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
  /** Scroll nel CircuitConfigStep dopo apertura modale o clic sulla strip */
  const [circuitModalScrollToExerciseIndex, setCircuitModalScrollToExerciseIndex] = useState<
    number | null
  >(null)

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
    setCircuitModalScrollToExerciseIndex(null)
    setCircuitPickerOpen(true)
  }, [])

  /** Passo configurazione dal catalogo; opzionale indice esercizio per scroll nella lista parametri */
  const goToCircuitPickerConfigure = useCallback(
    (focusExerciseIndex?: number) => {
      if (circuitExerciseIds.length === 0) return
      setCircuitExerciseParams((prev) => {
        const prevById = new Map(prev.map((p) => [p.exercise_id, p]))
        return circuitExerciseIds.map((exercise_id) => {
          const existing = prevById.get(exercise_id)
          if (existing) return { ...existing }
          return {
            exercise_id,
            sets: 1,
            target_sets: 1,
            target_reps: 10,
          }
        })
      })
      setCircuitPickerStep('configure')
      setCircuitModalScrollToExerciseIndex(
        focusExerciseIndex !== undefined ? focusExerciseIndex : null,
      )
    },
    [circuitExerciseIds],
  )

  const reorderCircuitPickerExerciseIds = useCallback((from: number, to: number) => {
    if (from === to) return
    setCircuitExerciseIds((prev) => {
      const next = [...prev]
      const [removed] = next.splice(from, 1)
      next.splice(to, 0, removed)
      return next
    })
  }, [])

  const reorderCircuitPickerParams = useCallback((from: number, to: number) => {
    if (from === to) return
    setCircuitExerciseParams((prev) => {
      const next = [...prev]
      const [removed] = next.splice(from, 1)
      next.splice(to, 0, removed)
      return next
    })
  }, [])

  const closeCircuitModal = useCallback(() => {
    setCircuitPickerOpen(false)
    setCircuitPickerStep('select')
    setEditingCircuitId(null)
    setCircuitModalScrollToExerciseIndex(null)
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

  const editCircuit = useCallback(
    (
      circuit: { id: string; params: WorkoutDayExerciseData[] },
      options?: { focusExerciseIndex?: number },
    ) => {
      setEditingCircuitId(circuit.id)
      setCircuitExerciseIds(circuit.params.map((p) => p.exercise_id))
      setCircuitExerciseParams(circuit.params.map((p) => ({ ...p })))
      setCircuitPickerStep('configure')
      setCircuitPickerOpen(true)
      setCircuitModalScrollToExerciseIndex(
        options?.focusExerciseIndex !== undefined ? options.focusExerciseIndex : null,
      )
    },
    [],
  )

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

  const deleteStripExerciseFromTargetModal = useCallback(() => {
    if (stripTargetItemModalIndex == null) return
    removeExercise(selectedDayIndex, stripTargetItemModalIndex)
    closeStripExerciseTargetModal()
  }, [stripTargetItemModalIndex, selectedDayIndex, removeExercise, closeStripExerciseTargetModal])

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

  const circuitPickerSelectStripEntries = useMemo(() => {
    const paramById = new Map(circuitExerciseParams.map((p) => [p.exercise_id, p]))
    return circuitExerciseIds.map((id, i) => {
      const p = paramById.get(id)
      return {
        kind: 'exercise' as const,
        exerciseId: id,
        exercise: exercises.find((e) => e.id === id),
        sequence: i + 1,
        configured: p ? isWorkoutExerciseConfigured(p) : false,
      }
    })
  }, [circuitExerciseIds, exercises, circuitExerciseParams])

  const circuitPickerConfigureStripEntries = useMemo(
    () => circuitParamsToStripEntries(circuitExerciseParams, exercises),
    [circuitExerciseParams, exercises],
  )

  useEffect(() => {
    if (circuitModalScrollToExerciseIndex === null) return
    if (!circuitPickerOpen || circuitPickerStep !== 'configure') return
    const idx = circuitModalScrollToExerciseIndex
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`circuit-cfg-${idx}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        setCircuitModalScrollToExerciseIndex(null)
      })
    })
  }, [
    circuitModalScrollToExerciseIndex,
    circuitPickerOpen,
    circuitPickerStep,
    circuitExerciseParams.length,
  ])

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
    ) => {
      const card = (
        <Card
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
                        <WizardCircuitCellVideo videoUrl={videoUrl} posterUrl={posterUrl} />
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
                      param.target_sets != null && `${param.target_sets} cicli`,
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
        <div key={circuit.id} className="w-full">
          {card}
        </div>
      )
    }

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

  const headerAthleteSuffix = (() => {
    const id = wizardData.athlete_id
    if (!isWorkoutPlanRealAthleteId(id)) return ''
    const name = athletes.find((a) => a.id === id)?.name?.trim()
    return name ? `: ${name}` : ''
  })()

  const headerPrimaryAction =
    currentStep === STEPS.length ? (
      <Button
        size="sm"
        onClick={handleConfirmPublish}
        disabled={!canProceed() || isLoading}
        className="h-8 bg-gradient-to-r from-teal-500 to-cyan-500 px-2.5 text-xs font-semibold text-white shadow-md shadow-teal-500/20 transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:px-3 sm:text-sm md:px-4"
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
        size="sm"
        onClick={handleNext}
        disabled={!canProceed()}
        className="h-8 bg-gradient-to-r from-teal-500 to-cyan-500 px-2.5 text-xs font-semibold text-white shadow-md shadow-teal-500/20 transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:px-3 sm:text-sm md:px-4"
      >
        Avanti
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    )

  return (
    <div className="@container relative flex min-h-0 flex-1 flex-col bg-background">
      {/* Titolo → barra progresso (0% … 100%) → stepper + navigazione */}
      <div className="relative flex-shrink-0 border-b border-white/10 bg-background px-4 py-3 sm:px-6 sm:py-4">
        <div className="relative z-10 mx-auto w-full max-w-5xl space-y-3">
          <div className="space-y-2.5 px-0.5 sm:space-y-3 sm:px-1">
            <h1 className="text-fluid-display break-words text-center font-bold text-text-primary">
              {pageTitle}
              {headerAthleteSuffix}
            </h1>
            <div className="mx-auto flex w-full max-w-md items-center gap-2 sm:gap-3">
              <span
                className="w-9 shrink-0 text-right text-[10px] font-medium tabular-nums text-text-tertiary sm:w-10 sm:text-xs"
                aria-hidden
              >
                0%
              </span>
              <div
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={STEPS.length}
                aria-label={`Avanzamento: passo ${currentStep} di ${STEPS.length}`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-[width] duration-300 ease-out"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
              <span
                className="w-9 shrink-0 text-left text-[10px] font-medium tabular-nums text-text-tertiary sm:w-10 sm:text-xs"
                aria-hidden
              >
                100%
              </span>
            </div>
          </div>

          {/* Griglia: azioni secondarie | stepper (centrato, scroll) | navigazione */}
          <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 border-t border-white/10 pt-3 sm:gap-x-3 sm:pt-3.5">
            <div className="flex min-w-0 flex-nowrap items-center justify-self-start gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="h-8 shrink-0 border-amber-500/45 px-2 text-xs text-amber-300 hover:border-amber-400/55 hover:bg-amber-500/15 hover:text-amber-200 disabled:border-white/10 disabled:text-text-tertiary sm:h-9 sm:px-2.5 sm:text-sm md:px-3"
              >
                <Save className="mr-1 h-3.5 w-3.5 shrink-0 sm:mr-1.5 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Salva bozza</span>
              </Button>
              {onCancel && (
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  size="sm"
                  className="h-8 shrink-0 px-2 text-xs sm:h-9 sm:px-2.5 sm:text-sm md:px-3"
                >
                  Annulla
                </Button>
              )}
            </div>

            <div className="min-w-0 justify-self-stretch px-0.5 sm:px-1">
              <div
                className="flex min-h-10 snap-x snap-mandatory items-center justify-center gap-0 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Passi del wizard"
              >
                {STEPS.map((step, index) => {
                  const StepIconComponent = step.icon
                  const stepNumber = index + 1
                  const isActive = stepNumber === currentStep
                  const isCompleted = stepNumber < currentStep
                  const reachable = isStepReachable(stepNumber)

                  return (
                    <div key={step.id} className="flex snap-start items-center">
                      <button
                        type="button"
                        onClick={() => goToStep(stepNumber)}
                        disabled={!reachable}
                        title={
                          reachable
                            ? `${isActive ? 'Passo attuale: ' : ''}${step.title}`
                            : `Completa i passi precedenti per aprire: ${step.title}`
                        }
                        aria-label={
                          reachable
                            ? `Vai a ${step.title} (passo ${stepNumber} di ${STEPS.length})`
                            : `Non disponibile: ${step.title} (completa i passi precedenti)`
                        }
                        aria-current={isActive ? 'step' : undefined}
                        className={`group/step relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ease-out sm:h-10 sm:w-10 md:h-11 md:w-11 ${
                          isActive
                            ? 'z-[1] scale-105 border-teal-400/80 bg-gradient-to-br from-teal-500/25 via-teal-500/15 to-cyan-500/20 text-teal-200 shadow-lg shadow-teal-500/25 ring-2 ring-teal-400/35 ring-offset-2 ring-offset-background'
                            : isCompleted
                              ? 'border-emerald-500/45 bg-emerald-500/[0.12] text-emerald-300 shadow-sm shadow-emerald-900/20'
                              : 'border-white/[0.12] bg-white/[0.04] text-text-tertiary shadow-sm'
                        } ${
                          reachable
                            ? isActive
                              ? 'cursor-pointer hover:shadow-xl hover:shadow-teal-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-105'
                              : 'cursor-pointer hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:text-text-secondary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0'
                            : 'cursor-not-allowed opacity-40'
                        }`}
                      >
                        {isCompleted ? (
                          <Check
                            className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] md:h-5 md:w-5"
                            strokeWidth={2.25}
                            aria-hidden
                          />
                        ) : (
                          <StepIconComponent
                            className={`h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover/step:scale-105'}`}
                            strokeWidth={isActive ? 2.25 : 1.85}
                            aria-hidden
                          />
                        )}
                      </button>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`mx-1.5 h-0.5 w-3 shrink-0 rounded-full transition-colors sm:mx-2 sm:w-5 md:w-7 ${
                            isCompleted ? 'bg-emerald-500/35' : 'bg-white/[0.08]'
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex min-w-0 flex-nowrap items-center justify-self-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="h-8 shrink-0 border-white/10 px-2 text-xs text-text-secondary hover:border-primary/20 hover:bg-background-secondary/50 hover:text-text-primary sm:h-9 sm:px-3 sm:text-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" aria-hidden />
                <span className="hidden sm:inline">Indietro</span>
                <span className="sr-only sm:hidden">Indietro</span>
              </Button>

              <div className="shrink-0">{headerPrimaryAction}</div>
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
                const exCount = getDayItems(day).length
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
          <div className="flex flex-1 min-h-0 flex-col px-6 py-4">
            <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row md:items-stretch">
              {circuitPickerStep === 'select' ? (
                <SelectedExercisesVerticalStrip
                  entries={circuitPickerSelectStripEntries}
                  onReorder={reorderCircuitPickerExerciseIds}
                  onItemClick={(stripIdx) => goToCircuitPickerConfigure(stripIdx)}
                  className="md:sticky md:top-0 md:self-start shrink-0"
                />
              ) : (
                <SelectedExercisesVerticalStrip
                  entries={circuitPickerConfigureStripEntries}
                  onReorder={reorderCircuitPickerParams}
                  onItemClick={(stripIdx) => setCircuitModalScrollToExerciseIndex(stripIdx)}
                  className="md:sticky md:top-0 md:self-start shrink-0"
                />
              )}
              <div className="min-h-0 flex-1 overflow-y-auto md:min-h-[min(320px,40vh)]">
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
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-white/10 shrink-0">
            {circuitPickerStep === 'select' ? (
              <>
                <Button type="button" variant="outline" onClick={closeCircuitModal}>
                  Annulla
                </Button>
                <Button
                  type="button"
                  onClick={() => goToCircuitPickerConfigure()}
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
              variant="destructive"
              onClick={deleteStripExerciseFromTargetModal}
              disabled={stripTargetItemModalIndex == null}
              className="mr-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina esercizio
            </Button>
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
          className={`relative z-10 mx-auto w-full flex flex-col gap-6 ${getWizardContentMaxWidthClass(currentStep)}`}
        >
          <div key={currentStep} className="animate-fade-in">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  )
}
