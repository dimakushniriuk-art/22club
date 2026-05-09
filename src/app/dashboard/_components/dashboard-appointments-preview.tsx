'use client'

import type { AppointmentTable } from '@/types/appointment'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const PREVIEW_MAX = 10

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return { time, dateStr }
}

function getStatusColorClasses(status: string) {
  switch (status?.toLowerCase()) {
    case 'completato':
    case 'completed':
      return 'border-l-4 border-l-green-500/50'
    case 'attivo':
    case 'active':
      return 'border-l-4 border-l-primary/50'
    case 'annullato':
    case 'cancelled':
      return 'border-l-4 border-l-orange-500/50'
    default:
      return 'border-l-4 border-l-white/20'
  }
}

function getAppointmentType(apt: AppointmentTable) {
  if (apt.type === 'allenamento') return 'Allenamento'
  if (apt.type === 'prova') return 'Prova'
  if (apt.type === 'valutazione') return 'Valutazione'
  return 'Appuntamento'
}

function statusLabel(appointment: AppointmentTable) {
  const s = appointment.status?.toLowerCase() || ''
  if (s === 'completato' || s === 'completed') return 'Completata'
  if (s === 'annullato' || s === 'cancelled') return 'Annullata'
  return 'Attiva'
}

function PreviewRow({ appointment, index }: { appointment: AppointmentTable; index: number }) {
  const { time, dateStr } = formatDateTime(appointment.starts_at)
  const { time: endTime } = formatDateTime(appointment.ends_at)
  const status = appointment.status?.toLowerCase() || 'attivo'
  const isActive = status === 'attivo' || status === 'active'
  const pillClass = isActive
    ? 'rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium px-3 py-1 shrink-0'
    : 'rounded-full bg-background-tertiary/50 border border-white/10 text-text-tertiary text-xs font-medium px-3 py-1 shrink-0'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        getStatusColorClasses(appointment.status ?? ''),
      )}
      style={{
        animationDelay: `${index * 40}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      <div className="relative flex items-center gap-3 p-3 sm:p-4">
        <div className="flex min-w-[100px] flex-col items-start sm:min-w-[120px]">
          <div className="mb-0.5 text-xs text-text-secondary">{dateStr}</div>
          <div className="font-mono text-[15px] font-bold tabular-nums text-blue-400 sm:text-lg">
            {time} - {endTime}
          </div>
        </div>
        <div className="h-10 w-px bg-border/30" />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative inline-block shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-blue-500/60 via-purple-500/60 to-cyan-500/60 blur-[2px]" />
            <div className="relative">
              <Avatar
                src={appointment.athlete_avatar_url?.trim() || null}
                alt={appointment.athlete_name || 'Atleta'}
                fallbackText={
                  appointment.athlete_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2) || '?'
                }
                size="md"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-text-primary sm:text-base">
              {appointment.athlete_name || 'Atleta'}
            </div>
            <div className="truncate text-xs text-text-secondary sm:text-sm">
              {getAppointmentType(appointment)}
            </div>
          </div>
        </div>
        <span className={pillClass}>{statusLabel(appointment)}</span>
      </div>
    </div>
  )
}

type DashboardAppointmentsPreviewProps = {
  appointments: AppointmentTable[]
}

/**
 * Anteprima statica (nessuna azione su riga): solo look & feel della lista appuntamenti.
 */
export function DashboardAppointmentsPreview({ appointments }: DashboardAppointmentsPreviewProps) {
  const slice = appointments.slice(0, PREVIEW_MAX)
  const rest = appointments.length - slice.length

  if (slice.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-black/20 px-4 py-8 text-center">
        <p className="text-sm text-text-secondary">Nessun appuntamento in elenco.</p>
        <p className="mt-2 text-xs text-text-tertiary">Apri la pagina per crearne di nuovi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {slice.map((apt, i) => (
        <PreviewRow key={apt.id} appointment={apt} index={i} />
      ))}
      {rest > 0 ? (
        <p className="text-center text-xs text-text-tertiary">
          + altri {rest} in pagina Appuntamenti
        </p>
      ) : null}
    </div>
  )
}
