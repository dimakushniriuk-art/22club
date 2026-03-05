// ============================================================
// Componente Header Dettaglio Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-detail-modal.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { User, Target, Calendar, Dumbbell, Goal } from 'lucide-react'
import { getObjectiveLabel } from '@/lib/constants/workout-objectives'

interface WorkoutDetailHeaderProps {
  workout: {
    name: string
    description: string | null
    objective?: string | null
    status: string
    difficulty: string | null
    created_at: string
    athlete_name: string
    staff_name: string
  }
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (dateString: string) => string
}

export function WorkoutDetailHeader({
  workout,
  getStatusColor: _getStatusColor,
  getStatusText,
  formatDate,
}: WorkoutDetailHeaderProps) {
  return (
    <Card
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-background-secondary/45 shadow-[0_0_24px_rgba(2,179,191,0.05)] backdrop-blur-xl"
    >
      <CardContent className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-text-primary text-2xl font-bold mb-2 break-words">
              {workout.name}
            </h3>
            {workout.description && (
              <p className="text-text-secondary text-sm leading-relaxed break-words">
                {workout.description}
              </p>
            )}
          </div>
          <span className="ml-4 shrink-0 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1">
            {getStatusText(workout.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/5">
          {/* Obiettivo - se presente */}
          {workout.objective && (
            <div className="flex items-center gap-3">
              <div className="shrink-0 h-10 w-10 rounded-lg bg-teal-500/15 flex items-center justify-center border border-teal-500/25">
                <Goal className="text-teal-400 h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-secondary text-xs font-medium mb-0.5">Obiettivo</p>
                <p className="text-text-primary text-sm font-semibold line-clamp-2">
                  {getObjectiveLabel(workout.objective)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center border border-blue-500/25">
              <User className="text-blue-400 h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-text-secondary text-xs font-medium mb-0.5">Atleta</p>
              <p className="text-text-primary text-sm font-semibold truncate">
                {workout.athlete_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-cyan-500/15 flex items-center justify-center border border-cyan-500/25">
              <Target className="text-cyan-400 h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-text-secondary text-xs font-medium mb-0.5">Personal Trainer</p>
              <p className="text-text-primary text-sm font-semibold truncate">
                {workout.staff_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-violet-500/15 flex items-center justify-center border border-violet-500/25">
              <Calendar className="text-violet-400 h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-text-secondary text-xs font-medium mb-0.5">Data Creazione</p>
              <p className="text-text-primary text-sm font-semibold">
                {formatDate(workout.created_at)}
              </p>
            </div>
          </div>

          {workout.difficulty && (
            <div className="flex items-center gap-3">
              <div className="shrink-0 h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/25">
                <Dumbbell className="text-amber-400 h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-secondary text-xs font-medium mb-0.5">Difficoltà</p>
                <p className="text-text-primary text-sm font-semibold capitalize">
                  {workout.difficulty === 'beginner'
                    ? 'Bassa'
                    : workout.difficulty === 'intermediate'
                      ? 'Media'
                      : workout.difficulty === 'advanced'
                        ? 'Alta'
                        : workout.difficulty}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
