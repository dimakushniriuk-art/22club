'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchStaffTodayAgenda } from '@/lib/appointments/fetch-staff-today-agenda'
import { useLessonUsageByAthleteIdsState } from '@/hooks/use-lesson-usage-by-athlete-ids'
import { createLogger } from '@/lib/logger'
import { isSupabaseAuthLockStealAbortError } from '@/lib/supabase/supabase-lock-abort'
import type { AgendaEvent } from '@/types/agenda-event'
import { useAuth } from '@/providers/auth-provider'
import { STAFF_APPOINTMENTS_INVALIDATE_EVENT } from '@/lib/staff-cross-tab-events'
import { queryKeys } from '@/lib/query-keys'

const logger = createLogger('hooks:use-staff-today-agenda')

/** Evita refetch ad ogni alt-tab breve (riduce sensazione di “doppio refresh”). */
const MIN_HIDDEN_MS_BEFORE_VISIBILITY_REFETCH = 3000

const STALE_MS = 60 * 1000

export function useStaffTodayAgenda() {
  const queryClient = useQueryClient()
  const { user: authUser } = useAuth()
  const staffProfileId = authUser?.id ?? null
  const supabase = useMemo(() => createClient(), [])
  const hiddenAtRef = useRef<number | null>(null)

  const agendaQueryKey = useMemo(
    () =>
      staffProfileId
        ? queryKeys.appointments.staffToday(staffProfileId)
        : (['appointments', 'staff-today', '__disabled__'] as const),
    [staffProfileId],
  )

  const agendaQuery = useQuery({
    queryKey: agendaQueryKey,
    queryFn: async () => {
      if (!staffProfileId) return []
      try {
        return await fetchStaffTodayAgenda(supabase, staffProfileId)
      } catch (error) {
        if (isSupabaseAuthLockStealAbortError(error)) {
          logger.debug('Staff agenda: lock steal dopo retry, dati agenda invariati')
          return (
            queryClient.getQueryData<AgendaEvent[]>(
              queryKeys.appointments.staffToday(staffProfileId),
            ) ?? []
          )
        }
        throw error
      }
    },
    enabled: !!staffProfileId,
    staleTime: STALE_MS,
    placeholderData: (previousData) => previousData,
  })

  const agendaData = useMemo(() => agendaQuery.data ?? [], [agendaQuery.data])

  useEffect(() => {
    if (!staffProfileId) return

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
        return
      }
      if (document.visibilityState !== 'visible') return
      const hiddenAt = hiddenAtRef.current
      hiddenAtRef.current = null
      if (hiddenAt != null && Date.now() - hiddenAt < MIN_HIDDEN_MS_BEFORE_VISIBILITY_REFETCH) {
        return
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.staffToday(staffProfileId),
      })
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [staffProfileId, queryClient])

  useEffect(() => {
    if (!staffProfileId) return
    const handler = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.staffToday(staffProfileId),
      })
    }
    window.addEventListener(STAFF_APPOINTMENTS_INVALIDATE_EVENT, handler)
    return () => window.removeEventListener(STAFF_APPOINTMENTS_INVALIDATE_EVENT, handler)
  }, [staffProfileId, queryClient])

  const reload = useCallback(async () => {
    if (!staffProfileId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.appointments.staffToday(staffProfileId),
    })
  }, [staffProfileId, queryClient])

  const loading = Boolean(staffProfileId && agendaQuery.isPending)
  const loadError = agendaQuery.error != null ? 'Impossibile caricare gli appuntamenti.' : null

  const athleteIds = useMemo(
    () => agendaData.map((e) => e.athlete_id).filter(Boolean) as string[],
    [agendaData],
  )
  const {
    usageMap: lessonUsageMap,
    loading: lessonUsageLoading,
    error: lessonUsageError,
  } = useLessonUsageByAthleteIdsState(athleteIds, 'training')

  const lessonsLoading = athleteIds.length > 0 && lessonUsageLoading
  const lessonsLoadError = athleteIds.length > 0 ? lessonUsageError : null

  const eventsWithLessons = useMemo(
    () =>
      agendaData.map((e) => {
        if (!e.athlete_id) return { ...e, lessons_remaining: undefined }
        return {
          ...e,
          lessons_remaining: lessonUsageMap.get(e.athlete_id)?.totalRemaining,
        }
      }),
    [agendaData, lessonUsageMap],
  )

  return {
    events: eventsWithLessons,
    loading,
    loadError,
    reload,
    lessonsLoading,
    lessonsLoadError,
  }
}
