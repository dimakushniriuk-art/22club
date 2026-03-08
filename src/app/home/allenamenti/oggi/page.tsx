'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import { RestTimer } from '@/components/workout/rest-timer'
import { TrainerSessionModal } from '@/components/workout/trainer-session-modal'
import { ArrowLeft, Check, Target, Dumbbell, Edit2, Info, Play } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { useWorkoutSession } from '@/hooks/workouts/use-workout-session'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import type { WorkoutSession, WorkoutSetData } from '@/types/workout'
import type { Tables } from '@/types/supabase'

const logger = createLogger('app:home:allenamenti:oggi:page')

/** Suono timer: crea e avvia un tono con Web Audio API (durata in ms, volume 0-1, frequenza Hz) */
function playTimerTone(
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  durationMs: number,
  volume: number,
  frequencyHz = 520,
): void {
  try {
    if (typeof window === 'undefined') return
    const ctx = audioContextRef.current ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (!audioContextRef.current) audioContextRef.current = ctx
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequencyHz
    osc.type = 'sine'
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.02)
    gain.gain.setValueAtTime(volume, now + durationMs / 1000 - 0.05)
    gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000)
    osc.start(now)
    osc.stop(now + durationMs / 1000)
  } catch {
    // Ignora errori (es. autoplay policy)
  }
}

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
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Su mobile l'autoplay può essere bloccato: avvia play() via JS e, se fallisce, mostra overlay Play
  const tryPlay = React.useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.play().then(() => {
      setAutoplayBlocked(false)
    }).catch(() => {
      setAutoplayBlocked(true)
    })
  }, [])

  useEffect(() => {
    if (!videoUrl || !isValidVideoUrl || videoError) return
    setAutoplayBlocked(false)
  }, [videoUrl, isValidVideoUrl, videoError])

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
  // Fallback automatico: se il video fallisce, mostra l'immagine se disponibile
  const shouldShowVideo = isValidVideoUrl && videoUrl && !videoError
  const shouldShowImage =
    (!shouldShowVideo || videoError) && isValidThumbUrl && thumbUrl && !imageError

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-background-tertiary to-background-secondary border border-cyan-500/20">
      {shouldShowVideo ? (
        <>
          <video
            ref={videoRef}
            key={videoUrl}
            className="h-full w-full object-cover"
            src={videoUrl}
            poster={isValidThumbUrl && thumbUrl ? thumbUrl : undefined}
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            autoPlay
            onError={(ev) => {
            const videoElement = ev.currentTarget as HTMLVideoElement
            const error = videoElement.error

            // Costruisci errorDetails con valori sicuri e serializzabili
            // Usa JSON.stringify per assicurare serializzazione corretta
            const errorDetails: Record<string, string | number | null> = {
              exerciseId: String(exercise?.id ?? 'unknown'),
              exerciseName: String((exercise?.name as string) ?? 'unknown'),
              videoUrl: String(videoUrl ?? 'unknown'),
              networkState: videoElement.networkState ?? -1,
              readyState: videoElement.readyState ?? -1,
            }

            // Aggiungi informazioni sull'errore se disponibili
            if (error) {
              errorDetails.errorCode = error.code ?? null
              errorDetails.errorMessage = String(error.message ?? 'Errore sconosciuto')

              // Codici errore HTMLMediaElement
              const errorCodeMap: Record<number, string> = {
                1: 'MEDIA_ERR_ABORTED - Caricamento interrotto',
                2: 'MEDIA_ERR_NETWORK - Errore di rete',
                3: 'MEDIA_ERR_DECODE - Errore di decodifica',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Formato non supportato',
              }
              errorDetails.errorCodeDescription =
                errorCodeMap[error.code] ?? `Codice sconosciuto: ${error.code}`
            } else {
              errorDetails.errorMessage = 'Errore video senza dettagli disponibili'
              errorDetails.errorCode = null
              errorDetails.errorCodeDescription = 'Nessun codice errore disponibile'
            }

            // Aggiungi informazioni aggiuntive per debug
            errorDetails.videoSrc = String(videoElement.src ?? 'N/A')
            errorDetails.videoCurrentSrc = String(videoElement.currentSrc ?? 'N/A')
            errorDetails.videoNetworkState = videoElement.networkState ?? -1
            errorDetails.videoReadyState = videoElement.readyState ?? -1

            // Log solo in sviluppo per evitare spam in produzione
            if (process.env.NODE_ENV === 'development') {
              // Usa JSON.stringify per assicurare che l'oggetto sia serializzato correttamente
              console.error('❌ Errore caricamento video:', JSON.stringify(errorDetails, null, 2))
              console.error('Video element state:', {
                src: videoElement.src,
                currentSrc: videoElement.currentSrc,
                networkState: videoElement.networkState,
                readyState: videoElement.readyState,
                error: error
                  ? {
                      code: error.code,
                      message: error.message,
                    }
                  : null,
              })
            }

            logger.warn('Errore caricamento video esercizio', undefined, errorDetails)
            setVideoError(true)
          }}
          onLoadedMetadata={(ev) => {
            const videoElement = ev.currentTarget as HTMLVideoElement
            videoElement.playbackRate = 1.1 // Velocizza del 10%
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Video metadata caricato correttamente:', { exerciseId: exercise.id, videoUrl })
            }
            logger.debug('Video metadata caricato', { exerciseId: exercise.id, videoUrl })
          }}
          onLoadedData={() => {
            tryPlay()
          }}
          onCanPlay={(ev) => {
            const videoElement = ev.currentTarget as HTMLVideoElement
            videoElement.playbackRate = 1.1 // Velocizza del 10%
            tryPlay()
            if (process.env.NODE_ENV === 'development') {
              console.log('▶️ Video pronto per la riproduzione:', {
                exerciseId: exercise.id,
                videoUrl: videoUrl,
              })
            }
          }}
          />
          {autoplayBlocked && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                tryPlay()
              }}
              className="absolute inset-0 flex items-center justify-center transition-opacity hover:bg-black/30 active:scale-95"
              style={
                isValidThumbUrl && thumbUrl
                  ? { background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${thumbUrl}) center/cover` }
                  : undefined
              }
              aria-label="Riproduci video"
            >
              {(!isValidThumbUrl || !thumbUrl) && <span className="absolute inset-0 bg-black/50" />}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-white shadow-lg">
                <Play className="h-6 w-6 fill-current" />
              </span>
            </button>
          )}
        </>
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
            <div className="bg-cyan-500/20 text-cyan-400 rounded-full p-3">
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
  const supabase = useSupabaseClient()

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
  /** Indice del blocco corrente (singolo esercizio o circuito = 1 blocco) */
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [showTrainerModal, setShowTrainerModal] = useState(false)
  const [inlineTimerSeconds, setInlineTimerSeconds] = useState<number | null>(null)
  const [inlineTimerRunning, setInlineTimerRunning] = useState(false)
  const [inlineExecutionTimerSeconds, setInlineExecutionTimerSeconds] = useState<number | null>(
    null,
  )
  const [inlineExecutionTimerRunning, setInlineExecutionTimerRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completingWorkout, setCompletingWorkout] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExerciseDescription, setSelectedExerciseDescription] = useState<{
    name: string
    description: string
  } | null>(null)
  /** Video circuito in vista ingrandita (click sulla griglia) */
  const [enlargedCircuitVideo, setEnlargedCircuitVideo] = useState<{
    videoUrl: string
    thumbUrl?: string
    name: string
  } | null>(null)
  // Stato per tracciare quali set sono in modalità modifica (chiave: exerciseId-setNumber)
  const [editingSets, setEditingSets] = useState<Set<string>>(new Set())
  /** Timestamp inizio sessione (per calcolo durata_minuti al completamento) */
  const sessionStartedAtRef = React.useRef<number | null>(null)
  /** AudioContext per suoni timer (creato al primo uso dopo gesto utente) */
  const timerAudioContextRef = React.useRef<AudioContext | null>(null)

  // Carica workout session quando user è disponibile
  useEffect(() => {
    let cancelled = false
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
            if (cancelled) return
            logger.debug('Scheda caricata con successo', {
              athleteProfileId,
              workoutPlanId,
              workoutDayId,
            })
            setLoading(false)
          })
          .catch((err) => {
            if (cancelled) return
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
            if (cancelled) return
            setLoading(false)
          })
          .catch((err) => {
            if (cancelled) return
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
    return () => {
      cancelled = true
    }
  }, [authLoading, athleteProfileId, fetchCurrentWorkout, workoutPlanId, workoutDayId])

  // Aggiorna workoutSession quando currentWorkout cambia e imposta esercizio corrente se specificato
  useEffect(() => {
    if (currentWorkout) {
      setWorkoutSession(currentWorkout)
      // Registra inizio sessione una sola volta (per durata_minuti al completamento)
      if (currentWorkout.exercises?.length && sessionStartedAtRef.current == null) {
        sessionStartedAtRef.current = Date.now()
      }

      // Se è specificato un exercise_id, trova il blocco contenente l'esercizio e imposta currentBlockIndex
      if (exerciseId && currentWorkout.exercises && currentWorkout.exercises.length > 0) {
        const exerciseIndex = currentWorkout.exercises.findIndex(
          (ex) => (ex as { id?: string }).id === exerciseId,
        )
        if (exerciseIndex >= 0) {
          const blocksForIndex = (() => {
            const exs = currentWorkout.exercises ?? []
            const out: { startIndex: number; endIndex: number }[] = []
            let i = 0
            while (i < exs.length) {
              const row = exs[i] as Record<string, unknown>
              const blockId = (row?.circuit_block_id as string | null) ?? null
              if (blockId) {
                const start = i
                while (
                  i + 1 < exs.length &&
                  (exs[i + 1] as Record<string, unknown>)?.circuit_block_id === blockId
                )
                  i += 1
                out.push({ startIndex: start, endIndex: i })
                i += 1
              } else {
                out.push({ startIndex: i, endIndex: i })
                i += 1
              }
            }
            return out
          })()
          const blockIndex = blocksForIndex.findIndex(
            (b) => exerciseIndex >= b.startIndex && exerciseIndex <= b.endIndex,
          )
          if (blockIndex >= 0) setCurrentBlockIndex(blockIndex)
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

  /** Blocchi: ogni blocco è un esercizio singolo o un circuito (N esercizi = 1 blocco) */
  const blocks = useMemo(() => {
    const exercises = workoutSession?.exercises ?? []
    const out: { startIndex: number; endIndex: number }[] = []
    let i = 0
    while (i < exercises.length) {
      const row = exercises[i] as Record<string, unknown>
      const blockId = (row?.circuit_block_id as string | null) ?? null
      if (blockId) {
        const start = i
        while (
          i + 1 < exercises.length &&
          (exercises[i + 1] as Record<string, unknown>)?.circuit_block_id === blockId
        )
          i += 1
        out.push({ startIndex: start, endIndex: i })
        i += 1
      } else {
        out.push({ startIndex: i, endIndex: i })
        i += 1
      }
    }
    return out
  }, [workoutSession?.exercises])

  /** Indice esercizio per vista/set: primo esercizio del blocco corrente */
  const currentExerciseIndex = blocks[currentBlockIndex]?.startIndex ?? 0

  /** Allinea currentBlockIndex se fuori range (es. dopo cambio sessione) */
  useEffect(() => {
    if (blocks.length > 0 && currentBlockIndex >= blocks.length) {
      setCurrentBlockIndex(0)
    }
  }, [blocks.length, currentBlockIndex])

  const currentExercise = workoutSession?.exercises?.[currentExerciseIndex]

  // Raggruppa esercizi dello stesso circuito (stesso circuit_block_id) per la vista circuito
  const circuitGroup: Record<string, unknown>[] = (() => {
    const exercises = workoutSession?.exercises ?? []
    const current = currentExercise as Record<string, unknown> | undefined
    const blockId = (current?.circuit_block_id as string | null) ?? null
    if (!blockId || !current) return []
    let start = currentExerciseIndex
    while (
      start > 0 &&
      (exercises[start - 1] as Record<string, unknown>)?.circuit_block_id === blockId
    )
      start -= 1
    let end = currentExerciseIndex
    while (
      end < exercises.length - 1 &&
      (exercises[end + 1] as Record<string, unknown>)?.circuit_block_id === blockId
    )
      end += 1
    return exercises.slice(start, end + 1) as Record<string, unknown>[]
  })()

  // Calcola dinamicamente gli esercizi completati
  const completedExercisesCount =
    workoutSession?.exercises?.filter(
      (ex) => (ex as { is_completed?: boolean }).is_completed === true,
    ).length || 0
  const totalExercisesCount = workoutSession?.exercises?.length || 0
  const isWorkoutComplete =
    completedExercisesCount > 0 && completedExercisesCount === totalExercisesCount

  // Reset quando cambia il blocco (video rimosso)
  useEffect(() => {
    setInlineTimerSeconds(null)
    setInlineTimerRunning(false)
  }, [currentBlockIndex])

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

  const _completeExercise = (exerciseId: string) => {
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

  /** Completa (o toglie completamento) all'intero blocco: singolo esercizio o circuito */
  const completeBlock = (blockIndex: number) => {
    const block = blocks[blockIndex]
    if (!block || !workoutSession?.exercises) return
    const start = block.startIndex
    const end = block.endIndex
    const slice = workoutSession.exercises.slice(start, end + 1) as Record<string, unknown>[]
    const anyIncomplete = slice.some((ex) => !(ex.is_completed as boolean))
    const newStatus = anyIncomplete

    setWorkoutSession((prev) => {
      if (!prev?.exercises) return prev
      const exercises = prev.exercises.map((ex, idx) => {
        if (idx >= start && idx <= end) {
          return { ...ex, is_completed: newStatus }
        }
        return ex
      })
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
        playTimerTone(timerAudioContextRef, 700, 0.5)
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

            // Suoni ultimi 5 secondi: volume crescente; ultimo secondo = suono più prolungato
            // (suoniamo in base al valore prima del decremento, quindi prev 2 = ultimo secondo)
          } else if (prev <= 6) {
            if (prev === 2) {
              playTimerTone(timerAudioContextRef, 500, 0.95)
            } else if (prev === 3) {
              playTimerTone(timerAudioContextRef, 120, 0.8)
            } else if (prev === 4) {
              playTimerTone(timerAudioContextRef, 120, 0.6)
            } else if (prev === 5) {
              playTimerTone(timerAudioContextRef, 120, 0.4)
            } else if (prev === 6) {
              playTimerTone(timerAudioContextRef, 120, 0.25)
            }
          }

          if (prev === null || prev <= 1) {
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
                ((activeSet?.execution_time_sec ??
                  currentExerciseForTimer.execution_time_sec ??
                  null) as number | null) ?? null

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
    if (
      inlineExecutionTimerRunning &&
      inlineExecutionTimerSeconds !== null &&
      inlineExecutionTimerSeconds > 0
    ) {
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
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1)
    }
  }

  const previousExercise = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1)
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

      // Idempotenza: se esiste già un log completato per questa scheda oggi, non risalvare
      const today = new Date().toISOString().split('T')[0]
      let existingQuery = supabase
        .from('workout_logs')
        .select('id')
        .eq('atleta_id', profileTyped.id)
        .eq('data', today)
        .in('stato', ['completato', 'completed'])
        .not('completed_at', 'is', null)
      const workoutId = workoutSession?.workout_id ?? null
      if (workoutId) {
        existingQuery = existingQuery.eq('scheda_id', workoutId)
      } else {
        existingQuery = existingQuery.is('scheda_id', null)
      }
      const { data: existingCompleted } = await existingQuery.limit(1).maybeSingle()
      if (existingCompleted?.id) {
        addToast({
          title: 'Già completato',
          message: "L'allenamento di oggi risulta già completato.",
          variant: 'info',
        })
        setShowTrainerModal(false)
        return
      }

      // Trainer assegnato (profiles.id) per coached_by_profile_id se "Con trainer"
      let coachedByProfileId: string | null = null
      if (withTrainer) {
        const { data: trainerRow } = await supabase.rpc('get_my_trainer_profile')
        const row =
          Array.isArray(trainerRow) && trainerRow[0] ? (trainerRow[0] as { pt_id?: string }) : null
        coachedByProfileId = row?.pt_id ?? null
      }

      // Persistenza set su Supabase (reps, peso, completed_at) in parallelo
      const now = new Date().toISOString()
      const setPromises: Promise<{ error: unknown }>[] = []
      type ExWithSets = {
        id: string
        sets?: Array<{
          id: string
          set_number: number
          reps?: number | null
          weight_kg?: number | null
          execution_time_sec?: number | null
        }>
      }
      const exercises: ExWithSets[] = (workoutSession?.exercises ?? []) as ExWithSets[]
      if (exercises.length === 0) {
        logger.warn('Completamento senza esercizi in sessione: skip salvataggio set', undefined, {
          workoutId: workoutSession?.workout_id,
        })
      } else {
        for (const ex of exercises) {
          const workoutDayExerciseId = ex.id
          const sets = ex.sets ?? []
          for (const set of sets) {
            const payload = {
              reps: set.reps ?? null,
              weight_kg: set.weight_kg != null ? Number(set.weight_kg) : null,
              execution_time_sec: set.execution_time_sec ?? null,
              completed_at: now,
            } as {
              reps: number | null
              weight_kg: number | null
              execution_time_sec: number | null
              completed_at: string
            }
            if (isValidUUID(set.id)) {
              setPromises.push(
                Promise.resolve(
                  supabase
                    .from('workout_sets')
                    .update(payload)
                    .eq('id', set.id)
                    .then((r: { error: unknown }) => {
                      if (r.error) logger.warn('Errore update set', r.error, { setId: set.id })
                      return { error: r.error }
                    }),
                ),
              )
            } else {
              setPromises.push(
                Promise.resolve(
                  supabase
                    .from('workout_sets')
                    .insert({
                      workout_day_exercise_id: workoutDayExerciseId,
                      set_number: set.set_number,
                      ...payload,
                    })
                    .then((r: { error: unknown }) => {
                      if (r.error)
                        logger.warn('Errore insert set', r.error, {
                          workoutDayExerciseId,
                          set_number: set.set_number,
                        })
                      return { error: r.error }
                    }),
                ),
              )
            }
          }
        }
        const results = await Promise.all(setPromises)
        const failed = results.filter((r) => r.error)
        logger.info('Salvataggio set completato', undefined, {
          total: setPromises.length,
          failed: failed.length,
          firstError: failed[0]
            ? (failed[0].error as { message?: string; code?: string })?.message
            : null,
        })
        if (process.env.NODE_ENV === 'development') {
          console.log('[oggi] Salvataggio set:', {
            total: setPromises.length,
            failed: failed.length,
            error: failed[0] ? (failed[0].error as { message?: string; code?: string }) : null,
          })
        }
        if (failed.length > 0) {
          const firstError = failed[0].error as { message?: string }
          logger.warn('Salvataggio set parzialmente fallito', undefined, {
            total: setPromises.length,
            failed: failed.length,
            message: firstError?.message,
          })
          addToast({
            title: 'Attenzione',
            message: `Alcuni dati dell'allenamento non sono stati salvati (${failed.length}/${setPromises.length}). I progressi potrebbero essere incompleti.`,
            variant: 'warning',
          })
        }
      }

      // Calcolo volume totale (somma reps * weight_kg per ogni set completato)
      let volumeTotale = 0
      for (const ex of exercises) {
        const sets = ex.sets ?? []
        for (const set of sets) {
          const reps = set.reps ?? 0
          const kg = set.weight_kg != null ? Number(set.weight_kg) : 0
          if (reps > 0 && kg >= 0) volumeTotale += reps * kg
        }
      }
      const durataMinuti =
        sessionStartedAtRef.current != null
          ? Math.round((Date.now() - sessionStartedAtRef.current) / 60000)
          : null

      // Salva sempre workout_log per tracciare l'allenamento (sia con PT che da solo)
      const completedAt = new Date().toISOString()
      type WorkoutLogInsert = {
        athlete_id: string
        atleta_id: string
        scheda_id?: string | null
        data: string
        stato: string
        esercizi_completati: number
        esercizi_totali: number
        durata_minuti: number | null
        volume_totale: number | null
        note: string
        execution_mode: 'solo' | 'coached'
        is_coached: boolean
        coached_by_profile_id: string | null
        completed_at: string
      }
      const workoutLogData: WorkoutLogInsert = {
        athlete_id: profileTyped.id,
        atleta_id: profileTyped.id,
        scheda_id: workoutSession?.workout_id || null,
        data: completedAt.split('T')[0],
        stato: 'completato',
        esercizi_completati: workoutSession?.completed_exercises || 0,
        esercizi_totali: workoutSession?.total_exercises || 0,
        durata_minuti: durataMinuti,
        volume_totale: volumeTotale > 0 ? volumeTotale : null,
        note: withTrainer ? 'Completato con trainer' : 'Completato da solo',
        execution_mode: withTrainer ? 'coached' : 'solo',
        is_coached: withTrainer,
        coached_by_profile_id: coachedByProfileId,
        completed_at: completedAt,
      }

      // Log dati prima dell'inserimento per debug
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Tentativo inserimento workout_log:', {
          workoutLogData,
          athleteId: profileTyped.id,
          workoutId: workoutSession?.workout_id,
        })
      }

      const { data: insertedLog, error: logError } = await supabase
        .from('workout_logs')
        .insert(workoutLogData as never)
        .select()
        .single()

      if (logError) {
        // Serializza l'errore Supabase correttamente
        const errorDetails: Record<string, unknown> = {
          message: logError.message || 'Errore sconosciuto',
          code: logError.code || 'UNKNOWN',
          details: logError.details || null,
          hint: logError.hint || null,
          athleteId: profileTyped.id,
          workoutLogData,
        }

        // Aggiungi informazioni aggiuntive se disponibili
        if (logError instanceof Error) {
          errorDetails.errorName = logError.name
          errorDetails.errorStack = logError.stack
        }

        // Log dettagliato
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Errore salvataggio workout_log:', JSON.stringify(errorDetails, null, 2))
        }

        logger.error('Errore salvataggio workout_log', logError, errorDetails)

        // Messaggio errore più dettagliato
        const errorMessage =
          logError.message || "Errore nel salvataggio dell'allenamento completato"
        throw new Error(`${errorMessage}${logError.hint ? ` (${logError.hint})` : ''}`)
      }

      type WorkoutLogRow = Pick<Tables<'workout_logs'>, 'id'>
      const typedInsertedLog = insertedLog as WorkoutLogRow | null
      const workoutLogId = typedInsertedLog?.id

      // Collega i set completati di questa sessione al workout_log (per statistiche e progressi)
      if (workoutLogId && workoutSession?.exercises?.length) {
        const sessionExerciseIds = (workoutSession.exercises as Array<{ id?: string }>)
          .map((ex) => ex.id)
          .filter((id): id is string => Boolean(id))
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        if (sessionExerciseIds.length > 0) {
          await supabase
            .from('workout_sets')
            .update({ workout_log_id: workoutLogId })
            .in('workout_day_exercise_id', sessionExerciseIds)
            .not('completed_at', 'is', null)
            .gte('completed_at', twoHoursAgo)
            .is('workout_log_id', null)
        }
      }

      addToast({
        title: 'Successo',
        message: 'Allenamento completato!',
        variant: 'success',
      })

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
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 flex items-center justify-center">
          <Card className="relative overflow-hidden border-red-500/30 bg-background-secondary/50 max-w-md w-full">
            <CardContent className="p-6 min-[834px]:p-8 text-center relative z-10">
              <div className="mb-3 text-4xl opacity-50">🔒</div>
              <p className="text-text-primary mb-4 text-sm min-[834px]:text-base font-medium">
                Accesso richiesto
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="min-h-[44px] h-9 min-[834px]:h-10 text-sm rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white"
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

  // Nessun workout disponibile o scheda senza esercizi
  if (!workoutSession || !workoutSession.exercises || workoutSession.exercises.length === 0) {
    const isSpecificWorkout = !!workoutPlanId
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
          <header className="fixed inset-x-0 top-0 z-20 flex min-h-[3.5rem] items-center overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]">
            <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
            <div className="relative z-10 flex w-full items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
                aria-label="Indietro"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <Dumbbell className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold text-text-primary truncate">
                  Allenamento
                </h1>
              </div>
              <div className="w-10 shrink-0" />
            </div>
          </header>
          <Card className="relative overflow-hidden border border-cyan-500/30 bg-background-secondary/50">
            <CardContent className="p-5 min-[834px]:p-6 text-center relative z-10">
              <div className="mb-3 text-4xl opacity-50">💪</div>
              <h3 className="text-text-primary mb-2 text-base min-[834px]:text-lg font-medium">
                {isSpecificWorkout
                  ? 'Scheda senza esercizi configurati'
                  : 'Nessun allenamento programmato per oggi'}
              </h3>
              <p className="text-text-secondary mb-4 text-xs min-[834px]:text-sm line-clamp-3">
                {isSpecificWorkout
                  ? 'Questa scheda non ha ancora esercizi configurati. Contatta il tuo trainer per completare la configurazione.'
                  : 'Contatta il tuo trainer per ricevere una scheda di allenamento'}
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  onClick={() => router.push('/home/allenamenti')}
                  className="min-h-[44px] h-9 min-[834px]:h-10 text-sm rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium"
                >
                  Vai agli Allenamenti
                </Button>
                {isSpecificWorkout && (
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="min-h-[44px] h-9 min-[834px]:h-10 text-sm rounded-xl border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Indietro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Errore nel caricamento
  if (error) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
          <header className="fixed inset-x-0 top-0 z-20 flex min-h-[3.5rem] items-center overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]">
            <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
            <div className="relative z-10 flex w-full items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
                aria-label="Indietro"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <Dumbbell className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold text-text-primary truncate">
                  Allenamento di Oggi
                </h1>
              </div>
              <div className="w-10 shrink-0" />
            </div>
          </header>
          <Card className="relative overflow-hidden border border-state-error/50 bg-background-secondary/50">
            <CardContent className="p-5 min-[834px]:p-6 text-center relative z-10">
              <div className="mb-3 text-4xl opacity-50">❌</div>
              <h3 className="text-text-primary mb-2 text-base min-[834px]:text-lg font-medium">
                Errore nel caricamento
              </h3>
              <p className="text-text-secondary mb-4 text-xs min-[834px]:text-sm line-clamp-3">
                {error}
              </p>
              <Button
                onClick={() => {
                  setError(null)
                  if (athleteProfileId) fetchCurrentWorkout(athleteProfileId)
                }}
                className="min-h-[44px] h-9 min-[834px]:h-10 text-sm rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium"
              >
                Riprova
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div
        className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-3 min-[834px]:py-4 space-y-3 min-[834px]:space-y-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem + 10px)' }}
      >
        <header className="fixed inset-x-0 top-0 z-20 flex min-h-[3.5rem] items-center overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]">
          <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
          <div className="relative z-10 flex w-full items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
              aria-label="Indietro"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <Dumbbell className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-text-primary text-2xl md:text-3xl font-semibold truncate">
                {workoutSession.day_title}
              </h1>
            </div>
            <div className="w-10 shrink-0" />
          </div>
        </header>

        {/* Esercizio corrente */}
        {currentExercise
          ? ((): React.ReactElement | null => {
              const exercise = currentExercise.exercise as Record<string, unknown>
              const exerciseVideoUrl = exercise.video_url as string | undefined | null
              const exerciseThumbUrl = exercise.thumb_url as string | undefined | null
              const exerciseNote = currentExercise.note as string | null | undefined

              // Validazione URL video (deve essere una stringa non vuota e valida)
              // Verifica anche che non sia un URL malformato o un placeholder
              const isValidVideoUrl: boolean = Boolean(
                exerciseVideoUrl &&
                typeof exerciseVideoUrl === 'string' &&
                exerciseVideoUrl.trim() !== '' &&
                exerciseVideoUrl.trim() !== 'null' &&
                exerciseVideoUrl.trim() !== 'undefined' &&
                (exerciseVideoUrl.startsWith('http://') ||
                  exerciseVideoUrl.startsWith('https://')) &&
                // Verifica che l'URL non contenga caratteri problematici
                !exerciseVideoUrl.includes('{{') &&
                !exerciseVideoUrl.includes('${'),
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

              // Vista circuito: griglia 3x3 video + lista info per ogni esercizio
              if (circuitGroup.length > 0) {
                return (
                  <Card className="relative overflow-hidden border-0 bg-background-secondary/50 shadow-lg backdrop-blur-sm p-2.5">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <CardHeader
                      className="relative z-10 border-b border-cyan-500/20 py-1.5 px-3"
                      padding="sm"
                    >
                      <CardTitle size="md" className="text-white flex items-center gap-2 text-sm">
                        <div className="p-0.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-primary/20">
                          <Dumbbell className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                        </div>
                        <span className="truncate flex-1">
                          Circuito · {circuitGroup.length} esercizi
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-2 pt-2 p-0">
                      <div
                        className={`grid gap-2 ${circuitGroup.length <= 5 ? 'grid-cols-2' : 'grid-cols-3'}`}
                      >
                        {circuitGroup.slice(0, 9).map((item) => {
                          const ex = (item.exercise ?? {}) as Record<string, unknown>
                          const vUrl = ex.video_url as string | undefined | null
                          const tUrl = ex.thumb_url as string | undefined | null
                          const validV = Boolean(
                            vUrl &&
                            typeof vUrl === 'string' &&
                            vUrl.trim() !== '' &&
                            (vUrl.startsWith('http://') || vUrl.startsWith('https://')),
                          )
                          const validT = Boolean(
                            tUrl && typeof tUrl === 'string' && tUrl.trim() !== '',
                          )
                          const name = (ex.name as string) ?? 'Esercizio'
                          const canEnlarge = validV || validT
                          return (
                            <div
                              key={String(item.id)}
                              className={`relative w-full aspect-video rounded-lg overflow-hidden border border-cyan-500/20 bg-background-tertiary ${canEnlarge ? 'cursor-pointer hover:border-cyan-400/50 hover:ring-2 hover:ring-cyan-500/40 transition-all' : ''}`}
                              role={canEnlarge ? 'button' : undefined}
                              tabIndex={canEnlarge ? 0 : undefined}
                              onClick={() =>
                                canEnlarge &&
                                setEnlargedCircuitVideo({
                                  videoUrl: (vUrl as string) || '',
                                  thumbUrl: tUrl ?? undefined,
                                  name,
                                })
                              }
                              onKeyDown={(e) =>
                                canEnlarge &&
                                (e.key === 'Enter' || e.key === ' ') &&
                                setEnlargedCircuitVideo({
                                  videoUrl: (vUrl as string) || '',
                                  thumbUrl: tUrl ?? undefined,
                                  name,
                                })
                              }
                              aria-label={canEnlarge ? `Ingrandisci video: ${name}` : undefined}
                            >
                              <ExerciseMediaDisplay
                                exercise={ex}
                                videoUrl={vUrl ?? undefined}
                                thumbUrl={tUrl ?? undefined}
                                isValidVideoUrl={validV}
                                isValidThumbUrl={validT}
                              />
                              {canEnlarge && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                  <span className="text-[10px] font-medium text-white uppercase tracking-wider bg-black/50 px-2 py-1 rounded">
                                    Ingrandisci
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="space-y-2 pt-2">
                        {(() => {
                          const hasReps = true
                          const hasWeight = true
                          const hasTime = circuitGroup.some((item) => {
                            const sets = (item.sets as Record<string, unknown>[] | undefined) ?? []
                            return sets.some(
                              (s) =>
                                (s.execution_time_sec as number | null) != null &&
                                (s.execution_time_sec as number) > 0,
                            )
                          })
                          const hasRest = circuitGroup.some(
                            (item) => (item.rest_timer_sec as number | null) != null,
                          )
                          const visibleColumns = [
                            {
                              key: 'weight',
                              show: hasWeight,
                              label: 'Peso (kg)',
                              field: 'weight_kg' as const,
                            },
                            {
                              key: 'reps',
                              show: hasReps,
                              label: 'Ripetizioni',
                              field: 'reps' as const,
                            },
                            {
                              key: 'time',
                              show: hasTime,
                              label: 'Tempo (sec)',
                              field: 'execution_time_sec' as const,
                            },
                            {
                              key: 'rest',
                              show: hasRest,
                              label: 'Recupero (sec)',
                              field: 'rest_timer_sec' as const,
                            },
                          ].filter((col) => col.show)
                          const columnCount = visibleColumns.length
                          return (
                            <>
                              <div
                                className="grid grid-cols-[auto_1fr] gap-1.5 mb-0.5"
                                style={{ gridTemplateColumns: '32px 1fr' }}
                              >
                                <div />
                                <div
                                  className="grid gap-1 md:gap-2"
                                  style={{
                                    gridTemplateColumns: `repeat(${columnCount}, minmax(50px, 1fr))`,
                                  }}
                                >
                                  {visibleColumns.map((col) => (
                                    <div key={col.key} className="text-center">
                                      <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide whitespace-nowrap truncate">
                                        {col.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {circuitGroup.map((item, i) => {
                                const ex = (item.exercise ?? {}) as Record<string, unknown>
                                const name = (ex.name as string) ?? 'Esercizio'
                                const sets = (item.sets as Record<string, unknown>[]) ?? []
                                const firstSet = sets[0]
                                const weight =
                                  (item.target_weight as number) ??
                                  (firstSet?.weight_kg as number) ??
                                  0
                                const reps =
                                  (item.target_reps as number) ?? (firstSet?.reps as number) ?? 0
                                const rest =
                                  (item.rest_timer_sec as number) ??
                                  (firstSet?.rest_timer_sec as number) ??
                                  60
                                const time = (firstSet?.execution_time_sec as number | null) ?? null
                                return (
                                  <div key={String(item.id)} className="space-y-0.5">
                                    <div className="text-text-primary text-[11px] font-medium truncate pl-0.5">
                                      {name}
                                    </div>
                                    <div className="relative overflow-hidden rounded-md p-1.5 transition-all border bg-background-tertiary/30 border-cyan-500/20">
                                      <div
                                        className="grid grid-cols-[auto_1fr] gap-1.5"
                                        style={{ gridTemplateColumns: '32px 1fr' }}
                                      >
                                        <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-background-tertiary/50 text-white border border-cyan-500/40 font-bold text-[11px]">
                                          {i + 1}
                                        </div>
                                        <div
                                          className="grid gap-1 md:gap-2"
                                          style={{
                                            gridTemplateColumns: `repeat(${columnCount}, minmax(50px, 1fr))`,
                                          }}
                                        >
                                          {visibleColumns.map((col) => {
                                            const value =
                                              col.field === 'weight_kg'
                                                ? weight
                                                : col.field === 'reps'
                                                  ? reps
                                                  : col.field === 'rest_timer_sec'
                                                    ? rest
                                                    : col.field === 'execution_time_sec'
                                                      ? (time ?? 0)
                                                      : 0
                                            return (
                                              <div key={col.key} className="text-center">
                                                <div className="text-sm font-bold text-white whitespace-nowrap">
                                                  {value}
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </>
                          )
                        })()}
                      </div>
                      <div className="space-y-2 pt-2.5">
                        {(() => {
                          const block = blocks[currentBlockIndex]
                          const blockExercises = block
                            ? (workoutSession?.exercises ?? []).slice(
                                block.startIndex,
                                block.endIndex + 1,
                              )
                            : []
                          const allSetsCompletedForBlock =
                            blockExercises.length > 0 &&
                            blockExercises.every((ex) => {
                              const sets = (ex as { sets?: Record<string, unknown>[] }).sets ?? []
                              return sets.length === 0 || sets.every((s: Record<string, unknown>) => s.completed === true)
                            })
                          const isBlockCompleted = block
                            ? blockExercises.every(
                                (ex) => (ex as { is_completed?: boolean }).is_completed === true,
                              )
                            : false
                          if (!allSetsCompletedForBlock) return null
                          return (
                            <Button
                              onClick={() => completeBlock(currentBlockIndex)}
                              variant={isBlockCompleted ? 'success' : 'default'}
                              className={
                                isBlockCompleted
                                  ? 'h-9 text-xs rounded-xl bg-green-500 hover:bg-emerald-500 text-white font-semibold w-full transition-all duration-200'
                                  : 'h-9 text-xs rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold w-full transition-all duration-200'
                              }
                            >
                              <Check className="mr-1.5 h-3.5 w-3.5" />
                              {isBlockCompleted ? 'Esercizio completato' : 'Completa esercizio'}
                            </Button>
                          )
                        })()}
                        {workoutSession && isWorkoutComplete && (
                          <Button
                            onClick={finishWorkout}
                            className="h-10 text-xs rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold w-full transition-all duration-200"
                          >
                            🎉 Completa allenamento
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <Card className="relative overflow-hidden border-0 bg-background-secondary/50 shadow-lg backdrop-blur-sm p-2.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <CardHeader
                    className="relative z-10 border-b border-cyan-500/20 py-1.5 px-3"
                    padding="sm"
                  >
                    <CardTitle size="md" className="text-white flex items-center gap-2 text-sm">
                      <div className="p-0.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-primary/20">
                        <Dumbbell className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                      </div>
                      <span className="truncate flex-1">{exercise.name as string}</span>
                      {Boolean(exercise.description) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 flex-shrink-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-full p-0"
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
                  <CardContent className="relative z-10 space-y-2 pt-2 p-0">
                    {/* Video/Immagine esercizio - Componente interno per gestire lo stato */}
                    {shouldShowMedia ? (
                      <ExerciseMediaDisplay
                        exercise={exercise}
                        videoUrl={exerciseVideoUrl || undefined}
                        thumbUrl={exerciseThumbUrl || undefined}
                        isValidVideoUrl={isValidVideoUrl}
                        isValidThumbUrl={isValidThumbUrl}
                      />
                    ) : null}

                    {/* Nota esercizio - Visualizzata sotto il video */}
                    {exerciseNote ? (
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <div className="text-text-secondary text-[10px] font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <div className="p-0.5 rounded bg-gradient-to-br from-cyan-500/20 to-primary/20">
                            <Target className="h-2.5 w-2.5 text-cyan-400 flex-shrink-0" />
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
                                  role={circuitGroup.length === 0 ? 'button' : undefined}
                                  tabIndex={circuitGroup.length === 0 ? 0 : undefined}
                                  onClick={() => {
                                    if (circuitGroup.length !== 0) return
                                    if (set.completed as boolean) {
                                      updateSet(currentExercise.id as string, set.set_number as number, { completed: false })
                                      setInlineTimerSeconds(null)
                                      setInlineTimerRunning(false)
                                      return
                                    }
                                    updateSet(currentExercise.id as string, set.set_number as number, { completed: true })
                                    const restSec =
                                      ((set.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as number | null) ?? 0
                                    const finalRest = restSec > 0 ? restSec : 60
                                    playTimerTone(timerAudioContextRef, 700, 0.5)
                                    setInlineTimerSeconds(finalRest)
                                    setInlineTimerRunning(true)
                                  }}
                                  onKeyDown={(e) => {
                                    if (circuitGroup.length === 0 && (e.key === 'Enter' || e.key === ' ')) {
                                      e.preventDefault()
                                      ;(e.currentTarget as HTMLElement).click()
                                    }
                                  }}
                                  className={`relative overflow-hidden rounded-lg p-2.5 transition-all duration-200 border ${
                                    set.completed
                                      ? 'bg-cyan-500/20 border-cyan-400/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                                      : isSetEditing(
                                            currentExercise.id as string,
                                            set.set_number as number,
                                          )
                                        ? 'bg-cyan-500/10 border-cyan-500/40'
                                        : 'bg-background-tertiary/30 border-cyan-500/20'
                                  } ${circuitGroup.length === 0 ? 'cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500/40' : ''}`}
                                >
                                  <div
                                    className="grid grid-cols-[auto_1fr] gap-2 items-center"
                                    style={{ gridTemplateColumns: '40px 1fr' }}
                                  >
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (!(set.completed as boolean)) {
                                          toggleSetEditMode(
                                            currentExercise.id as string,
                                            set.set_number as number,
                                          )
                                        }
                                      }}
                                      className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center gap-1 font-bold text-xs transition-all duration-200 ${
                                        set.completed
                                          ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400/80'
                                          : isSetEditing(
                                                currentExercise.id as string,
                                                set.set_number as number,
                                              )
                                            ? 'bg-gradient-to-br from-cyan-500/30 to-primary/30 text-cyan-100 border-2 border-cyan-400/60 hover:from-cyan-500/40 hover:to-primary/40 cursor-pointer shadow-lg shadow-cyan-500/30'
                                            : 'bg-background-tertiary/50 text-white border-2 border-cyan-500/40 hover:border-cyan-400/60 hover:bg-cyan-500/15 cursor-pointer hover:shadow-md hover:shadow-cyan-500/20'
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
                                              ? 'text-cyan-300'
                                              : 'text-cyan-400/70'
                                          }`}
                                        />
                                      )}
                                      <span
                                        className={
                                          isSetEditing(
                                            currentExercise.id as string,
                                            set.set_number as number,
                                          )
                                            ? 'text-cyan-300'
                                            : 'text-white'
                                        }
                                      >
                                        {set.set_number as number}
                                      </span>
                                    </div>

                                    <div
                                      className="grid gap-2 md:gap-3 items-center"
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
                                                : ((set[col.field] as number | null | undefined) ??
                                                  0)

                                        return (
                                          <div
                                            key={col.key}
                                            className="text-center flex items-center justify-center min-h-[2rem]"
                                          >
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

                    {/* Azioni - Design Moderno e Uniforme: bottone solo quando tutte le serie sono completate */}
                    <div className="space-y-2 pt-2.5">
                      {(() => {
                        const block = blocks[currentBlockIndex]
                        const blockExercises = block
                          ? (workoutSession?.exercises ?? []).slice(
                              block.startIndex,
                              block.endIndex + 1,
                            )
                          : []
                        const allSetsCompletedForBlock =
                          blockExercises.length > 0 &&
                          blockExercises.every((ex) => {
                            const sets = (ex as { sets?: Record<string, unknown>[] }).sets ?? []
                            return sets.length === 0 || sets.every((s: Record<string, unknown>) => s.completed === true)
                          })
                        const isBlockCompleted = block
                          ? blockExercises.every(
                              (ex) => (ex as { is_completed?: boolean }).is_completed === true,
                            )
                          : false
                        if (!allSetsCompletedForBlock) return null
                        return (
                          <Button
                            onClick={() => completeBlock(currentBlockIndex)}
                            variant={isBlockCompleted ? 'success' : 'default'}
                            className={
                              isBlockCompleted
                                ? 'h-9 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold w-full transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/40'
                                : 'h-9 text-xs rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold w-full transition-all duration-200'
                            }
                          >
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                            {isBlockCompleted ? 'Esercizio completato' : 'Completa esercizio'}
                          </Button>
                        )
                      })()}
                      {/* Pulsante fine allenamento - Mostra solo quando tutti gli esercizi sono completati */}
                      {workoutSession && isWorkoutComplete && (
                        <Button
                          onClick={finishWorkout}
                          className="h-10 text-xs rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold w-full transition-all duration-200 hover:scale-[1.02]"
                        >
                          🎉 Completa allenamento
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })()
          : null}

        {/* Timer circolari: stesso piano del contenuto, sotto l'ultima card */}
        {currentExercise ? (
          <Card className="rounded-[16px] text-text-primary transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none border-border relative overflow-hidden border-0 bg-background-secondary/50 shadow-lg backdrop-blur-sm p-2.5">
            <CardContent className="p-2">
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
                {/* Timer Esecuzione - Mostrato se l'esercizio (o un esercizio del circuito) ha execution_time_sec > 0 */}
                {/* TIMER ESECUZIONE PRIMA (sinistra) */}
                {(() => {
                  let executionTime: number | null = null
                  // Per circuito: usa il primo execution_time_sec > 0 tra gli esercizi del circuito
                  if (circuitGroup.length > 0) {
                    for (const item of circuitGroup) {
                      const itemSets = (item.sets as Record<string, unknown>[]) || []
                      const setIdx = itemSets.findIndex(
                        (s) => !(s as { completed?: boolean }).completed,
                      )
                      const activeSet =
                        setIdx >= 0 ? itemSets[setIdx] : itemSets[itemSets.length - 1]
                      const t =
                        ((activeSet?.execution_time_sec ??
                          (item as Record<string, unknown>).execution_time_sec ??
                          null) as number | null) ?? null
                      if (t != null && t > 0) {
                        executionTime = t
                        break
                      }
                    }
                  }
                  if (executionTime === null) {
                    const sets = (currentExercise?.sets as Record<string, unknown>[]) || []
                    const currentSetIndex = sets.findIndex((s) => !s.completed)
                    const activeSet =
                      currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
                    executionTime =
                      ((activeSet?.execution_time_sec ??
                        currentExercise?.execution_time_sec ??
                        null) as number | null) ?? null
                  }
                  if (executionTime === null || executionTime <= 0) {
                    return null
                  }

                  const initialSeconds = executionTime
                  const currentSeconds =
                    inlineExecutionTimerSeconds !== null
                      ? inlineExecutionTimerSeconds
                      : initialSeconds
                  // Calcola il progresso basato sul tempo rimanente (inverso)
                  // Quando currentSeconds = 0, progress = 0% (cerchio vuoto/completato)
                  const progress =
                    currentSeconds === 0 ? 0 : (currentSeconds / initialSeconds) * 100
                  const circumference = 2 * Math.PI * 80
                  const strokeDashoffset = circumference - (progress / 100) * circumference

                  const formatTime = (totalSeconds: number) => {
                    return totalSeconds.toString()
                  }

                  return (
                    <div
                      key="timer-esecuzione-inline"
                      className="flex flex-col items-center justify-center gap-3"
                    >
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
                                <div className="text-4xl font-bold text-green-500 leading-none">
                                  0
                                </div>
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
                  const activeSet =
                    currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
                  const timerValue =
                    ((activeSet?.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as
                      | number
                      | null) ?? 0
                  const initialSeconds = timerValue > 0 ? timerValue : 60
                  const currentSeconds =
                    inlineTimerSeconds !== null ? inlineTimerSeconds : initialSeconds
                  const progress = (currentSeconds / initialSeconds) * 100
                  const circumference = 2 * Math.PI * 80
                  const strokeDashoffset = circumference - (progress / 100) * circumference

                  const formatTime = (totalSeconds: number) => {
                    return totalSeconds.toString()
                  }

                  // Mostra sempre il timer di recupero se l'esercizio ha un valore di recupero > 0
                  // oppure se è già stato avviato (inlineTimerSeconds !== null, anche se è 0 = completato)
                  // Nascondi solo se non c'è né timer di recupero né timer di esecuzione E non c'è un valore di recupero > 0
                  if (
                    timerValue <= 0 &&
                    inlineTimerSeconds === null &&
                    inlineExecutionTimerSeconds === null
                  ) {
                    return null
                  }

                  return (
                    <div
                      key="timer-recupero-unico"
                      className="flex flex-col items-center justify-center gap-3"
                    >
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
                        aria-label={
                          inlineTimerRunning ? 'Pausa timer recupero' : 'Avvia timer recupero'
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
                              inlineTimerRunning ? 'text-cyan-400' : 'text-cyan-400/60'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="text-center space-y-0.5">
                            {inlineTimerSeconds === null ? (
                              <>
                                <div className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/70 mb-1">
                                  RECUPERO
                                </div>
                                <div className="text-4xl font-bold text-white leading-none">
                                  {formatTime(initialSeconds)}
                                </div>
                                <div className="text-[10px] text-cyan-400/50 font-medium mt-1 uppercase tracking-wider">
                                  Tocca per avviare
                                </div>
                              </>
                            ) : currentSeconds === 0 ? (
                              <>
                                <div className="text-4xl font-bold text-green-500 leading-none">
                                  0
                                </div>
                                <div className="text-[10px] text-green-500/70 font-medium mt-1 uppercase tracking-wider">
                                  Completato
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-4xl font-bold text-white leading-none">
                                  {formatTime(currentSeconds)}
                                </div>
                                <div className="text-[10px] text-cyan-400/70 font-medium mt-1 uppercase tracking-wider">
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

        {/* Navigazione esercizi - fissata in basso */}
        <Card className="fixed inset-x-0 bottom-0 z-20 overflow-hidden rounded-t-xl border-t border-x border-cyan-500/30 bg-background-secondary/50 shadow-sm backdrop-blur-sm pb-[env(safe-area-inset-bottom)] p-0">
          <div className="absolute inset-0 rounded-t-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
          <CardContent className="relative z-10 p-2">
            <div className="flex items-center justify-between gap-2">
              <Button
                onClick={previousExercise}
                disabled={currentBlockIndex === 0}
                variant="outline"
                className="h-9 text-[10px] rounded-xl border border-cyan-500/30 text-white hover:bg-cyan-500/10 hover:border-cyan-500/50 disabled:opacity-30"
              >
                ← Precedente
              </Button>

              <div className="flex flex-col items-center min-w-0">
                <span className="text-text-secondary text-[10px] uppercase tracking-wider">
                  Esercizio
                </span>
                <span className="text-text-primary font-bold text-sm text-white">
                  {currentBlockIndex + 1} / {blocks.length}
                </span>
              </div>

              <Button
                onClick={nextExercise}
                disabled={currentBlockIndex === blocks.length - 1}
                variant="outline"
                className="h-9 text-[10px] rounded-xl border border-cyan-500/30 text-white hover:bg-cyan-500/10 hover:border-cyan-500/50 disabled:opacity-30"
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

      {/* Dialog video circuito ingrandito */}
      <Dialog
        open={enlargedCircuitVideo !== null}
        onOpenChange={(open) => {
          if (!open) setEnlargedCircuitVideo(null)
        }}
      >
        <DialogContent className="relative max-w-4xl w-[95vw] overflow-hidden bg-black border border-cyan-500/30 shadow-xl">
          {enlargedCircuitVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-text-primary text-base font-bold truncate pr-8">
                  {enlargedCircuitVideo.name}
                </DialogTitle>
              </DialogHeader>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-background-tertiary border border-cyan-500/20 mt-2">
                {enlargedCircuitVideo.videoUrl ? (
                  <video
                    className="h-full w-full object-contain"
                    src={enlargedCircuitVideo.videoUrl}
                    poster={enlargedCircuitVideo.thumbUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                  />
                ) : enlargedCircuitVideo.thumbUrl ? (
                  <Image
                    src={enlargedCircuitVideo.thumbUrl}
                    alt={enlargedCircuitVideo.name}
                    className="h-full w-full object-contain"
                    fill
                    unoptimized
                  />
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
              <Info className="h-5 w-5 text-cyan-400" />
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
          className="bg-black min-h-dvh w-full max-w-full space-y-3 px-3 sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5"
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
