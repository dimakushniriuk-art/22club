'use client'

import { useState, useEffect, createElement, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import {
  workoutsPaneEmbedBodyClass,
  workoutsPaneEmbedRootClass,
} from '@/lib/embed/workouts-pane-body-layout'
import { cn } from '@/lib/utils'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { PageHeaderFixed } from '@/components/layout'
import { Card, CardContent, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Instagram,
  ListOrdered,
  Lock,
  PartyPopper,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Weight,
  X,
} from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { invalidateAfterWorkoutSessionWrite } from '@/lib/react-query/post-mutation-cache'
import { requestCoachedSessionDebitClient } from '@/lib/credits/request-coached-session-debit-client'
import { useToast } from '@/components/ui/toast'
import { formatWorkoutRepsLabel } from '@/lib/constants/workout-reps-select'
import { useAthleteWorkoutSummary } from '@/hooks/use-athlete-workout-summary'
import { useWorkoutInstagramShareLines } from '@/hooks/use-workout-instagram-share-lines'
import {
  difficultyLabelIt,
  formatVolumeIt,
  muscleLabelIt,
  pickExerciseSharePreviewUrl,
  pickExerciseShareVideoUrl,
  repsForVolumeKgRep,
} from '@/features/athlete-allenamenti/lib/riepilogo-helpers'
import type { WorkoutShareCardProps } from '@/lib/workouts/workout-share-types'
import { buildWorkoutShareHighlights } from '@/lib/workouts/build-workout-share-highlights'

const logger = createLogger('app:home:allenamenti:riepilogo:page')

const WorkoutInstagramSharePreviewDialog = dynamic(
  () =>
    import('./workout-instagram-share-preview-dialog').then((m) => ({
      default: m.WorkoutInstagramSharePreviewDialog,
    })),
  { ssr: false },
)

const CARD_DS =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

export function RiepilogoPageContent({
  workoutLogIdOverride,
}: {
  workoutLogIdOverride?: string
} = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user, loading: authLoading, authRecovery, retryAuthSession } = useAuth()
  const supabase = useSupabaseClient()
  const { addToast } = useToast()
  const { pathBase, isPreview } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const workoutsPaneNaturalFlow = Boolean(workoutsPane)
  const riepilogoScrollBodyClass = workoutsPaneEmbedBodyClass(
    workoutsPaneNaturalFlow,
    undefined,
    'px-3 pt-4 pb-36 safe-area-inset-bottom sm:px-4 sm:pt-5 md:px-6 md:pb-32 md:pt-6',
  )

  const handleRiepilogoHeaderBack = useCallback(() => {
    if (workoutsPane) {
      workoutsPane.navigateTo({ kind: 'home' })
      return
    }
    router.back()
  }, [workoutsPane, router])

  /** In Workouts (dashboard) `isPreview` Ã¨ true ma non si deve usare `router.push('/home/allenamenti')`: si resta nello slot. */
  const goToAllenamentiHome = useCallback(() => {
    if (workoutsPane) {
      workoutsPane.setDirty?.(false)
      workoutsPane.navigateTo({ kind: 'home' })
      return
    }
    router.push(isPreview ? pathBase : '/home')
  }, [workoutsPane, router, isPreview, pathBase])

  // Type guard per user
  const isValidUser = user && isValidProfile(user)
  const hasRetriedSessionRef = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (user) {
      hasRetriedSessionRef.current = false
      return
    }
    if (!hasRetriedSessionRef.current) {
      hasRetriedSessionRef.current = true
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[auth-recovery] riepilogo: user assente, retry sessione')
      }
      void retryAuthSession()
    }
  }, [authLoading, user, retryAuthSession])

  const { athleteProfileId } = useResolvedAthleteProfileForAllenamenti()
  const workoutIdFromParams = workoutLogIdOverride ?? searchParams.get('workout_id')

  const onCoachedDebitWarning = useCallback(() => {
    addToast({
      title: 'Attenzione',
      message:
        'Se le lezioni non risultano aggiornate dopo questa sessione con trainer, contatta la reception.',
      variant: 'warning',
    })
  }, [addToast])

  const {
    data: summary,
    isLoading: loading,
    isError: summaryIsError,
    error: summaryError,
  } = useAthleteWorkoutSummary(athleteProfileId, workoutIdFromParams, {
    enabled: !authLoading && Boolean(athleteProfileId),
    requestCoachedDebit: !workoutsPane,
    onCoachedDebitWarning,
  })

  const instagramShareLines = useWorkoutInstagramShareLines(summary, athleteProfileId, supabase)

  const [isSubmitted, _setIsSubmitted] = useState(false)
  const [paneFinalizeLoading, setPaneFinalizeLoading] = useState(false)
  const [instagramSharePreviewOpen, setInstagramSharePreviewOpen] = useState(false)
  const [gymLogoShareSrc, setGymLogoShareSrc] = useState('/logo.svg')

  const error = useMemo(() => {
    if (summaryIsError) {
      const errorMessage =
        summaryError instanceof Error ? summaryError.message : 'Errore sconosciuto'
      return `Errore nel caricamento del riepilogo: ${errorMessage}`
    }
    return null
  }, [summaryIsError, summaryError])

  const lastNotifiedSummaryRef = useRef<string | null>(null)
  useEffect(() => {
    if (!summaryIsError) {
      lastNotifiedSummaryRef.current = null
      return
    }
    const errorMessage = summaryError instanceof Error ? summaryError.message : 'Errore sconosciuto'
    if (lastNotifiedSummaryRef.current === errorMessage) return
    lastNotifiedSummaryRef.current = errorMessage
    logger.error('Errore caricamento riepilogo workout', summaryError, {
      athleteProfileId,
      workoutIdFromParams,
      errorMessage,
    })
    notifyError('Errore', `Impossibile caricare il riepilogo dell'allenamento: ${errorMessage}`)
  }, [summaryIsError, summaryError, athleteProfileId, workoutIdFromParams])

  /** Dashboard Workouts: testi riepilogo coerenti con sessione vista staff (non "in autonomia"). */
  const sessionNoteForStaffPane = useMemo(() => {
    if (!workoutsPane || !summary) return null as string | null
    const n = summary.session_note?.trim() ?? ''
    if (!n) return 'Registrato dalla dashboard Workouts.'
    if (n === 'Completato da solo') return 'Completato dalla vista trainer (dashboard Workouts).'
    return n
  }, [workoutsPane, summary])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setGymLogoShareSrc(new URL('/logo.svg', window.location.origin).href)
  }, [])

  const handleStaffPaneSaveAndComplete = useCallback(async () => {
    if (!workoutsPane || !athleteProfileId || !summary) return
    const logId = (summary.workout_log_id?.trim() || workoutIdFromParams?.trim() || '') as string
    if (!logId || !isValidUUID(logId)) {
      addToast({
        title: 'Errore',
        message: 'Log allenamento non valido: impossibile finalizzare.',
        variant: 'error',
      })
      return
    }
    const coached =
      summary.is_coached || String(summary.execution_mode ?? '').toLowerCase() === 'coached'

    setPaneFinalizeLoading(true)
    try {
      const { data: setsRows, error: setsErr } = await supabase
        .from('workout_sets')
        .select('reps, weight_kg')
        .eq('workout_log_id', logId)

      if (setsErr) {
        addToast({
          title: 'Errore',
          message: setsErr.message || 'Impossibile leggere le serie salvate.',
          variant: 'error',
        })
        return
      }

      let volumeTotale = 0
      for (const row of setsRows ?? []) {
        const r = repsForVolumeKgRep(row.reps ?? 0)
        const w = row.weight_kg != null ? Number(row.weight_kg) : 0
        if (r > 0 && w >= 0) volumeTotale += r * w
      }

      const completedAt = new Date().toISOString()
      const today = completedAt.split('T')[0]

      const { data: logRow } = await supabase
        .from('workout_logs')
        .select('stato')
        .eq('id', logId)
        .eq('atleta_id', athleteProfileId)
        .maybeSingle()

      const stLog = String(logRow?.stato ?? '').toLowerCase()
      const needsFirstComplete = stLog !== 'completato' && stLog !== 'completed'

      const updatePayload: Record<string, unknown> = {
        volume_totale: volumeTotale > 0 ? volumeTotale : null,
        esercizi_completati: summary.completed_exercises,
        esercizi_totali: summary.total_exercises,
      }
      if (needsFirstComplete) {
        updatePayload.stato = 'completato'
        updatePayload.completed_at = completedAt
        updatePayload.data = today
      }

      const { error: updErr } = await supabase
        .from('workout_logs')
        .update(updatePayload as never)
        .eq('id', logId)
        .eq('atleta_id', athleteProfileId)

      if (updErr) {
        addToast({
          title: 'Errore',
          message: updErr.message || 'Aggiornamento log allenamento non riuscito.',
          variant: 'error',
        })
        return
      }

      if (coached) {
        const debit = await requestCoachedSessionDebitClient(logId)
        if (!debit.ok) {
          addToast({
            title: 'Scalatura lezione',
            message: debit.error ?? 'Operazione non riuscita. Riprova o contatta la reception.',
            variant: 'error',
          })
          return
        }
      }

      if (workoutsPane.onWorkoutCompleted) {
        const appointmentOk = await Promise.resolve(
          workoutsPane.onWorkoutCompleted({
            athleteProfileId,
            withTrainer: coached,
            workoutLogId: logId,
            finalizeAgendaAppointment: true,
          }),
        )
        if (appointmentOk === false) {
          return
        }
      }

      await invalidateAfterWorkoutSessionWrite(queryClient, user?.user_id ?? null)

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('22club:athlete-lessons-refresh'))
      }

      workoutsPane.setDirty?.(false)
      if (workoutsPane.dismissSlot) {
        workoutsPane.dismissSlot()
      } else {
        workoutsPane.navigateTo({ kind: 'home' })
      }
    } catch (e) {
      logger.error('Finalizzazione riepilogo Workouts pane', e)
      addToast({
        title: 'Errore',
        message: e instanceof Error ? e.message : 'Finalizzazione non riuscita.',
        variant: 'error',
      })
    } finally {
      setPaneFinalizeLoading(false)
    }
  }, [
    workoutsPane,
    athleteProfileId,
    summary,
    workoutIdFromParams,
    addToast,
    supabase,
    queryClient,
    user?.user_id,
  ])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const workoutShareCardProps = useMemo((): WorkoutShareCardProps | null => {
    if (!summary) return null
    const completionPctLocal = summary.completion_percent
    const completionSessionLabel =
      summary.total_sets > 0
        ? 'Completamento serie'
        : summary.total_exercises > 0
          ? 'Esercizi completati'
          : 'Completamento'

    const prCount = instagramShareLines.filter((l) => l.isPersonalRecord).length

    const exercisesDisplay = summary.exercises.slice(0, 4).map((ex, idx) => {
      const line = instagramShareLines[idx]
      const setsDone = ex.sets.filter((s) => s.is_completed).length
      const setsTotal = ex.sets.length
      const repsLabel =
        ex.sets.length > 0 ? ex.sets.map((s) => String(s.performed_reps)).join(' Â· ') : 'â€”'
      const maxW = Math.max(0, ...ex.sets.map((s) => s.performed_weight))
      const weightLabel = maxW > 0 ? `${Math.round(maxW)} kg` : null
      return {
        name: ex.exercise.name,
        imageUrl: line?.mediaPreviewUrl ?? pickExerciseSharePreviewUrl(ex.exercise),
        videoUrl: line?.mediaVideoUrl ?? pickExerciseShareVideoUrl(ex.exercise),
        setsLabel: `${setsDone}/${setsTotal} serie`,
        repsLabel,
        weightLabel,
        completed: ex.is_completed,
        highlightPr: Boolean(line?.isPersonalRecord),
      }
    })

    const highlights = buildWorkoutShareHighlights({
      completionPct: completionPctLocal,
      completedExercises: summary.completed_exercises,
      totalExercises: summary.total_exercises,
      completedSets: summary.completed_sets,
      totalSets: summary.total_sets,
      personalRecordsCount: prCount,
    })

    return {
      completedAtLabel: formatDateTime(summary.completed_at),
      completedAtIso: summary.completed_at,
      workoutTitle: summary.workout_title,
      completionPct: completionPctLocal,
      completionSessionLabel,
      stats: {
        volumeKgFormatted: formatVolumeIt(summary.performance_stats.total_volume),
        durationLabel: formatTime(summary.total_time),
        durationMinutes: summary.total_time,
        exercisesCompleted: summary.completed_exercises,
        exercisesTotal: summary.total_exercises,
        setsCompleted: summary.completed_sets,
        setsTotal: summary.total_sets,
        averageLoadPerSetKg: summary.performance_stats.average_load_per_set,
        completionPct: completionPctLocal,
      },
      exercises: exercisesDisplay,
      exercisesOverflowCount: Math.max(0, summary.exercises.length - 4),
      highlights,
      brand: { name: '22Club', logoSrc: gymLogoShareSrc },
      trainerOrGymName: null,
    }
  }, [summary, instagramShareLines, gymLogoShareSrc])

  const instagramShareRevision = useMemo(() => {
    if (!summary) return ''
    try {
      return JSON.stringify({
        id: summary.workout_log_id,
        title: summary.workout_title,
        completed: summary.completed_at,
        vol: summary.performance_stats.total_volume,
        time: summary.total_time,
        coached: summary.is_coached,
        lines: instagramShareLines,
        logo: gymLogoShareSrc,
        card: workoutShareCardProps,
      })
    } catch {
      return summary.workout_log_id
    }
  }, [summary, instagramShareLines, gymLogoShareSrc, workoutShareCardProps])

  const getMuscleGroupIcon = (muscleGroup: string): LucideIcon => {
    const raw = (muscleGroup ?? '').toLowerCase().trim()
    const alias: Record<string, string> = {
      petto: 'chest',
      schiena: 'back',
      gambe: 'legs',
      glutei: 'legs',
      spalle: 'shoulders',
      braccia: 'arms',
      bicipiti: 'arms',
      tricipiti: 'arms',
      addome: 'core',
      addominali: 'core',
    }
    const key = alias[raw] ?? raw
    const map: Record<string, LucideIcon> = {
      chest: Dumbbell,
      back: Activity,
      legs: Footprints,
      shoulders: Target,
      arms: Dumbbell,
      core: Flame,
      cardio: Heart,
    }
    return map[key] ?? Dumbbell
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success'
      case 'intermediate':
        return 'warning'
      case 'advanced':
        return 'error'
      default:
        return 'default'
    }
  }

  // Early return se user non Ã¨ valido
  if (!authLoading && authRecovery !== 'retrying' && (!user || !isValidUser)) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <div className={cn(riepilogoScrollBodyClass, 'flex items-center justify-center')}>
          <Card className="relative max-w-md w-full overflow-hidden rounded-2xl border-red-500/30 bg-background-secondary/50">
            <CardContent className="p-6 md:p-8 text-center relative z-10">
              <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                <Lock className="h-10 w-10 text-text-tertiary" />
              </div>
              <p className="text-text-primary mb-4 text-sm md:text-base font-medium">
                Accesso richiesto
              </p>
              <Button
                onClick={() => router.push('/login?reason=auth_required')}
                className="min-h-[44px] h-9 touch-manipulation rounded-xl bg-primary text-sm text-primary-foreground hover:bg-primary/90 sm:h-10"
              >
                Vai al login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading || authLoading || authRecovery === 'retrying') {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <div className={riepilogoScrollBodyClass}>
          <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-6 lg:max-w-3xl">
            <PageHeaderFixed
              variant="chat"
              embedStatic={isPreview}
              title="Riepilogo Allenamento"
              subtitle="Caricamentoâ€¦"
              onBack={handleRiepilogoHeaderBack}
            />
            <div className={CARD_DS}>
              <div className="space-y-4 p-4 sm:p-6">
                <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
                <div className="mx-auto h-6 w-[min(100%,20rem)] animate-pulse rounded-md bg-white/10" />
                <div className="mx-auto h-4 w-[min(100%,14rem)] animate-pulse rounded-md bg-white/5" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
                <div className="mx-auto h-2 w-40 animate-pulse rounded-full bg-white/10" />
              </div>
            </div>
            <div className={CARD_DS}>
              <div className="space-y-3 p-4 sm:p-6">
                <div className="h-5 w-40 animate-pulse rounded-md bg-white/10" />
                <div className="h-24 animate-pulse rounded-xl bg-white/5" />
                <div className="h-24 animate-pulse rounded-xl bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Errore o nessun dato
  if (error || !summary) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <div className={riepilogoScrollBodyClass}>
          <div className="mx-auto w-full max-w-lg space-y-4 md:space-y-5 lg:max-w-3xl">
            <PageHeaderFixed
              variant="chat"
              embedStatic={isPreview}
              title="Riepilogo Allenamento"
              subtitle="Riepilogo sessione"
              onBack={handleRiepilogoHeaderBack}
            />
            <Card className="relative overflow-hidden rounded-2xl border border-state-error/50 bg-background-secondary/50">
              <CardContent className="relative z-10 p-6 text-center md:p-8">
                <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                  <X className="h-10 w-10 text-state-error" />
                </div>
                <h3 className="text-text-primary mb-2 text-base font-medium md:text-lg">
                  {error || 'Nessun allenamento completato trovato'}
                </h3>
                <p className="text-text-secondary mb-4 text-xs md:text-sm line-clamp-2">
                  Completa un allenamento per vedere il riepilogo
                </p>
                <Button
                  onClick={goToAllenamentiHome}
                  className="min-h-[44px] h-9 touch-manipulation rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:h-10"
                >
                  Vai agli Allenamenti
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        <div className={cn(riepilogoScrollBodyClass, 'flex items-center justify-center')}>
          <Card className={`relative mx-auto w-full max-w-md ${CARD_DS}`}>
            <CardContent className="relative z-10 p-6 text-center sm:p-8">
              <div className="mb-3 flex justify-center" aria-hidden>
                <PartyPopper className="h-12 w-12 text-cyan-400" />
              </div>
              <h1 className="mb-2 text-lg font-bold text-text-primary sm:text-xl">
                Allenamento completato!
              </h1>
              <p className="mb-4 text-sm text-text-secondary sm:text-base">
                I tuoi risultati sono stati inviati al tuo trainer.
              </p>
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
              <p className="text-text-tertiary mt-3 text-xs md:text-sm">
                Reindirizzamento alla home...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const completionPct = summary.completion_percent
  const completionLabel =
    summary.total_sets > 0
      ? 'Completamento serie'
      : summary.total_exercises > 0
        ? 'Esercizi completati'
        : 'Completamento'

  return (
    <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
      <div className={riepilogoScrollBodyClass}>
        <div className="mx-auto w-full max-w-lg space-y-5 sm:space-y-6 lg:max-w-3xl lg:space-y-7">
          <PageHeaderFixed
            variant="chat"
            embedStatic={isPreview}
            title="Riepilogo Allenamento"
            subtitle={summary.workout_title}
            onBack={handleRiepilogoHeaderBack}
          />

          <Card className={CARD_DS}>
            <CardContent className="relative z-10 divide-y divide-white/10 p-0">
              <section
                className="space-y-3 p-4 sm:space-y-5 sm:p-6"
                aria-label="Riepilogo sessione"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner sm:h-12 sm:w-12"
                    aria-hidden
                  >
                    <Trophy className="h-5 w-5 text-cyan-400 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                    <h2 className="text-balance text-base font-semibold leading-snug text-text-primary sm:text-lg md:text-xl">
                      {summary.workout_title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[11px] text-text-tertiary md:text-xs">
                        Completato il {formatDateTime(summary.completed_at)}
                      </p>
                      {summary.is_coached || workoutsPane ? (
                        <Badge
                          variant="info"
                          size="sm"
                          className="rounded-full border-cyan-400/40 bg-cyan-500/15 text-[10px] text-cyan-200 sm:text-[11px]"
                        >
                          <UserRound className="mr-1 h-3 w-3" aria-hidden />
                          Con trainer
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          size="sm"
                          className="rounded-full border-white/15 text-[10px] text-text-secondary sm:text-[11px]"
                        >
                          In autonomia
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {(workoutsPane ? sessionNoteForStaffPane : summary.session_note) ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left sm:rounded-xl sm:px-4 sm:py-3">
                    <p className="text-[9px] font-medium uppercase tracking-wide text-text-tertiary sm:text-[10px]">
                      Nota sessione
                    </p>
                    <p className="mt-1 text-xs leading-snug text-text-secondary sm:mt-1.5 sm:text-sm sm:leading-relaxed">
                      {workoutsPane ? sessionNoteForStaffPane : summary.session_note}
                    </p>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-3 lg:gap-4">
                  <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <Activity className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                        Esercizi
                      </p>
                      <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                        {summary.completed_exercises}/{summary.total_exercises}
                      </p>
                      <p className="text-[9px] leading-tight text-text-tertiary sm:text-[10px]">
                        completati
                      </p>
                    </div>
                  </div>
                  <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <ListOrdered className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                        Serie
                      </p>
                      <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                        {summary.completed_sets}/{summary.total_sets}
                      </p>
                      <p className="text-[9px] leading-tight text-text-tertiary sm:text-[10px]">
                        registrate
                      </p>
                    </div>
                  </div>
                  <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <Clock className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                        Durata
                      </p>
                      <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                        {formatTime(summary.total_time)}
                      </p>
                      <p className="text-[9px] leading-tight text-text-tertiary sm:text-[10px]">
                        in sala
                      </p>
                    </div>
                  </div>
                  <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <Weight className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                        Volume
                      </p>
                      <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                        {formatVolumeIt(summary.performance_stats.total_volume)}
                      </p>
                      <p className="text-[9px] leading-tight text-text-tertiary sm:text-[10px]">
                        kg (serie)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-3 sm:gap-3 sm:pt-5 md:gap-4 md:pt-6">
                  <Progress value={completionPct} className="h-2 w-full max-w-xs" />
                  <div className="flex w-full max-w-xs items-center justify-between">
                    <span className="text-xs text-text-tertiary">{completionLabel}</span>
                    <span className="text-xs font-semibold tabular-nums text-text-primary">
                      {completionPct}%
                    </span>
                  </div>
                  <Badge
                    variant={
                      completionPct >= 100
                        ? 'success'
                        : completionPct >= 50
                          ? 'warning'
                          : 'secondary'
                    }
                    size="sm"
                    className="rounded-full text-[11px] sm:text-xs"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {completionPct >= 100
                      ? 'Sessione registrata al completo'
                      : `Sessione al ${completionPct}% sulle metriche principali`}
                  </Badge>
                </div>
              </section>

              <section aria-labelledby="riepilogo-esercizi-heading">
                <div className="relative z-10 border-b border-white/10 px-3 py-2.5 sm:px-5 sm:py-4 md:px-6 md:py-4">
                  <CardTitle
                    id="riepilogo-esercizi-heading"
                    size="md"
                    className="flex flex-col gap-0.5 text-xs font-semibold text-text-primary md:text-base sm:flex-row sm:items-center sm:gap-2 sm:text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-8 sm:w-8 sm:rounded-xl">
                        <Dumbbell className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                      </span>
                      Dettaglio esercizi
                    </span>
                    <span className="pl-9 text-[10px] font-normal leading-snug text-text-tertiary sm:pl-0 sm:text-[11px] sm:ml-auto">
                      Solo serie salvate per questo giorno
                    </span>
                  </CardTitle>
                </div>
                <div className="relative z-10 space-y-3 px-3 pb-3 pt-3 sm:space-y-4 sm:px-5 sm:pb-4 sm:pt-4 md:space-y-5 md:px-6 md:pb-5 md:pt-5">
                  {summary.exercises.length === 0 ? (
                    <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
                      Nessuna serie trovata per questo log: compaiono qui solo peso e ripetizioni
                      salvate in questa sessione (stesso giorno di scheda).
                    </p>
                  ) : (
                    summary.exercises.map((exercise) => {
                      const exVol = exercise.sets.reduce(
                        (acc, s) => acc + s.performed_weight * repsForVolumeKgRep(s.performed_reps),
                        0,
                      )
                      const targetParts = [
                        `${exercise.target_sets}Ã—${formatWorkoutRepsLabel(exercise.target_reps)}`,
                        exercise.target_weight && exercise.target_weight > 0
                          ? `${exercise.target_weight} kg`
                          : null,
                      ].filter(Boolean)
                      return (
                        <div
                          key={exercise.id}
                          className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-3 sm:rounded-xl sm:p-4 md:p-5"
                        >
                          <div className="flex gap-2.5 min-[480px]:items-start min-[480px]:justify-between min-[480px]:gap-3">
                            <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-10 sm:w-10 sm:rounded-xl">
                                {createElement(getMuscleGroupIcon(exercise.exercise.muscle_group), {
                                  className: 'h-4 w-4 text-cyan-400 sm:h-5 sm:w-5',
                                  'aria-hidden': true,
                                })}
                              </div>
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-col gap-1.5 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-2">
                                  <h4 className="text-balance text-sm font-semibold leading-snug text-text-primary sm:text-base">
                                    {exercise.exercise.name}
                                  </h4>
                                  <Badge
                                    variant={exercise.is_completed ? 'success' : 'warning'}
                                    size="sm"
                                    className="w-fit shrink-0 rounded-full text-[9px] sm:text-[10px]"
                                  >
                                    {exercise.is_completed ? 'Serie ok' : 'Da chiudere'}
                                  </Badge>
                                </div>
                                <p className="text-[11px] leading-snug text-text-tertiary [overflow-wrap:anywhere] sm:text-xs">
                                  {muscleLabelIt(exercise.exercise.muscle_group)}
                                  {exercise.exercise.equipment &&
                                  exercise.exercise.equipment !== 'unknown'
                                    ? ` Â· ${exercise.exercise.equipment}`
                                    : ''}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                                  <Badge
                                    variant={
                                      getDifficultyColor(exercise.exercise.difficulty) as
                                        | 'default'
                                        | 'success'
                                        | 'warning'
                                        | 'error'
                                        | 'info'
                                        | 'outline'
                                        | 'secondary'
                                    }
                                    size="sm"
                                    className="w-fit rounded-full text-[9px] sm:text-[10px]"
                                  >
                                    {difficultyLabelIt(exercise.exercise.difficulty)}
                                  </Badge>
                                  <span className="min-w-0 text-[10px] leading-snug text-text-secondary [overflow-wrap:anywhere] sm:text-[11px]">
                                    <span className="text-text-tertiary">Obiettivo scheda:</span>{' '}
                                    {targetParts.join(' Â· ')}
                                    {exVol > 0 ? (
                                      <>
                                        <span className="text-text-tertiary"> Â· </span>
                                        <span className="text-text-tertiary">
                                          Volume esercizio:
                                        </span>{' '}
                                        <span className="font-medium text-text-secondary">
                                          {formatVolumeIt(exVol)} kg
                                        </span>
                                      </>
                                    ) : null}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2.5 min-w-0 space-y-1 sm:mt-3 sm:space-y-1.5">
                            <div className="grid grid-cols-[minmax(1.75rem,2.25rem)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-1 gap-y-0.5 border-b border-white/10 pb-1.5 text-[9px] font-medium uppercase tracking-wide text-text-tertiary sm:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-x-1.5 sm:pb-2 sm:text-[10px]">
                              <span className="min-w-0">NÂ°</span>
                              <span className="min-w-0 text-center sm:text-left">Peso</span>
                              <span className="min-w-0 text-center sm:text-left">Rip.</span>
                              <span className="sr-only min-w-0 sm:not-sr-only sm:w-8 sm:shrink-0">
                                Stato
                              </span>
                            </div>
                            {exercise.sets.map((set, setIndex) => (
                              <div
                                key={setIndex}
                                className="grid grid-cols-[minmax(1.75rem,2.25rem)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-x-1 gap-y-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-1.5 sm:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-x-1.5 sm:rounded-lg sm:px-2.5 sm:py-2"
                              >
                                <span className="min-w-0 text-[11px] font-semibold tabular-nums text-text-primary sm:text-xs">
                                  {set.set_number}
                                </span>
                                <div className="flex min-w-0 items-center justify-center gap-0.5 sm:justify-start sm:gap-1">
                                  <Weight
                                    className="hidden h-3 w-3 shrink-0 text-cyan-400 sm:block sm:h-3.5 sm:w-3.5"
                                    aria-hidden
                                  />
                                  <span className="min-w-0 break-words text-[11px] font-semibold tabular-nums text-text-primary sm:text-xs">
                                    {set.performed_weight > 0
                                      ? `${formatVolumeIt(set.performed_weight)} kg`
                                      : 'â€”'}
                                  </span>
                                </div>
                                <div className="flex min-w-0 items-center justify-center gap-0.5 sm:justify-start sm:gap-1">
                                  <Target
                                    className="hidden h-3 w-3 shrink-0 text-cyan-400 sm:block sm:h-3.5 sm:w-3.5"
                                    aria-hidden
                                  />
                                  <span className="min-w-0 break-words text-[11px] font-semibold tabular-nums text-text-primary sm:text-xs">
                                    {formatWorkoutRepsLabel(set.performed_reps)}
                                  </span>
                                </div>
                                <div className="flex shrink-0 justify-end">
                                  <Badge
                                    variant={set.is_completed ? 'success' : 'neutral'}
                                    size="sm"
                                    className="rounded-full px-1 py-0 sm:px-1.5"
                                  >
                                    {set.is_completed ? (
                                      <CheckCircle2
                                        className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                                        aria-label="Serie completata"
                                      />
                                    ) : (
                                      <span className="text-[8px] sm:text-[9px]">â€¦</span>
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </section>

              <section aria-labelledby="riepilogo-sintesi-heading">
                <div className="relative z-10 border-b border-white/10 px-3 py-2.5 sm:px-5 sm:py-4 md:px-6 md:py-4">
                  <CardTitle
                    id="riepilogo-sintesi-heading"
                    size="md"
                    className="flex items-center gap-2 text-xs font-semibold text-text-primary sm:text-sm md:text-base"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-8 sm:w-8 sm:rounded-xl">
                      <Activity className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                    </span>
                    Sintesi numerica
                  </CardTitle>
                </div>
                <div className="relative z-10 space-y-3 px-3 pb-3 pt-3 sm:space-y-4 sm:px-5 sm:pb-4 sm:pt-4 md:px-6 md:pb-5 md:pt-5">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-3 lg:gap-4">
                    <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <Weight className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                          Volume totale
                        </p>
                        <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                          {formatVolumeIt(summary.performance_stats.total_volume)}
                          <span className="text-[10px] font-medium text-text-tertiary sm:text-xs">
                            {' '}
                            kg
                          </span>
                        </p>
                        <p className="text-[9px] leading-tight text-text-tertiary [overflow-wrap:anywhere] sm:text-[10px] sm:leading-snug">
                          Somma carichi delle serie registrate (kg Ã— ripetizioni).
                        </p>
                      </div>
                    </div>
                    <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <TrendingUp className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                          IntensitÃ  media
                        </p>
                        <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                          {summary.total_sets > 0
                            ? formatVolumeIt(summary.performance_stats.average_load_per_set)
                            : 'â€”'}
                          {summary.total_sets > 0 ? (
                            <span className="text-[10px] font-medium text-text-tertiary sm:text-xs">
                              {' '}
                              kg/serie
                            </span>
                          ) : null}
                        </p>
                        <p className="text-[9px] leading-tight text-text-tertiary [overflow-wrap:anywhere] sm:text-[10px] sm:leading-snug">
                          Volume diviso per il numero di serie salvate.
                        </p>
                      </div>
                    </div>
                    <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                          Esercizi al completo
                        </p>
                        <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                          {summary.performance_stats.consistency_score}
                          <span className="text-[10px] font-medium text-text-tertiary sm:text-xs">
                            %
                          </span>
                        </p>
                        <p className="text-[9px] leading-tight text-text-tertiary [overflow-wrap:anywhere] sm:text-[10px] sm:leading-snug">
                          Quota di esercizi con tutte le serie segnate come completate.
                        </p>
                      </div>
                    </div>
                    <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <Trophy className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                          Record personali
                        </p>
                        <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                          {summary.performance_stats.personal_records > 0
                            ? summary.performance_stats.personal_records
                            : 'â€”'}
                        </p>
                        <p className="text-[9px] leading-tight text-text-tertiary [overflow-wrap:anywhere] sm:text-[10px] sm:leading-snug">
                          Confronto con lo storico in arrivo; per ora non calcolato.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          <div className="space-y-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="min-h-10 w-full gap-2 rounded-xl border border-white/10 text-sm text-text-primary hover:bg-white/5 hover:border-white/20"
              onClick={() => setInstagramSharePreviewOpen(true)}
            >
              <Instagram className="h-4 w-4 shrink-0 text-pink-400" aria-hidden />
              Condividi risultati
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 w-full rounded-xl border border-white/10 text-sm text-text-primary hover:bg-white/5 hover:border-white/20"
              disabled={paneFinalizeLoading}
              onClick={
                workoutsPane ? () => void handleStaffPaneSaveAndComplete() : goToAllenamentiHome
              }
            >
              {workoutsPane
                ? paneFinalizeLoading
                  ? 'Salvataggioâ€¦'
                  : 'Salva e chiudi allenamento'
                : isPreview
                  ? 'Completa allenamento'
                  : 'Torna alla home'}
            </Button>
          </div>

          {instagramSharePreviewOpen && workoutShareCardProps ? (
            <WorkoutInstagramSharePreviewDialog
              open={instagramSharePreviewOpen}
              onOpenChange={setInstagramSharePreviewOpen}
              shareRevision={instagramShareRevision}
              data={workoutShareCardProps}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
