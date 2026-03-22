'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ArrowRight,
  Plus,
  Filter,
  Search,
  Calendar,
  UserCheck,
  BarChart2,
  Download,
  List,
  LayoutGrid,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import {
  Button,
  Input,
  Label,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { exportToCSV } from '@/lib/export-utils'

const logger = createLogger('app:dashboard:nutrizionista:progressi')
const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'
const DEBOUNCE_MS = 300

type TimelineRow = {
  progress_id: string
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  weight: number | null
  body_fat: number | null
  waist: number | null
  hip: number | null
  created_by_role: string | null
  source: string | null
  created_at: string | null
}

type AthleteOverviewRow = {
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  last_progress_at: string | null
  last_weight: number | null
  last_body_fat: number | null
  last_waist: number | null
  last_hip: number | null
  days_since_last_progress: number | null
  weight_delta_7d: number | null
}

type AssignedAthlete = {
  id: string
  name: string
  email: string | null
  org_id: string
  user_id: string | null
}

type SortOption = 'recent' | 'atleta' | 'peso_delta'
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Più recenti' },
  { value: 'atleta', label: 'Atleta (A–Z)' },
  { value: 'peso_delta', label: 'Variazione peso (delta)' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debouncedValue
}

function KpiCard({
  label,
  value,
  active,
  onClick,
  icon: Icon,
}: {
  label: string
  value: number
  active?: boolean
  onClick?: () => void
  icon: React.ElementType
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 sm:p-5 text-left min-w-0 min-h-[44px] touch-manipulation transition-colors ${
        active
          ? 'border-teal-500/50 bg-teal-500/10 ring-1 ring-teal-500/30'
          : 'border-border bg-background-secondary/80 ring-1 ring-white/5 hover:bg-background-tertiary/50'
      }`}
    >
      <div className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </div>
      <p className="text-xl font-bold text-text-primary tabular-nums">{value}</p>
    </button>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="animate-pulse">
        <div className="h-12 bg-background-tertiary/50 border-b border-border" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 border-b border-border/50 flex items-center gap-4 px-4">
            <div className="h-4 flex-1 max-w-[140px] rounded bg-background-tertiary" />
            <div className="h-5 w-24 rounded bg-background-tertiary" />
            <div className="h-4 w-20 rounded bg-background-tertiary" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NutrizionistaProgressiPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timelineRows, setTimelineRows] = useState<TimelineRow[]>([])
  const [athleteOverviewRows, setAthleteOverviewRows] = useState<AthleteOverviewRow[]>([])
  const [assignedAthletes, setAssignedAthletes] = useState<AssignedAthlete[]>([])
  const [viewMode, setViewMode] = useState<'timeline' | 'athletes'>('timeline')
  const [searchInput, setSearchInput] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [kpiFilter, setKpiFilter] = useState<string | null>(null)
  const [filterAthlete, setFilterAthlete] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | '7' | '30'>('all')
  const [filterOrigin, setFilterOrigin] = useState<'all' | 'athlete' | 'staff'>('all')
  const [filterMeasureType, setFilterMeasureType] = useState<'all' | 'weight' | 'bf' | 'waist_hip'>(
    'all',
  )
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [nuovoProgressoOpen, setNuovoProgressoOpen] = useState(false)
  const [nuovoStep, setNuovoStep] = useState(1)
  const [nuovoAthleteId, setNuovoAthleteId] = useState<string | null>(null)
  const [nuovoDate, setNuovoDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [nuovoWeight, setNuovoWeight] = useState('')
  const [nuovoBodyFat, setNuovoBodyFat] = useState('')
  const [nuovoWaist, setNuovoWaist] = useState('')
  const [nuovoHip, setNuovoHip] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [_nuovoFromPdf, setNuovoFromPdf] = useState(false)
  const [nuovoPdfFile, setNuovoPdfFile] = useState<File | null>(null)
  const [_nuovoExtracted, setNuovoExtracted] = useState<Record<string, string>>({})
  const [extractingPdf, setExtractingPdf] = useState(false)

  const debouncedSearch = useDebounce(searchInput.trim().toLowerCase(), DEBOUNCE_MS)

  const loadData = useCallback(async () => {
    if (!profileId) {
      setTimelineRows([])
      setAthleteOverviewRows([])
      setAssignedAthletes([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: staffData, error: staffErr } = await supabase
        .from('staff_atleti')
        .select('atleta_id')
        .eq('staff_id', profileId)
        .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
        .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
      if (staffErr) throw staffErr
      const athleteIds = (staffData ?? [])
        .map((r) => (r as { atleta_id: string }).atleta_id)
        .filter(Boolean)
      if (athleteIds.length === 0) {
        setTimelineRows([])
        setAthleteOverviewRows([])
        setAssignedAthletes([])
        setLoading(false)
        return
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, user_id, nome, cognome, email, org_id')
        .in('id', athleteIds)
      const profilesMap = new Map(
        (profilesData ?? []).map(
          (p: {
            id: string
            user_id: string | null
            nome: string | null
            cognome: string | null
            email: string | null
            org_id: string | null
          }) => [
            p.id,
            {
              name: [p.nome, p.cognome].filter(Boolean).join(' ') || p.id.slice(0, 8),
              email: p.email ?? null,
              org_id: p.org_id ?? '',
              user_id: p.user_id ?? null,
            },
          ],
        ),
      )
      const userIdToProfileId = new Map<string, string>()
      const athleteUserIds: string[] = []
      for (const p of profilesData ?? []) {
        const row = p as { id: string; user_id: string | null }
        if (row.user_id) {
          userIdToProfileId.set(row.user_id, row.id)
          athleteUserIds.push(row.user_id)
        }
      }
      setAssignedAthletes(
        athleteIds.map((id) => ({
          id,
          name: profilesMap.get(id)?.name ?? id.slice(0, 8),
          email: profilesMap.get(id)?.email ?? null,
          org_id: profilesMap.get(id)?.org_id ?? '',
          user_id: profilesMap.get(id)?.user_id ?? null,
        })),
      )

      let loadedFromProgressLogs = false
      if (athleteUserIds.length > 0) {
        const { data: progressLogsData, error: plErr } = await supabase
          .from('progress_logs')
          .select(
            'id, athlete_id, date, weight_kg, massa_grassa_percentuale, waist_cm, hips_cm, created_by_profile_id, source, created_at',
          )
          .in('athlete_id', athleteUserIds)
          .order('created_at', { ascending: false })
          .limit(500)
        if (!plErr && Array.isArray(progressLogsData)) {
          loadedFromProgressLogs = true
          const rows: TimelineRow[] = (
            progressLogsData as Array<{
              id: string
              athlete_id: string
              date?: string | null
              weight_kg?: number | null
              massa_grassa_percentuale?: number | null
              waist_cm?: number | null
              hips_cm?: number | null
              created_by_profile_id?: string | null
              source?: string | null
              created_at?: string | null
            }>
          ).map((r) => {
            const profileId = userIdToProfileId.get(r.athlete_id)
            const prof = profileId ? profilesMap.get(profileId) : null
            return {
              progress_id: r.id,
              athlete_id: profileId ?? r.athlete_id,
              athlete_name: prof?.name ?? null,
              athlete_email: prof?.email ?? null,
              weight: r.weight_kg ?? null,
              body_fat: r.massa_grassa_percentuale ?? null,
              waist: r.waist_cm ?? null,
              hip: r.hips_cm ?? null,
              created_by_role: r.created_by_profile_id ? 'nutrizionista' : 'athlete',
              source: r.source ?? null,
              created_at: r.created_at ?? null,
            }
          })
          setTimelineRows(rows)
          const byProfileId = new Map<string, TimelineRow[]>()
          for (const row of rows) {
            const pid = row.athlete_id
            if (!byProfileId.has(pid)) byProfileId.set(pid, [])
            byProfileId.get(pid)!.push(row)
          }
          const overview: AthleteOverviewRow[] = athleteIds.map((aid) => {
            const list = byProfileId.get(aid) ?? []
            const last = list[0]
            const now = Date.now()
            const lastAt = last ? new Date(last.created_at ?? 0).getTime() : null
            const daysSince = lastAt != null ? (now - lastAt) / (1000 * 60 * 60 * 24) : null
            const weight7d = list.find((x) => {
              const t = new Date(x.created_at ?? 0).getTime()
              return now - t >= 7 * 24 * 60 * 60 * 1000 && x.weight != null
            })
            const delta =
              last?.weight != null && weight7d?.weight != null
                ? last.weight - weight7d.weight
                : null
            return {
              athlete_id: aid,
              athlete_name: profilesMap.get(aid)?.name ?? null,
              athlete_email: profilesMap.get(aid)?.email ?? null,
              last_progress_at: last?.created_at ?? null,
              last_weight: last?.weight ?? null,
              last_body_fat: last?.body_fat ?? null,
              last_waist: last?.waist ?? null,
              last_hip: last?.hip ?? null,
              days_since_last_progress: daysSince,
              weight_delta_7d: delta,
            }
          })
          setAthleteOverviewRows(overview)
        } else if (plErr) {
          logger.warn('progress_logs fallback to nutrition_progress', plErr)
        }
      }

      if (!loadedFromProgressLogs) {
        const timelineRes = (supabase as { from: (t: string) => ReturnType<typeof supabase.from> })
          .from(NUTRITION_TABLES.viewProgressTimeline)
          .select('*')
          .eq('nutritionist_id', profileId)
          .order('created_at', { ascending: false })
          .limit(500)
        const { data: timelineData, error: timelineErr } = await timelineRes
        if (!timelineErr && timelineData && timelineData.length > 0) {
          setTimelineRows((timelineData ?? []) as TimelineRow[])
        }
        const athletesRes = (supabase as { from: (t: string) => ReturnType<typeof supabase.from> })
          .from(NUTRITION_TABLES.viewProgressAthletes)
          .select('*')
          .eq('nutritionist_id', profileId)
        const { data: athletesData, error: athletesErr } = await athletesRes
        if (!athletesErr && athletesData && athletesData.length > 0) {
          setAthleteOverviewRows((athletesData ?? []) as AthleteOverviewRow[])
        } else {
          const _lastProgressMap = new Map<
            string,
            {
              created_at: string
              weight: number | null
              body_fat: number | null
              waist: number | null
              hip: number | null
            }
          >()
          const { data: progressData } = await nutritionFrom(supabase, NUTRITION_TABLES.progress)
            .select('athlete_id, created_at, weight, body_fat, waist, hip, weight_kg')
            .in('athlete_id', athleteIds)
            .order('created_at', { ascending: false })
          const byAthlete = new Map<
            string,
            Array<{
              created_at: string
              weight: number | null
              body_fat: number | null
              waist: number | null
              hip: number | null
            }>
          >()
          ;(progressData ?? []).forEach(
            (p: {
              athlete_id: string
              created_at: string
              weight?: number | null
              weight_kg?: number | null
              body_fat?: number | null
              waist?: number | null
              hip?: number | null
            }) => {
              if (!byAthlete.has(p.athlete_id)) byAthlete.set(p.athlete_id, [])
              byAthlete.get(p.athlete_id)!.push({
                created_at: p.created_at,
                weight: p.weight ?? p.weight_kg ?? null,
                body_fat: p.body_fat ?? null,
                waist: p.waist ?? null,
                hip: p.hip ?? null,
              })
            },
          )
          const overview: AthleteOverviewRow[] = athleteIds.map((aid) => {
            const list = byAthlete.get(aid) ?? []
            const last = list[0]
            const now = Date.now()
            const lastAt = last ? new Date(last.created_at).getTime() : null
            const daysSince = lastAt != null ? (now - lastAt) / (1000 * 60 * 60 * 24) : null
            const weight7d = list.find((x) => {
              const t = new Date(x.created_at).getTime()
              return now - t >= 7 * 24 * 60 * 60 * 1000 && x.weight != null
            })
            const delta =
              last?.weight != null && weight7d?.weight != null
                ? last.weight - weight7d.weight
                : null
            return {
              athlete_id: aid,
              athlete_name: profilesMap.get(aid)?.name ?? null,
              athlete_email: profilesMap.get(aid)?.email ?? null,
              last_progress_at: last?.created_at ?? null,
              last_weight: last?.weight ?? null,
              last_body_fat: last?.body_fat ?? null,
              last_waist: last?.waist ?? null,
              last_hip: last?.hip ?? null,
              days_since_last_progress: daysSince,
              weight_delta_7d: delta,
            }
          })
          setAthleteOverviewRows(overview)
        }
      }
    } catch (e) {
      logger.error('Errore caricamento progressi', e)
      setError(e instanceof Error ? e.message : 'Errore caricamento')
    } finally {
      setLoading(false)
    }
  }, [profileId, supabase])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const now = useMemo(() => new Date(), [])
  const todayStart = useMemo(() => {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [now])
  const sevenDaysAgo = useMemo(() => {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d.toISOString()
  }, [now])
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return d.toISOString()
  }, [now])

  const kpiCounts = useMemo(() => {
    const last7 = timelineRows.filter((r) => r.created_at && r.created_at >= sevenDaysAgo).length
    const noProgress14 = athleteOverviewRows.filter(
      (r) => (r.days_since_last_progress ?? 999) >= 14,
    ).length
    const withDelta = athleteOverviewRows.filter((r) => r.weight_delta_7d != null).length
    const byAthlete = timelineRows.filter(
      (r) => r.created_by_role === 'athlete' || (r.source ?? '').toLowerCase().includes('athlete'),
    ).length
    return { last7, noProgress14, withDelta, byAthlete }
  }, [timelineRows, athleteOverviewRows, sevenDaysAgo])

  const filteredTimeline = useMemo(() => {
    let list = timelineRows
    if (debouncedSearch) {
      list = list.filter(
        (r) =>
          (r.athlete_name ?? '').toLowerCase().includes(debouncedSearch) ||
          (r.athlete_email ?? '').toLowerCase().includes(debouncedSearch),
      )
    }
    if (kpiFilter === 'last7')
      list = list.filter((r) => r.created_at && r.created_at >= sevenDaysAgo)
    if (filterAthlete !== 'all') list = list.filter((r) => r.athlete_id === filterAthlete)
    if (filterPeriod === 'today')
      list = list.filter((r) => r.created_at && r.created_at >= todayStart)
    else if (filterPeriod === '7')
      list = list.filter((r) => r.created_at && r.created_at >= sevenDaysAgo)
    else if (filterPeriod === '30')
      list = list.filter((r) => r.created_at && r.created_at >= thirtyDaysAgo)
    if (filterOrigin === 'athlete')
      list = list.filter(
        (r) =>
          r.created_by_role === 'athlete' || (r.source ?? '').toLowerCase().includes('athlete'),
      )
    else if (filterOrigin === 'staff')
      list = list.filter(
        (r) =>
          r.created_by_role !== 'athlete' && !(r.source ?? '').toLowerCase().includes('athlete'),
      )
    if (filterMeasureType === 'weight') list = list.filter((r) => r.weight != null)
    else if (filterMeasureType === 'bf') list = list.filter((r) => r.body_fat != null)
    else if (filterMeasureType === 'waist_hip')
      list = list.filter((r) => r.waist != null || r.hip != null)
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'atleta') return (a.athlete_name ?? '').localeCompare(b.athlete_name ?? '')
      const ca = a.created_at ?? ''
      const cb = b.created_at ?? ''
      return cb.localeCompare(ca)
    })
    return sorted
  }, [
    timelineRows,
    debouncedSearch,
    kpiFilter,
    filterAthlete,
    filterPeriod,
    filterOrigin,
    filterMeasureType,
    sortBy,
    todayStart,
    sevenDaysAgo,
    thirtyDaysAgo,
  ])

  const filteredAthletes = useMemo(() => {
    let list = athleteOverviewRows
    if (debouncedSearch) {
      list = list.filter(
        (r) =>
          (r.athlete_name ?? '').toLowerCase().includes(debouncedSearch) ||
          (r.athlete_email ?? '').toLowerCase().includes(debouncedSearch),
      )
    }
    if (kpiFilter === 'no14') list = list.filter((r) => (r.days_since_last_progress ?? 0) >= 14)
    if (kpiFilter === 'delta') list = list.filter((r) => r.weight_delta_7d != null)
    if (kpiFilter === 'byAthlete') {
      const athleteIdsWithAthleteSource = new Set(
        timelineRows
          .filter(
            (r) =>
              r.created_by_role === 'athlete' || (r.source ?? '').toLowerCase().includes('athlete'),
          )
          .map((r) => r.athlete_id),
      )
      list = list.filter((r) => athleteIdsWithAthleteSource.has(r.athlete_id))
    }
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'atleta') return (a.athlete_name ?? '').localeCompare(b.athlete_name ?? '')
      if (sortBy === 'peso_delta') {
        const da = a.weight_delta_7d ?? -Infinity
        const db = b.weight_delta_7d ?? -Infinity
        return db - da
      }
      const aa = a.last_progress_at ?? ''
      const bb = b.last_progress_at ?? ''
      return bb.localeCompare(aa)
    })
    return sorted
  }, [athleteOverviewRows, timelineRows, debouncedSearch, kpiFilter, sortBy])

  const clearFilters = useCallback(() => {
    setKpiFilter(null)
    setFilterAthlete('all')
    setFilterPeriod('all')
    setFilterOrigin('all')
    setFilterMeasureType('all')
    setSearchInput('')
  }, [])

  const handleExportCSV = useCallback(() => {
    const data =
      viewMode === 'timeline'
        ? filteredTimeline.map((r) => ({
            atleta: r.athlete_name ?? '',
            email: r.athlete_email ?? '',
            data_ora: r.created_at ?? '',
            peso: r.weight ?? '',
            bf: r.body_fat ?? '',
            vita: r.waist ?? '',
            fianchi: r.hip ?? '',
            origine: r.created_by_role ?? r.source ?? '',
          }))
        : filteredAthletes.map((r) => ({
            atleta: r.athlete_name ?? '',
            email: r.athlete_email ?? '',
            ultimo_progresso: r.last_progress_at ?? '',
            giorni_da_ultimo: r.days_since_last_progress ?? '',
            ultimo_peso: r.last_weight ?? '',
            delta_peso_7gg: r.weight_delta_7d ?? '',
          }))
    exportToCSV(data, `progressi_nutrizione_${now.toISOString().slice(0, 10)}.csv`)
  }, [viewMode, filteredTimeline, filteredAthletes, now])

  const handleNuovoProgressoSubmit = useCallback(async () => {
    if (!nuovoAthleteId || !profileId) return
    const athlete = assignedAthletes.find((a) => a.id === nuovoAthleteId)
    if (!athlete) return
    const athleteUserId = athlete.user_id
    if (!athleteUserId) {
      setError('Atleta senza account: impossibile salvare in progressi.')
      return
    }
    setSubmitting(true)
    try {
      const dateVal = nuovoDate
        ? new Date(nuovoDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
      const payload = {
        athlete_id: athleteUserId,
        date: dateVal,
        weight_kg: nuovoWeight ? Number(nuovoWeight) : null,
        massa_grassa_percentuale: nuovoBodyFat ? Number(nuovoBodyFat) : null,
        waist_cm: nuovoWaist ? Number(nuovoWaist) : null,
        hips_cm: nuovoHip ? Number(nuovoHip) : null,
        created_by_profile_id: profileId,
        source: 'pdf_import',
      }
      const { error: err } = await supabase.from('progress_logs').insert(payload)
      if (err) throw err
      setNuovoProgressoOpen(false)
      setNuovoStep(1)
      setNuovoAthleteId(null)
      setNuovoFromPdf(false)
      setNuovoPdfFile(null)
      setNuovoExtracted({})
      setNuovoDate(new Date().toISOString().slice(0, 16))
      setNuovoWeight('')
      setNuovoBodyFat('')
      setNuovoWaist('')
      setNuovoHip('')
      void loadData()
    } catch (e) {
      logger.error('Insert progress_logs', e)
      setError(e instanceof Error ? e.message : 'Errore inserimento')
    } finally {
      setSubmitting(false)
    }
  }, [
    nuovoAthleteId,
    profileId,
    assignedAthletes,
    nuovoDate,
    nuovoWeight,
    nuovoBodyFat,
    nuovoWaist,
    nuovoHip,
    supabase,
    loadData,
  ])

  const openNuovoProgresso = useCallback(() => {
    setNuovoStep(1)
    setNuovoAthleteId(null)
    setNuovoFromPdf(false)
    setNuovoPdfFile(null)
    setNuovoExtracted({})
    setNuovoDate(new Date().toISOString().slice(0, 16))
    setNuovoWeight('')
    setNuovoBodyFat('')
    setNuovoWaist('')
    setNuovoHip('')
    setNuovoProgressoOpen(true)
  }, [])

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Progressi"
      description="Peso, BF e misure degli atleti assegnati"
      icon={<TrendingUp className="w-6 h-6" />}
      theme="teal"
      actions={
        <>
          <Button
            onClick={openNuovoProgresso}
            className="gap-2 bg-teal-600 hover:bg-teal-500 text-white"
          >
            <Plus className="h-4 w-4" />
            Nuovo progresso
          </Button>
          <Button
            variant="outline"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtri
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Esporta
          </Button>
        </>
      }
    >
      {error && (
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadData()}
            className="underline shrink-0 min-h-[44px] touch-manipulation flex items-center"
          >
            Riprova
          </button>
        </div>
      )}

      <section className="grid grid-cols-2 min-[500px]:grid-cols-4 gap-3">
        <KpiCard
          label="Progressi ultimi 7 giorni"
          value={kpiCounts.last7}
          active={kpiFilter === 'last7'}
          onClick={() => setKpiFilter((k) => (k === 'last7' ? null : 'last7'))}
          icon={Calendar}
        />
        <KpiCard
          label="Atleti senza progressi (14 gg)"
          value={kpiCounts.noProgress14}
          active={kpiFilter === 'no14'}
          onClick={() => setKpiFilter((k) => (k === 'no14' ? null : 'no14'))}
          icon={AlertCircle}
        />
        <KpiCard
          label="Con delta peso 7 gg"
          value={kpiCounts.withDelta}
          active={kpiFilter === 'delta'}
          onClick={() => setKpiFilter((k) => (k === 'delta' ? null : 'delta'))}
          icon={BarChart2}
        />
        <KpiCard
          label="Record da atleta"
          value={kpiCounts.byAthlete}
          active={kpiFilter === 'byAthlete'}
          onClick={() => setKpiFilter((k) => (k === 'byAthlete' ? null : 'byAthlete'))}
          icon={UserCheck}
        />
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Cerca atleta…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="min-h-[44px] rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-text-primary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`min-h-[44px] px-3 py-2 text-sm touch-manipulation ${viewMode === 'timeline' ? 'bg-teal-500/20 text-teal-400 border-r border-border' : 'bg-background-secondary text-text-muted'}`}
              title="Timeline"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('athletes')}
              className={`min-h-[44px] px-3 py-2 text-sm touch-manipulation ${viewMode === 'athletes' ? 'bg-teal-500/20 text-teal-400' : 'bg-background-secondary text-text-muted'}`}
              title="Overview atleti"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DrawerContent onClose={() => setFiltersOpen(false)}>
          <DrawerHeader>
            <span>Filtri</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Azzera filtri
            </Button>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div>
              <Label>Atleta</Label>
              <select
                value={filterAthlete}
                onChange={(e) => setFilterAthlete(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                {assignedAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Periodo</Label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as typeof filterPeriod)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="today">Oggi</option>
                <option value="7">Ultimi 7 giorni</option>
                <option value="30">Ultimi 30 giorni</option>
              </select>
            </div>
            <div>
              <Label>Origine</Label>
              <select
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value as typeof filterOrigin)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="athlete">Atleta</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <Label>Tipo misure</Label>
              <select
                value={filterMeasureType}
                onChange={(e) => setFilterMeasureType(e.target.value as typeof filterMeasureType)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="weight">Solo peso</option>
                <option value="bf">Solo BF</option>
                <option value="waist_hip">Vita/fianchi</option>
              </select>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {loading ? (
        <TableSkeleton />
      ) : viewMode === 'timeline' ? (
        filteredTimeline.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-8 text-center text-text-secondary text-sm">
            {timelineRows.length === 0
              ? 'Nessun progresso registrato.'
              : 'Nessun risultato per i filtri selezionati.'}
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background-tertiary/50">
                    <th className="text-left p-3 font-medium">Atleta</th>
                    <th className="text-left p-3 font-medium">Data/ora</th>
                    <th className="text-left p-3 font-medium">Misure</th>
                    <th className="text-left p-3 font-medium">Origine</th>
                    <th className="text-right p-3 font-medium">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimeline.map((r) => (
                    <tr
                      key={r.progress_id}
                      className="border-b border-border/50 hover:bg-background-tertiary/30"
                    >
                      <td className="p-3">
                        <div className="font-medium text-text-primary">{r.athlete_name ?? '—'}</div>
                        {r.athlete_email && (
                          <div className="text-xs text-text-muted">{r.athlete_email}</div>
                        )}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-text-secondary">
                          {r.weight != null && <span>Peso: {r.weight} kg</span>}
                          {r.body_fat != null && <span>BF: {r.body_fat}%</span>}
                          {r.waist != null && <span>Vita: {r.waist} cm</span>}
                          {r.hip != null && <span>Fianchi: {r.hip} cm</span>}
                          {r.weight == null &&
                            r.body_fat == null &&
                            r.waist == null &&
                            r.hip == null &&
                            '—'}
                        </div>
                      </td>
                      <td className="p-3">
                        {r.created_by_role === 'athlete' ||
                        (r.source ?? '').toLowerCase().includes('athlete') ? (
                          <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-xs">
                            ATLETA
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs">
                            STAFF
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/nutrizionista/atleti/${r.athlete_id}?tab=progressi`}
                          >
                            Apri atleta <ArrowRight className="h-3.5 w-3.5 ml-1 inline" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filteredAthletes.length === 0 ? (
        <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-8 text-center text-text-secondary text-sm">
          {athleteOverviewRows.length === 0
            ? 'Nessun atleta con progressi.'
            : 'Nessun risultato per i filtri selezionati.'}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-tertiary/50">
                  <th className="text-left p-3 font-medium">Atleta</th>
                  <th className="text-left p-3 font-medium">Ultimo progresso</th>
                  <th className="text-left p-3 font-medium">Giorni da ultimo</th>
                  <th className="text-left p-3 font-medium">Delta peso 7 gg</th>
                  <th className="text-left p-3 font-medium">Stato</th>
                  <th className="text-right p-3 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredAthletes.map((row) => {
                  const daysSince = row.days_since_last_progress ?? 0
                  const inRitardo = daysSince >= 14
                  return (
                    <tr
                      key={row.athlete_id}
                      className="border-b border-border/50 hover:bg-background-tertiary/30"
                    >
                      <td className="p-3">
                        <div className="font-medium text-text-primary">
                          {row.athlete_name ?? '—'}
                        </div>
                        {row.athlete_email && (
                          <div className="text-xs text-text-muted">{row.athlete_email}</div>
                        )}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {row.last_progress_at
                          ? new Date(row.last_progress_at).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                        {(row.last_weight != null || row.last_body_fat != null) && (
                          <div className="text-xs mt-0.5">
                            {row.last_weight != null && `${row.last_weight} kg`}
                            {row.last_body_fat != null && ` · BF ${row.last_body_fat}%`}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {row.days_since_last_progress != null ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {Math.round(row.days_since_last_progress)} gg
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        {row.weight_delta_7d != null ? (
                          <span
                            className={
                              row.weight_delta_7d >= 0 ? 'text-amber-400' : 'text-emerald-400'
                            }
                          >
                            {row.weight_delta_7d >= 0 ? '+' : ''}
                            {row.weight_delta_7d.toFixed(1)} kg
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        {inRitardo ? (
                          <span className="rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-xs">
                            IN RITARDO
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/nutrizionista/atleti/${row.athlete_id}?tab=progressi`}
                          >
                            Apri <ArrowRight className="h-3.5 w-3.5 ml-1 inline" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={nuovoProgressoOpen} onOpenChange={setNuovoProgressoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>+ Nuovo progresso</DialogTitle>
          </DialogHeader>
          {nuovoStep === 1 ? (
            <>
              <div className="space-y-2">
                <Label>Seleziona atleta</Label>
                <select
                  value={nuovoAthleteId ?? ''}
                  onChange={(e) => setNuovoAthleteId(e.target.value || null)}
                  className="w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {assignedAthletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.email ? `(${a.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNuovoProgressoOpen(false)}>
                  Annulla
                </Button>
                <Button disabled={!nuovoAthleteId} onClick={() => setNuovoStep(2)}>
                  Avanti
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-background-tertiary/50 p-3 space-y-2">
                <Label>Carica da PDF (opzionale)</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="max-w-[200px]"
                    onChange={(e) => setNuovoPdfFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!nuovoPdfFile || extractingPdf || !nuovoAthleteId}
                    onClick={async () => {
                      if (!nuovoPdfFile || !nuovoAthleteId) return
                      setExtractingPdf(true)
                      try {
                        const fd = new FormData()
                        fd.set('file', nuovoPdfFile)
                        fd.set('athleteProfileId', nuovoAthleteId)
                        const res = await fetch('/api/nutritionist/extract-progress-pdf', {
                          method: 'POST',
                          body: fd,
                        })
                        const json = await res.json()
                        if (!res.ok) throw new Error(json?.error ?? 'Estrazione fallita')
                        const ext = (json.extracted ?? {}) as Record<string, string>
                        setNuovoExtracted(ext)
                        if (ext.peso_kg ?? ext.weight_kg)
                          setNuovoWeight(ext.peso_kg ?? ext.weight_kg ?? '')
                        if (ext.massa_grassa_percentuale)
                          setNuovoBodyFat(ext.massa_grassa_percentuale)
                        if (ext.vita_cm ?? ext.waist_cm)
                          setNuovoWaist(ext.vita_cm ?? ext.waist_cm ?? '')
                        if (ext.fianchi_cm ?? ext.hips_cm)
                          setNuovoHip(ext.fianchi_cm ?? ext.hips_cm ?? '')
                      } catch (e) {
                        logger.error('Extract PDF', e)
                        setError(e instanceof Error ? e.message : 'Errore estrazione PDF')
                      } finally {
                        setExtractingPdf(false)
                      }
                    }}
                  >
                    {extractingPdf ? 'Estrazione…' : 'Estrai valori'}
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Data e ora</Label>
                  <Input
                    type="datetime-local"
                    value={nuovoDate}
                    onChange={(e) => setNuovoDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="es. 72.5"
                    value={nuovoWeight}
                    onChange={(e) => setNuovoWeight(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Body fat %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="es. 18"
                    value={nuovoBodyFat}
                    onChange={(e) => setNuovoBodyFat(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Vita (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="es. 82"
                    value={nuovoWaist}
                    onChange={(e) => setNuovoWaist(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Fianchi (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="es. 98"
                    value={nuovoHip}
                    onChange={(e) => setNuovoHip(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNuovoStep(1)}>
                  Indietro
                </Button>
                {nuovoAthleteId &&
                  !assignedAthletes.find((a) => a.id === nuovoAthleteId)?.user_id && (
                    <span className="text-xs text-amber-400">
                      Atleta senza account: salvataggio non disponibile.
                    </span>
                  )}
                <Button
                  onClick={handleNuovoProgressoSubmit}
                  disabled={
                    submitting || !assignedAthletes.find((a) => a.id === nuovoAthleteId)?.user_id
                  }
                >
                  {submitting ? 'Salvataggio…' : 'Salva'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </StaffContentLayout>
  )
}
