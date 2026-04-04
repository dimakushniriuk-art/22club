import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { lessonUsageByAthleteIds } from '@/lib/credits/athlete-training-lessons-display'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('lib:dashboard:fetch-staff-dashboard-widgets')

export type StaffExpiringPlanRow = {
  id: string
  name: string
  athlete_id: string | null
  athlete_display_name: string
  /** Sottotitolo: scadenza calendario e/o alert ciclo sessioni */
  subtitle: string
  /** Allineato alla lista schede: 1 = creata per prima tra le piani dello staff */
  creation_order_number?: number
}

export type StaffAthleteLessonsRow = {
  athlete_id: string
  nome: string
  cognome: string
  display_name: string
  total_remaining: number
  total_purchased: number
}

type PlanQueryRow = {
  id: string
  name: string
  end_date: string | null
  athlete_id: string | null
  is_active: boolean | null
  athlete:
    | { nome?: string | null; cognome?: string | null }
    | { nome?: string | null; cognome?: string | null }[]
    | null
}

type OrderedExpiring = { row: StaffExpiringPlanRow; order: number }

function athleteNameFromJoin(athlete: PlanQueryRow['athlete']): string {
  const a = Array.isArray(athlete) ? athlete[0] : athlete
  if (!a) return 'Atleta'
  return `${a.nome ?? ''} ${a.cognome ?? ''}`.trim() || 'Atleta'
}

function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isWorkoutLogRowCompleted(row: {
  stato?: string | null
  completato?: boolean | null
}): boolean {
  if (row.completato === true) return true
  const s = String(row.stato ?? '').toLowerCase()
  return s === 'completato' || s === 'completed'
}

/** Stessa numerazione della pagina Schede: tutti i `workout_plans` dello staff, `created_at` crescente. */
async function fetchStaffPlanCreationOrderById(
  client: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<Map<string, number>> {
  const { data, error } = await client
    .from('workout_plans')
    .select('id, created_at')
    .eq('created_by_profile_id', staffProfileId)

  if (error) {
    logger.warn('fetchStaffPlanCreationOrderById', { message: error.message })
    return new Map()
  }

  const rows = [...(data ?? [])] as Array<{ id: string; created_at: string | null }>
  rows.sort((a, b) => {
    const ta = new Date(a.created_at ?? 0).getTime()
    const tb = new Date(b.created_at ?? 0).getTime()
    if (ta !== tb) return ta - tb
    return String(a.id).localeCompare(String(b.id))
  })
  const m = new Map<string, number>()
  for (let i = 0; i < rows.length; i++) {
    m.set(rows[i].id, i + 1)
  }
  return m
}

function mergeOrderedExpiring(a: OrderedExpiring[], b: OrderedExpiring[]): StaffExpiringPlanRow[] {
  const map = new Map<string, { row: StaffExpiringPlanRow; order: number }>()
  const add = (item: OrderedExpiring) => {
    const prev = map.get(item.row.id)
    if (!prev) {
      map.set(item.row.id, { row: { ...item.row }, order: item.order })
    } else {
      prev.row.subtitle = [prev.row.subtitle, item.row.subtitle].filter(Boolean).join(' · ')
      prev.order = Math.min(prev.order, item.order)
    }
  }
  for (const x of a) add(x)
  for (const x of b) add(x)
  return Array.from(map.values())
    .sort((x, y) => x.order - y.order)
    .map((x) => x.row)
}

/** Schede con `end_date` entro i prossimi `horizonDays` giorni. */
async function fetchCalendarExpiringOrdered(
  client: SupabaseClient<Database>,
  staffProfileId: string,
  horizonDays = 30,
): Promise<OrderedExpiring[]> {
  const now = new Date()
  const horizonEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  horizonEnd.setDate(horizonEnd.getDate() + horizonDays)

  const { data, error } = await client
    .from('workout_plans')
    .select(
      `
        id,
        name,
        end_date,
        athlete_id,
        is_active,
        athlete:profiles!workout_plans_athlete_id_fkey (nome, cognome)
      `,
    )
    .eq('created_by_profile_id', staffProfileId)
    .eq('is_draft', false)
    .not('end_date', 'is', null)

  if (error) {
    logger.warn('fetchCalendarExpiringOrdered query error', { message: error.message })
    return []
  }

  const horizonMs = horizonEnd.getTime()
  const rows = (data ?? []) as PlanQueryRow[]

  const filtered = rows.filter((r) => {
    if (r.is_active === false) return false
    const t = r.end_date ? new Date(r.end_date).getTime() : NaN
    return !Number.isNaN(t) && t <= horizonMs
  })

  return filtered.map((r) => {
    const endMs = new Date(r.end_date ?? 0).getTime()
    return {
      row: {
        id: r.id,
        name: (r.name ?? 'Scheda').trim() || 'Scheda',
        athlete_id: r.athlete_id,
        athlete_display_name: athleteNameFromJoin(r.athlete),
        subtitle: `Scadenza ${formatItalianDate(r.end_date as string)}`,
      },
      order: endMs,
    }
  })
}

/**
 * Schede attive con obiettivo sessioni/giorno: compare se il ciclo è completato
 * oppure restano ≤ 3 sessioni totali da completare (somma dei giorni con target).
 */
async function fetchSessionCycleAlertsOrdered(
  client: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<OrderedExpiring[]> {
  try {
    const { data: plansData, error: plansErr } = await client
      .from('workout_plans')
      .select(
        `
        id,
        name,
        athlete_id,
        is_active,
        athlete:profiles!workout_plans_athlete_id_fkey (nome, cognome)
      `,
      )
      .eq('created_by_profile_id', staffProfileId)
      .eq('is_draft', false)

    if (plansErr) {
      logger.warn('fetchSessionCycleAlertsOrdered plans', { message: plansErr.message })
      return []
    }

    const plans = (plansData ?? []) as PlanQueryRow[]
    const activeWithAthlete = plans.filter(
      (p) => p.is_active !== false && p.athlete_id && String(p.athlete_id).trim() !== '',
    )
    if (activeWithAthlete.length === 0) return []

    const planIds = activeWithAthlete.map((p) => p.id)
    const planIdToAthlete = new Map<string, string>()
    for (const p of activeWithAthlete) {
      const aid = p.athlete_id?.trim()
      if (aid) planIdToAthlete.set(p.id, aid)
    }

    type DayBatchRow = {
      id: unknown
      workout_plan_id: string | null
      sessions_until_refresh: number | null
    }
    const daysBatch: DayBatchRow[] = []
    for (const planChunk of chunkForSupabaseIn(planIds)) {
      const { data: chunkRows, error: daysErr } = await client
        .from('workout_days')
        .select('id, workout_plan_id, sessions_until_refresh')
        .in('workout_plan_id', planChunk)
      if (daysErr) {
        logger.warn('fetchSessionCycleAlertsOrdered days', { message: daysErr.message })
        return []
      }
      daysBatch.push(...((chunkRows ?? []) as DayBatchRow[]))
    }

    const dayIdToPlanId = new Map<string, string>()
    const daysByPlan = new Map<
      string,
      Array<{ id: string; sessions_until_refresh: number | null }>
    >()
    const allDayIds: string[] = []

    for (const row of daysBatch) {
      const pid = row.workout_plan_id as string | null
      const did = typeof row.id === 'string' ? row.id : ''
      if (!pid || !did) continue
      dayIdToPlanId.set(did, pid)
      allDayIds.push(did)
      const sur = row.sessions_until_refresh
      const list = daysByPlan.get(pid) ?? []
      list.push({
        id: did,
        sessions_until_refresh: typeof sur === 'number' && Number.isFinite(sur) ? sur : null,
      })
      daysByPlan.set(pid, list)
    }

    const completedByDayId = new Map<string, number>()
    if (allDayIds.length > 0) {
      type LogBatchRow = {
        workout_day_id: unknown
        stato?: string | null
        atleta_id: unknown
        athlete_id: unknown
        completato?: boolean | null
      }
      const logsRows: LogBatchRow[] = []
      for (const dayChunk of chunkForSupabaseIn(allDayIds)) {
        const { data: chunkLogs, error: logsErr } = await client
          .from('workout_logs')
          .select('workout_day_id, stato, atleta_id, athlete_id, completato')
          .in('workout_day_id', dayChunk)
        if (logsErr) {
          logger.warn('fetchSessionCycleAlertsOrdered logs', { message: logsErr.message })
          break
        }
        logsRows.push(...((chunkLogs ?? []) as LogBatchRow[]))
      }
      for (const log of logsRows) {
        const dayId = log.workout_day_id as string | null
        if (!dayId || !dayIdToPlanId.has(dayId)) continue
        if (!isWorkoutLogRowCompleted(log)) continue
        const planId = dayIdToPlanId.get(dayId)
        if (!planId) continue
        const planAthleteId = planIdToAthlete.get(planId)
        if (!planAthleteId) continue
        const logAthleteId = (log.atleta_id as string) || (log.athlete_id as string | null)
        if (!logAthleteId || logAthleteId !== planAthleteId) continue
        completedByDayId.set(dayId, (completedByDayId.get(dayId) ?? 0) + 1)
      }
    }

    const out: OrderedExpiring[] = []
    for (const p of activeWithAthlete) {
      const days = daysByPlan.get(p.id) ?? []
      const tracked = days.filter(
        (d) =>
          typeof d.sessions_until_refresh === 'number' &&
          Number.isFinite(d.sessions_until_refresh) &&
          d.sessions_until_refresh >= 1,
      )
      if (tracked.length === 0) continue

      let totalRemaining = 0
      for (const d of tracked) {
        const target = d.sessions_until_refresh as number
        const done = completedByDayId.get(d.id) ?? 0
        totalRemaining += Math.max(0, target - done)
      }

      const allComplete = totalRemaining === 0
      if (!allComplete && totalRemaining > 3) continue

      const subtitle = allComplete
        ? 'Ciclo sessioni completato — revisiona la scheda'
        : totalRemaining === 1
          ? 'Resta 1 sessione nel ciclo'
          : `Restano ${totalRemaining} sessioni nel ciclo`

      out.push({
        row: {
          id: p.id,
          name: (p.name ?? 'Scheda').trim() || 'Scheda',
          athlete_id: p.athlete_id,
          athlete_display_name: athleteNameFromJoin(p.athlete),
          subtitle,
        },
        order: totalRemaining,
      })
    }

    out.sort((x, y) => x.order - y.order)
    return out
  } catch (e) {
    logger.error('fetchSessionCycleAlertsOrdered', e)
    return []
  }
}

/** Unisce scadenze calendario e alert ciclo sessioni (dedup per id). */
export async function fetchMergedStaffExpiringPlansForStaff(
  client: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<StaffExpiringPlanRow[]> {
  const [calendar, session, orderByPlanId] = await Promise.all([
    fetchCalendarExpiringOrdered(client, staffProfileId),
    fetchSessionCycleAlertsOrdered(client, staffProfileId),
    fetchStaffPlanCreationOrderById(client, staffProfileId),
  ])
  const merged = mergeOrderedExpiring(session, calendar)
  return merged.map((row) => ({
    ...row,
    creation_order_number: orderByPlanId.get(row.id),
  }))
}

/**
 * @deprecated Usare `fetchMergedStaffExpiringPlansForStaff` per il widget dashboard.
 * Restituisce solo le scadenze a calendario (con subtitle).
 */
export async function fetchExpiringWorkoutPlansForStaff(
  client: SupabaseClient<Database>,
  staffProfileId: string,
  horizonDays = 30,
): Promise<StaffExpiringPlanRow[]> {
  const ordered = await fetchCalendarExpiringOrdered(client, staffProfileId, horizonDays)
  return ordered.map((o) => o.row)
}

/** Soglia widget dashboard "Lezioni in esaurimento": solo atleti con al più così tante lezioni rimanenti. */
export const STAFF_DASHBOARD_LOW_LESSONS_THRESHOLD = 3

/**
 * Atleti distinti con almeno una scheda creata dallo staff e **≤ soglia** lezioni training rimanenti,
 * ordinati dal peggiore (meno rimaste) al migliore.
 */
export async function fetchAthletesSortedByRemainingLessonsForStaff(
  client: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<StaffAthleteLessonsRow[]> {
  try {
    const { data: planRows, error: planErr } = await client
      .from('workout_plans')
      .select('athlete_id')
      .eq('created_by_profile_id', staffProfileId)
      .eq('is_draft', false)

    if (planErr) {
      logger.warn('fetchAthletesSortedByRemainingLessonsForStaff plans error', {
        message: planErr.message,
      })
      return []
    }

    const athleteIds = [
      ...new Set(
        (planRows ?? [])
          .map((r) => r.athlete_id as string | null)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    ]

    if (athleteIds.length === 0) return []

    const usageMap = await lessonUsageByAthleteIds(client, athleteIds, 'training')

    const profileById = new Map<string, { nome: string; cognome: string }>()
    for (const idChunk of chunkForSupabaseIn(athleteIds)) {
      const { data: profiles, error: profErr } = await client
        .from('profiles')
        .select('id, nome, cognome')
        .in('id', idChunk)

      if (profErr) {
        logger.warn('fetchAthletesSortedByRemainingLessonsForStaff profiles error', {
          message: profErr.message,
        })
      }

      for (const p of profiles ?? []) {
        const row = p as { id: string; nome?: string | null; cognome?: string | null }
        profileById.set(row.id, {
          nome: row.nome ?? '',
          cognome: row.cognome ?? '',
        })
      }
    }

    const merged: StaffAthleteLessonsRow[] = athleteIds.map((athlete_id) => {
      const pr = profileById.get(athlete_id)
      const nome = pr?.nome ?? ''
      const cognome = pr?.cognome ?? ''
      const display = `${nome} ${cognome}`.trim() || 'Atleta'
      const u = usageMap.get(athlete_id)
      return {
        athlete_id,
        nome,
        cognome,
        display_name: display,
        total_remaining: u?.totalRemaining ?? 0,
        total_purchased: u?.totalPurchased ?? 0,
      }
    })

    merged.sort((a, b) => {
      const rem = a.total_remaining - b.total_remaining
      if (rem !== 0) return rem
      return a.display_name.localeCompare(b.display_name, 'it', { sensitivity: 'base' })
    })

    return merged.filter((a) => a.total_remaining <= STAFF_DASHBOARD_LOW_LESSONS_THRESHOLD)
  } catch (e) {
    logger.error('fetchAthletesSortedByRemainingLessonsForStaff', e)
    return []
  }
}
