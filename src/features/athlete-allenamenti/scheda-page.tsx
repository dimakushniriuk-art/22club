'use client'

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight } from 'lucide-react'
import { AllenamentiPageHeader } from './AllenamentiPageHeader'
import { Card, CardContent } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { notifyError } from '@/lib/notifications'
import { isValidUUID } from '@/lib/utils/type-guards'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { useAthleteWorkoutPlanDetail } from '@/hooks/use-athlete-workout-plan-detail'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import {
  workoutsPaneEmbedBodyClass,
  workoutsPaneEmbedRootClass,
} from '@/lib/embed/workouts-pane-body-layout'
import { useResolvedParams } from '@/lib/next/use-resolved-params'

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

export function SchedaAllenamentoContent({
  workoutPlanIdOverride,
  routeParams,
}: {
  workoutPlanIdOverride?: string
  routeParams: Promise<{ id?: string; athleteProfileId?: string }>
}) {
  const router = useRouter()
  const resolved = useResolvedParams(routeParams)
  const rawPlanId = workoutPlanIdOverride ?? (typeof resolved.id === 'string' ? resolved.id : null)
  const planId = rawPlanId && isValidUUID(rawPlanId) ? rawPlanId : null
  const { loading: authLoading } = useAuth()
  const { pathBase, isPreview } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const workoutsPaneNaturalFlow = Boolean(workoutsPane)
  const { athleteProfileId } = useResolvedAthleteProfileForAllenamenti()
  const {
    data: planDetail,
    isLoading: planDetailLoading,
    isError: planDetailIsError,
    error: planDetailError,
  } = useAthleteWorkoutPlanDetail(athleteProfileId, planId, {
    athleteSubjectProfileId: isPreview ? athleteProfileId : null,
    enabled: !authLoading && Boolean(athleteProfileId && planId),
  })

  const lastNotifiedPlanDetailRef = useRef<string | null>(null)
  useEffect(() => {
    if (!planDetailIsError) {
      lastNotifiedPlanDetailRef.current = null
      return
    }
    const errorMessage =
      planDetailError instanceof Error ? planDetailError.message : 'Impossibile caricare la scheda'
    if (lastNotifiedPlanDetailRef.current === errorMessage) return
    lastNotifiedPlanDetailRef.current = errorMessage
    notifyError('Errore', 'Impossibile caricare la scheda di allenamento.')
  }, [planDetailIsError, planDetailError])

  const validationError = useMemo(() => {
    if (!rawPlanId || !planId) return 'Scheda non valida'
    if (!authLoading && !athleteProfileId) return 'Accedi per vedere la scheda'
    return null
  }, [athleteProfileId, authLoading, planId, rawPlanId])

  const queryError = planDetailIsError
    ? planDetailError instanceof Error
      ? planDetailError.message
      : 'Errore sconosciuto'
    : null
  const error = validationError ?? queryError

  const startHref = useMemo(() => {
    if (workoutsPane && planId) return workoutsPane.hrefFor({ kind: 'oggi', workoutPlanId: planId })
    return `${pathBase}/oggi?workout_plan_id=${encodeURIComponent(planId ?? '')}`
  }, [planId, pathBase, workoutsPane])

  const scrollAreaClass = workoutsPaneEmbedBodyClass(
    workoutsPaneNaturalFlow,
    undefined,
    'px-3 safe-area-inset-bottom sm:px-4 md:px-6',
    isPreview
      ? 'pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-5 md:pt-6'
      : 'pt-2 pb-28 md:pb-24 sm:pt-3',
  )

  if (authLoading || planDetailLoading) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <AllenamentiPageHeader onBack={() => router.push(pathBase)} />
        <div className={scrollAreaClass} />
      </div>
    )
  }

  if (error || !planId || !planDetail) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <AllenamentiPageHeader onBack={() => router.push(pathBase)} />
        <div className={scrollAreaClass}>
          <p className="pt-2 text-sm text-text-secondary">{error ?? 'Scheda non disponibile'}</p>
        </div>
      </div>
    )
  }

  const { planName, planDescription, staffName, days, dayCompletedById } = planDetail

  return (
    <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
      <AllenamentiPageHeader
        title={planName}
        subtitle={planDescription ?? 'Giorni della scheda'}
        onBack={() => router.push(pathBase)}
        withBottomMargin={!isPreview}
      />
      <div className={scrollAreaClass}>
        <div
          className={
            isPreview
              ? 'mx-auto w-full max-w-none space-y-4 sm:space-y-5'
              : 'mx-auto w-full max-w-lg space-y-4 sm:space-y-6 lg:max-w-3xl'
          }
        >
          {staffName ? (
            <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
              PT: <span className="text-text-primary">{staffName}</span>
            </p>
          ) : null}

          {days.length === 0 ? (
            <Card className={`${CARD_DS} border-dashed`}>
              <CardContent className="p-4 sm:p-5">
                <p className="text-sm text-text-secondary">
                  Nessun giorno configurato su questa scheda.
                </p>
                <Link
                  href={startHref}
                  className="mt-3 inline-flex min-h-[44px] touch-manipulation items-center text-sm font-medium text-cyan-400 hover:text-cyan-300"
                  onClick={(e) => {
                    if (!workoutsPane) return
                    e.preventDefault()
                    workoutsPane.navigateTo({ kind: 'oggi', workoutPlanId: planId })
                  }}
                >
                  Apri allenamento
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {days.map((day) => {
                const label =
                  (day.title?.trim() ||
                    day.day_name?.trim() ||
                    (day.day_number != null ? `Giorno ${day.day_number}` : 'Giorno')) ??
                  'Giorno'
                const dayDone = dayCompletedById[day.id]
                const href = workoutsPane
                  ? workoutsPane.hrefFor({ kind: 'giorno', workoutPlanId: planId, dayId: day.id })
                  : `${pathBase}/${encodeURIComponent(planId)}/giorno/${encodeURIComponent(day.id)}`
                return (
                  <Link
                    key={day.id}
                    href={href}
                    prefetch={true}
                    className="block touch-manipulation active:opacity-90"
                    onClick={(e) => {
                      if (!workoutsPane) return
                      e.preventDefault()
                      workoutsPane.navigateTo({
                        kind: 'giorno',
                        workoutPlanId: planId,
                        dayId: day.id,
                      })
                    }}
                  >
                    <Card className={`relative overflow-hidden ${CARD_DS} cursor-pointer`}>
                      <CardContent className="relative z-10 flex items-center gap-3 p-4 sm:p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <Calendar className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3 className="truncate text-sm font-semibold text-text-primary sm:text-base">
                            {label}
                          </h3>
                          {day.day_number != null ? (
                            <p className="text-[11px] text-text-tertiary sm:text-xs">
                              Giorno {day.day_number}
                            </p>
                          ) : null}
                          {typeof dayDone === 'number' ? (
                            <p className="text-[11px] text-text-tertiary sm:text-xs">
                              {dayDone === 0 ? (
                                'Nessun completamento registrato'
                              ) : dayDone === 1 ? (
                                <>
                                  Completata{' '}
                                  <span className="tabular-nums text-text-secondary">1</span> volta
                                </>
                              ) : (
                                <>
                                  Completata{' '}
                                  <span className="tabular-nums text-text-secondary">
                                    {dayDone}
                                  </span>{' '}
                                  volte
                                </>
                              )}
                            </p>
                          ) : null}
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" aria-hidden />
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}