// ============================================================
// Componente Header Dettaglio Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-detail-modal.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
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
  getStatusColor,
  getStatusText,
  formatDate,
}: WorkoutDetailHeaderProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/5 backdrop-blur-xl"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />

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
          <Badge
            variant={
              getStatusColor(workout.status) as
                | 'default'
                | 'success'
                | 'warning'
                | 'error'
                | 'info'
                | 'outline'
                | 'secondary'
            }
            size="sm"
            className="ml-4 flex-shrink-0 shadow-sm"
          >
            {getStatusText(workout.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-surface-300/30">
          {/* Obiettivo - se presente */}
          {workout.objective && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
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
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
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
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
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
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Calendar className="text-purple-400 h-5 w-5" />
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
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <Dumbbell className="text-orange-400 h-5 w-5" />
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
