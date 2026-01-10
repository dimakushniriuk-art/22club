'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, X } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:calendar:appointment-form')
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import type { CreateAppointmentData, EditAppointmentData } from '@/types/appointment'

// Genera opzioni orari (tutte le 24 ore, ogni 15 minuti)
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      options.push({ value: timeStr, label: timeStr })
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

interface Athlete {
  id: string
  name: string
  email: string
}

interface AppointmentFormProps {
  appointment?: CreateAppointmentData | EditAppointmentData
  athletes: Athlete[]
  onSubmit: (data: CreateAppointmentData) => Promise<void> | void
  onCancel: () => void
  loading?: boolean
}

export function AppointmentForm({
  appointment,
  athletes,
  onSubmit,
  onCancel,
  loading = false,
}: AppointmentFormProps) {
  // Calcola data/ora di default (ora attuale arrotondata ai 15 minuti)
  const getDefaultDateTime = () => {
    const now = new Date()

    // Arrotonda i minuti ai 15 minuti più vicini (0, 15, 30, 45)
    const currentMinutes = now.getMinutes()
    const roundedMinutes = Math.round(currentMinutes / 15) * 15
    let defaultHour = now.getHours()
    let defaultMinute = roundedMinutes

    // Se l'arrotondamento supera 60 minuti, incrementa l'ora
    if (defaultMinute >= 60) {
      defaultHour += 1
      defaultMinute = 0
    }

    // Se supera le 24, passa al giorno successivo
    const defaultDate = new Date(now)
    if (defaultHour >= 24) {
      defaultDate.setDate(defaultDate.getDate() + 1)
      defaultHour = 0
    }

    // Formatta l'orario di inizio
    const startTimeStr = `${String(defaultHour).padStart(2, '0')}:${String(defaultMinute).padStart(2, '0')}`

    // Calcola l'orario di fine (1 ora e 20 minuti dopo)
    let endHour = defaultHour + 1
    let endMinute = defaultMinute + 20

    // Gestisci il caso in cui i minuti superano 60
    if (endMinute >= 60) {
      endHour += 1
      endMinute -= 60
    }

    // Arrotonda i minuti al più vicino multiplo di 15
    const roundedEndMinutes = Math.round(endMinute / 15) * 15
    let finalEndHour = endHour
    let finalEndMinute = roundedEndMinutes

    // Se l'arrotondamento supera 60 minuti, aggiungi un'ora
    if (finalEndMinute >= 60) {
      finalEndHour += 1
      finalEndMinute = 0
    }

    // Se supera le 24, passa al giorno successivo
    if (finalEndHour >= 24) {
      finalEndHour = 0
    }

    const endTimeStr = `${String(finalEndHour).padStart(2, '0')}:${String(finalEndMinute).padStart(2, '0')}`

    return {
      date: appointment?.starts_at
        ? appointment.starts_at.split('T')[0]
        : defaultDate.toISOString().split('T')[0],
      start_time: appointment?.starts_at
        ? appointment.starts_at.split('T')[1].substring(0, 5)
        : startTimeStr,
      end_time: appointment?.ends_at
        ? appointment.ends_at.split('T')[1].substring(0, 5)
        : endTimeStr,
    }
  }

  const defaultDateTime = getDefaultDateTime()

  const [formData, setFormData] = useState({
    athlete_id: appointment && 'athlete_id' in appointment ? appointment.athlete_id : '',
    date: defaultDateTime.date,
    start_time: defaultDateTime.start_time,
    end_time: defaultDateTime.end_time,
    type: appointment && 'type' in appointment ? appointment.type : 'allenamento',
    notes: appointment?.notes || '',
    location: appointment?.location || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isSubmitting) {
      setIsSubmitting(false)
    }
  }, [loading, isSubmitting])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.athlete_id) {
      newErrors.athlete_id = 'Seleziona un atleta'
    }

    if (!formData.date) {
      newErrors.date = 'Seleziona una data'
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Seleziona un orario di inizio'
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Seleziona un orario di fine'
    }

    // Valida che la data e orario non siano nel passato
    if (formData.date && formData.start_time) {
      const startDateTime = new Date(`${formData.date}T${formData.start_time}:00`)
      if (startDateTime < new Date()) {
        newErrors.date = 'La data e orario non possono essere nel passato'
      }
    }

    // Valida che l'orario di fine sia successivo all'orario di inizio
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = "L'orario di fine deve essere successivo all'orario di inizio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (isSubmitting || loading) return

    setIsSubmitting(true)

    try {
      const starts_at = new Date(`${formData.date}T${formData.start_time}:00`).toISOString()
      const ends_at = new Date(`${formData.date}T${formData.end_time}:00`).toISOString()

      const data: CreateAppointmentData = {
        athlete_id: formData.athlete_id!,
        staff_id: '', // Sarà popolato dal hook useAppointments
        type: formData.type as
          | 'allenamento'
          | 'prova'
          | 'valutazione'
          | 'prima_visita'
          | 'riunione'
          | 'massaggio'
          | 'nutrizionista',
        starts_at,
        ends_at,
        org_id: undefined, // Sarà popolato dalla pagina che usa il form
        status: 'attivo',
        location: formData.location || null,
        notes: formData.notes || null,
      }

      const result = onSubmit(data)
      if (result instanceof Promise) {
        await result
      }
    } catch (err) {
      logger.error('Errore nel form', err, {
        appointmentId: 'id' in (appointment || {}) ? (appointment as { id: string }).id : undefined,
      })
      setIsSubmitting(false)
    }
  }

  // Auto-calcola orario fine quando cambia l'orario inizio (default +1 ora e 20 minuti)
  // Arrotonda al più vicino multiplo di 15 minuti per corrispondere alle opzioni disponibili
  const handleStartTimeChange = (value: string) => {
    setFormData((prev) => {
      if (value) {
        const [hours, minutes] = value.split(':').map(Number)
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

        // Arrotonda i minuti al più vicino multiplo di 15
        const roundedMinutes = Math.round(endMinute / 15) * 15
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

        const endTimeStr = `${String(finalEndHour).padStart(2, '0')}:${String(finalEndMinute).padStart(2, '0')}`
        return { ...prev, start_time: value, end_time: endTimeStr }
      }
      return { ...prev, start_time: value }
    })
  }

  return (
    <Card
      variant="trainer"
      className="relative w-full max-w-lg overflow-hidden bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(2,179,191,0.3)] backdrop-blur-xl"
    >
      <CardHeader className="relative border-b border-primary/20 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle size="lg" className="flex items-center gap-2 text-primary font-medium">
            <Calendar className="h-5 w-5" />
            {appointment && 'id' in appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 text-text-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Atleta */}
          <div>
            <label className="text-text-primary mb-2 flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-primary" />
              Atleta *
            </label>
            <SimpleSelect
              value={formData.athlete_id}
              onValueChange={(value) => handleInputChange('athlete_id', value)}
              options={[
                { value: '', label: 'Seleziona atleta' },
                ...athletes.map((athlete) => ({
                  value: athlete.id,
                  label: athlete.name,
                })),
              ]}
            />
            {errors.athlete_id && (
              <p className="text-state-error mt-1 text-xs">{errors.athlete_id}</p>
            )}
          </div>

          {/* Data e Orari */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-text-primary mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Data *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                errorMessage={errors.date}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-text-primary mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Inizio *
              </label>
              <SimpleSelect
                value={formData.start_time}
                onValueChange={(value) => handleStartTimeChange(value)}
                options={[{ value: '', label: 'Seleziona orario' }, ...TIME_OPTIONS]}
                placeholder="Seleziona orario"
                className="h-9 text-sm"
              />
              {errors.start_time && (
                <p className="text-state-error mt-1 text-xs">{errors.start_time}</p>
              )}
            </div>
            <div>
              <label className="text-text-primary mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Fine *
              </label>
              <SimpleSelect
                value={formData.end_time}
                onValueChange={(value) => handleInputChange('end_time', value)}
                options={[{ value: '', label: 'Seleziona orario' }, ...TIME_OPTIONS]}
                placeholder="Seleziona orario"
                className="h-9 text-sm"
              />
              {errors.end_time && (
                <p className="text-state-error mt-1 text-xs">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Tipo Appuntamento */}
          <div>
            <label className="text-text-primary mb-2 flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Tipo Appuntamento *
            </label>
            <SimpleSelect
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              options={[
                { value: 'allenamento', label: 'Allenamento' },
                { value: 'prova', label: 'Prova' },
                { value: 'valutazione', label: 'Valutazione' },
                { value: 'prima_visita', label: 'Prima Visita' },
                { value: 'riunione', label: 'Riunione' },
                { value: 'massaggio', label: 'Massaggio' },
                { value: 'nutrizionista', label: 'Nutrizionista' },
              ]}
              placeholder="Seleziona tipo"
              className="h-9 text-sm"
            />
          </div>

          {/* Note */}
          <div>
            <Input
              placeholder="Note (opzionale)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Location */}
          <div>
            <Input
              placeholder="Luogo (opzionale)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Azioni */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading || isSubmitting}
              className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || isSubmitting}
              className="flex-1 bg-primary/20 text-primary font-medium hover:bg-primary/30 shadow-[0_0_10px_rgba(2,179,191,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isSubmitting
                ? 'Salvataggio...'
                : appointment && 'id' in appointment
                  ? 'Aggiorna'
                  : 'Crea'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
