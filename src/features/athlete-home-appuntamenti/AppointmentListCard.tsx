'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui'
import type { AppointmentUI } from '@/types/appointment'
import { formatDateLong, formatTime, formatDateTime } from '@/lib/format'
import { getStatusColor, getStatusText, isValidAppointmentDate } from './utils'
import type { AppointmentStatus } from './utils'
import { Calendar, Clock, MapPin, User, MessageSquare } from 'lucide-react'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline'
  | 'secondary'
  | 'primary'

interface AppointmentListCardProps {
  appointment: AppointmentUI
  variant: 'future' | 'past'
  onClick: (appointment: AppointmentUI, event: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown: (appointment: AppointmentUI, event: React.KeyboardEvent<HTMLDivElement>) => void
}

function AppointmentListCardComponent({
  appointment,
  variant,
  onClick,
  onKeyDown,
}: AppointmentListCardProps) {
  const status = (appointment.status || 'attivo') as AppointmentStatus
  const statusColor = getStatusColor(status) as BadgeVariant
  const statusText = getStatusText(status)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => onClick(appointment, e)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => onKeyDown(appointment, e)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`appointment-row-${appointment.id}`}
      className="rounded-lg border border-white/10 bg-white/[0.04] space-y-2 p-3 hover:border-white/20 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        {variant === 'future' ? (
          <h3 className="text-text-primary text-sm font-semibold truncate flex-1 min-w-0">
            {appointment.type}
          </h3>
        ) : (
          <h4 className="text-text-primary text-sm font-semibold truncate flex-1 min-w-0">
            {appointment.type || 'Allenamento'}
          </h4>
        )}
        <Badge variant={statusColor} size="sm" className="text-[10px] shrink-0">
          {statusText}
        </Badge>
      </div>
      <div className="text-text-secondary text-[10px] space-y-1.5">
        {variant === 'future' && (
          <>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-cyan-400 shrink-0" />
              <p className="font-medium text-text-primary truncate">
                {formatDateLong(appointment.starts_at)}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-cyan-400 shrink-0" />
              <p className="truncate">
                {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
              </p>
            </div>
            {appointment.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                <p className="truncate">{appointment.location}</p>
              </div>
            )}
            {appointment.trainer_name && (
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-cyan-400 shrink-0" />
                <p className="truncate">con {appointment.trainer_name}</p>
              </div>
            )}
            {appointment.notes && (
              <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded-lg bg-white/5 border border-white/10">
                <MessageSquare className="h-3 w-3 text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-[10px] line-clamp-2 text-text-secondary">{appointment.notes}</p>
              </div>
            )}
          </>
        )}
        {variant === 'past' && (
          <>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-cyan-400 shrink-0" />
              <p className="truncate">
                {formatDateLong(appointment.starts_at)} • {formatTime(appointment.starts_at)} -{' '}
                {formatTime(appointment.ends_at)}
              </p>
            </div>
            {appointment.trainer_name && (
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-cyan-400 shrink-0" />
                <p className="truncate">con {appointment.trainer_name}</p>
              </div>
            )}
            {appointment.cancelled_at && isValidAppointmentDate(appointment.cancelled_at) && (
              <p className="text-state-error text-[10px] mt-1">
                Annullato il {formatDateTime(appointment.cancelled_at)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export const AppointmentListCard = memo(AppointmentListCardComponent)
