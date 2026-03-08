/**
 * Tipi per staff_calendar_settings (impostazioni calendario per staff).
 * Tabella Supabase: staff_calendar_settings.
 */

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda'
export type WeekStartType = 'monday' | 'sunday'
export type RecurrenceOption = 'none' | '2_weeks' | '1_month' | '6_months' | '1_year' | 'until_lessons'
export type ViewDensity = 'compact' | 'comfort' | 'spacious'

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
  slot_duration_minutes: number
  max_free_pass_athletes_per_slot: number
  view_density: ViewDensity
  created_at?: string
  updated_at?: string
}

export type StaffCalendarSettingsInsert = Omit<StaffCalendarSettings, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type StaffCalendarSettingsUpdate = Partial<Omit<StaffCalendarSettings, 'id' | 'staff_id' | 'created_at'>>
