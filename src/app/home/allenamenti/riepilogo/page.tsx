'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import type { Tables } from '@/types/supabase'

const logger = createLogger('app:home:allenamenti:riepilogo:page')
import { PageHeaderFixed } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import {
  Send,
  Target,
  Weight,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react'
import { formatDateTime } from '@/lib/format'

interface WorkoutSummary {
  workout_id: string
  workout_title: string
  completed_at: string
  total_exercises: number
  completed_exercises: number
  total_sets: number
  completed_sets: number
  total_time: number
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
            .eq('stato', 'completato')
            .single()

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
          workoutLog = data
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
            .eq('stato', 'completato')
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
          scheda?: {
            id?: string
            name?: string
            workout_days?: Array<{
              id?: string
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

        // Se scheda è null o undefined, crea una struttura vuota
        const firstDay = scheda?.workout_days?.[0]
        const exercises =
          firstDay?.workout_day_exercises?.map((ex, index) => {
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
            const wdeId = ex.id || `exercise-${index}`
            const realSets = setsByWdeId.get(wdeId)
            const sets =
              (realSets?.length ?? 0) > 0
                ? realSets!.map((s) => ({
                    set_number: s.set_number,
                    performed_weight: s.weight_kg,
                    performed_reps: s.reps,
                    is_completed: s.is_completed,
                  }))
                : Array.from({ length: ex.target_sets || 0 }, (_, i) => ({
                    set_number: i + 1,
                    performed_weight: ex.target_weight || 0,
                    performed_reps: ex.target_reps || 0,
                    is_completed: true,
                  }))
            return {
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
            }
          }) || []

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

        const summaryData: WorkoutSummary = {
          workout_id: typedWorkoutLog.scheda_id || typedWorkoutLog.id,
          workout_title: scheda?.name || firstDay?.title || firstDay?.day_name || 'Allenamento',
          completed_at:
            typedWorkoutLog.data || typedWorkoutLog.created_at || new Date().toISOString(),
          total_exercises: totalExercises,
          completed_exercises: completedExercises,
          total_sets: totalSets,
          completed_sets: completedSets,
          total_time: typedWorkoutLog.durata_minuti || 0,
          exercises,
          performance_stats: {
            average_weight_increase: 0, // TODO: calcolare da dati storici
            total_volume: totalVolumeFromSets,
            consistency_score:
              totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
            personal_records: 0, // TODO: calcolare confrontando con PR precedenti
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

  const handleSubmitToPT = async () => {
    try {
      setIsSubmitting(true)

      // Simula invio dati al PT
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsSubmitted(true)

      // Dopo 3 secondi torna alla home
      setTimeout(() => {
        router.push('/home')
      }, 3000)
    } catch (error) {
      logger.error('Error submitting workout', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getMuscleGroupIcon = (muscleGroup: string) => {
    const icons: Record<string, string> = {
      chest: '💪',
      back: '🏋️',
      legs: '🦵',
      shoulders: '🤸',
      arms: '💪',
      core: '🔥',
      cardio: '❤️',
    }
    return icons[muscleGroup] || '💪'
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
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 flex items-center justify-center">
          <Card className="relative overflow-hidden border-red-500/30 bg-background-secondary/50 max-w-md w-full">
            <CardContent className="p-6 min-[834px]:p-8 text-center relative z-10">
              <div className="mb-3 text-4xl opacity-50">🔒</div>
              <p className="text-text-primary mb-4 text-sm min-[834px]:text-base font-medium">Accesso richiesto</p>
              <Button onClick={() => router.push('/login')} className="min-h-[44px] h-9 rounded-lg bg-primary text-sm text-primary-foreground hover:bg-primary/90 sm:h-10">
                Vai al login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-3">
          <div className="animate-pulse space-y-3">
            <div className="bg-background-tertiary h-6 w-40 rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background-tertiary h-28 rounded-lg" />
              ))}
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
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
          <PageHeaderFixed
            variant="chat"
            title="Riepilogo Allenamento"
            subtitle="Riepilogo sessione"
            onBack={() => router.back()}
            icon={<Trophy className="h-5 w-5 text-cyan-400" />}
          />
          <Card className="border border-state-error/50 bg-background-secondary/50">
            <CardContent className="p-6 min-[834px]:p-8 text-center relative z-10">
              <div className="mb-3 text-4xl opacity-50">❌</div>
              <h3 className="text-text-primary mb-2 text-base min-[834px]:text-lg font-medium">{error || 'Nessun allenamento completato trovato'}</h3>
              <p className="text-text-secondary mb-4 text-xs min-[834px]:text-sm line-clamp-2">Completa un allenamento per vedere il riepilogo</p>
              <Button onClick={() => router.push('/home/allenamenti')} className="min-h-[44px] h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:h-10">
                Vai agli Allenamenti
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 flex items-center justify-center">
          <Card className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <CardContent className="relative z-10 p-6 text-center sm:p-8">
              <div className="mb-3 text-5xl">🎉</div>
              <h1 className="mb-2 text-lg font-bold text-text-primary sm:text-xl">Allenamento completato!</h1>
              <p className="mb-4 text-sm text-text-secondary sm:text-base">I tuoi risultati sono stati inviati al tuo trainer.</p>
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
              <p className="text-text-tertiary mt-3 text-xs min-[834px]:text-sm">Reindirizzamento alla home...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        <PageHeaderFixed
          variant="chat"
          title="Riepilogo Allenamento"
          subtitle={summary.workout_title}
          onBack={() => router.back()}
          icon={<Trophy className="h-5 w-5 text-cyan-400" />}
        />

        {/* Card principale */}
        <Card className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <CardContent className="relative z-10 p-4 sm:p-6">
            <div className="mb-4 text-center sm:mb-5">
              <div className="mb-3 flex justify-center sm:mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-14 sm:w-14">
                  <Trophy className="h-6 w-6 text-cyan-400 sm:h-7 sm:w-7" />
                </div>
              </div>
              <h2 className="text-lg min-[834px]:text-xl font-semibold text-text-primary truncate">
                {summary.workout_title}
              </h2>
              <p className="text-text-tertiary text-xs min-[834px]:text-sm mt-0.5">
                Completato il {formatDateTime(summary.completed_at)}
              </p>
            </div>

            {/* Statistiche compatte */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:grid-cols-4 sm:gap-3">
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Esercizi</div>
                  <div className="text-lg font-bold text-text-primary sm:text-xl">{summary.completed_exercises}/{summary.total_exercises}</div>
                </div>
              </div>
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Set</div>
                  <div className="text-lg font-bold text-text-primary sm:text-xl">{summary.completed_sets}/{summary.total_sets}</div>
                </div>
              </div>
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Clock className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Durata</div>
                  <div className="text-lg font-bold text-text-primary sm:text-xl">{formatTime(summary.total_time)}</div>
                </div>
              </div>
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Consistenza</div>
                  <div className="text-lg font-bold text-text-primary sm:text-xl">{summary.performance_stats.consistency_score}%</div>
                </div>
              </div>
            </div>

            {/* Progress + badge — barra accorciata con label sotto */}
            <div className="mb-3 flex flex-col items-center">
              <Progress value={100} className="h-1.5 w-32 min-[834px]:w-40" />
              <div className="flex items-center justify-between mt-1.5 w-32 min-[834px]:w-40">
                <span className="text-xs text-text-tertiary">Completamento</span>
                <span className="text-xs font-medium text-text-primary">100%</span>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="success" size="sm" className="rounded-full text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Allenamento completato al 100%! 🎉
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Esercizi eseguiti — CARD_DS, card esercizio neutre + icon box cyan */}
        <Card className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <CardHeader className="relative z-10 py-3 min-[834px]:py-4 border-b border-white/10">
            <CardTitle size="md" className="flex items-center gap-2 text-sm min-[834px]:text-base font-semibold text-text-primary">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
                💪
              </span>
              Esercizi eseguiti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10 pt-3 min-[834px]:pt-4">
            {summary.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
              >
                <div className="relative pl-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
                        {getMuscleGroupIcon(exercise.exercise.muscle_group)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-text-primary truncate">
                          {exercise.exercise.name}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
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
                            {exercise.exercise.difficulty}
                          </Badge>
                          <span className="text-xs text-text-tertiary truncate">
                            {exercise.exercise.equipment || 'N/D'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" className="rounded-full text-[10px] shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Completato
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-2"
                      >
                        <span className="text-xs font-medium text-text-tertiary shrink-0">Set {set.set_number}</span>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          {set.performed_weight > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
                                <Weight className="h-3 w-3 text-cyan-400" />
                              </div>
                              <span className="text-xs font-semibold text-text-primary">{set.performed_weight}kg</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
                              <Target className="h-3 w-3 text-cyan-400" />
                            </div>
                            <span className="text-xs font-semibold text-text-primary">{set.performed_reps} reps</span>
                          </div>
                          <Badge variant="success" size="sm" className="rounded-full shrink-0">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Statistiche performance — CARD_DS, stat box neutri + icone cyan */}
        <Card className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <CardHeader className="relative z-10 py-3 border-b border-white/10">
            <CardTitle size="md" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Activity className="h-4 w-4 text-cyan-400" />
              </span>
              Statistiche performance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Aumento peso medio</div>
                  <div className="text-base font-bold text-text-primary sm:text-lg">+{summary.performance_stats.average_weight_increase}kg</div>
                </div>
              </div>
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Weight className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Volume totale</div>
                  <div className="text-base font-bold text-text-primary sm:text-lg">{summary.performance_stats.total_volume}kg</div>
                </div>
              </div>
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Consistenza</div>
                  <div className="text-base font-bold text-text-primary sm:text-lg">{summary.performance_stats.consistency_score}%</div>
                </div>
              </div>
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Trophy className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Nuovi PR</div>
                  <div className="text-base font-bold text-text-primary sm:text-lg">{summary.performance_stats.personal_records}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messaggio motivazionale */}
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 py-3 pl-3 pr-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xl">
            💪
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">Ottimo lavoro!</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Hai completato tutti gli esercizi con successo. Continua così per raggiungere i tuoi obiettivi.
            </p>
            <p className="text-[10px] text-text-tertiary italic mt-1.5">
              &ldquo;Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno.&rdquo;
            </p>
          </div>
        </div>

        {/* Azioni */}
        <div className="space-y-2.5">
          <Button
            onClick={handleSubmitToPT}
            disabled={isSubmitting}
            className="min-h-11 w-full rounded-xl border border-cyan-400/80 bg-cyan-500 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:border-cyan-300/90 hover:bg-cyan-400 active:scale-[0.98] active:bg-cyan-600"
          >
            {isSubmitting ? (
              <>
                <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Invia al tuo PT
              </>
            )}
          </Button>
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
  )
}

export default function RiepilogoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 flex-col bg-background">
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-3">
            <div className="animate-pulse space-y-3">
              <div className="bg-background-tertiary h-6 w-40 rounded" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-background-tertiary h-28 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <RiepilogoPageContent />
    </Suspense>
  )
}
