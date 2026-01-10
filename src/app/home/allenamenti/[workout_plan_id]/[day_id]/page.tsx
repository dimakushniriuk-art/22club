'use client'

// Config route dinamica: force-dynamic per dati real-time
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui'
import { ArrowLeft, Target, Activity, Info } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import type { Tables } from '@/types/supabase'

const logger = createLogger('app:home:allenamenti:workout-day:page')

type Exercise = Pick<
  Tables<'workout_day_exercises'>,
  'id' | 'target_sets' | 'target_reps' | 'target_weight' | 'rest_timer_sec' | 'order_index' | 'note'
> & {
  exercise?: Pick<
    Tables<'exercises'>,
    'id' | 'name' | 'muscle_group' | 'difficulty' | 'image_url' | 'thumb_url' | 'video_url' | 'description'
  > | null
}

type WorkoutDay = Pick<
  Tables<'workout_days'>,
  'id' | 'day_number' | 'day_name' | 'title' | 'description'
>

export default function WorkoutDayExercisesPage() {
  const router = useRouter()
  // Estrai immediatamente i valori per evitare enumerazione di params (Next.js 15.5.9+)
  // Non memorizzare l'oggetto params per evitare enumerazione durante la serializzazione di React DevTools
  // Accedi direttamente alle proprietà senza memorizzare l'oggetto
  const params = useParams()
  const workoutPlanId = String(params?.workout_plan_id || '')
  const dayId = String(params?.day_id || '')
  const { user } = useAuth()
  const supabase = useSupabaseClient()

  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExerciseDescription, setSelectedExerciseDescription] = useState<{
    name: string
    description: string
  } | null>(null)

  // Type guard per user
  const isValidUser = user && isValidProfile(user)
  const athleteProfileId = isValidUser && isValidUUID(user.id) ? user.id : null

  const loadWorkoutDayExercises = useCallback(async () => {
    if (!athleteProfileId || !workoutPlanId || !dayId) return

    try {
      setLoading(true)
      setError(null)

      // Verifica che il workout plan appartenga all'atleta
      const { data: planCheck, error: planCheckError } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('id', workoutPlanId)
        .eq('athlete_id', athleteProfileId)
        .single()

      if (planCheckError || !planCheck) {
        logger.error('Workout plan non trovato o non autorizzato', planCheckError, {
          workoutPlanId,
          athleteProfileId,
        })
        setError('Scheda non trovata')
        notifyError('Errore', 'Scheda non trovata o non autorizzata')
        setLoading(false)
        return
      }

      // Carica giorno di allenamento
      const { data: dayData, error: dayError } = await supabase
        .from('workout_days')
        .select('id, day_number, day_name, title, description')
        .eq('id', dayId)
        .eq('workout_plan_id', workoutPlanId)
        .single()

      if (dayError || !dayData) {
        logger.error('Errore caricamento workout day', dayError, { dayId, workoutPlanId })
        setError('Giorno di allenamento non trovato')
        notifyError('Errore', 'Impossibile caricare il giorno di allenamento')
        setLoading(false)
        return
      }

      setWorkoutDay(dayData)

      // Carica esercizi del giorno
      type WorkoutDayExerciseRow = Pick<
        Tables<'workout_day_exercises'>,
        | 'id'
        | 'target_sets'
        | 'target_reps'
        | 'target_weight'
        | 'rest_timer_sec'
        | 'order_index'
        | 'exercise_id'
        | 'note'
      >
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_day_exercises')
        .select(
          'id, target_sets, target_reps, target_weight, rest_timer_sec, order_index, exercise_id, note',
        )
        .eq('workout_day_id', dayId)
        .order('order_index', { ascending: true })
        .returns<WorkoutDayExerciseRow[]>()

      if (exercisesError) {
        logger.error('Errore caricamento esercizi', exercisesError, { dayId })
        setError('Errore nel caricamento degli esercizi')
        notifyError('Errore', 'Impossibile caricare gli esercizi')
        setLoading(false)
        return
      }

      // Carica dettagli esercizi
      const exerciseIds = (exercisesData || [])
        .map((ex) => ex.exercise_id)
        .filter((id): id is string => id !== null)

      let exercisesMap = new Map<
        string,
        Pick<
          Tables<'exercises'>,
          'id' | 'name' | 'muscle_group' | 'difficulty' | 'image_url' | 'thumb_url' | 'video_url' | 'description'
        >
      >()

      if (exerciseIds.length > 0) {
        type ExerciseDetail = Pick<
          Tables<'exercises'>,
          'id' | 'name' | 'muscle_group' | 'difficulty' | 'image_url' | 'thumb_url' | 'video_url' | 'description'
        >
        const { data: exercisesDetails, error: exercisesDetailsError } = await supabase
          .from('exercises')
          .select('id, name, muscle_group, difficulty, image_url, thumb_url, video_url, description')
          .in('id', exerciseIds)
          .returns<ExerciseDetail[]>()

        if (!exercisesDetailsError && exercisesDetails) {
          exercisesMap = new Map<string, ExerciseDetail>(exercisesDetails.map((ex) => [ex.id, ex]))
        }
      }

      // Combina dati
      const exercisesWithDetails: Exercise[] = (exercisesData || []).map((ex) => ({
        id: ex.id,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight,
        rest_timer_sec: ex.rest_timer_sec,
        order_index: ex.order_index,
        note: ex.note || null,
        exercise: ex.exercise_id ? exercisesMap.get(ex.exercise_id) || null : null,
      }))

      setExercises(exercisesWithDetails)
      setLoading(false)
    } catch (err) {
      logger.error('Errore caricamento dati', err, { workoutPlanId, dayId, athleteProfileId })
      setError('Errore nel caricamento dei dati')
      notifyError('Errore', 'Impossibile caricare i dati')
      setLoading(false)
    }
  }, [athleteProfileId, workoutPlanId, dayId, supabase])

  useEffect(() => {
    // Il layout gestisce già l'autenticazione, quindi possiamo assumere che user sia valido
    // Non aspettare authLoading - carica i dati immediatamente se abbiamo i parametri
    if (athleteProfileId && workoutPlanId && dayId) {
      loadWorkoutDayExercises()
      return undefined
    }
    if (!athleteProfileId) {
      // Se non c'è profileId dopo un breve delay, mostra errore (potrebbe essere ancora in caricamento)
      const timer = setTimeout(() => {
        if (!athleteProfileId) {
          setError('Utente non autenticato')
          setLoading(false)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [athleteProfileId, workoutPlanId, dayId, loadWorkoutDayExercises])

  const handleExerciseClick = (exerciseId: string) => {
    // Naviga alla pagina dell'esercizio con i parametri corretti
    router.push(
      `/home/allenamenti/oggi?workout_plan_id=${workoutPlanId}&workout_day_id=${dayId}&exercise_id=${exerciseId}`,
    )
  }

  // Mostra loading solo per i dati, non per auth (layout gestisce auth)
  if (loading) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 bg-background-tertiary rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-background-tertiary rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !workoutDay) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] flex items-center justify-center px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
          <CardContent className="p-6 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">⚠️</div>
            <p className="text-text-primary mb-4 text-white text-sm font-medium">
              {error || 'Giorno non trovato'}
            </p>
            <Button
              onClick={() => router.back()}
              className="h-9 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
            >
              Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <div className="flex-1 min-w-0">
            <h1 className="text-text-primary mb-0.5 text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              {workoutDay.day_name || workoutDay.title || `Giorno ${workoutDay.day_number}`}
            </h1>
            {workoutDay.description && (
              <p className="text-text-secondary text-xs line-clamp-1">{workoutDay.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Esercizi - Design Moderno e Uniforme */}
      {exercises.length === 0 ? (
        <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="p-5 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">💪</div>
            <p className="text-text-secondary text-sm font-medium">Nessun esercizio configurato</p>
            <p className="text-text-tertiary text-xs mt-1.5">
              Questo giorno non ha esercizi configurati
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {exercises.map((exercise, index) => (
            <Card
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise.id)}
              className="group relative overflow-hidden cursor-pointer border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-cyan-500/20 z-10" />
              <CardContent className="p-3 relative z-20">
                {/* Badge numerico in alto a destra */}
                <Badge
                  variant="primary"
                  size="sm"
                  className="absolute top-2 right-2 shadow-md shadow-teal-500/20 pointer-events-none text-[10px] z-30"
                >
                  #{index + 1}
                </Badge>

                <div className="flex items-center gap-3 pr-8">
                  {/* Illustrazione anatomica a sinistra */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-teal-500/20 bg-gradient-to-br from-background-tertiary/50 to-background-secondary/50">
                    {exercise.exercise?.video_url ? (
                      <video
                        src={exercise.exercise.video_url}
                        className="h-full w-full object-cover rounded-lg"
                        poster={exercise.exercise.thumb_url || exercise.exercise.image_url || undefined}
                        preload="metadata"
                        muted
                        playsInline
                        onMouseEnter={(e) => {
                          const video = e.currentTarget
                          video.play().catch(() => {
                            // Ignora errori di autoplay
                          })
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget
                          video.pause()
                          video.currentTime = 0
                        }}
                        onError={() => {
                          // In caso di errore, verrà mostrato il fallback
                        }}
                      />
                    ) : exercise.exercise?.thumb_url || exercise.exercise?.image_url ? (
                      <Image
                        src={exercise.exercise.thumb_url || exercise.exercise.image_url || ''}
                        alt={exercise.exercise?.name || `Esercizio ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={(exercise.exercise.thumb_url || exercise.exercise.image_url || '').startsWith('http')}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                        <Activity className="h-10 w-10 text-teal-300/50" />
                      </div>
                    )}
                  </div>

                  {/* Contenuto testo a destra */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-text-primary font-semibold text-sm text-white truncate flex-1">
                          {exercise.exercise?.name || `Esercizio ${index + 1}`}
                        </h3>
                        {exercise.exercise?.description && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 flex-shrink-0 text-teal-300 hover:text-teal-200 hover:bg-teal-500/10 rounded-full p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedExerciseDescription({
                                name: exercise.exercise?.name || `Esercizio ${index + 1}`,
                                description: exercise.exercise?.description || '',
                              })
                            }}
                            aria-label="Mostra descrizione esercizio"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {exercise.exercise?.muscle_group && (
                        <p className="text-text-secondary text-xs mt-0.5 truncate">
                          {exercise.exercise.muscle_group}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-teal-300">
                      {exercise.target_sets && exercise.target_reps && exercise.rest_timer_sec && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 flex-shrink-0" />
                          <span>
                            {exercise.target_sets} serie {exercise.target_reps} rip{' '}
                            {exercise.rest_timer_sec}s
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Nota esercizio */}
                    {exercise.note && (
                      <div className="mt-2 pt-2 border-t border-teal-500/20">
                        <div className="text-text-secondary text-[10px] font-medium uppercase tracking-wider mb-1">
                          Note
                        </div>
                        <p className="text-text-primary text-xs leading-relaxed whitespace-pre-wrap break-words">
                          {exercise.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog per descrizione esercizio */}
      <Dialog
        open={selectedExerciseDescription !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedExerciseDescription(null)
          }
        }}
      >
        <DialogContent className="relative max-w-md overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-border shadow-lg backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary text-lg font-bold flex items-center gap-2">
              <Info className="h-5 w-5 text-teal-400" />
              {selectedExerciseDescription?.name || 'Descrizione Esercizio'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-sm mt-3 whitespace-pre-wrap break-words leading-relaxed">
              {selectedExerciseDescription?.description || 'Nessuna descrizione disponibile.'}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
