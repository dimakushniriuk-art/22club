'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { AgendaEvent } from '@/types/agenda-event'

export type WorkoutsShellCallbacksContextValue = {
  p1: string
  p2: string
  eventForSlot1: AgendaEvent | undefined
  eventForSlot2: AgendaEvent | undefined
  dirtySlots: { p1: boolean; p2: boolean }
  setSlotDirty: (slotId: 'p1' | 'p2', dirty: boolean) => void
  /** Rimuove atleta dallo slot (URL + session) senza dialog; usare dopo salvataggio confermato. */
  dismissWorkoutsSlot: (slotId: 'p1' | 'p2') => void
  handleWorkoutCompleted: (args: {
    athleteProfileId: string
    withTrainer: boolean
    workoutLogId?: string
    finalizeAgendaAppointment?: boolean
  }) => Promise<boolean>
}

const WorkoutsShellCallbacksContext = createContext<WorkoutsShellCallbacksContextValue | null>(
  null,
)

export function WorkoutsShellCallbacksProvider({
  value,
  children,
}: {
  value: WorkoutsShellCallbacksContextValue
  children: ReactNode
}) {
  return (
    <WorkoutsShellCallbacksContext.Provider value={value}>
      {children}
    </WorkoutsShellCallbacksContext.Provider>
  )
}

export function useWorkoutsShellCallbacks(): WorkoutsShellCallbacksContextValue {
  const ctx = useContext(WorkoutsShellCallbacksContext)
  if (!ctx) {
    throw new Error('useWorkoutsShellCallbacks must be used within WorkoutsShellCallbacksProvider')
  }
  return ctx
}
