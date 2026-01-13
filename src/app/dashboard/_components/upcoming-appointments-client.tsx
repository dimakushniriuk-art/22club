'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { createLogger } from '@/lib/logger'

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
        const res = await fetch('/api/dashboard/appointments')

        if (res.ok) {
          // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
          const text = await res.text()
          if (!text || text.trim().length === 0) {
            logger.warn('Risposta vuota da /api/dashboard/appointments')
            setLoading(false)
            return
          }

          const data = JSON.parse(text)
          setAppointments(data)
        }
      } catch (err) {
        logger.error('Error refreshing appointments', err)
      } finally {
        setLoading(false)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading && appointments.length === 0) {
    return (
      <Card variant="trainer">
        <CardHeader>
          <CardTitle size="md">Prossimi Appuntamenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="bg-background-tertiary h-4 w-28 rounded" />
                <div className="bg-background-tertiary h-3 w-40 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
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
