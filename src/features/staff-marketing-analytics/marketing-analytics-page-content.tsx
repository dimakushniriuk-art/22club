'use client'

import { BarChart2, UserPlus, Percent, Megaphone, Euro, Activity, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  StaffMarketingDataBlockSkeleton,
  StaffMarketingSegmentSkeleton,
} from '@/components/layout/route-loading-skeletons'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import { useMarketingAnalytics } from '@/hooks/use-marketing-analytics'
import { useMarketingDeferSecondary } from '@/hooks/use-marketing-defer-secondary'
import { MARKETING_FUNNEL_LABELS } from '@/lib/marketing/labels'
import { formatMarketingDate } from '@/lib/marketing/format'

export function MarketingAnalyticsPageContent() {
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data, loading, error } = useMarketingAnalytics(canAccess)
  const deferSecondary = useMarketingDeferSecondary()

  if (showLoader) {
    return <StaffMarketingSegmentSkeleton />
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
          <BarChart2 className="h-6 w-6 text-cyan-400" />
          Analytics
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          KPI lead, conversioni, campagne e attività atleti (ultimi 7 / 30 giorni).
        </p>
      </header>

      {loading ? (
        <StaffMarketingDataBlockSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : !data ? (
        <div className="text-sm text-text-muted">Nessun dato</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <UserPlus className="h-4 w-4" />
                  Leads totali
                </div>
                <p className="text-2xl font-bold text-cyan-400">{data.kpi.leadsTotal}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Target className="h-4 w-4" />
                  Nuovi (7d)
                </div>
                <p className="text-2xl font-bold text-emerald-400">{data.kpi.leadsNew7d}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Percent className="h-4 w-4" />
                  Conversion (30d)
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {data.kpi.conversionRate30d != null ? `${data.kpi.conversionRate30d}%` : '–'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Megaphone className="h-4 w-4" />
                  Campagne attive
                </div>
                <p className="text-2xl font-bold text-amber-400">{data.kpi.campaignsActive}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Euro className="h-4 w-4" />
                  Budget attive
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  € {data.kpi.budgetActive.toLocaleString('it-IT')}
                </p>
              </CardContent>
            </Card>
          </div>

          {deferSecondary ? (
            <>
          <Card className="border-border bg-background-secondary/80">
            <CardHeader>
              <CardTitle className="text-base text-text-primary">Leads funnel (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(data.leadsFunnel30d).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-2"
                  >
                    <span className="text-sm text-text-secondary">
                      {MARKETING_FUNNEL_LABELS[status] ?? status}
                    </span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border bg-background-secondary/80">
              <CardHeader>
                <CardTitle className="text-base text-text-primary">
                  Trend leads (7d, per giorno)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.trendLeads7d.length === 0 ? (
                  <p className="text-sm text-text-muted">Nessun lead negli ultimi 7 giorni</p>
                ) : (
                  <div className="space-y-2">
                    {data.trendLeads7d.map(({ date, count }) => (
                      <div
                        key={date}
                        className="flex items-center justify-between rounded border border-border/50 px-3 py-2 text-sm"
                      >
                        <span className="text-text-secondary">{formatMarketingDate(date)}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardHeader>
                <CardTitle className="text-base text-text-primary">
                  Trend leads (30d, per settimana)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.trendLeads30d.length === 0 ? (
                  <p className="text-sm text-text-muted">Nessun lead negli ultimi 30 giorni</p>
                ) : (
                  <div className="space-y-2">
                    {data.trendLeads30d.map(({ week, count }) => (
                      <div
                        key={week}
                        className="flex items-center justify-between rounded border border-border/50 px-3 py-2 text-sm"
                      >
                        <span className="text-text-secondary">Sett. {formatMarketingDate(week)}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-background-secondary/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-text-primary">
                <Activity className="h-4 w-4" />
                Atleti activity (KPI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <div className="text-xs text-text-muted">Coached 7d</div>
                  <div className="text-lg font-semibold tabular-nums">
                    {data.atletiKpi.workoutsCoached7d}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <div className="text-xs text-text-muted">Solo 7d</div>
                  <div className="text-lg font-semibold tabular-nums">
                    {data.atletiKpi.workoutsSolo7d}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <div className="text-xs text-text-muted">Coached 30d</div>
                  <div className="text-lg font-semibold tabular-nums">
                    {data.atletiKpi.workoutsCoached30d}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <div className="text-xs text-text-muted">Solo 30d</div>
                  <div className="text-lg font-semibold tabular-nums">
                    {data.atletiKpi.workoutsSolo30d}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <div className="text-xs text-text-muted">Inattivi (&gt;30d)</div>
                  <div className="text-lg font-semibold tabular-nums text-amber-400">
                    {data.atletiKpi.atletiInattivi}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-background-secondary/80">
            <CardHeader>
              <CardTitle className="text-base text-text-primary">Campagne attive</CardTitle>
              <p className="text-sm text-text-secondary">
                Eventi ultimi 7 giorni (totali: {data.eventsTotal7d}). Con campaign_id nel payload:
                conteggio per campagna.
              </p>
            </CardHeader>
            <CardContent>
              {data.campaigns.length === 0 ? (
                <p className="text-sm text-text-muted">Nessuna campagna attiva</p>
              ) : (
                <div className="space-y-3">
                  {data.campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-text-muted">
                          {c.budget != null ? `€ ${Number(c.budget).toLocaleString('it-IT')}` : '–'}{' '}
                          · {c.start_at ? formatMarketingDate(c.start_at) : '–'} →{' '}
                          {c.end_at ? formatMarketingDate(c.end_at) : '–'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-text-secondary">Eventi 7d:</span>{' '}
                        <span className="font-semibold tabular-nums">{c.eventsCount7d ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
            </>
          ) : (
            <StaffMarketingDataBlockSkeleton />
          )}
        </>
      )}
    </div>
  )
}
