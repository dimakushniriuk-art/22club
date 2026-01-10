// ============================================================
// Hook per gestione workout wizard (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import type {
  WorkoutWizardData,
  WorkoutDayData,
  WorkoutDayExerciseData,
  Exercise,
} from '@/types/workout'

const STEPS = [
  { id: 1, title: 'Info generali', description: 'Nome, atleta e note della scheda' },
  { id: 2, title: 'Giorni', description: 'Organizza i giorni di allenamento' },
  { id: 3, title: 'Esercizi', description: 'Scegli gli esercizi per ogni giorno' },
  { id: 4, title: 'Target', description: 'Imposta serie, ripetizioni e pesi' },
  { id: 5, title: 'Riepilogo', description: 'Verifica e conferma la scheda' },
]

interface UseWorkoutWizardProps {
  isOpen: boolean
  initialAthleteId?: string
  initialData?: WorkoutWizardData
  onSave: (workoutData: WorkoutWizardData) => Promise<void>
}

export function useWorkoutWizard({
  isOpen,
  initialAthleteId,
  initialData,
  onSave,
}: UseWorkoutWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [wizardData, setWizardData] = useState<WorkoutWizardData>({
    title: '',
    notes: '',
    days: [],
    athlete_id: '',
    difficulty: 'media',
  })

  // Reset wizard quando si apre o quando cambiano i dati iniziali
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      if (initialData) {
        setWizardData(initialData)
      } else {
        setWizardData({
          title: '',
          notes: '',
          days: [],
          athlete_id: initialAthleteId || '',
          difficulty: 'media',
        })
      }
    }
  }, [isOpen, initialAthleteId, initialData])

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleSave = useCallback(async () => {
    setIsLoading(true)
    try {
      await onSave(wizardData)
    } finally {
      setIsLoading(false)
    }
  }, [wizardData, onSave])

  const addDay = useCallback(() => {
    setWizardData((prev) => {
      // Calcola la lettera per il nuovo giorno (A, B, C, D, E, F, G, H, I, J, ecc.)
      const letter = String.fromCharCode(65 + prev.days.length) // 65 = 'A' in ASCII
      const defaultTitle = `Allenamento ${letter}`

      return {
        ...prev,
        days: [
          ...prev.days,
          {
            name: '',
            day_number: prev.days.length + 1,
            title: defaultTitle,
            exercises: [] as WorkoutDayExerciseData[],
          },
        ],
      }
    })
  }, [])

  const updateDay = useCallback((index: number, data: Partial<WorkoutDayData>) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.map((day, dIndex) => (dIndex === index ? { ...day, ...data } : day)),
    }))
  }, [])

  const addExerciseToDay = useCallback((dayIndex: number, exercise: Exercise) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.map((day, dIndex) => {
        if (dIndex !== dayIndex) return day

        // Controlla se l'esercizio è già presente
        const exerciseIndex = day.exercises.findIndex((ex) => ex.exercise_id === exercise.id)

        if (exerciseIndex >= 0) {
          // Se presente, rimuovilo (toggle off)
          return {
            ...day,
            exercises: day.exercises.filter((_, index) => index !== exerciseIndex),
          }
        } else {
          // Se non presente, aggiungilo (toggle on)
          return {
            ...day,
            exercises: [
              ...day.exercises,
              {
                exercise_id: exercise.id,
                target_sets: 1,
                target_reps: 10,
                target_weight: 0,
                rest_timer_sec: 60,
              } as WorkoutDayExerciseData,
            ],
          }
        }
      }),
    }))
  }, [])

  const updateExercise = useCallback(
    (dayIndex: number, exerciseIndex: number, data: Partial<WorkoutDayExerciseData>) => {
      setWizardData((prev) => ({
        ...prev,
        days: prev.days.map((day, dIndex) =>
          dIndex === dayIndex
            ? {
                ...day,
                exercises: day.exercises.map((ex, eIndex) =>
                  eIndex === exerciseIndex ? { ...ex, ...data } : ex,
                ),
              }
            : day,
        ),
      }))
    },
    [],
  )

  const removeExercise = useCallback((dayIndex: number, exerciseIndex: number) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.map((day, dIndex) =>
        dIndex === dayIndex
          ? {
              ...day,
              exercises: day.exercises.filter((_, eIndex) => eIndex !== exerciseIndex),
            }
          : day,
      ),
    }))
  }, [])

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          wizardData.title.trim().length > 0 &&
          (wizardData.athlete_id?.length ?? 0) > 0 &&
          (wizardData.objective?.length ?? 0) > 0
        )
      case 2:
        return wizardData.days.length > 0
      case 3:
        return wizardData.days.every((day) => day.exercises.length > 0)
      case 4:
        return true // I target sono opzionali
      case 5:
        return true // L'atleta è già selezionato nello step 1
      default:
        return false
    }
  }, [currentStep, wizardData])

  return {
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
    updateExercise,
    removeExercise,
    canProceed,
    STEPS,
  }
}
