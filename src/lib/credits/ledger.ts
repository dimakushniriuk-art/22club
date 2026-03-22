/**
 * Credit ledger: unica fonte per variazioni crediti.
 * lesson_counters.count è aggiornato da trigger DB.
 */

import { supabase } from '@/lib/supabase/client'
import type { ServiceType } from '@/lib/abbonamenti-service-type'

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
  const { error } = await supabase.from('credit_ledger').insert({
    entry_type: 'CREDIT',
    qty: payment.lessons_purchased,
    payment_id: payment.id,
    athlete_id: payment.athlete_id,
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
  const { error } = await supabase.from('credit_ledger').insert({
    entry_type: 'DEBIT',
    qty: -1,
    appointment_id: appointment.id,
    athlete_id: appointment.athlete_id,
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
export async function addReversalFromPayment(
  payment: PaymentForReversal,
  createdBy: string | null,
): Promise<void> {
  const { error } = await supabase.from('credit_ledger').insert({
    entry_type: 'REVERSAL',
    qty: -payment.lessons_purchased,
    payment_id: payment.id,
    athlete_id: payment.athlete_id,
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
