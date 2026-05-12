'use client'

import { BarChart3, Dumbbell, UserCheck, User, Calendar } from 'lucide-react'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import { useMarketingKpi } from '@/hooks/use-marketing-kpi'
import { useMarketingDeferSecondary } from '@/hooks/use-marketing-defer-secondary'
import {
  StaffMarketingDataBlockSkeleton,
  StaffMarketingSegmentSkeleton,
} from '@/components/layout/route-loading-skeletons'

export function MarketingKpiPageContent() {
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data, loading, error } = useMarketingKpi(canAccess)
  const deferSecondary = useMarketingDeferSecondary()

  if (showLoader) {
    return <StaffMarketingSegmentSkeleton />
  }

  const totalWorkouts = data.reduce((s, r) => s + Number(r.workouts_total_count ?? 0), 0)
  const totalSolo = data.reduce((s, r) => s + Number(r.workouts_solo_count ?? 0), 0)
  const totalCoached = data.reduce((s, r) => s + Number(r.workouts_coached_count ?? 0), 0)
  const pctCoached = totalWorkouts > 0 ? Math.round((totalCoached / totalWorkouts) * 100) : 0
  const lastDates = data.map((r) => r.last_workout_at).filter(Boolean) as string[]
  const lastWorkoutAt =
    lastDates.length > 0
      ? new Date(lastDates.reduce((a, b) => (a > b ? a : b))).toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : null

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background text-text-primary">
      <header>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          KPI Marketing
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Metriche aggregate allenamenti (solo/coached). Dati dalla vista KPI, nessun accesso a
          dettagli workout.
        </p>
      </header>

      {loading ? (
        <StaffMarketingDataBlockSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-background-secondary/80 p-4 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
                <Dumbbell className="w-4 h-4" />
                Totale allenamenti
              </div>
              <p className="text-2xl font-bold text-cyan-400">{totalWorkouts}</p>
            </div>
            <div className="rounded-xl border border-border bg-background-secondary/80 p-4 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
                <User className="w-4 h-4" />
                Eseguiti da solo
              </div>
              <p className="text-2xl font-bold text-text-primary">{totalSolo}</p>
            </div>
            <div className="rounded-xl border border-border bg-background-secondary/80 p-4 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
                <UserCheck className="w-4 h-4" />
                Con trainer
              </div>
              <p className="text-2xl font-bold text-teal-400">{totalCoached}</p>
            </div>
            <div className="rounded-xl border border-border bg-background-secondary/80 p-4 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
                <BarChart3 className="w-4 h-4" />% con trainer
              </div>
              <p className="text-2xl font-bold text-primary">{pctCoached}%</p>
            </div>
          </div>

          {lastWorkoutAt && (
            <div className="rounded-xl border border-border bg-background-secondary/80 p-4 ring-1 ring-white/5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-text-muted" />
              <span className="text-text-secondary text-sm">Ultimo allenamento registrato:</span>
              <span className="font-medium">{lastWorkoutAt}</span>
            </div>
          )}

          {data.length > 0 ? (
            deferSecondary ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-background-tertiary/50 border-b border-border text-sm font-medium text-text-secondary">
                Riepilogo per atleta ({data.length}) — ordinato per ultimo allenamento
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background-secondary border-b border-border">
                    <tr className="text-left text-text-secondary">
                      <th className="p-3 font-medium">Atleta</th>
                      <th className="p-3 font-medium">Email</th>
                      <th className="p-3 font-medium">Totale</th>
                      <th className="p-3 font-medium">Solo</th>
                      <th className="p-3 font-medium">Con trainer</th>
                      <th className="p-3 font-medium">Ultimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => (
                      <tr
                        key={row.athlete_id}
                        className="border-b border-border/50 hover:bg-background-tertiary/30"
                      >
                        <td className="p-3">
                          {[row.nome, row.cognome].filter(Boolean).join(' ') || (
                            <span
                              className="font-mono text-xs text-text-muted"
                              title={row.athlete_id}
                            >
                              {row.athlete_id.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                        <td
                          className="p-3 text-text-muted truncate max-w-[180px]"
                          title={row.email ?? undefined}
                        >
                          {row.email ?? '-'}
                        </td>
                        <td className="p-3">{Number(row.workouts_total_count ?? 0)}</td>
                        <td className="p-3">{Number(row.workouts_solo_count ?? 0)}</td>
                        <td className="p-3">{Number(row.workouts_coached_count ?? 0)}</td>
                        <td className="p-3 text-text-muted">
                          {row.last_workout_at
                            ? new Date(row.last_workout_at).toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: 'short',
                              })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            ) : (
              <StaffMarketingDataBlockSkeleton />
            )
          ) : (
            <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-6 text-center text-text-secondary text-sm">
              Nessun atleta con dati di allenamento registrati.
            </div>
          )}
        </>
      )}
    </div>
  )
}
