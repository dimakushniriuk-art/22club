'use client'

import { Progress } from '@/components/ui'
import { Button } from '@/components/ui'
import { ChevronLeft, ChevronRight, Check, ArrowLeft } from 'lucide-react'
import type { Exercise, WorkoutWizardData } from '@/types/workout'
import { useWorkoutWizard } from '@/hooks/workout/use-workout-wizard'
import {
  WorkoutWizardStep1,
  WorkoutWizardStep2,
  WorkoutWizardStep3,
  WorkoutWizardStep4,
  WorkoutWizardStep5,
} from './wizard-steps'
import { List, Calendar, Dumbbell, Target } from 'lucide-react'
import Link from 'next/link'

interface WorkoutWizardContentProps {
  onSave: (workoutData: WorkoutWizardData) => Promise<void>
  athletes: Array<{ id: string; name: string; email: string }>
  exercises: Exercise[]
  initialAthleteId?: string
  initialData?: WorkoutWizardData
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
  onCancel,
}: WorkoutWizardContentProps) {
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
    updateExercise,
    removeExercise,
    canProceed,
  } = useWorkoutWizard({ isOpen: true, initialAthleteId, initialData, onSave })

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
          />
        )
      case 4:
        return (
          <WorkoutWizardStep4
            wizardData={wizardData}
            exercises={exercises}
            onExerciseUpdate={updateExercise}
            onExerciseRemove={removeExercise}
          />
        )
      case 5:
        return <WorkoutWizardStep5 wizardData={wizardData} athletes={athletes} />
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
      <div className="relative flex-shrink-0 border-b border-surface-300/30 bg-background px-4 sm:px-6 py-4">
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
                              : 'border-surface-300/50 bg-background-tertiary/50 text-text-tertiary'
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
                          isCompleted ? 'bg-green-500/40' : 'bg-surface-300/30'
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

      {/* Footer fisso */}
      <div className="relative flex-shrink-0 border-t border-surface-300/30 bg-background px-4 sm:px-6 py-4">
        <div className="relative z-10 flex items-center justify-between gap-4 max-w-3xl mx-auto w-full">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-surface-300/50 text-text-secondary hover:bg-surface-200/50 hover:text-text-primary hover:border-surface-300 whitespace-nowrap"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>

          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-text-secondary hover:text-text-primary hover:bg-surface-200/30 whitespace-nowrap"
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
    </div>
  )
}
