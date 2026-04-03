'use client'

import { useEffect, useState } from 'react'
import {
  STAFF_WORKOUTS_SLOTS_CHANGED_EVENT,
  hasStaffWorkoutActiveSlots,
} from '@/lib/embed/staff-workouts-slots-session'

/** True se in sessione ci sono uno o due slot allenamento (p1/p2) su /dashboard/workouts. */
export function useStaffWorkoutSlotsIndicator(): boolean {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const sync = () => setActive(hasStaffWorkoutActiveSlots())
    sync()
    window.addEventListener(STAFF_WORKOUTS_SLOTS_CHANGED_EVENT, sync)
    return () => window.removeEventListener(STAFF_WORKOUTS_SLOTS_CHANGED_EVENT, sync)
  }, [])

  return active
}
