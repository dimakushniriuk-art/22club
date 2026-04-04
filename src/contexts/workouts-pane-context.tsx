'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type WorkoutsPaneView =
  | { kind: 'home' }
  | { kind: 'oggi'; workoutPlanId?: string; dayId?: string; exerciseId?: string }
  | { kind: 'scheda'; workoutPlanId: string }
  | { kind: 'giorno'; workoutPlanId: string; dayId: string }
  | { kind: 'esercizio'; exerciseId: string }
  | { kind: 'riepilogo'; workoutLogId?: string }

export type WorkoutsPaneContextValue = {
  slotId: 'p1' | 'p2'
  athleteProfileId: string
  view: WorkoutsPaneView
  hrefFor: (next: WorkoutsPaneView) => string
  navigateTo: (next: WorkoutsPaneView) => void
  /** Dashboard Workouts: chiude la colonna atleta (dopo salvataggio finale). */
  dismissSlot?: () => void
  setDirty?: (dirty: boolean) => void
  onWorkoutCompleted?: (args: {
    athleteProfileId: string
    withTrainer: boolean
    workoutLogId?: string
    /** Da riepilogo Workouts: completa appuntamento in agenda anche se sessione salvata come solo. */
    finalizeAgendaAppointment?: boolean
  }) => void | boolean | Promise<void | boolean>
  /** Se true, "Completa allenamento" salva come coachato e collega agenda/debito; se false, come solo. */
  countCompletionAsCoached?: boolean
}

const WorkoutsPaneContext = createContext<WorkoutsPaneContextValue | null>(null)

export function WorkoutsPaneProvider({
  value,
  children,
}: {
  value: WorkoutsPaneContextValue
  children: ReactNode
}) {
  return <WorkoutsPaneContext.Provider value={value}>{children}</WorkoutsPaneContext.Provider>
}

export function useWorkoutsPaneOptional(): WorkoutsPaneContextValue | null {
  return useContext(WorkoutsPaneContext)
}
