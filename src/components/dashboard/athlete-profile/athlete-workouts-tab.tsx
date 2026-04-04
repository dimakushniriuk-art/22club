// ============================================================
// Componente Tab Allenamenti Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Mostra: schede, sessioni aperte, appuntamenti, storico completati (KPI + PDF); navigazione sezioni e link statistiche
// ============================================================

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, Button } from '@/components/ui'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/toast'
import { requestCoachedSessionDebitClient } from '@/lib/credits/request-coached-session-debit-client'
import {
  Dumbbell,
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Pencil,
  UserCheck,
  Loader2,
  LayoutList,
  BarChart3,
  History,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AtletaStoricoAllenamentiPanel } from '@/components/dashboard/athlete-profile/atleta-storico-allenamenti-panel'

const DS_LIST_ITEM =
  'flex items-start justify-between gap-2 p-3 rounded-lg border border-white/10 bg-white/[0.02]'

const SECTION_BLOCK =
  'scroll-mt-28 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3 sm:space-y-4'

const SECTION_NAV_LINK =
  'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:border-white/18 hover:bg-white/[0.07] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const KPI_MINI =
  'flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 sm:p-3.5 min-w-0'

const DS_STORICO_TABS_LIST =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] p-2'

interface AthleteWorkoutsTabProps {
  athleteId: string
  schedeAttive: number
  /** Per PDF storico e label */
  athleteDisplayName?: string
  /** Se true, niente Card esterna: blocco dentro la card Progressi */
  embedded?: boolean
  /** Hub `/progressi/storico` con tab → sottopagine */
  hubSection?: 'overview' | 'schede' | 'sessioni-aperte' | 'appuntamenti' | 'completati'
}

interface SchedaRow {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  created_at: string | null
  description: string | null
  objective: string | null
  difficulty: string | null
  is_draft: boolean
}

interface WorkoutLogRow {
  id: string
  data: string | null
  completato: boolean | null
  scheda_id: string | null
  created_at: string | null
  durata_minuti: number | null
  duration_minutes: number | null
  esercizi_completati: number | null
  esercizi_totali: number | null
  stato: string | null
  is_coached: boolean
  workout_day_id: string | null
}

interface WorkoutDayRow {
  id: string
  day_name: string
  day_number: number
  title: string | null
}

interface AppointmentRow {
  id: string
  starts_at: string
  status: string | null
  type: string
  trainer_name: string | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/** Null se inizio e fine assenti: niente placeholder "— → —". */
function schedaPeriodoLabel(start: string | null, end: string | null): string | null {
  const hasStart = Boolean(start?.trim())
  const hasEnd = Boolean(end?.trim())
  if (!hasStart && !hasEnd) return null
  if (hasStart && hasEnd) return `${formatDate(start)} → ${formatDate(end)}`
  if (hasStart) return `Dal ${formatDate(start)}`
  return `Fino al ${formatDate(end)}`
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function statusLabel(status: string | null): string {
  if (!status) return '—'
  const map: Record<string, string> = {
    completato: 'Completato',
    completed: 'Completato',
    annullato: 'Annullato',
    cancelled: 'Cancellato',
    cancellato: 'Cancellato',
    scheduled: 'Programmato',
    programmato: 'Programmato',
    confirmed: 'Confermato',
    confermato: 'Confermato',
  }
  return map[status.toLowerCase()] ?? status
}

function statusVariant(status: string | null): 'success' | 'destructive' | 'secondary' {
  const s = (status ?? '').toLowerCase()
  if (s === 'completato' || s === 'completed') return 'success'
  if (s === 'annullato' || s === 'cancelled' || s === 'cancellato') return 'destructive'
  return 'secondary'
}

function AppointmentStatoBadge({ status, type }: { status: string | null; type: string }) {
  const variant = statusVariant(status)
  const icon =
    variant === 'destructive' ? (
      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
    ) : variant === 'success' ? (
      <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
    ) : (
      <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
    )
  return (
    <span
      className={cn(
        'text-xs max-w-full min-w-0 inline-block rounded-lg font-medium border px-2 py-1.5',
        variant === 'success' ? 'bg-emerald-500/14 text-emerald-300 border-emerald-500/22' : '',
        variant === 'destructive' ? 'bg-destructive/10 text-destructive border-destructive/20' : '',
        variant === 'secondary'
          ? 'bg-background-secondary/30 text-text-secondary border-white/10'
          : '',
      )}
    >
      <span className="flex items-start gap-1.5 min-w-0">
        {icon}
        <span className="min-w-0 flex-1 break-words leading-snug text-left">
          {statusLabel(status)} · {type}
        </span>
      </span>
    </span>
  )
}

function logStatoLabel(stato: string | null, completato: boolean | null): string {
  const s = (stato ?? '').toLowerCase()
  if (s === 'completato' || s === 'completed') return 'Completato'
  if (s === 'in_corso' || s === 'in_progress') return 'In corso'
  if (s === 'abbandonato' || s === 'skipped') return 'Interrotto'
  if (completato) return 'Completato'
  if (s) return stato ?? '—'
  return completato === false ? 'Parziale' : '—'
}

function logIsInCorso(log: WorkoutLogRow): boolean {
  const s = (log.stato ?? '').toLowerCase()
  return s === 'in_corso' || s === 'in_progress'
}

function logIsCompleted(log: WorkoutLogRow): boolean {
  if (log.completato === true) return true
  const s = (log.stato ?? '').toLowerCase()
  return s === 'completato' || s === 'completed'
}

function difficultyLabel(d: string | null | undefined): string | null {
  if (!d?.trim()) return null
  const map: Record<string, string> = {
    principiante: 'Principiante',
    intermediate: 'Intermedio',
    intermedio: 'Intermedio',
    advanced: 'Avanzato',
    avanzato: 'Avanzato',
  }
  return map[d.toLowerCase()] ?? d
}

function dayLabel(row: WorkoutDayRow | undefined): string | null {
  if (!row) return null
  const title = row.title?.trim()
  if (title) return title
  const name = row.day_name?.trim()
  if (name) return name
  return `Giorno ${row.day_number}`
}

function SchedaAssignmentList({
  schede,
  giorniPerScheda,
}: {
  schede: SchedaRow[]
  giorniPerScheda: Record<string, number>
}) {
  if (schede.length === 0) {
    return <p className="text-text-secondary text-sm">Nessuna scheda assegnata</p>
  }
  return (
    <ul className="space-y-2">
      {schede.map((s) => {
        const diff = difficultyLabel(s.difficulty)
        const meta = [s.objective, s.description].filter(Boolean).join(' · ')
        const periodoLabel = schedaPeriodoLabel(s.start_date, s.end_date)
        return (
          <li key={s.id} className={DS_LIST_ITEM}>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/dashboard/schede/${s.id}/modifica`}
                  className="text-text-primary font-medium truncate hover:text-primary inline-flex items-center gap-1.5 min-w-0 group"
                  title={meta || s.name}
                >
                  <span className="truncate">{s.name}</span>
                  <Pencil
                    className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
                {s.is_draft ? (
                  <Badge variant="warning" size="sm" className="shrink-0">
                    Bozza
                  </Badge>
                ) : null}
                {diff ? (
                  <Badge variant="outline" size="sm" className="shrink-0">
                    {diff}
                  </Badge>
                ) : null}
              </div>
              {s.created_at ? (
                <p className="text-[11px] text-text-tertiary">Creata {formatDate(s.created_at)}</p>
              ) : null}
              {s.objective ? (
                <p className="text-text-secondary text-xs line-clamp-2">{s.objective}</p>
              ) : s.description ? (
                <p className="text-text-secondary text-xs line-clamp-2">{s.description}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0 text-right">
              {periodoLabel ? (
                <span className="text-text-secondary text-xs whitespace-nowrap">
                  {periodoLabel}
                </span>
              ) : null}
              <div className="flex flex-wrap justify-end gap-1">
                {s.is_active ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/14 text-emerald-300 text-xs font-bold border border-emerald-500/22 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
                    Attiva
                  </span>
                ) : !s.is_draft ? (
                  <span className="px-2 py-0.5 rounded-full border border-white/12 bg-white/[0.05] text-text-secondary text-xs font-semibold">
                    Non attiva
                  </span>
                ) : null}
              </div>
              {giorniPerScheda[s.id] != null && giorniPerScheda[s.id] > 0 ? (
                <span className="text-[11px] text-text-secondary">
                  {giorniPerScheda[s.id]} giorn
                  {giorniPerScheda[s.id] === 1 ? 'o' : 'i'} in scheda
                </span>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function AthleteWorkoutsTab({
  athleteId,
  schedeAttive,
  athleteDisplayName,
  embedded = false,
  hubSection,
}: AthleteWorkoutsTabProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { addToast } = useToast()

  const staffCalendarAthleteHref = useMemo(() => {
    const base = pathname?.startsWith('/dashboard/nutrizionista')
      ? '/dashboard/nutrizionista/calendario'
      : pathname?.startsWith('/dashboard/massaggiatore')
        ? '/dashboard/massaggiatore/calendario'
        : '/dashboard/calendario'
    const q = new URLSearchParams()
    q.set('athlete', athleteId)
    return `${base}?${q.toString()}`
  }, [pathname, athleteId])
  const [schede, setSchede] = useState<SchedaRow[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogRow[]>([])
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [workoutDaysById, setWorkoutDaysById] = useState<Record<string, WorkoutDayRow>>({})
  const [giorniPerScheda, setGiorniPerScheda] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const [finalizeTarget, setFinalizeTarget] = useState<WorkoutLogRow | null>(null)
  const [finalizeCoached, setFinalizeCoached] = useState(false)
  const [finalizeRequestDebit, setFinalizeRequestDebit] = useState(false)
  const [finalizeBusy, setFinalizeBusy] = useState(false)

  useEffect(() => {
    if (!athleteId) return
    const supabase = createClient()

    const load = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const [workoutPlans, workoutLogsRes, athleteAppointments] = await Promise.all([
          supabase
            .from('workout_plans')
            .select(
              'id, name, start_date, end_date, is_active, created_at, description, objective, difficulty, is_draft',
            )
            .eq('athlete_id', athleteId)
            .order('created_at', { ascending: false }),
          supabase
            .from('workout_logs')
            .select(
              'id, data, completato, scheda_id, created_at, durata_minuti, duration_minutes, esercizi_completati, esercizi_totali, stato, is_coached, workout_day_id',
            )
            .or(`atleta_id.eq.${athleteId},athlete_id.eq.${athleteId}`)
            .order('data', { ascending: false, nullsFirst: false })
            .limit(100),
          supabase
            .from('appointments')
            .select('id, starts_at, status, type, trainer_name')
            .eq('athlete_id', athleteId)
            .order('starts_at', { ascending: false })
            .limit(100),
        ])

        const errs = [workoutPlans.error, workoutLogsRes.error, athleteAppointments.error].filter(
          Boolean,
        ) as { message: string }[]

        const plansData = (workoutPlans.data ?? []) as SchedaRow[]
        const logsData = (workoutLogsRes.data ?? []) as WorkoutLogRow[]

        const planIds = plansData.map((p) => p.id)
        const dayIds = [
          ...new Set(
            logsData
              .map((l) => l.workout_day_id)
              .filter((id): id is string => typeof id === 'string' && id.length > 0),
          ),
        ]

        let dayByPlanRows: { workout_plan_id: string | null }[] | null = null
        if (planIds.length > 0) {
          const dayCountRes = await supabase
            .from('workout_days')
            .select('workout_plan_id')
            .in('workout_plan_id', planIds)
          if (dayCountRes.error) errs.push(dayCountRes.error)
          else dayByPlanRows = dayCountRes.data
        }

        let dayDetailRows: WorkoutDayRow[] | null = null
        if (dayIds.length > 0) {
          const dayDetailRes = await supabase
            .from('workout_days')
            .select('id, day_name, day_number, title')
            .in('id', dayIds)
          if (dayDetailRes.error) errs.push(dayDetailRes.error)
          else dayDetailRows = (dayDetailRes.data ?? []) as WorkoutDayRow[]
        }

        if (errs.length > 0) {
          setLoadError(errs.map((e) => e.message).join(' · '))
        }

        const giorniCount: Record<string, number> = {}
        if (dayByPlanRows) {
          for (const row of dayByPlanRows) {
            const pid = row.workout_plan_id
            if (pid) giorniCount[pid] = (giorniCount[pid] ?? 0) + 1
          }
        }

        const dayMap: Record<string, WorkoutDayRow> = {}
        if (dayDetailRows) {
          for (const d of dayDetailRows) {
            dayMap[d.id] = d
          }
        }

        setGiorniPerScheda(giorniCount)
        setWorkoutDaysById(dayMap)
        setSchede(plansData)
        setWorkoutLogs(logsData)
        setAppointments((athleteAppointments.data ?? []) as AppointmentRow[])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [athleteId, listRefreshKey])

  const openFinalizeDialog = (log: WorkoutLogRow) => {
    setFinalizeTarget(log)
    setFinalizeCoached(log.is_coached)
    setFinalizeRequestDebit(log.is_coached)
  }

  const runFinalizeSession = async () => {
    if (!finalizeTarget) return
    setFinalizeBusy(true)
    try {
      const res = await fetch(
        `/api/staff/workout-logs/${encodeURIComponent(finalizeTarget.id)}/finalize-in-progress`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coached: finalizeCoached }),
        },
      )
      const raw = await res.text()
      let errMsg: string | undefined
      try {
        const payload = JSON.parse(raw) as { error?: string }
        errMsg = payload.error
      } catch {
        errMsg = undefined
      }
      if (!res.ok) {
        addToast({
          title: 'Finalizzazione non riuscita',
          message: errMsg ?? (raw.trim() ? raw.slice(0, 200) : res.statusText),
          variant: 'error',
        })
        return
      }
      addToast({
        title: 'Sessione finalizzata',
        message: 'Il log è stato segnato come completato.',
        variant: 'success',
      })
      if (finalizeCoached && finalizeRequestDebit) {
        const debit = await requestCoachedSessionDebitClient(finalizeTarget.id)
        if (!debit.ok) {
          addToast({
            title: 'Credito lezioni',
            message:
              debit.error ??
              'Sessione salvata ma scalatura lezione non applicata: verifica manualmente.',
            variant: 'error',
          })
        } else if (debit.debited) {
          addToast({
            title: 'Credito lezioni',
            message: 'Lezione PT scalata.',
            variant: 'success',
          })
        } else if (debit.skipped_duplicate_calendar) {
          addToast({
            title: 'Credito lezioni',
            message:
              'Nessun addebito duplicato: risulta già un consumo legato al calendario nello stesso slot.',
            variant: 'success',
          })
        } else if (debit.already) {
          addToast({
            title: 'Credito lezioni',
            message: 'Movimento già presente in contatore.',
            variant: 'success',
          })
        }
      }
      setFinalizeTarget(null)
      setListRefreshKey((k) => k + 1)
    } finally {
      setFinalizeBusy(false)
    }
  }

  const schedaNomeById = useMemo(() => {
    const m: Record<string, string> = {}
    for (const s of schede) {
      m[s.id] = s.name
    }
    return m
  }, [schede])

  const schedeAttiveCount = schede.filter((s) => s.is_active).length
  const attiveLabel = schede.length > 0 ? schedeAttiveCount : schedeAttive
  const isTotallyEmpty =
    schede.length === 0 && workoutLogs.length === 0 && appointments.length === 0

  const sessioniUltimi30 = useMemo(() => {
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    cutoff.setDate(cutoff.getDate() - 30)
    return workoutLogs.filter((log) => {
      const raw = log.data ?? (log.created_at ? log.created_at.split('T')[0] : null)
      if (!raw) return false
      const t = new Date(raw).getTime()
      return !Number.isNaN(t) && t >= cutoff.getTime()
    }).length
  }, [workoutLogs])

  const prossimiAppuntamenti = useMemo(() => {
    const now = Date.now()
    return appointments.filter((a) => new Date(a.starts_at).getTime() >= now).length
  }, [appointments])

  const appointmentsUpcoming = useMemo(() => {
    const now = Date.now()
    return [...appointments]
      .filter((a) => new Date(a.starts_at).getTime() >= now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  }, [appointments])

  const appointmentsPast = useMemo(() => {
    const now = Date.now()
    return [...appointments]
      .filter((a) => new Date(a.starts_at).getTime() < now)
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
  }, [appointments])

  const attentionLogs = useMemo(() => workoutLogs.filter((l) => !logIsCompleted(l)), [workoutLogs])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const showHub = Boolean(hubSection) && !embedded
    if (showHub && hubSection === 'overview' && window.location.hash === '#storico-allenamenti') {
      const base = `/dashboard/atleti/${athleteId}/progressi/storico`
      router.replace(`${base}/completati`)
      return
    }
    if (showHub) return
    if (loading) return
    if (window.location.hash !== '#storico-allenamenti') return
    const t = window.setTimeout(() => {
      document
        .getElementById('storico-allenamenti')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => window.clearTimeout(t)
  }, [loading, athleteId, hubSection, embedded, router])

  const durationMinutes = (log: WorkoutLogRow): number | null => {
    const a = log.durata_minuti
    const b = log.duration_minutes
    if (a != null && Number.isFinite(a)) return a
    if (b != null && Number.isFinite(b)) return b
    return null
  }

  const progressiAllenamentiHref = `/dashboard/atleti/${athleteId}/progressi/allenamenti`
  const showHub = Boolean(hubSection) && !embedded
  const storicoBase = `/dashboard/atleti/${athleteId}/progressi/storico`
  const pnorm = pathname.replace(/\/$/, '')

  const hubTabClass = (href: string) => {
    const active = pnorm.replace(/\/$/, '') === href.replace(/\/$/, '')
    return cn(
      'rounded-lg px-3 py-2 text-sm font-semibold transition flex min-w-0 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap sm:px-4 sm:flex-1',
      active
        ? 'font-extrabold text-text-primary bg-white/[0.06] border border-white/10'
        : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border border-transparent',
    )
  }

  const panelInner = (
    <>
      {showHub ? (
        <>
          <div className="flex min-w-0 gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.09] to-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              <Dumbbell className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary sm:text-[11px] sm:tracking-[0.18em]">
                  Riepilogo
                </p>
                <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary/90">
                  Allenamenti
                </span>
              </div>
              <h3 className="text-text-primary text-xl font-semibold tracking-tight sm:text-2xl">
                Allenamenti e accesso ai dati
              </h3>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary/95 sm:text-[15px]">
                Sessioni da chiudere, calendario e storico completati con filtri ed export PDF — in
                questa panoramica trovi anche la cronologia di tutte le schede collegate
                all&apos;atleta nel tempo; usa le schede qui sotto per aprire ogni area in una
                pagina dedicata.
              </p>
              {!loading && !isTotallyEmpty ? (
                <p className="text-text-primary/90 text-sm pt-1">
                  <span className="font-medium text-text-primary">{attiveLabel}</span>{' '}
                  {attiveLabel === 1 ? 'scheda attiva' : 'schede attive'}
                  {' · '}
                  <span className="text-text-primary/90">
                    {sessioniUltimi30} sessioni registrate (30 gg)
                  </span>
                  {appointments.length > 0 ? (
                    <>
                      {' · '}
                      <span className="text-text-primary/90">
                        {prossimiAppuntamenti} appuntament
                        {prossimiAppuntamenti === 1 ? 'o' : 'i'} futur
                        {prossimiAppuntamenti === 1 ? 'o' : 'i'}
                      </span>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          </div>
          <nav
            aria-label="Sezioni allenamenti"
            className={cn(
              'flex w-full min-w-0 flex-row flex-nowrap gap-2 overflow-x-auto',
              DS_STORICO_TABS_LIST,
            )}
          >
            <Link href={storicoBase} className={hubTabClass(storicoBase)}>
              <BarChart3 className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Panoramica
            </Link>
            <Link href={`${storicoBase}/schede`} className={hubTabClass(`${storicoBase}/schede`)}>
              <LayoutList className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Schede
            </Link>
            <Link
              href={`${storicoBase}/sessioni-aperte`}
              className={hubTabClass(`${storicoBase}/sessioni-aperte`)}
            >
              <Clock className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Sessioni aperte
            </Link>
            <Link
              href={`${storicoBase}/appuntamenti`}
              className={hubTabClass(`${storicoBase}/appuntamenti`)}
            >
              <Calendar className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Appuntamenti
            </Link>
            <Link
              href={`${storicoBase}/completati`}
              className={hubTabClass(`${storicoBase}/completati`)}
            >
              <CheckCircle className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Completati
            </Link>
          </nav>
          {!loading && !isTotallyEmpty && hubSection === 'overview' ? (
            <>
              <div className="space-y-4">
                <div
                  className="h-px w-full bg-gradient-to-r from-transparent via-white/14 to-transparent"
                  aria-hidden
                />
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary sm:text-[11px] sm:tracking-[0.18em]">
                    Indicatori
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Schede
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {schede.length}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {schedeAttiveCount} attiv{schedeAttiveCount === 1 ? 'a' : 'e'}
                  </span>
                </div>
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Sessioni (30 gg)
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {sessioniUltimi30}
                  </span>
                  <span className="text-[11px] text-text-secondary">Da log atleta</span>
                </div>
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Da rivedere
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {attentionLogs.length}
                  </span>
                  <span className="text-[11px] text-text-secondary">Non completate / in corso</span>
                </div>
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Prossimi slot
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {prossimiAppuntamenti}
                  </span>
                  <span className="text-[11px] text-text-secondary">In calendario</span>
                </div>
              </div>
              <section
                className={SECTION_BLOCK}
                aria-labelledby="cronologia-schede-panoramica-heading"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 space-y-1">
                    <h4
                      id="cronologia-schede-panoramica-heading"
                      className="text-text-primary font-semibold flex items-center gap-2"
                    >
                      <History className="h-4 w-4 text-primary shrink-0" aria-hidden />
                      Cronologia schede
                    </h4>
                    <p className="text-text-secondary text-xs sm:text-sm max-w-2xl leading-relaxed">
                      Elenco di tutte le schede con questo atleta, dalla più recente: data di
                      creazione, periodo previsto e stato (attiva / non attiva / bozza).
                    </p>
                  </div>
                  <Link
                    href={`${storicoBase}/schede`}
                    className={cn(SECTION_NAV_LINK, 'shrink-0 self-start')}
                  >
                    <LayoutList className="h-3.5 w-3.5 opacity-70" aria-hidden />
                    Solo sezione Schede
                  </Link>
                </div>
                <div className="max-h-[min(28rem,55vh)] overflow-y-auto min-w-0 pr-1 -mr-1">
                  <SchedaAssignmentList schede={schede} giorniPerScheda={giorniPerScheda} />
                </div>
              </section>
            </>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <h3 className="text-text-primary text-xl font-bold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary shrink-0" />
                Allenamenti atleta
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
                Schede assegnate, sessioni da chiudere, calendario e storico completati con filtri
                ed export PDF — tutto in un’unica vista.
              </p>
              {!loading && !isTotallyEmpty ? (
                <p className="text-text-primary/90 text-sm">
                  <span className="font-medium text-text-primary">{attiveLabel}</span>{' '}
                  {attiveLabel === 1 ? 'scheda attiva' : 'schede attive'}
                  {' · '}
                  <span className="text-text-primary/90">
                    {sessioniUltimi30} sessioni registrate (30 gg)
                  </span>
                  {appointments.length > 0 ? (
                    <>
                      {' · '}
                      <span className="text-text-primary/90">
                        {prossimiAppuntamenti} appuntament
                        {prossimiAppuntamenti === 1 ? 'o' : 'i'} futur
                        {prossimiAppuntamenti === 1 ? 'o' : 'i'}
                      </span>
                    </>
                  ) : null}
                </p>
              ) : null}
              <div className="h-[3px] w-24 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link href={`/dashboard/schede?athlete_id=${athleteId}`}>
                <Button variant="default" size="sm">
                  Vedi tutte le schede
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
              <Link href={progressiAllenamentiHref}>
                <Button variant="outline" size="sm" className="border-white/15">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistiche esercizi
                </Button>
              </Link>
            </div>
          </div>

          {!loading && !isTotallyEmpty ? (
            <>
              <nav
                className="sticky top-0 z-[1] -mx-1 flex flex-wrap gap-2 border-b border-white/10 bg-gradient-to-b from-zinc-900/[0.97] via-zinc-900/95 to-transparent py-3 backdrop-blur-md px-1"
                aria-label="Salta alla sezione"
              >
                <a href="#section-schede" className={SECTION_NAV_LINK}>
                  <LayoutList className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Schede
                </a>
                <a href="#section-aperte" className={SECTION_NAV_LINK}>
                  <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Sessioni aperte
                </a>
                <a href="#section-appuntamenti" className={SECTION_NAV_LINK}>
                  <Calendar className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Appuntamenti
                </a>
                <a href="#storico-allenamenti" className={SECTION_NAV_LINK}>
                  <CheckCircle className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Storico completati
                </a>
              </nav>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Schede
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {schede.length}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {schedeAttiveCount} attiv{schedeAttiveCount === 1 ? 'a' : 'e'}
                  </span>
                </div>
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Sessioni (30 gg)
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {sessioniUltimi30}
                  </span>
                  <span className="text-[11px] text-text-secondary">Da log atleta</span>
                </div>
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Da rivedere
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {attentionLogs.length}
                  </span>
                  <span className="text-[11px] text-text-secondary">Non completate / in corso</span>
                </div>
                <div className={KPI_MINI}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Prossimi slot
                  </span>
                  <span className="text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {prossimiAppuntamenti}
                  </span>
                  <span className="text-[11px] text-text-secondary">In calendario</span>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}

      {loadError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {loadError}
        </div>
      ) : null}

      {loading ? (
        <p className="text-text-secondary text-sm py-4">Caricamento...</p>
      ) : isTotallyEmpty ? (
        <div className="text-center py-12">
          <div className="rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/10 bg-white/[0.04] text-primary">
            <Dumbbell className="h-8 w-8" />
          </div>
          <p className="text-text-primary font-medium mb-2">Nessun dato allenamenti</p>
          <p className="text-text-secondary text-sm mb-4">
            Non risultano schede, sessioni o appuntamenti per questo atleta
          </p>
          <Link href={`/dashboard/schede?athlete_id=${athleteId}&new=true`}>
            <Button variant="default" size="sm">
              Crea Prima Scheda
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {!showHub || hubSection === 'schede' ? (
            <section id="section-schede" className={SECTION_BLOCK}>
              <h4 className="text-text-primary font-semibold flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                Schede assegnate
              </h4>
              <p className="text-text-secondary text-xs sm:text-sm">
                Ordinate dalla più recente (data creazione). Comprende schede attive, archiviate e
                bozze.
              </p>
              <SchedaAssignmentList schede={schede} giorniPerScheda={giorniPerScheda} />
            </section>
          ) : null}

          {!showHub || hubSection === 'sessioni-aperte' ? (
            <section id="section-aperte" className={SECTION_BLOCK}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h4 className="text-text-primary font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Sessioni aperte o non completate
                </h4>
                {attentionLogs.length > 0 ? (
                  <span className="text-xs font-medium text-amber-200/90 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 w-fit">
                    {attentionLogs.length} da gestire
                  </span>
                ) : null}
              </div>
              {attentionLogs.length === 0 ? (
                <p className="text-text-secondary text-sm leading-relaxed">
                  Nessuna sessione in corso o incompleta.{' '}
                  {showHub
                    ? 'Le attività completate sono nella sezione Completati.'
                    : 'Le attività completate sono nello storico in fondo alla pagina.'}
                </p>
              ) : (
                <ul className="space-y-2">
                  {attentionLogs.map((log) => {
                    const schedaNome = log.scheda_id ? schedaNomeById[log.scheda_id] : null
                    const giorno = log.workout_day_id
                      ? dayLabel(workoutDaysById[log.workout_day_id])
                      : null
                    const mins = durationMinutes(log)
                    const exDone = log.esercizi_completati
                    const exTot = log.esercizi_totali
                    const showEx =
                      exDone != null &&
                      exTot != null &&
                      Number.isFinite(exDone) &&
                      Number.isFinite(exTot)
                    const statoUi = logStatoLabel(log.stato, log.completato)
                    const completatoUi =
                      log.completato === true ||
                      (log.stato ?? '').toLowerCase() === 'completato' ||
                      (log.stato ?? '').toLowerCase() === 'completed'
                    const inCorso = logIsInCorso(log)

                    return (
                      <li key={log.id} className={DS_LIST_ITEM}>
                        <div className="min-w-0 space-y-1">
                          <span className="text-text-primary text-sm font-medium block">
                            {formatDate(log.data ?? log.created_at)}
                          </span>
                          {schedaNome ? (
                            <span className="text-text-secondary text-xs block truncate">
                              {schedaNome}
                              {giorno ? ` · ${giorno}` : ''}
                            </span>
                          ) : giorno ? (
                            <span className="text-text-secondary text-xs block">{giorno}</span>
                          ) : null}
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {log.is_coached ? (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-400/25">
                                <UserCheck className="h-3 w-3 shrink-0" />
                                Coaching
                              </span>
                            ) : null}
                            {showEx ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/8 text-text-secondary border border-white/10">
                                Esercizi {exDone}/{exTot}
                              </span>
                            ) : null}
                            {mins != null ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/8 text-text-secondary border border-white/10">
                                ~{mins} min
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {inCorso ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => openFinalizeDialog(log)}
                            >
                              Finalizza sessione
                            </Button>
                          ) : null}
                          <span
                            className={cn(
                              'text-xs flex items-center gap-1 px-2 py-0.5 rounded-full font-medium border',
                              completatoUi
                                ? 'bg-emerald-500/14 text-emerald-300 border-emerald-500/22'
                                : 'bg-primary/10 text-primary border-primary/15',
                            )}
                          >
                            {completatoUi ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            {statoUi}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          ) : null}

          {!showHub || hubSection === 'appuntamenti' ? (
            <section id="section-appuntamenti" className={SECTION_BLOCK}>
              <div>
                <h4 className="text-text-primary font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  Appuntamenti
                </h4>
              </div>
              {appointments.length === 0 ? (
                <p className="text-text-secondary text-sm">Nessun appuntamento</p>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h5 className="text-text-primary text-sm font-semibold">Prossimi</h5>
                      <p className="text-text-secondary text-xs">Dal più vicino al più lontano</p>
                    </div>
                    {appointmentsUpcoming.length === 0 ? (
                      <p className="text-text-secondary text-sm">Nessun appuntamento futuro</p>
                    ) : (
                      <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-white/10">
                        <table className="w-full min-w-[min(100%,36rem)] caption-bottom text-sm table-auto">
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="h-10 px-3 sm:px-4 w-[1%] whitespace-nowrap">
                                Data e ora
                              </TableHead>
                              <TableHead className="h-10 px-3 sm:px-4 min-w-[8rem]">
                                Trainer
                              </TableHead>
                              <TableHead className="h-10 px-3 sm:px-4 text-right min-w-[10rem]">
                                Stato
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appointmentsUpcoming.map((a) => (
                              <TableRow key={a.id}>
                                <TableCell className="px-3 sm:px-4 py-2.5 text-text-primary whitespace-nowrap align-top">
                                  {formatDateTime(a.starts_at)}
                                </TableCell>
                                <TableCell className="px-3 sm:px-4 py-2.5 text-text-secondary text-sm min-w-0 align-top break-words">
                                  {a.trainer_name?.trim() || '—'}
                                </TableCell>
                                <TableCell className="px-3 sm:px-4 py-2.5 align-top">
                                  <div className="flex justify-end items-start gap-2 flex-wrap">
                                    <AppointmentStatoBadge status={a.status} type={a.type} />
                                    <Link
                                      href={staffCalendarAthleteHref}
                                      className="inline-flex items-center gap-1 shrink-0 text-xs font-medium text-cyan-400/90 hover:text-cyan-300 underline-offset-2 hover:underline"
                                    >
                                      Calendario
                                      <ExternalLink className="h-3 w-3 opacity-80" aria-hidden />
                                    </Link>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h5 className="text-text-primary text-sm font-semibold">Passati</h5>
                      <p className="text-text-secondary text-xs">Dal più recente al più vecchio</p>
                    </div>
                    {appointmentsPast.length === 0 ? (
                      <p className="text-text-secondary text-sm">
                        Nessun appuntamento passato in elenco
                      </p>
                    ) : (
                      <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-white/10">
                        <table className="w-full min-w-[min(100%,36rem)] caption-bottom text-sm table-auto">
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="h-10 px-3 sm:px-4 w-[1%] whitespace-nowrap">
                                Data e ora
                              </TableHead>
                              <TableHead className="h-10 px-3 sm:px-4 min-w-[8rem]">
                                Trainer
                              </TableHead>
                              <TableHead className="h-10 px-3 sm:px-4 text-right min-w-[10rem]">
                                Stato
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appointmentsPast.map((a) => (
                              <TableRow key={a.id}>
                                <TableCell className="px-3 sm:px-4 py-2.5 text-text-primary whitespace-nowrap align-top">
                                  {formatDateTime(a.starts_at)}
                                </TableCell>
                                <TableCell className="px-3 sm:px-4 py-2.5 text-text-secondary text-sm min-w-0 align-top break-words">
                                  {a.trainer_name?.trim() || '—'}
                                </TableCell>
                                <TableCell className="px-3 sm:px-4 py-2.5 align-top">
                                  <div className="flex justify-end items-start gap-2 flex-wrap">
                                    <AppointmentStatoBadge status={a.status} type={a.type} />
                                    <Link
                                      href={staffCalendarAthleteHref}
                                      className="inline-flex items-center gap-1 shrink-0 text-xs font-medium text-cyan-400/90 hover:text-cyan-300 underline-offset-2 hover:underline"
                                    >
                                      Calendario
                                      <ExternalLink className="h-3 w-3 opacity-80" aria-hidden />
                                    </Link>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          ) : null}

          {!showHub || hubSection === 'completati' ? (
            <div id="storico-allenamenti" className="space-y-3 scroll-mt-28">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <h4 className="text-text-primary font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    Storico sessioni completate
                  </h4>
                  <p className="text-text-secondary text-xs mt-1 max-w-xl leading-relaxed">
                    Filtri per periodo, riepilogo autonomia / trainer / ore e export PDF.
                  </p>
                </div>
              </div>
              <AtletaStoricoAllenamentiPanel
                athleteProfileId={athleteId}
                pdfSubjectName={athleteDisplayName?.trim() || 'Atleta'}
                reloadToken={listRefreshKey}
              />
            </div>
          ) : null}
        </div>
      )}

      <AlertDialog
        open={finalizeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !finalizeBusy) setFinalizeTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizzare la sessione in corso?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <span className="block">
                Verrà usato quanto già salvato in database (serie per questo log). Se non risultano
                serie, l’operazione fallirà.
              </span>
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="finalize-coached"
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border border-white/10',
                    'bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 text-primary',
                    'focus:ring-2 focus:ring-primary/25 focus:ring-offset-0 focus:outline-none',
                  )}
                  checked={finalizeCoached}
                  onChange={(e) => {
                    const v = e.target.checked
                    setFinalizeCoached(v)
                    if (!v) setFinalizeRequestDebit(false)
                  }}
                />
                <label
                  htmlFor="finalize-coached"
                  className="cursor-pointer text-sm font-normal leading-snug"
                >
                  Sessione con trainer (coachato)
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="finalize-debit"
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 rounded border border-white/10',
                    'bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 text-primary',
                    'focus:ring-2 focus:ring-primary/25 focus:ring-offset-0 focus:outline-none',
                    !finalizeCoached && 'cursor-not-allowed opacity-50',
                  )}
                  checked={finalizeRequestDebit}
                  disabled={!finalizeCoached}
                  onChange={(e) => setFinalizeRequestDebit(e.target.checked)}
                />
                <label
                  htmlFor="finalize-debit"
                  className={cn(
                    'text-sm font-normal leading-snug',
                    finalizeCoached ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                  )}
                >
                  Scala una lezione PT (se applicabile e non già scalata)
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={finalizeBusy}
              onClick={() => setFinalizeTarget(null)}
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={finalizeBusy}
              onClick={() => void runFinalizeSession()}
            >
              {finalizeBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Attendi…
                </>
              ) : (
                'Conferma'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  if (embedded) {
    return (
      <div
        id="allenamenti-atleta-embedded"
        className="scroll-mt-24 space-y-4 sm:space-y-6 rounded-xl border border-white/10 bg-black/[0.18] p-4 sm:p-5 md:p-6"
      >
        {panelInner}
      </div>
    )
  }

  if (showHub) {
    return (
      <Card variant="default" className="relative overflow-hidden border-white/[0.09]">
        <div
          className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-primary/[0.09] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-cyan-500/[0.06] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-purple-500/[0.05] blur-3xl"
          aria-hidden
        />
        <CardContent className="relative z-10 space-y-6 p-4 sm:p-6 md:p-8">
          {panelInner}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="default" className="overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">{panelInner}</CardContent>
    </Card>
  )
}
