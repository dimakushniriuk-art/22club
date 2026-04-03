import type { SupabaseClient } from '@supabase/supabase-js'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { Database } from '@/lib/supabase/types'
import { coachedAppDebitReasonForWorkoutLog } from '@/lib/credits/coached-debit-reason'
import { creditLedgerRowIdForCoachedWorkout } from '@/lib/credits/credit-ledger-deterministic-id'

/** Contatore lezioni PT: `payments` / `credit_ledger` usano `training`. */
export function isTrainingServiceType(serviceType: string | null | undefined): boolean {
  return serviceType == null || serviceType === '' || serviceType === 'training'
}

export type WorkoutLogTimeFields = {
  completed_at: string | null
  data: string | null
}

const BUFFER_BEFORE_MS = 30 * 60 * 1000
const BUFFER_AFTER_MS = 3 * 60 * 60 * 1000

/**
 * Per evitare doppia scalatura app vs calendario serve un margine dopo la fine slot,
 * ma 3h era troppo: un secondo allenamento la sera (es. completato alle 23:30) risultava
 * ancora "nello stesso bucket" di un PT 21:00–22:00 già scalato → nessun DEBIT da app.
 */
const BUFFER_AFTER_MS_APPOINTMENT_DEBIT_DEDUP = 70 * 60 * 1000

function appointmentStatusUsable(status: string | null | undefined): boolean {
  const s = String(status ?? '').toLowerCase()
  return s !== 'annullato' && s !== 'cancelled'
}

/**
 * Il completamento del log in app cade nella finestra dell’appuntamento (con tolleranza),
 * oppure stessa data dello slot se `completed_at` mancante.
 */
export function workoutCompletedAtOverlapsAppointment(
  log: WorkoutLogTimeFields,
  startsAt: string,
  endsAt: string,
  opts?: { bufferAfterMs?: number },
): boolean {
  const s = new Date(startsAt).getTime()
  const e = new Date(endsAt).getTime()
  if (Number.isNaN(s) || Number.isNaN(e)) return false

  const bufferAfter = opts?.bufferAfterMs ?? BUFFER_AFTER_MS

  if (log.completed_at) {
    const t = new Date(log.completed_at).getTime()
    if (!Number.isNaN(t)) {
      return t >= s - BUFFER_BEFORE_MS && t <= e + bufferAfter
    }
  }

  const d0 = (log.data ?? '').trim()
  const d1 = startsAt.split('T')[0] ?? ''
  return d0 !== '' && d1 !== '' && d0 === d1
}

function isLogCoachedComplete(row: {
  stato: string | null
  is_coached: boolean | null
  execution_mode: string | null
}): boolean {
  const st = String(row.stato ?? '').toLowerCase()
  const completed = st === 'completato' || st === 'completed'
  const coached = Boolean(row.is_coached) || String(row.execution_mode ?? '') === 'coached'
  return completed && coached
}

export type AppointmentRowForTrainingDedup = {
  id: string
  starts_at: string
  ends_at: string
  service_type: string | null
  status: string | null
}

/**
 * C’è già un DEBIT su `credit_ledger` legato a un appuntamento PT che copre il momento del log:
 * non inserire un secondo DEBIT da app.
 * @param appointmentsPreloaded — se passato, evita N query ripetute sullo stesso atleta.
 */
export async function hasOverlappingAppointmentTrainingDebit(
  client: SupabaseClient<Database>,
  athleteProfileId: string,
  log: WorkoutLogTimeFields,
  appointmentsPreloaded?: AppointmentRowForTrainingDedup[] | null,
): Promise<boolean> {
  let apts = appointmentsPreloaded
  if (apts == null) {
    const { data, error } = await client
      .from('appointments')
      .select('id, starts_at, ends_at, service_type, status')
      .eq('athlete_id', athleteProfileId)
    if (error || !data?.length) return false
    apts = data as AppointmentRowForTrainingDedup[]
  }
  if (!apts.length) return false

  const overlappingIds = apts
    .filter(
      (apt) =>
        appointmentStatusUsable(apt.status) &&
        isTrainingServiceType(apt.service_type) &&
        workoutCompletedAtOverlapsAppointment(log, apt.starts_at, apt.ends_at, {
          bufferAfterMs: BUFFER_AFTER_MS_APPOINTMENT_DEBIT_DEDUP,
        }),
    )
    .map((a) => a.id)

  if (overlappingIds.length === 0) return false

  for (const idChunk of chunkForSupabaseIn(overlappingIds)) {
    const { data: led } = await client
      .from('credit_ledger')
      .select('id')
      .eq('entry_type', 'DEBIT')
      .eq('service_type', 'training')
      .in('appointment_id', idChunk)
      .limit(1)
    if ((led?.length ?? 0) > 0) return true
  }
  return false
}

/**
 * Completamento calendario PT: se esiste già il DEBIT deterministico da log app coachato
 * nella stessa finestra, non duplicare con DEBIT su `appointment_id`.
 */
export async function hasOverlappingAppCoachedWorkoutDebit(
  client: SupabaseClient<Database>,
  athleteProfileId: string,
  startsAt: string,
  endsAt: string,
  appointmentServiceType: string | null | undefined,
): Promise<boolean> {
  if (!isTrainingServiceType(appointmentServiceType)) return false

  const { data: logs, error } = await client
    .from('workout_logs')
    .select('id, completed_at, data, is_coached, stato, execution_mode')
    .or(`atleta_id.eq.${athleteProfileId},athlete_id.eq.${athleteProfileId}`)

  if (error || !logs?.length) return false

  const overlapping = logs.filter(
    (row) =>
      isLogCoachedComplete(row) &&
      workoutCompletedAtOverlapsAppointment(
        { completed_at: row.completed_at, data: row.data },
        startsAt,
        endsAt,
      ),
  )

  for (const row of overlapping) {
    const ledgerId = await creditLedgerRowIdForCoachedWorkout(row.id)
    const { data: rowLed } = await client
      .from('credit_ledger')
      .select('id')
      .eq('id', ledgerId)
      .maybeSingle()
    if (rowLed) return true

    const reason = coachedAppDebitReasonForWorkoutLog(row.id)
    const { data: byReason } = await client
      .from('credit_ledger')
      .select('id')
      .eq('athlete_id', athleteProfileId)
      .eq('entry_type', 'DEBIT')
      .eq('service_type', 'training')
      .eq('reason', reason)
      .limit(1)
      .maybeSingle()
    if (byReason) return true
  }

  return false
}
