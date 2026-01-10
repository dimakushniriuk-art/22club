'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import type { Tables } from '@/types/supabase'

const logger = createLogger('app:home:allenamenti:riepilogo:page')
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import {
  ArrowLeft,
  Send,
  Target,
  Weight,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Activity,
} from 'lucide-react'

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
  const supabase = createClient()

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
            return {
              id: ex.id || `exercise-${index}`,
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
              sets: Array.from({ length: ex.target_sets || 0 }, (_, i) => ({
                set_number: i + 1,
                performed_weight: ex.target_weight || 0,
                performed_reps: ex.target_reps || 0,
                is_completed: true,
              })),
              is_completed: true,
            }
          }) || []

        const totalExercises = exercises.length
        const completedExercises = exercises.filter((ex) => ex.is_completed).length
        const totalSets = exercises.reduce((sum, ex) => sum + ex.target_sets, 0)
        const completedSets = totalSets

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
            total_volume: exercises.reduce(
              (sum, ex) => sum + ex.target_weight * ex.target_reps * ex.target_sets,
              0,
            ),
            consistency_score:
              totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
            personal_records: 0, // TODO: calcolare confrontando con PR precedenti
          },
        }

        setSummary(summaryData)
      } catch (err) {
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
        setLoading(false)
      }
    }

    if (!authLoading && athleteProfileId) {
      loadWorkoutSummary()
    } else if (!authLoading && !athleteProfileId) {
      setLoading(false)
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
      <div
        className="bg-black min-w-[402px] min-h-[874px] flex items-center justify-center px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
          <CardContent className="p-6 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">🔒</div>
            <p className="text-text-primary mb-4 text-white text-sm font-medium">
              Accesso richiesto
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="h-9 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
            >
              Vai al login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-3 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse space-y-3">
          <div className="bg-background-tertiary h-6 w-40 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background-tertiary h-28 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Errore o nessun dato
  if (error || !summary) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        {/* Header - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-text-primary text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate flex-1 text-center">
              Riepilogo Allenamento
            </h1>
            <div className="w-8 flex-shrink-0" />
          </div>
        </div>
        <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
          <CardContent className="p-6 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">❌</div>
            <h3 className="text-text-primary mb-2 text-base font-medium text-white">
              {error || 'Nessun allenamento completato trovato'}
            </h3>
            <p className="text-text-secondary mb-4 text-xs line-clamp-2">
              Completa un allenamento per vedere il riepilogo
            </p>
            <Button
              onClick={() => router.push('/home/allenamenti')}
              className="h-9 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-teal-500/30"
            >
              Vai agli Allenamenti
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] flex items-center justify-center px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 mx-auto w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
          <CardContent className="p-6 text-center relative z-10">
            <div className="mb-3 text-5xl">🎉</div>
            <h1 className="text-text-primary mb-2 text-lg font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Allenamento completato!
            </h1>
            <p className="text-text-secondary mb-4 text-sm">
              I tuoi risultati sono stati inviati al tuo personal trainer.
            </p>
            <div className="border-teal-400 mx-auto h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"></div>
            <p className="text-text-tertiary mt-3 text-xs">Reindirizzamento alla home...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-black min-w-[402px] min-h-[874px]" style={{ overflow: 'auto' }}>
      <div className="space-y-4 px-3 py-4">
        {/* Header - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate flex-1 text-center">
              Riepilogo Allenamento
            </h1>
            <div className="w-8 flex-shrink-0" />
          </div>
        </div>

        {/* Card principale */}
        <Card className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-lg shadow-teal-500/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
          <CardContent className="p-4 relative z-10">
            <div className="mb-4 text-center">
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-xl" />
                  <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full p-3">
                    <Trophy className="h-9 w-9 text-teal-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent truncate">
                {summary.workout_title}
              </h2>
              <p className="text-text-secondary text-xs line-clamp-1">
                Completato il {new Date(summary.completed_at).toLocaleString('it-IT')}
              </p>
            </div>

            {/* Statistiche principali - Compatto per 402px */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-teal-500/10 p-3 text-center">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-xl font-bold mb-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    {summary.completed_exercises}/{summary.total_exercises}
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">
                    Esercizi
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-green-500/10 p-3 text-center">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-xl font-bold mb-0.5 text-green-400">
                    {summary.completed_sets}/{summary.total_sets}
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">Set</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-cyan-500/10 p-3 text-center">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-xl font-bold mb-0.5 text-cyan-400">
                    {formatTime(summary.total_time)}
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">
                    Durata
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-teal-500/10 p-3 text-center">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-xl font-bold mb-0.5 text-teal-400">
                    {summary.performance_stats.consistency_score}%
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">
                    Consistenza
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar - Compatto per 402px */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-text-secondary text-xs">Completamento</span>
                <span className="text-text-primary text-xs font-medium">100%</span>
              </div>
              <Progress value={100} className="h-1.5" />
            </div>
            <div className="text-center">
              <Badge variant="success" size="sm" className="rounded-full text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Allenamento completato al 100%! 🎉
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dettagli esercizi */}
        <Card className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-lg shadow-teal-500/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
          <CardHeader className="relative z-10 py-3 border-b border-teal-500/20">
            <CardTitle
              size="md"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent"
            >
              Esercizi eseguiti 💪
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            {summary.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary/50 to-background-secondary/50 border border-teal-500/10 p-3 transition-all duration-200 hover:border-teal-500/20 hover:shadow-md hover:shadow-teal-500/5"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-md" />
                        <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full p-1.5">
                          <span className="text-base">
                            {getMuscleGroupIcon(exercise.exercise.muscle_group)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-text-primary font-semibold mb-0.5 text-sm truncate">
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
                          <span className="text-text-tertiary text-[10px] truncate">
                            {exercise.exercise.equipment || 'N/D'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="success"
                      size="sm"
                      className="rounded-full text-[10px] flex-shrink-0"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Completato
                    </Badge>
                  </div>

                  {/* Set eseguiti - Compatto per 402px */}
                  <div className="space-y-1.5">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="bg-background-secondary/50 flex items-center justify-between rounded-lg border border-teal-500/5 p-2 transition-all duration-200 hover:border-teal-500/10 hover:bg-background-secondary gap-2"
                      >
                        <span className="text-text-secondary text-xs font-medium flex-shrink-0">
                          Set {set.set_number}
                        </span>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          {set.performed_weight > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="bg-teal-500/10 rounded-full p-0.5">
                                <Weight className="text-teal-400 h-3 w-3" />
                              </div>
                              <span className="text-text-primary font-semibold text-xs">
                                {set.performed_weight}kg
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <div className="bg-cyan-500/10 rounded-full p-0.5">
                              <Target className="text-cyan-400 h-3 w-3" />
                            </div>
                            <span className="text-text-primary font-semibold text-xs">
                              {set.performed_reps} reps
                            </span>
                          </div>
                          <Badge variant="success" size="sm" className="rounded-full flex-shrink-0">
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

        {/* Performance stats */}
        <Card className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-lg shadow-teal-500/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
          <CardHeader className="relative z-10 py-3 border-b border-teal-500/20">
            <CardTitle
              size="md"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent"
            >
              Statistiche Performance 📊
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-teal-500/10 p-3 text-center transition-all duration-200 hover:border-teal-500/20 hover:shadow-md hover:shadow-teal-500/5">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="mb-1.5 flex justify-center">
                    <div className="bg-teal-500/10 rounded-full p-1.5">
                      <TrendingUp className="h-4 w-4 text-teal-400" />
                    </div>
                  </div>
                  <div className="text-lg font-bold mb-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    +{summary.performance_stats.average_weight_increase}kg
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">
                    Aumento peso medio
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-cyan-500/10 p-3 text-center transition-all duration-200 hover:border-cyan-500/20 hover:shadow-md hover:shadow-cyan-500/5">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="mb-1.5 flex justify-center">
                    <div className="bg-cyan-500/10 rounded-full p-1.5">
                      <Weight className="h-4 w-4 text-cyan-400" />
                    </div>
                  </div>
                  <div className="text-lg font-bold mb-0.5 text-cyan-400">
                    {summary.performance_stats.total_volume}kg
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">
                    Volume totale
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-green-500/10 p-3 text-center transition-all duration-200 hover:border-green-500/20 hover:shadow-md hover:shadow-green-500/5">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="mb-1.5 flex justify-center">
                    <div className="bg-green-500/10 rounded-full p-1.5">
                      <Activity className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                  <div className="text-lg font-bold mb-0.5 text-green-400">
                    {summary.performance_stats.consistency_score}%
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">
                    Consistenza
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background-tertiary to-background-secondary border border-orange-500/10 p-3 text-center transition-all duration-200 hover:border-orange-500/20 hover:shadow-md hover:shadow-orange-500/5">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="mb-1.5 flex justify-center">
                    <div className="bg-orange-500/10 rounded-full p-1.5">
                      <Trophy className="h-4 w-4 text-orange-400" />
                    </div>
                  </div>
                  <div className="text-lg font-bold mb-0.5 text-orange-400">
                    {summary.performance_stats.personal_records}
                  </div>
                  <div className="text-text-secondary text-[10px] uppercase tracking-wide">
                    Nuovi PR
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational message */}
        <Card className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-lg shadow-teal-500/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
          <CardContent className="p-4 text-center relative z-10">
            <div className="mb-3 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-xl" />
                <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full p-2.5">
                  <span className="text-2xl">💪</span>
                </div>
              </div>
            </div>
            <h3 className="text-base font-semibold mb-1.5 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Ottimo lavoro!
            </h3>
            <p className="text-text-secondary mb-3 text-xs line-clamp-2">
              Hai completato tutti gli esercizi con successo. Continua così per raggiungere i tuoi
              obiettivi!
            </p>
            <div className="text-text-tertiary text-[10px] italic border-t border-teal-500/10 pt-3">
              &ldquo;Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno.&rdquo;
            </div>
          </CardContent>
        </Card>

        {/* Azioni - Design Moderno e Uniforme */}
        <div className="space-y-2.5">
          <Button
            onClick={handleSubmitToPT}
            disabled={isSubmitting}
            className="w-full h-10 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30"
          >
            {isSubmitting ? (
              <>
                <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
            className="w-full h-9 text-xs border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
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
        <div
          className="bg-black min-w-[402px] min-h-[874px] space-y-3 px-3 py-4"
          style={{ overflow: 'auto' }}
        >
          <div className="animate-pulse space-y-3">
            <div className="bg-background-tertiary h-6 w-40 rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background-tertiary h-28 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <RiepilogoPageContent />
    </Suspense>
  )
}
