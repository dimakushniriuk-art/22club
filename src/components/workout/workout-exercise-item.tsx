// ============================================================
// Componente Item Esercizio Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-detail-modal.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Clock } from 'lucide-react'

interface WorkoutExerciseItemProps {
  exercise: {
    id: string
    exercise_name: string
    target_sets: number
    target_reps: number
    target_weight: number | null
    rest_timer_sec: number
    order_index: number
  }
  index: number
}

export function WorkoutExerciseItem({ exercise, index }: WorkoutExerciseItemProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-surface-300/30 bg-background-secondary/40 p-4 hover:border-teal-500/30 hover:bg-background-secondary/60 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex-shrink-0 text-text-tertiary text-xs font-bold bg-surface-200/30 rounded-md px-2 py-1 border border-surface-300/20">
              #{index + 1}
            </span>
            <h5 className="text-text-primary font-semibold text-base truncate">
              {exercise.exercise_name}
            </h5>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-background-tertiary/60 rounded-md p-3 border border-surface-300/20">
          <p className="text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wide">
            Serie
          </p>
          <p className="text-text-primary font-bold text-xl">{exercise.target_sets}</p>
        </div>
        <div className="bg-background-tertiary/60 rounded-md p-3 border border-surface-300/20">
          <p className="text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wide">
            Ripetizioni
          </p>
          <p className="text-text-primary font-bold text-xl">{exercise.target_reps}</p>
        </div>
        {exercise.target_weight && exercise.target_weight > 0 ? (
          <div className="bg-background-tertiary/60 rounded-md p-3 border border-surface-300/20">
            <p className="text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wide">
              Peso
            </p>
            <p className="text-text-primary font-bold text-xl">{exercise.target_weight} kg</p>
          </div>
        ) : (
          <div className="bg-background-tertiary/30 rounded-md p-3 border border-surface-300/10">
            <p className="text-text-tertiary text-xs font-medium mb-1.5 uppercase tracking-wide">
              Peso
            </p>
            <p className="text-text-tertiary text-sm font-medium">—</p>
          </div>
        )}
        <div className="bg-background-tertiary/60 rounded-md p-3 border border-surface-300/20">
          <p className="text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wide">
            Recupero
          </p>
          <p className="text-text-primary font-bold text-xl flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-text-tertiary" />
            {exercise.rest_timer_sec}s
          </p>
        </div>
      </div>
    </div>
  )
}
