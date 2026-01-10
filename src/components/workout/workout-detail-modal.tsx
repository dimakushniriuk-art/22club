'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Spinner, Badge } from '@/components/ui'
import { ErrorState } from '@/components/dashboard/error-state'
import { useWorkoutDetail } from '@/hooks/workout/use-workout-detail'
import { WorkoutDetailHeader } from './workout-detail-header'
import { WorkoutDaysList } from './workout-days-list'

interface WorkoutDetailModalProps {
  workoutId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'attivo':
    case 'active':
      return 'success'
    case 'completato':
    case 'completed':
      return 'info'
    case 'archiviato':
    case 'archived':
      return 'default'
    case 'expired':
      return 'error'
    default:
      return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'attivo':
    case 'active':
      return 'Attiva'
    case 'completato':
    case 'completed':
      return 'Completata'
    case 'archiviato':
    case 'archived':
      return 'Archiviata'
    case 'expired':
      return 'Scaduta'
    default:
      return status || 'Sconosciuto'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function WorkoutDetailModal({ workoutId, open, onOpenChange }: WorkoutDetailModalProps) {
  const { workout, loading, error } = useWorkoutDetail(workoutId, open)

  const totalExercises = workout
    ? workout.days.reduce((total, day) => total + day.exercises.length, 0)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[1000px] lg:max-w-[1200px] bg-background border-teal-500/30">
        <DialogHeader className="border-b border-surface-300/30 pb-4">
          <DialogTitle className="text-2xl font-bold text-text-primary">
            Dettagli Scheda Allenamento
          </DialogTitle>
          <DialogDescription className="text-base text-text-secondary mt-2">
            Visualizza tutti i dettagli completi della scheda di allenamento
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="py-8">
            <ErrorState message={error.message} />
          </div>
        )}

        {workout && !loading && (
          <div className="space-y-6 py-2">
            <WorkoutDetailHeader
              workout={workout}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              formatDate={formatDate}
            />

            {/* Statistiche rapide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative overflow-hidden rounded-lg border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary p-6 shadow-md shadow-teal-500/5 hover:shadow-teal-500/10 transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
                <div className="relative z-10">
                  <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                    Giorni
                  </p>
                  <p className="text-text-primary text-3xl font-bold">{workout.days.length}</p>
                  <p className="text-text-tertiary text-xs mt-1">Giorni configurati</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary p-6 shadow-md shadow-teal-500/5 hover:shadow-teal-500/10 transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
                <div className="relative z-10">
                  <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                    Esercizi Totali
                  </p>
                  <p className="text-text-primary text-3xl font-bold">{totalExercises}</p>
                  <p className="text-text-tertiary text-xs mt-1">Esercizi nella scheda</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary p-6 shadow-md shadow-teal-500/5 hover:shadow-teal-500/10 transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
                <div className="relative z-10">
                  <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                    Stato
                  </p>
                  <div className="mt-2">
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
                      className="text-base px-3 py-1"
                    >
                      {getStatusText(workout.status)}
                    </Badge>
                  </div>
                  <p className="text-text-tertiary text-xs mt-2">Stato attuale</p>
                </div>
              </div>
            </div>

            <WorkoutDaysList days={workout.days} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
