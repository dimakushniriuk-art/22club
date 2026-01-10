'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { User, Calendar, Clock, FileText, X, Edit, Ban, Trash2, Repeat } from 'lucide-react'
import type { AppointmentUI } from '@/types/appointment'
import { deserializeRecurrence } from '@/lib/recurrence-utils'

interface AppointmentDetailProps {
  appointment: AppointmentUI
  onEdit?: () => void
  onCancel?: () => void
  onDelete?: () => void
  onClose?: () => void
  loading?: boolean
}

export function AppointmentDetail({
  appointment,
  onEdit,
  onCancel,
  onDelete,
  onClose,
  loading = false,
}: AppointmentDetailProps) {
  const getStatusColor = (status?: string) => {
    if (!status) return 'default'
    switch (status.toLowerCase()) {
      case 'attivo':
        return 'success'
      case 'annullato':
      case 'cancelled':
        return 'error'
      case 'completato':
      case 'completed':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusText = (status?: string) => {
    if (!status) return 'Sconosciuto'
    switch (status.toLowerCase()) {
      case 'attivo':
      case 'active':
        return 'Attivo'
      case 'annullato':
      case 'cancelled':
        return 'Annullato'
      case 'completato':
      case 'completed':
        return 'Completato'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Estrai tipo appuntamento dalle note
  const getAppointmentType = (): string => {
    if (appointment.notes?.includes('Prima Visita')) return 'Prima Visita'
    if (appointment.notes?.includes('Massaggio')) return 'Massaggio'
    if (appointment.notes?.includes('Nutrizionista')) return 'Nutrizionista'
    if (appointment.type === 'prova') return 'Prova'
    if (appointment.type === 'valutazione') return 'Valutazione'
    return 'Allenamento'
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const startTime = appointment.starts_at
  const endTime = appointment.ends_at
  const status = appointment.status || 'attivo'

  const { date, time } = startTime ? formatDateTime(startTime) : { date: '', time: '' }
  const endTimeFormatted = endTime
    ? new Date(endTime).toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const isEditable = status === 'attivo'
  const isCancelled = status === 'annullato'

  return (
    <Card
      variant="trainer"
      className="relative w-full max-w-md overflow-hidden bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(2,179,191,0.3)] backdrop-blur-xl"
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-primary/5 z-0" />

      <CardHeader className="relative z-10 border-b border-primary/20 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle size="lg" className="flex items-center gap-2 text-primary font-medium">
            <Calendar className="h-5 w-5" />
            Dettagli Appuntamento
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-text-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-6">
        <div className="space-y-5">
          {/* Header Atleta */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-primary/20 text-primary rounded-full p-3 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary text-lg font-semibold truncate">
                  {appointment.athlete_name || 'Atleta Sconosciuto'}
                </h3>
                <p className="text-text-secondary text-sm mt-0.5">{getAppointmentType()}</p>
              </div>
            </div>
            <Badge
              variant={
                getStatusColor(status) as
                  | 'default'
                  | 'success'
                  | 'warning'
                  | 'error'
                  | 'info'
                  | 'outline'
                  | 'secondary'
              }
              size="md"
            >
              {getStatusText(status)}
            </Badge>
          </div>

          {/* Data e Ora */}
          <div className="rounded-xl border border-primary/20 bg-background-tertiary/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-text-primary">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Data e Ora</span>
            </div>
            {date && (
              <div className="pl-6">
                <p className="text-text-primary font-semibold">{date}</p>
                <p className="text-text-secondary text-sm mt-1">
                  {time} - {endTimeFormatted}
                </p>
              </div>
            )}
          </div>

          {/* Ricorrenza */}
          {appointment.recurrence_rule &&
            (() => {
              const recurrence = deserializeRecurrence(appointment.recurrence_rule)
              if (recurrence.type === 'none') return null

              const getRecurrenceLabel = () => {
                if (recurrence.type === 'daily') {
                  return recurrence.interval === 1
                    ? 'Ogni giorno'
                    : `Ogni ${recurrence.interval} giorni`
                }
                if (recurrence.type === 'weekly') {
                  if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
                    const selectedDays = recurrence.daysOfWeek.map((d) => dayLabels[d]).join(', ')
                    return `Ogni ${recurrence.interval === 1 ? '' : recurrence.interval + ' '}settimana: ${selectedDays}`
                  }
                  return recurrence.interval === 1
                    ? 'Ogni settimana'
                    : `Ogni ${recurrence.interval} settimane`
                }
                if (recurrence.type === 'monthly') {
                  return recurrence.interval === 1
                    ? 'Ogni mese'
                    : `Ogni ${recurrence.interval} mesi`
                }
                return 'Ricorrenza'
              }

              const getEndLabel = () => {
                if (recurrence.endDate) {
                  return `Fino al ${new Date(recurrence.endDate).toLocaleDateString('it-IT')}`
                }
                if (recurrence.count) {
                  return `${recurrence.count} occorrenze`
                }
                return 'Senza fine'
              }

              return (
                <div className="rounded-xl border border-primary/20 bg-background-tertiary/50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-text-primary">
                    <Repeat className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Ricorrenza</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-text-primary text-sm font-medium">{getRecurrenceLabel()}</p>
                    <p className="text-text-secondary text-xs mt-1">{getEndLabel()}</p>
                  </div>
                </div>
              )
            })()}

          {/* Note */}
          {appointment.notes && (
            <div className="rounded-xl border border-primary/20 bg-background-tertiary/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-text-primary">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Note</span>
              </div>
              <p className="text-text-secondary text-sm pl-6 whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Info Annullamento */}
          {isCancelled && appointment.cancelled_at && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4">
              <div className="flex items-center gap-2 text-state-error">
                <Ban className="h-4 w-4" />
                <span className="text-sm font-medium">Annullato</span>
              </div>
              <p className="text-state-error text-xs mt-1 pl-6">
                {new Date(appointment.cancelled_at).toLocaleString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {/* Azioni */}
          {isEditable ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-primary/20">
              <Button
                variant="primary"
                onClick={onEdit}
                disabled={loading}
                className="w-full bg-primary/20 text-primary font-medium hover:bg-primary/30 shadow-[0_0_10px_rgba(2,179,191,0.3)]"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifica
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Annulla
                </Button>
                <Button
                  variant="outline"
                  onClick={onDelete}
                  disabled={loading}
                  className="flex-1 border-error/30 text-state-error hover:bg-error/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-background-tertiary/50 bg-background-tertiary/50 p-4 text-center">
              <p className="text-text-secondary text-sm">
                {isCancelled
                  ? 'Questo appuntamento è stato annullato e non può essere modificato'
                  : 'Questo appuntamento è stato completato e non può essere modificato'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
