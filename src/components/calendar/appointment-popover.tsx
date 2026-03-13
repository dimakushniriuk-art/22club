'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Clock, User, Edit, Trash2, X, MapPin, FileText, CheckCircle, UserX } from 'lucide-react'
import { Button } from '@/components/ui'
import type { AppointmentUI } from '@/types/appointment'
import { APPOINTMENT_COLORS, type AppointmentColor } from '@/types/appointment'
import { useStaffCalendarSettings } from '@/hooks/calendar/use-staff-calendar-settings'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/calendar-defaults'
import { cn } from '@/lib/utils'

interface AppointmentPopoverProps {
  appointment: AppointmentUI
  position: { x: number; y: number }
  onEdit: () => void
  onCancel: () => void
  onDelete: () => void
  onClose: () => void
  loading?: boolean
  /** Nasconde modifica/elimina/annulla se false (es. calendario atleta: solo per appuntamenti creati dall'atleta). Default true */
  canEdit?: boolean
  canDelete?: boolean
  /** Mostra bottone "Segna completato" (solo se status attivo/in_corso). Nutrizionista/massaggiatore: solo se service_type e staff coerenti. */
  canComplete?: boolean
  /** Callback per conferma completamento seduta (trigger DB: status=completato → DEBIT ledger). */
  onComplete?: () => void
  /** Mostra bottone "Segna no-show" (solo staff, appuntamenti attivi/in_corso con atleta). */
  canNoShow?: boolean
  /** Callback per segnare no-show (scala 1 lezione, insert cancellation). */
  onNoShow?: () => void
  /** Sotto 852px: mostra come modal/drawer full width invece che popover posizionato */
  asModal?: boolean
}

export function AppointmentPopover({
  appointment,
  position: _position,
  onEdit,
  onCancel,
  onDelete,
  onClose,
  loading = false,
  canEdit = true,
  canDelete = true,
  canComplete = false,
  onComplete,
  canNoShow = false,
  onNoShow,
  asModal = false,
}: AppointmentPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    const firstBtn = popoverRef.current?.querySelector<HTMLElement>('button')
    requestAnimationFrame(() => firstBtn?.focus())
  }, [])

  const restoreFocusAndClose = (callback: () => void) => {
    previousFocusRef.current?.focus()
    previousFocusRef.current = null
    callback()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        restoreFocusAndClose(onClose)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        restoreFocusAndClose(onClose)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const popoverWidth = asModal ? Math.min(400, typeof window !== 'undefined' ? window.innerWidth - 32 : 400) : Math.min(300, typeof window !== 'undefined' ? window.innerWidth - 32 : 300)
  const popoverMaxHeight = typeof window !== 'undefined' ? window.innerHeight - 32 : 400
  const { settings } = useStaffCalendarSettings()
  const typeLabelMap = useMemo(() => {
    const m: Record<string, string> = { ...APPOINTMENT_TYPE_LABELS }
    settings?.custom_appointment_types?.forEach((c) => {
      m[c.key] = c.label
    })
    return m
  }, [settings?.custom_appointment_types])

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const getTypeLabel = (type: string) => typeLabelMap[type] ?? type.replace(/_/g, ' ')

  const colorKey = (appointment.color || 'azzurro') as AppointmentColor
  const backgroundColor = APPOINTMENT_COLORS[colorKey] || APPOINTMENT_COLORS.azzurro
  const isActive = appointment.status === 'attivo'
  const isInCorso = appointment.status === 'in_corso'
  const isCompletato = appointment.status === 'completato'
  const showCompleteButton = (isActive || isInCorso) && canComplete && onComplete
  const showNoShowButton = (isActive || isInCorso) && canNoShow && onNoShow
  const showEditDelete = isActive && (canEdit || canDelete)

  const content = (
    <div
      ref={popoverRef}
      className={cn(
        'z-[100] max-w-[calc(100vw-2rem)] bg-[#202124] rounded-lg shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150',
        asModal ? 'w-full max-h-[90dvh] overflow-y-auto' : 'w-[var(--popover-w)] max-h-[var(--popover-max-h)] overflow-y-auto',
      )}
      style={
        asModal
          ? undefined
          : { '--popover-w': `${popoverWidth}px`, '--popover-max-h': `${popoverMaxHeight}px` } as React.CSSProperties
      }
    >
      {/* Header colorato - touch target min 44px su mobile */}
      <div className="h-12 min-h-[48px] relative flex items-center justify-end px-2" style={{ backgroundColor }}>
        {showEditDelete && (
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={() => restoreFocusAndClose(onEdit)}
                disabled={loading}
                className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-black/20 transition-colors flex items-center justify-center"
                title="Modifica"
              >
                <Edit className="h-4 w-4 text-white" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => restoreFocusAndClose(onDelete)}
                disabled={loading}
                className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-black/20 transition-colors flex items-center justify-center"
                title="Elimina"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            )}
            <button
              onClick={() => restoreFocusAndClose(onClose)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-black/20 transition-colors flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
        {!showEditDelete && (
          <button
            onClick={() => restoreFocusAndClose(onClose)}
            className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-black/20 transition-colors flex items-center justify-center"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* Contenuto */}
      <div className="p-4 space-y-4">
        {/* Titolo */}
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 rounded mt-1 flex-shrink-0" style={{ backgroundColor }} />
          <div>
            <h3 className="text-[#E8EAED] text-lg font-normal">
              {appointment.athlete_name || 'Appuntamento'}
            </h3>
            <p className="text-[#9AA0A6] text-sm">{getTypeLabel(appointment.type)}</p>
          </div>
        </div>

        {/* Data e Ora */}
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-[#9AA0A6] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[#E8EAED] text-sm capitalize">{formatDate(appointment.starts_at)}</p>
            <p className="text-[#9AA0A6] text-sm">
              {formatTime(appointment.starts_at)} – {formatTime(appointment.ends_at)}
            </p>
          </div>
        </div>

        {/* Location */}
        {appointment.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-[#9AA0A6] mt-0.5 flex-shrink-0" />
            <p className="text-[#E8EAED] text-sm">{appointment.location}</p>
          </div>
        )}

        {/* Note */}
        {appointment.notes && (
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-[#9AA0A6] mt-0.5 flex-shrink-0" />
            <p className="text-[#9AA0A6] text-sm">{appointment.notes}</p>
          </div>
        )}

        {/* Atleta */}
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 text-[#9AA0A6] mt-0.5 flex-shrink-0" />
          <p className="text-[#E8EAED] text-sm">{appointment.athlete_name || 'Atleta'}</p>
        </div>

        {/* Status completato: badge */}
        {isCompletato && (
          <div className="bg-[#1E3A2F] rounded-lg p-3 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#81C995]" aria-hidden />
            <p className="text-[#81C995] text-sm font-medium">Completato</p>
          </div>
        )}

        {/* Status annullato */}
        {!isActive && !isCompletato && (
          <div className="bg-[#303134] rounded-lg p-3 text-center">
            <p className="text-[#9AA0A6] text-sm">Appuntamento annullato</p>
          </div>
        )}

        {/* Azioni: Segna completato, Segna no-show, Annulla, Elimina */}
        {(showCompleteButton || showNoShowButton) ? (
          <div className="pt-2 border-t border-[#5F6368]/30 space-y-2">
            {showCompleteButton && (
              <Button
                variant="default"
                onClick={() => restoreFocusAndClose(onComplete!)}
                disabled={loading}
                className="w-full h-9 bg-[#33B679] hover:bg-[#2D9D6B] text-white font-medium justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Segna completato
              </Button>
            )}
            {showNoShowButton && (
              <Button
                variant="outline"
                onClick={() => restoreFocusAndClose(onNoShow!)}
                disabled={loading}
                className="w-full h-9 text-[#F28B82] border-[#F28B82]/50 hover:bg-[#F28B82]/10 font-medium justify-center gap-2"
              >
                <UserX className="h-4 w-4" />
                Segna no-show
              </Button>
            )}
          </div>
        ) : null}
        {(isActive && canEdit) || canDelete ? (
          <div className="pt-2 border-t border-[#5F6368]/30 space-y-2">
            {isActive && canEdit && (
              <Button
                variant="ghost"
                onClick={() => restoreFocusAndClose(onCancel)}
                disabled={loading}
                className="w-full h-9 text-[#F28B82] hover:bg-[#F28B82]/10 font-medium justify-center"
              >
                Annulla appuntamento
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                onClick={() => restoreFocusAndClose(onDelete)}
                disabled={loading}
                className="w-full h-9 text-[#9AA0A6] hover:bg-[#5F6368]/30 font-medium justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina definitivamente
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )

  if (asModal) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && restoreFocusAndClose(onClose)}
        aria-modal="true"
      >
        <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto mx-4 mb-4 sm:my-4 rounded-2xl" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {content}
    </div>
  )
}
