'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  ArrowRight,
  ClipboardList,
  FilePlus,
  TrendingUp,
  CalendarClock,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
  PLAN_VERSION_STATUS_ACTIVE,
} from '@/lib/nutrition-tables'

const logger = createLogger('app:dashboard:nutrizionista:page')

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

/** Primo e ultimo istante del mese corrente (UTC). */
function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { start: start.toISOString(), end: end.toISOString() }
}

/** Mese precedente (UTC). */
function getPreviousMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999))
  return { start: start.toISOString(), end: end.toISOString() }
}

function isInMonth(iso: string | null | undefined, monthStart: string, monthEnd: string): boolean {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return t >= new Date(monthStart).getTime() && t <= new Date(monthEnd).getTime()
}

/** Inizio e fine settimana corrente (lun-dom) in UTC. */
function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = new Date(now)
  start.setUTCDate(now.getUTCDate() + mondayOffset)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

/** Settimana precedente (lun-dom) in UTC. */
function getPreviousWeekRange(): { start: string; end: string } {
  const { start: currStart } = getCurrentWeekRange()
  const s = new Date(currStart)
  s.setUTCDate(s.getUTCDate() - 7)
  const e = new Date(s)
  e.setUTCDate(e.getUTCDate() + 6)
  e.setUTCHours(23, 59, 59, 999)
  return { start: s.toISOString(), end: e.toISOString() }
}

function isInWeek(iso: string | null | undefined, weekStart: string, weekEnd: string): boolean {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return t >= new Date(weekStart).getTime() && t <= new Date(weekEnd).getTime()
}

function formatGrowth(value: number): string {
  if (value > 0) return `+${value}%`
  if (value < 0) return `${value}%`
  return '0%'
}

/** Restituisce true se la data ISO è oggi (solo giorno). */
function isToday(iso: string): boolean {
  const d = new Date(iso)
  const today = new Date()
  return d.getUTCFullYear() === today.getUTCFullYear() && d.getUTCMonth() === today.getUTCMonth() && d.getUTCDate() === today.getUTCDate()
}

/** Per il feed: "10m fa", "5h fa", "2g fa" */
function formatTimeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60) return 'ora'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  const d = Math.floor(h / 24)
  return `${d}g fa`
}

/** Saluto del giorno */
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buongiorno'
  if (h < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}

type ActivityItem =
  | { type: 'version'; id: string; at: string; athleteName: string; versionNumber?: number }
  | { type: 'progress'; id: string; at: string; athleteName: string }
  | { type: 'adjustment'; id: string; at: string; athleteName: string; reason?: string }

type UpcomingAppointment = {
  id: string
  starts_at: string
  ends_at: string | null
  athlete_name: string
  type: string | null
}

type NutritionDashboardGrowth = {
  versioni_growth: number
  progressi_growth: number
}

type NutritionDashboardData = {
  athleteIds: string[]
  atletiSeguiti: number
  pianiAttivi: number
  versioniMese: number
  progressiSettimana: number
  pianiInScadenza: number
  atletiSenzaPiano: number
  growth: NutritionDashboardGrowth
  lastUpdated: string | null
  atletiList: Array<{
    id: string
    nome: string
    cognome: string
    ultimoProgressoAt: string | null
    scadenzaPiano: string | null
  }>
  attivitàRecent: ActivityItem[]
  prossimiAppuntamenti: UpcomingAppointment[]
}

export default function NutrizionistaPage() {
  const _router = useRouter()
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_periodView, _setPeriodView] = useState<'mese' | 'settimana'>('mese')
  const [staffDisplayName, setStaffDisplayName] = useState<string | null>(null)
  const [data, setData] = useState<NutritionDashboardData>({
    athleteIds: [],
    atletiSeguiti: 0,
    pianiAttivi: 0,
    versioniMese: 0,
    progressiSettimana: 0,
    pianiInScadenza: 0,
    atletiSenzaPiano: 0,
    growth: { versioni_growth: 0, progressi_growth: 0 },
    lastUpdated: null,
    atletiList: [],
    attivitàRecent: [],
    prossimiAppuntamenti: [],
  })

  const loadData = useCallback(async () => {
    if (!profileId) {
      setData((prev) => ({
        ...prev,
        athleteIds: [],
        atletiSeguiti: 0,
        pianiAttivi: 0,
        versioniMese: 0,
        progressiSettimana: 0,
        pianiInScadenza: 0,
        atletiSenzaPiano: 0,
        growth: { versioni_growth: 0, progressi_growth: 0 },
        lastUpdated: null,
        atletiList: [],
        attivitàRecent: [],
        prossimiAppuntamenti: [],
      }))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data: staffRows, error: staffError } = await supabase
        .from('staff_atleti')
        .select('atleta_id')
        .eq('staff_id', profileId)
        .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
        .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)

      if (staffError) {
        logger.error('Errore staff_atleti', staffError)
        throw staffError
      }

      const athleteIds = (staffRows ?? []).map((r) => (r as { atleta_id: string }).atleta_id).filter(Boolean)

      const { data: staffProfile } = await supabase.from('profiles').select('nome').eq('id', profileId).single()
      setStaffDisplayName((staffProfile as { nome?: string } | null)?.nome ?? null)

      const { start: monthStart, end: monthEnd } = getCurrentMonthRange()
      const endDateLimit = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

      if (athleteIds.length === 0) {
        setData({
          athleteIds: [],
          atletiSeguiti: 0,
          pianiAttivi: 0,
          versioniMese: 0,
          progressiSettimana: 0,
          pianiInScadenza: 0,
          atletiSenzaPiano: 0,
          growth: { versioni_growth: 0, progressi_growth: 0 },
          lastUpdated: new Date().toISOString(),
          atletiList: [],
          attivitàRecent: [],
          prossimiAppuntamenti: [],
        })
        setLoading(false)
        return
      }

      const profilesRes = await supabase.from('profiles').select('id, nome, cognome').in('id', athleteIds)
      const profiles = (profilesRes.data ?? []) as Array<{ id: string; nome: string | null; cognome: string | null }>
      const profilesMap = new Map(profiles.map((p) => [p.id, p]))

      const { start: weekStart, end: weekEnd } = getCurrentWeekRange()
      const groupsRes = await nutritionFrom(supabase, NUTRITION_TABLES.planGroups)
        .select('id, athlete_id')
        .in('athlete_id', athleteIds)
      const groups = (groupsRes.data ?? []) as Array<{ id: string; athlete_id: string }>
      const groupIds = groups.map((g) => g.id)
      const athleteByGroupId = new Map(groups.map((g) => [g.id, g.athlete_id]))

      let pianiAttivi = 0
      let versioniMese = 0
      let pianiInScadenza = 0
      type VersionRow = { id: string; group_id: string; end_date: string | null; status: string; created_at: string | null; version_number?: number }
      let allVersions: VersionRow[] = []
      if (groupIds.length > 0) {
        const versionsRes = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
          .select('id, group_id, end_date, status, created_at, version_number')
          .in('group_id', groupIds)
        if (!versionsRes.error && versionsRes.data?.length) {
          allVersions = versionsRes.data as VersionRow[]
          pianiAttivi = allVersions.filter((v) => v.status === PLAN_VERSION_STATUS_ACTIVE).length
          versioniMese = allVersions.filter((v) => isInMonth(v.created_at, monthStart, monthEnd)).length
          pianiInScadenza = allVersions.filter(
            (v) => v.status === PLAN_VERSION_STATUS_ACTIVE && v.end_date && v.end_date <= endDateLimit,
          ).length
        }
      }

      let progressRows: Array<{ id: string; athlete_id: string; created_at: string | null }> = []
      const progressRes = await nutritionFrom(supabase, NUTRITION_TABLES.progress)
        .select('id, athlete_id, created_at')
        .in('athlete_id', athleteIds)
        .order('created_at', { ascending: false })
        .limit(100)
      if (!progressRes.error) progressRows = (progressRes.data ?? []) as typeof progressRows
      else logger.error('Query nutrition_progress (ignorata)', progressRes.error)

      const progressiSettimana = progressRows.filter((r) => isInWeek(r.created_at, weekStart, weekEnd)).length
      const { start: prevMonthStart, end: prevMonthEnd } = getPreviousMonthRange()
      const { start: prevWeekStart, end: prevWeekEnd } = getPreviousWeekRange()
      const versioniMesePrev = allVersions.filter((v) => isInMonth(v.created_at, prevMonthStart, prevMonthEnd)).length
      const progressiSettimanaPrev = progressRows.filter((r) => isInWeek(r.created_at, prevWeekStart, prevWeekEnd)).length
      const versioni_growth =
        versioniMesePrev > 0
          ? Math.round(((versioniMese - versioniMesePrev) / versioniMesePrev) * 1000) / 10
          : 0
      const progressi_growth =
        progressiSettimanaPrev > 0
          ? Math.round(((progressiSettimana - progressiSettimanaPrev) / progressiSettimanaPrev) * 1000) / 10
          : 0
      const athletesWithActivePlan = new Set(
        allVersions
          .filter((v) => v.status === PLAN_VERSION_STATUS_ACTIVE)
          .map((v) => athleteByGroupId.get(v.group_id))
          .filter(Boolean) as string[],
      )
      const atletiSenzaPiano = athleteIds.length - athletesWithActivePlan.size
      const lastProgressByAthlete = new Map<string, string>()
      progressRows.forEach((r) => {
        if (r.created_at && !lastProgressByAthlete.has(r.athlete_id)) lastProgressByAthlete.set(r.athlete_id, r.created_at)
      })

      const activityItems: ActivityItem[] = []
      progressRows.slice(0, 15).forEach((r) => {
        const prof = profilesMap.get(r.athlete_id)
        const name = [prof?.nome, prof?.cognome].filter(Boolean).join(' ') || 'Atleta'
        activityItems.push({ type: 'progress', id: r.id, at: r.created_at ?? '', athleteName: name })
      })
      allVersions.slice(0, 15).forEach((v) => {
        const aid = athleteByGroupId.get(v.group_id)
        const name = aid ? [profilesMap.get(aid)?.nome, profilesMap.get(aid)?.cognome].filter(Boolean).join(' ') || 'Atleta' : 'Atleta'
        activityItems.push({
          type: 'version',
          id: v.id,
          at: v.created_at ?? '',
          athleteName: name,
          versionNumber: v.version_number,
        })
      })
      type AdjRow = { id: string; athlete_id: string; created_at: string | null; adjustment_reason?: string }
      let adjRows: AdjRow[] = []
      const adjRes = await nutritionFrom(supabase, NUTRITION_TABLES.adjustments)
        .select('id, athlete_id, created_at, adjustment_reason')
        .in('athlete_id', athleteIds)
        .order('created_at', { ascending: false })
        .limit(15)
      if (!adjRes.error && adjRes.data?.length) adjRows = adjRes.data as AdjRow[]
      adjRows.forEach((a) => {
        const prof = profilesMap.get(a.athlete_id)
        const name = [prof?.nome, prof?.cognome].filter(Boolean).join(' ') || 'Atleta'
        activityItems.push({
          type: 'adjustment',
          id: a.id,
          at: a.created_at ?? '',
          athleteName: name,
          reason: a.adjustment_reason ?? undefined,
        })
      })
      activityItems.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      const attivitàRecent = activityItems.slice(0, 10)

      const scadenzaByAthlete = new Map<string, string>()
      if (groupIds.length > 0) {
        const versionsListRes = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
          .select('group_id, end_date, status')
          .in('group_id', groupIds)
          .eq('status', PLAN_VERSION_STATUS_ACTIVE)
        if (!versionsListRes.error && versionsListRes.data?.length) {
          const list = versionsListRes.data as Array<{ group_id: string; end_date: string | null }>
          list.forEach((v) => {
            const aid = athleteByGroupId.get(v.group_id)
            if (aid && v.end_date && !scadenzaByAthlete.has(aid)) scadenzaByAthlete.set(aid, v.end_date)
          })
        }
      }

      const atletiList = athleteIds.slice(0, 10).map((id) => {
        const prof = profilesMap.get(id)
        return {
          id,
          nome: prof?.nome ?? '',
          cognome: prof?.cognome ?? '',
          ultimoProgressoAt: lastProgressByAthlete.get(id) ?? null,
          scadenzaPiano: scadenzaByAthlete.get(id) ?? null,
        }
      })

      const nowIso = new Date().toISOString()
      const { data: aptData } = await supabase
        .from('appointments')
        .select('id, starts_at, ends_at, athlete_id, type')
        .eq('staff_id', profileId)
        .eq('service_type', 'nutrition')
        .gte('starts_at', nowIso)
        .is('cancelled_at', null)
        .order('starts_at', { ascending: true })
        .limit(10)
      type AptRow = { id: string; starts_at: string; ends_at: string | null; athlete_id: string | null; type: string | null }
      const prossimiAppuntamenti: UpcomingAppointment[] = (aptData ?? []).map((apt: AptRow) => {
        const p = apt.athlete_id != null ? profilesMap.get(apt.athlete_id) : undefined
        const name = p ? [p.nome, p.cognome].filter(Boolean).join(' ') || 'Atleta' : 'Atleta'
        return {
          id: apt.id,
          starts_at: apt.starts_at,
          ends_at: apt.ends_at,
          athlete_name: name,
          type: apt.type,
        }
      })

      setData({
        athleteIds,
        atletiSeguiti: athleteIds.length,
        pianiAttivi,
        versioniMese,
        progressiSettimana,
        pianiInScadenza,
        atletiSenzaPiano,
        growth: { versioni_growth, progressi_growth },
        lastUpdated: new Date().toISOString(),
        atletiList,
        attivitàRecent,
        prossimiAppuntamenti,
      })
    } catch (err) {
      logger.error('Errore caricamento dashboard nutrizione', err)
      setError(err instanceof Error ? err.message : 'Errore caricamento dati')
    } finally {
      setLoading(false)
    }
  }, [profileId, supabase])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 max-w-[1800px] mx-auto w-full relative pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Header desktop — nascosto su smartphone (vista dedicata sotto) */}
        <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent break-words">
                Dashboard Nutrizione
              </h1>
            </div>
            <p className="text-text-secondary text-sm sm:text-base mt-1 sm:mt-0">
              KPI e attività solo per atleti collegati. Piani, check-in e documenti tracciabili.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="min-h-[44px] touch-manipulation" onClick={() => void loadData()}>
              Riprova
            </Button>
          </div>
        )}

        {/* Vista smartphone: layout "I tuoi KPI Nutrizione" — testi e blocchi adattati */}
        <div className="md:hidden flex flex-col gap-4 pb-4">
          {loading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-11 w-40 rounded-lg" />
              <div className="grid grid-cols-3 gap-1.5">
                <Skeleton className="h-[72px] rounded-lg" />
                <Skeleton className="h-[72px] rounded-lg" />
                <Skeleton className="h-[72px] rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            </div>
          )}
          {!loading && !error && (
            <>
              <div>
                <p className="text-teal-400 text-xs sm:text-sm font-medium">{getGreeting()}{staffDisplayName ? `, ${staffDisplayName}` : ''}!</p>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-text-primary leading-tight">I tuoi KPI Nutrizione</h2>
                    <p className="text-text-secondary text-xs sm:text-sm leading-snug">Metriche chiave per i tuoi atleti collegati.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-teal-500/30 bg-background-secondary/80 p-3">
                  <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Atleti attivi</p>
                  <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">{data.atletiSeguiti}</p>
                  <p className={`text-[11px] sm:text-xs mt-0.5 tabular-nums ${data.growth.versioni_growth >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {formatGrowth(data.growth.versioni_growth)} vs mese scorso
                  </p>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-background-secondary/80 p-3">
                  <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Atleti senza piano</p>
                  <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">{data.atletiSenzaPiano}</p>
                  {data.atletiSenzaPiano > 0 && (
                    <p className="text-[11px] sm:text-xs mt-0.5 text-amber-400">In attesa di revisione</p>
                  )}
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-background-secondary/80 p-3">
                  <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Piani attivi</p>
                  <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">{data.pianiAttivi}</p>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-background-secondary/80 p-3">
                  <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Scadenze 7g</p>
                  <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">{data.pianiInScadenza}</p>
                  {data.pianiInScadenza > 0 && (
                    <p className="text-[11px] sm:text-xs mt-0.5 text-amber-400">Rinnovi da pianificare</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-1.5">Feed di Attività Recenti</h3>
                <div className="rounded-lg border border-teal-500/20 bg-background-secondary/50 overflow-hidden">
                  {data.attivitàRecent.length === 0 ? (
                    <p className="px-3 py-4 text-center text-text-secondary text-xs sm:text-sm">Nessuna attività recente.</p>
                  ) : (
                    <ul className="divide-y divide-border/50">
                      {data.attivitàRecent.slice(0, 5).map((e) => (
                        <li key={`${e.type}-${e.id}`} className="flex items-center gap-2.5 px-3 py-2.5 min-h-[44px]">
                          <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-medium text-xs shrink-0">
                            {(e.athleteName ?? '?').slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-text-primary text-sm font-medium block truncate">{e.athleteName}</span>
                            <span className="text-text-secondary text-[11px] sm:text-xs">
                              {e.type === 'version' && `Nuova versione${e.versionNumber != null ? ` v${e.versionNumber}` : ''}`}
                              {e.type === 'progress' && 'Caricato peso'}
                              {e.type === 'adjustment' && (e.reason ? `Adattamento: ${e.reason}` : 'Adattamento')}
                            </span>
                          </div>
                          <span className="text-text-muted text-[11px] sm:text-xs shrink-0">{formatTimeAgo(e.at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-teal-500/30 bg-background-secondary/80 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FilePlus className="h-4 w-4 text-teal-400 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-text-primary">Versioni (mese)</p>
                    <p className="text-[11px] sm:text-xs text-text-muted">Tendenze</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base sm:text-lg font-bold text-text-primary tabular-nums">{data.versioniMese} Versioni</p>
                  <p className={`text-[11px] sm:text-xs tabular-nums ${data.growth.versioni_growth >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {formatGrowth(data.growth.versioni_growth)} vs mese scorso
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vista desktop: layout attuale */}
        <div className="hidden md:block">
        {/* Banner alert: piani in scadenza o appuntamenti oggi */}
        {!loading && !error && (data.pianiInScadenza > 0 || data.prossimiAppuntamenti.some((a) => isToday(a.starts_at))) && (
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 px-5 py-4 flex flex-wrap items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" aria-hidden />
            <div className="flex flex-wrap gap-4">
              {data.pianiInScadenza > 0 && (
                <Link
                  href="/dashboard/nutrizionista/piani?filter=scadenza"
                  className="text-amber-200 hover:text-amber-100 font-medium text-sm underline focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                >
                  {data.pianiInScadenza} piano/i in scadenza nei prossimi 7 giorni
                </Link>
              )}
              {data.prossimiAppuntamenti.some((a) => isToday(a.starts_at)) && (
                <Link
                  href="/dashboard/nutrizionista/calendario"
                  className="text-amber-200 hover:text-amber-100 font-medium text-sm underline focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded"
                >
                  Hai appuntamenti oggi
                </Link>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={100} className="rounded-xl" />
              ))}
            </div>
            <Skeleton height={200} className="rounded-xl" />
            <Skeleton height={280} className="rounded-xl" />
            <Skeleton height={240} className="rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* KPI — stile Statistiche (card teal/cyan) + growth + atleti senza piano */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between hover:shadow-xl hover:shadow-teal-500/20 transition-all focus-within:ring-2 focus-within:ring-teal-400 focus-within:ring-offset-2">
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <Users className="w-4 h-4 text-teal-400 shrink-0" aria-hidden />
                  Atleti attivi
                </div>
                <p className="text-2xl font-bold text-teal-400 tabular-nums">{data.atletiSeguiti}</p>
              </div>
              <Link
                href="/dashboard/nutrizionista/atleti"
                className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between hover:shadow-xl hover:shadow-teal-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
              >
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <Users className="w-4 h-4 text-teal-400 shrink-0" aria-hidden />
                  Atleti senza piano
                </div>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{data.atletiSenzaPiano}</p>
              </Link>
              <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between">
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <ClipboardList className="w-4 h-4 text-teal-400 shrink-0" aria-hidden />
                  Piani attivi
                </div>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{data.pianiAttivi}</p>
              </div>
              <div
                className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between"
                title="Nuove versioni di piano create in questo mese"
              >
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <FilePlus className="w-4 h-4 text-teal-400 shrink-0" aria-hidden />
                  Versioni (mese)
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary tabular-nums">{data.versioniMese}</p>
                  <p className={`text-xs mt-1 tabular-nums ${data.growth.versioni_growth >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {formatGrowth(data.growth.versioni_growth)} vs mese prec.
                  </p>
                </div>
              </div>
              <div
                className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between"
                title="Progressi inseriti in questa settimana (lun-dom)"
              >
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <TrendingUp className="w-4 h-4 text-teal-400 shrink-0" aria-hidden />
                  Progressi (settimana)
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-400 tabular-nums">{data.progressiSettimana}</p>
                  <p className={`text-xs mt-1 tabular-nums ${data.growth.progressi_growth >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {formatGrowth(data.growth.progressi_growth)} vs sett. prec.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/nutrizionista/piani?filter=scadenza"
                className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between hover:shadow-xl hover:shadow-teal-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 touch-manipulation"
              >
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <CalendarClock className="w-4 h-4 text-teal-400 shrink-0" aria-hidden />
                  Piani in scadenza
                </div>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{data.pianiInScadenza}</p>
              </Link>
            </div>

            {/* Prossimo appuntamento in evidenza (se c'è almeno uno) */}
            {data.prossimiAppuntamenti.length > 0 && (
              <div className="rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 shadow-lg shadow-teal-500/10 p-5">
                <h2 className="text-sm font-semibold text-teal-400 mb-3">Prossimo appuntamento</h2>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-text-primary">{data.prossimiAppuntamenti[0].athlete_name}</p>
                    <p className="text-text-secondary text-sm">
                      {data.prossimiAppuntamenti[0].type === 'nutrizionista' ? 'Visita' : data.prossimiAppuntamenti[0].type ?? 'Appuntamento'} ·{' '}
                      {new Date(data.prossimiAppuntamenti[0].starts_at).toLocaleDateString('it-IT', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/nutrizionista/calendario"
                    className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-medium text-sm focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 rounded"
                  >
                    Apri calendario
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            )}

            {/* Prossimi appuntamenti */}
            <section className="rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/10 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-teal-500/20">
                <h2 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Prossimi appuntamenti
                </h2>
                <Link
                  href="/dashboard/nutrizionista/calendario"
                  className="text-sm text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 min-h-[44px] touch-manipulation"
                >
                  Vedi calendario
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {data.prossimiAppuntamenti.length === 0 ? (
                <div className="px-5 py-10 text-center text-text-secondary text-sm flex flex-col items-center gap-4">
                  <Calendar className="h-10 w-10 text-teal-500/50 shrink-0" aria-hidden />
                  <p>Nessun appuntamento nutrizione in programma.</p>
                  <Link
                    href="/dashboard/nutrizionista/calendario"
                    className="text-teal-400 hover:text-teal-300 font-medium focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] inline-flex items-center justify-center touch-manipulation"
                  >
                    Apri calendario
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {data.prossimiAppuntamenti.map((apt) => (
                    <li key={apt.id} className="flex items-center gap-3 px-5 py-4 min-h-[44px] hover:bg-background-tertiary/30 transition-colors touch-manipulation">
                      <Calendar className="h-5 w-5 text-teal-400 shrink-0" aria-hidden />
                      <div className="flex-1 min-w-0">
                        <span className="text-text-primary font-medium">{apt.athlete_name}</span>
                        <span className="text-text-secondary text-sm ml-2">
                          {apt.type === 'nutrizionista' ? 'Visita' : apt.type ?? 'Appuntamento'}
                        </span>
                      </div>
                      <span className="text-text-muted text-sm shrink-0">
                        {new Date(apt.starts_at).toLocaleDateString('it-IT', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        )}
        </div>
      </div>
    </div>
  )
}
