'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { CalendarIcon } from '@/components/ui/professional-icons'
import { Badge } from '@/components/ui'
import { XCircle, Clock, Dumbbell, ClipboardCheck, Calendar, Sparkles, Loader2 } from 'lucide-react'

interface Appointment {
  id: string
  day: string
  time: string
  type: string
  ptName: string
  location?: string | null
  status?: 'in_corso' | 'programmato' | 'cancellato'
  dateTime?: string // ISO string per calcolo countdown
}

interface AppointmentsCardProps {
  appointments?: Appointment[]
  loading?: boolean
  isRefreshing?: boolean // Nuovo: distingue loading iniziale da refresh
  onViewAll?: () => void
  onAppointmentClick?: (appointment: Appointment) => void
}

export function AppointmentsCard({
  appointments,
  loading = false,
  isRefreshing = false, // Nuovo: indica refresh quando ci sono già dati
  onViewAll,
  onAppointmentClick,
}: AppointmentsCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Aggiorna il tempo ogni minuto per countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Icona per tipo di appuntamento (mantenuta per uso futuro)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('allenamento') || lowerType.includes('training')) {
      return <Dumbbell className="h-4 w-4 text-teal-400" />
    }
    if (lowerType.includes('valutazione') || lowerType.includes('consult')) {
      return <ClipboardCheck className="h-4 w-4 text-cyan-400" />
    }
    return <Calendar className="h-4 w-4 text-blue-400" />
  }

  // Calcola countdown per appuntamento
  const getCountdown = (dateTime?: string) => {
    if (!dateTime) return null

    const appointmentDate = new Date(dateTime)
    const now = currentTime
    const diff = appointmentDate.getTime() - now.getTime()

    if (diff < 0) return null // Già passato
    if (diff > 24 * 60 * 60 * 1000) return null // Più di 24 ore

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  }

  // Determina priorità (oggi, domani, questa settimana)
  const getPriority = (day: string) => {
    const lowerDay = day.toLowerCase()
    if (lowerDay.includes('oggi')) return 'today'
    if (lowerDay.includes('domani')) return 'tomorrow'
    return 'week'
  }

  // Badge migliorato con countdown (mantenuto per uso futuro)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusBadge = (appointment: Appointment) => {
    if (appointment.status === 'cancellato') {
      return (
        <Badge variant="error" size="sm">
          <XCircle className="h-3 w-3 mr-1" />
          Cancellato
        </Badge>
      )
    }

    const countdown = getCountdown(appointment.dateTime)
    const priority = getPriority(appointment.day)

    // Badge con countdown per appuntamenti vicini
    if (countdown && priority === 'today') {
      return (
        <Badge variant="warning" size="sm" className="animate-pulse">
          <Clock className="h-3 w-3 mr-1" />
          Tra {countdown}
        </Badge>
      )
    }

    // Badge con priorità
    if (priority === 'today') {
      return (
        <Badge variant="warning" size="sm">
          Oggi
        </Badge>
      )
    }

    if (priority === 'tomorrow') {
      return null
    }

    return null
  }

  // Handler per click su appuntamento
  const handleAppointmentClick = (appointment: Appointment) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment)
    }
  }

  // Loading iniziale: mostra skeleton completo
  if (loading && !appointments) {
    return (
      <Card
        variant="default"
        className="relative border border-teal-500/30 !bg-transparent [background-image:none!important]"
      >
        <CardHeader className="relative">
          <div className="animate-pulse">
            <div className="bg-background-tertiary h-7 w-48 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-transparent border border-teal-500/20 rounded-lg p-3 grid grid-cols-3 gap-4"
              >
                {/* Tipo appuntamento - Sinistra */}
                <div className="h-4 w-24 bg-background-tertiary rounded animate-pulse" />
                {/* PT Name - Centro */}
                <div className="h-4 w-20 bg-background-tertiary rounded animate-pulse mx-auto" />
                {/* Data/Ora - Destra */}
                <div className="flex items-center justify-end gap-2">
                  <div className="h-4 w-16 bg-background-tertiary rounded animate-pulse" />
                  <div className="h-4 w-12 bg-background-tertiary rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card
        variant="default"
        className="relative border border-teal-500/30 !bg-transparent [background-image:none!important]"
      >
        <CardHeader className="relative">
          <CardTitle size="md" className="text-white">
            Appuntamenti della settimana
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <CalendarIcon size={56} className="text-teal-400/30" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-teal-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              Nessun appuntamento programmato
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              I tuoi prossimi appuntamenti appariranno qui
            </p>
            {onViewAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAll}
                className="mt-2 border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Vedi calendario completo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      variant="default"
      className="relative border-0 !bg-transparent [background-image:none!important]"
    >
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle size="md" className="text-white">
              Appuntamenti della settimana
            </CardTitle>
            {/* Indicatore refresh quando isRefreshing è true */}
            {isRefreshing && (
              <Loader2
                className="h-4 w-4 text-teal-400 animate-spin"
                aria-label="Aggiornamento in corso"
              />
            )}
          </div>
          {onViewAll && (
            <Button
              variant="link"
              size="sm"
              onClick={onViewAll}
              className="text-white hover:text-teal-300"
              disabled={isRefreshing}
            >
              Vedi tutto
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* Overlay semi-trasparente durante refresh */}
        {isRefreshing && appointments && appointments.length > 0 && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-teal-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Aggiornamento...</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {appointments?.slice(0, 3).map((appointment) => (
            <div
              key={appointment.id}
              role="button"
              tabIndex={0}
              onClick={() => !isRefreshing && handleAppointmentClick(appointment)}
              onKeyDown={(e) => {
                if (!isRefreshing && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  handleAppointmentClick(appointment)
                }
              }}
              aria-label={`${appointment.type} con ${appointment.ptName} il ${appointment.day} alle ${appointment.time}`}
              className={`group relative bg-transparent grid grid-cols-3 gap-4 items-center rounded-lg p-3 border border-teal-500/20 hover:border-teal-500/50 transition-all duration-300 ${
                isRefreshing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {/* Tipo di appuntamento - Sinistra */}
              <span className="text-text-primary text-sm font-semibold truncate">
                {appointment.type}
              </span>

              {/* Allenatore - Centro */}
              <span className="text-text-secondary text-sm text-center truncate">
                {appointment.ptName}
              </span>

              {/* Data e ora - Destra */}
              <div className="flex items-center justify-end space-x-2">
                <span className="text-text-primary text-sm font-semibold whitespace-nowrap">
                  {appointment.day}
                </span>
                <span className="text-text-secondary text-sm whitespace-nowrap">
                  {appointment.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
