'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Settings, Save, Loader2, Plus, Trash2, ChevronLeft } from 'lucide-react'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useCalendarSettingsPageGuard } from '@/hooks/calendar/use-calendar-page-guard'
import { useStaffCalendarSettings } from '@/hooks/calendar/use-staff-calendar-settings'
import { useAuth } from '@/providers/auth-provider'
import { useNotify } from '@/lib/ui/notify'
import { Button, Input, Label } from '@/components/ui'
import { APPOINTMENT_COLORS, type AppointmentColor } from '@/types/appointment'
import {
  getDefaultDurationsForRole,
  DEFAULT_TYPE_COLORS,
  DEFAULT_DURATIONS_TRAINER,
  DEFAULT_DURATIONS_COLLABORATOR,
  DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT,
} from '@/lib/calendar-defaults'
import type {
  CalendarViewType,
  WeekStartType,
  RecurrenceOption,
  CustomAppointmentType,
  ViewDensity,
  TypeCellWidth,
} from '@/types/staff-calendar-settings'

const VIEW_OPTIONS: { value: CalendarViewType; label: string }[] = [
  { value: 'month', label: 'Mese' },
  { value: 'week', label: 'Settimana' },
  { value: 'day', label: 'Giorno' },
  { value: 'agenda', label: 'Agenda' },
]

const WEEK_START_OPTIONS: { value: WeekStartType; label: string }[] = [
  { value: 'monday', label: 'Lunedì' },
  { value: 'sunday', label: 'Domenica' },
]

const _DENSITY_OPTIONS: { value: ViewDensity; label: string }[] = [
  { value: 'compact', label: 'Compatta' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'spacious', label: 'Spaziosa' },
]

const RECURRENCE_OPTIONS: { value: RecurrenceOption; label: string }[] = [
  { value: 'none', label: 'Nessuna' },
  { value: '2_weeks', label: '2 settimane' },
  { value: '1_month', label: '1 mese' },
  { value: '6_months', label: '6 mesi' },
  { value: '1_year', label: '1 anno' },
  { value: 'until_lessons', label: 'Fino a esaurimento lezioni' },
]

const WORK_DAYS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Lunedì' },
  { key: 'tuesday', label: 'Martedì' },
  { key: 'wednesday', label: 'Mercoledì' },
  { key: 'thursday', label: 'Giovedì' },
  { key: 'friday', label: 'Venerdì' },
  { key: 'saturday', label: 'Sabato' },
  { key: 'sunday', label: 'Domenica' },
]

const DEFAULT_WORK_SLOT = { start: '09:00', end: '18:00' }

const GRID_HOURS_24 = Array.from({ length: 24 }, (_, i) => i)
const GRID_MINUTES_60 = Array.from({ length: 60 }, (_, i) => i)

function parseTimeHHmm(s: string): { h: number; m: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(s.trim())
  if (!match) return { h: 7, m: 0 }
  let h = Number(match[1])
  let m = Number(match[2])
  if (Number.isNaN(h) || h < 0) h = 0
  if (h > 23) h = 23
  if (Number.isNaN(m) || m < 0) m = 0
  if (m > 59) m = 59
  return { h, m }
}

function formatTimeHHmm(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function normalizeTimeHHmm(s: string): string {
  const { h, m } = parseTimeHHmm(s)
  return formatTimeHHmm(h, m)
}

/** Etichette leggibili per i colori (utente finale, nessun codice) */
const COLOR_LABELS: Record<string, string> = {
  azzurro: 'Azzurro',
  blu: 'Blu',
  viola_scuro: 'Viola scuro',
  viola_chiaro: 'Lavanda',
  lilla: 'Lilla',
  rosa: 'Rosa',
  rosso: 'Rosso',
  arancione: 'Arancione',
  giallo: 'Giallo',
  verde: 'Verde',
  verde_chiaro: 'Verde chiaro',
  marrone: 'Marrone',
  grigio: 'Grigio',
}

const COLOR_OPTIONS = Object.entries(APPOINTMENT_COLORS).map(([key, hex]) => ({
  value: key as AppointmentColor,
  label: COLOR_LABELS[key] ?? key.replace(/_/g, ' '),
  hex,
}))

/** Tipi disponibili per Trainer/Admin */
const TYPES_TRAINER = [
  'allenamento_singolo',
  'allenamento_doppio',
  'programma',
  'prova',
  'riunione',
  'privato',
  'allenamento',
]

/** Tipi disponibili per Collaboratori (nutrizionista, massaggiatore) */
const TYPES_COLLABORATOR = [
  'appuntamento_normale',
  'prova',
  'controllo',
  'riunione',
  'privato',
  'massaggio',
  'nutrizionista',
]

function typesForRole(role: string | null): string[] {
  if (role === 'trainer' || role === 'admin') return TYPES_TRAINER
  if (role === 'nutrizionista') return [...TYPES_COLLABORATOR.filter((t) => t !== 'massaggio')]
  if (role === 'massaggiatore') return [...TYPES_COLLABORATOR.filter((t) => t !== 'nutrizionista')]
  return TYPES_COLLABORATOR
}

export default function CalendarioImpostazioniPage() {
  const { showLoader } = useCalendarSettingsPageGuard()
  const { role } = useAuth()
  const { notify } = useNotify()
  const { settings, loading, saving, mutate, staffProfileId } = useStaffCalendarSettings()

  const [defaultView, setDefaultView] = useState<CalendarViewType>('month')
  const [defaultWeekStart, setDefaultWeekStart] = useState<WeekStartType>('monday')
  const [enabledTypes, setEnabledTypes] = useState<string[]>([])
  const [durations, setDurations] = useState<Record<string, number>>({})
  const [typeColors, setTypeColors] = useState<Record<string, string>>({})
  const [showFreePass, setShowFreePass] = useState(true)
  const [showCollaborators, setShowCollaborators] = useState(true)
  const [maxFreePassAthletes, setMaxFreePassAthletes] = useState(
    DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT,
  )
  const [recurrenceOptions, setRecurrenceOptions] = useState<RecurrenceOption[]>([
    'none',
    '2_weeks',
    '1_month',
    '6_months',
    '1_year',
    'until_lessons',
  ])
  const [slotDuration, setSlotDuration] = useState(15)
  const [gridMinTime, setGridMinTime] = useState('07:00')
  const [gridMaxTime, setGridMaxTime] = useState('22:00')
  const [customTypes, setCustomTypes] = useState<CustomAppointmentType[]>([])
  const [addCustomOpen, setAddCustomOpen] = useState(false)
  const [newCustomLabel, setNewCustomLabel] = useState('')
  const [newCustomDuration, setNewCustomDuration] = useState(60)
  const [newCustomColor, setNewCustomColor] = useState<string>('grigio')
  const [workHours, setWorkHours] = useState<Record<string, { start: string; end: string } | null>>(
    {},
  )
  const [viewDensity, setViewDensity] = useState<ViewDensity>('comfort')
  const [typeCellWidth, setTypeCellWidth] = useState<Record<string, TypeCellWidth>>({})

  const availableTypes = typesForRole(role ?? null)
  const isTrainerOrAdmin = role === 'trainer' || role === 'admin'
  /** Solo admin e marketing possono attivare/disattivare i calendari collaboratori */
  const canToggleCollaboratorsCalendars = role === 'admin' || role === 'marketing'
  /** Tutti i tipi da mostrare in Durate/Colori: abilitati di sistema + custom. */
  const allEnabledTypeKeys = useMemo(
    () => [...enabledTypes, ...customTypes.map((c) => c.key)],
    [enabledTypes, customTypes],
  )

  function labelForType(typeKey: string): string {
    const custom = customTypes.find((c) => c.key === typeKey)
    return custom ? custom.label : typeKey.replace(/_/g, ' ')
  }

  useEffect(() => {
    if (!settings) {
      const defaultDurations = getDefaultDurationsForRole(role ?? '')
      setEnabledTypes(availableTypes)
      setDurations(defaultDurations)
      const colors: Record<string, string> = {}
      availableTypes.forEach((t) => {
        colors[t] = DEFAULT_TYPE_COLORS[t] ?? 'grigio'
      })
      setTypeColors(colors)
      setCustomTypes([])
      setWorkHours({})
      setViewDensity('comfort')
      const halfAll: Record<string, TypeCellWidth> = {}
      availableTypes.forEach((t) => {
        halfAll[t] = 'half'
      })
      setTypeCellWidth(halfAll)
      return
    }
    setDefaultView(settings.default_calendar_view)
    setDefaultWeekStart(settings.default_week_start)
    setEnabledTypes(
      settings.enabled_appointment_types.length
        ? settings.enabled_appointment_types
        : availableTypes,
    )
    setCustomTypes(
      settings.custom_appointment_types?.length ? settings.custom_appointment_types : [],
    )
    const mergedDurations = {
      ...getDefaultDurationsForRole(role ?? ''),
      ...settings.default_durations,
    }
    settings.custom_appointment_types?.forEach((c) => {
      mergedDurations[c.key] = c.default_duration
    })
    setDurations(
      Object.keys(mergedDurations).length
        ? mergedDurations
        : getDefaultDurationsForRole(role ?? ''),
    )
    const mergedColors: Record<string, string> = {}
    availableTypes.forEach((t) => {
      mergedColors[t] = settings.type_colors[t] ?? DEFAULT_TYPE_COLORS[t] ?? 'grigio'
    })
    settings.custom_appointment_types?.forEach((c) => {
      mergedColors[c.key] = c.color
    })
    setTypeColors(
      Object.keys(mergedColors).length
        ? mergedColors
        : Object.fromEntries(availableTypes.map((t) => [t, DEFAULT_TYPE_COLORS[t] ?? 'grigio'])),
    )
    setShowFreePass(settings.show_free_pass_calendar)
    setShowCollaborators(settings.show_collaborators_calendars)
    setMaxFreePassAthletes(settings.max_free_pass_athletes_per_slot)
    setRecurrenceOptions(
      settings.recurrence_options.length
        ? settings.recurrence_options
        : ['none', '2_weeks', '1_month', '6_months', '1_year', 'until_lessons'],
    )
    setSlotDuration(
      [15, 30, 45, 60, 90].includes(settings.slot_duration_minutes)
        ? settings.slot_duration_minutes
        : 15,
    )
    const gMin = settings.grid_min_time?.trim()
    const gMax = settings.grid_max_time?.trim()
    setGridMinTime(gMin && /^\d{1,2}:\d{2}$/.test(gMin) ? normalizeTimeHHmm(gMin) : '07:00')
    setGridMaxTime(gMax && /^\d{1,2}:\d{2}$/.test(gMax) ? normalizeTimeHHmm(gMax) : '22:00')
    const wh =
      settings.work_hours && typeof settings.work_hours === 'object' ? settings.work_hours : {}
    const merged: Record<string, { start: string; end: string } | null> = {}
    WORK_DAYS.forEach((d) => {
      const v = wh[d.key]
      merged[d.key] =
        v && typeof v === 'object' && v.start && v.end ? { start: v.start, end: v.end } : null
    })
    setWorkHours(merged)
    setViewDensity((settings.view_density as ViewDensity) ?? 'comfort')
    const fromSettings = (settings.type_cell_width ?? {}) as Record<string, TypeCellWidth>
    const nextCellWidth: Record<string, TypeCellWidth> = {}
    availableTypes.forEach((t) => {
      nextCellWidth[t] = fromSettings[t] ?? 'half'
    })
    ;(settings.custom_appointment_types ?? []).forEach((c) => {
      nextCellWidth[c.key] = fromSettings[c.key] ?? 'half'
    })
    setTypeCellWidth(nextCellWidth)
  }, [settings, role, availableTypes])

  const handleToggleType = (type: string) => {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const handleAddCustomType = () => {
    const label = newCustomLabel.trim()
    if (!label) return
    const key = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const newCustom: CustomAppointmentType = {
      key,
      label,
      default_duration: newCustomDuration,
      color: newCustomColor,
    }
    setCustomTypes((prev) => [...prev, newCustom])
    setDurations((prev) => ({ ...prev, [key]: newCustomDuration }))
    setTypeColors((prev) => ({ ...prev, [key]: newCustomColor }))
    setTypeCellWidth((prev) => ({ ...prev, [key]: 'half' }))
    setNewCustomLabel('')
    setNewCustomDuration(60)
    setNewCustomColor('grigio')
    setAddCustomOpen(false)
  }

  const handleRemoveCustomType = (key: string) => {
    setCustomTypes((prev) => prev.filter((c) => c.key !== key))
    setDurations((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setTypeColors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setTypeCellWidth((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSave = async () => {
    try {
      const defaultDurationsFallback =
        role === 'trainer' || role === 'admin'
          ? DEFAULT_DURATIONS_TRAINER
          : DEFAULT_DURATIONS_COLLABORATOR
      const durationsToSave: Record<string, number> = {}
      allEnabledTypeKeys.forEach((t) => {
        durationsToSave[t] =
          durations[t] ??
          defaultDurationsFallback[t] ??
          customTypes.find((c) => c.key === t)?.default_duration ??
          60
      })
      const customToSave: CustomAppointmentType[] = customTypes.map((c) => ({
        key: c.key,
        label: c.label,
        default_duration: durations[c.key] ?? c.default_duration,
        color: typeColors[c.key] ?? c.color,
      }))
      const workHoursToSave: Record<string, { start: string; end: string } | null> = {}
      WORK_DAYS.forEach((d) => {
        const v = workHours[d.key]
        workHoursToSave[d.key] = v && v.start && v.end ? { start: v.start, end: v.end } : null
      })
      await mutate({
        default_calendar_view: defaultView,
        default_week_start: defaultWeekStart,
        enabled_appointment_types: enabledTypes,
        custom_appointment_types: customToSave,
        default_durations: durationsToSave,
        type_colors: typeColors,
        show_free_pass_calendar: showFreePass,
        ...(canToggleCollaboratorsCalendars && {
          show_collaborators_calendars: showCollaborators,
        }),
        recurrence_options: recurrenceOptions,
        slot_duration_minutes: slotDuration,
        grid_min_time: normalizeTimeHHmm(gridMinTime),
        grid_max_time: normalizeTimeHHmm(gridMaxTime),
        max_free_pass_athletes_per_slot: maxFreePassAthletes,
        work_hours: workHoursToSave,
        view_density: viewDensity,
        type_cell_width: typeCellWidth,
      })
      notify(
        'Impostazioni salvate. I tipi personalizzati saranno disponibili nel form nuovo appuntamento.',
        'success',
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      notify(msg, 'error', 'Errore salvataggio')
    }
  }

  if (showLoader || (!loading && !staffProfileId)) {
    return null
  }

  const calendarPath =
    role === 'nutrizionista'
      ? '/dashboard/nutrizionista/calendario'
      : role === 'massaggiatore'
        ? '/dashboard/massaggiatore/calendario'
        : '/dashboard/calendario'

  const DS_SECTION =
    'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] overflow-hidden p-4 sm:p-5 md:p-6 space-y-4'
  const sectionTitleClass = 'text-base sm:text-lg font-semibold text-text-primary'
  const sectionDescClass = 'text-sm text-text-secondary'
  const labelClass = 'text-sm font-medium text-text-secondary'
  const inputClass =
    'min-h-[44px] rounded-md border border-white/10 bg-white/[0.04] text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/20 focus:border-primary/30'

  return (
    <StaffContentLayout
      title="Impostazioni calendario"
      description="Tipi di appuntamento, durate, colori e vista predefinita."
      icon={<Settings className="h-8 w-8" />}
      theme="default"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={calendarPath}
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-primary/20 hover:bg-white/[0.04] transition-colors text-sm touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span>Calendario</span>
          </Link>
          <Button onClick={handleSave} disabled={saving} className="min-h-[44px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>
      }
      className="space-y-4 sm:space-y-6 md:space-y-8"
    >
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <section className={DS_SECTION}>
          <div>
            <h2 className={sectionTitleClass}>Tipologie abilitate</h2>
            <p className={sectionDescClass + ' mt-1'}>
              Scegli quali tipi di appuntamento sono disponibili quando crei un evento.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-4 pt-1">
            {availableTypes.map((type) => (
              <div key={type} className="flex flex-col gap-1.5">
                <label className="flex cursor-pointer items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors w-fit">
                  <input
                    type="checkbox"
                    checked={enabledTypes.includes(type)}
                    onChange={() => handleToggleType(type)}
                    className="h-4 w-4 rounded border-white/20 bg-background-secondary text-primary focus:ring-primary/40"
                  />
                  <span className="text-sm text-text-primary capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                </label>
                <select
                  value={typeCellWidth[type] ?? 'half'}
                  onChange={(e) =>
                    setTypeCellWidth((prev) => ({
                      ...prev,
                      [type]: e.target.value as TypeCellWidth,
                    }))
                  }
                  className="min-h-[40px] w-full min-w-[120px] rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="half">Mezza cella</option>
                  <option value="full">Intera cella</option>
                </select>
              </div>
            ))}
          </div>
          {customTypes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className={labelClass}>Tipi personalizzati</p>
              <div className="flex flex-wrap gap-3">
                {customTypes.map((c) => (
                  <div key={c.key} className="flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-text-primary w-fit">
                      {c.label}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomType(c.key)}
                        className="rounded p-1 hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors"
                        aria-label="Rimuovi tipo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                    <select
                      value={typeCellWidth[c.key] ?? 'half'}
                      onChange={(e) =>
                        setTypeCellWidth((prev) => ({
                          ...prev,
                          [c.key]: e.target.value as TypeCellWidth,
                        }))
                      }
                      className="min-h-[40px] w-full min-w-[120px] rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    >
                      <option value="half">Mezza cella</option>
                      <option value="full">Intera cella</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="pt-2 space-y-3">
            <p className="text-sm text-text-secondary">
              Puoi creare tipi personalizzati (es. Fisioterapia, Valutazione). Dopo aver cliccato{' '}
              <strong>Aggiungi</strong>, il tipo apparirà nell’elenco sopra; clicca poi{' '}
              <strong>Salva</strong> in alto per memorizzare. Il tipo sarà disponibile nel form
              quando crei un nuovo appuntamento.
            </p>
            {!addCustomOpen ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddCustomOpen(true)}
                className="min-h-[44px] border-white/10 hover:bg-white/[0.04] hover:border-primary/20"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Aggiungi tipo
              </Button>
            ) : (
              <div className="flex flex-wrap items-end gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass}>Nome</Label>
                  <Input
                    placeholder="es. Fisioterapia"
                    value={newCustomLabel}
                    onChange={(e) => setNewCustomLabel(e.target.value)}
                    className={`w-40 ${inputClass}`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass}>Durata (min)</Label>
                  <Input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={newCustomDuration}
                    onChange={(e) => setNewCustomDuration(Number(e.target.value) || 60)}
                    className={`w-24 ${inputClass}`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass}>Colore in calendario</Label>
                  <select
                    value={newCustomColor}
                    onChange={(e) => setNewCustomColor(e.target.value)}
                    className={`h-11 min-h-[44px] w-36 rounded-md border border-white/10 bg-white/[0.04] text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomType}
                    disabled={!newCustomLabel.trim()}
                    className="min-h-[44px]"
                  >
                    Aggiungi
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddCustomOpen(false)}
                    className="min-h-[44px] text-text-secondary"
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className={DS_SECTION}>
          <div>
            <h2 className={sectionTitleClass}>Durate default (minuti)</h2>
            <p className={sectionDescClass + ' mt-1'}>
              Durata predefinita quando crei un nuovo appuntamento di questo tipo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {allEnabledTypeKeys.map((type) => (
              <div key={type} className="flex items-center gap-3">
                <Label className={`min-w-[140px] capitalize ${labelClass}`}>
                  {labelForType(type)}
                </Label>
                <Input
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={durations[type] ?? ''}
                  onChange={(e) =>
                    setDurations((prev) => ({ ...prev, [type]: Number(e.target.value) || 0 }))
                  }
                  className={`w-24 ${inputClass}`}
                />
              </div>
            ))}
          </div>
        </section>

        <section className={DS_SECTION}>
          <div>
            <h2 className={sectionTitleClass}>Colori per tipo</h2>
            <p className={sectionDescClass + ' mt-1'}>
              Colore con cui l’appuntamento appare in calendario.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {allEnabledTypeKeys.map((type) => (
              <div key={type} className="flex items-center gap-3">
                <Label className={`min-w-[140px] capitalize ${labelClass}`}>
                  {labelForType(type)}
                </Label>
                <select
                  value={typeColors[type] ?? 'grigio'}
                  onChange={(e) => setTypeColors((prev) => ({ ...prev, [type]: e.target.value }))}
                  className={`min-h-[44px] w-32 rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span
                  className="h-8 w-8 shrink-0 rounded-lg border border-white/10"
                  style={{
                    backgroundColor:
                      APPOINTMENT_COLORS[(typeColors[type] as AppointmentColor) ?? 'grigio'],
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className={DS_SECTION}>
          <div>
            <h2 className={sectionTitleClass}>Vista e griglia</h2>
            <p className={sectionDescClass + ' mt-1'}>
              Vista iniziale del calendario e step della griglia oraria. Orari griglia in formato 24
              ore (es. 07:00–22:00).
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label className={labelClass} htmlFor="calendar-default-view">
                Vista predefinita
              </Label>
              <select
                id="calendar-default-view"
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value as CalendarViewType)}
                className={`min-h-[44px] w-full max-w-[280px] rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
              >
                {VIEW_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label className={labelClass} htmlFor="calendar-week-start">
                Inizio settimana
              </Label>
              <select
                id="calendar-week-start"
                value={defaultWeekStart}
                onChange={(e) => setDefaultWeekStart(e.target.value as WeekStartType)}
                className={`min-h-[44px] w-full max-w-[280px] rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
              >
                {WEEK_START_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label className={labelClass} htmlFor="calendar-slot-duration">
                Step griglia (min)
              </Label>
              <select
                id="calendar-slot-duration"
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className={`min-h-[44px] w-full max-w-[160px] rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
              >
                {[15, 30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>
                    {m === 90 ? '1h 30min' : `${m} min`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0 sm:col-span-2 lg:col-span-1">
              <span className={labelClass} id="calendar-grid-min-label">
                Griglia dalle
              </span>
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-labelledby="calendar-grid-min-label"
              >
                <select
                  id="calendar-grid-min-hour"
                  aria-label="Ora inizio griglia (24 h)"
                  value={parseTimeHHmm(gridMinTime).h}
                  onChange={(e) => {
                    const p = parseTimeHHmm(gridMinTime)
                    setGridMinTime(formatTimeHHmm(Number(e.target.value), p.m))
                  }}
                  className={`min-h-[44px] w-[4.75rem] shrink-0 rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-2 text-sm tabular-nums focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
                >
                  {GRID_HOURS_24.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-text-tertiary select-none" aria-hidden>
                  :
                </span>
                <select
                  id="calendar-grid-min-minute"
                  aria-label="Minuti inizio griglia"
                  value={parseTimeHHmm(gridMinTime).m}
                  onChange={(e) => {
                    const p = parseTimeHHmm(gridMinTime)
                    setGridMinTime(formatTimeHHmm(p.h, Number(e.target.value)))
                  }}
                  className={`min-h-[44px] w-[4.75rem] shrink-0 rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-2 text-sm tabular-nums focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
                >
                  {GRID_MINUTES_60.map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0 sm:col-span-2 lg:col-span-1">
              <span className={labelClass} id="calendar-grid-max-label">
                Griglia alle
              </span>
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-labelledby="calendar-grid-max-label"
              >
                <select
                  id="calendar-grid-max-hour"
                  aria-label="Ora fine griglia (24 h)"
                  value={parseTimeHHmm(gridMaxTime).h}
                  onChange={(e) => {
                    const p = parseTimeHHmm(gridMaxTime)
                    setGridMaxTime(formatTimeHHmm(Number(e.target.value), p.m))
                  }}
                  className={`min-h-[44px] w-[4.75rem] shrink-0 rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-2 text-sm tabular-nums focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
                >
                  {GRID_HOURS_24.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-text-tertiary select-none" aria-hidden>
                  :
                </span>
                <select
                  id="calendar-grid-max-minute"
                  aria-label="Minuti fine griglia"
                  value={parseTimeHHmm(gridMaxTime).m}
                  onChange={(e) => {
                    const p = parseTimeHHmm(gridMaxTime)
                    setGridMaxTime(formatTimeHHmm(p.h, Number(e.target.value)))
                  }}
                  className={`min-h-[44px] w-[4.75rem] shrink-0 rounded-md border border-white/10 bg-white/[0.04] text-text-primary px-2 text-sm tabular-nums focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${inputClass}`}
                >
                  {GRID_MINUTES_60.map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {isTrainerOrAdmin && (
          <section className={DS_SECTION}>
            <div>
              <h2 className={sectionTitleClass}>Free Pass</h2>
              <p className={sectionDescClass + ' mt-1'}>
                Mostra nel calendario gli slot Libera prenotazione.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              <label className="flex cursor-pointer items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors w-fit">
                <input
                  type="checkbox"
                  checked={showFreePass}
                  onChange={(e) => setShowFreePass(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-background-secondary text-primary focus:ring-primary/40"
                />
                <span className="text-sm text-text-primary">Mostra calendario Free Pass</span>
              </label>
              {canToggleCollaboratorsCalendars && (
                <label className="flex cursor-pointer items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors w-fit">
                  <input
                    type="checkbox"
                    checked={showCollaborators}
                    onChange={(e) => setShowCollaborators(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-background-secondary text-primary focus:ring-primary/40"
                  />
                  <span className="text-sm text-text-primary">Mostra calendari collaboratori</span>
                </label>
              )}
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Max atleti per slot Free Pass</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={maxFreePassAthletes}
                  onChange={(e) =>
                    setMaxFreePassAthletes(
                      Number(e.target.value) || DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT,
                    )
                  }
                  className={`w-24 ${inputClass}`}
                />
              </div>
            </div>
          </section>
        )}

        <section className={DS_SECTION}>
          <div>
            <h2 className={sectionTitleClass}>Opzioni ripetizione</h2>
            <p className={sectionDescClass + ' mt-1'}>
              Quali opzioni di ripetizione mostrare nel form nuovo appuntamento.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {RECURRENCE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={recurrenceOptions.includes(opt.value)}
                  onChange={() =>
                    setRecurrenceOptions((prev) =>
                      prev.includes(opt.value)
                        ? prev.filter((r) => r !== opt.value)
                        : [...prev, opt.value],
                    )
                  }
                  className="h-4 w-4 rounded border-white/20 bg-background-secondary text-primary focus:ring-primary/40"
                />
                <span className="text-sm text-text-primary">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={DS_SECTION}>
          <div>
            <h2 className={sectionTitleClass}>Orari di lavoro</h2>
            <p className={sectionDescClass + ' mt-1'}>
              Fasce orarie in cui sei disponibile (opzionale). Utili per visualizzazioni e blocchi
              ricorrenti.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {WORK_DAYS.map((d) => {
              const isActive = workHours[d.key] !== null && workHours[d.key] !== undefined
              const slot = workHours[d.key] ?? DEFAULT_WORK_SLOT
              return (
                <div
                  key={d.key}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4"
                >
                  <label className="flex min-w-[100px] cursor-pointer items-center gap-2.5 min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={!!isActive}
                      onChange={(e) => {
                        setWorkHours((prev) => ({
                          ...prev,
                          [d.key]: e.target.checked ? { start: slot.start, end: slot.end } : null,
                        }))
                      }}
                      className="h-4 w-4 rounded border-white/20 bg-background-secondary text-primary focus:ring-primary/40"
                    />
                    <span className="text-sm font-medium text-text-primary">{d.label}</span>
                  </label>
                  {isActive && (
                    <>
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          setWorkHours((prev) => ({
                            ...prev,
                            [d.key]: {
                              ...(prev[d.key] ?? DEFAULT_WORK_SLOT),
                              start: e.target.value,
                            },
                          }))
                        }
                        className={`w-28 ${inputClass}`}
                      />
                      <span className="text-text-tertiary">–</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          setWorkHours((prev) => ({
                            ...prev,
                            [d.key]: { ...(prev[d.key] ?? DEFAULT_WORK_SLOT), end: e.target.value },
                          }))
                        }
                        className={`w-28 ${inputClass}`}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </StaffContentLayout>
  )
}
