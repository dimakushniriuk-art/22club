'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layers, Play } from 'lucide-react'
import { AllenamentiPageHeader } from './AllenamentiPageHeader'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { notifyError } from '@/lib/notifications'
import { isValidUUID } from '@/lib/utils/type-guards'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import {
  workoutsPaneEmbedBodyClass,
  workoutsPaneEmbedRootClass,
} from '@/lib/embed/workouts-pane-body-layout'
import { coalesceWorkoutDayExerciseRest } from '@/lib/workout/scheduled-rest-display'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { useAthleteWorkoutDayPreview } from '@/hooks/use-athlete-workout-day-preview'
import {
  formatGiornoExerciseTargets,
  groupExerciseRows,
} from '@/features/athlete-allenamenti/lib/giorno-preview-helpers'
import { ExerciseExecutionExpand } from '@/features/athlete-allenamenti/ui/exercise-execution-expand'
import { ExercisePreviewMedia } from '@/features/athlete-allenamenti/ui/exercise-preview-media'

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

/** Niente anello al click (mouse); solo con Tab (focus-visible). */
const INTERACTIVE_FOCUS =
  'focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export function GiornoPreviewContent({
  workoutPlanIdOverride,
  dayIdOverride,
  routeParams,
}: {
  workoutPlanIdOverride?: string
  dayIdOverride?: string
  routeParams: Promise<{ id?: string; dayId?: string }>
}) {
  const router = useRouter()
  const resolved = useResolvedParams(routeParams)
  const planId = workoutPlanIdOverride ?? (typeof resolved.id === 'string' ? resolved.id : null)
  const dayId = dayIdOverride ?? (typeof resolved.dayId === 'string' ? resolved.dayId : null)
  const { loading: authLoading } = useAuth()
  const { pathBase } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const workoutsPaneNaturalFlow = Boolean(workoutsPane)
  const { athleteProfileId } = useResolvedAthleteProfileForAllenamenti()

  const giornoScrollBodyClass = workoutsPaneEmbedBodyClass(
    workoutsPaneNaturalFlow,
    undefined,
    'px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 md:px-6 md:pb-28 md:pt-6',
  )

  const invalidParams = !planId || !isValidUUID(planId) || !dayId || !isValidUUID(dayId)
  const {
    data: dayPreview,
    isLoading: previewLoading,
    isError: previewIsError,
    error: previewError,
  } = useAthleteWorkoutDayPreview(
    invalidParams ? null : athleteProfileId,
    invalidParams ? null : planId,
    invalidParams ? null : dayId,
    !authLoading && !invalidParams && Boolean(athleteProfileId),
  )

  const loading = authLoading || previewLoading
  const error = invalidParams
    ? 'Parametri non validi'
    : !athleteProfileId && !authLoading
      ? 'Accedi per continuare'
      : previewIsError
        ? previewError instanceof Error
          ? previewError.message
          : 'Errore'
        : null
  const planName = dayPreview?.planName ?? ''
  const dayLabel = dayPreview?.dayLabel ?? ''
  const rows = dayPreview?.rows ?? []
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(() => new Set())

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }

  useEffect(() => {
    if (!previewIsError) return
    notifyError('Errore', 'Impossibile caricare il contenuto del giorno.')
  }, [previewIsError])

  const startHref = useMemo(() => {
    if (workoutsPane && planId && dayId)
      return workoutsPane.hrefFor({ kind: 'oggi', workoutPlanId: planId, dayId })
    return `${pathBase}/oggi?workout_plan_id=${encodeURIComponent(planId ?? '')}&workout_day_id=${encodeURIComponent(dayId ?? '')}`
  }, [planId, dayId, pathBase, workoutsPane])

  const blocks = useMemo(() => groupExerciseRows(rows), [rows])

  const backToScheda = () => {
    if (workoutsPane && planId) {
      workoutsPane.navigateTo({ kind: 'scheda', workoutPlanId: planId })
      return
    }
    router.push(`${pathBase}/${planId}`)
  }

  if (authLoading || loading) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <AllenamentiPageHeader onBack={backToScheda} />
        <div className={giornoScrollBodyClass}>
          <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-5 lg:max-w-3xl">
            <div className={`${CARD_DS} animate-pulse`}>
              <div className="space-y-3 p-4 sm:p-5">
                <div className="h-4 w-2/3 rounded-md bg-white/10" />
                <div className="h-3 w-1/2 rounded-md bg-white/5" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${CARD_DS} animate-pulse`}>
                <div className="flex gap-3 p-4 sm:p-5">
                  <div className="h-16 w-[5.25rem] shrink-0 rounded-xl bg-white/10 sm:h-[4.5rem] sm:w-24" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-md bg-white/10" />
                    <div className="h-3 w-1/3 rounded-md bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !planId || !dayId) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <AllenamentiPageHeader onBack={() => router.push(pathBase)} />
        <div className={giornoScrollBodyClass}>
          <p className="pt-2 text-sm text-text-secondary">{error ?? 'Contenuto non disponibile'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
      <AllenamentiPageHeader
        title={dayLabel}
        subtitle={planName}
        onBack={backToScheda}
        withBottomMargin
      />
      <div className={giornoScrollBodyClass}>
        <div className="mx-auto w-full max-w-lg space-y-5 sm:space-y-6 lg:max-w-3xl">
          <p className="text-xs leading-relaxed text-text-secondary sm:mb-0.5 sm:text-sm">
            Controlla esercizi e serie; quando sei pronto avvia l&apos;allenamento.
          </p>

          {rows.length === 0 ? (
            <Card className={`${CARD_DS} border-dashed`}>
              <CardContent className="p-4 sm:p-5">
                <p className="text-sm text-text-secondary">Nessun esercizio in questo giorno.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {blocks.map((block, bi) => {
                if (block.kind === 'circuit') {
                  return (
                    <Card key={`c-${bi}`} className={`relative overflow-hidden ${CARD_DS}`}>
                      <CardContent className="relative z-10 space-y-2 p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-400">
                          <Layers className="h-3.5 w-3.5" />
                          Circuito
                        </div>
                        <ul className="space-y-2.5">
                          {block.rows.map((r) => {
                            const name = r.exercises?.name?.trim() || 'Esercizio'
                            const mg = r.exercises?.muscle_group?.trim()
                            const desc = r.exercises?.description?.trim() ?? ''
                            const detailHref = r.exercises?.id
                              ? workoutsPane
                                ? workoutsPane.hrefFor({
                                    kind: 'esercizio',
                                    exerciseId: r.exercises.id,
                                  })
                                : `${pathBase}/esercizio/${r.exercises.id}?planId=${encodeURIComponent(planId)}`
                              : null
                            const isOpen = expandedRowIds.has(r.id)
                            const canAct = Boolean(desc) || Boolean(detailHref)
                            return (
                              <li
                                key={r.id}
                                className={`flex flex-col border-b border-white/5 pb-3 last:border-0 last:pb-0 ${canAct ? `cursor-pointer touch-manipulation active:opacity-90 ${INTERACTIVE_FOCUS}` : ''}`}
                                onClick={() => {
                                  if (desc) toggleRowExpanded(r.id)
                                  else if (detailHref) void router.push(detailHref)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== 'Enter' && e.key !== ' ') return
                                  e.preventDefault()
                                  if (desc) toggleRowExpanded(r.id)
                                  else if (detailHref) void router.push(detailHref)
                                }}
                                tabIndex={canAct ? 0 : undefined}
                                role={canAct ? 'button' : undefined}
                                aria-expanded={desc ? isOpen : undefined}
                              >
                                <div className="flex gap-2.5 sm:gap-3">
                                  <ExercisePreviewMedia
                                    exercise={r.exercises}
                                    name={name}
                                    href={null}
                                    compact
                                  />
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex min-w-0 items-start justify-between gap-2">
                                      <span className="min-w-0 text-sm font-medium text-cyan-400">
                                        {name}
                                      </span>
                                      <span className="shrink-0 tabular-nums text-xs text-text-secondary">
                                        {formatGiornoExerciseTargets(r)}
                                      </span>
                                    </div>
                                    {mg ? (
                                      <span className="text-[11px] text-text-tertiary">{mg}</span>
                                    ) : null}
                                    {r.note?.trim() ? (
                                      <p className="text-[11px] text-text-tertiary">
                                        {r.note.trim()}
                                      </p>
                                    ) : null}
                                    {(() => {
                                      const rest = coalesceWorkoutDayExerciseRest(
                                        r.rest_timer_sec,
                                        r.rest_seconds,
                                      )
                                      return rest !== null ? (
                                        <p className="text-[11px] text-text-tertiary">
                                          Recupero indicativo: {rest}s
                                        </p>
                                      ) : null
                                    })()}
                                  </div>
                                </div>
                                {isOpen && desc ? (
                                  <ExerciseExecutionExpand
                                    description={desc}
                                    detailHref={detailHref}
                                  />
                                ) : null}
                              </li>
                            )
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  )
                }

                const r = block.rows[0]
                const name = r.exercises?.name?.trim() || 'Esercizio'
                const mg = r.exercises?.muscle_group?.trim()
                const desc = r.exercises?.description?.trim() ?? ''
                const detailHref = r.exercises?.id
                  ? workoutsPane
                    ? workoutsPane.hrefFor({ kind: 'esercizio', exerciseId: r.exercises.id })
                    : `${pathBase}/esercizio/${r.exercises.id}?planId=${encodeURIComponent(planId)}`
                  : null
                const isOpen = expandedRowIds.has(r.id)
                const canAct = Boolean(desc) || Boolean(detailHref)

                return (
                  <Card
                    key={r.id}
                    className={`relative overflow-hidden ${CARD_DS} ${canAct ? `cursor-pointer touch-manipulation active:opacity-90 ${INTERACTIVE_FOCUS}` : ''}`}
                    onClick={() => {
                      if (desc) toggleRowExpanded(r.id)
                      else if (detailHref) void router.push(detailHref)
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      e.preventDefault()
                      if (desc) toggleRowExpanded(r.id)
                      else if (detailHref) void router.push(detailHref)
                    }}
                    tabIndex={canAct ? 0 : undefined}
                    role={canAct ? 'button' : undefined}
                    aria-expanded={desc ? isOpen : undefined}
                  >
                    <CardContent className="relative z-10 p-4 sm:p-5">
                      <div className="flex gap-3 sm:gap-4">
                        <ExercisePreviewMedia exercise={r.exercises} name={name} href={null} />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <span className="min-w-0 text-sm font-semibold text-cyan-400 sm:text-base">
                              {name}
                            </span>
                            <span className="shrink-0 tabular-nums text-xs text-text-secondary sm:text-sm">
                              {formatGiornoExerciseTargets(r)}
                            </span>
                          </div>
                          {mg ? <p className="text-xs text-text-tertiary">{mg}</p> : null}
                          {r.note?.trim() ? (
                            <p className="text-xs text-text-tertiary">{r.note.trim()}</p>
                          ) : null}
                          {(() => {
                            const rest = coalesceWorkoutDayExerciseRest(
                              r.rest_timer_sec,
                              r.rest_seconds,
                            )
                            return rest !== null ? (
                              <p className="text-[11px] text-text-tertiary">
                                Recupero indicativo: {rest}s
                              </p>
                            ) : null
                          })()}
                        </div>
                      </div>
                      {isOpen && desc ? (
                        <ExerciseExecutionExpand description={desc} detailHref={detailHref} />
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="pt-4 pb-2 sm:pt-5 sm:pb-3">
            <Button
              asChild
              className="h-12 min-h-[48px] w-full gap-2 touch-manipulation rounded-xl bg-cyan-500 text-sm font-semibold text-white hover:bg-cyan-400"
            >
              <Link
                href={startHref}
                prefetch={true}
                onClick={(e) => {
                  if (!workoutsPane || !planId || !dayId) return
                  e.preventDefault()
                  workoutsPane.navigateTo({ kind: 'oggi', workoutPlanId: planId, dayId })
                }}
              >
                <Play className="h-4 w-4" />
                Inizia allenamento
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
