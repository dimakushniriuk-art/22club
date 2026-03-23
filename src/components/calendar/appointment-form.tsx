'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, User, Clock, MapPin, FileText, Tag, Calendar, ChevronDown, Repeat } from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { useStaffCalendarSettings } from '@/hooks/calendar/use-staff-calendar-settings'
import { useAuth } from '@/providers/auth-provider'
import {
  getDefaultDurationsForRole,
  DEFAULT_TYPE_COLORS,
  FREE_PASS_DURATION_MINUTES,
  APPOINTMENT_TYPE_LABELS,
} from '@/lib/calendar-defaults'

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
  lilla: 'Lilla',
  rosa: 'Rosa',
  rosso: 'Rosso',
  arancione: 'Arancione',
  giallo: 'Giallo',
  verde: 'Verde',
  verde_chiaro: 'Salvia',
  marrone: 'Marrone',
  grigio: 'Grigio',
}

// Emoji per tipo (per form)
const TYPE_EMOJI: Record<string, string> = {
  allenamento: '🏋️',
  allenamento_singolo: '🏋️',
  allenamento_doppio: '🏋️',
  programma: '📋',
  prova: '🎯',
  valutazione: '📊',
  prima_visita: '👋',
  riunione: '🤝',
  massaggio: '💆',
  nutrizionista: '🥗',
  privato: '🔒',
  appuntamento_normale: '📅',
  controllo: '✅',
  slot_disponibile: '🟢',
}
// Opzione tipo per slot Libera prenotazione (Free Pass)
const OPEN_BOOKING_TYPE = {
  value: 'allenamento' as const,
  label: 'Libera prenotazione (Free Pass)',
  emoji: '📅',
}

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
  defaultType?:
    | 'allenamento'
    | 'prova'
    | 'valutazione'
    | 'prima_visita'
    | 'riunione'
    | 'massaggio'
    | 'nutrizionista'
  /** Colore predefinito quando non si sta modificando un appuntamento (es. giallo per massaggiatore) */
  defaultColor?: AppointmentColor
  /** Se true (calendario atleta): solo tipo Allenamento, nessun campo atleta, nessun Intero giorno, durata fissa 90 min */
  athleteMode?: boolean
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
  athleteMode = false,
}: AppointmentFormProps) {
  const { settings } = useStaffCalendarSettings()
  const { role } = useAuth()
  const defaultDurationsByRole = useMemo(() => getDefaultDurationsForRole(role ?? ''), [role])
  const defaultDurations = useMemo(
    () =>
      settings?.default_durations && Object.keys(settings.default_durations).length > 0
        ? settings.default_durations
        : defaultDurationsByRole,
    [settings?.default_durations, defaultDurationsByRole],
  )
  const enabledTypes = useMemo(() => {
    if (athleteMode) return ['allenamento']
    let system: string[]
    if (settings?.enabled_appointment_types?.length) system = settings.enabled_appointment_types
    else if (role === 'trainer' || role === 'admin')
      system = [
        'allenamento_singolo',
        'allenamento_doppio',
        'programma',
        'prova',
        'riunione',
        'privato',
        'allenamento',
      ]
    else if (role === 'nutrizionista')
      system = [
        'appuntamento_normale',
        'prova',
        'controllo',
        'riunione',
        'privato',
        'nutrizionista',
      ]
    else if (role === 'massaggiatore')
      system = ['appuntamento_normale', 'prova', 'controllo', 'riunione', 'privato', 'massaggio']
    else
      system = [
        'appuntamento_normale',
        'prova',
        'controllo',
        'riunione',
        'privato',
        'massaggio',
        'nutrizionista',
      ]
    const customKeys = (settings?.custom_appointment_types ?? []).map((c) => c.key)
    return [...system, ...customKeys]
  }, [athleteMode, settings?.enabled_appointment_types, settings?.custom_appointment_types, role])

  /** Tipo di default per nuovo appuntamento: in athleteMode sempre allenamento, altrimenti primo tra abilitati. */
  const defaultTypeFromSettings = athleteMode
    ? 'allenamento'
    : (enabledTypes[0] ?? defaultType ?? 'allenamento')
  /** Colore per tipo da impostazioni (usato come default e al cambio tipo). */
  const colorForType = useCallback(
    (type: string): AppointmentColor =>
      (settings?.type_colors?.[type] as AppointmentColor) ??
      (DEFAULT_TYPE_COLORS[type] as AppointmentColor) ??
      'azzurro',
    [settings?.type_colors],
  )
  const appointmentTypes = useMemo(() => {
    const customLabels = Object.fromEntries(
      (settings?.custom_appointment_types ?? []).map((c) => [c.key, c.label]),
    )
    const list = enabledTypes.map((value) => ({
      value,
      label: customLabels[value] ?? APPOINTMENT_TYPE_LABELS[value] ?? value.replace(/_/g, ' '),
      emoji: TYPE_EMOJI[value] ?? '📌',
    }))
    return list
  }, [enabledTypes, settings?.custom_appointment_types])
  const recurrenceOptionsList = useMemo(() => {
    const opts = settings?.recurrence_options?.length
      ? settings.recurrence_options
      : ['none', '2_weeks', '1_month', '6_months', '1_year', 'until_lessons']
    return [
      { value: 'none', label: 'Nessuna' },
      ...(opts.includes('2_weeks')
        ? [{ value: '2_weeks', label: 'Ogni settimana per 2 settimane' }]
        : []),
      ...(opts.includes('1_month')
        ? [{ value: '1_month', label: 'Ogni settimana per 1 mese' }]
        : []),
      ...(opts.includes('6_months')
        ? [{ value: '6_months', label: 'Ogni settimana per 6 mesi' }]
        : []),
      ...(opts.includes('1_year') ? [{ value: '1_year', label: 'Ogni settimana per 1 anno' }] : []),
      ...(opts.includes('until_lessons')
        ? [{ value: 'until_lessons', label: 'Fino a esaurimento lezioni' }]
        : []),
    ]
  }, [settings?.recurrence_options])

  /** Durata per tipo: se in Impostazioni è impostata la durata per "Allenamento" (generico), vale per tutte le varianti (singolo/doppio). In athleteMode sempre 90 min. */
  const getDurationForType = useCallback(
    (type: string, isOpenBooking: boolean): number => {
      if (athleteMode) return 90
      if (isOpenBooking) return FREE_PASS_DURATION_MINUTES
      const genericAllenamento = defaultDurations['allenamento']
      if (type === 'allenamento')
        return (
          genericAllenamento ??
          defaultDurations['allenamento_singolo'] ??
          defaultDurationsByRole['allenamento'] ??
          90
        )
      if (type === 'allenamento_singolo')
        return (
          genericAllenamento ??
          defaultDurations['allenamento_singolo'] ??
          defaultDurationsByRole['allenamento_singolo'] ??
          90
        )
      if (type === 'allenamento_doppio')
        return (
          genericAllenamento ??
          defaultDurations['allenamento_doppio'] ??
          defaultDurationsByRole['allenamento_doppio'] ??
          90
        )
      return defaultDurations[type] ?? defaultDurationsByRole[type] ?? 90
    },
    [athleteMode, defaultDurations, defaultDurationsByRole],
  )

  function calculateEndTime(startTime: string, durationMinutes: number = 90): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMinute = totalMinutes % 60
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
  }

  const getDefaultDateTime = useCallback(() => {
    const type = appointment && 'type' in appointment ? appointment.type : defaultTypeFromSettings
    const isOpen = !!(
      appointment &&
      'is_open_booking_day' in appointment &&
      appointment.is_open_booking_day
    )
    const dur = getDurationForType(type, isOpen)
    if (appointment?.starts_at) {
      const startLocal = extractLocalDateTime(appointment.starts_at)
      const endLocal = appointment.ends_at
        ? extractLocalDateTime(appointment.ends_at)
        : { date: startLocal.date, time: calculateEndTime(startLocal.time, dur) }
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
    const endTimeStr = calculateEndTime(startTimeStr, dur)
    const year = defaultDate.getFullYear()
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0')
    const day = String(defaultDate.getDate()).padStart(2, '0')
    return {
      date: `${year}-${month}-${day}`,
      start_time: startTimeStr,
      end_time: endTimeStr,
    }
  }, [appointment, defaultTypeFromSettings, getDurationForType])

  const defaultDateTime = getDefaultDateTime()

  const initialAthleteId =
    (appointment && 'athlete_id' in appointment ? appointment.athlete_id : '') ||
    (athletes.length === 1 ? athletes[0].id : '')

  const [formData, setFormData] = useState({
    athlete_id: initialAthleteId,
    date: defaultDateTime.date,
    start_time: defaultDateTime.start_time,
    end_time: defaultDateTime.end_time,
    type: appointment && 'type' in appointment ? appointment.type : defaultTypeFromSettings,
    color: (appointment && 'color' in appointment && appointment.color
      ? appointment.color
      : (defaultColor ?? colorForType(defaultTypeFromSettings))) as AppointmentColor,
    notes: appointment?.notes || '',
    location: appointment?.location || '22 Club',
    is_open_booking_day: !!(
      appointment &&
      'is_open_booking_day' in appointment &&
      appointment.is_open_booking_day
    ),
    is_all_day: false,
    recurrence: 'none' as 'none' | '2_weeks' | '1_month' | '6_months' | '1_year' | 'until_lessons',
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
        const endEod =
          (end.getHours() === 23 && end.getMinutes() === 59) ||
          (end.getHours() === 0 && end.getMinutes() === 0 && end.getDate() > start.getDate())
        isAllDay =
          startMidnight &&
          (endEod || end.getTime() - start.getTime() >= 24 * 60 * 60 * 1000 - 60000)
      }
      setFormData({
        athlete_id: athleteId || '',
        date: newDateTime.date,
        start_time: newDateTime.start_time,
        end_time: newDateTime.end_time,
        type: 'type' in appointment ? appointment.type : (enabledTypes[0] ?? 'allenamento'),
        color: ('color' in appointment && appointment.color
          ? appointment.color
          : (defaultColor ??
            colorForType(
              'type' in appointment ? appointment.type : (enabledTypes[0] ?? 'allenamento'),
            ))) as AppointmentColor,
        notes: appointment.notes || '',
        location: appointment.location || '22 Club',
        is_open_booking_day: !!(
          appointment &&
          'is_open_booking_day' in appointment &&
          appointment.is_open_booking_day
        ),
        is_all_day: isAllDay,
        recurrence: 'none',
      })
    }
  }, [appointment, getDefaultDateTime, athletes, defaultColor, enabledTypes, colorForType])

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
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'type') {
        const isOpen = prev.is_open_booking_day
        const dur = getDurationForType(value, isOpen)
        next.end_time = calculateEndTime(prev.start_time, dur)
        next.color = colorForType(value)
      }
      return next
    })
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
        type: formData.type as CreateAppointmentData['type'],
        starts_at,
        ends_at,
        org_id: undefined,
        status: 'attivo',
        color: formData.color || null,
        location: formData.location || null,
        notes: formData.is_open_booking_day
          ? formData.notes || 'Libera prenotazione'
          : formData.notes || null,
        ...(formData.is_open_booking_day ? { is_open_booking_day: true } : {}),
        ...(formData.recurrence && formData.recurrence !== 'none'
          ? { recurrence: formData.recurrence }
          : {}),
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
      if (value && !prev.is_open_booking_day) {
        const dur = getDurationForType(prev.type, prev.is_open_booking_day)
        const endTimeStr = calculateEndTime(value, dur)
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
    <div className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto overflow-x-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] animate-in zoom-in-95 fade-in duration-200 my-auto">
      {/* Header compatto */}
      <div
        className="relative h-14 flex items-center px-4 border-b border-white/10"
        style={{
          background: `linear-gradient(135deg, ${selectedColor}ee 0%, ${selectedColor}99 100%)`,
        }}
      >
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
      <form
        ref={formContainerRef}
        onSubmit={handleSubmit}
        className="p-4 space-y-3"
        data-testid="appointment-form"
        data-state={loading || isSubmitting ? 'submitting' : 'idle'}
      >
        {showOpenBookingOption && !isEditing && (
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3 gap-3">
            <label
              htmlFor="open-booking"
              className="text-sm text-text-primary font-medium min-w-0 flex-1"
            >
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
                          color: 'grigio' as AppointmentColor,
                          end_time: '20:00',
                        }
                      : {}),
                  }))
                }
              />
            </div>
          </div>
        )}
        {/* Atleta - nascosto in athleteMode (è sempre l'atleta loggato) */}
        {!athleteMode && (!formData.is_open_booking_day || !showOpenBookingOption) && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
              <User className="h-3 w-3" />
              Atleta
            </label>
            <div
              className={cn(
                'relative rounded-lg border transition-all duration-200',
                errors.athlete_id
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/20 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20',
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
                triggerTestId="appointment-athlete-trigger"
                dropdownTestId="appointment-athlete-listbox"
                backdropTestId="appointment-athlete-backdrop"
                optionTestIdPrefix="appointment-athlete-option"
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
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
            <Calendar className="h-3 w-3" />
            Data e ora
          </label>
          <div
            className={cn(
              'grid gap-2 items-center',
              athleteMode ? 'grid-cols-1' : 'grid-cols-1 min-[400px]:grid-cols-[1fr_auto]',
            )}
          >
            <div className="rounded-lg border border-white/10 bg-white/[0.04] hover:border-white/20 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full h-10 px-3 bg-transparent text-text-primary text-sm focus:outline-none [color-scheme:dark]"
              />
            </div>
            {!athleteMode && (
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-2.5 gap-2 min-[400px]:w-auto">
                <label
                  htmlFor="all-day"
                  className="text-xs text-text-primary font-medium whitespace-nowrap"
                >
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
            )}
          </div>
          <p className="text-primary text-xs font-medium capitalize">
            {formatDateDisplay(formData.date)}
          </p>

          {!formData.is_all_day && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                  <div className="flex items-center h-10 px-3">
                    <Clock className="h-3.5 w-3.5 text-text-tertiary mr-2 shrink-0" />
                    <SimpleSelect
                      value={formData.start_time}
                      onValueChange={(value) => handleStartTimeChange(value)}
                      options={TIME_OPTIONS}
                      className="flex-1"
                      unstyled
                      triggerTestId="appointment-start-time-trigger"
                      dropdownTestId="appointment-start-time-listbox"
                      backdropTestId="appointment-start-time-backdrop"
                      optionTestIdPrefix="appointment-start-time-option"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                  <div className="flex items-center h-10 px-3">
                    <span className="text-text-tertiary text-xs mr-2">fino</span>
                    <SimpleSelect
                      value={formData.end_time}
                      onValueChange={(value) => handleInputChange('end_time', value)}
                      options={TIME_OPTIONS}
                      className="flex-1"
                      unstyled
                      triggerTestId="appointment-end-time-trigger"
                      dropdownTestId="appointment-end-time-listbox"
                      backdropTestId="appointment-end-time-backdrop"
                      optionTestIdPrefix="appointment-end-time-option"
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
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                <Repeat className="h-3 w-3" />
                Ripetizione
              </label>
              <div className="relative rounded-lg border border-white/10 bg-white/[0.04] hover:border-white/20 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                <SimpleSelect
                  value={formData.recurrence}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurrence: value as
                        | 'none'
                        | '2_weeks'
                        | '1_month'
                        | '6_months'
                        | '1_year'
                        | 'until_lessons',
                    }))
                  }
                  options={recurrenceOptionsList}
                  className="h-10 px-3"
                  unstyled
                />
              </div>
            </div>
          )}
        </div>

        {/* Tipo - in athleteMode solo Allenamento (nascosto), altrimenti pills */}
        {!athleteMode && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
              <Tag className="h-3 w-3" />
              Tipo
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(showOpenBookingOption && formData.is_open_booking_day
                ? [OPEN_BOOKING_TYPE, ...appointmentTypes.filter((t) => t.value !== 'allenamento')]
                : appointmentTypes
              ).map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                    formData.type === type.value
                      ? 'bg-primary text-primary-foreground shadow-primary/20'
                      : 'bg-white/[0.04] text-text-tertiary hover:bg-white/[0.06] hover:text-text-primary border border-white/10',
                  )}
                >
                  <span className="text-sm">{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colore - compatto */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full ring-2 ring-white/20"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-text-primary text-xs font-medium">
                {COLOR_LABELS[formData.color]}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-text-tertiary transition-transform duration-200',
                showColorPicker && 'rotate-180',
              )}
            />
          </button>
          <div
            className={cn(
              'grid grid-cols-6 gap-1.5 overflow-hidden transition-all duration-300',
              showColorPicker
                ? 'max-h-32 opacity-100 p-2 bg-white/[0.02] rounded-lg border border-white/10'
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
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-background z-10'
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
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-zinc-900 border border-white/10 text-[10px] text-text-primary rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {COLOR_LABELS[colorKey]}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Location & Note - una riga ciascuna, compatte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
            <MapPin className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            <input
              type="text"
              placeholder="Luogo (opz.)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-text-primary text-xs placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
            <FileText className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            <input
              type="text"
              placeholder="Note (opz.)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-text-primary text-xs placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
        </div>

        {/* Azioni: sticky su mobile, min 44px touch target */}
        <div className="flex items-center justify-between pt-1 gap-3 sticky bottom-0 border-t border-white/10 bg-inherit py-3 -mx-4 px-4 max-[851px]:min-h-[52px]">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || isSubmitting}
            className="min-h-[44px] border-white/10 hover:border-primary/20 hover:bg-white/[0.04] text-text-tertiary hover:text-text-primary"
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={loading || isSubmitting}
            className="min-h-[44px] px-6 font-semibold text-xs touch-manipulation"
            data-testid="appointment-form-submit"
            data-state={loading || isSubmitting ? 'submitting' : 'idle'}
          >
            {loading || isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
