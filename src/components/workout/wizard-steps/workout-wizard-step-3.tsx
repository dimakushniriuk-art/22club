// ============================================================
// Componente Step 3 - Esercizi (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ExerciseCatalog } from '../exercise-catalog'
import type { WorkoutWizardData, Exercise, WorkoutDayExerciseData } from '@/types/workout'
import type { DayItem } from '@/types/workout'

interface WorkoutWizardStep3Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  onExerciseSelect: (dayIndex: number, exercise: Exercise) => void
  circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>
  getDayItems?: (day: { items?: DayItem[]; exercises?: WorkoutDayExerciseData[]; name?: string }) => DayItem[]
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
}: WorkoutWizardStep3Props) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-background-secondary/45 shadow-[0_0_24px_rgba(2,179,191,0.05)] backdrop-blur-xl transition-all duration-200"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <CardContent className="relative z-10 p-6 sm:p-8">
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-text-primary mb-2 text-xl font-bold">Esercizi per giorno</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          Scegli gli esercizi per ogni giorno di allenamento
        </p>
      </div>

      <div className="space-y-8">
        {wizardData.days.map((day, dayIndex) => {
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
          return (
          <Card
            key={dayIndex}
            variant="trainer"
            className="relative overflow-hidden rounded-xl border border-white/5 bg-background-secondary/40 shadow-md shadow-teal-500/5 backdrop-blur-xl transition-all duration-200 hover:border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

            <CardHeader className="relative z-10 border-b border-white/5 bg-background-secondary/50">
              <div className="flex items-center justify-between">
                <CardTitle size="sm" className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    size="sm"
                    className="border-0 bg-primary/10 text-primary"
                  >
                    Giorno {day.day_number}
                  </Badge>
                  <span className="font-semibold">{day.title || `Giorno ${day.day_number}`}</span>
                </CardTitle>
                <Badge variant="info" size="sm" className="shadow-sm">
                  {day.exercises.length} {day.exercises.length === 1 ? 'esercizio' : 'esercizi'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-6">
              <ExerciseCatalog
                exercises={exercises}
                onExerciseSelect={(exercise) => onExerciseSelect(dayIndex, exercise)}
                selectedExercises={selectedExercisesForDay}
                showSelectionOrder
              />
            </CardContent>
          </Card>
          )
        })}
      </div>
    </div>
      </CardContent>
    </Card>
  )
}
