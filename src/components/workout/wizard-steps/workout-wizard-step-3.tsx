// ============================================================
// Componente Step 3 - Esercizi (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ExerciseCatalog } from '../exercise-catalog'
import { SelectedExercisesVerticalStrip } from '../selected-exercises-vertical-strip'
import type { WorkoutWizardData, Exercise, WorkoutDayExerciseData } from '@/types/workout'
import type { DayItem } from '@/types/workout'
import { isWorkoutExerciseConfigured } from '@/lib/validations/workout-target'

interface WorkoutWizardStep3Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  onExerciseSelect: (dayIndex: number, exercise: Exercise) => void
  circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>
  getDayItems?: (day: {
    items?: DayItem[]
    exercises?: WorkoutDayExerciseData[]
    name?: string
  }) => DayItem[]
  /** Indice del giorno da mostrare (una pagina per giorno) */
  selectedDayIndex?: number
  /** Sezione Circuito da mostrare subito sotto l'header del giorno */
  circuitSection?: React.ReactNode
  /** Riordino esercizi liberi (stessa sequenza del catalogo con numeri) */
  onReorderStandaloneExercises: (
    circuitExerciseIds: Set<string>,
    fromIndex: number,
    toIndex: number,
  ) => void
  /** Clic su voce strip: apre il modale di configurazione target (stesso form del passo Target) */
  onStripOpenTargetStep: (stripIndex: number) => void
}

function getDayItemsFallback(day: {
  items?: DayItem[]
  exercises?: WorkoutDayExerciseData[]
}): DayItem[] {
  if (day.items && day.items.length > 0) return day.items
  return (day.exercises || []).map((e) => ({ type: 'exercise' as const, exercise: e }))
}

export function WorkoutWizardStep3({
  wizardData,
  exercises,
  onExerciseSelect,
  circuitList = [],
  getDayItems = getDayItemsFallback,
  selectedDayIndex = 0,
  circuitSection,
  onReorderStandaloneExercises,
  onStripOpenTargetStep,
}: WorkoutWizardStep3Props) {
  const dayIndex = Math.min(selectedDayIndex, Math.max(0, wizardData.days.length - 1))
  const day = wizardData.days[dayIndex]
  if (!day) return null

  const dayItems = getDayItems(day)
  const circuitExerciseIdsInDay = new Set<string>()
  dayItems.forEach((item) => {
    if (item.type === 'circuit') {
      const circuit = circuitList.find((c) => c.id === item.circuitId)
      circuit?.params.forEach((p) => circuitExerciseIdsInDay.add(p.exercise_id))
    }
  })
  const selectedExercisesForDay = day.exercises
    .map((ex) => ex.exercise_id)
    .filter((id) => !circuitExerciseIdsInDay.has(id))

  const standaloneExerciseRows = day.exercises.filter(
    (ex) => !circuitExerciseIdsInDay.has(ex.exercise_id),
  )
  const stripEntries = standaloneExerciseRows.map((ex, i) => ({
    exerciseId: ex.exercise_id,
    exercise: exercises.find((e) => e.id === ex.exercise_id),
    sequence: i + 1,
    configured: isWorkoutExerciseConfigured(ex),
  }))

  return (
    <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start">
      <SelectedExercisesVerticalStrip
        entries={stripEntries}
        onReorder={(from, to) => onReorderStandaloneExercises(circuitExerciseIdsInDay, from, to)}
        onItemClick={onStripOpenTargetStep}
        className="md:sticky md:top-4 md:self-start md:-mt-4"
      />
      <Card
        id={`day-${dayIndex}`}
        variant="default"
        className="relative min-w-0 flex-1 overflow-hidden transition-all duration-200"
      >
        <CardHeader className="border-b border-white/10">
          <CardTitle size="sm" className="flex items-center gap-3">
            <Badge variant="outline" size="sm" className="border-0 bg-primary/10 text-primary">
              Giorno {day.day_number}
            </Badge>
            <span className="font-semibold">{day.title || `Giorno ${day.day_number}`}</span>
          </CardTitle>
        </CardHeader>
        {circuitSection != null ? (
          <div className="border-b border-white/10 px-4 sm:px-6 py-4">{circuitSection}</div>
        ) : null}
        <CardContent className="pt-6">
          <ExerciseCatalog
            exercises={exercises}
            onExerciseSelect={(exercise) => onExerciseSelect(dayIndex, exercise)}
            selectedExercises={selectedExercisesForDay}
            showSelectionOrder
          />
        </CardContent>
      </Card>
    </div>
  )
}
