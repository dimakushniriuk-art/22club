import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Appointment } from '@/types/appointment'
import type { CalendarBlock } from '@/types/calendar-block'

const logger = createLogger('lib:appointment-utils')

/**
 * Righe che non bloccano slot: cancellate (DB) o status soft-cancel.
 * Regola unica per overlap staff (calendario + checkAppointmentOverlap).
 */
export function isAppointmentExcludedFromOverlapCheck(row: {
  cancelled_at?: string | null
  status?: string | null
}): boolean {
  if (row.cancelled_at != null && row.cancelled_at !== '') return true
  const s = (row.status ?? '').toLowerCase()
  return s === 'annullato' || s === 'cancelled'
}

/** Intervallo sovrapposto: starts_at < newEndsAt && ends_at > newStartsAt (stessa condizione query). */
type OverlapClient = SupabaseClient<Database>

/**
 * Finestra per il fetch dei blocchi in validazione UI (allineata al calendario staff).
 * Nota: slot oltre questa finestra non hanno blocchi in cache → nessun avviso blocco in UI (come prima);
 * autorità resta backend/RLS su insert/update.
 */
export const CALENDAR_BLOCKS_UI_FETCH_WINDOW = { pastDays: 30, futureDays: 365 } as const

/** Messaggio e titolo notify condivisi tra calendario e tabella staff (parità UI). */
export const CALENDAR_BLOCK_CONFLICT_UI = {
  message: 'Questo orario cade in un blocco calendario (ferie/chiusura). Scegli un altro slot.',
  title: 'Blocco calendario',
} as const

/**
 * Carica `calendar_blocks` per org/staff con la stessa query usata dal calendario staff.
 * **Solo validazione UX:** il backend/RLS resta autorità su insert/update; se questa lista è vuota
 * (errore rete, org mancante) non si blocca lato UI — stesso trade-off del calendario.
 */
export async function fetchStaffCalendarBlocksForUiValidation(
  client: OverlapClient,
  staffOrgId: string,
  staffProfileId: string,
): Promise<CalendarBlock[]> {
  const from = new Date()
  from.setDate(from.getDate() - CALENDAR_BLOCKS_UI_FETCH_WINDOW.pastDays)
  const to = new Date()
  to.setDate(to.getDate() + CALENDAR_BLOCKS_UI_FETCH_WINDOW.futureDays)
  const { data, error } = await client
    .from('calendar_blocks')
    .select('id, org_id, staff_id, starts_at, ends_at, reason, created_at')
    .eq('org_id', staffOrgId)
    .or(`staff_id.eq.${staffProfileId},staff_id.is.null`)
    .gte('ends_at', from.toISOString())
    .lte('starts_at', to.toISOString())
  if (error) {
    logger.warn('fetchStaffCalendarBlocksForUiValidation', error, { staffOrgId, staffProfileId })
    return []
  }
  return (data ?? []) as CalendarBlock[]
}

/**
 * True se l’intervallo appuntamento interseca un blocco (ferie/chiusura/malattia).
 * Stessa condizione usata in `use-calendar-page` prima dell’allineamento centralizzato.
 */
export function appointmentSlotOverlapsAnyCalendarBlock(
  startsAtIso: string,
  endsAtIso: string,
  blocks: CalendarBlock[],
): boolean {
  const slotStart = new Date(startsAtIso).getTime()
  const slotEnd = new Date(endsAtIso).getTime()
  if (Number.isNaN(slotStart) || Number.isNaN(slotEnd)) return false
  return blocks.some((b) => {
    const bStart = new Date(b.starts_at).getTime()
    const bEnd = new Date(b.ends_at).getTime()
    return slotStart < bEnd && slotEnd > bStart
  })
}

async function fetchStaffOverlapCandidateRows(
  client: OverlapClient,
  staffId: string,
  startsAt: string,
  endsAt: string,
  selectColumns: string,
  excludeAppointmentId?: string,
): Promise<{ rows: Record<string, unknown>[]; error: unknown }> {
  let query = client
    .from('appointments')
    .select(selectColumns)
    .eq('staff_id', staffId)
    .is('cancelled_at', null)
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt)
  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId)
  }
  const { data, error } = await query
  if (error) return { rows: [], error }
  const raw = (data ?? []) as unknown[]
  const rows = raw.filter(
    (r): r is Record<string, unknown> =>
      typeof r === 'object' &&
      r !== null &&
      !isAppointmentExcludedFromOverlapCheck(
        r as { cancelled_at?: string | null; status?: string | null },
      ),
  )
  return { rows, error: null }
}

/** Normalizza lo status letto da DB / API verso il modello UI condiviso. */
export function normalizeAppointmentStatus(status?: string | null): Appointment['status'] {
  switch (status) {
    case 'completato':
    case 'completed':
      return 'completato'
    case 'annullato':
    case 'cancelled':
      return 'annullato'
    case 'in_corso':
    case 'in-progress':
    case 'in_progress':
      return 'in_corso'
    default:
      return 'attivo'
  }
}

/**
 * Verifica se ci sono sovrapposizioni temporali per uno staff.
 * Esclude: cancelled_at valorizzato, status annullato/cancelled (stessa regola calendario).
 */
export async function checkAppointmentOverlap(
  staffId: string,
  startsAt: string,
  endsAt: string,
  excludeAppointmentId?: string,
): Promise<{ hasOverlap: boolean; conflictingAppointments: Appointment[] }> {
  const supabase = createClient() as OverlapClient

  try {
    const { rows, error } = await fetchStaffOverlapCandidateRows(
      supabase,
      staffId,
      startsAt,
      endsAt,
      '*',
      excludeAppointmentId,
    )

    if (error) {
      logger.error('Error checking appointment overlap', error, { staffId, excludeAppointmentId })
      return { hasOverlap: false, conflictingAppointments: [] }
    }

    const conflictingAppointments = rows as unknown as Appointment[]
    return {
      hasOverlap: conflictingAppointments.length > 0,
      conflictingAppointments,
    }
  } catch (error) {
    logger.error('Error checking appointment overlap', error, { staffId, excludeAppointmentId })
    return { hasOverlap: false, conflictingAppointments: [] }
  }
}

/**
 * Verità unica frontend per overlap appuntamenti staff (create/edit): stessa query e filtri di
 * `fetchStaffOverlapCandidateRows` (soft-cancel esclusi da `isAppointmentExcludedFromOverlapCheck`).
 * Usata da `use-calendar-page` e `useStaffAppointmentsTable` — non duplicare regole overlap altrove.
 *
 * **Non copre:** `calendar_blocks` — vanno controllati prima (o dopo, ma in modo coerente) con
 * `appointmentSlotOverlapsAnyCalendarBlock` + dati da `fetchStaffCalendarBlocksForUiValidation`.
 * La validazione finale resta su DB/RLS.
 *
 * @returns `true` se lo slot non è disponibile (overlap non consentito; per `allenamento_doppio` fino a 2).
 */
export async function checkStaffCalendarSlotOverlap(
  client: OverlapClient,
  staffId: string,
  startsAt: string,
  endsAt: string,
  options: {
    excludeAppointmentId?: string
    appointmentType?: string
  },
): Promise<boolean> {
  const { rows, error } = await fetchStaffOverlapCandidateRows(
    client,
    staffId,
    startsAt,
    endsAt,
    'id, type, status, cancelled_at',
    options.excludeAppointmentId,
  )
  if (error) {
    logger.error('checkStaffCalendarSlotOverlap', error, { staffId })
    return false
  }
  const typed = rows as { id: string; type?: string | null }[]
  if (typed.length === 0) return false
  if (options.appointmentType === 'allenamento_doppio') {
    const doppioCount = typed.filter((r) => r.type === 'allenamento_doppio').length
    return doppioCount >= 2
  }
  return typed.length >= 1
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
