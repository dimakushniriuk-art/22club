'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Exercise, WorkoutWizardData } from '@/types/workout'
import { WorkoutWizardContent } from './workout-wizard-content'
import { List, Calendar, Dumbbell, Target, Check } from 'lucide-react'

interface WorkoutWizardProps {
  isOpen: boolean
  onClose: () => void
  onSave: (workoutData: WorkoutWizardData) => Promise<void>
  athletes: Array<{ id: string; name: string; email: string }>
  exercises: Exercise[]
  className?: string
  initialAthleteId?: string
}

// Nota: STEPS potrebbe essere usato in futuro per navigazione step o display
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STEPS = [
  { id: 1, title: 'Info generali', description: 'Nome, atleta e note della scheda', icon: List },
  { id: 2, title: 'Giorni', description: 'Organizza i giorni di allenamento', icon: Calendar },
  {
    id: 3,
    title: 'Esercizi',
    description: 'Scegli gli esercizi per ogni giorno',
    icon: Dumbbell,
  },
  { id: 4, title: 'Target', description: 'Imposta serie, ripetizioni e pesi', icon: Target },
  {
    id: 5,
    title: 'Riepilogo',
    description: 'Verifica e conferma la scheda',
    icon: Check,
  },
]

export function WorkoutWizard({
  isOpen,
  onClose,
  onSave,
  athletes,
  exercises,
  initialAthleteId,
}: WorkoutWizardProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="relative flex max-h-[95vh] max-w-5xl flex-col overflow-hidden bg-black border-teal-500/30 shadow-2xl p-0">
        <WorkoutWizardContent
          onSave={onSave}
          athletes={athletes}
          exercises={exercises}
          initialAthleteId={initialAthleteId}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
