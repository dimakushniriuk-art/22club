'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { AgendaEvent } from '@/types/agenda-event'
import '@/styles/agenda-animations.css'

const DEFAULT_SLOT_MS = 60 * 60 * 1000

function parseAgendaEndMs(endsAt?: string | null, startsAt?: string | null): number | null {
  if (endsAt) {
    const t = Date.parse(endsAt)
    if (!Number.isNaN(t)) return t
  }
  if (startsAt) {
    const t = Date.parse(startsAt)
    if (!Number.isNaN(t)) return t + DEFAULT_SLOT_MS
  }
  return null
}

function formatRemainingToEnd(ms: number): string {
  if (ms <= 0) return '0'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`
  return `${m}`
}

function AgendaEndsInTimer({
  endsAt,
  startsAt,
}: {
  endsAt?: string | null
  startsAt?: string | null
}) {
  const endMs = useMemo(() => parseAgendaEndMs(endsAt, startsAt), [endsAt, startsAt])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endMs == null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [endMs])

  if (endMs == null) return null

  const remaining = endMs - now
  const done = remaining <= 0
  const value = done ? 'Fine' : formatRemainingToEnd(remaining)

  return (
    <div
      className="flex shrink-0 flex-col items-end justify-center gap-0.5 border-l border-white/10 pl-3 tabular-nums"
      role="status"
      aria-live="polite"
      aria-label={done ? 'Allenamento terminato' : `Fine tra ${value}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
        Fine tra
      </span>
      <span
        className={cn(
          'font-mono text-lg font-bold tabular-nums transition-colors duration-300',
          done ? 'text-text-tertiary' : 'text-cyan-400',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function getTimeStatus(time: string) {
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

function getTimeColor(time: string) {
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

function getTimeRemaining(time: string) {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const [hours, minutes] = time.split(':').map(Number)
  const eventTime = hours * 60 + minutes
  const diff = eventTime - currentTime
  if (diff > 0) {
    const h = Math.floor(diff / 60)
    const mins = diff % 60
    if (h > 0) return `Tra ${h}h ${mins}m`
    return `Tra ${mins}m`
  }
  if (diff > -60) {
    const mins = Math.abs(diff)
    return `${mins}m fa`
  }
  return ''
}

/** Cornice uniforme (stesso spessore del ring), senza barra sinistra. */
const AGENDA_CARD_CYAN_FRAME = 'ring-2 ring-cyan-500/60 ring-offset-2 ring-offset-black/80'

function sortAgendaEventsByStart(a: AgendaEvent, b: AgendaEvent): number {
  const ta = a.starts_at ? Date.parse(a.starts_at) : NaN
  const tb = b.starts_at ? Date.parse(b.starts_at) : NaN
  if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return ta - tb
  if (!Number.isNaN(ta) && Number.isNaN(tb)) return -1
  if (Number.isNaN(ta) && !Number.isNaN(tb)) return 1
  const [ha, ma] = a.time.split(':').map(Number)
  const [hb, mb] = b.time.split(':').map(Number)
  const maOk = Number.isFinite(ha) && Number.isFinite(ma)
  const mbOk = Number.isFinite(hb) && Number.isFinite(mb)
  if (maOk && mbOk) return ha * 60 + ma - (hb * 60 + mb)
  return 0
}

/** Chiave di raggruppo: stesso minuto di inizio (o stessa `time` se senza `starts_at`). */
function getStartTimeGroupKey(event: AgendaEvent): string {
  if (event.starts_at) {
    const t = Date.parse(event.starts_at)
    if (!Number.isNaN(t)) {
      const d = new Date(t)
      d.setSeconds(0, 0)
      d.setMilliseconds(0)
      return d.toISOString()
    }
  }
  return `time:${event.time}`
}

/** Ordine cronologico preservato: ogni gruppo = stesso orario di inizio, atleti in pila. */
function groupAgendaEventsByStartTime(sorted: AgendaEvent[]): AgendaEvent[][] {
  const groups: AgendaEvent[][] = []
  for (const e of sorted) {
    const k = getStartTimeGroupKey(e)
    const last = groups[groups.length - 1]
    if (last && getStartTimeGroupKey(last[0]) === k) {
      last.push(e)
    } else {
      groups.push([e])
    }
  }
  return groups
}

function AgendaEventRowInner({
  event,
  paddingClass = 'px-4 py-4 sm:px-5 sm:py-5',
  trailing,
  rowClassName,
}: {
  event: AgendaEvent
  paddingClass?: string
  trailing?: ReactNode
  /** Es. strip orizzontale: `w-auto min-w-[17rem] shrink-0 max-w-[20rem]` */
  rowClassName?: string
}) {
  const timeStatus = getTimeStatus(event.time)
  const timeRemaining = getTimeRemaining(event.time)
  const isActive = event.status === 'in-progress' || timeStatus === 'starting'
  const isOverdue = timeStatus === 'overdue' || timeStatus === 'late'

  return (
    <>
      {isActive && (
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary animate-pulse" />
      )}
      <div
        className={cn(
          'relative flex min-w-0 items-start gap-2',
          rowClassName ?? 'w-full',
          paddingClass,
        )}
      >
        <div className="flex min-w-[3.25rem] flex-col items-start shrink-0 pt-0.5 tabular-nums">
          <div
            className={cn(
              'font-mono text-lg font-bold transition-colors duration-300',
              getTimeColor(event.time),
              isActive && 'animate-pulse',
            )}
          >
            {event.time}
          </div>
          {timeRemaining ? (
            <div
              className={cn(
                'mt-1 text-xs font-medium',
                isActive ? 'text-warning' : isOverdue ? 'text-state-error' : 'text-text-tertiary',
              )}
            >
              {timeRemaining}
            </div>
          ) : null}
        </div>
        <div className="w-px shrink-0 self-stretch min-h-[3.25rem] bg-border/30" aria-hidden />
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <div className="shrink-0 pt-0.5">
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
            <div className="min-w-0 flex-1 py-0.5">
              <div className="break-words text-base font-bold leading-snug text-text-primary">
                {event.athlete}
              </div>
              <div className="mt-0.5 break-words text-sm leading-snug text-text-secondary">
                {event.description || event.type}
              </div>
            </div>
          </div>
          {trailing}
        </div>
      </div>
    </>
  )
}

/** Riepilogo atleta sopra iframe: stesso contenuto della riga agenda, senza cornice. */
export function AgendaSelectedAthleteSummary({ event }: { event: AgendaEvent }) {
  return (
    <div className="relative mb-3 w-full min-w-0 shrink-0">
      <AgendaEventRowInner
        event={event}
        paddingClass="px-4 py-4 sm:px-5 sm:py-5"
        trailing={<AgendaEndsInTimer endsAt={event.ends_at} startsAt={event.starts_at} />}
      />
    </div>
  )
}

export type AgendaTimelineCompactProps = {
  events: AgendaEvent[]
  loading?: boolean
  /** Tap su riga con athlete_id (es. apri preview embed). */
  onSelectEvent?: (event: AgendaEvent) => void
  /** Evidenzia righe i cui athlete_id sono nei due slot iframe. */
  selectedAthleteIds?: string[]
  /**
   * `vertical`: elenco classico.
   * `horizontalStrip`: una riga con scroll orizzontale; una colonna per fascia oraria; stesso orario = card impilate in verticale.
   */
  layout?: 'vertical' | 'horizontalStrip'
}

/** Solo elenco compatto: ora + riga atleta / tipo (stessa card dell’agenda, senza header né azioni). */
const STRIP_ROW_INNER =
  'w-auto min-w-[min(21rem,90vw)] max-w-[26rem] shrink-0 sm:min-w-[22rem] sm:max-w-[26rem]'

const STRIP_COLUMN_CELL_INNER = 'w-full min-w-0'

/** `py-1` + `px-0.5`: evita che `ring` / `ring-offset` della selezione vengano tagliati da overflow. */
const STRIP_COLUMN_WIDTH =
  'flex w-[min(21rem,90vw)] shrink-0 flex-col gap-2 px-0.5 py-1 sm:w-[22rem] sm:max-w-[26rem]'

function renderCompactEventCard(
  event: AgendaEvent,
  index: number,
  selectedAthleteIds: string[] | undefined,
  onSelectEvent: ((event: AgendaEvent) => void) | undefined,
  options: { strip?: boolean; stripColumnCell?: boolean },
) {
  const athleteKey = event.athlete_id?.trim() ?? ''
  const isSelected = Boolean(athleteKey && selectedAthleteIds?.includes(athleteKey))
  const isClickable = Boolean(athleteKey && onSelectEvent)
  const isStrip = Boolean(options.strip || options.stripColumnCell)

  const cardClass = cn(
    'group relative min-w-0 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20',
    options.stripColumnCell ? 'w-full' : options.strip ? 'shrink-0' : 'w-full',
    isClickable && 'cursor-pointer active:scale-[0.99]',
    isSelected && AGENDA_CARD_CYAN_FRAME,
  )
  const cardStyle = {
    animationDelay: `${index * 100}ms`,
    animation: 'fadeInUp 0.5s ease-out forwards',
  } as const

  const rowClassName = options.stripColumnCell
    ? STRIP_COLUMN_CELL_INNER
    : options.strip
      ? STRIP_ROW_INNER
      : undefined

  const cardBody = (
    <AgendaEventRowInner
      event={event}
      paddingClass={isStrip ? 'px-3 py-3 sm:px-4 sm:py-3.5' : undefined}
      rowClassName={rowClassName}
    />
  )

  if (isClickable) {
    return (
      <button
        key={event.id}
        type="button"
        className={cn(
          cardClass,
          'p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        )}
        style={cardStyle}
        aria-label={`Apri vista allenamenti di ${event.athlete}`}
        onClick={() => onSelectEvent?.(event)}
      >
        {cardBody}
      </button>
    )
  }

  return (
    <div key={event.id} className={cardClass} style={cardStyle}>
      {cardBody}
    </div>
  )
}

export function AgendaTimelineCompact({
  events,
  loading = false,
  onSelectEvent,
  selectedAthleteIds,
  layout = 'vertical',
}: AgendaTimelineCompactProps) {
  const sortedEvents = useMemo(() => [...events].sort(sortAgendaEventsByStart), [events])

  const timeGroups = useMemo(() => groupAgendaEventsByStartTime(sortedEvents), [sortedEvents])

  const stripAnimIndexByEventId = useMemo(() => {
    const map = new Map<string, number>()
    let i = 0
    for (const g of timeGroups) {
      for (const e of g) {
        map.set(e.id, i)
        i += 1
      }
    }
    return map
  }, [timeGroups])

  if (loading) {
    if (layout === 'horizontalStrip') {
      return (
        <div className="flex min-h-0 min-w-0 flex-nowrap items-center gap-2 overflow-x-auto px-1 py-2.5 pb-3 sm:gap-3 sm:px-2 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
          {[1, 2, 3].map((col) => (
            <div key={col} className={cn(STRIP_COLUMN_WIDTH, 'animate-pulse')}>
              <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                <div className="h-6 w-12 rounded bg-white/10" />
                <div className="h-8 w-8 rounded-full bg-white/10" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="h-3 w-20 rounded bg-white/10" />
                </div>
              </div>
              {col === 1 ? (
                <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                  <div className="h-6 w-12 rounded bg-white/10" />
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-white/10" />
                    <div className="h-3 w-20 rounded bg-white/10" />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="space-y-3 px-1 sm:space-y-4 sm:px-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-4 sm:px-5 sm:py-5"
          >
            <div className="h-6 w-14 rounded bg-white/10" />
            <div className="h-8 w-8 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-3 w-24 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sortedEvents.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-8 px-2">Nessun appuntamento oggi</p>
    )
  }

  if (layout === 'horizontalStrip') {
    return (
      <div className="flex min-h-0 min-w-0 flex-nowrap items-center gap-2 overflow-x-auto px-1 py-2.5 pb-3 sm:gap-3 sm:px-2 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        {timeGroups.map((group) => {
          const colKey = getStartTimeGroupKey(group[0])
          return (
            <div key={colKey} className={STRIP_COLUMN_WIDTH}>
              {group.map((event) =>
                renderCompactEventCard(
                  event,
                  stripAnimIndexByEventId.get(event.id) ?? 0,
                  selectedAthleteIds,
                  onSelectEvent,
                  { stripColumnCell: true },
                ),
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3 px-1 pb-1 sm:space-y-4 sm:px-1.5 sm:pb-2">
      {sortedEvents.map((event, index) =>
        renderCompactEventCard(event, index, selectedAthleteIds, onSelectEvent, { strip: false }),
      )}
    </div>
  )
}
