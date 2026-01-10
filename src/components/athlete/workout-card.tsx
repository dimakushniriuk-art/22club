'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { DumbbellIcon } from '@/components/ui/professional-icons'
import { Badge } from '@/components/ui'

export interface WorkoutData {
  title: string
  day: number
  scheduledTime?: string
  ptName: string
  exercises: string[]
  duration: string
}

export interface WorkoutCardProps {
  workout?: WorkoutData
  loading?: boolean
  onStartWorkout?: () => void
}

const WorkoutCardComponent = ({ workout, loading = false, onStartWorkout }: WorkoutCardProps) => {
  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <div className="animate-pulse space-y-2">
            <div className="bg-background-tertiary h-6 w-32 rounded" />
            <div className="bg-background-tertiary h-4 w-24 rounded" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="animate-pulse space-y-3">
            <div className="bg-background-tertiary h-4 w-full rounded" />
            <div className="bg-background-tertiary h-4 w-3/4 rounded" />
            <div className="bg-background-tertiary h-10 w-full rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!workout) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <CardTitle
            size="md"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Allenamento di oggi
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <DumbbellIcon size={48} className="text-teal-400 opacity-50" />
            </div>
            <h3 className="text-text-primary mb-2 text-lg font-medium">
              Il tuo PT ti caricherà presto un nuovo allenamento
            </h3>
            <p className="text-text-secondary mb-4 text-sm">
              Controlla più tardi o contatta il tuo personal trainer
            </p>
            <Button
              variant="outline"
              size="md"
              disabled
              aria-label="Nessun allenamento disponibile per oggi"
            >
              Nessun allenamento disponibile
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              size="md"
              className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              {workout.title}
            </CardTitle>
            <p className="text-text-secondary text-sm">Giorno {workout.day}</p>
          </div>
          {workout.scheduledTime && (
            <Badge variant="primary" size="sm" className="shadow-lg shadow-teal-500/30">
              {workout.scheduledTime}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {/* PT Info */}
        <div className="flex items-center space-x-2 bg-background-secondary/50 rounded-lg p-2">
          <span className="text-text-tertiary text-sm">PT:</span>
          <span className="text-text-primary font-medium">{workout.ptName}</span>
        </div>

        {/* Exercises Preview */}
        <div className="space-y-2">
          <p className="text-text-secondary text-sm font-medium">Esercizi principali:</p>
          <div className="space-y-1.5">
            {workout.exercises.slice(0, 3).map((exercise, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <span className="text-brand text-sm group-hover:scale-110 transition-transform">
                  •
                </span>
                <span className="text-text-primary text-sm group-hover:text-teal-400 transition-colors">
                  {exercise}
                </span>
              </div>
            ))}
            {workout.exercises.length > 3 && (
              <p className="text-text-tertiary text-xs pl-4">
                +{workout.exercises.length - 3} altri esercizi
              </p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between pt-2 border-t border-teal-500/10">
          <span className="text-text-secondary text-sm">Durata: {workout.duration}</span>
          <Button
            variant="primary"
            size="md"
            onClick={onStartWorkout}
            aria-label={`Inizia allenamento ${workout.title} - Durata ${workout.duration} con ${workout.ptName}`}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium flex items-center space-x-2 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-105 transition-all duration-200"
          >
            <span>Inizia allenamento</span>
            <DumbbellIcon size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Memoized per evitare re-render non necessari
export const WorkoutCard = memo(WorkoutCardComponent)
