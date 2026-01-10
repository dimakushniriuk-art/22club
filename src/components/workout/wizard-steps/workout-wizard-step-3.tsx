// ============================================================
// Componente Step 3 - Esercizi (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ExerciseCatalog } from '../exercise-catalog'
import type { WorkoutWizardData, Exercise } from '@/types/workout'

interface WorkoutWizardStep3Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  onExerciseSelect: (dayIndex: number, exercise: Exercise) => void
}

export function WorkoutWizardStep3({
  wizardData,
  exercises,
  onExerciseSelect,
}: WorkoutWizardStep3Props) {
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-text-primary mb-2 text-xl font-bold">Esercizi per giorno</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          Scegli gli esercizi per ogni giorno di allenamento
        </p>
      </div>

      <div className="space-y-8">
        {wizardData.days.map((day, dayIndex) => (
          <Card
            key={dayIndex}
            variant="trainer"
            className="relative overflow-hidden border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/5 backdrop-blur-xl transition-all duration-200"
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

            <CardHeader className="relative border-b border-surface-300/30 bg-background-secondary/50">
              <div className="flex items-center justify-between">
                <CardTitle size="sm" className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 border-teal-500/40 shadow-sm"
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
            <CardContent className="relative pt-6">
              <ExerciseCatalog
                exercises={exercises}
                onExerciseSelect={(exercise) => onExerciseSelect(dayIndex, exercise)}
                selectedExercises={day.exercises.map((ex) => ex.exercise_id)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
