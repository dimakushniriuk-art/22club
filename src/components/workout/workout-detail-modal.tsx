'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui'
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
      <DialogContent className="flex flex-col max-h-[95vh] sm:max-w-[1000px] lg:max-w-[1200px] relative overflow-hidden rounded-3xl bg-gradient-to-br from-background-secondary/38 via-background-secondary/18 to-cyan-950/22 backdrop-blur-xl border border-primary/22 hover:border-primary/30 transition shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <DialogHeader className="border-b border-white/5 pb-4 shrink-0">
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

            {/* Statistiche rapide - sfumature distinte */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/12 via-background-secondary/40 to-cyan-950/15 p-6 shadow-[0_0_24px_rgba(2,179,191,0.06)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_28px_rgba(2,179,191,0.1)]">
                <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                  Giorni
                </p>
                <p className="text-primary text-3xl font-bold tracking-tight drop-shadow-[0_0_10px_rgba(2,179,191,0.4)]">{workout.days.length}</p>
                <p className="text-text-tertiary text-xs mt-1">Giorni configurati</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 via-background-secondary/40 to-cyan-950/12 p-6 shadow-[0_0_24px_rgba(34,211,238,0.05)] transition-all duration-300 hover:border-cyan-500/25 hover:shadow-[0_0_28px_rgba(34,211,238,0.1)]">
                <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                  Esercizi Totali
                </p>
                <p className="text-cyan-400 text-3xl font-bold tracking-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]">{totalExercises}</p>
                <p className="text-text-tertiary text-xs mt-1">Esercizi nella scheda</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 via-background-secondary/40 to-emerald-950/12 p-6 shadow-[0_0_24px_rgba(16,185,129,0.05)] transition-all duration-300 hover:border-emerald-500/25 hover:shadow-[0_0_28px_rgba(16,185,129,0.1)]">
                <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                  Stato
                </p>
                <div className="mt-2">
                  <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1 inline-block">
                    {getStatusText(workout.status)}
                  </span>
                </div>
                <p className="text-text-tertiary text-xs mt-2">Stato attuale</p>
              </div>
            </div>

            <WorkoutDaysList days={workout.days} />
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
