'use client'

import { useState, useEffect, Suspense, createElement } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import type { Tables } from '@/types/supabase'
import { PageHeaderFixed } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
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
  ListOrdered,
  Lock,
  PartyPopper,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Weight,
  X,
} from 'lucide-react'
import { formatDateTime } from '@/lib/format'

const logger = createLogger('app:home:allenamenti:riepilogo:page')

const CARD_DS =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

function formatVolumeIt(kg: number): string {
  const n = Math.round(kg)
  return new Intl.NumberFormat('it-IT').format(n)
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

function RiepilogoPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = useSupabaseClient()

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // user.id da useAuth() è già profiles.id, usiamolo direttamente
  const athleteProfileId = isValidUser && isValidUUID(user.id) ? user.id : null

  const [summary, setSummary] = useState<WorkoutSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, _setIsSubmitted] = useState(false)

  // Recupera workout_id da query params se disponibile (passato dalla pagina precedente)
  const workoutIdFromParams = searchParams.get('workout_id')

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
                    exercises(id, name, muscle_group, equipment, difficulty)
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
                    exercises(id, name, muscle_group, equipment, difficulty)
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
                    exercises(id, name, muscle_group, equipment, difficulty)
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

        // Set salvati ma non collegati al log (o log senza workout_day_id su scheda multi-giorno): cerca su TUTTA la scheda nella finestra di chiusura sessione
        const allWdeIdsOnPlan = days.flatMap(
          (d) => d.workout_day_exercises?.map((w) => w.id).filter((x): x is string => Boolean(x)) ?? [],
        )
        if (workoutLogId && setsByWdeId.size === 0 && allWdeIdsOnPlan.length > 0) {
          const anchor =
            typedWorkoutLog.completed_at || typedWorkoutLog.created_at || typedWorkoutLog.data
          if (anchor) {
            const raw = String(anchor).trim()
            let winStart: string
            let winEnd: string
            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
              winStart = `${raw}T00:00:00.000Z`
              winEnd = `${raw}T23:59:59.999Z`
            } else {
              const t0 = new Date(raw).getTime()
              if (Number.isNaN(t0)) {
                winStart = ''
                winEnd = ''
              } else {
                winStart = new Date(t0 - 45 * 60 * 1000).toISOString()
                winEnd = new Date(t0 + 15 * 60 * 1000).toISOString()
              }
            }
            if (winStart && winEnd) {
              type OrphanRow = {
                id: string
                workout_day_exercise_id: string
                set_number: number
                reps: number | null
                weight_kg: number | null
                completed_at: string | null
                workout_log_id: string | null
              }
              const selectOrphan =
                'id, workout_day_exercise_id, set_number, reps, weight_kg, completed_at, workout_log_id, created_at' as const

              const { data: byCompleted } = await supabase
                .from('workout_sets')
                .select(selectOrphan)
                .in('workout_day_exercise_id', allWdeIdsOnPlan)
                .gte('completed_at', winStart)
                .lte('completed_at', winEnd)

              let list = (byCompleted ?? []) as OrphanRow[]

              if (list.length === 0) {
                const tLog = typedWorkoutLog.created_at || typedWorkoutLog.completed_at
                if (tLog) {
                  const tc = new Date(tLog).getTime()
                  if (!Number.isNaN(tc)) {
                    const { data: byCreated } = await supabase
                      .from('workout_sets')
                      .select(selectOrphan)
                      .in('workout_day_exercise_id', allWdeIdsOnPlan)
                      .is('workout_log_id', null)
                      .gte('created_at', new Date(tc - 90 * 60 * 1000).toISOString())
                      .lte('created_at', new Date(tc + 20 * 60 * 1000).toISOString())
                    list = (byCreated ?? []) as OrphanRow[]
                  }
                }
              }

              const repairIds: string[] = []
              for (const row of list) {
                if (row.workout_log_id != null && row.workout_log_id !== workoutLogId) continue
                const wdeId = row.workout_day_exercise_id
                if (!setsByWdeId.has(wdeId)) setsByWdeId.set(wdeId, [])
                setsByWdeId.get(wdeId)!.push({
                  set_number: row.set_number,
                  reps: row.reps ?? 0,
                  weight_kg: row.weight_kg ?? 0,
                  is_completed: Boolean(row.completed_at),
                })
                if (row.workout_log_id == null) repairIds.push(row.id)
              }
              for (const arr of setsByWdeId.values()) {
                arr.sort((a, b) => a.set_number - b.set_number)
              }
              if (repairIds.length > 0) {
                const { error: repErr } = await supabase
                  .from('workout_sets')
                  .update({ workout_log_id: workoutLogId })
                  .in('id', repairIds)
                if (repErr) {
                  logger.warn('Repair workout_sets → workout_log fallito', repErr, { workoutLogId })
                }
              }
            }
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
              },
              target_sets: ex.target_sets || 0,
              target_reps: ex.target_reps || 0,
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
        const workoutTitleCombined = dayLabel
          ? `${planTitle} — ${dayLabel}`
          : planTitle

        const totalExercises = exercises.length
        const completedExercises = exercises.filter((ex) => ex.is_completed).length
        const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
        const completedSets = exercises.reduce(
          (sum, ex) => sum + ex.sets.filter((s) => s.is_completed).length,
          0,
        )
        const totalVolumeFromSets = exercises.reduce(
          (sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + set.performed_weight * set.performed_reps, 0),
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
  }, [authLoading, athleteProfileId, workoutIdFromParams, supabase])

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
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24 flex items-center justify-center">
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
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24">
          <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl">
            <PageHeaderFixed
              variant="chat"
              title="Riepilogo Allenamento"
              subtitle="Caricamento…"
              onBack={() => router.back()}
              icon={<Trophy className="h-5 w-5 text-cyan-400" />}
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
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24">
          <div className="mx-auto w-full max-w-lg space-y-4 min-[834px]:space-y-5 min-[1100px]:max-w-3xl">
            <PageHeaderFixed
              variant="chat"
              title="Riepilogo Allenamento"
              subtitle="Riepilogo sessione"
              onBack={() => router.back()}
              icon={<Trophy className="h-5 w-5 text-cyan-400" />}
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
                  onClick={() => router.push('/home/allenamenti')}
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
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24 flex items-center justify-center">
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
  const motivTitle =
    completionPct >= 100
      ? 'Ottimo lavoro!'
      : completionPct >= 70
        ? 'Sessione solida'
        : summary.exercises.length > 0
          ? 'Risultati registrati'
          : 'Sessione registrata'
  const motivBody =
    completionPct >= 100
      ? 'Hai completato tutte le serie previste in questo riepilogo. Continua così.'
      : completionPct >= 70
        ? 'Buona parte delle serie risulta completata. La prossima volta spingi sulle ultime ripetizioni.'
        : summary.exercises.length > 0
          ? 'Continua a registrare peso e ripetizioni: il grafico dei progressi cresce con ogni sessione.'
          : 'Il log della sessione è salvato; quando registri le serie qui compariranno i dettagli.'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24">
        <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl">
          <PageHeaderFixed
            variant="chat"
            title="Riepilogo Allenamento"
            subtitle={summary.workout_title}
            onBack={() => router.back()}
            icon={<Trophy className="h-5 w-5 text-cyan-400" />}
          />

        <Card className={CARD_DS}>
          <CardContent className="relative z-10 space-y-4 p-4 sm:p-6">
            <div className="text-center sm:space-y-1">
              <div className="mb-3 flex justify-center sm:mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner sm:h-14 sm:w-14">
                  <Trophy className="h-6 w-6 text-cyan-400 sm:h-7 sm:w-7" />
                </div>
              </div>
              <h2 className="text-balance text-lg font-semibold leading-snug text-text-primary min-[834px]:text-xl">
                {summary.workout_title}
              </h2>
              <p className="mt-1 text-text-tertiary text-xs min-[834px]:text-sm">
                Completato il {formatDateTime(summary.completed_at)}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {summary.is_coached ? (
                  <Badge
                    variant="info"
                    size="sm"
                    className="rounded-full border-cyan-400/40 bg-cyan-500/15 text-[11px] text-cyan-200"
                  >
                    <UserRound className="mr-1 h-3 w-3" aria-hidden />
                    Con trainer
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/15 text-[11px] text-text-secondary"
                  >
                    In autonomia
                  </Badge>
                )}
              </div>
            </div>

            {summary.session_note ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left">
                <p className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
                  Nota sessione
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {summary.session_note}
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 min-[1100px]:gap-4">
              <div className="relative flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Esercizi
                  </div>
                  <div className="truncate text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {summary.completed_exercises}/{summary.total_exercises}
                  </div>
                  <div className="text-[10px] text-text-tertiary">completati</div>
                </div>
              </div>
              <div className="relative flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <ListOrdered className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Serie</div>
                  <div className="truncate text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {summary.completed_sets}/{summary.total_sets}
                  </div>
                  <div className="text-[10px] text-text-tertiary">registrate</div>
                </div>
              </div>
              <div className="relative flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Clock className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Durata</div>
                  <div className="truncate text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {formatTime(summary.total_time)}
                  </div>
                  <div className="text-[10px] text-text-tertiary">in sala</div>
                </div>
              </div>
              <div className="relative flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Weight className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Volume</div>
                  <div className="truncate text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                    {formatVolumeIt(summary.performance_stats.total_volume)}
                  </div>
                  <div className="text-[10px] text-text-tertiary">kg (serie)</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-4">
              <Progress value={completionPct} className="h-2 w-full max-w-xs" />
              <div className="flex w-full max-w-xs items-center justify-between">
                <span className="text-xs text-text-tertiary">{completionLabel}</span>
                <span className="text-xs font-semibold tabular-nums text-text-primary">
                  {completionPct}%
                </span>
              </div>
              <Badge
                variant={completionPct >= 100 ? 'success' : completionPct >= 50 ? 'warning' : 'secondary'}
                size="sm"
                className="rounded-full text-xs"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {completionPct >= 100
                  ? 'Sessione registrata al completo'
                  : `Sessione al ${completionPct}% sulle metriche principali`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={CARD_DS}>
          <CardHeader className="relative z-10 border-b border-white/10 py-3 min-[834px]:py-4">
            <CardTitle
              size="md"
              className="flex flex-col gap-1 text-sm font-semibold text-text-primary min-[834px]:text-base sm:flex-row sm:items-center sm:gap-2"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Dumbbell className="h-4 w-4 text-cyan-400" />
                </span>
                Dettaglio esercizi
              </span>
              <span className="text-[11px] font-normal text-text-tertiary sm:ml-auto">
                Solo serie salvate per questo giorno
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3 pt-3 min-[834px]:space-y-4 min-[834px]:pt-4">
            {summary.exercises.length === 0 ? (
              <p className="text-sm leading-relaxed text-text-secondary">
                Nessuna serie trovata per questo log: compaiono qui solo peso e ripetizioni salvate
                in questa sessione (stesso giorno di scheda).
              </p>
            ) : (
              summary.exercises.map((exercise) => {
                const exVol = exercise.sets.reduce(
                  (acc, s) => acc + s.performed_weight * s.performed_reps,
                  0,
                )
                const targetParts = [
                  `${exercise.target_sets}×${exercise.target_reps}`,
                  exercise.target_weight && exercise.target_weight > 0
                    ? `${exercise.target_weight} kg`
                    : null,
                ].filter(Boolean)
                return (
                  <div
                    key={exercise.id}
                    className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          {createElement(getMuscleGroupIcon(exercise.exercise.muscle_group), {
                            className: 'h-5 w-5 text-cyan-400',
                            'aria-hidden': true,
                          })}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <h4 className="text-sm font-semibold leading-tight text-text-primary sm:text-base">
                            {exercise.exercise.name}
                          </h4>
                          <p className="text-xs text-text-tertiary">
                            {muscleLabelIt(exercise.exercise.muscle_group)}
                            {exercise.exercise.equipment && exercise.exercise.equipment !== 'unknown'
                              ? ` · ${exercise.exercise.equipment}`
                              : ''}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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
                              className="rounded-full text-[10px]"
                            >
                              {difficultyLabelIt(exercise.exercise.difficulty)}
                            </Badge>
                            <span className="text-[11px] text-text-tertiary">
                              Obiettivo scheda: {targetParts.join(' · ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={exercise.is_completed ? 'success' : 'warning'}
                        size="sm"
                        className="shrink-0 rounded-full text-[10px]"
                      >
                        {exercise.is_completed ? 'Serie ok' : 'Da chiudere'}
                      </Badge>
                    </div>
                    {exVol > 0 ? (
                      <p className="mb-2 mt-3 text-[11px] text-text-tertiary">
                        Volume esercizio:{' '}
                        <span className="font-medium text-text-secondary">
                          {formatVolumeIt(exVol)} kg
                        </span>
                      </p>
                    ) : null}
                    <div className="mt-2 space-y-1.5">
                      <div className="grid grid-cols-[2.5rem_1fr_1fr_auto] gap-1 border-b border-white/10 pb-1.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary sm:grid-cols-[3rem_1fr_1fr_auto]">
                        <span>N°</span>
                        <span className="text-center sm:text-left">Peso</span>
                        <span className="text-center sm:text-left">Ripetizioni</span>
                        <span className="sr-only sm:not-sr-only sm:w-8">Stato</span>
                      </div>
                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="grid grid-cols-[2.5rem_1fr_1fr_auto] items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2 sm:grid-cols-[3rem_1fr_1fr_auto]"
                        >
                          <span className="text-xs font-semibold tabular-nums text-text-primary">
                            {set.set_number}
                          </span>
                          <div className="flex items-center justify-center gap-1 sm:justify-start">
                            <Weight className="hidden h-3.5 w-3.5 text-cyan-400 sm:block" aria-hidden />
                            <span className="text-xs font-semibold tabular-nums text-text-primary">
                              {set.performed_weight > 0
                                ? `${formatVolumeIt(set.performed_weight)} kg`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-1 sm:justify-start">
                            <Target className="hidden h-3.5 w-3.5 text-cyan-400 sm:block" aria-hidden />
                            <span className="text-xs font-semibold tabular-nums text-text-primary">
                              {set.performed_reps}
                            </span>
                          </div>
                          <div className="flex justify-end">
                            <Badge
                              variant={set.is_completed ? 'success' : 'neutral'}
                              size="sm"
                              className="rounded-full px-1.5 py-0"
                            >
                              {set.is_completed ? (
                                <CheckCircle2 className="h-3 w-3" aria-label="Serie completata" />
                              ) : (
                                <span className="text-[9px]">…</span>
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
          </CardContent>
        </Card>

        <Card className={CARD_DS}>
          <CardHeader className="relative z-10 border-b border-white/10 py-3 min-[834px]:py-4">
            <CardTitle
              size="md"
              className="flex items-center gap-2 text-sm font-semibold text-text-primary min-[834px]:text-base"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Activity className="h-4 w-4 text-cyan-400" />
              </span>
              Sintesi numerica
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4 pt-3 min-[834px]:pt-4">
            <div className="grid grid-cols-2 gap-3 min-[834px]:grid-cols-4 min-[1100px]:gap-4">
              <div className="relative flex min-w-0 flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 shrink-0 text-cyan-400" />
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Volume totale
                  </div>
                </div>
                <div className="text-lg font-bold tabular-nums text-text-primary min-[834px]:text-xl">
                  {formatVolumeIt(summary.performance_stats.total_volume)}{' '}
                  <span className="text-sm font-medium text-text-tertiary">kg</span>
                </div>
                <p className="text-[10px] leading-snug text-text-tertiary">
                  Somma carichi delle serie registrate (kg × ripetizioni).
                </p>
              </div>
              <div className="relative flex min-w-0 flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 shrink-0 text-cyan-400" />
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Intensità media
                  </div>
                </div>
                <div className="text-lg font-bold tabular-nums text-text-primary min-[834px]:text-xl">
                  {summary.total_sets > 0
                    ? formatVolumeIt(summary.performance_stats.average_load_per_set)
                    : '—'}
                  {summary.total_sets > 0 ? (
                    <span className="text-sm font-medium text-text-tertiary"> kg/serie</span>
                  ) : null}
                </div>
                <p className="text-[10px] leading-snug text-text-tertiary">
                  Volume diviso per il numero di serie salvate.
                </p>
              </div>
              <div className="relative flex min-w-0 flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Esercizi al completo
                  </div>
                </div>
                <div className="text-lg font-bold tabular-nums text-text-primary min-[834px]:text-xl">
                  {summary.performance_stats.consistency_score}
                  <span className="text-sm font-medium text-text-tertiary">%</span>
                </div>
                <p className="text-[10px] leading-snug text-text-tertiary">
                  Quota di esercizi con tutte le serie segnate come completate.
                </p>
              </div>
              <div className="relative flex min-w-0 flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 shrink-0 text-cyan-400" />
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Record personali
                  </div>
                </div>
                <div className="text-lg font-bold tabular-nums text-text-primary min-[834px]:text-xl">
                  {summary.performance_stats.personal_records > 0
                    ? summary.performance_stats.personal_records
                    : '—'}
                </div>
                <p className="text-[10px] leading-snug text-text-tertiary">
                  Confronto con lo storico in arrivo; per ora non calcolato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div
          className={`${CARD_DS} flex gap-3 p-3 sm:gap-4 sm:p-4`}
          role="region"
          aria-label="Messaggio motivazionale"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Sparkles className="h-5 w-5 text-cyan-400" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-semibold text-text-primary">{motivTitle}</h3>
            <p className="text-xs leading-relaxed text-text-secondary">{motivBody}</p>
            <p className="text-[10px] italic leading-relaxed text-text-tertiary">
              «Il progresso è ciò che resta quando la costanza batte la perfezione.»
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/home')}
            variant="outline"
            className="min-h-10 w-full rounded-xl border border-white/10 text-sm text-text-primary hover:bg-white/5 hover:border-white/20"
          >
            Torna alla home
          </Button>
        </div>
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
