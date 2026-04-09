'use client'

import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Fragment, type ReactNode, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Banknote,
  Bell,
  BookMarked,
  CalendarCheck,
  Dumbbell,
  Gauge,
  Info,
  ChartPie,
  LayoutGrid,
  Lightbulb,
  ListOrdered,
  Scale,
  Trophy,
  UserMinus,
  Users,
  UserX,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/charts/client-recharts'
import {
  buildWeeklyRollupFromDaily,
  type TrainerAnalyticsReport,
  type TrainerAlertLevel,
  type TrainerHeatmapCell,
} from '@/lib/trainer-analytics'
import {
  analyticsChartTheme,
  chartBookingStatus,
  chartCategoricalPalette,
  chartHeatmapPrimaryRgb,
  chartTooltipContentStyle,
  chartTooltipLabelStyle,
} from '@/lib/analytics-chart-theme'
import { cn } from '@/lib/utils'

const ch = analyticsChartTheme.chrome
const se = analyticsChartTheme.series

function alertBadgeClass(level: TrainerAlertLevel): string {
  if (level === 'red') return 'bg-red-500/20 text-red-300 border-red-500/50'
  if (level === 'yellow') return 'bg-amber-500/20 text-amber-200 border-amber-500/50'
  return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
}

const WEEK_LABELS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

function heatCellsToMap(cells: TrainerHeatmapCell[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const c of cells) {
    m.set(`${c.weekday}-${c.hour}`, c.count)
  }
  return m
}

const KPI_ACCENTS: Record<
  'teal' | 'cyan' | 'violet' | 'amber' | 'rose' | 'emerald',
  { border: string; icon: string; bar: string }
> = {
  teal: {
    border: 'border-teal-500/25 hover:border-teal-500/40',
    icon: 'bg-teal-500/15 text-teal-300',
    bar: 'from-teal-400 via-teal-400/50 to-transparent',
  },
  cyan: {
    border: 'border-cyan-500/25 hover:border-cyan-500/40',
    icon: 'bg-cyan-500/15 text-cyan-300',
    bar: 'from-cyan-400 via-cyan-400/50 to-transparent',
  },
  violet: {
    border: 'border-violet-500/25 hover:border-violet-500/40',
    icon: 'bg-violet-500/15 text-violet-300',
    bar: 'from-violet-400 via-violet-400/50 to-transparent',
  },
  amber: {
    border: 'border-amber-500/25 hover:border-amber-500/40',
    icon: 'bg-amber-500/15 text-amber-200',
    bar: 'from-amber-400 via-amber-400/50 to-transparent',
  },
  rose: {
    border: 'border-rose-500/25 hover:border-rose-500/40',
    icon: 'bg-rose-500/15 text-rose-300',
    bar: 'from-rose-400 via-rose-400/50 to-transparent',
  },
  emerald: {
    border: 'border-emerald-500/25 hover:border-emerald-500/40',
    icon: 'bg-emerald-500/15 text-emerald-300',
    bar: 'from-emerald-400 via-emerald-400/50 to-transparent',
  },
}

function TrainerSectionCard({
  icon: Icon,
  accent,
  title,
  subtitle,
  className,
  children,
}: {
  icon: LucideIcon
  accent: keyof typeof KPI_ACCENTS
  title: string
  subtitle?: string
  className?: string
  children: ReactNode
}) {
  const a = KPI_ACCENTS[accent]
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.05] to-transparent p-5 sm:p-6 shadow-lg shadow-black/20 transition-colors',
        a.border,
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-90',
          a.bar,
        )}
        aria-hidden
      />
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10',
            a.icon,
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h3>
          {subtitle ? (
            <p className="text-sm leading-relaxed text-text-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  )
}

function TrainerDashboardSection({
  sectionId,
  title,
  subtitle,
  children,
}: {
  sectionId: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/[0.02] shadow-lg shadow-black/15 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 min-w-0"
      aria-labelledby={sectionId}
    >
      <header className="space-y-1 border-b border-white/10 pb-4 sm:pb-5">
        <h2
          id={sectionId}
          className="text-lg sm:text-xl font-semibold tracking-tight text-text-primary"
        >
          {title}
        </h2>
        <p className="text-sm text-text-muted max-w-3xl leading-relaxed">{subtitle}</p>
      </header>
      <div className="space-y-4 sm:space-y-6 min-w-0">{children}</div>
    </section>
  )
}

interface TrainerStatisticheDashboardProps {
  report: TrainerAnalyticsReport
}

export function TrainerStatisticheDashboard({ report }: TrainerStatisticheDashboardProps) {
  const {
    kpis,
    heatmap,
    heatmapEuropeRome,
    paymentMix,
    athletes,
    alerts,
    insights,
    utilizationNote,
    progressDistribution,
    athleteAdherenceLeaders,
    athleteWorkoutSplits,
    athleteLessonBalances,
  } = report

  const [heatmapTz, setHeatmapTz] = useState<'utc' | 'rome'>('rome')
  const [heatmapWorkdaysOnly, setHeatmapWorkdaysOnly] = useState(false)
  const [trendMode, setTrendMode] = useState<'revenue_hours' | 'adherence'>('revenue_hours')
  const [timeGranularity, setTimeGranularity] = useState<'day' | 'week'>('day')

  const chartData = useMemo(() => {
    if (timeGranularity === 'week') return buildWeeklyRollupFromDaily(report.daily)
    return report.daily
  }, [report.daily, timeGranularity])

  const chartDataWithCumulative = useMemo(() => {
    let acc = 0
    return chartData.map((d) => {
      acc += d.revenue
      return { ...d, revenueCumulative: Math.round(acc * 100) / 100 }
    })
  }, [chartData])

  const activeHeatmap = heatmapTz === 'rome' ? heatmapEuropeRome : heatmap

  const heatMax = useMemo(() => {
    if (activeHeatmap.length === 0) return 1
    return Math.max(1, ...activeHeatmap.map((h) => h.count))
  }, [activeHeatmap])

  const heatByWh = useMemo(() => heatCellsToMap(activeHeatmap), [activeHeatmap])

  const adherenceDaily = useMemo(
    () =>
      chartData.map((d) => {
        const tot = d.prenotati + d.eseguiti + d.annullati + d.cancellati
        const pct = tot > 0 ? Math.round((d.eseguiti / tot) * 1000) / 10 : 0
        return { ...d, adherenceDayPct: pct }
      }),
    [chartData],
  )

  const weekdayRows = useMemo(() => {
    if (!heatmapWorkdaysOnly) return WEEK_LABELS.map((_, i) => i)
    return [1, 2, 3, 4, 5]
  }, [heatmapWorkdaysOnly])

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <TrainerDashboardSection
        sectionId="trainer-dash-atleti"
        title="Attività atleti"
        subtitle="Calendario, presenze, progressi corporei e impegno sul roster: la priorità operativa su cosa fanno i tuoi atleti nel periodo."
      >
        <p className="text-sm text-text-muted max-w-3xl leading-relaxed">
          L’icona info in alto a destra di ogni scheda KPI spiega come è calcolato il valore.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            icon={CalendarCheck}
            accent="cyan"
            label="Quanti allenamenti in agenda sono stati fatti"
            value={`${kpis.adherencePct.toFixed(0)}%`}
            caption={
              kpis.scheduledWorkoutAppointments > 0
                ? `${kpis.appointmentEseguiti} fatti su ${kpis.scheduledWorkoutAppointments} in calendario (inclusi spostati o cancellati)`
                : 'Nessun appuntamento di allenamento nel periodo'
            }
            detailHint="Rapporto tra allenamenti effettivamente svolti e tutti quelli previsti in agenda nello stesso periodo (conta anche annullati e cancellati, come da regole interne)."
          />
          <KpiCard
            icon={UserX}
            accent="amber"
            label="Assenze senza disdetta (no-show)"
            value={String(kpis.noShowCount)}
            caption={
              kpis.noShowCount === 0
                ? 'Nessun no-show registrato negli appuntamenti di allenamento'
                : 'Appuntamenti di allenamento con assenza segnalata (una volta per appuntamento)'
            }
            detailHint="Conta gli appuntamenti di allenamento in cui risulta un’assenza (da stato appuntamento o da tipo di cancellazione no-show)."
          />
          <KpiCard
            icon={Scale}
            accent="violet"
            label="Media variazione peso atleti"
            value={
              kpis.progressWeightAvgPct != null ? `${kpis.progressWeightAvgPct > 0 ? '+' : ''}${kpis.progressWeightAvgPct.toFixed(1)}%` : '—'
            }
            caption={
              kpis.progressWeightAvgPct != null
                ? 'Media delle variazioni % tra prima e ultima pesata nel periodo (chi ha almeno due misure)'
                : 'Servono almeno due pesate nel periodo per calcolare una media'
            }
            detailHint="Per ogni atleta con almeno due rilevazioni di peso nel periodo si guarda la variazione percentuale; il numero mostrato è la media di queste variazioni."
          />
          <KpiCard
            icon={Gauge}
            accent="emerald"
            label="Indice complessivo (0–100)"
            value={kpis.compositeScore.toFixed(1)}
            caption="Riassume insieme andamento peso, rispetto calendario e uscite clienti"
            detailHint="Punteggio sintetico (0–100) che combina progressi di peso, rispetto degli appuntamenti e stabilità del parco clienti, con pesi interni fissi."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TrainerSectionCard
            icon={Scale}
            accent="violet"
            title="Come si distribuisce il cambio di peso"
            subtitle="Solo atleti con almeno due pesate nel periodo: vedi quanti sono migliorati, stabili o sono saliti di peso."
          >
            {progressDistribution.length === 0 ? (
              <p className="text-sm leading-relaxed text-text-muted">
                Non ci sono abbastanza misurazioni ripetute nello stesso periodo per disegnare le fasce.
              </p>
            ) : (
              <ul className="space-y-3">
                {progressDistribution.map((b) => (
                  <li key={b.band} className="space-y-2">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-medium text-text-secondary">{b.band}</span>
                      <span className="tabular-nums text-text-muted">
                        {b.count} atleti ({b.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500/70 to-teal-500/50 transition-all"
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TrainerSectionCard>
          <TrainerSectionCard
            icon={Trophy}
            accent="emerald"
            title="Chi rispetta di più il calendario"
            subtitle="Classifica degli atleti con almeno due allenamenti in agenda nel periodo: in testa chi ha svolto la maggior parte di quelli previsti."
          >
            {athleteAdherenceLeaders.length === 0 ? (
              <p className="text-sm leading-relaxed text-text-muted">
                Servono almeno due appuntamenti di allenamento per atleta per comparare in modo sensato.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {athleteAdherenceLeaders.map((r) => (
                  <li
                    key={r.athleteId}
                    className="flex justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="font-medium text-text-primary">{r.displayName}</span>
                    <span className="shrink-0 text-text-muted tabular-nums">
                      {r.adherencePct.toFixed(0)}% · {r.booked} in agenda
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TrainerSectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TrainerSectionCard
            icon={Dumbbell}
            accent="teal"
            title="Allenamenti con te vs in autonomia"
            subtitle="Nel periodo selezionato: sessioni nei log con te come coach rispetto a quelle registrate senza il tuo coach (stessi stati usati per le ore KPI)."
          >
            {athleteWorkoutSplits.length === 0 ? (
              <p className="text-sm leading-relaxed text-text-muted">
                Nessun workout nel periodo con conteggio per atleta del roster.
              </p>
            ) : (
              <ul className="space-y-4 max-h-[min(520px,70vh)] overflow-y-auto pr-1">
                {athleteWorkoutSplits.map((r) => {
                  const tot = r.withTrainer + r.solo
                  const pctT = tot > 0 ? (r.withTrainer / tot) * 100 : 0
                  const pctS = tot > 0 ? (r.solo / tot) * 100 : 0
                  const initials =
                    r.displayName
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '?'
                  return (
                    <li key={r.athleteId} className="flex gap-3 items-start">
                      <Link
                        href={`/dashboard/atleti/${r.athleteId}`}
                        className="shrink-0 pt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full"
                        aria-label={`Scheda ${r.displayName}`}
                      >
                        <Avatar src={r.avatarUrl} alt="" size="sm" fallbackText={initials} />
                      </Link>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <Link
                            href={`/dashboard/atleti/${r.athleteId}`}
                            className="font-medium text-text-primary truncate hover:text-teal-300 transition-colors"
                          >
                            {r.displayName}
                          </Link>
                          <span className="text-xs tabular-nums text-text-muted shrink-0">
                            {r.withTrainer} con te · {r.solo} autonomi
                          </span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-teal-500/75 transition-all"
                            style={{ width: `${pctT}%` }}
                            title={`Con te: ${r.withTrainer}`}
                          />
                          <div
                            className="h-full bg-slate-500/60 transition-all"
                            style={{ width: `${pctS}%` }}
                            title={`Autonomi: ${r.solo}`}
                          />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {athleteWorkoutSplits.length > 0 ? (
              <p className="text-xs text-text-muted mt-3 pt-3 border-t border-white/10">
                Verde = log con te come coach; grigio = altri (in autonomia o altro coach).
              </p>
            ) : null}
          </TrainerSectionCard>
          <TrainerSectionCard
            icon={BookMarked}
            accent="cyan"
            title="Lezioni: usate, prenotate e disponibili"
            subtitle="Usate = debiti su pacchetto training; prenotate = appuntamenti allenamento futuri ancora aperti in agenda; disponibili = rimanenti dal pacchetto."
          >
            {athleteLessonBalances.length === 0 ? (
              <p className="text-sm leading-relaxed text-text-muted">
                Nessun dato pacchetti o prenotazioni future per il roster in questo contesto.
              </p>
            ) : (
              <ul className="space-y-4 max-h-[min(520px,70vh)] overflow-y-auto pr-1">
                {athleteLessonBalances.map((r) => {
                  const denom = Math.max(1, r.totalUsed + r.totalRemaining + r.futureBookedCount)
                  const wU = (r.totalUsed / denom) * 100
                  const wF = (r.futureBookedCount / denom) * 100
                  const wR = (r.totalRemaining / denom) * 100
                  const initials =
                    r.displayName
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '?'
                  return (
                    <li key={r.athleteId} className="flex gap-3 items-start">
                      <Link
                        href={`/dashboard/atleti/${r.athleteId}`}
                        className="shrink-0 pt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
                        aria-label={`Scheda ${r.displayName}`}
                      >
                        <Avatar src={r.avatarUrl} alt="" size="sm" fallbackText={initials} />
                      </Link>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <Link
                            href={`/dashboard/atleti/${r.athleteId}`}
                            className="font-medium text-text-primary truncate hover:text-cyan-300 transition-colors"
                          >
                            {r.displayName}
                          </Link>
                          <span className="text-xs tabular-nums text-text-muted shrink-0 text-right">
                            {r.totalUsed} usate · {r.futureBookedCount} in agenda · {r.totalRemaining}{' '}
                            disp.
                            {r.totalPurchased > 0 ? ` · ${r.totalPurchased} acquistate` : ''}
                          </span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-rose-400/70 transition-all"
                            style={{ width: `${wU}%` }}
                            title={`Usate: ${r.totalUsed}`}
                          />
                          <div
                            className="h-full bg-amber-400/75 transition-all"
                            style={{ width: `${wF}%` }}
                            title={`Prenotate (futuro): ${r.futureBookedCount}`}
                          />
                          <div
                            className="h-full bg-cyan-500/65 transition-all"
                            style={{ width: `${wR}%` }}
                            title={`Disponibili: ${r.totalRemaining}`}
                          />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {athleteLessonBalances.length > 0 ? (
              <p className="text-xs text-text-muted mt-3 pt-3 border-t border-white/10">
                Barra normalizzata su usate + disponibili + prenotate in agenda; i numeri assoluti sono nella
                riga a destra.
              </p>
            ) : null}
          </TrainerSectionCard>
        </div>

        <TrainerSectionCard
          icon={Users}
          accent="cyan"
          title="I tuoi clienti nel periodo"
          subtitle="Atleti che risultano nel tuo roster. Da qui apri scheda, movimenti economici o agenda già filtrata sull’atleta."
        >
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {athletes.slice(0, 40).map((a) => {
              const initials =
                a.displayName
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || '?'
              return (
                <li
                  key={a.athleteId}
                  className="flex gap-3 items-start rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 sm:items-center"
                >
                  <Link
                    href={`/dashboard/atleti/${a.athleteId}`}
                    className="shrink-0 pt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
                    aria-label={`Scheda ${a.displayName}`}
                  >
                    <Avatar src={a.avatarUrl} alt="" size="sm" fallbackText={initials} />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/atleti/${a.athleteId}`}
                        className="font-semibold text-text-primary hover:text-cyan-300 transition-colors"
                      >
                        {a.displayName}
                      </Link>
                      <p className="mt-0.5 text-sm text-text-muted">
                        €{a.revenue.toFixed(0)} · {a.workoutCount} allenamenti
                        {a.weightChangePct != null
                          ? ` · peso ${a.weightChangePct > 0 ? '+' : ''}${a.weightChangePct.toFixed(1)}%`
                          : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Link
                        href={`/dashboard/atleti/${a.athleteId}`}
                        className="rounded-lg border border-teal-500/30 px-2.5 py-1 text-xs font-medium text-teal-300 transition-colors hover:bg-teal-500/10"
                      >
                        Profilo
                      </Link>
                      <Link
                        href={`/dashboard/pagamenti/atleta/${a.athleteId}?service=training`}
                        className="rounded-lg border border-cyan-500/30 px-2.5 py-1 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/10"
                      >
                        Incassi
                      </Link>
                      <Link
                        href={`/dashboard/calendario?athlete=${encodeURIComponent(a.athleteId)}`}
                        className="rounded-lg border border-violet-500/30 px-2.5 py-1 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/10"
                      >
                        Agenda
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </TrainerSectionCard>
      </TrainerDashboardSection>

      <TrainerDashboardSection
        sectionId="trainer-dash-trainer"
        title="Attività del trainer"
        subtitle="Semafori, andamenti, affluenza in agenda e carico di lavoro: come organizzi e eroghi le sessioni nel periodo."
      >
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TrainerSectionCard
          icon={Bell}
          accent="teal"
          title="Semaforo sui numeri chiave"
          subtitle="Verde, giallo o rosso in base a soglie interne: quanto rispetti il calendario, se i clienti restano e se incassi abbastanza rispetto alle ore che registri."
        >
          <ul className="space-y-3">
            {alerts.map((a) => (
              <li
                key={a.id}
                className={cn(
                  'flex flex-col gap-1.5 rounded-xl border px-4 py-3 text-sm leading-snug',
                  alertBadgeClass(a.level),
                )}
              >
                <span className="font-semibold text-text-primary">{a.label}</span>
                <span className="text-sm text-text-secondary/95">{a.hint}</span>
              </li>
            ))}
          </ul>
        </TrainerSectionCard>
        <TrainerSectionCard
          icon={Lightbulb}
          accent="cyan"
          title="Suggerimenti automatici"
          subtitle="Frasi generate dai dati del periodo: sono spunti di lavoro, non un verdetto finale."
        >
          <ul className="space-y-3 text-sm text-text-secondary leading-relaxed">
            {insights.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs leading-relaxed text-text-muted">{utilizationNote}</p>
          </div>
        </TrainerSectionCard>
      </section>

      <TrainerSectionCard
        icon={Activity}
        accent="teal"
        title="Andamento nel tempo"
        subtitle="Incassi e ore registrate, oppure rispetto del calendario. Con periodi lunghi puoi passare alla vista settimanale (blocchi di 7 giorni)."
      >
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {report.daily.length > 7 ? (
            <div
              role="group"
              aria-label="Scala temporale"
              className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1"
            >
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  timeGranularity === 'day' ? 'bg-teal-500/25 text-teal-200' : 'text-text-secondary',
                )}
                onClick={() => setTimeGranularity('day')}
              >
                Giorno per giorno
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  timeGranularity === 'week' ? 'bg-teal-500/25 text-teal-200' : 'text-text-secondary',
                )}
                onClick={() => setTimeGranularity('week')}
              >
                Per settimana
              </button>
            </div>
          ) : (
            <span />
          )}
          <div
            role="group"
            aria-label="Cosa mostrare nel grafico"
            className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1"
          >
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                trendMode === 'revenue_hours' ? 'bg-teal-500/25 text-teal-200' : 'text-text-secondary',
              )}
              onClick={() => setTrendMode('revenue_hours')}
            >
              Incassi e ore
            </button>
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                trendMode === 'adherence' ? 'bg-teal-500/25 text-teal-200' : 'text-text-secondary',
              )}
              onClick={() => setTrendMode('adherence')}
            >
              Rispetto calendario
            </button>
          </div>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sm text-text-muted">Nessun dato nel periodo selezionato.</p>
        ) : trendMode === 'revenue_hours' ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 8, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={ch.grid}
                {...({} as Record<string, unknown>)}
              />
              <XAxis dataKey="day" stroke={ch.axis} fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke={ch.axis} fontSize={11} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke={ch.axis} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={chartTooltipContentStyle()}
                labelStyle={chartTooltipLabelStyle()}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Incassi (€)"
                stroke={se.primary}
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hours"
                name="Ore registrate"
                stroke={se.secondary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={adherenceDaily} margin={{ top: 5, right: 20, left: 8, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={ch.grid}
                {...({} as Record<string, unknown>)}
              />
              <XAxis dataKey="day" stroke={ch.axis} fontSize={11} tickLine={false} />
              <YAxis
                stroke={ch.axis}
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={chartTooltipContentStyle()}
                labelStyle={chartTooltipLabelStyle()}
                formatter={(value: number) => [`${value}%`, 'Rispetto calendario']}
              />
              <Line
                type="monotone"
                dataKey="adherenceDayPct"
                name="Rispetto calendario"
                stroke={se.tertiary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </TrainerSectionCard>

      <TrainerSectionCard
        icon={LayoutGrid}
        accent="violet"
        title="Quando ti prenotano di più"
        subtitle="Ogni riga è un giorno della settimana, ogni colonna un’ora: più il verde è intenso, più appuntamenti di allenamento ci sono stati (per i trainer selezionati)."
      >
        <div className="flex flex-wrap gap-2 items-center justify-end mb-4">
          <div
            role="group"
            aria-label="Fuso orario mappa"
            className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1"
          >
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
                heatmapTz === 'rome' ? 'bg-violet-500/25 text-violet-200' : 'text-text-secondary',
              )}
              onClick={() => setHeatmapTz('rome')}
            >
              Ora Italia
            </button>
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
                heatmapTz === 'utc' ? 'bg-violet-500/25 text-violet-200' : 'text-text-secondary',
              )}
              onClick={() => setHeatmapTz('utc')}
            >
              UTC
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-white/20"
              checked={heatmapWorkdaysOnly}
              onChange={(e) => setHeatmapWorkdaysOnly(e.target.checked)}
            />
            Solo lunedì–venerdì
          </label>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div
              className="grid gap-0.5 text-[10px] sm:text-xs"
              style={{ gridTemplateColumns: '44px repeat(24, minmax(0,1fr))' }}
            >
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="text-center text-text-muted py-1">
                  {h}
                </div>
              ))}
              {weekdayRows.map((weekday) => {
                const wl = WEEK_LABELS[weekday]
                return (
                  <Fragment key={weekday}>
                    <div className="pr-2 text-text-secondary font-medium py-1 text-right">{wl}</div>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const n = heatByWh.get(`${weekday}-${hour}`) ?? 0
                      const op = 0.15 + (n / heatMax) * 0.85
                      return (
                        <div
                          key={`${weekday}-${hour}`}
                          className="aspect-square min-h-[14px] rounded-sm border border-white/5"
                          style={{
                            backgroundColor: `rgba(${chartHeatmapPrimaryRgb}, ${n > 0 ? op : 0.05})`,
                          }}
                          title={`${wl} ${hour}:00 — ${n}`}
                        />
                      )
                    })}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </TrainerSectionCard>

      <div className="space-y-3 sm:space-y-4 border-t border-white/10 pt-4 sm:pt-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-text-primary">
            Dettaglio operativo nel tempo
          </h3>
          <p className="text-sm text-text-muted max-w-3xl leading-relaxed">
            Stessa scala del grafico &quot;Andamento nel tempo&quot; (giorno o settimana): funnel
            appuntamenti, allenamenti vs ore lavorate, no-show ed entrate/uscite dal roster.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <TrainerSectionCard
            icon={CalendarCheck}
            accent="cyan"
            title="Funnel appuntamenti in agenda"
            subtitle="Come si ripartono ogni giorno (o settimana) gli appuntamenti di allenamento: in attesa, svolti, annullati o cancellati."
          >
            {chartData.some(
              (d) => d.prenotati + d.eseguiti + d.annullati + d.cancellati > 0,
            ) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={ch.grid}
                    {...({} as Record<string, unknown>)}
                  />
                  <XAxis dataKey="day" stroke={ch.axis} fontSize={10} tickLine={false} />
                  <YAxis stroke={ch.axis} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={chartTooltipContentStyle()}
                    labelStyle={chartTooltipLabelStyle()}
                  />
                  <Legend />
                  <Bar
                    dataKey="prenotati"
                    stackId="f"
                    name="In attesa / futuri"
                    fill={chartBookingStatus.prenotati}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="eseguiti"
                    stackId="f"
                    name="Svolti"
                    fill={chartBookingStatus.eseguiti}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="annullati"
                    stackId="f"
                    name="Annullati"
                    fill={chartBookingStatus.annullati}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="cancellati"
                    stackId="f"
                    name="Cancellati"
                    fill={chartBookingStatus.cancellati}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">Nessun appuntamento di allenamento nel periodo.</p>
            )}
          </TrainerSectionCard>

          <TrainerSectionCard
            icon={Activity}
            accent="violet"
            title="Allenamenti registrati e ore"
            subtitle="Barre = sessioni nei log; linea = ore totali registrate (stesso giorno o settimana)."
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={ch.grid}
                    {...({} as Record<string, unknown>)}
                  />
                  <XAxis dataKey="day" stroke={ch.axis} fontSize={10} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    stroke={ch.axis}
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={ch.axis}
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipContentStyle()}
                    labelStyle={chartTooltipLabelStyle()}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="allenamenti"
                    name="Allenamenti (log)"
                    fill={se.tertiary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="hours"
                    name="Ore registrate"
                    stroke={se.secondary}
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">Nessun dato.</p>
            )}
          </TrainerSectionCard>

          <TrainerSectionCard
            icon={UserX}
            accent="amber"
            title="No-show nel tempo"
            subtitle="Quanti appuntamenti con assenza segnalata ricadono in ogni giorno (o settimana), in base alla data dell’appuntamento."
          >
            {chartData.some((d) => d.noShow > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={ch.grid}
                    {...({} as Record<string, unknown>)}
                  />
                  <XAxis dataKey="day" stroke={ch.axis} fontSize={10} tickLine={false} />
                  <YAxis stroke={ch.axis} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={chartTooltipContentStyle()}
                    labelStyle={chartTooltipLabelStyle()}
                  />
                  <Line
                    type="monotone"
                    dataKey="noShow"
                    name="No-show"
                    stroke={se.highlight}
                    strokeWidth={2}
                    dot={{ r: 3, fill: se.highlight }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">Nessun no-show nel periodo.</p>
            )}
          </TrainerSectionCard>

          <TrainerSectionCard
            icon={UserMinus}
            accent="rose"
            title="Nuovi clienti e uscite"
            subtitle="In base alle date di attivazione e disattivazione delle assegnazioni (tabella legami trainer–atleta)."
          >
            {chartData.some((d) => d.clientsNew > 0 || d.clientsLost > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={ch.grid}
                    {...({} as Record<string, unknown>)}
                  />
                  <XAxis dataKey="day" stroke={ch.axis} fontSize={10} tickLine={false} />
                  <YAxis stroke={ch.axis} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={chartTooltipContentStyle()}
                    labelStyle={chartTooltipLabelStyle()}
                  />
                  <Legend />
                  <Bar
                    dataKey="clientsNew"
                    name="Nuovi in roster"
                    fill={se.positive}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="clientsLost"
                    name="Usciti"
                    fill={se.negative}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">
                Nessun ingresso o uscita registrato nel periodo (da assegnazioni).
              </p>
            )}
          </TrainerSectionCard>
        </div>
      </div>

      </TrainerDashboardSection>

      <TrainerDashboardSection
        sectionId="trainer-dash-economia"
        title="Economia e incassi"
        subtitle="Ricavi, confronto tra metà periodo, andamento cumulato e come ti pagano i clienti."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <KpiCard
            icon={Banknote}
            accent="teal"
            label="Quanto incassi per ora di lavoro"
            value={kpis.revenuePerHour > 0 ? `€${kpis.revenuePerHour.toFixed(0)}` : '—'}
            caption={`${kpis.revenueTotal.toFixed(0)} € totali · ${kpis.hoursWorked.toFixed(1)} h registrate sui workout`}
            detailHint="Incassi da allenamenti nel periodo, divisi per le ore che risultano dai log (allenamenti completati o in corso) dei tuoi atleti o delle sessioni che segui."
          />
          <KpiCard
            icon={UserMinus}
            accent="rose"
            label="Atleti che smettono di seguirti"
            value={`${kpis.churnRatePct.toFixed(1)}%`}
            caption={
              kpis.activeClientsAtStart > 0
                ? `${kpis.clientsLostInPeriod} usciti nel periodo · ${kpis.activeClientsAtStart} attivi all’inizio`
                : `${kpis.clientsLostInPeriod} usciti nel periodo · nessun dato “a inizio” per il calcolo %`
            }
            detailHint="Percentuale stimata: quanti atleti non risultano più seguiti rispetto a quanti ne avevi all’inizio del periodo, in base alle assegnazioni in anagrafica."
          />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="font-medium text-text-primary">Periodo:</span>{' '}
            {report.startDay} – {report.endDay}.
            {kpis.revenueGrowthHalfPct === 0 ? (
              <> Incassi simili tra prima e seconda metà del periodo.</>
            ) : (
              <>
                {' '}
                Nella seconda metà del periodo gli incassi sono stati{' '}
                {kpis.revenueGrowthHalfPct > 0 ? 'più alti' : 'più bassi'} di circa{' '}
                <span className="tabular-nums font-medium text-text-primary">
                  {Math.abs(kpis.revenueGrowthHalfPct).toFixed(1)}%
                </span>{' '}
                rispetto alla prima metà (solo indicativo).
              </>
            )}
          </p>
        </div>
        <TrainerSectionCard
          icon={Banknote}
          accent="teal"
          title="Incasso cumulativo"
          subtitle="Somma progressiva degli incassi da training: utile per capire dove arrivi a metà periodo."
        >
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartDataWithCumulative} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                <defs>
                    <linearGradient id="trainerRevCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={se.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={se.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={ch.grid}
                  {...({} as Record<string, unknown>)}
                />
                <XAxis dataKey="day" stroke={ch.axis} fontSize={10} tickLine={false} />
                <YAxis stroke={ch.axis} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={chartTooltipContentStyle()}
                  labelStyle={chartTooltipLabelStyle()}
                  formatter={(value: number) => [`€${value.toFixed(0)}`, 'Totale da inizio periodo']}
                />
                <Area
                  type="monotone"
                  dataKey="revenueCumulative"
                  name="Incasso cumulativo"
                  stroke={se.primary}
                  strokeWidth={2}
                  fill="url(#trainerRevCum)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-muted">Nessun dato.</p>
          )}
        </TrainerSectionCard>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TrainerSectionCard
            icon={ChartPie}
            accent="amber"
            title="Riparto incassi per tipo di pagamento"
            subtitle="Quota di ogni modalità sugli incassi training nel periodo."
          >
            {paymentMix.some((m) => m.amount > 0) ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={paymentMix.filter((m) => m.amount > 0)}
                    dataKey="amount"
                    nameKey="key"
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={108}
                    paddingAngle={2}
                    labelLine={false}
                    label={(props: { name?: string; percent?: number }) =>
                      `${props.name ?? ''} (${((props.percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {paymentMix
                      .filter((m) => m.amount > 0)
                      .map((_, i) => (
                        <Cell
                          key={`pie-${i}`}
                          fill={chartCategoricalPalette[i % chartCategoricalPalette.length]}
                        />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipContentStyle()}
                    labelStyle={chartTooltipLabelStyle()}
                    formatter={(value: number) => [`€${value.toFixed(0)}`, 'Importo']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">Nessun pagamento training nel periodo.</p>
            )}
          </TrainerSectionCard>
          <TrainerSectionCard
            icon={ListOrdered}
            accent="amber"
            title="Come ti pagano"
            subtitle="Suddivisione degli incassi da personal training per tipo di pagamento (nel periodo)."
          >
            {paymentMix.length === 0 ? (
              <p className="text-sm leading-relaxed text-text-muted">
                Nessun pagamento training registrato in questo intervallo di date.
              </p>
            ) : (
              <ul className="space-y-2 text-sm max-h-[min(320px,50vh)] overflow-y-auto pr-1">
                {paymentMix
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .map((m) => (
                    <li
                      key={m.key}
                      className="flex justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
                    >
                      <span className="text-text-secondary">{m.key}</span>
                      <span className="tabular-nums">
                        <span className="font-medium text-text-primary">€{m.amount.toFixed(0)}</span>{' '}
                        <span className="text-text-muted">({m.percentage.toFixed(0)}%)</span>
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </TrainerSectionCard>
        </div>
      </TrainerDashboardSection>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  accent,
  label,
  value,
  caption,
  detailHint,
}: {
  icon: LucideIcon
  accent: keyof typeof KPI_ACCENTS
  label: string
  value: string
  caption: string
  detailHint: string
}) {
  const a = KPI_ACCENTS[accent]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.06] to-transparent p-4 sm:p-5 shadow-lg shadow-black/25 transition-colors duration-200',
        a.border,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-90',
          a.bar,
        )}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10',
            a.icon,
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/10 hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80"
          title={detailHint}
          aria-label={`Come si calcola — ${label}: ${detailHint}`}
        >
          <Info className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <p className="mt-3 text-sm font-medium leading-snug text-text-secondary">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-text-primary">
        {value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{caption}</p>
    </div>
  )
}
