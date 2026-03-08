/**
 * Tipi semplificati per appuntamenti
 * Struttura semplificata senza complessità aggiuntive
 */

// Colori disponibili per gli appuntamenti (stile Google Calendar)
export const APPOINTMENT_COLORS = {
  azzurro: '#039BE5',
  blu: '#4285F4',
  viola_scuro: '#7E57C2',
  viola_chiaro: '#B39DDB',
  lilla: '#B39DDB',
  rosa: '#D81B60',
  rosso: '#E53935',
  arancione: '#F4511E',
  giallo: '#F6BF26',
  verde: '#33B679',
  verde_chiaro: '#0B8043',
  marrone: '#795548',
  grigio: '#9E9E9E',
} as const

export type AppointmentColor = keyof typeof APPOINTMENT_COLORS

export interface Appointment {
  id: string
  org_id?: string | null
  /** Null solo per slot "Libera prenotazione" (is_open_booking_day = true) */
  athlete_id: string | null
  staff_id: string
  trainer_id?: string | null
  starts_at: string
  ends_at: string
  /** Tipo sistema (es. allenamento_singolo) o chiave custom da staff_calendar_settings.custom_appointment_types */
  type: string
  status: 'attivo' | 'completato' | 'annullato' | 'in_corso'
  /** training | nutrition | massage (per trigger DEBIT e bottone Completa seduta) */
  service_type?: 'training' | 'nutrition' | 'massage' | null
  color?: AppointmentColor | null
  notes?: string | null
  location?: string | null
  cancelled_at?: string | null
  recurrence_rule?: string | null
  created_at: string
  updated_at?: string | null
  /** true = slot Libera prenotazione (trainer/admin); atleta può prenotare in questo intervallo */
  is_open_booking_day?: boolean
  /** 'athlete' = creato dall'atleta; 'trainer' = dal PT; 'admin' = Libera prenotazione per tutta l'org */
  created_by_role?: 'athlete' | 'trainer' | 'admin' | null
  // Campi denormalizzati per visualizzazione (popolati da join)
  athlete_name?: string | null
  athlete_avatar_url?: string | null
  staff_name?: string | null
  trainer_name?: string | null
  /** Lezioni rimanenti (lesson_counters) per colore rosso e badge 5/10 */
  lessons_remaining?: number
}

export type AppointmentTable = Appointment
export type AppointmentUI = Appointment

export interface CreateAppointmentData {
  /** Obbligatorio per appuntamenti normali; assente per slot Libera prenotazione */
  athlete_id?: string
  staff_id: string
  starts_at: string
  ends_at: string
  /** Tipo sistema o chiave custom da staff_calendar_settings.custom_appointment_types */
  type: string
  status?: 'attivo' | 'completato' | 'annullato' | 'in_corso'
  color?: AppointmentColor | null
  notes?: string | null
  location?: string | null
  org_id?: string
  recurrence_rule?: string | null
  created_by_role?: 'athlete' | 'trainer' | 'admin'
  /** true per creare uno slot "Libera prenotazione" (solo trainer/admin) */
  is_open_booking_day?: boolean
  /** Ripetizione: stessa data ogni settimana per il periodo indicato (solo in creazione) */
  recurrence?: 'none' | '2_weeks' | '1_month' | '6_months' | '1_year' | 'until_lessons'
}

export interface EditAppointmentData extends CreateAppointmentData {
  id: string
}

export type UpdateAppointmentData = Partial<CreateAppointmentData> & {
  id: string
}
