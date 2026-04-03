'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchStaffTodayAgenda } from '@/lib/appointments/fetch-staff-today-agenda'
import { useLessonUsageByAthleteIds } from '@/hooks/use-lesson-usage-by-athlete-ids'
import { createLogger } from '@/lib/logger'
import { isSupabaseAuthLockStealAbortError } from '@/lib/supabase/supabase-lock-abort'
import type { AgendaEvent } from '@/types/agenda-event'
import { useAuth } from '@/providers/auth-provider'
import { STAFF_APPOINTMENTS_INVALIDATE_EVENT } from '@/lib/staff-cross-tab-events'

const logger = createLogger('hooks:use-staff-today-agenda')

/** Evita refetch ad ogni alt-tab breve (riduce sensazione di “doppio refresh”). */
const MIN_HIDDEN_MS_BEFORE_VISIBILITY_REFETCH = 3000

export function useStaffTodayAgenda() {
  const { user: authUser, actorProfile, isImpersonating } = useAuth()
  const staffAuth = isImpersonating && actorProfile ? actorProfile : authUser
  const staffProfileId = staffAuth?.id ?? null
  const supabase = useMemo(() => createClient(), [])
  const [agendaData, setAgendaData] = useState<AgendaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const hiddenAtRef = useRef<number | null>(null)

  const reload = useCallback(async () => {
    if (!staffProfileId) {
      setLoading(false)
      return
    }
    setLoadError(null)
    setLoading(true)
    try {
      // Nessun getSession: con profilo staff da AuthProvider il client ha già JWT per le query RLS.
      const data = await fetchStaffTodayAgenda(supabase, staffProfileId)
      setAgendaData(data)
    } catch (error) {
      if (isSupabaseAuthLockStealAbortError(error)) {
        logger.debug('Staff agenda: lock steal dopo retry, dati agenda invariati')
      } else {
        logger.error('Error loading today appointments', error)
        setAgendaData([])
        setLoadError('Impossibile caricare gli appuntamenti.')
      }
    } finally {
      setLoading(false)
    }
  }, [staffProfileId, supabase])

  useEffect(() => {
    if (!staffProfileId) {
      setLoading(false)
      setAgendaData([])
      setLoadError(null)
      return
    }

    let active = true

    const run = async () => {
      setLoadError(null)
      setLoading(true)
      try {
        // Nessun getSession: JWT già sul client dopo bootstrap AuthProvider.
        const data = await fetchStaffTodayAgenda(supabase, staffProfileId)
        if (!active) return
        setAgendaData(data)
      } catch (error) {
        if (isSupabaseAuthLockStealAbortError(error)) {
          logger.debug('Staff agenda: lock steal dopo retry, dati agenda invariati')
        } else {
          logger.error('Error loading today appointments', error)
          if (!active) return
          setAgendaData([])
          setLoadError('Impossibile caricare gli appuntamenti.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
        return
      }
      if (document.visibilityState !== 'visible') return
      const hiddenAt = hiddenAtRef.current
      hiddenAtRef.current = null
      if (
        hiddenAt != null &&
        Date.now() - hiddenAt < MIN_HIDDEN_MS_BEFORE_VISIBILITY_REFETCH
      ) {
        return
      }
      void run()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [staffProfileId, supabase])

  useEffect(() => {
    const handler = () => {
      void reload()
    }
    window.addEventListener(STAFF_APPOINTMENTS_INVALIDATE_EVENT, handler)
    return () => window.removeEventListener(STAFF_APPOINTMENTS_INVALIDATE_EVENT, handler)
  }, [reload])

  const athleteIds = useMemo(
    () => agendaData.map((e) => e.athlete_id).filter(Boolean) as string[],
    [agendaData],
  )
  const lessonUsageMap = useLessonUsageByAthleteIds(athleteIds, 'training')

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
  }
}
