'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { createLogger } from '@/lib/logger'
import { apiGet } from '@/lib/api-client'
import { supabase } from '@/lib/supabase/client'
import {
  formatStaffDayAthleteDisplayName,
  getStaffLocalDayBoundsISO,
  STAFF_TODAY_APPOINTMENTS_SELECT,
} from '@/lib/appointments/staff-today-appointments-query'

const logger = createLogger('app:dashboard:_components:upcoming-appointments-client')

interface Appointment {
  id: string
  date: string
  time: string
  athlete_name: string
  type: string
}

interface UpcomingAppointmentsClientProps {
  initialData: Appointment[]
}

export function UpcomingAppointmentsClient({ initialData }: UpcomingAppointmentsClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialData)
  const [loading, setLoading] = useState(false)

  // Refresh periodico opzionale (ogni 60s)
  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true)
      try {
        // Usa API route su web, Supabase client su mobile
        const data = await apiGet<Appointment[]>(
          '/api/dashboard/appointments',
          {},
          // Fallback Supabase (usato su mobile o se API fallisce)
          async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser()
            if (!user) return []

            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', user.id)
              .single()

            if (!profile) return []

            const { dayStart: todayStart, dayEnd: todayEnd } = getStaffLocalDayBoundsISO()

            const { data: appointments } = await supabase
              .from('appointments')
              .select(STAFF_TODAY_APPOINTMENTS_SELECT)
              .eq('staff_id', profile.id)
              .gte('starts_at', todayStart)
              .lt('starts_at', todayEnd)
              .is('cancelled_at', null)
              .order('starts_at', { ascending: true })

            type AppointmentWithAthlete = {
              id: string
              starts_at: string
              type?: string | null
              athlete?: unknown
            }
            return ((appointments || []) as AppointmentWithAthlete[]).map((apt) => {
              const startTime = new Date(apt.starts_at)
              const hours = String(startTime.getHours()).padStart(2, '0')
              const minutes = String(startTime.getMinutes()).padStart(2, '0')

              return {
                id: apt.id,
                date: startTime.toISOString().split('T')[0],
                time: `${hours}:${minutes}`,
                athlete_name: formatStaffDayAthleteDisplayName(apt.athlete),
                type: apt.type || 'appuntamento',
              }
            })
          },
        )

        setAppointments(data)
      } catch (err) {
        logger.error('Error refreshing appointments', err)
      } finally {
        setLoading(false)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading && appointments.length === 0) {
    return null
  }

  return (
    <Card variant="trainer">
      <CardHeader>
        <CardTitle size="md">Prossimi Appuntamenti</CardTitle>
      </CardHeader>
      <CardContent>
        {!appointments || appointments.length === 0 ? (
          <div className="text-text-tertiary py-4 text-center text-sm">
            Nessun appuntamento in programma
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="text-sm">
                <div className="text-text-primary font-medium">
                  {apt.date} {apt.time}
                </div>
                <div className="text-text-secondary">
                  {apt.athlete_name} - {apt.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
