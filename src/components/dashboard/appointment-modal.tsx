'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useClienti } from '@/hooks/use-clienti'
import { queryKeys } from '@/lib/query-keys'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Calendar, Clock, User, FileText, X, Loader2 } from 'lucide-react'
import type { CreateAppointmentData } from '@/types/appointment'
import { RecurrenceSelector } from '@/components/appointments/recurrence-selector'
import type { RecurrenceConfig } from '@/lib/recurrence-utils'
import { serializeRecurrence, generateRecurringAppointments } from '@/lib/recurrence-utils'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:appointment-modal')
// Validazione sovrapposizione rimossa per permettere più atleti nello stesso orario
// import { checkAppointmentOverlap } from '@/lib/appointment-utils'

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AppointmentModal({ open, onOpenChange, onSuccess }: AppointmentModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    athlete_id: '',
    date: '',
    start_time: '',
    end_time: '',
    type: 'allenamento' as
      | 'allenamento'
      | 'prova'
      | 'valutazione'
      | 'prima_visita'
      | 'riunione'
      | 'massaggio'
      | 'nutrizionista',
    notes: '',
    location: '',
  })
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({ type: 'none' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { clienti } = useClienti()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validazione
      if (!formData.athlete_id || !formData.date || !formData.start_time || !formData.end_time) {
        setError('Compila tutti i campi obbligatori')
        setLoading(false)
        return
      }

      // Verifica che start_time < end_time
      const startsAt = new Date(`${formData.date}T${formData.start_time}:00`)
      const endsAt = new Date(`${formData.date}T${formData.end_time}:00`)

      if (endsAt <= startsAt) {
        setError('La data di fine deve essere successiva alla data di inizio')
        setLoading(false)
        return
      }

      // Get current user e profilo staff
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Utente non autenticato')
        setLoading(false)
        return
      }

      // Ottieni staff_id dal profilo usando funzione helper (evita problemi RLS)
      const { data: profileId, error: profileError } = await supabase.rpc('get_current_staff_profile_id')

      if (profileError || !profileId) {
        logger.error('Errore ottenimento profilo staff', profileError, { userId: user.id })
        setError('Profilo staff non trovato. Verifica le impostazioni del tuo account.')
        setLoading(false)
        return
      }

      const profile = { id: profileId }

      type ProfileRow = {
        id: string
      }
      const typedProfile = profile as ProfileRow

      // Validazione sovrapposizione rimossa: permette più atleti nello stesso orario
      // (utile per allenamenti di gruppo o più atleti contemporaneamente)

      // Prepara dati base per appuntamento
      const baseAppointmentData: CreateAppointmentData = {
        athlete_id: formData.athlete_id,
        staff_id: typedProfile.id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        type: formData.type,
        status: 'attivo',
        notes: formData.notes || null,
        location: formData.location || null,
        org_id: 'default-org',
      }

      // Genera appuntamenti ricorrenti se necessario
      const appointmentsToInsert: CreateAppointmentData[] = []

      if (recurrence.type !== 'none') {
        // Genera appuntamenti ricorrenti
        const recurringDates = generateRecurringAppointments(startsAt, endsAt, recurrence)

        recurringDates.forEach(({ starts_at, ends_at }) => {
          appointmentsToInsert.push({
            ...baseAppointmentData,
            starts_at: starts_at.toISOString(),
            ends_at: ends_at.toISOString(),
            recurrence_rule: serializeRecurrence(recurrence) || undefined,
          } as CreateAppointmentData & { recurrence_rule?: string })
        })
      } else {
        // Singolo appuntamento
        appointmentsToInsert.push(baseAppointmentData)
      }

      // Insert appointments
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from('appointments') as any).insert(
        appointmentsToInsert,
      )

      if (insertError) {
        throw insertError
      }

      // Invalida query appointments per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })

      const appointmentCount = appointmentsToInsert.length
      toast.addToast({
        title: appointmentCount > 1 ? 'Appuntamenti creati' : 'Appuntamento creato',
        message:
          appointmentCount > 1
            ? `${appointmentCount} appuntamenti ricorrenti creati correttamente`
            : "L'appuntamento è stato creato correttamente",
        variant: 'success',
      })
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setFormData({
        athlete_id: '',
        date: '',
        start_time: '',
        end_time: '',
        type: 'allenamento',
        notes: '',
        location: '',
      })
      setRecurrence({ type: 'none' })
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Errore nella creazione dell'appuntamento"
      setError(errorMsg)
      toast.addToast({
        title: 'Errore creazione appuntamento',
        message: errorMsg,
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setError(null)
      setFormData({
        athlete_id: '',
        date: '',
        start_time: '',
        end_time: '',
        type: 'allenamento',
        notes: '',
        location: '',
      })
    }
  }

  // Imposta data di default (domani alle 10:00)
  const setDefaultDateTime = useCallback(() => {
    setFormData((prev) => {
      if (prev.date) {
        return prev
      }
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      return {
        ...prev,
        date: tomorrow.toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:15',
      }
    })
  }, [])

  // Imposta data di default quando si apre il modal
  useEffect(() => {
    if (open && !formData.date) {
      setDefaultDateTime()
    }
  }, [open, formData.date, setDefaultDateTime])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background-secondary border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-400" />
            Crea Nuovo Appuntamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Select Atleta */}
          <div className="space-y-2">
            <Label htmlFor="athlete" className="text-text-primary">
              <User className="inline h-4 w-4 mr-2" />
              Atleta *
            </Label>
            <select
              id="athlete"
              value={formData.athlete_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, athlete_id: e.target.value }))}
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Seleziona atleta...</option>
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.cognome}
                </option>
              ))}
            </select>
          </div>

          {/* Data e Orari */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-text-primary">
                <Calendar className="inline h-4 w-4 mr-2" />
                Data *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-text-primary">
                <Clock className="inline h-4 w-4 mr-2" />
                Inizio *
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => {
                  const startTime = e.target.value
                  if (startTime) {
                    const [hours, minutes] = startTime.split(':').map(Number)
                    let endHour = hours + 1
                    let endMinute = minutes + 20

                    // Gestisci il caso in cui i minuti superano 60
                    if (endMinute >= 60) {
                      endHour += 1
                      endMinute -= 60
                    }

                    // Gestisci il caso in cui l'ora supera 24
                    if (endHour >= 24) {
                      endHour = 0
                    }

                    // Arrotonda i minuti al più vicino multiplo di 5 (per compatibilità con input time HTML)
                    const roundedMinutes = Math.round(endMinute / 5) * 5
                    let finalEndHour = endHour
                    let finalEndMinute = roundedMinutes

                    // Se l'arrotondamento supera 60 minuti, aggiungi un'ora
                    if (finalEndMinute >= 60) {
                      finalEndHour += 1
                      finalEndMinute = 0
                    }

                    // Se supera le 24, passa al giorno successivo
                    if (finalEndHour >= 24) {
                      finalEndHour = 0
                    }

                    const endTime = `${String(finalEndHour).padStart(2, '0')}:${String(finalEndMinute).padStart(2, '0')}`
                    setFormData((prev) => ({ ...prev, start_time: startTime, end_time: endTime }))
                  } else {
                    setFormData((prev) => ({ ...prev, start_time: startTime }))
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-text-primary">
                Fine *
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-text-primary">
              Tipo Appuntamento *
            </Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as
                    | 'allenamento'
                    | 'prova'
                    | 'valutazione'
                    | 'prima_visita'
                    | 'riunione'
                    | 'massaggio'
                    | 'nutrizionista',
                }))
              }
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="allenamento">Allenamento</option>
              <option value="prova">Prova</option>
              <option value="valutazione">Valutazione</option>
              <option value="prima_visita">Prima Visita</option>
              <option value="riunione">Riunione</option>
              <option value="massaggio">Massaggio</option>
              <option value="nutrizionista">Nutrizionista</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-text-primary">
              Luogo (opzionale)
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="es. Palestra principale"
            />
          </div>

          {/* Ricorrenza */}
          <RecurrenceSelector
            value={recurrence}
            onChange={setRecurrence}
            startDate={formData.date}
          />

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-text-primary">
              <FileText className="inline h-4 w-4 mr-2" />
              Note (opzionale)
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Note aggiuntive sull'appuntamento..."
              rows={3}
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-blue-500/50 text-white hover:bg-blue-500/10"
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
                  Creazione...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Crea Appuntamento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
