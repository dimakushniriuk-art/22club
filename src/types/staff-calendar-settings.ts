/**
 * Tipi per staff_calendar_settings (impostazioni calendario per staff).
 * Tabella Supabase: staff_calendar_settings.
 */

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda'
export type WeekStartType = 'monday' | 'sunday'
export type RecurrenceOption =
  | 'none'
  | '2_weeks'
  | '1_month'
  | '6_months'
  | '1_year'
  | 'until_lessons'
export type ViewDensity = 'compact' | 'comfort' | 'spacious'

/** Larghezza evento in calendario (time grid): mezza cella (50%, affiancabili) o intera. */
export type TypeCellWidth = 'half' | 'full'

/** Tipo di appuntamento definito dallo staff (es. Fisioterapia, Osteopata). */
export interface CustomAppointmentType {
  key: string
  label: string
  default_duration: number
  color: string
}

export interface StaffCalendarSettings {
  id: string
  staff_id: string
  org_id: string
  default_durations: Record<string, number>
  enabled_appointment_types: string[]
  /** Tipi custom creati dallo staff (key, label, durata default, colore). */
  custom_appointment_types: CustomAppointmentType[]
  type_colors: Record<string, string>
  default_calendar_view: CalendarViewType
  default_week_start: WeekStartType
  show_free_pass_calendar: boolean
  show_collaborators_calendars: boolean
  recurrence_options: RecurrenceOption[]
  work_hours: Record<string, { start: string; end: string } | null> | null
  /** Ora inizio griglia (HH:mm), es. 07:00. Se impostato, la griglia usa questo invece del min da work_hours. */
  grid_min_time?: string | null
  /** Ora fine griglia (HH:mm), es. 22:00. Se impostato, la griglia usa questo invece del max da work_hours. */
  grid_max_time?: string | null
  slot_duration_minutes: number
  max_free_pass_athletes_per_slot: number
  view_density: ViewDensity
  /** Per tipo: 'half' = mezza cella (50%), 'full' = intera. Default in UI: 'half'. */
  type_cell_width?: Record<string, TypeCellWidth> | null
  created_at?: string
  updated_at?: string
}

export type StaffCalendarSettingsInsert = Omit<
  StaffCalendarSettings,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type StaffCalendarSettingsUpdate = Partial<
  Omit<StaffCalendarSettings, 'id' | 'staff_id' | 'created_at'>
>
