'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchAthletesSortedByRemainingLessonsForStaff,
  fetchMergedStaffExpiringPlansForStaff,
  type StaffAthleteLessonsRow,
  type StaffExpiringPlanRow,
} from '@/lib/dashboard/fetch-staff-dashboard-widgets'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 2 * 60 * 1000

export function useStaffDashboardWidgets(staffProfileId: string | undefined, enabled = true) {
  const supabase = useMemo(() => createClient(), [])
  const queryClient = useQueryClient()

  const queryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.dashboard.widgets(staffProfileId)
        : (['dashboard', 'widgets', '__disabled__'] as const),
    [staffProfileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!staffProfileId) {
        return { expiring: [] as StaffExpiringPlanRow[], athletes: [] as StaffAthleteLessonsRow[] }
      }
      const [expiring, athletes] = await Promise.all([
        fetchMergedStaffExpiringPlansForStaff(supabase, staffProfileId),
        fetchAthletesSortedByRemainingLessonsForStaff(supabase, staffProfileId),
      ])
      return { expiring, athletes }
    },
    enabled: enabled && Boolean(staffProfileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.widgets(staffProfileId) })
  }, [queryClient, staffProfileId])

  useEffect(() => {
    if (!enabled || !staffProfileId) return
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [enabled, staffProfileId, reload])

  const loading = Boolean(staffProfileId && enabled && query.isPending)
  const error = query.error != null ? 'Impossibile caricare i dati.' : null

  return {
    expiring: query.data?.expiring ?? [],
    athletes: query.data?.athletes ?? [],
    loading,
    error,
    reload,
  }
}
