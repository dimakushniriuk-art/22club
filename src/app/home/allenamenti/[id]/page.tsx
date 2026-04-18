'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, ChevronRight } from 'lucide-react'
import { AllenamentiPageHeader } from '../AllenamentiPageHeader'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { createLogger } from '@/lib/logger'
import { isValidUUID } from '@/lib/utils/type-guards'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'

const logger = createLogger('app:home:allenamenti:scheda:page')

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

type WorkoutDayRow = {
  id: string
  day_number: number | null
  day_name: string | null
  title: string | null
}

export function SchedaAllenamentoContent({
  workoutPlanIdOverride,
}: { workoutPlanIdOverride?: string } = {}) {
  const router = useRouter()
  const params = useParams()
  const planId = workoutPlanIdOverride ?? (typeof params?.id === 'string' ? params.id : null)
  const { loading: authLoading } = useAuth()
  const supabase = useSupabaseClient()
  const { pathBase, isPreview } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const { athleteProfileId } = useResolvedAthleteProfileForAllenamenti()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planName, setPlanName] = useState<string>('')
  const [planDescription, setPlanDescription] = useState<string | null>(null)
  const [staffName, setStaffName] = useState<string | null>(null)
  const [days, setDays] = useState<WorkoutDayRow[]>([])
  /** Completamenti registrati per ogni `workout_day_id` (stato completato). */
  const [dayCompletedById, setDayCompletedById] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (authLoading) return
      if (!planId || !isValidUUID(planId)) {
        setError('Scheda non valida')
        setLoading(false)
        return
      }
      if (!athleteProfileId) {
        setError('Accedi per vedere la scheda')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setDayCompletedById({})

        const { data: plan, error: planErr } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('id', planId)
          .eq('athlete_id', athleteProfileId)
          .maybeSingle()

        if (cancelled) return
        if (planErr) {
          logger.error('Errore caricamento workout_plans', planErr, { planId })
          throw planErr
        }
        if (!plan || (plan as { is_draft?: boolean | null }).is_draft) {
          setError('Scheda non trovata')
          setLoading(false)
          return
        }

        const row = plan as {
          name?: string | null
          description?: string | null
          created_by_profile_id?: string | null
        }
        setPlanName((row.name ?? 'Scheda').trim() || 'Scheda')
        setPlanDescription(row.description?.trim() ? row.description : null)

        const creatorId = row.created_by_profile_id
        if (creatorId) {
          const { data: creator } = await supabase
            .from('profiles')
            .select('nome, cognome')
            .eq('id', creatorId)
            .maybeSingle()
          if (!cancelled && creator) {
            const c = creator as { nome?: string | null; cognome?: string | null }
            const n = `${c.nome ?? ''} ${c.cognome ?? ''}`.trim()
            setStaffName(n || null)
          }
        } else {
          setStaffName(null)
        }

        const { data: daysData, error: daysErr } = await supabase
          .from('workout_days')
          .select('id, day_number, day_name, title')
          .eq('workout_plan_id', planId)
          .order('day_number', { ascending: true })

        if (cancelled) return
        if (daysErr) {
          logger.error('Errore caricamento workout_days', daysErr, { planId })
          throw daysErr
        }

        const dayRows = (daysData ?? []) as WorkoutDayRow[]
        const nextDayCounts: Record<string, number> = {}
        if (dayRows.length > 0) {
          const perDayResults = await Promise.all(
            dayRows.map((day) =>
              supabase
                .from('workout_logs')
                .select('*', { count: 'exact', head: true })
                .eq('atleta_id', athleteProfileId)
                .eq('scheda_id', planId)
                .eq('workout_day_id', day.id)
                .in('stato', ['completato', 'completed']),
            ),
          )
          if (!cancelled) {
            for (let i = 0; i < dayRows.length; i++) {
              const r = perDayResults[i]
              const id = dayRows[i].id
              if (r.error) {
                logger.warn('Errore conteggio workout_logs per giorno', r.error, { dayId: id })
                nextDayCounts[id] = 0
              } else {
                nextDayCounts[id] = r.count ?? 0
              }
            }
          }
        }
        if (!cancelled) {
          setDayCompletedById(nextDayCounts)
          setDays(dayRows)
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Errore sconosciuto'
          setError(msg)
          notifyError('Errore', 'Impossibile caricare la scheda di allenamento.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [authLoading, athleteProfileId, planId, supabase])

  const startHref = useMemo(() => {
    if (workoutsPane && planId) return workoutsPane.hrefFor({ kind: 'oggi', workoutPlanId: planId })
    return `${pathBase}/oggi?workout_plan_id=${encodeURIComponent(planId ?? '')}`
  }, [planId, pathBase, workoutsPane])

  const scrollAreaClass = cn(
    'min-h-0 flex-1 overflow-auto px-3 safe-area-inset-bottom sm:px-4 min-[834px]:px-6',
    isPreview
      ? 'pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-5 min-[834px]:pt-6'
      : 'pt-2 pb-28 min-[834px]:pb-24 sm:pt-3',
  )

  if (authLoading || loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <AllenamentiPageHeader onBack={() => router.push(pathBase)} />
        <div className={scrollAreaClass} />
      </div>
    )
  }

  if (error || !planId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <AllenamentiPageHeader onBack={() => router.push(pathBase)} />
        <div className={scrollAreaClass}>
          <p className="pt-2 text-sm text-text-secondary">{error ?? 'Scheda non disponibile'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
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
              : 'mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl'
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

export default function SchedaAllenamentoPage() {
  return (
    <Suspense fallback={null}>
      <SchedaAllenamentoContent />
    </Suspense>
  )
}
