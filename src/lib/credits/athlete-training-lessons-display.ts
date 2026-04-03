import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { ServiceType } from '@/lib/abbonamenti-service-type'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

export type AthleteTrainingLessonsUsage = {
  totalUsed: number
  totalRemaining: number
}

/** Riga aggregata per atleta (dashboard abbonamenti, liste PT, calendario). */
export type AthleteLessonUsageRow = {
  totalPurchased: number
  totalUsed: number
  totalRemaining: number
}

/** Allineato a dashboard abbonamenti / tab atleta: preferisci `training`, poi `standard`. */
export function pickTrainingCounterRow(
  rows: Array<{ count: number | null; lesson_type: string | null }>,
): number | undefined {
  if (rows.length === 0) return undefined
  const training = rows.find((r) => r.lesson_type === 'training')
  if (training && training.count != null) return training.count
  const standard = rows.find((r) => r.lesson_type === 'standard')
  if (standard && standard.count != null) return standard.count
  if (rows.length === 1 && rows[0]?.count != null) return rows[0].count
  return undefined
}

/** Mappa athlete_id → count rimanenti da righe lesson_counters (stesso atleta può avere training+standard). */
export function remainingByAthleteFromLessonCounterRows(
  rows: Array<{
    athlete_id: string
    count: number | null
    lesson_type: string | null
  }>,
): Map<string, number> {
  const byAthlete = new Map<string, Array<{ count: number | null; lesson_type: string | null }>>()
  for (const row of rows) {
    const list = byAthlete.get(row.athlete_id) ?? []
    list.push({ count: row.count, lesson_type: row.lesson_type })
    byAthlete.set(row.athlete_id, list)
  }
  const m = new Map<string, number>()
  for (const [aid, list] of byAthlete) {
    const v = pickTrainingCounterRow(list)
    if (v !== undefined) m.set(String(aid), v)
  }
  return m
}

function lessonTypesForCounterQuery(service: ServiceType): string[] {
  if (service === 'training') return ['training', 'standard']
  return [service]
}

function pickRemainingFromCounterRows(
  rows: Array<{ count: number | null; lesson_type: string | null }>,
  service: ServiceType,
): number | undefined {
  if (service === 'training') return pickTrainingCounterRow(rows)
  const hit = rows.find((r) => r.lesson_type === service)
  if (hit && hit.count != null) return hit.count
  return undefined
}

/**
 * Lezioni usate / rimanenti (tab Abbonamenti / Profilo atleta).
 * Per **training**: fonte = `credit_ledger` DEBIT (Opzione A, allineato al dump DB / trigger appuntamenti).
 * Per altri `serviceType`: mantiene confronto contatore / appuntamenti / ledger (fallback).
 * `totalPurchased` = somma `lessons_purchased` dei pagamenti `completed` per quel `serviceType`.
 */
export async function computeAthleteTrainingLessonUsage(
  client: SupabaseClient<Database>,
  athleteProfileId: string,
  totalPurchased: number,
  serviceType: ServiceType = 'training',
): Promise<AthleteTrainingLessonsUsage> {
  if (serviceType === 'training') {
    const { data: ledgerRows, error: ledgerErr } = await client
      .from('credit_ledger')
      .select('qty')
      .eq('athlete_id', athleteProfileId)
      .eq('entry_type', 'DEBIT')
      .eq('service_type', 'training')

    if (ledgerErr) throw ledgerErr

    const totalUsed = (ledgerRows ?? []).reduce(
      (sum, row) => sum + Math.max(0, -Number(row.qty ?? 0)),
      0,
    )
    const totalRemaining = Math.max(0, totalPurchased - totalUsed)
    return { totalUsed, totalRemaining }
  }

  const counterTypes = lessonTypesForCounterQuery(serviceType)

  const [counterRes, appointmentsRes, ledgerRes] = await Promise.all([
    client
      .from('lesson_counters')
      .select('count, lesson_type')
      .eq('athlete_id', athleteProfileId)
      .in('lesson_type', counterTypes),
    client
      .from('appointments')
      .select('id')
      .eq('athlete_id', athleteProfileId)
      .eq('status', 'completato')
      .eq('service_type', serviceType),
    client
      .from('credit_ledger')
      .select('qty')
      .eq('athlete_id', athleteProfileId)
      .eq('entry_type', 'DEBIT')
      .eq('service_type', serviceType),
  ])

  const usedFromLedger = (ledgerRes.data ?? []).reduce(
    (sum, row) => sum + Math.max(0, -Number(row.qty ?? 0)),
    0,
  )

  const remainingFromCounter = counterRes.error
    ? undefined
    : pickRemainingFromCounterRows(counterRes.data ?? [], serviceType)

  const usedFromCounter =
    remainingFromCounter !== null && remainingFromCounter !== undefined
      ? Math.max(0, totalPurchased - remainingFromCounter)
      : null

  const usedFromAppointments = appointmentsRes.error ? 0 : (appointmentsRes.data?.length ?? 0)

  let totalUsed: number
  if (usedFromCounter !== null) {
    totalUsed = Math.max(usedFromLedger, usedFromCounter)
  } else {
    totalUsed = Math.max(usedFromLedger, usedFromAppointments)
  }

  const totalRemaining = Math.max(0, totalPurchased - totalUsed)

  return { totalUsed, totalRemaining }
}

/** Carica somma acquistata da pagamenti + uso (per hook che non hanno già la lista). */
export async function fetchAthleteTrainingLessonsSnapshot(
  client: SupabaseClient<Database>,
  athleteProfileId: string,
  serviceType: ServiceType = 'training',
): Promise<{ totalPurchased: number; totalUsed: number; totalRemaining: number }> {
  const { data: payments, error } = await client
    .from('payments')
    .select('lessons_purchased')
    .eq('athlete_id', athleteProfileId)
    .eq('status', 'completed')
    .eq('service_type', serviceType)

  if (error) throw error

  const totalPurchased = (payments ?? []).reduce((sum, p) => sum + (p.lessons_purchased ?? 0), 0)
  const usage = await computeAthleteTrainingLessonUsage(
    client,
    athleteProfileId,
    totalPurchased,
    serviceType,
  )
  return { totalPurchased, ...usage }
}

/** Usato dalla dashboard abbonamenti: stessi numeri del profilo atleta per più ID. */
export async function lessonUsageByAthleteIds(
  client: SupabaseClient<Database>,
  athleteIds: string[],
  serviceType: ServiceType,
): Promise<Map<string, AthleteLessonUsageRow>> {
  const out = new Map<string, AthleteLessonUsageRow>()
  if (athleteIds.length === 0) return out

  const purchasedByAthlete = new Map<string, number>()
  for (const idChunk of chunkForSupabaseIn(athleteIds)) {
    const { data: payRows, error: payErr } = await client
      .from('payments')
      .select('athlete_id, lessons_purchased')
      .in('athlete_id', idChunk)
      .eq('status', 'completed')
      .eq('service_type', serviceType)

    if (payErr) throw payErr

    for (const p of payRows ?? []) {
      const aid = p.athlete_id as string
      purchasedByAthlete.set(aid, (purchasedByAthlete.get(aid) ?? 0) + (p.lessons_purchased ?? 0))
    }
  }

  await Promise.all(
    athleteIds.map(async (aid) => {
      const tp = purchasedByAthlete.get(aid) ?? 0
      try {
        const u = await computeAthleteTrainingLessonUsage(client, aid, tp, serviceType)
        out.set(aid, {
          totalPurchased: tp,
          totalUsed: u.totalUsed,
          totalRemaining: u.totalRemaining,
        })
      } catch {
        out.set(aid, { totalPurchased: tp, totalUsed: 0, totalRemaining: 0 })
      }
    }),
  )

  return out
}
