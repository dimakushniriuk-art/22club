'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  User,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  FileText,
  X,
  Loader2,
} from 'lucide-react'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { Button, Drawer, DrawerContent, DrawerHeader, DrawerBody } from '@/components/ui'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { macroTargetsFromPlanMacros } from '@/lib/nutrition-plan-version-macros'
import { useNotify } from '@/lib/ui/notify'
import type { Json } from '@/types/supabase'

const logger = createLogger('app:dashboard:nutrizionista:analisi')
const THRESHOLD_KG = 0.3

type WeeklyRow = {
  nutritionist_id: string
  weekly_id: string
  version_id: string | null
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  week_start: string | null
  week_end: string | null
  avg_weight: number | null
  delta_weight: number | null
  target_delta: number | null
  delta_vs_target: number | null
  abs_delta_vs_target: number | null
  adjustment_applied: boolean | null
  created_at: string | null
}

type ProgressEntry = {
  id: string
  created_at: string | null
  weight: number | null
  body_fat: number | null
  waist: number | null
  hip: number | null
  created_by_role: string | null
  source: string | null
}

type VersionInfo = {
  id: string
  version_number: number | null
  status: string | null
  start_date: string | null
  end_date: string | null
  calories_target: number | null
  protein_target: number | null
  carb_target: number | null
  fat_target: number | null
  pdf_file_path: string | null
  auto_generated: boolean | null
  auto_adjustment_reason: string | null
}

function getWeekRangeLast4(): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 28)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
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

function drawerLoadUserMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = String((err as { message?: string }).message ?? '')
    const code = (err as { code?: string }).code
    if (
      code === '42501' ||
      /permission denied|rls|row-level security/i.test(m)
    ) {
      return 'Caricamento negato dai permessi del database. Verifica l’assegnazione atleta o contatta l’amministratore.'
    }
    if (m.trim()) return m
  }
  return 'Impossibile caricare progressi e piano per questa settimana. Riprova.'
}

function badgeStatus(row: WeeklyRow): 'OK' | 'WARN' | 'OPPOSTO' | 'ADJ' | null {
  const abs = row.abs_delta_vs_target ?? 0
  const opposto =
    (row.target_delta != null && row.target_delta < 0 && (row.delta_weight ?? 0) > 0) ||
    (row.target_delta != null && row.target_delta > 0 && (row.delta_weight ?? 0) < 0)
  if (row.adjustment_applied) return 'ADJ'
  if (opposto) return 'OPPOSTO'
  if (abs > THRESHOLD_KG) return 'WARN'
  return 'OK'
}

export default function NutrizionistaAnalisiPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const { notify } = useNotify()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<WeeklyRow[]>([])
  const [assignedAthletes, setAssignedAthletes] = useState<
    { id: string; name: string; email: string | null }[]
  >([])
  const [periodMode, setPeriodMode] = useState<'last4' | 'single' | 'custom'>('last4')
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 28)
    return d.toISOString().slice(0, 10)
  })
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().slice(0, 10))
  const [filterAthlete, setFilterAthlete] = useState<string>('all')
  const [soloAlert, setSoloAlert] = useState(false)
  const [kpiFilter, setKpiFilter] = useState<
    'all' | 'inline' | 'fuori' | 'adjusted' | 'opposto' | null
  >(null)
  const [sortBy, setSortBy] = useState<'week' | 'scostamento'>('week')
  const [drawerRow, setDrawerRow] = useState<WeeklyRow | null>(null)
  const [drawerProgress, setDrawerProgress] = useState<ProgressEntry[]>([])
  const [drawerVersion, setDrawerVersion] = useState<VersionInfo | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [drawerError, setDrawerError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!profileId) {
      setRows([])
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
        setRows([])
        setAssignedAthletes([])
        setLoading(false)
        return
      }

      const profilesAccum: {
        id: string
        nome: string | null
        cognome: string | null
        email: string | null
      }[] = []
      for (const idChunk of chunkForSupabaseIn(athleteIds)) {
        const { data: profilesData, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email')
          .in('id', idChunk)
        if (profilesErr) {
          logger.error('Analisi nutrizionista: caricamento profili', profilesErr)
          throw profilesErr
        }
        profilesAccum.push(...((profilesData ?? []) as (typeof profilesAccum)[number][]))
      }
      const profilesMap = new Map(
        profilesAccum.map((p) => [
          p.id,
          {
            name: [p.nome, p.cognome].filter(Boolean).join(' ') || p.id.slice(0, 8),
            email: p.email ?? null,
          },
        ]),
      )
      setAssignedAthletes(
        athleteIds.map((id) => ({
          id,
          name: profilesMap.get(id)?.name ?? id.slice(0, 8),
          email: profilesMap.get(id)?.email ?? null,
        })),
      )

      const viewRes = (supabase as { from: (t: string) => ReturnType<typeof supabase.from> })
        .from(NUTRITION_TABLES.viewWeeklyAnalysis)
        .select('*')
        .eq('nutritionist_id', profileId)
        .order('week_start', { ascending: false })
        .limit(500)
      const { data: viewData, error: viewErr } = await viewRes
      if (viewErr) {
        logger.error('View weekly analysis fallback', viewErr)
        type WeeklyRaw = Record<string, unknown> & {
          id: string
          athlete_id: string
          version_id?: string | null
          week_start?: string | null
          week_end?: string | null
          avg_weight?: number | null
          delta_weight?: number | null
          target_delta?: number | null
          adjustment_applied?: boolean | null
          created_at?: string | null
        }
        const rawAccum: WeeklyRaw[] = []
        for (const idChunk of chunkForSupabaseIn(athleteIds)) {
          const rawRes = await nutritionFrom(supabase, NUTRITION_TABLES.weeklyAnalysis)
            .select('*')
            .in('athlete_id', idChunk)
            .order('week_start', { ascending: false })
          if (rawRes.error) {
            logger.error('Analisi: fallback weeklyAnalysis chunk', rawRes.error)
            throw rawRes.error
          }
          rawAccum.push(...((rawRes.data ?? []) as WeeklyRaw[]))
        }
        rawAccum.sort((a, b) => {
          const wa = a.week_start ? new Date(a.week_start).getTime() : 0
          const wb = b.week_start ? new Date(b.week_start).getTime() : 0
          return wb - wa
        })
        const raw = rawAccum.slice(0, 500)
        const list: WeeklyRow[] = raw.map((r) => {
          const delta = (r.delta_weight as number | null) ?? 0
          const target = (r.target_delta as number | null) ?? 0
          return {
            nutritionist_id: profileId,
            weekly_id: r.id,
            version_id: r.version_id ?? null,
            athlete_id: r.athlete_id,
            athlete_name: profilesMap.get(r.athlete_id)?.name ?? null,
            athlete_email: profilesMap.get(r.athlete_id)?.email ?? null,
            week_start: r.week_start ?? null,
            week_end: r.week_end ?? null,
            avg_weight: r.avg_weight ?? null,
            delta_weight: r.delta_weight ?? null,
            target_delta: r.target_delta ?? null,
            delta_vs_target: delta - target,
            abs_delta_vs_target: Math.abs(delta - target),
            adjustment_applied: r.adjustment_applied ?? null,
            created_at: r.created_at ?? null,
          }
        })
        setRows(list)
      } else {
        setRows((viewData ?? []) as WeeklyRow[])
      }
    } catch (e) {
      logger.error('Errore caricamento analisi settimanale', e)
      setError(e instanceof Error ? e.message : 'Errore caricamento')
    } finally {
      setLoading(false)
    }
  }, [profileId, supabase])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const range = useMemo(() => {
    if (periodMode === 'last4') return getWeekRangeLast4()
    return { start: rangeStart, end: rangeEnd }
  }, [periodMode, rangeStart, rangeEnd])

  const filteredRows = useMemo(() => {
    let list = rows
    const rangeStartDt = new Date(range.start).getTime()
    const rangeEndDt = new Date(range.end).getTime() + 86400000
    list = list.filter((r) => {
      const ws = r.week_start ? new Date(r.week_start).getTime() : 0
      const we = r.week_end ? new Date(r.week_end).getTime() : 0
      return we >= rangeStartDt && ws <= rangeEndDt
    })
    if (filterAthlete !== 'all') list = list.filter((r) => r.athlete_id === filterAthlete)
    if (soloAlert) list = list.filter((r) => (r.abs_delta_vs_target ?? 0) > THRESHOLD_KG)
    if (kpiFilter === 'inline')
      list = list.filter((r) => (r.abs_delta_vs_target ?? 999) <= THRESHOLD_KG)
    else if (kpiFilter === 'fuori')
      list = list.filter((r) => (r.abs_delta_vs_target ?? 0) > THRESHOLD_KG)
    else if (kpiFilter === 'adjusted') list = list.filter((r) => r.adjustment_applied === true)
    else if (kpiFilter === 'opposto') {
      list = list.filter((r) => {
        const td = r.target_delta ?? 0
        const dw = r.delta_weight ?? 0
        return (td < 0 && dw > 0) || (td > 0 && dw < 0)
      })
    }
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'scostamento') {
        const aa = a.abs_delta_vs_target ?? 0
        const bb = b.abs_delta_vs_target ?? 0
        return bb - aa
      }
      const wa = a.week_start ?? ''
      const wb = b.week_start ?? ''
      return wb.localeCompare(wa)
    })
    return sorted
  }, [rows, range, filterAthlete, soloAlert, kpiFilter, sortBy])

  const kpiCounts = useMemo(() => {
    const rangeStartDt = new Date(range.start).getTime()
    const rangeEndDt = new Date(range.end).getTime() + 86400000
    const inRange = rows.filter((r) => {
      const we = r.week_end ? new Date(r.week_end).getTime() : 0
      const ws = r.week_start ? new Date(r.week_start).getTime() : 0
      return we >= rangeStartDt && ws <= rangeEndDt
    })
    const athletes = new Set(inRange.map((r) => r.athlete_id)).size
    const inline = inRange.filter((r) => (r.abs_delta_vs_target ?? 999) <= THRESHOLD_KG).length
    const fuori = inRange.filter((r) => (r.abs_delta_vs_target ?? 0) > THRESHOLD_KG).length
    const adjusted = inRange.filter((r) => r.adjustment_applied === true).length
    const opposto = inRange.filter((r) => {
      const td = r.target_delta ?? 0
      const dw = r.delta_weight ?? 0
      return (td < 0 && dw > 0) || (td > 0 && dw < 0)
    }).length
    return { athletes, inline, fuori, adjusted, opposto }
  }, [rows, range])

  const openDrawer = useCallback(
    async (row: WeeklyRow) => {
      setDrawerRow(row)
      setDrawerProgress([])
      setDrawerVersion(null)
      setDrawerError(null)
      setDrawerLoading(true)
      try {
        const weekEnd = row.week_end ? new Date(row.week_end) : new Date()
        weekEnd.setDate(weekEnd.getDate() + 1)
        const weekEndNext = weekEnd.toISOString()
        const weekStart = row.week_start ?? row.week_end ?? new Date().toISOString()
        const [progRes, verRes] = await Promise.all([
          nutritionFrom(supabase, NUTRITION_TABLES.progress)
            .select(
              'id, created_at, weight, body_fat, waist, hip, created_by_role, source, weight_kg',
            )
            .eq('athlete_id', row.athlete_id)
            .gte('created_at', weekStart)
            .lt('created_at', weekEndNext)
            .order('created_at', { ascending: true }),
          row.version_id
            ? nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
                .select(
                  'id, version_number, status, start_date, end_date, calories_target, pdf_file_path, macros',
                )
                .eq('id', row.version_id)
                .single()
            : Promise.resolve({ data: null, error: null }),
        ])
        if (progRes.error) {
          throw progRes.error
        }
        if (verRes.error) {
          throw verRes.error
        }
        const progRaw = (progRes.data ?? []) as Array<{
          id: string
          created_at: string | null
          weight?: number | null
          weight_kg?: number | null
          body_fat?: number | null
          waist?: number | null
          hip?: number | null
          created_by_role?: string | null
          source?: string | null
        }>
        setDrawerProgress(
          progRaw.map((p) => ({
            id: p.id,
            created_at: p.created_at,
            weight: p.weight ?? p.weight_kg ?? null,
            body_fat: p.body_fat ?? null,
            waist: p.waist ?? null,
            hip: p.hip ?? null,
            created_by_role: p.created_by_role ?? null,
            source: p.source ?? null,
          })),
        )
        const verRaw = verRes.data as
          | (Partial<VersionInfo> & { id: string; macros?: Json | null })
          | null
        if (verRaw) {
          const mt = macroTargetsFromPlanMacros(verRaw.macros)
          setDrawerVersion({
            id: verRaw.id,
            version_number: verRaw.version_number ?? null,
            status: verRaw.status ?? null,
            start_date: verRaw.start_date ?? null,
            end_date: verRaw.end_date ?? null,
            calories_target: verRaw.calories_target ?? null,
            protein_target: mt.protein_target,
            carb_target: mt.carb_target,
            fat_target: mt.fat_target,
            pdf_file_path: verRaw.pdf_file_path ?? null,
            auto_generated: verRaw.auto_generated ?? null,
            auto_adjustment_reason: verRaw.auto_adjustment_reason ?? null,
          })
        } else {
          setDrawerVersion(null)
        }
      } catch (e) {
        logger.error('Drawer load', e)
        const msg = drawerLoadUserMessage(e)
        setDrawerError(msg)
        notify(msg, 'error')
      } finally {
        setDrawerLoading(false)
      }
    },
    [notify, supabase],
  )

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout
      title="Analisi settimanale"
      description="Indicatori settimanali e scostamenti dagli obiettivi."
      theme="teal"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['last4', 'single', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPeriodMode(mode)}
                className={`px-3 py-2 text-sm ${
                  periodMode === mode
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-background-secondary text-text-muted'
                }`}
              >
                {mode === 'last4'
                  ? 'Ultime 4 settimane'
                  : mode === 'single'
                    ? 'Settimana'
                    : 'Range'}
              </button>
            ))}
          </div>
          {periodMode === 'custom' && (
            <>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="rounded-lg border border-border bg-background-secondary px-2 py-1.5 text-sm"
              />
              <span className="text-text-muted">→</span>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="rounded-lg border border-border bg-background-secondary px-2 py-1.5 text-sm"
              />
            </>
          )}
          <select
            value={filterAthlete}
            onChange={(e) => setFilterAthlete(e.target.value)}
            className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
          >
            <option value="all">Tutti gli atleti</option>
            {assignedAthletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={soloAlert}
              onChange={(e) => setSoloAlert(e.target.checked)}
              className="rounded border-border"
            />
            Solo alert (scostamento &gt; {THRESHOLD_KG} kg)
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'week' | 'scostamento')}
            className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
          >
            <option value="week">Settimana (recente)</option>
            <option value="scostamento">Scostamento (max prima)</option>
          </select>
        </div>
      }
    >
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
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

      <section className="grid grid-cols-2 min-[500px]:grid-cols-5 gap-3">
        <KpiCard
          label="Atleti analizzati"
          value={kpiCounts.athletes}
          active={kpiFilter === null}
          onClick={() => setKpiFilter(null)}
          icon={User}
        />
        <KpiCard
          label="In linea con target"
          value={kpiCounts.inline}
          active={kpiFilter === 'inline'}
          onClick={() => setKpiFilter('inline')}
          icon={CheckCircle2}
        />
        <KpiCard
          label="Fuori target"
          value={kpiCounts.fuori}
          active={kpiFilter === 'fuori'}
          onClick={() => setKpiFilter('fuori')}
          icon={AlertTriangle}
        />
        <KpiCard
          label="Adjustment applicato"
          value={kpiCounts.adjusted}
          active={kpiFilter === 'adjusted'}
          onClick={() => setKpiFilter('adjusted')}
          icon={Sparkles}
        />
        <KpiCard
          label="Trend opposto"
          value={kpiCounts.opposto}
          active={kpiFilter === 'opposto'}
          onClick={() => setKpiFilter('opposto')}
          icon={TrendingDown}
        />
      </section>

      {loading ? (
        <div
          className="flex min-h-[min(40vh,320px)] items-center justify-center rounded-xl border border-border bg-background-secondary/30"
          aria-busy="true"
          aria-label="Caricamento"
        >
          <Loader2 className="h-8 w-8 animate-spin text-teal-400/80" />
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-8 text-center text-text-secondary text-sm">
          {rows.length === 0
            ? 'Nessuna analisi settimanale. I dati vengono popolati dal sistema.'
            : 'Nessun risultato per i filtri selezionati.'}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-tertiary/50">
                  <th className="text-left p-3 sm:p-4 font-medium">Atleta</th>
                  <th className="text-left p-3 sm:p-4 font-medium">Settimana</th>
                  <th className="text-left p-3 sm:p-4 font-medium">Peso medio</th>
                  <th className="text-left p-3 sm:p-4 font-medium">Δ Peso</th>
                  <th className="text-left p-3 sm:p-4 font-medium">Target Δ</th>
                  <th className="text-left p-3 font-medium">Scostamento</th>
                  <th className="text-left p-3 font-medium">Adjustment</th>
                  <th className="text-right p-3 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => {
                  const status = badgeStatus(r)
                  return (
                    <tr
                      key={r.weekly_id}
                      className="border-b border-border/50 hover:bg-background-tertiary/30 cursor-pointer"
                      onClick={() => openDrawer(r)}
                    >
                      <td className="p-3">
                        <div className="font-medium text-text-primary">{r.athlete_name ?? '—'}</div>
                        {r.athlete_email && (
                          <div className="text-xs text-text-muted">{r.athlete_email}</div>
                        )}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {r.week_start && r.week_end
                          ? `${new Date(r.week_start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} → ${new Date(r.week_end).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}`
                          : '—'}
                      </td>
                      <td className="p-3">{r.avg_weight != null ? `${r.avg_weight} kg` : '—'}</td>
                      <td className="p-3">
                        {r.delta_weight != null
                          ? `${r.delta_weight >= 0 ? '+' : ''}${r.delta_weight} kg`
                          : '—'}
                      </td>
                      <td className="p-3">
                        {r.target_delta != null
                          ? `${r.target_delta >= 0 ? '+' : ''}${r.target_delta} kg`
                          : '—'}
                      </td>
                      <td className="p-3">
                        {r.delta_vs_target != null ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              (r.abs_delta_vs_target ?? 0) > THRESHOLD_KG
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {r.delta_vs_target >= 0 ? '+' : ''}
                            {r.delta_vs_target.toFixed(2)} kg
                          </span>
                        ) : (
                          '—'
                        )}
                        {status === 'OPPOSTO' && (
                          <span className="ml-1 rounded-full bg-red-500/20 text-red-300 px-2 py-0.5 text-xs">
                            OPPOSTO
                          </span>
                        )}
                        {status === 'ADJ' && (
                          <span className="ml-1 rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-xs">
                            ADJ
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {r.adjustment_applied ? (
                          <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-xs">
                            Sì
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/nutrizionista/atleti/${r.athlete_id}?tab=analisi`}
                          >
                            Atleta <ArrowRight className="h-3.5 w-3.5 ml-1 inline" />
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

      <Drawer
        open={!!drawerRow}
        onOpenChange={(open) => {
          if (!open) {
            setDrawerRow(null)
            setDrawerError(null)
          }
        }}
      >
        <DrawerContent
          onClose={() => {
            setDrawerRow(null)
            setDrawerError(null)
          }}
        >
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <span>Dettaglio analisi</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDrawerRow(null)
                  setDrawerError(null)
                }}
                aria-label="Chiudi"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>
          <DrawerBody className="space-y-6">
            {drawerRow && (
              <>
                {drawerError ? (
                  <div
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
                    role="alert"
                  >
                    {drawerError}
                  </div>
                ) : null}
                <div className="space-y-1">
                  <h3 className="font-semibold text-text-primary">
                    {drawerRow.athlete_name ?? '—'}
                  </h3>
                  {drawerRow.athlete_email && (
                    <p className="text-sm text-text-muted">{drawerRow.athlete_email}</p>
                  )}
                  <p className="text-sm text-text-secondary">
                    {drawerRow.week_start && drawerRow.week_end
                      ? `${new Date(drawerRow.week_start).toLocaleDateString('it-IT')} → ${new Date(drawerRow.week_end).toLocaleDateString('it-IT')}`
                      : '—'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {badgeStatus(drawerRow) === 'OPPOSTO' && (
                      <span className="rounded-full bg-red-500/20 text-red-300 px-2 py-0.5 text-xs">
                        OPPOSTO
                      </span>
                    )}
                    {badgeStatus(drawerRow) === 'WARN' && (
                      <span className="rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-xs">
                        WARN
                      </span>
                    )}
                    {badgeStatus(drawerRow) === 'OK' && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs">
                        OK
                      </span>
                    )}
                    {drawerRow.adjustment_applied && (
                      <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-xs">
                        ADJ
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-text-muted">Peso medio</p>
                    <p className="text-lg font-semibold">
                      {drawerRow.avg_weight != null ? `${drawerRow.avg_weight} kg` : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-text-muted">Δ Peso</p>
                    <p className="text-lg font-semibold">
                      {drawerRow.delta_weight != null ? `${drawerRow.delta_weight} kg` : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-text-muted">Target Δ</p>
                    <p className="text-lg font-semibold">
                      {drawerRow.target_delta != null ? `${drawerRow.target_delta} kg` : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-text-muted">Scostamento</p>
                    <p className="text-lg font-semibold">
                      {drawerRow.delta_vs_target != null
                        ? `${drawerRow.delta_vs_target.toFixed(2)} kg`
                        : '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">
                    Progressi in settimana
                  </h4>
                  {drawerLoading ? null : drawerProgress.length === 0 ? (
                    <p className="text-sm text-text-muted">Nessun progresso in questo range.</p>
                  ) : (
                    <ul className="rounded-lg border border-border divide-y divide-border/50 overflow-hidden">
                      {drawerProgress.map((p) => (
                        <li
                          key={p.id}
                          className="px-3 py-2 flex items-center justify-between text-sm"
                        >
                          <span className="text-text-secondary">
                            {p.created_at
                              ? new Date(p.created_at).toLocaleString('it-IT', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </span>
                          <span className="text-text-primary">
                            {p.weight != null && `${p.weight} kg`}
                            {p.body_fat != null && ` · BF ${p.body_fat}%`}
                            {p.waist != null && ` · Vita ${p.waist}`}
                            {p.hip != null && ` · Fianchi ${p.hip}`}
                            {p.weight == null &&
                              p.body_fat == null &&
                              p.waist == null &&
                              p.hip == null &&
                              '—'}
                          </span>
                          {(p.created_by_role === 'athlete' ||
                            (p.source ?? '').toLowerCase().includes('athlete')) && (
                            <span className="rounded bg-blue-500/20 text-blue-300 text-xs px-1.5">
                              ATLETA
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {drawerVersion && (
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Piano collegato
                    </h4>
                    <div className="rounded-lg border border-border p-3 space-y-1 text-sm">
                      <p>
                        Versione {drawerVersion.version_number ?? '—'} ·{' '}
                        {drawerVersion.status ?? '—'}
                      </p>
                      {drawerVersion.start_date && drawerVersion.end_date && (
                        <p className="text-text-muted">
                          {new Date(drawerVersion.start_date).toLocaleDateString('it-IT')} →{' '}
                          {new Date(drawerVersion.end_date).toLocaleDateString('it-IT')}
                        </p>
                      )}
                      {(drawerVersion.calories_target != null ||
                        drawerVersion.protein_target != null) && (
                        <p>
                          Kcal {drawerVersion.calories_target ?? '—'} · P{' '}
                          {drawerVersion.protein_target ?? '—'} · C{' '}
                          {drawerVersion.carb_target ?? '—'} · F {drawerVersion.fat_target ?? '—'}
                        </p>
                      )}
                      {drawerVersion.auto_generated && (
                        <p className="text-amber-400 text-xs">
                          Auto: {drawerVersion.auto_adjustment_reason ?? '—'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/nutrizionista/atleti/${drawerRow.athlete_id}?tab=piani`}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Apri piano
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/nutrizionista/atleti/${drawerRow.athlete_id}?tab=piani`}
                    >
                      Crea nuova versione
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/nutrizionista/progressi`}>Vai ai progressi</Link>
                  </Button>
                </div>
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </StaffContentLayout>
  )
}
