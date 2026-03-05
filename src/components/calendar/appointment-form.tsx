'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, User, Clock, MapPin, FileText, Tag, Calendar, ChevronDown, Repeat } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:calendar:appointment-form')
import { Button, Switch } from '@/components/ui'
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
// Opzione tipo per slot Libera prenotazione (stesso value 'allenamento' per il DB)
const OPEN_BOOKING_TYPE = { value: 'allenamento' as const, label: 'Libera prenotazione', emoji: '📅' }

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
  /** Se true, mostra opzione "Libera prenotazione" (slot senza atleta, visibili agli atleti per prenotare) */
  showOpenBookingOption?: boolean
  /** Tipo predefinito quando non si sta modificando un appuntamento (es. massaggio per ruolo massaggiatore) */
  defaultType?: 'allenamento' | 'prova' | 'valutazione' | 'prima_visita' | 'riunione' | 'massaggio' | 'nutrizionista'
  /** Colore predefinito quando non si sta modificando un appuntamento (es. giallo per massaggiatore) */
  defaultColor?: AppointmentColor
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
  showOpenBookingOption = false,
  defaultType,
  defaultColor,
}: AppointmentFormProps) {
  // Calcola orario fine (+1 ora)
  function calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    let endHour = hours + 1
    if (endHour >= 24) endHour = 0
    return `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const getDefaultDateTime = useCallback(() => {
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
  }, [appointment])

  const defaultDateTime = getDefaultDateTime()

  const initialAthleteId =
    (appointment && 'athlete_id' in appointment ? appointment.athlete_id : '') ||
    (athletes.length === 1 ? athletes[0].id : '')

  const [formData, setFormData] = useState({
    athlete_id: initialAthleteId,
    date: defaultDateTime.date,
    start_time: defaultDateTime.start_time,
    end_time: defaultDateTime.end_time,
    type: appointment && 'type' in appointment ? appointment.type : (defaultType || 'allenamento'),
    color: (appointment && 'color' in appointment && appointment.color
      ? appointment.color
      : (defaultColor || 'azzurro')) as AppointmentColor,
    notes: appointment?.notes || '',
    location: appointment?.location || '22 Club',
    is_open_booking_day: !!(appointment && 'is_open_booking_day' in appointment && appointment.is_open_booking_day),
    is_all_day: false,
    recurrence: 'none' as 'none' | '2_weeks' | '1_month' | '6_months' | '1_year',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const formContainerRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      const first = formContainerRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      first?.focus()
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  useEffect(() => {
    if (appointment) {
      const newDateTime = getDefaultDateTime()
      const athleteId =
        ('athlete_id' in appointment ? appointment.athlete_id : '') ||
        (athletes.length === 1 ? athletes[0].id : '')
      let isAllDay = false
      if (appointment.starts_at && appointment.ends_at) {
        const start = new Date(appointment.starts_at)
        const end = new Date(appointment.ends_at)
        const startMidnight = start.getHours() === 0 && start.getMinutes() === 0
        const endEod = (end.getHours() === 23 && end.getMinutes() === 59) || (end.getHours() === 0 && end.getMinutes() === 0 && end.getDate() > start.getDate())
        isAllDay = startMidnight && (endEod || end.getTime() - start.getTime() >= 24 * 60 * 60 * 1000 - 60000)
      }
      setFormData({
        athlete_id: athleteId || '',
        date: newDateTime.date,
        start_time: newDateTime.start_time,
        end_time: newDateTime.end_time,
        type: 'type' in appointment ? appointment.type : 'allenamento',
        color: ('color' in appointment && appointment.color
          ? appointment.color
          : (defaultColor || 'azzurro')) as AppointmentColor,
        notes: appointment.notes || '',
        location: appointment.location || '22 Club',
        is_open_booking_day: !!(appointment && 'is_open_booking_day' in appointment && appointment.is_open_booking_day),
        is_all_day: isAllDay,
        recurrence: 'none',
      })
    }
  }, [appointment, getDefaultDateTime, athletes, defaultColor])

  useEffect(() => {
    if (athletes.length === 1 && !formData.athlete_id) {
      setFormData((prev) => ({ ...prev, athlete_id: athletes[0].id }))
    }
  }, [athletes, formData.athlete_id])

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

    if (!formData.is_open_booking_day && !formData.athlete_id) {
      newErrors.athlete_id = 'Seleziona un atleta'
    }

    if (!formData.date) {
      newErrors.date = 'Seleziona una data'
    }

    if (!formData.is_all_day) {
      if (!formData.start_time) {
        newErrors.start_time = 'Seleziona un orario'
      }
      if (!formData.end_time) {
        newErrors.end_time = 'Seleziona un orario'
      }
      if (formData.start_time && formData.end_time && formData.start_time === formData.end_time) {
        newErrors.end_time = "L'orario di fine deve essere diverso dall'inizio"
      }
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
      let starts_at: string
      let ends_at: string
      if (formData.is_all_day) {
        starts_at = new Date(`${formData.date}T00:00:00`).toISOString()
        ends_at = new Date(`${formData.date}T23:59:00`).toISOString()
      } else {
        const startDate = new Date(`${formData.date}T${formData.start_time}:00`)
        const endDateBase = new Date(`${formData.date}T${formData.end_time}:00`)
        const endDate =
          endDateBase <= startDate
            ? new Date(endDateBase.setDate(endDateBase.getDate() + 1))
            : endDateBase
        starts_at = startDate.toISOString()
        ends_at = endDate.toISOString()
      }

      const data: CreateAppointmentData = {
        ...(formData.is_open_booking_day ? {} : { athlete_id: formData.athlete_id! }),
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
        notes: formData.is_open_booking_day ? (formData.notes || 'Libera prenotazione') : formData.notes || null,
        ...(formData.is_open_booking_day ? { is_open_booking_day: true } : {}),
        ...(formData.recurrence && formData.recurrence !== 'none' ? { recurrence: formData.recurrence } : {}),
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
    <div className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto overflow-x-hidden bg-[#1a1a1d] rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 my-auto">
      {/* Header compatto */}
      <div
        className="relative h-14 flex items-center px-4"
        style={{
          background: `linear-gradient(135deg, ${selectedColor}ee 0%, ${selectedColor}99 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1 right-8 w-14 h-14 rounded-full border-2 border-white" />
          <div className="absolute -bottom-3 right-14 w-12 h-12 rounded-full border-2 border-white" />
        </div>
        <div className="relative flex-1">
          <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">
            {isEditing ? 'Modifica' : 'Nuovo'}
          </p>
          <h2 className="text-white font-semibold text-lg leading-tight">Appuntamento</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="relative p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Form compatto */}
      <form ref={formContainerRef} onSubmit={handleSubmit} className="p-4 space-y-3">
        {showOpenBookingOption && !isEditing && (
          <div className="flex items-center justify-between rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 p-3 gap-3">
            <label htmlFor="open-booking" className="text-sm text-[#E8EAED] font-medium min-w-0 flex-1">
              Libera prenotazione (slot in cui gli atleti possono prenotare)
            </label>
            <div className="w-11 shrink-0 flex justify-end">
              <Switch
                id="open-booking"
                checked={formData.is_open_booking_day}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_open_booking_day: checked,
                    ...(checked
                      ? {
                          notes: prev.notes || 'Libera prenotazione',
                          type: 'allenamento' as const,
                          color: 'verde' as AppointmentColor,
                        }
                      : {}),
                  }))
                }
              />
            </div>
          </div>
        )}
        {/* Atleta */}
        {(!formData.is_open_booking_day || !showOpenBookingOption) && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#9AA0A6] uppercase tracking-wider">
              <User className="h-3 w-3" />
              Atleta
            </label>
            <div
              className={cn(
                'relative rounded-lg border-2 transition-all duration-200',
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
                className="h-10 px-3"
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
        )}

        {/* Data e Ora - layout compatto: data + Intero giorno sulla stessa riga */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#9AA0A6] uppercase tracking-wider">
            <Calendar className="h-3 w-3" />
            Data e ora
          </label>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-[1fr_auto] gap-2 items-center">
            <div className="rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50 transition-all duration-200">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full h-10 px-3 bg-transparent text-[#E8EAED] text-sm focus:outline-none [color-scheme:dark]"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 p-2.5 gap-2 min-[400px]:w-auto">
              <label htmlFor="all-day" className="text-xs text-[#E8EAED] font-medium whitespace-nowrap">
                Intero giorno
              </label>
              <Switch
                id="all-day"
                checked={formData.is_all_day}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_all_day: checked }))
                }
              />
            </div>
          </div>
          <p className="text-[#8AB4F8] text-xs font-medium capitalize">
            {formatDateDisplay(formData.date)}
          </p>

          {!formData.is_all_day && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 focus-within:border-[#8AB4F8]/50 transition-all duration-200">
                  <div className="flex items-center h-10 px-3">
                    <Clock className="h-3.5 w-3.5 text-[#9AA0A6] mr-2 shrink-0" />
                    <SimpleSelect
                      value={formData.start_time}
                      onValueChange={(value) => handleStartTimeChange(value)}
                      options={TIME_OPTIONS}
                      className="flex-1"
                      unstyled
                    />
                  </div>
                </div>
                <div className="rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 focus-within:border-[#8AB4F8]/50 transition-all duration-200">
                  <div className="flex items-center h-10 px-3">
                    <span className="text-[#9AA0A6] text-xs mr-2">fino</span>
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
            </>
          )}

          {!isEditing && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#9AA0A6] uppercase tracking-wider">
                <Repeat className="h-3 w-3" />
                Ripetizione
              </label>
              <div className="relative rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] focus-within:border-[#8AB4F8]/50 transition-all duration-200">
                <SimpleSelect
                  value={formData.recurrence}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurrence: value as 'none' | '2_weeks' | '1_month' | '6_months' | '1_year',
                    }))
                  }
                  options={[
                    { value: 'none', label: 'Nessuna' },
                    { value: '2_weeks', label: 'Ogni settimana per 2 settimane' },
                    { value: '1_month', label: 'Ogni settimana per 1 mese' },
                    { value: '6_months', label: 'Ogni settimana per 6 mesi' },
                    { value: '1_year', label: 'Ogni settimana per 1 anno' },
                  ]}
                  className="h-10 px-3"
                  unstyled
                />
              </div>
            </div>
          )}

        </div>

        {/* Tipo - Pills compatte */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#9AA0A6] uppercase tracking-wider">
            <Tag className="h-3 w-3" />
            Tipo
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(showOpenBookingOption && formData.is_open_booking_day
              ? [OPEN_BOOKING_TYPE, ...APPOINTMENT_TYPES.filter((t) => t.value !== 'allenamento')]
              : APPOINTMENT_TYPES
            ).map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('type', type.value)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                  formData.type === type.value
                    ? 'bg-[#8AB4F8] text-[#1a1a1d] shadow-[#8AB4F8]/20'
                    : 'bg-[#2a2a2d] text-[#9AA0A6] hover:bg-[#3a3a3d] hover:text-[#E8EAED]',
                )}
              >
                <span className="text-sm">{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colore - compatto */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 hover:border-[#3a3a3d] transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full ring-2 ring-white/20"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-[#E8EAED] text-xs font-medium">
                {COLOR_LABELS[formData.color]}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-[#9AA0A6] transition-transform duration-200',
                showColorPicker && 'rotate-180',
              )}
            />
          </button>
          <div
            className={cn(
              'grid grid-cols-6 gap-1.5 overflow-hidden transition-all duration-300',
              showColorPicker
                ? 'max-h-32 opacity-100 p-2 bg-[#2a2a2d]/30 rounded-lg'
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
                    'group relative w-8 h-8 rounded-lg transition-all duration-200',
                    formData.color === colorKey
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1d] z-10'
                      : 'hover:z-10',
                  )}
                  style={{ backgroundColor: colorValue }}
                  title={COLOR_LABELS[colorKey]}
                >
                  {formData.color === colorKey && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#1a1a1d] text-[10px] text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {COLOR_LABELS[colorKey]}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Location & Note - una riga ciascuna, compatte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 focus-within:border-[#8AB4F8]/50 transition-all duration-200">
            <MapPin className="h-3.5 w-3.5 text-[#9AA0A6] shrink-0" />
            <input
              type="text"
              placeholder="Luogo (opz.)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-[#E8EAED] text-xs placeholder:text-[#5F6368] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-[#2a2a2d] bg-[#2a2a2d]/50 focus-within:border-[#8AB4F8]/50 transition-all duration-200">
            <FileText className="h-3.5 w-3.5 text-[#9AA0A6] shrink-0" />
            <input
              type="text"
              placeholder="Note (opz.)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-[#E8EAED] text-xs placeholder:text-[#5F6368] focus:outline-none"
            />
          </div>
        </div>

        {/* Azioni: sticky su mobile, min 44px touch target */}
        <div className="flex items-center justify-between pt-1 gap-3 sticky bottom-0 bg-[#1a1a1d] py-3 -mx-4 px-4 max-[851px]:min-h-[52px]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isSubmitting}
            className="min-h-[44px] px-4 py-2 text-[#9AA0A6] hover:text-[#E8EAED] font-medium text-xs transition-colors disabled:opacity-50 touch-manipulation"
          >
            Annulla
          </button>
          <Button
            type="submit"
            disabled={loading || isSubmitting}
            className={cn(
              'relative min-h-[44px] px-6 py-2 font-semibold text-xs rounded-full transition-all duration-200 touch-manipulation',
              'bg-gradient-to-r from-[#8AB4F8] to-[#669DF6] hover:from-[#AECBFA] hover:to-[#8AB4F8]',
              'text-[#1a1a1d] shadow-[#8AB4F8]/20 hover:shadow-[#8AB4F8]/30',
              'disabled:opacity-50',
            )}
          >
            {loading || isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-[#1a1a1d]/30 border-t-[#1a1a1d] rounded-full animate-spin" />
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
