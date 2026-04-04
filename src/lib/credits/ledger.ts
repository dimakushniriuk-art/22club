/**
 * Credit ledger: unica fonte per variazioni crediti.
 * Dopo ogni insert su `payments` che accredita lezioni, chiamare `addCreditFromPayment`
 * (non aggiornare `lesson_counters` dal client: è coerente con il trigger DB sul ledger).
 *
 * Ogni INSERT deve includere `org_id` allineato a `profiles.org_id` (trigger
 * `trg_credit_ledger_athlete_org_match`); il default DB `default-org` fallisce per atleti reali.
 */

import { supabase } from '@/lib/supabase/client'
import type { ServiceType } from '@/lib/abbonamenti-service-type'

/** org_id testuale minuscolo, come `profiles.org_id::text` nel trigger. */
async function orgIdForAthleteProfile(athleteId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', athleteId)
    .maybeSingle()

  if (error) throw error
  const raw = data?.org_id as string | null | undefined
  if (raw == null || String(raw).trim() === '') {
    throw new Error('Profilo atleta senza org_id: impossibile scrivere sul credit_ledger')
  }
  return String(raw).trim().toLowerCase()
}

async function orgIdForAppointmentOrAthlete(
  appointmentId: string,
  athleteId: string,
): Promise<string> {
  const { data: apt, error: aptErr } = await supabase
    .from('appointments')
    .select('org_id')
    .eq('id', appointmentId)
    .maybeSingle()
  if (aptErr) throw aptErr
  const a = apt?.org_id as string | null | undefined
  if (a != null && String(a).trim() !== '') {
    return String(a).trim().toLowerCase()
  }
  return orgIdForAthleteProfile(athleteId)
}

/** Payload minimo dopo insert su payments (con lessons_purchased). */
export type PaymentForLedger = {
  id: string
  athlete_id: string
  lessons_purchased: number
  created_by_staff_id: string
  serviceType: ServiceType
}

/** Payload minimo appuntamento completato (athlete_id, staff per created_by). */
export type AppointmentForLedger = {
  id: string
  athlete_id: string
  /** Tipo servizio per scalare il credito corretto (training/nutrition/massage). */
  service_type?: ServiceType
}

/** Payload per storno pagamento (ledger REVERSAL). */
export type PaymentForReversal = {
  id: string
  athlete_id: string
  lessons_purchased: number
  serviceType: ServiceType
}

const CREDIT_LEDGER_UNIQUE_VIOLATION = '23505'

/**
 * Dopo insert su payments: inserisce riga CREDIT in credit_ledger.
 * Non tocca lesson_counters (lo fa il trigger DB).
 */
export async function addCreditFromPayment(payment: PaymentForLedger): Promise<void> {
  const org_id = await orgIdForAthleteProfile(payment.athlete_id)

  const { error } = await supabase.from('credit_ledger').insert({
    entry_type: 'CREDIT',
    qty: payment.lessons_purchased,
    payment_id: payment.id,
    athlete_id: payment.athlete_id,
    org_id,
    created_by_profile_id: payment.created_by_staff_id,
    service_type: payment.serviceType,
    reason: 'Acquisto crediti',
  })

  if (error) throw error
}

/**
 * Dopo che appointments.status è passato a 'completato': inserisce riga DEBIT.
 * Idempotenza: se fallisce per unique su appointment_id (già scalato), ignora.
 * staffProfileId opzionale (created_by).
 */
export async function addDebitFromAppointment(
  appointment: AppointmentForLedger,
  staffProfileId: string | null,
): Promise<void> {
  const org_id = await orgIdForAppointmentOrAthlete(appointment.id, appointment.athlete_id)

  const { error } = await supabase.from('credit_ledger').insert({
    entry_type: 'DEBIT',
    qty: -1,
    appointment_id: appointment.id,
    athlete_id: appointment.athlete_id,
    org_id,
    created_by_profile_id: staffProfileId ?? undefined,
    service_type: appointment.service_type ?? 'training',
    reason: 'Sessione completata',
  })

  if (error) {
    if (error.code === CREDIT_LEDGER_UNIQUE_VIOLATION) {
      // unique index credit_ledger_unique_appointment_debit: già scalato
      return
    }
    throw error
  }
}

/**
 * Storno pagamento: inserisce REVERSAL in credit_ledger (qty = -lessons_purchased).
 * Chiamare dopo aver impostato payments.status = 'cancelled'.
 * Se insert fallisce per unique (reversal già eseguito), ignora.
 */
export type ManualCreditLedgerInsert = {
  athleteId: string
  entryType: 'CREDIT' | 'DEBIT' | 'REVERSAL'
  qty: number
  serviceType: ServiceType
  reason: string | null
  createdAtIso: string
  createdByProfileId: string | null
  paymentId?: string | null
  appointmentId?: string | null
  appliesToCounter?: boolean
}

/**
 * Inserimento manuale da staff (nessun record `payments` / `appointments` obbligatorio).
 * `org_id` è allineato al profilo atleta (trigger `trg_credit_ledger_athlete_org_match`).
 */
export async function insertManualCreditLedgerRow(
  payload: ManualCreditLedgerInsert,
): Promise<void> {
  const org_id = await orgIdForAthleteProfile(payload.athleteId)

  const { error } = await supabase.from('credit_ledger').insert({
    athlete_id: payload.athleteId,
    org_id,
    entry_type: payload.entryType,
    qty: payload.qty,
    service_type: payload.serviceType,
    reason: payload.reason,
    created_at: payload.createdAtIso,
    created_by_profile_id: payload.createdByProfileId,
    payment_id: payload.paymentId ?? null,
    appointment_id: payload.appointmentId ?? null,
    applies_to_counter: payload.appliesToCounter ?? true,
  })

  if (error) throw error
}

export async function addReversalFromPayment(
  payment: PaymentForReversal,
  createdBy: string | null,
): Promise<void> {
  const org_id = await orgIdForAthleteProfile(payment.athlete_id)

  const { error } = await supabase.from('credit_ledger').insert({
    entry_type: 'REVERSAL',
    qty: -payment.lessons_purchased,
    payment_id: payment.id,
    athlete_id: payment.athlete_id,
    org_id,
    created_by_profile_id: createdBy ?? null,
    service_type: payment.serviceType,
    reason: 'Storno pagamento',
  })

  if (error) {
    if (error.code === CREDIT_LEDGER_UNIQUE_VIOLATION) {
      return
    }
    throw error
  }
}
