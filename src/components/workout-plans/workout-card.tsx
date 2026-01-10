// ============================================================
// Componente Card Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { User, Target, Calendar, Trash2, Goal } from 'lucide-react'
import type { Workout } from '@/types/workout'
import { getObjectiveLabel } from '@/lib/constants/workout-objectives'

interface WorkoutCardProps {
  workout: Workout
  viewMode?: 'grid' | 'list'
  onWorkoutClick: (workout: Workout) => void
  onViewClick: (workout: Workout) => void
  onDeleteClick?: (workout: Workout) => void
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (dateString: string) => string
}

export function WorkoutCard({
  workout,
  viewMode = 'grid',
  onWorkoutClick,
  onViewClick,
  onDeleteClick,
  getStatusColor,
  getStatusText,
  formatDate,
}: WorkoutCardProps) {
  const router = useRouter()

  if (viewMode === 'list') {
    return (
      <Card
        variant="trainer"
        className="relative overflow-hidden cursor-pointer transition-all duration-200 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-2 border-teal-400/40 hover:border-teal-400/60 shadow-lg shadow-teal-500/10 backdrop-blur-xl"
        onClick={() => onWorkoutClick(workout)}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardContent className="relative p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Colonna sinistra */}
            <div className="space-y-3">
              <div>
                <p className="text-text-primary font-semibold">{workout.name}</p>
              </div>
              <div className="text-text-secondary text-sm">
                <span className="font-semibold text-text-primary">Assegnata a: </span>
                <span>{workout.athlete_name || 'Atleta non disponibile'}</span>
              </div>
              <div>
                <p className="text-text-secondary">
                  {workout.objective ? getObjectiveLabel(workout.objective) : 'Non specificato'}
                </p>
              </div>
              {workout.description && (
                <div>
                  <p className="text-text-secondary text-sm">{workout.description}</p>
                </div>
              )}
            </div>

            {/* Colonna destra */}
            <div className="space-y-3">
              <div className="text-text-secondary text-sm">
                <span className="font-semibold text-text-primary">Creata da: </span>
                <span>{workout.staff_name || 'Creatore non disponibile'}</span>
              </div>
              <div>
                <p className="text-text-secondary">{formatDate(workout.created_at)}</p>
              </div>
              <div>
                <Badge
                  variant={
                    getStatusColor(workout.status || 'attivo') as
                      | 'default'
                      | 'success'
                      | 'warning'
                      | 'error'
                      | 'info'
                      | 'outline'
                      | 'secondary'
                  }
                  size="sm"
                >
                  {getStatusText(workout.status || 'attivo')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Pulsanti azioni - allineati a destra */}
          <div className="flex justify-end gap-2 pt-4 border-t border-surface-300/30">
            <Button
              variant="outline"
              size="sm"
              className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation()
                onViewClick(workout)
              }}
            >
              Visualizza
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-400 hover:bg-teal-500/10 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/dashboard/schede/${workout.id}/modifica`)
              }}
            >
              Modifica
            </Button>
            {onDeleteClick && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Sei sicuro di voler eliminare questa scheda di allenamento?')) {
                    onDeleteClick(workout)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden cursor-pointer transition-all duration-200 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-2 border-teal-400/40 hover:border-teal-400/60 shadow-lg shadow-teal-500/10 backdrop-blur-xl h-full flex flex-col"
      onClick={() => onWorkoutClick(workout)}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <CardTitle size="sm" className="line-clamp-2">
            {workout.name}
          </CardTitle>
          <Badge
            variant={
              getStatusColor(workout.status || 'attivo') as
                | 'default'
                | 'success'
                | 'warning'
                | 'error'
                | 'info'
                | 'outline'
                | 'secondary'
            }
            size="sm"
          >
            {getStatusText(workout.status || 'attivo')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10 flex-1 flex flex-col justify-end">
        {/* Obiettivo - sempre visibile */}
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <Goal
            className={`h-4 w-4 flex-shrink-0 ${workout.objective ? 'text-teal-400' : 'text-text-tertiary'}`}
          />
          <span
            className={`text-sm line-clamp-1 ${workout.objective ? 'text-text-primary font-medium' : 'text-text-tertiary italic'}`}
          >
            {workout.objective ? getObjectiveLabel(workout.objective) : 'Obiettivo non specificato'}
          </span>
        </div>

        {/* Creatore */}
        <div className="flex items-center gap-2">
          <Target className="text-text-tertiary h-4 w-4" />
          <span className="text-text-secondary text-sm">
            {`Creata da: ${workout.staff_name || 'Creatore non disponibile'}`}
          </span>
        </div>

        {/* Atleta */}
        <div className="flex items-center gap-2">
          <User className="text-text-tertiary h-4 w-4" />
          <span className="text-text-secondary text-sm">
            {`Assegnata a: ${workout.athlete_name || 'Atleta non disponibile'}`}
          </span>
        </div>

        {/* Data creazione */}
        <div className="flex items-center gap-2">
          <Calendar className="text-text-tertiary h-4 w-4" />
          <span className="text-text-secondary text-sm">
            Creata il {formatDate(workout.created_at)}
          </span>
        </div>

        {/* Descrizione */}
        {workout.description && (
          <p className="text-text-tertiary line-clamp-2 text-xs">{workout.description}</p>
        )}

        {/* Azioni rapide */}
        <div className="flex gap-2 pt-2 pb-2 items-start justify-start text-left">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation()
              onViewClick(workout)
            }}
          >
            Visualizza
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-teal-400 hover:bg-teal-500/10 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/schede/${workout.id}/modifica`)
            }}
          >
            Modifica
          </Button>
          {onDeleteClick && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Sei sicuro di voler eliminare questa scheda di allenamento?')) {
                  onDeleteClick(workout)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
