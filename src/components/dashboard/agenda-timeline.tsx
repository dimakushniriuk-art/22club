'use client'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui'
import { useModalActions } from './modals-wrapper'
import { Calendar, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import '@/styles/agenda-animations.css'
import type { AgendaEvent } from '@/types/agenda-event'

const logger = createLogger('components:dashboard:agenda-timeline')

function getAthleteNameLines(athlete: string): { nome: string; cognome: string } {
  const t = athlete.trim()
  if (!t) return { nome: 'Atleta', cognome: '' }
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { nome: parts[0]!, cognome: '' }
  return { nome: parts[0]!, cognome: parts.slice(1).join(' ') }
}

function formatLocalHHmm(iso: string | undefined): string | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return undefined
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const EMBEDDED_LIST_CLASS =
  'w-full flex-1 space-y-2 overflow-y-auto overscroll-contain min-h-[12rem] max-h-[min(52vh,440px)] lg:min-h-[14rem]'

const EMBEDDED_ROW_CLASS =
  'rounded-lg border border-white/5 bg-black/25 px-3 py-2.5 transition-colors hover:border-white/12 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30'

export interface AgendaTimelineProps {
  events: AgendaEvent[]
  loading?: boolean
  onAddAppointment?: () => void
  /** Colonna dashboard: righe compatte allineate agli altri widget */
  embedded?: boolean
}

export function AgendaTimeline({
  events,
  loading = false,
  onAddAppointment,
  embedded = false,
}: AgendaTimelineProps) {
  const { openAppointment, isAvailable } = useModalActions()
  const router = useRouter()

  const handleAddAppointment = () => {
    logger.debug('handleAddAppointment called', undefined, {
      onAddAppointment: !!onAddAppointment,
      isAvailable,
    })
    if (onAddAppointment) {
      onAddAppointment()
    } else if (isAvailable && openAppointment && typeof openAppointment === 'function') {
      try {
        openAppointment()
      } catch (error) {
        logger.error('error calling openAppointment', error)
        router.push('/dashboard/calendario?new=true')
      }
    } else {
      logger.warn('No appointment handler available, using fallback')
      router.push('/dashboard/calendario?new=true')
    }
  }

  const getTimeStatus = (time: string) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [hours, minutes] = time.split(':').map(Number)
    const eventTime = hours * 60 + minutes
    const diff = eventTime - currentTime
    if (diff < -30) return 'overdue'
    if (diff < 0) return 'late'
    if (diff < 15) return 'starting'
    return 'upcoming'
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

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 md:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="animate-pulse h-9 w-9 rounded-lg bg-white/10" />
          <div className="space-y-2">
            <div className="animate-pulse h-5 w-32 rounded bg-white/10" />
            <div className="animate-pulse h-3 w-48 rounded bg-white/10" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/10" />
              </div>
              <div className="shrink-0 space-y-2 text-right">
                <div className="ml-auto h-5 w-12 rounded bg-white/10" />
                <div className="ml-auto h-4 w-12 rounded bg-white/10" />
              </div>
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
        <p className="max-w-md text-sm text-text-secondary">
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
            className="border-white/20 hover:border-white/30 hover:bg-white/5"
            aria-label="Visualizza calendario completo"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendario
          </Button>
        </div>
      </div>
    )
  }

  const listWrapperClass = embedded ? EMBEDDED_LIST_CLASS : 'space-y-3'

  return (
    <div className={cn('relative transition-all duration-200', embedded && 'min-h-0 flex flex-1 flex-col')}>
      <div
        className={cn(
          'relative',
          !embedded && 'p-4 sm:p-5 md:p-6',
          embedded && 'flex min-h-0 flex-1 flex-col',
        )}
      >
        {!embedded && (
          <div className="mb-3 sm:mb-4">
            <h2 className="text-xs font-medium text-text-secondary sm:text-sm">I tuoi appuntamenti di oggi</h2>
          </div>
        )}

        <div className={listWrapperClass}>
          {events.map((event, index) => {
            const timeStatus = getTimeStatus(event.time)
            const isActive = event.status === 'in-progress' || timeStatus === 'starting'
            const isOverdue = timeStatus === 'overdue' || timeStatus === 'late'
            const { nome: athleteNome, cognome: athleteCognome } = getAthleteNameLines(event.athlete)
            const endTimeLabel = formatLocalHHmm(event.ends_at)

            const rowInner = (
              <div className={cn('flex items-center', embedded ? 'gap-2.5' : 'gap-3', !embedded && 'p-4')}>
                <div className="shrink-0">
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
                    size={embedded ? 'sm' : 'md'}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <div
                    className={cn(
                      'truncate font-semibold leading-tight text-text-primary',
                      embedded ? 'text-sm' : 'text-base font-bold',
                    )}
                  >
                    {athleteNome}
                  </div>
                  {athleteCognome !== '' ? (
                    <div className="truncate text-xs leading-tight text-text-secondary">{athleteCognome}</div>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end justify-center gap-0.5 tabular-nums">
                  {embedded ? (
                    <div
                      className={cn(
                        'font-mono text-sm font-semibold leading-tight transition-colors duration-300',
                        getTimeColor(event.time),
                        isActive ? 'animate-pulse' : '',
                      )}
                    >
                      {endTimeLabel ? `${event.time} – ${endTimeLabel}` : event.time}
                    </div>
                  ) : (
                    <>
                      <div
                        className={cn(
                          'font-mono font-bold leading-none transition-colors duration-300',
                          'text-lg',
                          getTimeColor(event.time),
                          isActive ? 'animate-pulse' : '',
                        )}
                      >
                        {event.time}
                      </div>
                      <div
                        className={cn(
                          'font-mono leading-none text-text-secondary text-xs sm:text-sm',
                          isOverdue && endTimeLabel && 'text-text-tertiary',
                        )}
                      >
                        {endTimeLabel ?? '—'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )

            if (embedded) {
              return (
                <Link
                  key={event.id}
                  href="/dashboard/calendario"
                  prefetch
                  className={cn(EMBEDDED_ROW_CLASS, 'block')}
                  aria-label={`Appuntamento ${event.athlete}, ${event.time}${endTimeLabel ? ` – ${endTimeLabel}` : ''}`}
                >
                  {rowInner}
                </Link>
              )
            }

            return (
              <div
                key={event.id}
                className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                }}
              >
                {rowInner}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
