'use client'

import { useState, useEffect } from 'react'
import { X, User, Clock, MapPin, FileText, Tag, Calendar, ChevronDown } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:calendar:appointment-form')
import { Button } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import type {
  CreateAppointmentData,
  EditAppointmentData,
  AppointmentColor,
} from '@/types/appointment'
import { APPOINTMENT_COLORS } from '@/types/appointment'
import { cn } from '@/lib/utils'

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

// Labels per i colori
const COLOR_LABELS: Record<AppointmentColor, string> = {
  azzurro: 'Azzurro',
  blu: 'Blu',
  viola_scuro: 'Viola',
  viola_chiaro: 'Lavanda',
  rosa: 'Rosa',
  rosso: 'Rosso',
  arancione: 'Arancione',
  giallo: 'Giallo',
  verde: 'Verde',
  verde_chiaro: 'Salvia',
  marrone: 'Marrone',
  grigio: 'Grigio',
}

// Tipi di appuntamento con icone e colori
const APPOINTMENT_TYPES = [
  { value: 'allenamento', label: 'Allenamento', emoji: '🏋️' },
  { value: 'prova', label: 'Prova', emoji: '🎯' },
  { value: 'valutazione', label: 'Valutazione', emoji: '📊' },
  { value: 'prima_visita', label: 'Prima Visita', emoji: '👋' },
  { value: 'riunione', label: 'Riunione', emoji: '🤝' },
  { value: 'massaggio', label: 'Massaggio', emoji: '💆' },
  { value: 'nutrizionista', label: 'Nutrizionista', emoji: '🥗' },
]

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

// Helper per estrarre data/ora locale da ISO string (gestisce correttamente timezone)
function extractLocalDateTime(isoString: string): { date: string; time: string } {
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

export function AppointmentForm({
  appointment,
  athletes,
  onSubmit,
  onCancel,
  loading = false,
}: AppointmentFormProps) {
  const getDefaultDateTime = () => {
    // Se abbiamo un appuntamento, usa le sue date/ore (convertite in locale)
    if (appointment?.starts_at) {
      const startLocal = extractLocalDateTime(appointment.starts_at)
      const endLocal = appointment.ends_at
        ? extractLocalDateTime(appointment.ends_at)
        : { date: startLocal.date, time: calculateEndTime(startLocal.time) }

      return {
        date: startLocal.date,
        start_time: startLocal.time,
        end_time: endLocal.time,
      }
    }

    // Default: ora corrente arrotondata ai 15 minuti
    const now = new Date()
    const currentMinutes = now.getMinutes()
    const roundedMinutes = Math.round(currentMinutes / 15) * 15
    let defaultHour = now.getHours()
    let defaultMinute = roundedMinutes

    if (defaultMinute >= 60) {
      defaultHour += 1
      defaultMinute = 0
    }

    const defaultDate = new Date(now)
    if (defaultHour >= 24) {
      defaultDate.setDate(defaultDate.getDate() + 1)
      defaultHour = 0
    }

    const startTimeStr = `${String(defaultHour).padStart(2, '0')}:${String(defaultMinute).padStart(2, '0')}`
    const endTimeStr = calculateEndTime(startTimeStr)

    const year = defaultDate.getFullYear()
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0')
    const day = String(defaultDate.getDate()).padStart(2, '0')

    return {
      date: `${year}-${month}-${day}`,
      start_time: startTimeStr,
      end_time: endTimeStr,
    }
  }

  // Calcola orario fine (+1 ora)
  function calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    let endHour = hours + 1
    if (endHour >= 24) endHour = 0
    return `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const defaultDateTime = getDefaultDateTime()

  const [formData, setFormData] = useState({
    athlete_id: appointment && 'athlete_id' in appointment ? appointment.athlete_id : '',
    date: defaultDateTime.date,
    start_time: defaultDateTime.start_time,
    end_time: defaultDateTime.end_time,
    type: appointment && 'type' in appointment ? appointment.type : 'allenamento',
    color: (appointment && 'color' in appointment
      ? appointment.color
      : 'azzurro') as AppointmentColor,
    notes: appointment?.notes || '',
    location: appointment?.location || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    if (appointment) {
      const newDateTime = getDefaultDateTime()
      setFormData({
        athlete_id: 'athlete_id' in appointment ? appointment.athlete_id : '',
        date: newDateTime.date,
        start_time: newDateTime.start_time,
        end_time: newDateTime.end_time,
        type: 'type' in appointment ? appointment.type : 'allenamento',
        color: ('color' in appointment && appointment.color
          ? appointment.color
          : 'azzurro') as AppointmentColor,
        notes: appointment.notes || '',
        location: appointment.location || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment])

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
      newErrors.start_time = 'Seleziona un orario'
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Seleziona un orario'
    }

    // Validazione orario: ignora controllo se fine < inizio (potrebbe essere a cavallo mezzanotte)
    // Il controllo principale è fatto sul Date object nel submit
    if (formData.start_time && formData.end_time && formData.start_time === formData.end_time) {
      newErrors.end_time = "L'orario di fine deve essere diverso dall'inizio"
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
      const startDate = new Date(`${formData.date}T${formData.start_time}:00`)
      const endDateBase = new Date(`${formData.date}T${formData.end_time}:00`)

      // Se fine è prima di inizio, aggiungi un giorno (appuntamento a cavallo mezzanotte)
      const endDate =
        endDateBase <= startDate
          ? new Date(endDateBase.setDate(endDateBase.getDate() + 1))
          : endDateBase

      const starts_at = startDate.toISOString()
      const ends_at = endDate.toISOString()

      const data: CreateAppointmentData = {
        athlete_id: formData.athlete_id!,
        staff_id: '',
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
        org_id: undefined,
        status: 'attivo',
        color: formData.color || null,
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

  const handleStartTimeChange = (value: string) => {
    setFormData((prev) => {
      if (value) {
        const [hours, minutes] = value.split(':').map(Number)
        let endHour = hours + 1
        const endMinute = minutes

        if (endHour >= 24) {
          endHour = 0
        }

        const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
        return { ...prev, start_time: value, end_time: endTimeStr }
      }
      return { ...prev, start_time: value }
    })
  }

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const selectedColor = APPOINTMENT_COLORS[formData.color] || APPOINTMENT_COLORS.azzurro
  const isEditing = appointment && 'id' in appointment

  return (
    <div className="w-full max-w-lg bg-[#1a1a1d] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
      {/* Header con gradiente dinamico */}
      <div
        className="relative h-20 flex items-end pb-3 px-5"
        style={{
          background: `linear-gradient(135deg, ${selectedColor}ee 0%, ${selectedColor}99 100%)`,
        }}
      >
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-10 w-20 h-20 rounded-full border-2 border-white" />
          <div className="absolute -bottom-5 right-20 w-16 h-16 rounded-full border-2 border-white" />
        </div>

        <div className="relative flex-1">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">
            {isEditing ? 'Modifica' : 'Nuovo'}
          </p>
          <h2 className="text-white font-semibold text-xl">Appuntamento</h2>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Atleta - Card style */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-[#9AA0A6] uppercase tracking-wider">
            <User className="h-3.5 w-3.5" />
            Atleta
          </label>
          <div
            className={cn(
              'relative rounded-xl border-2 transition-all duration-200',
              errors.athlete_id
                ? 'border-red-500/50 bg-red-500/5'
                : 'border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50',
            )}
          >
            <SimpleSelect
              value={formData.athlete_id}
              onValueChange={(value) => handleInputChange('athlete_id', value)}
              options={[
                { value: '', label: 'Seleziona atleta...' },
                ...athletes.map((athlete) => ({
                  value: athlete.id,
                  label: athlete.name,
                })),
              ]}
              className="h-12 px-4"
              unstyled
            />
          </div>
          {errors.athlete_id && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400" />
              {errors.athlete_id}
            </p>
          )}
        </div>

        {/* Data e Ora - Grid moderna */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-[#9AA0A6] uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            Data e ora
          </label>

          {/* Data */}
          <div className="rounded-xl border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50 transition-all duration-200">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full h-12 px-4 bg-transparent text-[#E8EAED] text-sm focus:outline-none [color-scheme:dark]"
            />
          </div>

          {/* Display data formattata */}
          <p className="text-[#8AB4F8] text-sm font-medium capitalize pl-1">
            {formatDateDisplay(formData.date)}
          </p>

          {/* Orari in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50 transition-all duration-200">
              <div className="flex items-center h-12 px-4">
                <Clock className="h-4 w-4 text-[#9AA0A6] mr-2 flex-shrink-0" />
                <SimpleSelect
                  value={formData.start_time}
                  onValueChange={(value) => handleStartTimeChange(value)}
                  options={TIME_OPTIONS}
                  className="flex-1"
                  unstyled
                />
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50 transition-all duration-200">
              <div className="flex items-center h-12 px-4">
                <span className="text-[#9AA0A6] mr-2 text-sm">fino</span>
                <SimpleSelect
                  value={formData.end_time}
                  onValueChange={(value) => handleInputChange('end_time', value)}
                  options={TIME_OPTIONS}
                  className="flex-1"
                  unstyled
                />
              </div>
            </div>
          </div>

          {errors.end_time && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400" />
              {errors.end_time}
            </p>
          )}
        </div>

        {/* Tipo - Pills */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-[#9AA0A6] uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" />
            Tipo
          </label>
          <div className="flex flex-wrap gap-2">
            {APPOINTMENT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('type', type.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  formData.type === type.value
                    ? 'bg-[#8AB4F8] text-[#1a1a1d] scale-105 shadow-lg shadow-[#8AB4F8]/20'
                    : 'bg-[#2a2a2d] text-[#9AA0A6] hover:bg-[#3a3a3d] hover:text-[#E8EAED]',
                )}
              >
                <span>{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colore - Expandable picker */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full ring-2 ring-white/20 shadow-lg"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-[#E8EAED] text-sm font-medium">
                {COLOR_LABELS[formData.color]}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-[#9AA0A6] transition-transform duration-200',
                showColorPicker && 'rotate-180',
              )}
            />
          </button>

          {/* Color Grid */}
          <div
            className={cn(
              'grid grid-cols-6 gap-2 overflow-hidden transition-all duration-300',
              showColorPicker
                ? 'max-h-40 opacity-100 p-3 bg-[#2a2a2d]/30 rounded-xl'
                : 'max-h-0 opacity-0',
            )}
          >
            {(Object.entries(APPOINTMENT_COLORS) as [AppointmentColor, string][]).map(
              ([colorKey, colorValue]) => (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => {
                    handleInputChange('color', colorKey)
                    setShowColorPicker(false)
                  }}
                  className={cn(
                    'group relative w-10 h-10 rounded-xl transition-all duration-200',
                    formData.color === colorKey
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1d] scale-110 z-10'
                      : 'hover:scale-110 hover:z-10',
                  )}
                  style={{ backgroundColor: colorValue }}
                  title={COLOR_LABELS[colorKey]}
                >
                  {/* Checkmark per selezionato */}
                  {formData.color === colorKey && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white shadow-lg" />
                    </div>
                  )}

                  {/* Tooltip */}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1a1a1d] text-[10px] text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {COLOR_LABELS[colorKey]}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Location & Note - Minimal inputs */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50 transition-all duration-200">
            <MapPin className="h-4 w-4 text-[#9AA0A6] flex-shrink-0" />
            <input
              type="text"
              placeholder="Aggiungi luogo (opzionale)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="flex-1 bg-transparent text-[#E8EAED] text-sm placeholder:text-[#5F6368] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50 transition-all duration-200">
            <FileText className="h-4 w-4 text-[#9AA0A6] flex-shrink-0" />
            <input
              type="text"
              placeholder="Aggiungi note (opzionale)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="flex-1 bg-transparent text-[#E8EAED] text-sm placeholder:text-[#5F6368] focus:outline-none"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#3a3a3d] to-transparent" />

        {/* Azioni */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isSubmitting}
            className="px-5 py-2.5 text-[#9AA0A6] hover:text-[#E8EAED] font-medium text-sm transition-colors disabled:opacity-50"
          >
            Annulla
          </button>

          <Button
            type="submit"
            disabled={loading || isSubmitting}
            className={cn(
              'relative px-8 py-2.5 font-semibold text-sm rounded-full transition-all duration-200',
              'bg-gradient-to-r from-[#8AB4F8] to-[#669DF6] hover:from-[#AECBFA] hover:to-[#8AB4F8]',
              'text-[#1a1a1d] shadow-lg shadow-[#8AB4F8]/20 hover:shadow-[#8AB4F8]/30',
              'hover:scale-105 active:scale-100',
              'disabled:opacity-50 disabled:hover:scale-100',
            )}
          >
            {loading || isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#1a1a1d]/30 border-t-[#1a1a1d] rounded-full animate-spin" />
                Salvataggio...
              </span>
            ) : isEditing ? (
              'Salva modifiche'
            ) : (
              'Crea appuntamento'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
