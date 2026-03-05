import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { Appointment } from '@/types/appointment'

const logger = createLogger('lib:appointment-utils')

/**
 * Verifica se ci sono sovrapposizioni temporali per uno staff.
 * Query diretta senza RPC functions per semplicità.
 *
 * Due intervalli si sovrappongono se:
 * - starts_at < new_ends_at AND ends_at > new_starts_at
 */
export async function checkAppointmentOverlap(
  staffId: string,
  startsAt: string,
  endsAt: string,
  excludeAppointmentId?: string,
): Promise<{ hasOverlap: boolean; conflictingAppointments: Appointment[] }> {
  const supabase = createClient()

  try {
    // Query per trovare appuntamenti che si sovrappongono
    // Un appuntamento si sovrappone se:
    // - starts_at < endsAt (inizia prima che finisca il nuovo)
    // - ends_at > startsAt (finisce dopo che inizia il nuovo)
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', staffId)
      .is('cancelled_at', null)
      .neq('status', 'annullato')
      .lt('starts_at', endsAt)
      .gt('ends_at', startsAt)

    // Escludi l'appuntamento corrente se stiamo modificando
    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error checking appointment overlap', error, { staffId, excludeAppointmentId })
      return { hasOverlap: false, conflictingAppointments: [] }
    }

    const conflictingAppointments = (data || []) as Appointment[]
    const hasOverlap = conflictingAppointments.length > 0

    return {
      hasOverlap,
      conflictingAppointments,
    }
  } catch (error) {
    logger.error('Error checking appointment overlap', error, { staffId, excludeAppointmentId })
    return { hasOverlap: false, conflictingAppointments: [] }
  }
}

/**
 * Verifica se un appuntamento può essere cancellato
 * Un appuntamento può essere cancellato se:
 * - Non è già stato completato
 * - Non è già stato annullato
 * - È nel futuro (opzionale, se cancelledAt è null)
 */
export function canCancelAppointment(startsAt: string, cancelledAt: string | null): boolean {
  if (cancelledAt) {
    return false // Già cancellato
  }

  // Permetti cancellazione anche per appuntamenti passati (per flessibilità)
  // Se vuoi permettere solo appuntamenti futuri, usa: return new Date(startsAt) > new Date()
  return true
}

/**
 * Verifica se un appuntamento può essere modificato
 */
export function canModifyAppointment(startsAt: string, cancelledAt: string | null): boolean {
  if (cancelledAt) {
    return false // Già cancellato
  }

  // Permetti modifica anche per appuntamenti passati (per flessibilità)
  return true
}

/**
 * Ottiene lo status di un appuntamento
 */
export function getAppointmentStatus(
  startsAt: string,
  endsAt: string,
  cancelledAt: string | null,
): 'attivo' | 'completato' | 'annullato' {
  if (cancelledAt) {
    return 'annullato'
  }

  const endDate = new Date(endsAt)
  const now = new Date()

  if (endDate < now) {
    return 'completato'
  }

  return 'attivo'
}

/**
 * Formatta l'ora di un appuntamento
 */
export function formatAppointmentTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formatta la data di un appuntamento
 */
export function formatAppointmentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
