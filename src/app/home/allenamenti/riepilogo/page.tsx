'use client'

import { useState, useEffect, Suspense, createElement, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { mergeOrphanWorkoutSetsIntoSetsByWdeIdAndRepair } from '@/lib/workout-sets-repair-orphan-log'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import type { Tables } from '@/types/supabase'
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
import {
  WORKOUT_REPS_MAX_SENTINEL,
  formatWorkoutRepsLabel,
} from '@/lib/constants/workout-reps-select'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { WorkoutInstagramShareExerciseLine } from './workout-instagram-share-target'
import { WorkoutInstagramSharePreviewDialog } from './workout-instagram-share-preview-dialog'

const logger = createLogger('app:home:allenamenti:riepilogo:page')

const CARD_DS =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

function formatVolumeIt(kg: number): string {
  const n = Math.round(kg)
  return new Intl.NumberFormat('it-IT').format(n)
}

/** Ripetizioni MAX (-1) non contribuiscono al volume kg·rep. */
function repsForVolumeKgRep(reps: number): number {
  return reps === WORKOUT_REPS_MAX_SENTINEL ? 0 : reps
}

function difficultyLabelIt(code: string): string {
  const c = (code ?? '').toLowerCase().trim()
  const map: Record<string, string> = {
    beginner: 'Principiante',
    easy: 'Principiante',
    bassa: 'Principiante',
    intermediate: 'Intermedio',
    medium: 'Intermedio',
    media: 'Intermedio',
    advanced: 'Avanzato',
    hard: 'Avanzato',
    alta: 'Avanzato',
  }
  return map[c] ?? code
}

function muscleLabelIt(raw: string): string {
  const s = (raw ?? '').trim()
  if (!s || s === 'unknown') return 'Gruppo muscolare'
  return s
}

interface WorkoutSummary {
  /** Id riga `workout_logs` (per API debito / callback dashboard). */
  workout_log_id: string
  workout_id: string
  workout_title: string
  completed_at: string
  /** Percentuale 0–100 da serie completate / serie totali (o esercizi se assenza set) */
  completion_percent: number
  total_exercises: number
  completed_exercises: number
  total_sets: number
  completed_sets: number
  total_time: number
  session_note: string | null
  is_coached: boolean
  execution_mode: string | null
  exercises: Array<{
    id: string
    exercise: {
      id: string
      name: string
      muscle_group: string
      equipment: string
      difficulty: string
      created_at: string
      updated_at: string
      video_url: string | null
      thumb_url: string | null
      image_url: string | null
      thumbnail_url: string | null
    }
    target_sets: number
    target_reps: number
    target_weight: number
    sets: Array<{
      set_number: number
      performed_weight: number
      performed_reps: number
      is_completed: boolean
    }>
    is_completed: boolean
  }>
  performance_stats: {
    average_weight_increase: number
    total_volume: number
    /** Volume medio per serie registrata (kg·rep / n. serie) */
    average_load_per_set: number
    consistency_score: number
    personal_records: number
  }
}

/** Immagine per export Instagram: thumb / thumbnail_url / image_url (no video come sorgente img). */
function pickExerciseSharePreviewUrl(
  ex: WorkoutSummary['exercises'][number]['exercise'],
): string | null {
  for (const u of [ex.thumb_url, ex.thumbnail_url, ex.image_url]) {
    if (typeof u !== 'string') continue
    const t = u.trim()
    if (!t) continue
    if (t.startsWith('http://') || t.startsWith('https://')) return t
    if (typeof window !== 'undefined' && t.startsWith('/')) {
      return new URL(t, window.location.origin).href
    }
  }
  return null
}

function pickExerciseShareVideoUrl(
  ex: WorkoutSummary['exercises'][number]['exercise'],
): string | null {
  const u = ex.video_url
  if (typeof u !== 'string') return null
  const t = u.trim()
  if (!t) return null
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (typeof window !== 'undefined' && t.startsWith('/')) {
    return new URL(t, window.location.origin).href
  }
  return null
}

export function RiepilogoPageContent({
  workoutLogIdOverride,
}: {
  workoutLogIdOverride?: string
} = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  const supabase = useSupabaseClient()
  const { addToast } = useToast()
  const { pathBase, isPreview } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()

  const handleRiepilogoHeaderBack = useCallback(() => {
    if (workoutsPane) {
      workoutsPane.navigateTo({ kind: 'home' })
      return
    }
    router.back()
  }, [workoutsPane, router])

  /** In Workouts (dashboard) `isPreview` è true ma non si deve usare `router.push('/home/allenamenti')`: si resta nello slot. */
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

  const { athleteProfileId } = useResolvedAthleteProfileForAllenamenti()

  const [summary, setSummary] = useState<WorkoutSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, _setIsSubmitted] = useState(false)
  const [paneFinalizeLoading, setPaneFinalizeLoading] = useState(false)
  const [instagramSharePreviewOpen, setInstagramSharePreviewOpen] = useState(false)
  const [instagramShareLines, setInstagramShareLines] = useState<
    WorkoutInstagramShareExerciseLine[]
  >([])
  const [gymLogoShareSrc, setGymLogoShareSrc] = useState('/logo.svg')

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

  useEffect(() => {
    if (!summary || !athleteProfileId) {
      setInstagramShareLines([])
      return
    }

    const fallbackLines: WorkoutInstagramShareExerciseLine[] = summary.exercises.map((ex) => ({
      name: ex.exercise.name,
      maxWeightKg: Math.max(0, ...ex.sets.map((s) => s.performed_weight)),
      isPersonalRecord: false,
      mediaPreviewUrl: pickExerciseSharePreviewUrl(ex.exercise),
      mediaVideoUrl: pickExerciseShareVideoUrl(ex.exercise),
    }))
    setInstagramShareLines(fallbackLines)

    let cancelled = false
    void (async () => {
      try {
        const currentLogId = summary.workout_log_id
        const { data: pastLogs, error: pastErr } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('atleta_id', athleteProfileId)
          .in('stato', ['completato', 'completed'])
          .neq('id', currentLogId)

        if (pastErr) {
          logger.warn('Share Instagram: storico workout_logs fallito', pastErr)
        }

        const pastLogIds = (pastLogs ?? [])
          .map((r: { id: string }) => r.id)
          .filter((id: string) => Boolean(id))
        const maxByExercise = new Map<string, number>()

        if (pastLogIds.length > 0) {
          type SetRow = { weight_kg: number | null; workout_day_exercise_id: string }
          const allSets: SetRow[] = []
          for (const chunk of chunkForSupabaseIn(pastLogIds)) {
            const { data: sets, error: setsErr } = await supabase
              .from('workout_sets')
              .select('weight_kg, workout_day_exercise_id')
              .in('workout_log_id', chunk)
              .not('completed_at', 'is', null)

            if (setsErr) {
              logger.warn('Share Instagram: storico workout_sets fallito', setsErr)
              continue
            }
            allSets.push(...((sets ?? []) as SetRow[]))
          }

          const wdeIds = [...new Set(allSets.map((s) => s.workout_day_exercise_id).filter(Boolean))]
          if (wdeIds.length > 0) {
            const wdeToEx = new Map<string, string>()
            for (const wdeChunk of chunkForSupabaseIn(wdeIds)) {
              const { data: wdeRows } = await supabase
                .from('workout_day_exercises')
                .select('id, exercise_id')
                .in('id', wdeChunk)

              for (const row of wdeRows ?? []) {
                const r = row as { id: string; exercise_id: string | null }
                if (r.id && r.exercise_id) wdeToEx.set(r.id, r.exercise_id)
              }
            }

            for (const s of allSets) {
              const exId = wdeToEx.get(s.workout_day_exercise_id)
              if (!exId || s.weight_kg == null) continue
              const w = Number(s.weight_kg)
              if (!Number.isFinite(w) || w <= 0) continue
              const prev = maxByExercise.get(exId) ?? 0
              if (w > prev) maxByExercise.set(exId, w)
            }
          }
        }

        const lines: WorkoutInstagramShareExerciseLine[] = summary.exercises.map((ex) => {
          const sessionMax = Math.max(0, ...ex.sets.map((s) => s.performed_weight))
          const hist = maxByExercise.get(ex.exercise.id)
          const histVal = hist !== undefined ? hist : null
          const isPr = sessionMax > 0 && (histVal === null || sessionMax > histVal)
          return {
            name: ex.exercise.name,
            maxWeightKg: sessionMax,
            isPersonalRecord: isPr,
            mediaPreviewUrl: pickExerciseSharePreviewUrl(ex.exercise),
            mediaVideoUrl: pickExerciseShareVideoUrl(ex.exercise),
          }
        })

        if (!cancelled) setInstagramShareLines(lines)
      } catch (e) {
        logger.warn('Share Instagram: calcolo PR fallito', e)
        if (!cancelled) setInstagramShareLines(fallbackLines)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [summary, athleteProfileId, supabase])

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
      })
    } catch {
      return summary.workout_log_id
    }
  }, [summary, instagramShareLines, gymLogoShareSrc])

  // Recupera workout_id da query params se disponibile (passato dalla pagina precedente)
  const workoutIdFromParams = workoutLogIdOverride ?? searchParams.get('workout_id')

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

  // Carica riepilogo workout
  useEffect(() => {
    let cancelled = false
    const loadWorkoutSummary = async () => {
      if (!athleteProfileId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Se c'è workout_id nei params, recupera quello specifico
        // Altrimenti recupera l'ultimo workout_log completato
        let workoutLog

        if (workoutIdFromParams) {
          const { data, error: logError } = await supabase
            .from('workout_logs')
            .select(
              `
              *,
              scheda:workout_plans(
                id,
                name,
                workout_days(
                  id,
                  day_number,
                  title,
                  day_name,
                  workout_day_exercises(
                    id,
                    exercise_id,
                    target_sets,
                    target_reps,
                    target_weight,
                    exercises(id, name, muscle_group, equipment, difficulty, video_url, thumb_url, image_url, thumbnail_url)
                  )
                )
              )
            `,
            )
            .eq('id', workoutIdFromParams)
            .eq('atleta_id', athleteProfileId)
            .in('stato', ['completato', 'completed'])
            .maybeSingle()

          if (logError) {
            logger.error('Errore query workout_log specifico', logError, {
              workoutIdFromParams,
              athleteProfileId,
              errorCode: logError.code,
              errorMessage: logError.message,
              errorDetails: logError.details,
              errorHint: logError.hint,
            })
            throw logError
          }
          // Se il log non è ancora "completato", prova fallback per id (stesso atleta),
          // così evitiamo errore bloccante durante transizioni di stato.
          if (!data) {
            const { data: anyStateLog, error: anyStateErr } = await supabase
              .from('workout_logs')
              .select(
                `
              *,
              scheda:workout_plans(
                id,
                name,
                workout_days(
                  id,
                  day_number,
                  title,
                  day_name,
                  workout_day_exercises(
                    id,
                    exercise_id,
                    target_sets,
                    target_reps,
                    target_weight,
                    exercises(id, name, muscle_group, equipment, difficulty, video_url, thumb_url, image_url, thumbnail_url)
                  )
                )
              )
            `,
              )
              .eq('id', workoutIdFromParams)
              .eq('atleta_id', athleteProfileId)
              .maybeSingle()

            if (anyStateErr) {
              logger.error('Errore query fallback workout_log specifico', anyStateErr, {
                workoutIdFromParams,
                athleteProfileId,
                errorCode: anyStateErr.code,
                errorMessage: anyStateErr.message,
                errorDetails: anyStateErr.details,
                errorHint: anyStateErr.hint,
              })
              throw anyStateErr
            }
            workoutLog = anyStateLog
          } else {
            workoutLog = data
          }
        } else {
          // Recupera l'ultimo workout_log completato
          const { data, error: logError } = await supabase
            .from('workout_logs')
            .select(
              `
              *,
              scheda:workout_plans(
                id,
                name,
                workout_days(
                  id,
                  day_number,
                  title,
                  day_name,
                  workout_day_exercises(
                    id,
                    exercise_id,
                    target_sets,
                    target_reps,
                    target_weight,
                    exercises(id, name, muscle_group, equipment, difficulty, video_url, thumb_url, image_url, thumbnail_url)
                  )
                )
              )
            `,
            )
            .eq('atleta_id', athleteProfileId)
            .in('stato', ['completato', 'completed'])
            .order('data', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (logError) {
            logger.error('Errore query workout_log ultimo', logError, {
              athleteProfileId,
              errorCode: logError.code,
              errorMessage: logError.message,
              errorDetails: logError.details,
              errorHint: logError.hint,
            })
            throw logError
          }
          workoutLog = data
        }

        if (cancelled) return
        if (!workoutLog) {
          setError('Nessun allenamento completato trovato')
          setLoading(false)
          return
        }

        // Type assertion per workoutLog (Supabase restituisce tipo never per query complesse)
        type WorkoutLogWithScheda = Pick<
          Tables<'workout_logs'>,
          'id' | 'scheda_id' | 'data' | 'created_at' | 'durata_minuti'
        > & {
          stato?: string | null
          note?: string | null
          workout_day_id?: string | null
          completed_at?: string | null
          is_coached?: boolean | null
          execution_mode?: string | null
          volume_totale?: number | null
          scheda?: {
            id?: string
            name?: string
            workout_days?: Array<{
              id?: string
              day_number?: number | null
              title?: string
              day_name?: string
              workout_day_exercises?: Array<{
                id?: string
                exercise_id?: string
                target_sets?: number
                target_reps?: number
                target_weight?: number
                exercises?: {
                  id?: string
                  name?: string
                  muscle_group?: string
                  equipment?: string
                  difficulty?: string
                  created_at?: string
                  updated_at?: string
                  video_url?: string | null
                  thumb_url?: string | null
                  image_url?: string | null
                  thumbnail_url?: string | null
                }
              }>
            }>
          } | null
        }
        const typedWorkoutLog = workoutLog as WorkoutLogWithScheda

        // Carica set reali da workout_sets per questo workout_log (reps, peso eseguiti)
        const workoutLogId = typedWorkoutLog.id
        const setsByWdeId = new Map<
          string,
          Array<{ set_number: number; reps: number; weight_kg: number; is_completed: boolean }>
        >()
        if (workoutLogId) {
          const { data: setsRows } = await supabase
            .from('workout_sets')
            .select('workout_day_exercise_id, set_number, reps, weight_kg, completed_at')
            .eq('workout_log_id', workoutLogId)
            .order('set_number', { ascending: true })
          if (setsRows?.length) {
            for (const row of setsRows as Array<{
              workout_day_exercise_id: string
              set_number: number
              reps: number | null
              weight_kg: number | null
              completed_at: string | null
            }>) {
              const wdeId = row.workout_day_exercise_id
              if (!setsByWdeId.has(wdeId)) setsByWdeId.set(wdeId, [])
              setsByWdeId.get(wdeId)!.push({
                set_number: row.set_number,
                reps: row.reps ?? 0,
                weight_kg: row.weight_kg ?? 0,
                is_completed: Boolean(row.completed_at),
              })
            }
          }
        }

        // Trasforma i dati in formato WorkoutSummary
        // Workaround necessario: Supabase restituisce relazioni annidate non tipizzate
        const scheda = typedWorkoutLog.scheda as unknown as
          | {
              id?: string
              name?: string
              workout_days?: Array<{
                id?: string
                day_number?: number | null
                title?: string
                day_name?: string
                workout_day_exercises?: Array<{
                  id?: string
                  exercise_id?: string
                  target_sets?: number
                  target_reps?: number
                  target_weight?: number
                  exercises?: {
                    id?: string
                    name?: string
                    muscle_group?: string
                    equipment?: string
                    difficulty?: string
                    created_at?: string
                    updated_at?: string
                    video_url?: string | null
                    thumb_url?: string | null
                    image_url?: string | null
                    thumbnail_url?: string | null
                  }
                }>
              }>
            }
          | null
          | undefined

        type DayRow = NonNullable<NonNullable<typeof scheda>['workout_days']>[number]
        const days = scheda?.workout_days ?? []
        const logDayId = typedWorkoutLog.workout_day_id ?? null

        let activeDay: DayRow | null = null
        if (logDayId) {
          activeDay = days.find((d) => d.id === logDayId) ?? null
        }
        if (!activeDay && days.length === 1) {
          activeDay = days[0] ?? null
        }
        const setKeysForDayInfer = [...setsByWdeId.keys()].filter((id) => Boolean(id))
        if (!activeDay && setKeysForDayInfer.length > 0) {
          const idSet = (day: DayRow) => new Set(day.workout_day_exercises?.map((w) => w.id) ?? [])
          activeDay =
            days.find((d) => setKeysForDayInfer.every((id) => idSet(d).has(id))) ??
            days.find((d) => setKeysForDayInfer.some((id) => idSet(d).has(id))) ??
            null
        }

        // Set salvati ma non collegati al log: cerca su TUTTA la scheda nella finestra di chiusura sessione
        // (anche se il log ha già altre serie collegate, così il riepilogo e i grafici vedono gli orfani).
        const allWdeIdsOnPlan = days.flatMap(
          (d) =>
            d.workout_day_exercises?.map((w) => w.id).filter((x): x is string => Boolean(x)) ?? [],
        )
        if (workoutLogId && allWdeIdsOnPlan.length > 0) {
          const anchor =
            typedWorkoutLog.completed_at || typedWorkoutLog.created_at || typedWorkoutLog.data
          const fallback = typedWorkoutLog.created_at || typedWorkoutLog.completed_at
          const anchorStr = anchor != null && String(anchor).trim() !== '' ? String(anchor) : ''
          const fallbackStr =
            fallback != null && String(fallback).trim() !== '' ? String(fallback) : null
          if (anchorStr || fallbackStr) {
            await mergeOrphanWorkoutSetsIntoSetsByWdeIdAndRepair(
              supabase,
              workoutLogId,
              allWdeIdsOnPlan,
              anchorStr || (fallbackStr ?? ''),
              fallbackStr,
              setsByWdeId,
            )
          }
        }

        const savedWdeIds = [...setsByWdeId.keys()].filter((id) => Boolean(id))
        if (!activeDay && savedWdeIds.length > 0) {
          const idSet = (day: DayRow) => new Set(day.workout_day_exercises?.map((w) => w.id) ?? [])
          activeDay =
            days.find((d) => savedWdeIds.every((id) => idSet(d).has(id))) ??
            days.find((d) => savedWdeIds.some((id) => idSet(d).has(id))) ??
            null
        }

        const orderInDay = new Map<string, number>()
        if (activeDay?.workout_day_exercises?.length) {
          activeDay.workout_day_exercises.forEach((w, i) => {
            if (w.id) orderInDay.set(w.id, i)
          })
        }
        const wdeIdsForSummary = savedWdeIds
          .filter((id) => (activeDay ? orderInDay.has(id) : true))
          .sort((a, b) => (orderInDay.get(a) ?? 0) - (orderInDay.get(b) ?? 0))

        const exercises = wdeIdsForSummary.flatMap((wdeId, index) => {
          const realSets = setsByWdeId.get(wdeId)
          if (!realSets?.length) return []

          const ex =
            activeDay?.workout_day_exercises?.find((w) => w.id === wdeId) ??
            days.flatMap((d) => d.workout_day_exercises ?? []).find((w) => w.id === wdeId)

          if (!ex) return []

          const exerciseId = ex.exercise_id || `exercise-${index}`
          const exerciseData = ex.exercises || {
            id: exerciseId,
            name: 'Esercizio',
            muscle_group: 'unknown',
            equipment: 'unknown',
            difficulty: 'intermediate',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            video_url: null as string | null,
            thumb_url: null as string | null,
            image_url: null as string | null,
            thumbnail_url: null as string | null,
          }
          const sets = realSets.map((s) => ({
            set_number: s.set_number,
            performed_weight: s.weight_kg,
            performed_reps: s.reps,
            is_completed: s.is_completed,
          }))
          return [
            {
              id: wdeId,
              exercise: {
                id: exerciseData.id || exerciseId,
                name: exerciseData.name || 'Esercizio',
                muscle_group: exerciseData.muscle_group || 'unknown',
                equipment: exerciseData.equipment || 'unknown',
                difficulty: exerciseData.difficulty || 'intermediate',
                created_at: exerciseData.created_at || new Date().toISOString(),
                updated_at: exerciseData.updated_at || new Date().toISOString(),
                video_url: exerciseData.video_url ?? null,
                thumb_url: exerciseData.thumb_url ?? null,
                image_url: exerciseData.image_url ?? null,
                thumbnail_url: exerciseData.thumbnail_url ?? null,
              },
              target_sets: ex.target_sets || 0,
              target_reps: ex.target_reps ?? 0,
              target_weight: ex.target_weight || 0,
              sets,
              is_completed: sets.length > 0 && sets.every((s) => s.is_completed),
            },
          ]
        })

        const dayLabel =
          activeDay?.title?.trim() ||
          activeDay?.day_name?.trim() ||
          (activeDay?.day_number != null ? `Giorno ${activeDay.day_number}` : '') ||
          ''
        const planTitle = scheda?.name?.trim() || 'Allenamento'
        const workoutTitleCombined = dayLabel ? `${planTitle} — ${dayLabel}` : planTitle

        const totalExercises = exercises.length
        const completedExercises = exercises.filter((ex) => ex.is_completed).length
        const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
        const completedSets = exercises.reduce(
          (sum, ex) => sum + ex.sets.filter((s) => s.is_completed).length,
          0,
        )
        const totalVolumeFromSets = exercises.reduce(
          (sum, ex) =>
            sum +
            ex.sets.reduce(
              (acc, set) => acc + set.performed_weight * repsForVolumeKgRep(set.performed_reps),
              0,
            ),
          0,
        )

        const volLoggedRaw = typedWorkoutLog.volume_totale
        const volLogged =
          volLoggedRaw != null && !Number.isNaN(Number(volLoggedRaw)) ? Number(volLoggedRaw) : null
        const totalVolumeDisplay =
          volLogged != null && !Number.isNaN(volLogged) && volLogged > 0
            ? volLogged
            : totalVolumeFromSets

        const completionPercent =
          totalSets > 0
            ? Math.round((completedSets / totalSets) * 100)
            : totalExercises > 0
              ? Math.round((completedExercises / totalExercises) * 100)
              : 0

        const avgLoadPerSet = totalSets > 0 ? Math.round(totalVolumeDisplay / totalSets) : 0

        const summaryData: WorkoutSummary = {
          workout_log_id: String(typedWorkoutLog.id ?? ''),
          workout_id: typedWorkoutLog.scheda_id || typedWorkoutLog.id,
          workout_title: workoutTitleCombined,
          completed_at:
            typedWorkoutLog.completed_at ||
            typedWorkoutLog.data ||
            typedWorkoutLog.created_at ||
            new Date().toISOString(),
          completion_percent: Math.min(100, Math.max(0, completionPercent)),
          total_exercises: totalExercises,
          completed_exercises: completedExercises,
          total_sets: totalSets,
          completed_sets: completedSets,
          total_time: typedWorkoutLog.durata_minuti || 0,
          session_note: typedWorkoutLog.note?.trim() ? typedWorkoutLog.note.trim() : null,
          is_coached: Boolean(typedWorkoutLog.is_coached),
          execution_mode: typedWorkoutLog.execution_mode ?? null,
          exercises,
          performance_stats: {
            average_weight_increase: 0,
            total_volume: totalVolumeDisplay,
            average_load_per_set: avgLoadPerSet,
            consistency_score:
              totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
            personal_records: 0,
          },
        }

        if (cancelled) return

        const stLog = String(typedWorkoutLog.stato ?? '').toLowerCase()
        const logCompleted = stLog === 'completato' || stLog === 'completed'
        const logCoached =
          Boolean(typedWorkoutLog.is_coached) ||
          String(typedWorkoutLog.execution_mode ?? '').toLowerCase() === 'coached'
        if (logCompleted && logCoached && typedWorkoutLog.id && !workoutsPane) {
          const debit = await requestCoachedSessionDebitClient(typedWorkoutLog.id)
          if (!debit.ok && !cancelled) {
            addToast({
              title: 'Attenzione',
              message:
                'Se le lezioni non risultano aggiornate dopo questa sessione con trainer, contatta la reception.',
              variant: 'warning',
            })
          }
        }

        if (cancelled) return
        setSummary(summaryData)
      } catch (err) {
        if (cancelled) return
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        const errorDetails =
          err && typeof err === 'object' && 'code' in err
            ? {
                code: (err as { code?: string }).code,
                message: (err as { message?: string }).message,
                details: (err as { details?: string }).details,
                hint: (err as { hint?: string }).hint,
              }
            : {}

        logger.error('Errore caricamento riepilogo workout', err, {
          athleteProfileId,
          workoutIdFromParams,
          errorMessage,
          ...errorDetails,
        })
        setError(`Errore nel caricamento del riepilogo: ${errorMessage}`)
        notifyError('Errore', `Impossibile caricare il riepilogo dell'allenamento: ${errorMessage}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (!authLoading && athleteProfileId) {
      loadWorkoutSummary()
    } else if (!authLoading && !athleteProfileId) {
      setLoading(false)
    }
    return () => {
      cancelled = true
    }
  }, [authLoading, athleteProfileId, workoutIdFromParams, supabase, addToast, workoutsPane])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

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

  // Early return se user non è valido
  if (!authLoading && (!user || !isValidUser)) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-36 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-32 min-[834px]:pt-6 flex items-center justify-center">
          <Card className="relative max-w-md w-full overflow-hidden rounded-2xl border-red-500/30 bg-background-secondary/50">
            <CardContent className="p-6 min-[834px]:p-8 text-center relative z-10">
              <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                <Lock className="h-10 w-10 text-text-tertiary" />
              </div>
              <p className="text-text-primary mb-4 text-sm min-[834px]:text-base font-medium">
                Accesso richiesto
              </p>
              <Button
                onClick={() => router.push('/login')}
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

  if (loading || authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-36 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-32 min-[834px]:pt-6">
          <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl">
            <PageHeaderFixed
              variant="chat"
              embedStatic={isPreview}
              title="Riepilogo Allenamento"
              subtitle="Caricamento…"
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
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-36 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-32 min-[834px]:pt-6">
          <div className="mx-auto w-full max-w-lg space-y-4 min-[834px]:space-y-5 min-[1100px]:max-w-3xl">
            <PageHeaderFixed
              variant="chat"
              embedStatic={isPreview}
              title="Riepilogo Allenamento"
              subtitle="Riepilogo sessione"
              onBack={handleRiepilogoHeaderBack}
            />
            <Card className="relative overflow-hidden rounded-2xl border border-state-error/50 bg-background-secondary/50">
              <CardContent className="relative z-10 p-6 text-center min-[834px]:p-8">
                <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                  <X className="h-10 w-10 text-state-error" />
                </div>
                <h3 className="text-text-primary mb-2 text-base font-medium min-[834px]:text-lg">
                  {error || 'Nessun allenamento completato trovato'}
                </h3>
                <p className="text-text-secondary mb-4 text-xs min-[834px]:text-sm line-clamp-2">
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
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-36 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-32 min-[834px]:pt-6 flex items-center justify-center">
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
              <p className="text-text-tertiary mt-3 text-xs min-[834px]:text-sm">
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
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-36 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-32 min-[834px]:pt-6">
        <div className="mx-auto w-full max-w-lg space-y-5 sm:space-y-6 min-[1100px]:max-w-3xl min-[1100px]:space-y-7">
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
                    <h2 className="text-balance text-base font-semibold leading-snug text-text-primary sm:text-lg min-[834px]:text-xl">
                      {summary.workout_title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[11px] text-text-tertiary min-[834px]:text-xs">
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

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-3 min-[1100px]:gap-4">
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

                <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-3 sm:gap-3 sm:pt-5 min-[834px]:gap-4 min-[834px]:pt-6">
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
                <div className="relative z-10 border-b border-white/10 px-3 py-2.5 sm:px-5 sm:py-4 min-[834px]:px-6 min-[834px]:py-4">
                  <CardTitle
                    id="riepilogo-esercizi-heading"
                    size="md"
                    className="flex flex-col gap-0.5 text-xs font-semibold text-text-primary min-[834px]:text-base sm:flex-row sm:items-center sm:gap-2 sm:text-sm"
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
                <div className="relative z-10 space-y-3 px-3 pb-3 pt-3 sm:space-y-4 sm:px-5 sm:pb-4 sm:pt-4 min-[834px]:space-y-5 min-[834px]:px-6 min-[834px]:pb-5 min-[834px]:pt-5">
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
                        `${exercise.target_sets}×${formatWorkoutRepsLabel(exercise.target_reps)}`,
                        exercise.target_weight && exercise.target_weight > 0
                          ? `${exercise.target_weight} kg`
                          : null,
                      ].filter(Boolean)
                      return (
                        <div
                          key={exercise.id}
                          className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-3 sm:rounded-xl sm:p-4 min-[834px]:p-5"
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
                                    ? ` · ${exercise.exercise.equipment}`
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
                                    {targetParts.join(' · ')}
                                    {exVol > 0 ? (
                                      <>
                                        <span className="text-text-tertiary"> · </span>
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
                              <span className="min-w-0">N°</span>
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
                                      : '—'}
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
                                      <span className="text-[8px] sm:text-[9px]">…</span>
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
                <div className="relative z-10 border-b border-white/10 px-3 py-2.5 sm:px-5 sm:py-4 min-[834px]:px-6 min-[834px]:py-4">
                  <CardTitle
                    id="riepilogo-sintesi-heading"
                    size="md"
                    className="flex items-center gap-2 text-xs font-semibold text-text-primary sm:text-sm min-[834px]:text-base"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-8 sm:w-8 sm:rounded-xl">
                      <Activity className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                    </span>
                    Sintesi numerica
                  </CardTitle>
                </div>
                <div className="relative z-10 space-y-3 px-3 pb-3 pt-3 sm:space-y-4 sm:px-5 sm:pb-4 sm:pt-4 min-[834px]:px-6 min-[834px]:pb-5 min-[834px]:pt-5">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-3 min-[1100px]:gap-4">
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
                          Somma carichi delle serie registrate (kg × ripetizioni).
                        </p>
                      </div>
                    </div>
                    <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:gap-2.5 sm:p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <TrendingUp className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">
                          Intensità media
                        </p>
                        <p className="break-words text-base font-bold tabular-nums leading-none text-text-primary sm:text-lg">
                          {summary.total_sets > 0
                            ? formatVolumeIt(summary.performance_stats.average_load_per_set)
                            : '—'}
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
                            : '—'}
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
              Pubblica i tuoi risultati
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
                  ? 'Salvataggio…'
                  : 'Salva e chiudi allenamento'
                : isPreview
                  ? 'Completa allenamento'
                  : 'Torna alla home'}
            </Button>
          </div>

          <WorkoutInstagramSharePreviewDialog
            open={instagramSharePreviewOpen}
            onOpenChange={setInstagramSharePreviewOpen}
            shareRevision={instagramShareRevision}
            gymLogoSrc={gymLogoShareSrc}
            workoutTitle={summary.workout_title}
            completedAtLabel={formatDateTime(summary.completed_at)}
            modeIsCoached={summary.is_coached || Boolean(workoutsPane)}
            completedExercises={summary.completed_exercises}
            totalExercises={summary.total_exercises}
            completedSets={summary.completed_sets}
            totalSets={summary.total_sets}
            durationLabel={formatTime(summary.total_time)}
            volumeKgFormatted={formatVolumeIt(summary.performance_stats.total_volume)}
            completionPct={completionPct}
            completionLabel={completionLabel}
            exerciseLines={instagramShareLines}
            summaryAverageLoadPerSet={summary.performance_stats.average_load_per_set}
            summaryConsistencyScore={summary.performance_stats.consistency_score}
            summaryPersonalRecords={summary.performance_stats.personal_records}
          />
        </div>
      </div>
    </div>
  )
}

export default function RiepilogoPage() {
  return (
    <Suspense fallback={null}>
      <RiepilogoPageContent />
    </Suspense>
  )
}
