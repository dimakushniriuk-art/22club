'use client'

import { useCallback, useMemo } from 'react'
import { WorkoutsPane } from '@/app/dashboard/workouts/_components/workouts-pane'
import { useWorkoutsShellCallbacks } from '@/contexts/workouts-shell-context'
import { agendaEventAllowsCoachedWorkoutCompletion } from '@/lib/appointments/agenda-event-coached-workout-eligibility'

export default function WorkoutsSlot2Page() {
  const { p2, eventForSlot2, setSlotDirty, dismissWorkoutsSlot, handleWorkoutCompleted } =
    useWorkoutsShellCallbacks()
  const countCompletionAsCoached = useMemo(
    () => agendaEventAllowsCoachedWorkoutCompletion(eventForSlot2),
    [eventForSlot2],
  )
  const onDirtyChange = useCallback((dirty: boolean) => setSlotDirty('p2', dirty), [setSlotDirty])
  const onDismissSlot = useCallback(() => dismissWorkoutsSlot('p2'), [dismissWorkoutsSlot])
  if (!p2) return null
  return (
    <WorkoutsPane
      slotId="p2"
      athleteProfileId={p2}
      countCompletionAsCoached={countCompletionAsCoached}
      onDirtyChange={onDirtyChange}
      onDismissSlot={onDismissSlot}
      onWorkoutCompleted={handleWorkoutCompleted}
    />
  )
}
