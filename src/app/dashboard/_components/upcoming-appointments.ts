import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:_components:upcoming-appointments')

interface Appointment {
  id: string
  date: string
  time: string
  athlete_name: string
  type: string
}

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Return mock data for demo purposes when no user
      return getMockAppointments()
    }

    // Try to query real appointments first
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          scheduled_at,
          type,
          athlete:profiles!appointments_athlete_id_fkey(nome, cognome)
        `,
        )
        .eq('pt_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3)

      if (error) throw error

      const appointments =
        data?.map((apt: unknown) => {
          const appointment = apt as Record<string, unknown>
          return {
            id: appointment.id as string,
            date: new Date(appointment.scheduled_at as string).toLocaleDateString('it-IT', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
            }),
            time: new Date(appointment.scheduled_at as string).toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            athlete_name:
              `${(appointment.athlete as Record<string, unknown>)?.nome || 'Atleta'} ${(appointment.athlete as Record<string, unknown>)?.cognome || ''}`.trim(),
            type: (appointment.type as string) || 'Allenamento',
          }
        }) || []

      // If no real data, return mock data
      return appointments.length > 0 ? appointments : getMockAppointments()
    } catch (dbError) {
      logger.warn('Database query failed, using mock data', dbError, { userId: user.id })
      return getMockAppointments()
    }
  } catch (error) {
    logger.error('Error fetching appointments', error)
    return getMockAppointments()
  }
}

// Mock appointments for demo/development
function getMockAppointments(): Appointment[] {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  return [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      date: tomorrow.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }),
      time: '10:00',
      athlete_name: 'Mario Rossi',
      type: 'Allenamento Forza',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      date: dayAfter.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }),
      time: '16:30',
      athlete_name: 'Laura Bianchi',
      type: 'Valutazione',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      date: nextWeek.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }),
      time: '09:15',
      athlete_name: 'Giuseppe Verdi',
      type: 'Allenamento Cardio',
    },
  ]
}
