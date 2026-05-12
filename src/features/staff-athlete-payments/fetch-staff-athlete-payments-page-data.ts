import { COACHED_APP_DEBIT_REASON_PREFIX } from '@/lib/credits/coached-debit-reason'
import { lessonUsageByAthleteIds } from '@/lib/credits/athlete-training-lessons-display'
import { createLogger } from '@/lib/logger'
import type { ServiceType } from '@/lib/abbonamenti-service-type'
import type { SupabaseClient } from '@supabase/supabase-js'

const logger = createLogger('features:staff-athlete-payments:fetch-page-data')

export type AthleteHeader = { id: string; nome: string | null; cognome: string | null }

export type PaymentRow = {
  id: string
  athlete_id: string
  created_at: string
  payment_date: string | null
  lessons_purchased: number
  amount: number
  invoice_url: string | null
  status: string | null
  is_reversal: boolean | null
  ref_payment_id: string | null
}

export type LedgerDebitRow = {
  id: string
  created_at: string
  qty: number
  reason: string | null
  appointment_id: string | null
  service_type: string
}

export type LedgerMovementRow = {
  id: string
  created_at: string
  entry_type: string
  qty: number
  reason: string | null
  appointment_id: string | null
  payment_id: string | null
  service_type: string
}

export type LedgerMovementUi = {
  id: string
  date: string
  entryType: 'CREDIT' | 'DEBIT' | 'REVERSAL' | 'OTHER'
  qty: number
  label: string
  notes: string | null
  serviceType: string
  paymentId: string | null
  appointmentId: string | null
}

export type DebitUiRow = {
  id: string
  date: string
  qty: number
  source: 'appointment' | 'workout_log' | 'other'
  schedaName: string | null
  contextLabel: string
  notes: string | null
}

type AppointmentRow = {
  id: string
  starts_at: string
  ends_at: string
  type: string
  notes: string | null
}

type WorkoutLogRow = {
  id: string
  completed_at: string | null
  started_at: string | null
  scheda_id: string | null
  scheda_name: string | null
  note: string | null
}

export type StaffAthletePaymentsPageData = {
  athlete: AthleteHeader | null
  payments: PaymentRow[]
  counter: { remaining: number; used: number; purchased: number } | null
  debits: DebitUiRow[]
  movements: LedgerMovementUi[]
}

function pickDebitDisplayDate(row: {
  ledgerCreatedAt: string
  appointmentStartsAt?: string | null
  workoutCompletedAt?: string | null
}): string {
  return row.workoutCompletedAt || row.appointmentStartsAt || row.ledgerCreatedAt
}

export async function fetchStaffAthletePaymentsPageData(
  supabase: SupabaseClient,
  athleteId: string,
  serviceType: ServiceType,
): Promise<StaffAthletePaymentsPageData> {
  const { data: athleteRow, error: athleteErr } = await supabase
    .from('profiles')
    .select('id, nome, cognome')
    .eq('id', athleteId)
    .maybeSingle()

  if (athleteErr) throw athleteErr
  const athlete = (athleteRow as AthleteHeader | null) ?? null

  const { data: paymentsRows, error: paymentsErr } = await supabase
    .from('payments')
    .select(
      'id, athlete_id, created_at, payment_date, lessons_purchased, amount, invoice_url, status, is_reversal, ref_payment_id',
    )
    .eq('athlete_id', athleteId)
    .eq('service_type', serviceType)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (paymentsErr) throw paymentsErr
  const payments = (paymentsRows as PaymentRow[] | null) ?? []

  const usage = await lessonUsageByAthleteIds(supabase, [athleteId], serviceType)
  const u = usage.get(athleteId)
  const counter = u
    ? { remaining: u.totalRemaining, used: u.totalUsed, purchased: u.totalPurchased }
    : { remaining: 0, used: 0, purchased: 0 }

  const { data: ledgerRows, error: ledgerErr } = await supabase
    .from('credit_ledger')
    .select('id, created_at, qty, reason, appointment_id, service_type')
    .eq('athlete_id', athleteId)
    .eq('entry_type', 'DEBIT')
    .eq('service_type', serviceType)
    .order('created_at', { ascending: false })

  if (ledgerErr) throw ledgerErr

  const debitRows = ((ledgerRows as LedgerDebitRow[] | null) ?? []).filter((r) => r.qty === -1)

  const appointmentIds = [
    ...new Set(debitRows.map((r) => r.appointment_id).filter((x): x is string => !!x)),
  ]
  const workoutLogIds = [
    ...new Set(
      debitRows
        .map((r) => (r.reason ?? '').trim())
        .filter((r) => r.startsWith(COACHED_APP_DEBIT_REASON_PREFIX))
        .map((r) => r.slice(COACHED_APP_DEBIT_REASON_PREFIX.length))
        .filter(Boolean),
    ),
  ]

  const [appointmentsRes, workoutLogsRes] = await Promise.all([
    appointmentIds.length > 0
      ? supabase
          .from('appointments')
          .select('id, starts_at, ends_at, type, notes')
          .in('id', appointmentIds)
      : Promise.resolve({ data: [] as AppointmentRow[], error: null }),
    workoutLogIds.length > 0
      ? supabase
          .from('workout_logs')
          .select(
            'id, completed_at, started_at, scheda_id, note, scheda:workout_plans!scheda_id(name)',
          )
          .in('id', workoutLogIds)
      : Promise.resolve({ data: [] as unknown[], error: null }),
  ])

  if (appointmentsRes.error) throw appointmentsRes.error
  if (workoutLogsRes.error) throw workoutLogsRes.error

  const appointmentsById = new Map<string, AppointmentRow>()
  ;((appointmentsRes.data as AppointmentRow[] | null) ?? []).forEach((a) => {
    appointmentsById.set(a.id, a)
  })

  const workoutLogsById = new Map<string, WorkoutLogRow>()
  ;((workoutLogsRes.data as unknown[] | null) ?? []).forEach((raw) => {
    const r = raw as {
      id: string
      completed_at: string | null
      started_at: string | null
      scheda_id: string | null
      note: string | null
      scheda?: { name?: string | null } | null
    }
    workoutLogsById.set(r.id, {
      id: r.id,
      completed_at: r.completed_at ?? null,
      started_at: r.started_at ?? null,
      scheda_id: r.scheda_id ?? null,
      scheda_name: r.scheda?.name ?? null,
      note: r.note ?? null,
    })
  })

  const debits = debitRows
    .map((r) => {
      const reason = (r.reason ?? '').trim()
      const isWorkoutLog = reason.startsWith(COACHED_APP_DEBIT_REASON_PREFIX)
      const workoutLogId = isWorkoutLog
        ? reason.slice(COACHED_APP_DEBIT_REASON_PREFIX.length)
        : null
      const wl = workoutLogId ? workoutLogsById.get(workoutLogId) : undefined
      const apt = r.appointment_id ? appointmentsById.get(r.appointment_id) : undefined

      const source: 'appointment' | 'workout_log' | 'other' = apt
        ? 'appointment'
        : wl
          ? 'workout_log'
          : 'other'

      const date = pickDebitDisplayDate({
        ledgerCreatedAt: r.created_at,
        appointmentStartsAt: apt?.starts_at ?? null,
        workoutCompletedAt: wl?.completed_at ?? null,
      })

      const qty = Math.abs(r.qty)
      const schedaName = wl?.scheda_name ?? null

      const contextLabel =
        source === 'appointment'
          ? `Appuntamento (${apt?.type ?? 'servizio'})`
          : source === 'workout_log'
            ? schedaName
              ? `Scheda: ${schedaName}`
              : 'Allenamento coachato'
            : reason || 'Consumo lezione'

      const notes =
        source === 'appointment'
          ? (apt?.notes ?? null)
          : source === 'workout_log'
            ? (wl?.note ?? null)
            : (r.reason ?? null)

      return {
        id: r.id,
        date,
        qty,
        source,
        schedaName,
        contextLabel,
        notes,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const { data: movementRows, error: movementErr } = await supabase
    .from('credit_ledger')
    .select('id, created_at, entry_type, qty, reason, appointment_id, payment_id, service_type')
    .eq('athlete_id', athleteId)
    .eq('service_type', serviceType)
    .order('created_at', { ascending: false })

  if (movementErr) throw movementErr

  const movements = ((movementRows as LedgerMovementRow[] | null) ?? [])
    .map((r) => {
      const etRaw = String(r.entry_type ?? '').toUpperCase()
      const entryType: 'CREDIT' | 'DEBIT' | 'REVERSAL' | 'OTHER' =
        etRaw === 'CREDIT' || etRaw === 'DEBIT' || etRaw === 'REVERSAL' ? etRaw : 'OTHER'

      const reason = (r.reason ?? '').trim()

      const label =
        entryType === 'CREDIT'
          ? reason || 'Acquisto crediti'
          : entryType === 'REVERSAL'
            ? reason || 'Storno'
            : entryType === 'DEBIT'
              ? (() => {
                  const isWorkoutLog = reason.startsWith(COACHED_APP_DEBIT_REASON_PREFIX)
                  if (isWorkoutLog) {
                    const id = reason.slice(COACHED_APP_DEBIT_REASON_PREFIX.length)
                    const wl = id ? workoutLogsById.get(id) : undefined
                    if (wl?.scheda_name) return `Scheda: ${wl.scheda_name}`
                    return 'Allenamento coachato'
                  }
                  if (r.appointment_id) return 'Appuntamento completato'
                  return reason || 'Consumo lezione'
                })()
              : reason || 'Movimento'

      return {
        id: r.id,
        date: r.created_at,
        entryType,
        qty: Number(r.qty ?? 0),
        label,
        notes: reason || null,
        serviceType: String(r.service_type ?? serviceType),
        paymentId: r.payment_id ?? null,
        appointmentId: r.appointment_id ?? null,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return { athlete, payments, counter, debits, movements }
}

export async function fetchStaffAthletePaymentsPageDataSafe(
  supabase: SupabaseClient,
  athleteId: string,
  serviceType: ServiceType,
): Promise<StaffAthletePaymentsPageData> {
  try {
    return await fetchStaffAthletePaymentsPageData(supabase, athleteId, serviceType)
  } catch (err) {
    logger.error('Errore caricamento pagamenti atleta', err, { athleteId, serviceType })
    throw err
  }
}
