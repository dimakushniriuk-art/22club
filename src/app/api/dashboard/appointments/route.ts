import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { fetchCurrentProfileForAuthUserId } from '@/lib/supabase/get-current-profile'
import { createLogger } from '@/lib/logger'
import {
  formatStaffDayAthleteDisplayName,
  getStaffLocalDayBoundsISO,
  STAFF_TODAY_APPOINTMENTS_SELECT,
} from '@/lib/appointments/staff-today-appointments-query'

const logger = createLogger('api:dashboard:appointments')

/**
 * GET /api/dashboard/appointments
 * Ottiene gli appuntamenti del giorno corrente per lo staff autenticato
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const current = await fetchCurrentProfileForAuthUserId(supabase, user.id)
    if (!current) {
      logger.warn('Profilo non trovato', undefined, { userId: user.id })
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const staffProfileId = current.profileId

    const { dayStart: todayStart, dayEnd: todayEnd } = getStaffLocalDayBoundsISO()

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(STAFF_TODAY_APPOINTMENTS_SELECT)
      .eq('staff_id', staffProfileId)
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd)
      .is('cancelled_at', null)
      .order('starts_at', { ascending: true })

    if (error) {
      logger.error('Errore durante il recupero degli appuntamenti', error, {
        staffId: staffProfileId,
      })
      return NextResponse.json({ error: 'Errore durante il recupero' }, { status: 500 })
    }

    // Trasforma i dati nel formato atteso dal componente
    const now = new Date()
    const currentTime = now.getTime()

    type AppointmentRow = {
      id: string
      starts_at: string
      ends_at: string | null
      type: string | null
      status: string | null
      athlete_id: string
      athlete: {
        avatar?: string | null
        avatar_url?: string | null
        nome?: string | null
        cognome?: string | null
      } | null
    }
    const appointmentsTyped = (appointments || []) as AppointmentRow[]
    const formattedAppointments = appointmentsTyped
      .filter((apt) => {
        const statusValue = apt.status ?? ''
        // Escludi appuntamenti completati o cancellati
        if (
          statusValue === 'completato' ||
          statusValue === 'completed' ||
          statusValue === 'cancelled' ||
          statusValue === 'annullato'
        ) {
          return false
        }

        // Escludi appuntamenti passati (più di 1 ora fa) che non sono in corso
        const startTime = new Date(apt.starts_at)
        const startTimeMs = startTime.getTime()
        if (startTimeMs < currentTime) {
          const endTime = apt.ends_at ? new Date(apt.ends_at) : null
          if (endTime && endTime.getTime() > currentTime) {
            // È in corso, mantienilo
            return true
          }
          // È passato più di 1 ora, escludilo
          const hoursDiff = (currentTime - startTimeMs) / (1000 * 60 * 60)
          if (hoursDiff > 1) {
            return false
          }
        }

        return true
      })
      .map((apt) => {
        const startTime = new Date(apt.starts_at)
        const hours = String(startTime.getHours()).padStart(2, '0')
        const minutes = String(startTime.getMinutes()).padStart(2, '0')
        const time = `${hours}:${minutes}`

        const athleteName = formatStaffDayAthleteDisplayName(apt.athlete)

        return {
          id: apt.id,
          date: startTime.toISOString().split('T')[0],
          time,
          athlete_name: athleteName,
          type: apt.type || 'appuntamento',
        }
      })

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    logger.error('Errore durante il recupero degli appuntamenti', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
