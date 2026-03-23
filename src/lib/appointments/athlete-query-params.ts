export type AthleteAppointmentsRole = 'athlete' | 'trainer' | 'admin' | 'unknown'

export type AthleteAppointmentsQueryParams = {
  role: AthleteAppointmentsRole
  includePastAppointments: boolean
  excludeCancelledAppointments: boolean
}

export type AthleteAppointmentTemporalInput = {
  starts_at?: string | null
  status?: string | null
}

/**
 * Parametri canonici minimi per il listing appuntamenti lato atleta/home.
 * NOTA: non sostituisce i vincoli DB/RLS; serve solo a mantenere coerenza UI locale.
 */
export function normalizeAthleteAppointmentsQueryParams(
  rawRole: string | null | undefined,
): AthleteAppointmentsQueryParams {
  const role = (rawRole ?? '').trim().toLowerCase()

  if (role === 'athlete') {
    return {
      role: 'athlete',
      // UI atleta usa anche la sezione "passati": non forzare qui solo futuri.
      includePastAppointments: true,
      excludeCancelledAppointments: true,
    }
  }

  if (role === 'trainer' || role === 'admin') {
    return {
      role: role as 'trainer' | 'admin',
      includePastAppointments: true,
      excludeCancelledAppointments: false,
    }
  }

  return {
    role: 'unknown',
    includePastAppointments: true,
    excludeCancelledAppointments: false,
  }
}

function parseAppointmentStart(startsAt?: string | null): Date | null {
  if (!startsAt) return null
  const date = new Date(startsAt)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isAthleteAppointmentFutureLike(
  appointment: AthleteAppointmentTemporalInput,
  now: Date = new Date(),
): boolean {
  const startDate = parseAppointmentStart(appointment.starts_at)
  if (!startDate) return false
  return (appointment.status || 'attivo') === 'attivo' && startDate >= now
}

export function isAthleteAppointmentPastLike(
  appointment: AthleteAppointmentTemporalInput,
  now: Date = new Date(),
): boolean {
  const startDate = parseAppointmentStart(appointment.starts_at)
  if (!startDate) return false
  return (appointment.status || 'attivo') === 'completato' || startDate < now
}
