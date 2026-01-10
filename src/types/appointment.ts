/**
 * Tipi semplificati per appuntamenti
 * Struttura semplificata senza complessità aggiuntive
 */

export interface Appointment {
  id: string
  org_id?: string | null
  athlete_id: string
  staff_id: string
  trainer_id?: string | null
  starts_at: string
  ends_at: string
  type:
    | 'allenamento'
    | 'prova'
    | 'valutazione'
    | 'prima_visita'
    | 'riunione'
    | 'massaggio'
    | 'nutrizionista'
  status: 'attivo' | 'completato' | 'annullato' | 'in_corso'
  notes?: string | null
  location?: string | null
  cancelled_at?: string | null
  recurrence_rule?: string | null
  created_at: string
  updated_at?: string | null
  // Campi denormalizzati per visualizzazione (popolati da join)
  athlete_name?: string | null
  staff_name?: string | null
  trainer_name?: string | null
}

export type AppointmentTable = Appointment
export type AppointmentUI = Appointment

export interface CreateAppointmentData {
  athlete_id: string
  staff_id: string
  starts_at: string
  ends_at: string
  type:
    | 'allenamento'
    | 'prova'
    | 'valutazione'
    | 'prima_visita'
    | 'riunione'
    | 'massaggio'
    | 'nutrizionista'
  status?: 'attivo' | 'completato' | 'annullato' | 'in_corso'
  notes?: string | null
  location?: string | null
  org_id?: string
  recurrence_rule?: string | null
}

export interface EditAppointmentData extends CreateAppointmentData {
  id: string
}

export type UpdateAppointmentData = Partial<CreateAppointmentData> & {
  id: string
}
