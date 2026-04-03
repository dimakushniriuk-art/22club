'use client'

import { useCallback, useMemo } from 'react'
import { WorkoutsPane } from '@/app/dashboard/workouts/_components/workouts-pane'
import { useWorkoutsShellCallbacks } from '@/contexts/workouts-shell-context'
import { agendaEventAllowsCoachedWorkoutCompletion } from '@/lib/appointments/agenda-event-coached-workout-eligibility'

export default function WorkoutsSlot1Page() {
  const { p1, eventForSlot1, setSlotDirty, dismissWorkoutsSlot, handleWorkoutCompleted } =
    useWorkoutsShellCallbacks()
  const countCompletionAsCoached = useMemo(
    () => agendaEventAllowsCoachedWorkoutCompletion(eventForSlot1),
    [eventForSlot1],
  )
  const onDirtyChange = useCallback(
    (dirty: boolean) => setSlotDirty('p1', dirty),
    [setSlotDirty],
  )
  const onDismissSlot = useCallback(() => dismissWorkoutsSlot('p1'), [dismissWorkoutsSlot])
  if (!p1) return null
  return (
    <WorkoutsPane
      slotId="p1"
      athleteProfileId={p1}
      countCompletionAsCoached={countCompletionAsCoached}
      onDirtyChange={onDirtyChange}
      onDismissSlot={onDismissSlot}
      onWorkoutCompleted={handleWorkoutCompleted}
    />
  )
}
