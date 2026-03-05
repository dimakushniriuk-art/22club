'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:reschedule-appointment-modal')
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
} from '@/components/ui'
import { Calendar, Clock, Loader2, X } from 'lucide-react'

interface RescheduleAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string | null
  currentStart?: string
  currentEnd?: string
  athleteName?: string
  onSuccess?: () => void
}

export function RescheduleAppointmentModal({
  open,
  onOpenChange,
  appointmentId,
  currentStart,
  currentEnd,
  athleteName,
  onSuccess,
}: RescheduleAppointmentModalProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formato date per datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForInput = (isoString?: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [startDateTime, setStartDateTime] = useState(
    currentStart ? formatForInput(currentStart) : '',
  )
  const [endDateTime, setEndDateTime] = useState(currentEnd ? formatForInput(currentEnd) : '')

  // Aggiorna i valori quando cambiano le props
  useEffect(() => {
    if (currentStart) {
      setStartDateTime(formatForInput(currentStart))
    }
    if (currentEnd) {
      setEndDateTime(formatForInput(currentEnd))
    }
  }, [currentStart, currentEnd])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!appointmentId) {
        setError('ID appuntamento non valido')
        return
      }

      if (!startDateTime || !endDateTime) {
        setError('Compila data e ora di inizio e fine')
        return
      }

      // Validazione: start < end
      const startDate = new Date(startDateTime)
      const endDate = new Date(endDateTime)
      if (startDate >= endDate) {
        setError('La data/ora di fine deve essere successiva alla data/ora di inizio')
        return
      }

      // Validazione: non nel passato
      if (startDate < new Date()) {
        setError('Non puoi spostare un appuntamento nel passato')
        return
      }

      // Update appointment
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
        })
        .eq('id', appointmentId)

      if (updateError) {
        throw updateError
      }

      // Invalida query appointments per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      logger.error('Error rescheduling appointment', err, { appointmentId })
      const errorMsg =
        err instanceof Error ? err.message : "Errore durante il riprogrammamento dell'appuntamento"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-background-secondary border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Riprogramma Appuntamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {athleteName && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 p-3 rounded-lg text-sm">
              Atleta: <strong>{athleteName}</strong>
            </div>
          )}

          {/* Data e ora inizio */}
          <div className="space-y-2">
            <Label htmlFor="start_datetime" className="text-text-primary">
              <Clock className="inline h-4 w-4 mr-2" />
              Data e Ora Inizio *
            </Label>
            <Input
              id="start_datetime"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Data e ora fine */}
          <div className="space-y-2">
            <Label htmlFor="end_datetime" className="text-text-primary">
              Data e Ora Fine *
            </Label>
            <Input
              id="end_datetime"
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              required
              min={startDateTime || new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Riprogramma
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
