'use client'

import { useRef, useEffect } from 'react'
import { Clock, User, Edit, Trash2, X, MapPin, FileText } from 'lucide-react'
import { Button } from '@/components/ui'
import type { AppointmentUI } from '@/types/appointment'
import { APPOINTMENT_COLORS, type AppointmentColor } from '@/types/appointment'

interface AppointmentPopoverProps {
  appointment: AppointmentUI
  position: { x: number; y: number }
  onEdit: () => void
  onCancel: () => void
  onDelete: () => void
  onClose: () => void
  loading?: boolean
}

export function AppointmentPopover({
  appointment,
  position,
  onEdit,
  onCancel,
  onDelete,
  onClose,
  loading = false,
}: AppointmentPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const getAdjustedPosition = () => {
    const popoverWidth = 300
    const popoverHeight = 320
    const padding = 16

    let x = position.x
    let y = position.y

    if (x + popoverWidth > window.innerWidth - padding) {
      x = window.innerWidth - popoverWidth - padding
    }

    if (y + popoverHeight > window.innerHeight - padding) {
      y = window.innerHeight - popoverHeight - padding
    }

    x = Math.max(padding, x)
    y = Math.max(padding, y)

    return { x, y }
  }

  const adjustedPos = getAdjustedPosition()

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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      allenamento: 'Allenamento',
      prova: 'Prova',
      valutazione: 'Valutazione',
      prima_visita: 'Prima Visita',
      riunione: 'Riunione',
      massaggio: 'Massaggio',
      nutrizionista: 'Nutrizionista',
    }
    return labels[type] || type
  }

  const colorKey = (appointment.color || 'azzurro') as AppointmentColor
  const backgroundColor = APPOINTMENT_COLORS[colorKey] || APPOINTMENT_COLORS.azzurro
  const isEditable = appointment.status === 'attivo'

  return (
    <div
      ref={popoverRef}
      className="fixed z-[100] w-[300px] bg-[#202124] rounded-lg shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: adjustedPos.x,
        top: adjustedPos.y,
      }}
    >
      {/* Header colorato */}
      <div
        className="h-12 relative flex items-center justify-end px-2"
        style={{ backgroundColor }}
      >
        {isEditable && (
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              disabled={loading}
              className="p-2 rounded-full hover:bg-black/20 transition-colors"
              title="Modifica"
            >
              <Edit className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={onDelete}
              disabled={loading}
              className="p-2 rounded-full hover:bg-black/20 transition-colors"
              title="Elimina"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/20 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
        {!isEditable && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/20 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* Contenuto */}
      <div className="p-4 space-y-4">
        {/* Titolo */}
        <div className="flex items-start gap-3">
          <div 
            className="w-4 h-4 rounded mt-1 flex-shrink-0"
            style={{ backgroundColor }}
          />
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

        {/* Status annullato */}
        {!isEditable && (
          <div className="bg-[#303134] rounded-lg p-3 text-center">
            <p className="text-[#9AA0A6] text-sm">
              {appointment.status === 'annullato' ? 'Appuntamento annullato' : 'Appuntamento completato'}
            </p>
          </div>
        )}

        {/* Pulsante annulla (solo se editabile) */}
        {isEditable && (
          <div className="pt-2 border-t border-[#5F6368]/30">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="w-full h-9 text-[#F28B82] hover:bg-[#F28B82]/10 font-medium justify-center"
            >
              Annulla appuntamento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
