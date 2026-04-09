/**
 * Analytics aggregata per trainer (business, clienti, operatività, progressi atleti).
 * I calcoli churn/retention su assegnazioni sono proxy (solo athlete_trainer_assignments con date).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { classifyWorkoutAppointmentForTrend } from '@/lib/analytics-workout-bookings-trend'
import { lessonUsageByAthleteIds } from '@/lib/credits/athlete-training-lessons-display'
import { createLogger } from '@/lib/logger'

const logger = createLogger('trainer-analytics')

export type TrainerAlertLevel = 'green' | 'yellow' | 'red'

export interface TrainerAnalyticsThresholds {
  churnRedPct: number
  churnYellowPct: number
  adherenceRedPct: number
  adherenceYellowPct: number
}

export const DEFAULT_TRAINER_THRESHOLDS: TrainerAnalyticsThresholds = {
  churnRedPct: 10,
  churnYellowPct: 5,
  adherenceRedPct: 65,
  adherenceYellowPct: 80,
}

export interface TrainerAssignmentRow {
  trainer_id: string
  athlete_id: string
  status: string | null
  activated_at: string
  deactivated_at: string | null
}

export interface TrainerPtAtletiRow {
  pt_id: string
  atleta_id: string
}

export interface TrainerPaymentRow {
  id: string
  amount: number
  athlete_id: string
  created_by_staff_id: string
  payment_date: string | null
  created_at: string | null
  payment_type: string | null
}

export interface TrainerWorkoutLogRow {
  id: string
  data: string | null
  durata_minuti: number | null
  stato: string | null
  atleta_id: string
  athlete_id: string | null
  coached_by_profile_id: string | null
}

export interface TrainerAppointmentRow {
  id: string
  starts_at: string
  status: string | null
  cancelled_at: string | null
  athlete_id: string | null
  type: string | null
  staff_id: string
  trainer_id: string | null
}

export interface TrainerCancellationRow {
  appointment_id: string
  cancellation_type: string
}

export interface TrainerProgressLogRow {
  athlete_id: string
  date: string
  weight_kg: number | null
}

export interface AthleteProfileMini {
  id: string
  user_id: string | null
  nome: string | null
  cognome: string | null
  avatar_url?: string | null
  avatar?: string | null
}

export interface TrainerAnalyticsAggregateInput {
  startBoundary: Date
  endBoundary: Date
  trainerIds: string[]
  assignments: TrainerAssignmentRow[]
  ptAtleti: TrainerPtAtletiRow[]
  payments: TrainerPaymentRow[]
  workoutLogs: TrainerWorkoutLogRow[]
  appointments: TrainerAppointmentRow[]
  /** Cancellazioni nel periodo (es. no_show strutturato) */
  cancellations: TrainerCancellationRow[]
  progressLogs: TrainerProgressLogRow[]
  athleteProfiles: AthleteProfileMini[]
  /** Da fetch: usage lezioni training (profiles.id → acquistate/usate/rimanenti) */
  lessonUsageByAthlete?: Record<
    string,
    { totalPurchased: number; totalUsed: number; totalRemaining: number }
  >
  /** Da fetch: appuntamenti allenamento futuri ancora “prenotati” per atleta */
  futureBookedByAthlete?: Record<string, number>
  thresholds?: TrainerAnalyticsThresholds
}

export interface TrainerDailyPoint {
  day: string
  revenue: number
  hours: number
  allenamenti: number
  prenotati: number
  eseguiti: number
  annullati: number
  cancellati: number
  /** No-show (appuntamento univoco) nel giorno di starts_at */
  noShow: number
  /** Nuove assegnazioni attive con activated_at nel giorno */
  clientsNew: number
  /** Assegnazioni con deactivated_at nel giorno */
  clientsLost: number
}

/** Raggruppa per settimane (7 giorni consecutive dal primo giorno del periodo). Utile per periodi lunghi. */
export function buildWeeklyRollupFromDaily(daily: TrainerDailyPoint[]): TrainerDailyPoint[] {
  if (daily.length === 0) return []
  const out: TrainerDailyPoint[] = []
  for (let i = 0; i < daily.length; i += 7) {
    const slice = daily.slice(i, Math.min(i + 7, daily.length))
    let revenue = 0
    let hours = 0
    let allenamenti = 0
    let prenotati = 0
    let eseguiti = 0
    let annullati = 0
    let cancellati = 0
    let noShow = 0
    let clientsNew = 0
    let clientsLost = 0
    for (const d of slice) {
      revenue += d.revenue
      hours += d.hours
      allenamenti += d.allenamenti
      prenotati += d.prenotati
      eseguiti += d.eseguiti
      annullati += d.annullati
      cancellati += d.cancellati
      noShow += d.noShow
      clientsNew += d.clientsNew
      clientsLost += d.clientsLost
    }
    out.push({
      day: slice.length > 1 ? `${slice[0].day} … ${slice[slice.length - 1].day}` : slice[0].day,
      revenue: Math.round(revenue * 100) / 100,
      hours: Math.round(hours * 10) / 10,
      allenamenti,
      prenotati,
      eseguiti,
      annullati,
      cancellati,
      noShow,
      clientsNew,
      clientsLost,
    })
  }
  return out
}

export interface TrainerHeatmapCell {
  weekday: number
  hour: number
  count: number
}

export interface TrainerPaymentMixItem {
  key: string
  amount: number
  percentage: number
}

export interface TrainerAthleteInsightRow {
  athleteId: string
  displayName: string
  avatarUrl: string | null
  revenue: number
  workoutCount: number
  weightChangePct: number | null
}

export interface TrainerProgressBand {
  band: string
  count: number
  percentage: number
}

export interface TrainerAthleteAdherenceRow {
  athleteId: string
  displayName: string
  adherencePct: number
  booked: number
}

/** Log workout nel periodo: sessioni coachate dal PT vs autonomi (stessi stati delle ore KPI). */
export interface TrainerAthleteWorkoutSplitRow {
  athleteId: string
  displayName: string
  avatarUrl: string | null
  withTrainer: number
  solo: number
}

/** Lezioni pacchetto training + slot futuri in agenda (tipi allenamento). */
export interface TrainerAthleteLessonBalanceRow {
  athleteId: string
  displayName: string
  avatarUrl: string | null
  totalPurchased: number
  totalUsed: number
  totalRemaining: number
  futureBookedCount: number
}

export interface TrainerPeriodComparison {
  previousStartDay: string
  previousEndDay: string
  revenueDeltaPct: number | null
  rphDeltaPct: number | null
  churnDeltaPctPoints: number
  adherenceDeltaPctPoints: number
}

export interface TrainerKpiSummary {
  revenueTotal: number
  hoursWorked: number
  revenuePerHour: number
  revenuePerActiveClient: number
  activeClients: number
  clientsNewInPeriod: number
  clientsLostInPeriod: number
  churnRatePct: number
  activeClientsAtStart: number
  adherencePct: number
  noShowCount: number
  /** Appuntamenti allenamento classificati (trend): eseguiti + prenotati + annullati + cancellati */
  scheduledWorkoutAppointments: number
  appointmentEseguiti: number
  appointmentPrenotati: number
  appointmentAnnullati: number
  appointmentCancellati: number
  avgWorkoutsPerWeek: number
  progressWeightAvgPct: number | null
  compositeScore: number
  revenueGrowthHalfPct: number
}

export interface TrainerAlertItem {
  id: string
  label: string
  level: TrainerAlertLevel
  hint: string
}

export interface TrainerAnalyticsReport {
  trainerIds: string[]
  startDay: string
  endDay: string
  kpis: TrainerKpiSummary
  alerts: TrainerAlertItem[]
  insights: string[]
  daily: TrainerDailyPoint[]
  /** Fasce orarie in UTC (getUTC*) */
  heatmap: TrainerHeatmapCell[]
  /** Stessa logica, bucket su Europe/Rome */
  heatmapEuropeRome: TrainerHeatmapCell[]
  paymentMix: TrainerPaymentMixItem[]
  athletes: TrainerAthleteInsightRow[]
  progressDistribution: TrainerProgressBand[]
  athleteAdherenceLeaders: TrainerAthleteAdherenceRow[]
  athleteWorkoutSplits: TrainerAthleteWorkoutSplitRow[]
  athleteLessonBalances: TrainerAthleteLessonBalanceRow[]
  periodComparison: TrainerPeriodComparison | null
  utilizationNote: string
}

function dayKeyUtc(d: Date): string {
  return d.toISOString().split('T')[0]
}

function parseDayKey(s: string): string {
  return s.split('T')[0]
}

const WD_EN_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function heatmapBucketFromIso(
  iso: string,
  mode: 'utc' | 'europe_rome',
): { weekday: number; hour: number } {
  if (mode === 'utc') {
    const d = new Date(iso)
    return { weekday: d.getUTCDay(), hour: d.getUTCHours() }
  }
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d)
  let weekday = 0
  let hour = 0
  for (const p of parts) {
    if (p.type === 'weekday') {
      const idx = WD_EN_SHORT.indexOf(p.value as (typeof WD_EN_SHORT)[number])
      weekday = idx >= 0 ? idx : 0
    }
    if (p.type === 'hour') hour = parseInt(p.value, 10) || 0
  }
  return { weekday, hour }
}

/** Periodo precedente con lo stesso numero di giorni di calendario (inclusivi). */
export function computePreviousPeriodBounds(startBoundary: Date, endBoundary: Date): {
  start: Date
  end: Date
} {
  const s0 = new Date(startBoundary)
  s0.setHours(0, 0, 0, 0)
  const e0 = new Date(endBoundary)
  e0.setHours(0, 0, 0, 0)
  const inclusiveDays = Math.max(1, Math.round((e0.getTime() - s0.getTime()) / 86400000) + 1)
  const prevEnd = new Date(startBoundary)
  prevEnd.setDate(prevEnd.getDate() - 1)
  prevEnd.setHours(23, 59, 59, 999)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - (inclusiveDays - 1))
  prevStart.setHours(0, 0, 0, 0)
  return { start: prevStart, end: prevEnd }
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

export function buildPeriodComparison(
  current: TrainerKpiSummary,
  previous: TrainerKpiSummary,
  previousStartDay: string,
  previousEndDay: string,
): TrainerPeriodComparison {
  return {
    previousStartDay,
    previousEndDay,
    revenueDeltaPct: pctDelta(current.revenueTotal, previous.revenueTotal),
    rphDeltaPct: pctDelta(current.revenuePerHour, previous.revenuePerHour),
    churnDeltaPctPoints: Math.round((current.churnRatePct - previous.churnRatePct) * 10) / 10,
    adherenceDeltaPctPoints:
      Math.round((current.adherencePct - previous.adherencePct) * 10) / 10,
  }
}

export function buildProgressDistributionBands(pctList: number[]): TrainerProgressBand[] {
  if (pctList.length === 0) return []
  const total = pctList.length
  const buckets: { band: string; pred: (p: number) => boolean }[] = [
    { band: '< −5%', pred: (p) => p < -5 },
    { band: '−5% … 0', pred: (p) => p >= -5 && p < 0 },
    { band: '0 … +5%', pred: (p) => p >= 0 && p < 5 },
    { band: '+5% … +10%', pred: (p) => p >= 5 && p < 10 },
    { band: '≥ +10%', pred: (p) => p >= 10 },
  ]
  return buckets.map(({ band, pred }) => {
    const count = pctList.filter(pred).length
    return {
      band,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }
  })
}

/** Roster atleta (profiles.id) per i trainer selezionati. */
export function mergeAthleteRosterForTrainers(
  trainerIds: string[],
  assignments: TrainerAssignmentRow[],
  ptAtleti: TrainerPtAtletiRow[],
): Set<string> {
  const tset = new Set(trainerIds.map((t) => t.trim().toLowerCase()).filter(Boolean))
  const out = new Set<string>()
  for (const a of assignments) {
    if (!a.athlete_id) continue
    const tid = (a.trainer_id ?? '').trim().toLowerCase()
    if (!tset.has(tid)) continue
    if ((a.status ?? '').toLowerCase() !== 'active') continue
    out.add(a.athlete_id.trim().toLowerCase())
  }
  for (const p of ptAtleti) {
    const pid = (p.pt_id ?? '').trim().toLowerCase()
    if (!tset.has(pid)) continue
    if (p.atleta_id) out.add(p.atleta_id.trim().toLowerCase())
  }
  return out
}

/** Atleti considerati attivi all’inizio del periodo (solo tabella assignments). */
export function countActiveAssignmentsAtStart(
  trainerIds: string[],
  assignments: TrainerAssignmentRow[],
  startBoundary: Date,
): number {
  const tset = new Set(trainerIds.map((t) => t.trim().toLowerCase()).filter(Boolean))
  const start = startBoundary.getTime()
  let n = 0
  for (const a of assignments) {
    const tid = (a.trainer_id ?? '').trim().toLowerCase()
    if (!tset.has(tid)) continue
    const act = new Date(a.activated_at).getTime()
    if (act > start) continue
    const deact = a.deactivated_at ? new Date(a.deactivated_at).getTime() : null
    if (deact != null && deact <= start) continue
    n += 1
  }
  return n
}

export function countNewAndLostAssignments(
  trainerIds: string[],
  assignments: TrainerAssignmentRow[],
  startBoundary: Date,
  endBoundary: Date,
): { newClients: number; lostClients: number } {
  const tset = new Set(trainerIds.map((t) => t.trim().toLowerCase()).filter(Boolean))
  const s = startBoundary.getTime()
  const e = endBoundary.getTime()
  let newClients = 0
  let lostClients = 0
  for (const a of assignments) {
    const tid = (a.trainer_id ?? '').trim().toLowerCase()
    if (!tset.has(tid)) continue
    const act = new Date(a.activated_at).getTime()
    if (act >= s && act <= e) newClients += 1
    if (a.deactivated_at) {
      const dx = new Date(a.deactivated_at).getTime()
      if (dx >= s && dx <= e) lostClients += 1
    }
  }
  return { newClients, lostClients }
}

function alertChurn(pct: number, th: TrainerAnalyticsThresholds): TrainerAlertLevel {
  if (pct >= th.churnRedPct) return 'red'
  if (pct >= th.churnYellowPct) return 'yellow'
  return 'green'
}

function alertAdherence(pct: number, th: TrainerAnalyticsThresholds): TrainerAlertLevel {
  if (pct < th.adherenceRedPct) return 'red'
  if (pct < th.adherenceYellowPct) return 'yellow'
  return 'green'
}

export function buildHeuristicInsights(report: {
  kpis: TrainerKpiSummary
  paymentMix: TrainerPaymentMixItem[]
  alerts: TrainerAlertItem[]
}): string[] {
  const lines: string[] = []
  const { kpis, paymentMix } = report
  if (kpis.adherencePct < 65) {
    lines.push(
      'Meno del 65% di allenamenti rispettati in agenda: spesso va di pari passo con insoddisfazione o abbandono — vale la pena ricontattare e semplificare il piano.',
    )
  }
  if (kpis.churnRatePct >= 5) {
    lines.push(
      'Uscite clienti piuttosto alte nel periodo: controlla prime settimane e obiettivi troppo aggressivi.',
    )
  }
  if (kpis.revenuePerHour > 0 && kpis.hoursWorked > 0) {
    lines.push(
      `In media stai fatturando circa €${kpis.revenuePerHour.toFixed(0)} per ogni ora registrata sui workout (${kpis.hoursWorked.toFixed(1)} h nel periodo).`,
    )
  }
  const topMix = [...paymentMix].sort((a, b) => b.amount - a.amount)[0]
  if (topMix && paymentMix.length >= 2 && topMix.percentage >= 75) {
    lines.push(
      `Quasi tutti gli incassi passano da “${topMix.key}” (~${topMix.percentage}%): potresti valutare pacchetti o altre formule per non dipendere da un solo tipo.`,
    )
  }
  if (kpis.progressWeightAvgPct != null && kpis.progressWeightAvgPct > 0) {
    lines.push(
      `In media il peso degli atleti con misure nel periodo è sceso di circa ${kpis.progressWeightAvgPct.toFixed(1)}% — segno positivo se l’obiettivo è dimagrire.`,
    )
  }
  if (lines.length === 0) {
    lines.push('Nessun campanello d’allarme automatico su questo periodo: continua a monitorare a occhio.')
  }
  return lines.slice(0, 6)
}

function compositeScore(kpis: TrainerKpiSummary): number {
  const adherence = Math.min(100, Math.max(0, kpis.adherencePct))
  const churnFactor = Math.min(100, Math.max(0, 100 - kpis.churnRatePct * 8))
  let progressPart = 50
  if (kpis.progressWeightAvgPct != null && Number.isFinite(kpis.progressWeightAvgPct)) {
    progressPart = Math.min(100, Math.max(0, 50 + kpis.progressWeightAvgPct))
  }
  const v = 0.4 * progressPart + 0.3 * adherence + 0.3 * churnFactor
  return Math.round(v * 10) / 10
}

function revenueGrowthHalf(daily: TrainerDailyPoint[]): number {
  if (daily.length < 2) return 0
  const mid = Math.floor(daily.length / 2)
  const first = daily.slice(0, mid).reduce((s, d) => s + d.revenue, 0)
  const second = daily.slice(mid).reduce((s, d) => s + d.revenue, 0)
  if (first <= 0) return second > 0 ? 100 : 0
  return Math.round(((second - first) / first) * 1000) / 10
}

function pickAvatarUrl(p: AthleteProfileMini | undefined): string | null {
  if (!p) return null
  const u = p.avatar_url ?? p.avatar
  return u != null && String(u).trim() !== '' ? String(u).trim() : null
}

/**
 * Sessioni nei log (stati come ore KPI): coach del PT selezionato vs autonomi (nessun coach o altro coach).
 */
export function buildAthleteWorkoutCoachSplitRows(input: {
  roster: Set<string>
  trainerIds: string[]
  workoutLogs: TrainerWorkoutLogRow[]
  startDay: string
  endDay: string
  profileById: Map<string, AthleteProfileMini>
}): TrainerAthleteWorkoutSplitRow[] {
  const { roster, trainerIds, workoutLogs, startDay, endDay, profileById } = input
  const trainerSet = new Set(trainerIds.map((t) => t.trim().toLowerCase()).filter(Boolean))
  const workoutStates = new Set(['completato', 'completed', 'in_corso', 'in_progress'])
  const logDayKeyLocal = (log: TrainerWorkoutLogRow): string | null => {
    const raw = log.data
    if (raw == null) return null
    if (typeof raw === 'string') return parseDayKey(raw)
    return parseDayKey(String(raw))
  }
  const byAthlete = new Map<string, { withTrainer: number; solo: number }>()
  for (const log of workoutLogs) {
    const dk = logDayKeyLocal(log)
    if (!dk || dk < startDay || dk > endDay) continue
    const st = (log.stato ?? '').toLowerCase()
    if (!workoutStates.has(st)) continue
    const pid = (log.atleta_id ?? log.athlete_id ?? '').trim().toLowerCase()
    if (!pid || !roster.has(pid)) continue
    const coach = (log.coached_by_profile_id ?? '').trim().toLowerCase()
    const isCoachedBySelected = coach !== '' && trainerSet.has(coach)
    const cur = byAthlete.get(pid) ?? { withTrainer: 0, solo: 0 }
    if (isCoachedBySelected) cur.withTrainer += 1
    else cur.solo += 1
    byAthlete.set(pid, cur)
  }
  const rows: TrainerAthleteWorkoutSplitRow[] = []
  for (const athleteId of roster) {
    const c = byAthlete.get(athleteId) ?? { withTrainer: 0, solo: 0 }
    if (c.withTrainer === 0 && c.solo === 0) continue
    const prof = profileById.get(athleteId)
    const displayName = prof
      ? [prof.nome, prof.cognome].filter(Boolean).join(' ') || athleteId.slice(0, 8)
      : athleteId.slice(0, 8)
    rows.push({
      athleteId,
      displayName,
      avatarUrl: pickAvatarUrl(prof),
      withTrainer: c.withTrainer,
      solo: c.solo,
    })
  }
  rows.sort((a, b) => b.withTrainer + b.solo - (a.withTrainer + a.solo))
  return rows
}

export function buildAthleteLessonBalanceRows(input: {
  rosterArr: string[]
  profileById: Map<string, AthleteProfileMini>
  lessonUsage: Record<string, { totalPurchased: number; totalUsed: number; totalRemaining: number }>
  futureBooked: Record<string, number>
}): TrainerAthleteLessonBalanceRow[] {
  const { rosterArr, profileById, lessonUsage, futureBooked } = input
  const rows: TrainerAthleteLessonBalanceRow[] = []
  for (const athleteId of rosterArr) {
    const lk = athleteId.trim().toLowerCase()
    const u = lessonUsage[lk]
    const fb = futureBooked[lk] ?? 0
    const tp = u?.totalPurchased ?? 0
    const tu = u?.totalUsed ?? 0
    const tr = u?.totalRemaining ?? 0
    if (tp === 0 && tu === 0 && tr === 0 && fb === 0) continue
    const prof = profileById.get(athleteId)
    const displayName = prof
      ? [prof.nome, prof.cognome].filter(Boolean).join(' ') || athleteId.slice(0, 8)
      : athleteId.slice(0, 8)
    rows.push({
      athleteId,
      displayName,
      avatarUrl: pickAvatarUrl(prof),
      totalPurchased: tp,
      totalUsed: tu,
      totalRemaining: tr,
      futureBookedCount: fb,
    })
  }
  rows.sort(
    (a, b) =>
      b.totalUsed + b.totalRemaining + b.futureBookedCount -
      (a.totalUsed + a.totalRemaining + a.futureBookedCount),
  )
  return rows
}

/** Appuntamenti allenamento con data/ora future e bucket “prenotati” (non completati/cancellati). */
export function countFutureBookedTrainingByAthlete(
  rows: Array<{
    athlete_id: string | null
    type: string | null
    status: string | null
    cancelled_at: string | null
    starts_at: string
  }>,
  nowMs: number,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) {
    if (!r.athlete_id) continue
    if (new Date(r.starts_at).getTime() < nowMs) continue
    const bucket = classifyWorkoutAppointmentForTrend({
      athlete_id: r.athlete_id,
      type: r.type,
      status: r.status,
      cancelled_at: r.cancelled_at,
    })
    if (bucket !== 'prenotati') continue
    const aid = r.athlete_id.trim().toLowerCase()
    out[aid] = (out[aid] ?? 0) + 1
  }
  return out
}

/** Aggregazione pura (testabile) su righe già filtrate a livello query. */
export function aggregateTrainerAnalytics(input: TrainerAnalyticsAggregateInput): TrainerAnalyticsReport {
  const th = input.thresholds ?? DEFAULT_TRAINER_THRESHOLDS
  const rangeStartMs = input.startBoundary.getTime()
  const rangeEndMs = input.endBoundary.getTime()
  const startDay = dayKeyUtc(input.startBoundary)
  const endDay = dayKeyUtc(input.endBoundary)
  const roster = mergeAthleteRosterForTrainers(input.trainerIds, input.assignments, input.ptAtleti)
  const rosterArr = [...roster]

  const profileById = new Map<string, AthleteProfileMini>()
  for (const p of input.athleteProfiles) {
    profileById.set(p.id.trim().toLowerCase(), p)
  }

  const paymentInRange = (p: TrainerPaymentRow): boolean => {
    const raw = p.payment_date || p.created_at
    if (!raw) return false
    const t = new Date(raw).getTime()
    return t >= input.startBoundary.getTime() && t <= input.endBoundary.getTime()
  }

  const paymentsFiltered = input.payments.filter(paymentInRange)
  const revenueTotal = paymentsFiltered.reduce((s, p) => s + (Number(p.amount) || 0), 0)

  const logDayKey = (log: TrainerWorkoutLogRow): string | null => {
    const raw = log.data
    if (raw == null) return null
    if (typeof raw === 'string') return parseDayKey(raw)
    return parseDayKey(String(raw))
  }

  const logInRange = (log: TrainerWorkoutLogRow): boolean => {
    const dk = logDayKey(log)
    if (!dk) return false
    return dk >= startDay && dk <= endDay
  }

  const workoutStates = new Set(['completato', 'completed', 'in_corso', 'in_progress'])
  let hoursWorked = 0
  let allenamenti = 0
  for (const log of input.workoutLogs) {
    if (!logInRange(log)) continue
    const st = (log.stato ?? '').toLowerCase()
    if (!workoutStates.has(st)) continue
    hoursWorked += (log.durata_minuti || 0) / 60
    allenamenti += 1
  }
  hoursWorked = Math.round(hoursWorked * 10) / 10

  const revenuePerHour = hoursWorked > 0 ? Math.round((revenueTotal / hoursWorked) * 10) / 10 : 0
  const activeClients = rosterArr.length
  const revenuePerActiveClient =
    activeClients > 0 ? Math.round((revenueTotal / activeClients) * 10) / 10 : 0

  const { newClients, lostClients } = countNewAndLostAssignments(
    input.trainerIds,
    input.assignments,
    input.startBoundary,
    input.endBoundary,
  )
  const activeAtStart = countActiveAssignmentsAtStart(
    input.trainerIds,
    input.assignments,
    input.startBoundary,
  )
  const churnDen = Math.max(1, activeAtStart)
  const churnRatePct = Math.round((lostClients / churnDen) * 1000) / 10

  let prenotati = 0
  let eseguiti = 0
  let annullati = 0
  let cancellati = 0
  const heatmapMap = new Map<string, number>()
  const heatmapLocalMap = new Map<string, number>()
  const workoutAppointmentIds = new Set<string>()
  const athAptBooked = new Map<string, { tot: number; ok: number }>()

  const trainerSet = new Set(input.trainerIds.map((t) => t.trim().toLowerCase()))
  for (const ap of input.appointments) {
    const sid = (ap.staff_id ?? '').trim().toLowerCase()
    const tid = (ap.trainer_id ?? '').trim().toLowerCase()
    if (!trainerSet.has(sid) && !trainerSet.has(tid)) continue
    const bucket = classifyWorkoutAppointmentForTrend({
      athlete_id: ap.athlete_id,
      type: ap.type,
      status: ap.status,
      cancelled_at: ap.cancelled_at,
    })
    if (!bucket) continue
    if (ap.id) workoutAppointmentIds.add(ap.id)
    if (bucket === 'prenotati') prenotati += 1
    else if (bucket === 'eseguiti') eseguiti += 1
    else if (bucket === 'annullati') annullati += 1
    else cancellati += 1

    const u = heatmapBucketFromIso(ap.starts_at, 'utc')
    const hk = `${u.weekday}-${u.hour}`
    heatmapMap.set(hk, (heatmapMap.get(hk) ?? 0) + 1)
    const loc = heatmapBucketFromIso(ap.starts_at, 'europe_rome')
    const hkl = `${loc.weekday}-${loc.hour}`
    heatmapLocalMap.set(hkl, (heatmapLocalMap.get(hkl) ?? 0) + 1)

    const aid = (ap.athlete_id ?? '').trim().toLowerCase()
    if (aid && roster.has(aid)) {
      const cur = athAptBooked.get(aid) ?? { tot: 0, ok: 0 }
      cur.tot += 1
      if (bucket === 'eseguiti') cur.ok += 1
      athAptBooked.set(aid, cur)
    }
  }

  const noShowAppointmentIds = new Set<string>()
  for (const ap of input.appointments) {
    if (!workoutAppointmentIds.has(ap.id)) continue
    const st = (ap.status ?? '').toLowerCase()
    if (st === 'no_show' || st === 'assente') noShowAppointmentIds.add(ap.id)
  }
  for (const c of input.cancellations) {
    if (!workoutAppointmentIds.has(c.appointment_id)) continue
    const ct = (c.cancellation_type ?? '').toLowerCase()
    if (ct.includes('no_show') || ct === 'noshow' || ct === 'no show')
      noShowAppointmentIds.add(c.appointment_id)
  }
  const noShowCount = noShowAppointmentIds.size

  const bookedTotal = prenotati + eseguiti + annullati + cancellati
  const adherencePct =
    bookedTotal > 0 ? Math.round((eseguiti / bookedTotal) * 1000) / 10 : 0

  const msPerWeek = 7 * 86400000
  const rangeMs = Math.max(1, input.endBoundary.getTime() - input.startBoundary.getTime())
  const weeks = rangeMs / msPerWeek
  const avgWorkoutsPerWeek = weeks > 0 ? Math.round((allenamenti / weeks) * 10) / 10 : 0

  const weightByAthlete = new Map<string, { t: string; w: number }[]>()
  for (const pl of input.progressLogs) {
    if (pl.weight_kg == null || !Number.isFinite(pl.weight_kg)) continue
    const aid = pl.athlete_id.trim().toLowerCase()
    const dk = parseDayKey(pl.date)
    if (dk < startDay || dk > endDay) continue
    const arr = weightByAthlete.get(aid) ?? []
    arr.push({ t: dk, w: pl.weight_kg })
    weightByAthlete.set(aid, arr)
  }
  const pctList: number[] = []
  for (const [, arr] of weightByAthlete) {
    if (arr.length < 2) continue
    arr.sort((a, b) => a.t.localeCompare(b.t))
    const first = arr[0].w
    const last = arr[arr.length - 1].w
    if (first === 0) continue
    pctList.push(((last - first) / first) * 100)
  }
  const progressWeightAvgPct =
    pctList.length > 0
      ? Math.round((pctList.reduce((s, x) => s + x, 0) / pctList.length) * 10) / 10
      : null

  const progressDistribution = buildProgressDistributionBands(pctList)

  const days: TrainerDailyPoint[] = []
  const startDayIter = new Date(input.startBoundary)
  startDayIter.setHours(0, 0, 0, 0)
  const endDayIter = new Date(input.endBoundary)
  endDayIter.setHours(0, 0, 0, 0)
  for (let d = new Date(startDayIter); d.getTime() <= endDayIter.getTime(); d.setDate(d.getDate() + 1)) {
    const dk = d.toISOString().split('T')[0]
    days.push({
      day: dk,
      revenue: 0,
      hours: 0,
      allenamenti: 0,
      prenotati: 0,
      eseguiti: 0,
      annullati: 0,
      cancellati: 0,
      noShow: 0,
      clientsNew: 0,
      clientsLost: 0,
    })
  }
  const dayIndex = new Map(days.map((d, i) => [d.day, i]))

  for (const p of paymentsFiltered) {
    const raw = p.payment_date || p.created_at
    if (!raw) continue
    const dk = parseDayKey(raw)
    const idx = dayIndex.get(dk)
    if (idx == null) continue
    days[idx].revenue += Number(p.amount) || 0
  }

  for (const log of input.workoutLogs) {
    const dk = logDayKey(log)
    if (!dk) continue
    const idx = dayIndex.get(dk)
    if (idx == null) continue
    const st = (log.stato ?? '').toLowerCase()
    if (!workoutStates.has(st)) continue
    days[idx].allenamenti += 1
    days[idx].hours += (log.durata_minuti || 0) / 60
  }

  for (const ap of input.appointments) {
    const sid = (ap.staff_id ?? '').trim().toLowerCase()
    const tid = (ap.trainer_id ?? '').trim().toLowerCase()
    if (!trainerSet.has(sid) && !trainerSet.has(tid)) continue
    const bucket = classifyWorkoutAppointmentForTrend({
      athlete_id: ap.athlete_id,
      type: ap.type,
      status: ap.status,
      cancelled_at: ap.cancelled_at,
    })
    if (!bucket) continue
    const dk = parseDayKey(ap.starts_at)
    const idx = dayIndex.get(dk)
    if (idx == null) continue
    if (bucket === 'prenotati') days[idx].prenotati += 1
    else if (bucket === 'eseguiti') days[idx].eseguiti += 1
    else if (bucket === 'annullati') days[idx].annullati += 1
    else days[idx].cancellati += 1
    if (noShowAppointmentIds.has(ap.id)) days[idx].noShow += 1
  }

  for (const a of input.assignments) {
    const tid = (a.trainer_id ?? '').trim().toLowerCase()
    if (!trainerSet.has(tid)) continue
    const actT = new Date(a.activated_at).getTime()
    if (actT >= rangeStartMs && actT <= rangeEndMs) {
      const dk = parseDayKey(a.activated_at)
      const idx = dayIndex.get(dk)
      if (idx != null) days[idx].clientsNew += 1
    }
    if (a.deactivated_at) {
      const dxT = new Date(a.deactivated_at).getTime()
      if (dxT >= rangeStartMs && dxT <= rangeEndMs) {
        const dk = parseDayKey(a.deactivated_at)
        const idx = dayIndex.get(dk)
        if (idx != null) days[idx].clientsLost += 1
      }
    }
  }

  for (const d of days) {
    d.hours = Math.round(d.hours * 10) / 10
    d.revenue = Math.round(d.revenue * 100) / 100
  }

  const mixMap = new Map<string, number>()
  for (const p of paymentsFiltered) {
    const k = (p.payment_type ?? 'altro').trim() || 'altro'
    mixMap.set(k, (mixMap.get(k) ?? 0) + (Number(p.amount) || 0))
  }
  const mixTotal = [...mixMap.values()].reduce((s, x) => s + x, 0)
  const paymentMix: TrainerPaymentMixItem[] = [...mixMap.entries()].map(([key, amount]) => ({
    key,
    amount: Math.round(amount * 100) / 100,
    percentage: mixTotal > 0 ? Math.round((amount / mixTotal) * 1000) / 10 : 0,
  }))

  const revByAthlete = new Map<string, number>()
  for (const p of paymentsFiltered) {
    const aid = p.athlete_id.trim().toLowerCase()
    revByAthlete.set(aid, (revByAthlete.get(aid) ?? 0) + (Number(p.amount) || 0))
  }

  const wcByAthlete = new Map<string, number>()
  for (const log of input.workoutLogs) {
    if (!logInRange(log)) continue
    const st = (log.stato ?? '').toLowerCase()
    if (st !== 'completato' && st !== 'completed') continue
    const pid = (log.atleta_id ?? log.athlete_id ?? '').trim().toLowerCase()
    if (!pid) continue
    wcByAthlete.set(pid, (wcByAthlete.get(pid) ?? 0) + 1)
  }

  const athletes: TrainerAthleteInsightRow[] = rosterArr.map((aid) => {
    const prof = profileById.get(aid)
    const name = prof
      ? [prof.nome, prof.cognome].filter(Boolean).join(' ') || aid.slice(0, 8)
      : aid.slice(0, 8)
    const arr = weightByAthlete.get(aid)
    let wcp: number | null = null
    if (arr && arr.length >= 2) {
      arr.sort((a, b) => a.t.localeCompare(b.t))
      const first = arr[0].w
      const last = arr[arr.length - 1].w
      if (first !== 0) wcp = Math.round(((last - first) / first) * 1000) / 10
    }
    return {
      athleteId: aid,
      displayName: name,
      avatarUrl: pickAvatarUrl(prof),
      revenue: Math.round((revByAthlete.get(aid) ?? 0) * 100) / 100,
      workoutCount: wcByAthlete.get(aid) ?? 0,
      weightChangePct: wcp,
    }
  })
  athletes.sort((a, b) => b.revenue - a.revenue)

  const athleteAdherenceLeaders: TrainerAthleteAdherenceRow[] = [...athAptBooked.entries()]
    .map(([athleteId, v]) => {
      const prof = profileById.get(athleteId)
      const displayName = prof
        ? [prof.nome, prof.cognome].filter(Boolean).join(' ') || athleteId.slice(0, 8)
        : athleteId.slice(0, 8)
      return {
        athleteId,
        displayName,
        adherencePct: v.tot > 0 ? Math.round((v.ok / v.tot) * 1000) / 10 : 0,
        booked: v.tot,
      }
    })
    .filter((x) => x.booked >= 2)
    .sort((a, b) => b.adherencePct - a.adherencePct || b.booked - a.booked)
    .slice(0, 10)

  const kpisRaw: TrainerKpiSummary = {
    revenueTotal: Math.round(revenueTotal * 100) / 100,
    hoursWorked,
    revenuePerHour,
    revenuePerActiveClient,
    activeClients,
    clientsNewInPeriod: newClients,
    clientsLostInPeriod: lostClients,
    churnRatePct,
    activeClientsAtStart: activeAtStart,
    adherencePct,
    noShowCount,
    scheduledWorkoutAppointments: bookedTotal,
    appointmentEseguiti: eseguiti,
    appointmentPrenotati: prenotati,
    appointmentAnnullati: annullati,
    appointmentCancellati: cancellati,
    avgWorkoutsPerWeek,
    progressWeightAvgPct,
    compositeScore: 0,
    revenueGrowthHalfPct: revenueGrowthHalf(days),
  }
  kpisRaw.compositeScore = compositeScore(kpisRaw)

  const alerts: TrainerAlertItem[] = [
    {
      id: 'churn',
      label: 'Atleti che smettono di seguirti',
      level: alertChurn(churnRatePct, th),
      hint: 'Confronta quanti atleti non risultano più seguiti con quanti ne avevi all’inizio del periodo (dati dalle assegnazioni).',
    },
    {
      id: 'adherence',
      label: 'Rispetto del calendario allenamenti',
      level: alertAdherence(adherencePct, th),
      hint: 'Quanti allenamenti in agenda sono stati effettivamente fatti, rispetto a tutti quelli previsti (anche annullati o spostati).',
    },
    {
      id: 'rph',
      label: 'Incassi rispetto alle ore registrate',
      level:
        revenuePerHour <= 0 && revenueTotal > 0
          ? 'red'
          : revenuePerHour > 0 && revenuePerHour < 25
            ? 'yellow'
            : 'green',
      hint: 'Incassi da training nel periodo divisi per le ore che risultano dai log degli allenamenti.',
    },
  ]

  const mapToHeatCells = (m: Map<string, number>): TrainerHeatmapCell[] =>
    [...m.entries()].map(([k, count]) => {
      const [ws, hs] = k.split('-')
      return { weekday: Number(ws), hour: Number(hs), count }
    })

  const heatmap: TrainerHeatmapCell[] = mapToHeatCells(heatmapMap)
  const heatmapEuropeRome: TrainerHeatmapCell[] = mapToHeatCells(heatmapLocalMap)

  const utilizationNote =
    'Per stimare quanto sei “pieno” servirebbero slot e capacità in agenda: per ora puoi affiancare questa heatmap alle ore che registri sui workout.'

  const lessonU = input.lessonUsageByAthlete ?? {}
  const futureB = input.futureBookedByAthlete ?? {}
  const athleteWorkoutSplits = buildAthleteWorkoutCoachSplitRows({
    roster,
    trainerIds: input.trainerIds,
    workoutLogs: input.workoutLogs,
    startDay,
    endDay,
    profileById,
  })
  const athleteLessonBalances = buildAthleteLessonBalanceRows({
    rosterArr,
    profileById,
    lessonUsage: lessonU,
    futureBooked: futureB,
  })

  const report: TrainerAnalyticsReport = {
    trainerIds: input.trainerIds,
    startDay,
    endDay,
    kpis: kpisRaw,
    alerts,
    insights: [],
    daily: days,
    heatmap,
    heatmapEuropeRome,
    paymentMix,
    athletes,
    progressDistribution,
    athleteAdherenceLeaders,
    athleteWorkoutSplits,
    athleteLessonBalances,
    periodComparison: null,
    utilizationNote,
  }
  report.insights = buildHeuristicInsights({
    kpis: report.kpis,
    paymentMix: report.paymentMix,
    alerts: report.alerts,
  })

  return report
}

export async function fetchTrainerAnalyticsReport(
  supabase: SupabaseClient<Database>,
  params: {
    orgId: string
    trainerIds: string[]
    startBoundary: Date
    endBoundary: Date
    thresholds?: TrainerAnalyticsThresholds
    /** Se true: secondo caricamento dati per confronto periodo precedente (PDF/API futuri). */
    includePeriodComparison?: boolean
  },
): Promise<TrainerAnalyticsReport> {
  const { orgId, trainerIds, startBoundary, endBoundary } = params
  if (!orgId || trainerIds.length === 0) {
    return aggregateTrainerAnalytics({
      startBoundary,
      endBoundary,
      trainerIds,
      assignments: [],
      ptAtleti: [],
      payments: [],
      workoutLogs: [],
      appointments: [],
      cancellations: [],
      progressLogs: [],
      athleteProfiles: [],
      thresholds: params.thresholds,
    })
  }

  const includeComparison = params.includePeriodComparison === true

  try {
    const loaded = await loadTrainerAnalyticsAggregateInput(supabase, {
      orgId,
      trainerIds,
      startBoundary,
      endBoundary,
    })
    let report = aggregateTrainerAnalytics({
      ...loaded,
      thresholds: params.thresholds,
    })

    if (includeComparison) {
      const prevB = computePreviousPeriodBounds(startBoundary, endBoundary)
      const prevLoaded = await loadTrainerAnalyticsAggregateInput(supabase, {
        orgId,
        trainerIds,
        startBoundary: prevB.start,
        endBoundary: prevB.end,
      })
      const prevReport = aggregateTrainerAnalytics({
        ...prevLoaded,
        thresholds: params.thresholds,
      })
      report = {
        ...report,
        periodComparison: buildPeriodComparison(
          report.kpis,
          prevReport.kpis,
          prevReport.startDay,
          prevReport.endDay,
        ),
      }
    }

    return report
  } catch (e) {
    logger.error('fetchTrainerAnalyticsReport', e)
    return aggregateTrainerAnalytics({
      startBoundary,
      endBoundary,
      trainerIds,
      assignments: [],
      ptAtleti: [],
      payments: [],
      workoutLogs: [],
      appointments: [],
      cancellations: [],
      progressLogs: [],
      athleteProfiles: [],
      thresholds: params.thresholds,
    })
  }
}

async function loadTrainerAnalyticsAggregateInput(
  supabase: SupabaseClient<Database>,
  params: {
    orgId: string
    trainerIds: string[]
    startBoundary: Date
    endBoundary: Date
  },
): Promise<Omit<TrainerAnalyticsAggregateInput, 'thresholds'>> {
  const { orgId, trainerIds, startBoundary, endBoundary } = params
  const startIso = startBoundary.toISOString()
  const endIso = endBoundary.toISOString()
  const startDay = dayKeyUtc(startBoundary)
  const endDay = dayKeyUtc(endBoundary)

  const [assignmentsRes, ptRes, paymentsRes, coachedRes, appointmentsRes] = await Promise.all([
    supabase
      .from('athlete_trainer_assignments')
      .select('trainer_id, athlete_id, status, activated_at, deactivated_at')
      .eq('org_id', orgId)
      .in('trainer_id', trainerIds),
    supabase.from('pt_atleti').select('pt_id, atleta_id').in('pt_id', trainerIds),
    supabase
      .from('payments')
      .select('id, amount, athlete_id, created_by_staff_id, payment_date, created_at, payment_type')
      .eq('org_id', orgId)
      .eq('service_type', 'training')
      .is('deleted_at', null)
      .in('created_by_staff_id', trainerIds),
    supabase
      .from('workout_logs')
      .select('id, data, durata_minuti, stato, atleta_id, athlete_id, coached_by_profile_id')
      .in('coached_by_profile_id', trainerIds)
      .gte('data', startDay)
      .lte('data', endDay),
    supabase
      .from('appointments')
      .select('id, starts_at, status, cancelled_at, athlete_id, type, staff_id, trainer_id')
      .eq('org_id', orgId)
      .gte('starts_at', startIso)
      .lte('starts_at', endIso)
      .or(
        trainerIds.length === 1
          ? `staff_id.eq.${trainerIds[0]},trainer_id.eq.${trainerIds[0]}`
          : `staff_id.in.(${trainerIds.join(',')}),trainer_id.in.(${trainerIds.join(',')})`,
      ),
  ])

  if (assignmentsRes.error) logger.warn('trainer analytics assignments', assignmentsRes.error)
  if (ptRes.error) logger.warn('trainer analytics pt_atleti', ptRes.error)
  if (paymentsRes.error) logger.warn('trainer analytics payments', paymentsRes.error)
  if (coachedRes.error) logger.warn('trainer analytics coached logs', coachedRes.error)
  if (appointmentsRes.error) logger.warn('trainer analytics appointments', appointmentsRes.error)

  const assignments = (assignmentsRes.data ?? []) as TrainerAssignmentRow[]
  const ptAtleti = (ptRes.data ?? []) as TrainerPtAtletiRow[]
  const payments = (paymentsRes.data ?? []) as TrainerPaymentRow[]
  const coachedLogs = (coachedRes.data ?? []) as TrainerWorkoutLogRow[]
  const appointments = (appointmentsRes.data ?? []) as TrainerAppointmentRow[]

  const roster = mergeAthleteRosterForTrainers(trainerIds, assignments, ptAtleti)
  const rosterList = [...roster]

  const rosterLogs: TrainerWorkoutLogRow[] = []
  for (const chunk of chunkForSupabaseIn(rosterList)) {
    if (chunk.length === 0) continue
    const { data, error } = await supabase
      .from('workout_logs')
      .select('id, data, durata_minuti, stato, atleta_id, athlete_id, coached_by_profile_id')
      .in('atleta_id', chunk)
      .gte('data', startDay)
      .lte('data', endDay)
    if (error) logger.warn('trainer analytics roster logs', error)
    rosterLogs.push(...((data ?? []) as TrainerWorkoutLogRow[]))
  }

  const logById = new Map<string, TrainerWorkoutLogRow>()
  for (const l of coachedLogs) logById.set(l.id, l)
  for (const l of rosterLogs) logById.set(l.id, l)
  const workoutLogs = [...logById.values()]

  const profilesAccum: AthleteProfileMini[] = []
  for (const chunk of chunkForSupabaseIn(rosterList)) {
    if (chunk.length === 0) continue
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, nome, cognome, avatar, avatar_url')
      .in('id', chunk)
    if (error) logger.warn('trainer analytics profiles', error)
    for (const row of data ?? []) {
      profilesAccum.push(row as AthleteProfileMini)
    }
  }

  const idSet = new Set(rosterList)
  const progressAthleteKeys = new Set<string>()
  for (const p of profilesAccum) {
    const pid = p.id.trim().toLowerCase()
    if (idSet.has(pid) && p.user_id) progressAthleteKeys.add(p.user_id.trim().toLowerCase())
    if (idSet.has(pid)) progressAthleteKeys.add(pid)
  }

  const progressLogs: TrainerProgressLogRow[] = []
  const pkeys = [...progressAthleteKeys]
  for (const chunk of chunkForSupabaseIn(pkeys)) {
    if (chunk.length === 0) continue
    const { data, error } = await supabase
      .from('progress_logs')
      .select('athlete_id, date, weight_kg')
      .gte('date', startDay)
      .lte('date', endDay)
      .in('athlete_id', chunk)
    if (error) logger.warn('trainer analytics progress_logs', error)
    progressLogs.push(...((data ?? []) as TrainerProgressLogRow[]))
  }

  const lessonUsageByAthlete: Record<
    string,
    { totalPurchased: number; totalUsed: number; totalRemaining: number }
  > = {}
  if (rosterList.length > 0) {
    try {
      const uMap = await lessonUsageByAthleteIds(supabase, rosterList, 'training')
      for (const [k, v] of uMap) {
        lessonUsageByAthlete[k.trim().toLowerCase()] = {
          totalPurchased: v.totalPurchased,
          totalUsed: v.totalUsed,
          totalRemaining: v.totalRemaining,
        }
      }
    } catch (e) {
      logger.warn('trainer analytics lesson usage', e)
    }
  }

  const trainerOr =
    trainerIds.length === 1
      ? `staff_id.eq.${trainerIds[0]},trainer_id.eq.${trainerIds[0]}`
      : `staff_id.in.(${trainerIds.join(',')}),trainer_id.in.(${trainerIds.join(',')})`
  const futureAptRows: Array<{
    athlete_id: string | null
    type: string | null
    status: string | null
    cancelled_at: string | null
    starts_at: string
  }> = []
  const nowIso = new Date().toISOString()
  for (const chunk of chunkForSupabaseIn(rosterList)) {
    if (chunk.length === 0) continue
    const { data, error } = await supabase
      .from('appointments')
      .select('athlete_id, type, status, cancelled_at, starts_at')
      .eq('org_id', orgId)
      .in('athlete_id', chunk)
      .gte('starts_at', nowIso)
      .or(trainerOr)
    if (error) logger.warn('trainer analytics future appointments', error)
    for (const row of data ?? []) {
      futureAptRows.push(
        row as {
          athlete_id: string | null
          type: string | null
          status: string | null
          cancelled_at: string | null
          starts_at: string
        },
      )
    }
  }
  const futureBookedByAthlete = countFutureBookedTrainingByAthlete(futureAptRows, Date.now())

  const cancellationsAccum: TrainerCancellationRow[] = []
  const appointmentIds = appointments.map((a) => a.id).filter(Boolean)
  for (const chunk of chunkForSupabaseIn(appointmentIds)) {
    if (chunk.length === 0) continue
    const { data, error } = await supabase
      .from('appointment_cancellations')
      .select('appointment_id, cancellation_type')
      .in('appointment_id', chunk)
      .gte('cancelled_at', startIso)
      .lte('cancelled_at', endIso)
    if (error) logger.warn('trainer analytics appointment_cancellations', error)
    for (const row of data ?? []) {
      cancellationsAccum.push(row as TrainerCancellationRow)
    }
  }

  return {
    startBoundary,
    endBoundary,
    trainerIds,
    assignments,
    ptAtleti,
    payments,
    workoutLogs,
    appointments,
    cancellations: cancellationsAccum,
    progressLogs,
    athleteProfiles: profilesAccum,
    lessonUsageByAthlete,
    futureBookedByAthlete,
  }
}

export async function fetchOrgTrainerOptions(
  supabase: SupabaseClient<Database>,
  orgId: string,
): Promise<{ id: string; label: string }[]> {
  if (!orgId) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, cognome')
    .eq('org_id', orgId)
    .eq('role', 'trainer')
    .eq('is_deleted', false)
    .order('cognome', { ascending: true })

  if (error) {
    logger.warn('fetchOrgTrainerOptions', error)
    return []
  }
  return (data ?? []).map((r) => {
    const row = r as { id: string; nome: string | null; cognome: string | null }
    const label = [row.nome, row.cognome].filter(Boolean).join(' ') || row.id.slice(0, 8)
    return { id: row.id, label }
  })
}
