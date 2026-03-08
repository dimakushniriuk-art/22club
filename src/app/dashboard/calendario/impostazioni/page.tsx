'use client'

import { useState, useEffect, useMemo } from 'react'
import { Settings, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useCalendarSettingsPageGuard } from '@/hooks/calendar/use-calendar-page-guard'
import { useStaffCalendarSettings } from '@/hooks/calendar/use-staff-calendar-settings'
import { useAuth } from '@/providers/auth-provider'
import { Button, Input, Label } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { APPOINTMENT_COLORS, type AppointmentColor } from '@/types/appointment'
import {
  getDefaultDurationsForRole,
  DEFAULT_TYPE_COLORS,
  DEFAULT_DURATIONS_TRAINER,
  DEFAULT_DURATIONS_COLLABORATOR,
} from '@/lib/calendar-defaults'
import type {
  CalendarViewType,
  WeekStartType,
  RecurrenceOption,
  CustomAppointmentType,
  ViewDensity,
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

const DENSITY_OPTIONS: { value: ViewDensity; label: string }[] = [
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

const COLOR_OPTIONS = Object.entries(APPOINTMENT_COLORS).map(([key, hex]) => ({
  value: key as AppointmentColor,
  label: key,
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
  const { settings, loading, saving, mutate, staffProfileId } = useStaffCalendarSettings()

  const [defaultView, setDefaultView] = useState<CalendarViewType>('month')
  const [defaultWeekStart, setDefaultWeekStart] = useState<WeekStartType>('monday')
  const [enabledTypes, setEnabledTypes] = useState<string[]>([])
  const [durations, setDurations] = useState<Record<string, number>>({})
  const [typeColors, setTypeColors] = useState<Record<string, string>>({})
  const [showFreePass, setShowFreePass] = useState(true)
  const [showCollaborators, setShowCollaborators] = useState(true)
  const [maxFreePassAthletes, setMaxFreePassAthletes] = useState(4)
  const [recurrenceOptions, setRecurrenceOptions] = useState<RecurrenceOption[]>(['none', '2_weeks', '1_month', '6_months', '1_year', 'until_lessons'])
  const [slotDuration, setSlotDuration] = useState(15)
  const [customTypes, setCustomTypes] = useState<CustomAppointmentType[]>([])
  const [addCustomOpen, setAddCustomOpen] = useState(false)
  const [newCustomLabel, setNewCustomLabel] = useState('')
  const [newCustomDuration, setNewCustomDuration] = useState(60)
  const [newCustomColor, setNewCustomColor] = useState<string>('grigio')
  const [workHours, setWorkHours] = useState<Record<string, { start: string; end: string } | null>>({})
  const [viewDensity, setViewDensity] = useState<ViewDensity>('comfort')

  const availableTypes = typesForRole(role ?? null)
  const isTrainerOrAdmin = role === 'trainer' || role === 'admin'
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
      return
    }
    setDefaultView(settings.default_calendar_view)
    setDefaultWeekStart(settings.default_week_start)
    setEnabledTypes(settings.enabled_appointment_types.length ? settings.enabled_appointment_types : availableTypes)
    setCustomTypes(settings.custom_appointment_types?.length ? settings.custom_appointment_types : [])
    const mergedDurations = { ...getDefaultDurationsForRole(role ?? ''), ...settings.default_durations }
    settings.custom_appointment_types?.forEach((c) => {
      mergedDurations[c.key] = c.default_duration
    })
    setDurations(Object.keys(mergedDurations).length ? mergedDurations : getDefaultDurationsForRole(role ?? ''))
    const mergedColors: Record<string, string> = {}
    availableTypes.forEach((t) => {
      mergedColors[t] = settings.type_colors[t] ?? DEFAULT_TYPE_COLORS[t] ?? 'grigio'
    })
    settings.custom_appointment_types?.forEach((c) => {
      mergedColors[c.key] = c.color
    })
    setTypeColors(Object.keys(mergedColors).length ? mergedColors : Object.fromEntries(availableTypes.map((t) => [t, DEFAULT_TYPE_COLORS[t] ?? 'grigio'])))
    setShowFreePass(settings.show_free_pass_calendar)
    setShowCollaborators(settings.show_collaborators_calendars)
    setMaxFreePassAthletes(settings.max_free_pass_athletes_per_slot)
    setRecurrenceOptions(settings.recurrence_options.length ? settings.recurrence_options : ['none', '2_weeks', '1_month', '6_months', '1_year', 'until_lessons'])
    setSlotDuration(settings.slot_duration_minutes)
    const wh = settings.work_hours && typeof settings.work_hours === 'object' ? settings.work_hours : {}
    const merged: Record<string, { start: string; end: string } | null> = {}
    WORK_DAYS.forEach((d) => {
      const v = wh[d.key]
      merged[d.key] = v && typeof v === 'object' && v.start && v.end ? { start: v.start, end: v.end } : null
    })
    setWorkHours(merged)
    setViewDensity((settings.view_density as ViewDensity) ?? 'comfort')
  }, [settings, role, availableTypes])

  const handleToggleType = (type: string) => {
    setEnabledTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
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
  }

  const handleSave = async () => {
    const defaultDurationsFallback = role === 'trainer' || role === 'admin' ? DEFAULT_DURATIONS_TRAINER : DEFAULT_DURATIONS_COLLABORATOR
    const durationsToSave: Record<string, number> = {}
    allEnabledTypeKeys.forEach((t) => {
      durationsToSave[t] = durations[t] ?? defaultDurationsFallback[t] ?? (customTypes.find((c) => c.key === t)?.default_duration ?? 60)
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
      show_collaborators_calendars: showCollaborators,
      recurrence_options: recurrenceOptions,
      slot_duration_minutes: slotDuration,
      max_free_pass_athletes_per_slot: maxFreePassAthletes,
      work_hours: workHoursToSave,
      view_density: viewDensity,
    })
  }

  if (showLoader || (!loading && !staffProfileId)) {
    return <LoadingState />
  }

  return (
    <StaffContentLayout
      title="Impostazioni calendario"
      description="Tipologie, durate, colori e preferenze vista."
      icon={<Settings className="h-8 w-8" />}
      actions={
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Salvataggio...' : 'Salva'}
        </Button>
      }
      className="space-y-4 sm:space-y-6"
    >
      <div className="space-y-4 sm:space-y-6">
        <section className="space-y-4 rounded-lg border border-border/60 bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Tipologie abilitate</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {availableTypes.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={enabledTypes.includes(type)}
                  onChange={() => handleToggleType(type)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="capitalize">{type.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
          {customTypes.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm text-muted-foreground">Tipi personalizzati</p>
              <div className="flex flex-wrap gap-2">
                {customTypes.map((c) => (
                  <span
                    key={c.key}
                    className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-sm"
                  >
                    {c.label}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomType(c.key)}
                      className="rounded p-0.5 hover:bg-destructive/20"
                      aria-label="Rimuovi tipo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="pt-2">
            {!addCustomOpen ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setAddCustomOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Aggiungi tipo
              </Button>
            ) : (
              <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input
                    placeholder="es. Fisioterapia"
                    value={newCustomLabel}
                    onChange={(e) => setNewCustomLabel(e.target.value)}
                    className="h-9 w-40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Durata (min)</Label>
                  <Input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={newCustomDuration}
                    onChange={(e) => setNewCustomDuration(Number(e.target.value) || 60)}
                    className="h-9 w-20"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Colore</Label>
                  <select
                    value={newCustomColor}
                    onChange={(e) => setNewCustomColor(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="button" size="sm" onClick={handleAddCustomType} disabled={!newCustomLabel.trim()}>
                  Aggiungi
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setAddCustomOpen(false)}>
                  Annulla
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border/60 bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Durate default (minuti)</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {allEnabledTypeKeys.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Label className="min-w-[140px] capitalize text-muted-foreground">{labelForType(type)}</Label>
                <Input
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={durations[type] ?? ''}
                  onChange={(e) => setDurations((prev) => ({ ...prev, [type]: Number(e.target.value) || 0 }))}
                  className="w-20"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border/60 bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Colori per tipo</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {allEnabledTypeKeys.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Label className="min-w-[140px] capitalize text-muted-foreground">{labelForType(type)}</Label>
                <select
                  value={typeColors[type] ?? 'grigio'}
                  onChange={(e) => setTypeColors((prev) => ({ ...prev, [type]: e.target.value }))}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span
                  className="h-6 w-6 shrink-0 rounded border border-border"
                  style={{ backgroundColor: APPOINTMENT_COLORS[(typeColors[type] as AppointmentColor) ?? 'grigio'] }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border/60 bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Vista e griglia</h2>
          <div className="flex flex-wrap gap-6">
            <div>
              <Label className="text-muted-foreground">Vista predefinita</Label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value as CalendarViewType)}
                className="mt-1 block h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {VIEW_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground">Inizio settimana</Label>
              <select
                value={defaultWeekStart}
                onChange={(e) => setDefaultWeekStart(e.target.value as WeekStartType)}
                className="mt-1 block h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {WEEK_START_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground">Step griglia (min)</Label>
              <Input
                type="number"
                min={15}
                max={60}
                step={15}
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value) || 15)}
                className="mt-1 w-20"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Densità vista</Label>
              <select
                value={viewDensity}
                onChange={(e) => setViewDensity(e.target.value as ViewDensity)}
                className="mt-1 block h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {DENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {isTrainerOrAdmin && (
          <section className="space-y-4 rounded-lg border border-border/60 bg-card/50 p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Calendario Free Pass e collaboratori</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showFreePass}
                  onChange={(e) => setShowFreePass(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span>Mostra calendario Free Pass</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCollaborators}
                  onChange={(e) => setShowCollaborators(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span>Mostra calendari collaboratori</span>
              </label>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Max atleti per slot Free Pass</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={maxFreePassAthletes}
                  onChange={(e) => setMaxFreePassAthletes(Number(e.target.value) || 4)}
                  className="w-20"
                />
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4 rounded-lg border border-border/60 bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Opzioni ripetizione</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {RECURRENCE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={recurrenceOptions.includes(opt.value)}
                  onChange={() =>
                    setRecurrenceOptions((prev) =>
                      prev.includes(opt.value) ? prev.filter((r) => r !== opt.value) : [...prev, opt.value],
                    )
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border/60 bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Orari di lavoro</h2>
          <p className="text-sm text-muted-foreground">
            Imposta le fasce orarie in cui sei disponibile (opzionale). Utile per visualizzazioni e blocchi ricorrenti.
          </p>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {WORK_DAYS.map((d) => {
              const isActive = workHours[d.key] !== null && workHours[d.key] !== undefined
              const slot = workHours[d.key] ?? DEFAULT_WORK_SLOT
              return (
                <div key={d.key} className="flex flex-wrap items-center gap-2 rounded-md border border-border/40 p-3">
                  <label className="flex min-w-[100px] cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!isActive}
                      onChange={(e) => {
                        setWorkHours((prev) => ({
                          ...prev,
                          [d.key]: e.target.checked ? { start: slot.start, end: slot.end } : null,
                        }))
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="font-medium">{d.label}</span>
                  </label>
                  {isActive && (
                    <>
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          setWorkHours((prev) => ({
                            ...prev,
                            [d.key]: { ...(prev[d.key] ?? DEFAULT_WORK_SLOT), start: e.target.value },
                          }))
                        }
                        className="h-9 w-28"
                      />
                      <span className="text-muted-foreground">–</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          setWorkHours((prev) => ({
                            ...prev,
                            [d.key]: { ...(prev[d.key] ?? DEFAULT_WORK_SLOT), end: e.target.value },
                          }))
                        }
                        className="h-9 w-28"
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
