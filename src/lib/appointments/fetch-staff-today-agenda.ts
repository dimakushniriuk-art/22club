import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:appointments:fetch-staff-today-agenda')
import type { AgendaEvent } from '@/types/agenda-event'
import {
  formatStaffDayAthleteDisplayName,
  getStaffLocalDayBoundsISO,
  STAFF_TODAY_APPOINTMENTS_SELECT,
} from '@/lib/appointments/staff-today-appointments-query'
import { isValidUUID } from '@/lib/utils/type-guards'
import { isSupabaseAuthLockStealAbortError } from '@/lib/supabase/supabase-lock-abort'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

type TodayAppointment = {
  id: string
  starts_at: string
  ends_at: string | null
  type: string | null
  status: string | null
  athlete_id: string | null
  athlete_name: string | null
  trainer_id: string | null
  trainer_name: string | null
  athlete:
    | {
        id?: string | null
        avatar: string | null
        avatar_url: string | null
        nome?: string | null
        cognome?: string | null
      }
    | SupabaseRelationError
    | null
}

type SupabaseRelationError = {
  message: string
  details?: string | null
  hint?: string | null
  code?: string | null
}

type AthleteProfile = {
  id?: string | null
  avatar?: string | null
  avatar_url?: string | null
  nome?: string | null
  cognome?: string | null
}

const isSupabaseRelationError = (value: unknown): value is SupabaseRelationError =>
  typeof value === 'object' && value !== null && 'message' in value

export async function fetchStaffTodayAgenda(
  supabaseClient: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<AgendaEvent[]> {
  const now = new Date()
  const { dayStart: todayStart, dayEnd: todayEnd } = getStaffLocalDayBoundsISO(now)

  const maxAttempts = 3
  let todayAppointments: unknown[] | null = null
  let error: { message?: string; details?: string; hint?: string; code?: string } | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await supabaseClient
      .from('appointments')
      .select(STAFF_TODAY_APPOINTMENTS_SELECT)
      .eq('staff_id', staffProfileId)
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd)
      .is('cancelled_at', null)
      .order('starts_at', { ascending: true })

    if (!result.error) {
      todayAppointments = result.data ?? []
      error = null
      break
    }
    error = result.error
    if (isSupabaseAuthLockStealAbortError(result.error) && attempt < maxAttempts - 1) {
      await sleep(80)
      continue
    }
    break
  }

  if (error) {
    if (isSupabaseAuthLockStealAbortError(error)) {
      logger.debug('Agenda: query appuntamenti abortita (auth lock steal), dopo retry', {
        todayStart,
        todayEnd,
      })
    } else {
      logger.error('Agenda: errore query appuntamenti', error, { todayStart, todayEnd })
    }
    throw error
  }

  if (!Array.isArray(todayAppointments)) return []

  const rows = todayAppointments as unknown as TodayAppointment[]
  const currentTime = now.getTime()

  const agendaCandidates = rows.reduce<AgendaEvent[]>((acc, apt) => {
    const startTime = new Date(apt.starts_at)
    const endTime = apt.ends_at ? new Date(apt.ends_at) : null
    const startTimeMs = startTime.getTime()
    const statusValue = apt.status ?? ''

    if (statusValue === 'completato' || statusValue === 'completed') return acc
    if (statusValue === 'cancelled' || statusValue === 'annullato') return acc

    if (startTimeMs < currentTime) {
      if (!(endTime && endTime.getTime() > currentTime)) {
        const hoursDiff = (currentTime - startTimeMs) / (1000 * 60 * 60)
        if (hoursDiff > 1) return acc
      }
    }

    let status: AgendaEvent['status'] = 'scheduled'
    if (statusValue === 'in_corso' || statusValue === 'in-progress') {
      status = 'in-progress'
    } else if (statusValue === 'cancelled' || statusValue === 'annullato') {
      status = statusValue === 'annullato' ? 'annullato' : 'cancelled'
    } else {
      if (endTime && startTimeMs < currentTime && endTime.getTime() > currentTime) {
        status = 'in-progress'
      } else if (startTimeMs < currentTime) {
        const hoursDiff = (currentTime - startTimeMs) / (1000 * 60 * 60)
        if (hoursDiff <= 1) status = 'in-progress'
      }
    }

    const hours = String(startTime.getHours()).padStart(2, '0')
    const minutes = String(startTime.getMinutes()).padStart(2, '0')
    const time = `${hours}:${minutes}`

    let type: AgendaEvent['type'] = 'appuntamento'
    const typeValue = apt.type ?? ''
    if (typeValue === 'allenamento') type = 'allenamento'
    else if (typeValue === 'consulenza' || typeValue === 'prima_visita' || typeValue === 'riunione')
      type = 'consulenza'

    const description =
      typeValue === 'allenamento'
        ? 'Allenamento'
        : typeValue === 'consulenza'
          ? 'Consulenza'
          : typeValue || 'Appuntamento'

    const athleteRecord = isSupabaseRelationError(apt.athlete) ? null : apt.athlete
    const athleteProfile = athleteRecord as AthleteProfile | null
    const athleteAvatar = athleteProfile?.avatar_url ?? athleteProfile?.avatar ?? null
    const athleteName = formatStaffDayAthleteDisplayName(apt.athlete)
    const resolvedAthleteId =
      (apt.athlete_id && isValidUUID(apt.athlete_id) ? apt.athlete_id : null) ??
      (athleteProfile?.id && isValidUUID(athleteProfile.id) ? athleteProfile.id : null)

    const startsAtStr =
      apt.starts_at && typeof apt.starts_at === 'object' && 'getTime' in apt.starts_at
        ? (apt.starts_at as Date).toISOString()
        : typeof apt.starts_at === 'string'
          ? apt.starts_at
          : undefined
    const endsAtStr =
      apt.ends_at && typeof apt.ends_at === 'object' && 'getTime' in apt.ends_at
        ? (apt.ends_at as Date).toISOString()
        : typeof apt.ends_at === 'string'
          ? apt.ends_at
          : undefined

    acc.push({
      id: apt.id,
      time,
      athlete: athleteName,
      athlete_id: resolvedAthleteId ?? undefined,
      athlete_avatar: athleteAvatar,
      type,
      status,
      description,
      starts_at: startsAtStr,
      ends_at: endsAtStr,
    })
    return acc
  }, [])

  return agendaCandidates.sort((a, b) => {
    const [hoursA, minutesA] = a.time.split(':').map(Number)
    const [hoursB, minutesB] = b.time.split(':').map(Number)
    return hoursA * 60 + minutesA - (hoursB * 60 + minutesB)
  })
}
