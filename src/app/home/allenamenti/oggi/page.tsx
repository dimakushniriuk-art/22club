'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui'
import { RestTimer } from '@/components/workout/rest-timer'
import { TrainerSessionModal } from '@/components/workout/trainer-session-modal'
import { ArrowLeft, Check, Target, Dumbbell, Edit2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useWorkoutSession } from '@/hooks/workouts/use-workout-session'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import type { WorkoutSession, WorkoutSetData } from '@/types/workout'
import type { Tables } from '@/types/supabase'

const logger = createLogger('app:home:allenamenti:oggi:page')

// Componente per visualizzare video/immagine esercizio con gestione errori
function ExerciseMediaDisplay({
  exercise,
  videoUrl,
  thumbUrl,
  isValidVideoUrl,
  isValidThumbUrl,
}: {
  exercise: Record<string, unknown>
  videoUrl?: string
  thumbUrl?: string
  isValidVideoUrl: boolean
  isValidThumbUrl: boolean
}) {
  const [videoError, setVideoError] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Log per debug
  useEffect(() => {
    console.log('📹 ExerciseMediaDisplay - Stato media:', {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      videoUrl: videoUrl,
      thumbUrl: thumbUrl,
      isValidVideoUrl,
      isValidThumbUrl,
      videoError,
      imageError,
      shouldShowVideo: isValidVideoUrl && videoUrl && !videoError,
      shouldShowImage:
        !(isValidVideoUrl && videoUrl && !videoError) && isValidThumbUrl && thumbUrl && !imageError,
    })
  }, [
    exercise.id,
    exercise.name,
    videoUrl,
    thumbUrl,
    isValidVideoUrl,
    isValidThumbUrl,
    videoError,
    imageError,
  ])

  // Se c'è un errore video ma abbiamo una thumbnail valida, mostra l'immagine
  const shouldShowVideo = isValidVideoUrl && videoUrl && !videoError
  const shouldShowImage = !shouldShowVideo && isValidThumbUrl && thumbUrl && !imageError

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-background-tertiary to-background-secondary border border-teal-500/20">
      {shouldShowVideo ? (
        <video
          key={videoUrl}
          className="h-full w-full object-cover"
          src={videoUrl}
          poster={isValidThumbUrl && thumbUrl ? thumbUrl : undefined}
          muted
          loop
          playsInline
          preload="auto"
          autoPlay
          onError={(ev) => {
            const videoElement = ev.currentTarget as HTMLVideoElement
            const error = videoElement.error
            
            // Costruisci errorDetails con valori sicuri e serializzabili
            const errorDetails: Record<string, unknown> = {
              exerciseId: exercise?.id ?? 'unknown',
              exerciseName: (exercise?.name as string) ?? 'unknown',
              videoUrl: videoUrl ?? 'unknown',
              networkState: videoElement.networkState ?? -1,
              readyState: videoElement.readyState ?? -1,
            }

            // Aggiungi informazioni sull'errore se disponibili
            if (error) {
              errorDetails.errorCode = error.code ?? null
              errorDetails.errorMessage = error.message ?? 'Errore sconosciuto'
              
              // Codici errore HTMLMediaElement
              const errorCodeMap: Record<number, string> = {
                1: 'MEDIA_ERR_ABORTED - Caricamento interrotto',
                2: 'MEDIA_ERR_NETWORK - Errore di rete',
                3: 'MEDIA_ERR_DECODE - Errore di decodifica',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Formato non supportato',
              }
              errorDetails.errorCodeDescription = errorCodeMap[error.code] ?? `Codice sconosciuto: ${error.code}`
            } else {
              errorDetails.errorMessage = 'Errore video senza dettagli disponibili'
            }

            // Log solo in sviluppo per evitare spam in produzione
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ Errore caricamento video:', errorDetails)
            }
            
            logger.warn('Errore caricamento video esercizio', undefined, errorDetails)
            setVideoError(true)
          }}
          onLoadedMetadata={(ev) => {
            const videoElement = ev.currentTarget as HTMLVideoElement
            videoElement.playbackRate = 1.1 // Velocizza del 10%
            console.log('✅ Video metadata caricato correttamente:', {
              exerciseId: exercise.id,
              videoUrl: videoUrl,
            })
            logger.debug('Video metadata caricato', {
              exerciseId: exercise.id,
              videoUrl: videoUrl,
            })
          }}
          onCanPlay={(ev) => {
            const videoElement = ev.currentTarget as HTMLVideoElement
            videoElement.playbackRate = 1.1 // Velocizza del 10%
            console.log('▶️ Video pronto per la riproduzione:', {
              exerciseId: exercise.id,
              videoUrl: videoUrl,
            })
          }}
        />
      ) : shouldShowImage ? (
        <Image
          key={thumbUrl}
          src={thumbUrl}
          alt={(exercise.name as string) || 'Esercizio'}
          fill
          className="object-cover"
          unoptimized={thumbUrl.startsWith('http')}
          onError={() => {
            logger.warn('Errore caricamento immagine esercizio', undefined, {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              thumbUrl: thumbUrl,
            })
            setImageError(true)
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background-tertiary via-background-secondary to-background-tertiary">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-teal-500/20 text-teal-400 rounded-full p-3">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div className="text-white text-xs font-medium">Nessun media disponibile</div>
          </div>
        </div>
      )}
    </div>
  )
}

function AllenamentiOggiPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // user.id da useAuth() è già profiles.id, usiamolo direttamente
  // useWorkoutSession usa athlete_id che è FK a profiles.id
  const athleteProfileId = isValidUser && isValidUUID(user.id) ? user.id : null

  // Recupera parametri dalla query string
  const workoutPlanId = searchParams?.get('workout_plan_id')
  const workoutDayId = searchParams?.get('workout_day_id')
  const exerciseId = searchParams?.get('exercise_id')

  // Recupera workout session reale dal database
  const { currentWorkout, fetchCurrentWorkout } = useWorkoutSession()
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [showTrainerModal, setShowTrainerModal] = useState(false)
  const [inlineTimerSeconds, setInlineTimerSeconds] = useState<number | null>(null)
  const [inlineTimerRunning, setInlineTimerRunning] = useState(false)
  const [inlineExecutionTimerSeconds, setInlineExecutionTimerSeconds] = useState<number | null>(null)
  const [inlineExecutionTimerRunning, setInlineExecutionTimerRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completingWorkout, setCompletingWorkout] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExerciseDescription, setSelectedExerciseDescription] = useState<{
    name: string
    description: string
  } | null>(null)
  // Stato per tracciare quali set sono in modalità modifica (chiave: exerciseId-setNumber)
  const [editingSets, setEditingSets] = useState<Set<string>>(new Set())

  // Carica workout session quando user è disponibile
  useEffect(() => {
    if (!authLoading && athleteProfileId) {
      setLoading(true)
      setError(null)

      // Se c'è un workout_plan_id nella query, carica quella scheda specifica
      if (workoutPlanId) {
        logger.debug('Caricamento scheda specifica', {
          athleteProfileId,
          workoutPlanId,
          workoutDayId,
        })
        fetchCurrentWorkout(athleteProfileId, workoutPlanId, workoutDayId || undefined)
          .then(() => {
            logger.debug('Scheda caricata con successo', {
              athleteProfileId,
              workoutPlanId,
              workoutDayId,
            })
            setLoading(false)
          })
          .catch((err) => {
            logger.error('Errore caricamento workout session da scheda', err, {
              athleteProfileId,
              workoutPlanId,
            })
            setError(
              `Errore nel caricamento della scheda: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`,
            )
            notifyError(
              'Errore',
              'Impossibile caricare la scheda di allenamento. Verifica che la scheda abbia esercizi configurati.',
            )
            setLoading(false)
          })
      } else {
        // Altrimenti carica il workout corrente
        fetchCurrentWorkout(athleteProfileId)
          .then(() => {
            setLoading(false)
          })
          .catch((err) => {
            logger.error('Errore caricamento workout session', err, { athleteProfileId })
            setError('Errore nel caricamento della sessione di allenamento')
            notifyError('Errore', 'Impossibile caricare la sessione di allenamento')
            setLoading(false)
          })
      }
    } else if (!authLoading && !athleteProfileId) {
      setLoading(false)
      setError('Utente non autenticato')
    }
  }, [authLoading, athleteProfileId, fetchCurrentWorkout, workoutPlanId, workoutDayId])

  // Aggiorna workoutSession quando currentWorkout cambia e imposta esercizio corrente se specificato
  useEffect(() => {
    if (currentWorkout) {
      setWorkoutSession(currentWorkout)

      // Se è specificato un exercise_id, trova l'indice dell'esercizio
      if (exerciseId && currentWorkout.exercises && currentWorkout.exercises.length > 0) {
        const exerciseIndex = currentWorkout.exercises.findIndex(
          (ex) => (ex as { id?: string }).id === exerciseId,
        )
        if (exerciseIndex >= 0) {
          setCurrentExerciseIndex(exerciseIndex)
        }
      } else if (workoutDayId && currentWorkout.exercises && currentWorkout.exercises.length > 0) {
        // Se è specificato workout_day_id, assicuriamoci che il giorno corrisponda
        // (questo è già gestito da fetchCurrentWorkout, ma verifichiamo comunque)
        if (currentWorkout.workout_day_id !== workoutDayId) {
          logger.warn('workout_day_id non corrisponde', {
            expected: workoutDayId,
            actual: currentWorkout.workout_day_id,
          })
        }
      }
    } else if (!loading && !authLoading) {
      // Nessun workout disponibile
      setWorkoutSession(null)
    }
  }, [currentWorkout, loading, authLoading, exerciseId, workoutDayId])

  const currentExercise = workoutSession?.exercises?.[currentExerciseIndex]

  // Calcola dinamicamente gli esercizi completati
  const completedExercisesCount =
    workoutSession?.exercises?.filter(
      (ex) => (ex as { is_completed?: boolean }).is_completed === true,
    ).length || 0
  const totalExercisesCount = workoutSession?.exercises?.length || 0
  const isWorkoutComplete =
    completedExercisesCount > 0 && completedExercisesCount === totalExercisesCount

  // Reset quando cambia l'esercizio (video rimosso)
  useEffect(() => {
    // Reset timer inline quando cambia l'esercizio
    setInlineTimerSeconds(null)
    setInlineTimerRunning(false)
  }, [currentExerciseIndex])

  const updateSet = (exerciseId: string, setNumber: number, updates: Partial<WorkoutSetData>) => {
    setWorkoutSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises:
          prev.exercises?.map((ex) =>
            ex.id === exerciseId
              ? {
                  ...ex,
                  sets: (ex.sets as Record<string, unknown>[]).map(
                    (set: Record<string, unknown>) =>
                      set.set_number === setNumber ? { ...set, ...updates } : set,
                  ),
                }
              : ex,
          ) || [],
      }
    })
  }

  const toggleSetEditMode = (exerciseId: string, setNumber: number) => {
    const key = `${exerciseId}-${setNumber}`
    setEditingSets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const isSetEditing = (exerciseId: string, setNumber: number): boolean => {
    return editingSets.has(`${exerciseId}-${setNumber}`)
  }

  const completeExercise = (exerciseId: string) => {
    setWorkoutSession((prev) => {
      if (!prev) return prev

      const exercises =
        prev.exercises?.map((ex) => {
          if (ex.id === exerciseId) {
            const currentStatus = (ex as { is_completed?: boolean }).is_completed || false
            return { ...ex, is_completed: !currentStatus }
          }
          return ex
        }) || []

      // Calcola dinamicamente gli esercizi completati
      const completedCount = exercises.filter(
        (ex) => (ex as { is_completed?: boolean }).is_completed === true,
      ).length

      return {
        ...prev,
        exercises,
        completed_exercises: completedCount,
        progress_percentage: Math.round((completedCount / (prev.total_exercises || 1)) * 100),
      }
    })
  }

  const handleRestTimerComplete = () => {
    setShowRestTimer(false)
    
    // Controlla se l'esercizio ha execution_time_sec e mostra il timer di esecuzione
    if (currentExercise) {
      const sets = (currentExercise.sets as Record<string, unknown>[]) || []
      const currentSetIndex = sets.findIndex((s) => !s.completed)
      const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
      
      // Verifica se c'è execution_time_sec nel set o nell'esercizio
      const executionTime =
        ((activeSet?.execution_time_sec ?? currentExercise.execution_time_sec ?? null) as
          | number
          | null) ?? null
      
              // Mostra il timer di esecuzione inline solo se execution_time_sec è presente e > 0
              // Mantieni il timer di recupero visibile (a 0 = completato) e mostra anche il timer di esecuzione
              if (executionTime !== null && executionTime > 0) {
                // NON resettare il timer di recupero - mantienilo a 0 (completato) per mostrare entrambi i timer
                // In questo modo entrambi i timer saranno visibili uno accanto all'altro
                setInlineExecutionTimerSeconds(executionTime)
                setInlineExecutionTimerRunning(true)
              }
    }
  }

  const toggleInlineExecutionTimer = () => {
    if (currentExercise) {
      // Se il timer è già in esecuzione, resettalo invece di metterlo in pausa (stessa logica del timer di recupero)
      if (inlineExecutionTimerRunning && inlineExecutionTimerSeconds !== null) {
        resetInlineExecutionTimer()
        return
      }

      // Se il timer è a 0 (completato), resettalo (stessa logica del timer di recupero)
      if (inlineExecutionTimerSeconds === 0) {
        resetInlineExecutionTimer()
        return
      }

      // Se il timer non è ancora stato avviato, avvialo
      if (inlineExecutionTimerSeconds === null) {
        const sets = (currentExercise.sets as Record<string, unknown>[]) || []
        const currentSetIndex = sets.findIndex((s) => !s.completed)
        const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
        const executionTime =
          ((activeSet?.execution_time_sec ?? currentExercise.execution_time_sec ?? null) as
            | number
            | null) ?? null
        
        if (executionTime !== null && executionTime > 0) {
          setInlineExecutionTimerSeconds(executionTime)
          setInlineExecutionTimerRunning(true)
        }
      } else {
        // Se il timer esiste ma non è in esecuzione, riavvialo (stessa logica del timer di recupero)
        setInlineExecutionTimerRunning((prev) => !prev)
      }
    }
  }

  const resetInlineExecutionTimer = () => {
    setInlineExecutionTimerSeconds(null)
    setInlineExecutionTimerRunning(false)
  }

  // Gestione timer inline circolare
  const toggleInlineTimer = () => {
    if (currentExercise) {
      // Se il timer è già in esecuzione, resettalo invece di metterlo in pausa
      if (inlineTimerRunning && inlineTimerSeconds !== null) {
        resetInlineTimer()
        return
      }

      const sets = (currentExercise.sets as Record<string, unknown>[]) || []
      const currentSetIndex = sets.findIndex((s) => !s.completed)
      const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
      // Usa la stessa logica della colonna "RECUPERO (SEC)" nella tabella: set.rest_timer_sec ?? currentExercise.rest_timer_sec ?? 0
      // Questo garantisce che il timer usi esattamente il valore mostrato nella colonna della tabella per il set corrente
      const timerValue =
        ((activeSet?.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as number | null) ??
        0
      // Se il valore è 0, usa 60 come default pratico per il timer (0 secondi non ha senso per un timer)
      const finalValue = timerValue > 0 ? timerValue : 60

      if (inlineTimerSeconds === null) {
        setInlineTimerSeconds(finalValue)
        setInlineTimerRunning(true)
      } else {
        setInlineTimerRunning((prev) => !prev)
      }
    }
  }

  const resetInlineTimer = () => {
    setInlineTimerSeconds(null)
    setInlineTimerRunning(false)
  }

  // Effetto per sincronizzare il timer quando cambia il valore rest_timer_sec del set corrente
  useEffect(() => {
    if (workoutSession?.exercises && currentExerciseIndex >= 0 && !inlineTimerRunning) {
      const currentExercise = workoutSession.exercises[currentExerciseIndex] as Record<
        string,
        unknown
      >
      if (currentExercise) {
        const sets = (currentExercise.sets as Record<string, unknown>[]) || []
        const currentSetIndex = sets.findIndex((s) => !s.completed)
        const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
        // Usa la stessa logica della colonna "RECUPERO (SEC)" nella tabella
        const newTimerValue =
          ((activeSet?.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as
            | number
            | null) ?? 0
        const finalValue = newTimerValue > 0 ? newTimerValue : 60

        // Aggiorna il timer solo se è fermo - resetta per usare il nuovo valore
        setInlineTimerSeconds(finalValue)
      }
    }
  }, [workoutSession?.exercises, currentExerciseIndex, inlineTimerRunning])

  // Effetto per il countdown del timer inline
  useEffect(() => {
    if (inlineTimerRunning && inlineTimerSeconds !== null && inlineTimerSeconds > 0) {
      const interval = setInterval(() => {
        setInlineTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setInlineTimerRunning(false)
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200])
            }
            
            // Quando il timer di recupero inline finisce, controlla se c'è execution_time_sec e mostra il timer di esecuzione
            const currentExerciseForTimer = workoutSession?.exercises?.[currentExerciseIndex] as
              | Record<string, unknown>
              | undefined
            if (currentExerciseForTimer) {
              const sets = (currentExerciseForTimer.sets as Record<string, unknown>[]) || []
              const currentSetIndex = sets.findIndex((s) => !s.completed)
              const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
              
              // Verifica se c'è execution_time_sec nel set o nell'esercizio
              const executionTime =
                ((activeSet?.execution_time_sec ?? currentExerciseForTimer.execution_time_sec ?? null) as
                  | number
                  | null) ?? null
              
              // Debug: log per verificare se execution_time_sec è presente
              if (process.env.NODE_ENV === 'development') {
                console.log('Timer recupero completato - Verifica execution_time_sec:', {
                  executionTime,
                  activeSetExecutionTime: activeSet?.execution_time_sec,
                  exerciseExecutionTime: currentExerciseForTimer.execution_time_sec,
                  willShowTimer: executionTime !== null && executionTime > 0,
                })
              }
              
              // Mostra il timer di esecuzione inline solo se execution_time_sec è presente e > 0
              // Mantieni il timer di recupero visibile (a 0 = completato) e mostra anche il timer di esecuzione
              if (executionTime !== null && executionTime > 0) {
                // Mantieni il timer di recupero a 0 (completato) invece di resettarlo a null
                // In questo modo entrambi i timer saranno visibili
                setInlineExecutionTimerSeconds(executionTime)
                setInlineExecutionTimerRunning(true)
              }
            }
            
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
    return undefined
  }, [inlineTimerRunning, inlineTimerSeconds, workoutSession?.exercises, currentExerciseIndex])

  // Effetto per il countdown del timer di esecuzione inline
  useEffect(() => {
    if (inlineExecutionTimerRunning && inlineExecutionTimerSeconds !== null && inlineExecutionTimerSeconds > 0) {
      const interval = setInterval(() => {
        setInlineExecutionTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setInlineExecutionTimerRunning(false)
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200])
            }
            // Mantieni il timer a 0 invece di nasconderlo
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
    return undefined
  }, [inlineExecutionTimerRunning, inlineExecutionTimerSeconds])

  const nextExercise = () => {
    if (workoutSession?.exercises && currentExerciseIndex < workoutSession.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1)
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1)
    }
  }

  const finishWorkout = () => {
    setShowTrainerModal(true)
  }

  const handleTrainerSessionConfirm = async (withTrainer: boolean) => {
    try {
      setCompletingWorkout(true)

      if (!user) {
        throw new Error('Utente non autenticato')
      }

      // Ottieni profilo atleta
      // user.user_id è auth.users.id, necessario per cercare profiles.user_id
      const userId = (user as { user_id?: string })?.user_id
      if (!userId) {
        throw new Error('User ID non disponibile')
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (profileError || !profile) {
        throw new Error('Profilo atleta non trovato')
      }

      type ProfileRow = Pick<Tables<'profiles'>, 'id'>
      const profileTyped = profile as ProfileRow

      // Salva sempre workout_log per tracciare l'allenamento (sia con PT che da solo)
      type WorkoutLogInsert = {
        athlete_id: string
        atleta_id: string
        scheda_id?: string | null
        data: string
        stato: string
        esercizi_completati: number
        esercizi_totali: number
        durata_minuti: number | null
        note: string
      }
      const workoutLogData: WorkoutLogInsert = {
        athlete_id: profileTyped.id,
        atleta_id: profileTyped.id,
        scheda_id: workoutSession?.workout_id || null,
        data: new Date().toISOString().split('T')[0],
        stato: 'completato',
        esercizi_completati: workoutSession?.completed_exercises || 0,
        esercizi_totali: workoutSession?.total_exercises || 0,
        durata_minuti: null, // TODO: calcolare durata se disponibile
        note: withTrainer ? 'Completato con Personal Trainer' : 'Completato da solo',
      }

      const { data: insertedLog, error: logError } = await supabase
        .from('workout_logs')
        .insert(workoutLogData as never)
        .select()
        .single()

      if (logError) {
        logger.error('Errore salvataggio workout_log', logError, { athleteId: profileTyped.id })
        throw new Error("Errore nel salvataggio dell'allenamento completato")
      }

      type WorkoutLogRow = Pick<Tables<'workout_logs'>, 'id'>
      const typedInsertedLog = insertedLog as WorkoutLogRow | null

      // Scala lezione dal lesson_counter solo se completato con PT
      if (withTrainer) {
        type LessonCounter = Pick<Tables<'lesson_counters'>, 'count' | 'id'>
        const { data: counter, error: counterError } = await supabase
          .from('lesson_counters')
          .select('count, id')
          .eq('athlete_id', profileTyped.id)
          .maybeSingle()

        if (counterError) {
          logger.error('Errore recupero counter', counterError, { athleteId: profileTyped.id })
        } else if (counter) {
          const counterTyped = counter as LessonCounter
          if (counterTyped.count && counterTyped.count > 0) {
            // Decrementa le lezioni rimanenti
            type LessonCounterUpdate = { count: number; updated_at: string }
            const updateData: LessonCounterUpdate = {
              count: Math.max(0, counterTyped.count - 1),
              updated_at: new Date().toISOString(),
            }
            const { error: updateError } = await supabase
              .from('lesson_counters')
              .update(updateData as never)
              .eq('athlete_id', profileTyped.id)

            if (updateError) {
              logger.error('Errore aggiornamento counter', updateError, {
                athleteId: profileTyped.id,
              })
              addToast({
                title: 'Attenzione',
                message:
                  "Allenamento completato ma errore nell'aggiornamento delle lezioni rimanenti",
                variant: 'error',
              })
            } else {
              addToast({
                title: 'Successo',
                message: 'Allenamento completato! Lezione scalata dal pacchetto.',
                variant: 'success',
              })
            }
          }
        } else {
          addToast({
            title: 'Attenzione',
            message: 'Nessuna lezione disponibile nel pacchetto',
            variant: 'error',
          })
        }
      } else {
        // Allenamento fatto da solo - non scalare lezioni
        addToast({
          title: 'Successo',
          message: 'Allenamento completato!',
          variant: 'success',
        })
      }

      // Reindirizza alla pagina riepilogo con l'ID del workout_log appena creato
      const workoutLogId = typedInsertedLog?.id
      if (workoutLogId) {
        router.push(`/home/allenamenti/riepilogo?workout_id=${workoutLogId}`)
      } else {
        router.push('/home/allenamenti/riepilogo')
      }
    } catch (err) {
      logger.error('Errore completamento allenamento', err)
      addToast({
        title: 'Errore',
        message: err instanceof Error ? err.message : "Errore nel completamento dell'allenamento",
        variant: 'error',
      })
    } finally {
      setCompletingWorkout(false)
      setShowTrainerModal(false)
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

  // Nessun workout disponibile o scheda senza esercizi
  if (!workoutSession || !workoutSession.exercises || workoutSession.exercises.length === 0) {
    const isSpecificWorkout = !!workoutPlanId
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
              Allenamento
            </h1>
            <div className="w-8 flex-shrink-0" />
          </div>
        </div>
        <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="p-5 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">💪</div>
            <h3 className="text-text-primary mb-2 text-base font-medium text-white">
              {isSpecificWorkout
                ? 'Scheda senza esercizi configurati'
                : 'Nessun allenamento programmato per oggi'}
            </h3>
            <p className="text-text-secondary mb-4 text-xs line-clamp-3">
              {isSpecificWorkout
                ? 'Questa scheda non ha ancora esercizi configurati. Contatta il tuo personal trainer per completare la configurazione.'
                : 'Contatta il tuo personal trainer per ricevere una scheda di allenamento'}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                onClick={() => router.push('/home/allenamenti')}
                className="h-9 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-teal-500/30"
              >
                Vai agli Allenamenti
              </Button>
              {isSpecificWorkout && (
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="h-9 text-sm border-teal-500/50 text-white hover:bg-teal-500/10"
                >
                  Indietro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Errore nel caricamento
  if (error) {
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
              Allenamento di Oggi
            </h1>
            <div className="w-8 flex-shrink-0" />
          </div>
        </div>
        <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
          <CardContent className="p-5 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">❌</div>
            <h3 className="text-text-primary mb-2 text-base font-medium text-white">
              Errore nel caricamento
            </h3>
            <p className="text-text-secondary mb-4 text-xs line-clamp-3">{error}</p>
            <Button
              onClick={() => {
                setError(null)
                if (athleteProfileId) {
                  fetchCurrentWorkout(athleteProfileId)
                }
              }}
              className="h-9 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-teal-500/30"
            >
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-black min-w-[402px] min-h-[874px]" style={{ overflow: 'auto' }}>
      <div className="space-y-3 px-3 py-3">
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
            <h1 className="text-text-primary text-base font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate flex-1 text-center">
              {workoutSession.day_title}
            </h1>
            <div className="w-8 flex-shrink-0" />
          </div>
        </div>

        {/* Esercizio corrente */}
        {currentExercise ? (((): React.ReactElement | null => {
            const exercise = currentExercise.exercise as Record<string, unknown>
            const exerciseVideoUrl = exercise.video_url as string | undefined | null
            const exerciseThumbUrl = exercise.thumb_url as string | undefined | null
            const exerciseNote = currentExercise.note as string | null | undefined

            // Validazione URL video (deve essere una stringa non vuota e valida)
            const isValidVideoUrl: boolean = Boolean(
              exerciseVideoUrl &&
                typeof exerciseVideoUrl === 'string' &&
                exerciseVideoUrl.trim() !== '' &&
                (exerciseVideoUrl.startsWith('http://') || exerciseVideoUrl.startsWith('https://')),
            )

            // Validazione URL thumbnail (deve essere una stringa non vuota)
            const isValidThumbUrl: boolean = Boolean(
              exerciseThumbUrl &&
                typeof exerciseThumbUrl === 'string' &&
                exerciseThumbUrl.trim() !== '',
            )

            // Debug: log temporaneo per verificare i dati
            if (process.env.NODE_ENV === 'development') {
              console.log('Exercise data:', {
                hasVideoUrl: !!exerciseVideoUrl,
                videoUrl: exerciseVideoUrl,
                hasThumbUrl: !!exerciseThumbUrl,
                thumbUrl: exerciseThumbUrl,
                isValidVideoUrl,
                isValidThumbUrl,
                exerciseName: exercise.name,
              })
            }

            // Estrai la condizione per evitare problemi di inferenza tipo
            const shouldShowMedia = Boolean(isValidVideoUrl || isValidThumbUrl)

            return (
              <Card className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-lg shadow-teal-500/10 backdrop-blur-sm">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 border-b border-teal-500/20 py-2.5">
                  <CardTitle size="md" className="text-white flex items-center gap-2 text-sm">
                    <div className="p-1 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                      <Dumbbell className="h-3.5 w-3.5 text-teal-300 flex-shrink-0" />
                    </div>
                    <span className="truncate flex-1">{exercise.name as string}</span>
                    {Boolean(exercise.description) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 flex-shrink-0 text-teal-300 hover:text-teal-200 hover:bg-teal-500/10 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedExerciseDescription({
                            name: (exercise.name as string) || 'Esercizio',
                            description: (exercise.description as string) || '',
                          })
                        }}
                        aria-label="Mostra descrizione esercizio"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-2 pt-2">
                  {/* Video/Immagine esercizio - Componente interno per gestire lo stato */}
                  {shouldShowMedia ? (
                    <div className="-mx-4 sm:-mx-6">
                      <ExerciseMediaDisplay
                        exercise={exercise}
                        videoUrl={exerciseVideoUrl || undefined}
                        thumbUrl={exerciseThumbUrl || undefined}
                        isValidVideoUrl={isValidVideoUrl}
                        isValidThumbUrl={isValidThumbUrl}
                      />
                    </div>
                  ) : null}

                  {/* Nota esercizio - Visualizzata sotto il video */}
                  {exerciseNote ? (
                    <div className="mt-3 pt-3 border-t border-teal-500/20">
                      <div className="text-text-secondary text-[10px] font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <div className="p-0.5 rounded bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                          <Target className="h-2.5 w-2.5 text-teal-300 flex-shrink-0" />
                        </div>
                        <span>Note</span>
                      </div>
                      <p className="text-text-primary text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {exerciseNote}
                      </p>
                    </div>
                  ) : null}

                  {/* Set - Design Moderno e Uniforme */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="p-1 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                        <Target className="h-3 w-3 text-teal-300 flex-shrink-0" />
                      </div>
                      <h4 className="text-text-primary font-semibold text-xs uppercase tracking-wide text-white truncate">
                        Set da eseguire
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      {(() => {
                        const sets = currentExercise.sets as Record<string, unknown>[]

                        // Debug: log dei dati per verificare la struttura
                        if (process.env.NODE_ENV === 'development') {
                          console.log('Current Exercise Data:', {
                            exerciseId: currentExercise.id,
                            target_weight: currentExercise.target_weight,
                            target_reps: currentExercise.target_reps,
                            rest_timer_sec: currentExercise.rest_timer_sec,
                            sets: sets.map((s) => ({
                              set_number: s.set_number,
                              weight_kg: s.weight_kg,
                              reps: s.reps,
                              rest_timer_sec: s.rest_timer_sec,
                            })),
                          })
                        }

                        // Calcola quali colonne mostrare:
                        // - Ripetizioni: sempre mostrata (campo standard per tutti gli esercizi)
                        // - Peso: sempre mostrata (campo standard per tutti gli esercizi)
                        // - Tempo: mostrata solo se almeno un set ha execution_time_sec > 0
                        // - Recupero: sempre mostrata se l'esercizio ha rest_timer_sec (anche se 0, l'utente può inserire)
                        const hasReps = true // Sempre mostrata perché è un campo standard
                        const hasWeight = true // Sempre mostrata perché è un campo standard
                        const hasTime = sets.some(
                          (s) =>
                            (s.execution_time_sec as number | null) !== null &&
                            (s.execution_time_sec as number) > 0,
                        )
                        const hasRest =
                          sets.length > 0 &&
                          (sets.some(
                            (s) =>
                              (s.rest_timer_sec as number | null) !== null &&
                              (s.rest_timer_sec as number) > 0,
                          ) ||
                            ((currentExercise.rest_timer_sec as number | null | undefined) !==
                              null &&
                              (currentExercise.rest_timer_sec as number | null | undefined) !==
                                undefined))

                        const visibleColumns = [
                          {
                            key: 'weight',
                            show: hasWeight,
                            label: 'Peso (kg)',
                            field: 'weight_kg',
                          },
                          { key: 'reps', show: hasReps, label: 'Ripetizioni', field: 'reps' },
                          {
                            key: 'time',
                            show: hasTime,
                            label: 'Tempo (sec)',
                            field: 'execution_time_sec',
                          },
                          {
                            key: 'rest',
                            show: hasRest,
                            label: 'Recupero (sec)',
                            field: 'rest_timer_sec',
                          },
                        ].filter((col) => col.show)

                        const columnCount = visibleColumns.length

                        return (
                          <>
                            {/* Header delle colonne (solo per la prima riga) */}
                            <div
                              className="grid grid-cols-[auto_1fr] gap-2 mb-1"
                              style={{ gridTemplateColumns: '40px 1fr' }}
                            >
                              <div></div>
                              <div
                                className="grid gap-2 md:gap-3"
                                style={{
                                  gridTemplateColumns: `repeat(${columnCount}, minmax(60px, 1fr))`,
                                }}
                              >
                                {visibleColumns.map((col) => (
                                  <div key={col.key} className="text-center">
                                    <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide mb-0.5 whitespace-nowrap truncate">
                                      {col.label}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {sets.map((set: Record<string, unknown>, index: number) => (
                              <div
                                key={index}
                                className={`relative overflow-hidden rounded-lg p-2.5 transition-all duration-200 border ${
                                  set.completed
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : isSetEditing(
                                          currentExercise.id as string,
                                          set.set_number as number,
                                        )
                                      ? 'bg-teal-500/10 border-teal-500/40'
                                      : 'bg-background-tertiary/30 border-teal-500/20'
                                }`}
                              >
                                <div
                                  className="grid grid-cols-[auto_1fr] gap-2"
                                  style={{ gridTemplateColumns: '40px 1fr' }}
                                >
                                  <div
                                    onClick={() =>
                                      !(set.completed as boolean) &&
                                      toggleSetEditMode(
                                        currentExercise.id as string,
                                        set.set_number as number,
                                      )
                                    }
                                    className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center gap-1 font-bold text-xs transition-all duration-200 ${
                                      set.completed
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/50 cursor-not-allowed'
                                        : isSetEditing(
                                              currentExercise.id as string,
                                              set.set_number as number,
                                            )
                                          ? 'bg-gradient-to-br from-teal-500/30 to-cyan-500/30 text-teal-200 border-2 border-teal-400/60 hover:from-teal-500/40 hover:to-cyan-500/40 cursor-pointer shadow-lg shadow-teal-500/30'
                                          : 'bg-background-tertiary/50 text-white border-2 border-teal-500/40 hover:border-teal-400/60 hover:bg-teal-500/15 cursor-pointer hover:shadow-md hover:shadow-teal-500/20'
                                    }`}
                                    title={
                                      set.completed ? 'Set completato' : 'Clicca per modificare'
                                    }
                                  >
                                    {!set.completed && (
                                      <Edit2
                                        className={`h-3 w-3 ${
                                          isSetEditing(
                                            currentExercise.id as string,
                                            set.set_number as number,
                                          )
                                            ? 'text-teal-300'
                                            : 'text-teal-400/70'
                                        }`}
                                      />
                                    )}
                                    <span
                                      className={
                                        isSetEditing(
                                          currentExercise.id as string,
                                          set.set_number as number,
                                        )
                                          ? 'text-teal-300'
                                          : 'text-white'
                                      }
                                    >
                                      {set.set_number as number}
                                    </span>
                                  </div>

                                  <div
                                    className="grid gap-2 md:gap-3"
                                    style={{
                                      gridTemplateColumns: `repeat(${columnCount}, minmax(60px, 1fr))`,
                                    }}
                                  >
                                    {visibleColumns.map((col) => {
                                      // Usa i fallback corretti per ogni campo:
                                      // - rest_timer_sec: da set, poi da exercise
                                      // - reps: da set, poi da exercise.target_reps
                                      // - weight_kg: da set, poi da exercise.target_weight
                                      // - execution_time_sec: solo da set
                                      const value =
                                        col.field === 'rest_timer_sec'
                                          ? (((set[col.field] ??
                                              currentExercise.rest_timer_sec ??
                                              null) as number | null) ?? 0)
                                          : col.field === 'reps'
                                            ? (((set[col.field] ??
                                                currentExercise.target_reps ??
                                                null) as number | null | undefined) ?? 0)
                                            : col.field === 'weight_kg'
                                              ? (((set[col.field] ??
                                                  currentExercise.target_weight ??
                                                  null) as number | null | undefined) ?? 0)
                                              : ((set[col.field] as number | null | undefined) ?? 0)

                                      return (
                                        <div key={col.key} className="text-center">
                                          {isSetEditing(
                                            currentExercise.id as string,
                                            set.set_number as number,
                                          ) &&
                                          !set.completed &&
                                          col.field === 'weight_kg' ? (
                                            <Input
                                              type="number"
                                              value={value || ''}
                                              onChange={(e) => {
                                                const updateData: Record<string, unknown> = {
                                                  weight_kg: Number(e.target.value) || 0,
                                                }
                                                updateSet(
                                                  currentExercise.id as string,
                                                  (set.set_number as number) || 1,
                                                  updateData,
                                                )
                                              }}
                                              className="text-xl font-bold text-white bg-transparent border-0 p-0 h-auto focus:ring-0 text-center w-full opacity-100"
                                              min="0"
                                              placeholder="0"
                                            />
                                          ) : (
                                            <div
                                              className={`text-base font-bold text-white text-center whitespace-nowrap ${
                                                (set.completed as boolean)
                                                  ? 'opacity-70'
                                                  : 'opacity-100'
                                              }`}
                                            >
                                              {col.field === 'rest_timer_sec'
                                                ? (((set.rest_timer_sec ??
                                                    currentExercise.rest_timer_sec ??
                                                    null) as number | null) ?? 0)
                                                : col.field === 'execution_time_sec'
                                                  ? ((set.execution_time_sec as
                                                      | number
                                                      | null
                                                      | undefined) ?? 0)
                                                  : col.field === 'reps'
                                                    ? ((set.reps as number | null | undefined) ??
                                                      (currentExercise.target_reps as
                                                        | number
                                                        | null
                                                        | undefined) ??
                                                      0)
                                                    : col.field === 'weight_kg'
                                                      ? (() => {
                                                          // Prima cerca nel set, poi nell'esercizio
                                                          const setWeight = set.weight_kg as
                                                            | number
                                                            | null
                                                            | undefined
                                                          const exerciseWeight =
                                                            currentExercise.target_weight as
                                                              | number
                                                              | null
                                                              | undefined

                                                          // Se il set ha un peso (anche 0), usalo
                                                          if (
                                                            setWeight !== null &&
                                                            setWeight !== undefined
                                                          ) {
                                                            return setWeight
                                                          }

                                                          // Altrimenti usa il peso target dell'esercizio
                                                          if (
                                                            exerciseWeight !== null &&
                                                            exerciseWeight !== undefined
                                                          ) {
                                                            return exerciseWeight
                                                          }

                                                          // Se non c'è nessun peso, mostra '-'
                                                          return '-'
                                                        })()
                                                      : ((set[col.field] as
                                                          | number
                                                          | null
                                                          | undefined) ?? '-')}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Azioni - Design Moderno e Uniforme */}
                  <div className="space-y-2 pt-2.5">
                    <Button
                      onClick={() => completeExercise(currentExercise.id as string)}
                      variant={(currentExercise.is_completed as boolean) ? 'success' : 'default'}
                      className={
                        (currentExercise.is_completed as boolean)
                          ? 'h-9 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold w-full transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/40'
                          : 'h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold w-full transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40'
                      }
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      {(currentExercise.is_completed as boolean)
                        ? 'Esercizio completato'
                        : 'Completa esercizio'}
                    </Button>
                    {/* Pulsante fine allenamento - Mostra solo quando tutti gli esercizi sono completati */}
                    {workoutSession && isWorkoutComplete && (
                      <Button
                        onClick={finishWorkout}
                        className="h-10 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold w-full transition-all duration-200 shadow-xl shadow-teal-500/40 hover:shadow-teal-500/50 hover:scale-[1.02]"
                      >
                        🎉 Completa allenamento
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })()) : null}

        {/* Timer circolari: recupero ed esecuzione uno accanto all'altro */}
        {/* Mostra sempre il container quando c'è un esercizio corrente */}
        {currentExercise ? (
          <Card className="relative overflow-hidden bg-transparent border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
                {/* Timer Esecuzione - Mostrato sempre se l'esercizio ha execution_time_sec > 0 */}
                {/* TIMER ESECUZIONE PRIMA (sinistra) */}
                {(() => {
                  const sets = (currentExercise?.sets as Record<string, unknown>[]) || []
                  const currentSetIndex = sets.findIndex((s) => !s.completed)
                  const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
                  
                  // Usa execution_time_sec dal set o dall'esercizio
                  const executionTime =
                    ((activeSet?.execution_time_sec ?? currentExercise?.execution_time_sec ?? null) as
                      | number
                      | null) ?? null
                  
                  // Mostra sempre il timer di esecuzione se execution_time_sec è presente e > 0
                  if (executionTime === null || executionTime <= 0) {
                    return null
                  }

                  const initialSeconds = executionTime
                  const currentSeconds = inlineExecutionTimerSeconds !== null ? inlineExecutionTimerSeconds : initialSeconds
                  // Calcola il progresso basato sul tempo rimanente (inverso)
                  // Quando currentSeconds = 0, progress = 0% (cerchio vuoto/completato)
                  const progress = currentSeconds === 0 ? 0 : (currentSeconds / initialSeconds) * 100
                  const circumference = 2 * Math.PI * 80
                  const strokeDashoffset = circumference - (progress / 100) * circumference

                  const formatTime = (totalSeconds: number) => {
                    return totalSeconds.toString()
                  }

                  return (
                    <div key="timer-esecuzione-inline" className="flex flex-col items-center justify-center gap-3">
                      {/* Cerchio animato esecuzione - Colore arancione/quasi rosso */}
                      <div
                        className="relative h-36 w-36 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                        onClick={toggleInlineExecutionTimer}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleInlineExecutionTimer()
                          }
                        }}
                        aria-label={
                          inlineExecutionTimerSeconds === null
                            ? 'Avvia timer esecuzione'
                            : currentSeconds === 0
                              ? 'Timer esecuzione completato'
                              : inlineExecutionTimerRunning
                                ? 'Resetta timer esecuzione'
                                : 'Avvia timer esecuzione'
                        }
                      >
                        <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 200 200">
                          <circle
                            cx="100"
                            cy="100"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="14"
                            fill="none"
                            className="text-background-tertiary/20"
                          />
                          <circle
                            cx="100"
                            cy="100"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="14"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`transition-all duration-1000 ease-linear ${
                              inlineExecutionTimerSeconds === null
                                ? 'text-orange-600/40'
                                : currentSeconds === 0
                                  ? 'text-green-500'
                                  : inlineExecutionTimerRunning
                                    ? 'text-orange-600'
                                    : 'text-orange-600/60'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="text-center space-y-0.5">
                            {inlineExecutionTimerSeconds === null ? (
                              <>
                                <div className="text-4xl font-bold text-white leading-none">
                                  {formatTime(initialSeconds)}
                                </div>
                                <div className="text-[10px] text-orange-600/70 font-medium mt-1 uppercase tracking-wider">
                                  ESECUZIONE
                                </div>
                              </>
                            ) : currentSeconds === 0 ? (
                              <>
                                <div className="text-4xl font-bold text-green-500 leading-none">0</div>
                                <div className="text-[10px] text-green-500/70 font-medium mt-1 uppercase tracking-wider">
                                  Completato
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-4xl font-bold text-white leading-none">
                                  {formatTime(currentSeconds)}
                                </div>
                                <div className="text-[10px] text-orange-600/70 font-medium mt-1 uppercase tracking-wider">
                                  SEC.
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Timer Recupero - DOPO (destra) - SOLO UNO */}
                {(() => {
                  // Controlla se currentExercise esiste
                  if (!currentExercise) {
                    return null
                  }

                  const sets = (currentExercise.sets as Record<string, unknown>[]) || []
                  const currentSetIndex = sets.findIndex((s) => !s.completed)
                  const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
                  const timerValue =
                    ((activeSet?.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as
                      | number
                      | null) ?? 0
                  const initialSeconds = timerValue > 0 ? timerValue : 60
                  const currentSeconds = inlineTimerSeconds !== null ? inlineTimerSeconds : initialSeconds
                  const progress = (currentSeconds / initialSeconds) * 100
                  const circumference = 2 * Math.PI * 80
                  const strokeDashoffset = circumference - (progress / 100) * circumference

                  const formatTime = (totalSeconds: number) => {
                    return totalSeconds.toString()
                  }

                  // Mostra sempre il timer di recupero se l'esercizio ha un valore di recupero > 0
                  // oppure se è già stato avviato (inlineTimerSeconds !== null, anche se è 0 = completato)
                  // Nascondi solo se non c'è né timer di recupero né timer di esecuzione E non c'è un valore di recupero > 0
                  if (timerValue <= 0 && inlineTimerSeconds === null && inlineExecutionTimerSeconds === null) {
                    return null
                  }

                  return (
                    <div key="timer-recupero-unico" className="flex flex-col items-center justify-center gap-3">
                      {/* Cerchio animato recupero */}
                      <div
                        className="relative h-36 w-36 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                        onClick={toggleInlineTimer}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleInlineTimer()
                          }
                        }}
                        aria-label={inlineTimerRunning ? 'Pausa timer recupero' : 'Avvia timer recupero'}
                      >
                        <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 200 200">
                          <circle
                            cx="100"
                            cy="100"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="14"
                            fill="none"
                            className="text-background-tertiary/20"
                          />
                          <circle
                            cx="100"
                            cy="100"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="14"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`transition-all duration-1000 ease-linear ${
                              inlineTimerRunning ? 'text-teal-400' : 'text-teal-400/60'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="text-center space-y-0.5">
                            {inlineTimerSeconds === null ? (
                              <>
                                <div className="text-[10px] font-medium uppercase tracking-wider text-teal-400/70 mb-1">
                                  RECUPERO
                                </div>
                                <div className="text-4xl font-bold text-white leading-none">
                                  {formatTime(initialSeconds)}
                                </div>
                                <div className="text-[10px] text-teal-400/50 font-medium mt-1 uppercase tracking-wider">
                                  Tocca per avviare
                                </div>
                              </>
                            ) : currentSeconds === 0 ? (
                              <>
                                <div className="text-4xl font-bold text-green-500 leading-none">0</div>
                                <div className="text-[10px] text-green-500/70 font-medium mt-1 uppercase tracking-wider">
                                  Completato
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-4xl font-bold text-white leading-none">
                                  {formatTime(currentSeconds)}
                                </div>
                                <div className="text-[10px] text-teal-400/70 font-medium mt-1 uppercase tracking-wider">
                                  SEC.
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Navigazione esercizi - Design Moderno e Uniforme */}
        <Card className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-sm backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="relative z-10 p-3">
            <div className="flex items-center justify-between gap-2">
              <Button
                onClick={previousExercise}
                disabled={currentExerciseIndex === 0}
                variant="outline"
                className="h-9 text-[10px] border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 disabled:opacity-30"
              >
                ← Precedente
              </Button>

              <div className="flex flex-col items-center min-w-0">
                <span className="text-text-secondary text-[10px] uppercase tracking-wider">
                  Esercizio
                </span>
                <span className="text-text-primary font-bold text-sm text-white">
                  {currentExerciseIndex + 1} / {workoutSession.exercises?.length || 0}
                </span>
              </div>

              <Button
                onClick={nextExercise}
                disabled={currentExerciseIndex === (workoutSession.exercises?.length || 0) - 1}
                variant="outline"
                className="h-9 text-[10px] border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 disabled:opacity-30"
              >
                Successivo →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest Timer Modal */}
      {showRestTimer &&
        currentExercise &&
        (() => {
          // Trova il set corrente (il primo non completato o l'ultimo)
          const sets = (currentExercise.sets as Record<string, unknown>[]) || []
          const currentSetIndex = sets.findIndex((s) => !s.completed)
          const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
          // Usa la stessa logica della colonna "RECUPERO (SEC)" nella tabella: set.rest_timer_sec ?? currentExercise.rest_timer_sec ?? 0
          // Questo garantisce che il timer usi esattamente il valore mostrato nella colonna della tabella per il set corrente
          const timerValueFromTable =
            ((activeSet?.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as
              | number
              | null) ?? 0
          // Se il valore è 0, usa 60 come default pratico per il timer (0 secondi non ha senso per un timer)
          const timerValue = timerValueFromTable > 0 ? timerValueFromTable : 60

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ">
              <RestTimer
                initialSeconds={timerValue}
                onComplete={handleRestTimerComplete}
                onNextExercise={() => {
                  setShowRestTimer(false)
                  nextExercise()
                }}
                title="Timer Recupero"
                subtitle="Riposati prima del prossimo esercizio"
                color="default"
              />
            </div>
          )
        })()}

      {/* Trainer Session Modal */}
      <TrainerSessionModal
        open={showTrainerModal}
        onClose={() => !completingWorkout && setShowTrainerModal(false)}
        onConfirm={handleTrainerSessionConfirm}
        loading={completingWorkout}
      />

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

export default function AllenamentiOggiPage() {
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
      <AllenamentiOggiPageContent />
    </Suspense>
  )
}
