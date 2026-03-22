'use client'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui'
import { useModalActions } from './modals-wrapper'
import {
  Trash2,
  Dumbbell,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Edit,
  Play,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { createLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { RescheduleAppointmentModal } from './reschedule-appointment-modal'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import '@/styles/agenda-animations.css'

const logger = createLogger('components:dashboard:agenda-timeline')

interface AgendaEvent {
  id: string
  time: string
  athlete: string
  athlete_id?: string // ID dell'atleta per navigazione
  athlete_avatar?: string | null // Avatar/foto profilo dell'atleta
  type: 'allenamento' | 'appuntamento' | 'consulenza'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'annullato'
  description?: string
  starts_at?: string // Data/ora inizio per riprogrammamento
  ends_at?: string // Data/ora fine per riprogrammamento
  /** Lezioni rimanenti atleta (visualizzazione in agenda) */
  lessons_remaining?: number
}

interface AgendaTimelineProps {
  events: AgendaEvent[]
  loading?: boolean
  onAddAppointment?: () => void
  onStartWorkout?: (eventId: string) => void
  onDeleteAppointment?: (eventId: string) => void
  onCompleteAppointment?: (eventId: string) => void
  onViewProfile?: (athleteId: string, athleteName: string) => void
  onEditAppointment?: (event: AgendaEvent) => void
}

export function AgendaTimeline({
  events,
  loading = false,
  onAddAppointment,
  onStartWorkout,
  onDeleteAppointment,
  onCompleteAppointment,
  onViewProfile,
  onEditAppointment,
}: AgendaTimelineProps) {
  const { openAppointment, isAvailable } = useModalActions()
  const router = useRouter()
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [eventToComplete, setEventToComplete] = useState<string | null>(null)

  // Usa modal action se disponibile, altrimenti fallback a prop
  // Il bottone è visibile se onAddAppointment è fornito O se openAppointment è disponibile dal context
  const handleAddAppointment = () => {
    logger.debug('handleAddAppointment called', undefined, {
      onAddAppointment: !!onAddAppointment,
      isAvailable,
    })
    if (onAddAppointment) {
      logger.debug('using onAddAppointment prop')
      onAddAppointment()
    } else if (isAvailable && openAppointment && typeof openAppointment === 'function') {
      logger.debug('Opening appointment modal via context')
      try {
        openAppointment()
      } catch (error) {
        logger.error('error calling openAppointment', error)
        // Fallback: naviga alla pagina calendario
        router.push('/dashboard/calendario?new=true')
      }
    } else {
      logger.warn('No appointment handler available, using fallback')
      // Fallback: naviga alla pagina calendario
      router.push('/dashboard/calendario?new=true')
    }
  }

  const handleDelete = (eventId: string) => {
    if (onDeleteAppointment) {
      // La conferma è gestita dal ConfirmDialog nel componente parent
      onDeleteAppointment(eventId)
    }
  }

  const handleViewSchede = (event: AgendaEvent) => {
    if (event.athlete_id) {
      // Naviga alla pagina schede filtrata per atleta
      router.push(`/dashboard/schede?athlete_id=${event.athlete_id}`)
    } else {
      // Fallback: naviga alla pagina schede e cerca per nome atleta
      router.push(`/dashboard/schede?athlete=${encodeURIComponent(event.athlete)}`)
    }
  }

  const handleReschedule = (event: AgendaEvent) => {
    setSelectedEvent(event)
    setRescheduleModalOpen(true)
  }

  const handleRescheduleSuccess = () => {
    // Rimuoviamo router.refresh() - Next.js aggiorna automaticamente dopo la navigazione
    // router.refresh()
    // Chiudi il modal invece
    setRescheduleModalOpen(false)
  }

  const handleViewProfile = (event: AgendaEvent) => {
    if (onViewProfile && event.athlete_id) {
      onViewProfile(event.athlete_id, event.athlete)
    } else if (event.athlete_id) {
      router.push(`/dashboard/atleti/${event.athlete_id}`)
    }
  }

  const handleComplete = (eventId: string) => {
    if (onCompleteAppointment) {
      setEventToComplete(eventId)
      setCompleteDialogOpen(true)
    }
  }

  const handleCompleteConfirm = () => {
    if (eventToComplete && onCompleteAppointment) {
      onCompleteAppointment(eventToComplete)
      setCompleteDialogOpen(false)
      setEventToComplete(null)
    }
  }

  const handleEdit = (event: AgendaEvent) => {
    if (onEditAppointment) {
      onEditAppointment(event)
    } else {
      // Fallback: apri modal riprogramma
      handleReschedule(event)
    }
  }

  const handleStartWorkout = (event: AgendaEvent) => {
    if (onStartWorkout) {
      onStartWorkout(event.id)
    } else if (event.athlete_id) {
      // Fallback: naviga a schede
      handleViewSchede(event)
    }
  }
  // Prepara le icone per gli eventi
  // Funzione per determinare lo stato temporale
  const getTimeStatus = (time: string) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [hours, minutes] = time.split(':').map(Number)
    const eventTime = hours * 60 + minutes

    const diff = eventTime - currentTime

    if (diff < -30) return 'overdue' // In ritardo di più di 30 minuti
    if (diff < 0) return 'late' // In ritardo
    if (diff < 15) return 'starting' // Sta per iniziare (entro 15 minuti)
    return 'upcoming' // Futuro
  }

  const getTimeColor = (time: string) => {
    const timeStatus = getTimeStatus(time)
    switch (timeStatus) {
      case 'overdue':
      case 'late':
        return 'text-state-error'
      case 'starting':
        return 'text-warning'
      default:
        return 'text-primary'
    }
  }

  // Statistiche dell'agenda
  const stats = useMemo(
    () => ({
      total: events.length,
      completed: events.filter((e) => e.status === 'completed').length,
      inProgress: events.filter((e) => e.status === 'in-progress').length,
      scheduled: events.filter((e) => e.status === 'scheduled').length,
      cancelled: events.filter((e) => e.status === 'cancelled').length,
    }),
    [events],
  )

  const summaryCards = useMemo(() => {
    const cards: Array<{ label: string; value: number; icon: ReactNode; valueClass: string }> = [
      {
        label: 'Totali',
        value: stats.total,
        icon: <Calendar className="h-4 w-4 text-primary" />,
        valueClass: 'text-primary',
      },
      {
        label: 'Completati',
        value: stats.completed,
        icon: <CheckCircle className="h-4 w-4 text-success" />,
        valueClass: 'text-success',
      },
      {
        label: 'In corso',
        value: stats.inProgress,
        icon: <Clock className="h-4 w-4 text-warning" />,
        valueClass: 'text-warning',
      },
      {
        label: 'Programm.',
        value: stats.scheduled,
        icon: <CalendarDays className="h-4 w-4 text-text-secondary" />,
        valueClass: 'text-text-primary',
      },
      {
        label: 'Cancellati',
        value: stats.cancelled,
        icon: <XCircle className="h-4 w-4 text-state-error" />,
        valueClass: 'text-state-error',
      },
    ]
    return cards.filter((card) => card.value > 0)
  }, [stats])

  // Funzione per ottenere il tempo rimanente
  const getTimeRemaining = (time: string) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [hours, minutes] = time.split(':').map(Number)
    const eventTime = hours * 60 + minutes

    const diff = eventTime - currentTime

    if (diff > 0) {
      const hours = Math.floor(diff / 60)
      const mins = diff % 60
      if (hours > 0) return `Tra ${hours}h ${mins}m`
      return `Tra ${mins}m`
    } else if (diff > -60) {
      const mins = Math.abs(diff)
      return `${mins}m fa`
    }
    return ''
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 md:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-pulse h-9 w-9 rounded-lg bg-white/10" />
            <div className="space-y-2">
              <div className="animate-pulse h-5 w-32 rounded bg-white/10" />
              <div className="animate-pulse h-3 w-48 rounded bg-white/10" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="animate-pulse h-8 w-16 rounded-lg bg-white/10" />
            <div className="animate-pulse h-8 w-16 rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-white/10 bg-black/20 flex items-center gap-4 p-4"
            >
              <div className="h-6 w-14 rounded bg-white/10" />
              <div className="h-8 w-8 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="h-3 w-24 rounded bg-white/10" />
              </div>
              <div className="h-8 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 sm:p-8 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Calendar className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Agenda di oggi</h2>
        <p className="text-sm text-text-secondary max-w-md">
          Non hai appuntamenti programmati per oggi. Aggiungine uno per iniziare la giornata.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddAppointment}
            aria-label="Crea nuovo appuntamento"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Nuovo Appuntamento
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/appuntamenti')}
            className="border-white/20 hover:bg-white/5 hover:border-white/30"
            aria-label="Visualizza calendario completo"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendario
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative transition-all duration-200">
      <div className="relative p-4 sm:p-5 md:p-6">
        {/* Header — stile DS: titolo + descrizione, summary con token bordo/sfumatura */}
        <div className="mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-text-primary truncate">
                  Agenda di oggi
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary">
                  I tuoi appuntamenti e sessioni
                </p>
              </div>
            </div>
            {false && handleAddAppointment && (
              <Button variant="primary" size="sm" onClick={handleAddAppointment}>
                Nuovo Appuntamento
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 px-3 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
              >
                {card.icon}
                <span className={`${card.valueClass} text-sm font-semibold`}>{card.value}</span>
                <span className="text-text-secondary text-xs">{card.label.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events List — space-y-3 tra card (regole progetto), card con bordo DS e accento stato */}
        <div className="space-y-3">
          {events.map((event, index) => {
            const timeStatus = getTimeStatus(event.time)
            const timeRemaining = getTimeRemaining(event.time)
            const isActive = event.status === 'in-progress' || timeStatus === 'starting'
            const isOverdue = timeStatus === 'overdue' || timeStatus === 'late'

            const getStatusBorderClass = () => {
              switch (event.status) {
                case 'completed':
                  return 'border-l-4 border-l-success/50'
                case 'in-progress':
                  return 'border-l-4 border-l-primary/50'
                case 'annullato':
                case 'cancelled':
                  return 'border-l-4 border-l-state-error/50'
                default:
                  return ''
              }
            }

            return (
              <div
                key={event.id}
                className={cn(
                  'group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20',
                  getStatusBorderClass(),
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                }}
              >
                {/* Pulsing indicator for active events */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary animate-pulse" />
                )}

                <div className="relative flex items-center gap-4 p-4">
                  {/* Rimasti - centrato orizzontalmente e verticalmente nella riga */}
                  {typeof event.lessons_remaining === 'number' && (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                      <span
                        className={cn(
                          'text-2xl font-bold tabular-nums',
                          event.lessons_remaining >= 6 && 'text-[#00C781]',
                          event.lessons_remaining >= 2 &&
                            event.lessons_remaining <= 4 &&
                            'text-[#FFC107]',
                          event.lessons_remaining <= 1 && 'text-[#FF3B30]',
                        )}
                      >
                        {event.lessons_remaining}
                      </span>
                    </div>
                  )}

                  {/* Time section - più prominente */}
                  <div className="flex min-w-[85px] flex-col items-start">
                    <div
                      className={`font-mono text-lg font-bold transition-colors duration-300 ${getTimeColor(event.time)} ${
                        isActive ? 'animate-pulse' : ''
                      }`}
                    >
                      {event.time}
                    </div>
                    {timeRemaining && (
                      <div
                        className={`mt-1 text-xs font-medium ${
                          isActive
                            ? 'text-warning'
                            : isOverdue
                              ? 'text-state-error'
                              : 'text-text-tertiary'
                        }`}
                      >
                        {timeRemaining}
                      </div>
                    )}
                  </div>

                  {/* Separator verticale */}
                  <div className="h-12 w-px bg-border/30"></div>

                  {/* Content section - migliorato */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="flex-shrink-0">
                        <div className="relative inline-block">
                          <div className="absolute -inset-0.5 rounded-full bg-primary/40 blur-[2px]" />
                          <div className="relative">
                            <Avatar
                              src={event.athlete_avatar}
                              alt={event.athlete}
                              fallbackText={
                                event.athlete
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2) || '?'
                              }
                              size="md"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-bold text-text-primary truncate">
                          {event.athlete}
                        </div>
                        <div className="text-sm text-text-secondary truncate">
                          {event.description || event.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - migliorati e organizzati, con etichette sotto le icone */}
                  <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                    {/* Button Visualizza Profilo Atleta */}
                    <Button
                      variant="ghost"
                      onClick={() => handleViewProfile(event)}
                      className="rounded-full p-3 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[52px]"
                      aria-label={`Visualizza profilo di ${event.athlete}`}
                      title={`Profilo di ${event.athlete}`}
                    >
                      <div className="h-5 w-5">
                        <User className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-medium text-text-secondary leading-tight">
                        Profilo
                      </span>
                    </Button>

                    {/* Button Schede Allenamento */}
                    <Button
                      variant="ghost"
                      onClick={() => handleViewSchede(event)}
                      className="rounded-full p-3 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[52px]"
                      aria-label={`Visualizza schede di allenamento di ${event.athlete}`}
                      title={`Schede di ${event.athlete}`}
                    >
                      <div className="h-5 w-5">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-medium text-text-secondary leading-tight">
                        Schede
                      </span>
                    </Button>

                    {/* Bottoni Condizionali basati su stato */}
                    {false && event.status === 'scheduled' && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => handleStartWorkout(event)}
                          className="rounded-full p-3 bg-success/10 text-success hover:bg-success/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[52px]"
                          aria-label={`Inizia allenamento con ${event.athlete}`}
                          title="Inizia allenamento"
                        >
                          <div className="h-5 w-5">
                            <Play className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-medium text-text-secondary leading-tight">
                            Inizia
                          </span>
                        </Button>
                      </>
                    )}

                    {event.status === 'in-progress' && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => handleComplete(event.id)}
                          className="rounded-full p-3 bg-success/10 text-success hover:bg-success/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[52px]"
                          aria-label={`Completa appuntamento con ${event.athlete}`}
                          title="Completa appuntamento"
                        >
                          <div className="h-5 w-5">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-medium text-text-secondary leading-tight">
                            Completa
                          </span>
                        </Button>
                      </>
                    )}

                    {/* Button Modifica/Riprogramma */}
                    {(event.status === 'scheduled' || event.status === 'in-progress') && (
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(event)}
                        className="rounded-full p-3 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[52px]"
                        aria-label={`Modifica appuntamento con ${event.athlete}`}
                        title="Modifica appuntamento"
                      >
                        <div className="h-5 w-5">
                          <Edit className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-medium text-text-secondary leading-tight">
                          Modifica
                        </span>
                      </Button>
                    )}

                    {/* Button Elimina */}
                    {onDeleteAppointment && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(event.id)}
                        className="rounded-full p-3 bg-state-error/10 text-state-error hover:bg-state-error/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[52px]"
                        aria-label={`Elimina appuntamento con ${event.athlete}`}
                        title="Elimina appuntamento"
                      >
                        <div className="h-5 w-5">
                          <Trash2 className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-medium text-text-secondary leading-tight">
                          Elimina
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Riprogramma Appuntamento */}
      <RescheduleAppointmentModal
        open={rescheduleModalOpen}
        onOpenChange={setRescheduleModalOpen}
        appointmentId={selectedEvent?.id || null}
        currentStart={selectedEvent?.starts_at}
        currentEnd={selectedEvent?.ends_at}
        athleteName={selectedEvent?.athlete}
        onSuccess={handleRescheduleSuccess}
      />

      {/* Modal Conferma Completamento */}
      <ConfirmDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        title="Completa appuntamento"
        description="Segnare questo appuntamento come completato?"
        confirmText="Completa"
        cancelText="Annulla"
        variant="default"
        onConfirm={handleCompleteConfirm}
      />
    </div>
  )
}
