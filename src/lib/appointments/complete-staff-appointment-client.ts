import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { addDebitFromAppointment } from '@/lib/credits/ledger'
import { hasOverlappingAppCoachedWorkoutDebit } from '@/lib/credits/session-debit-dedup'
import { coerceLedgerServiceType } from '@/lib/abbonamenti-service-type'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:appointments:complete-staff-appointment-client')

/**
 * Segna appuntamento completato e scala lezione se non coperta già da log coachato (dedup).
 * Usa lo stesso client browser del chiamante (RLS staff).
 */
export async function completeStaffAppointmentById(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const updateData = { status: 'completato', updated_at: new Date().toISOString() }

    const { error } = await supabase.from('appointments').update(updateData).eq('id', eventId)

    if (error) {
      logger.error('Errore completamento appuntamento', error, { eventId })
      return { ok: false, error: error.message || 'Aggiornamento fallito' }
    }

    const { data: apt } = await supabase
      .from('appointments')
      .select('id, athlete_id, starts_at, ends_at, service_type')
      .eq('id', eventId)
      .single()

    if (apt?.athlete_id) {
      try {
        const skipForAppCoached = await hasOverlappingAppCoachedWorkoutDebit(
          supabase,
          apt.athlete_id,
          apt.starts_at,
          apt.ends_at,
          apt.service_type,
        )
        if (!skipForAppCoached) {
          await addDebitFromAppointment(
            {
              id: eventId,
              athlete_id: apt.athlete_id,
              service_type: coerceLedgerServiceType(apt.service_type),
            },
            null,
          )
        }
      } catch (ledgerErr) {
        logger.warn('Errore insert credit_ledger DEBIT', ledgerErr, { eventId })
      }
    }

    return { ok: true }
  } catch (error) {
    logger.error('Errore completamento appuntamento', error, { eventId })
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    }
  }
}
