'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  fetchAthletesSortedByRemainingLessonsForStaff,
  fetchMergedStaffExpiringPlansForStaff,
  type StaffAthleteLessonsRow,
  type StaffExpiringPlanRow,
} from '@/lib/dashboard/fetch-staff-dashboard-widgets'

export function useStaffDashboardWidgets(staffProfileId: string | undefined) {
  const [expiring, setExpiring] = useState<StaffExpiringPlanRow[]>([])
  const [athletes, setAthletes] = useState<StaffAthleteLessonsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!staffProfileId) {
      setExpiring([])
      setAthletes([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    try {
      const [ex, ath] = await Promise.all([
        fetchMergedStaffExpiringPlansForStaff(supabase, staffProfileId),
        fetchAthletesSortedByRemainingLessonsForStaff(supabase, staffProfileId),
      ])
      setExpiring(ex)
      setAthletes(ath)
    } catch {
      setExpiring([])
      setAthletes([])
      setError('Impossibile caricare i dati.')
    } finally {
      setLoading(false)
    }
  }, [staffProfileId])

  useEffect(() => {
    void load()
  }, [load])

  return { expiring, athletes, loading, error, reload: load }
}
