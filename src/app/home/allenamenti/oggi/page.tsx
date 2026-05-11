'use client'

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useContext,
  useRef,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { WorkoutWeightPickerDialog } from '@/components/workout/workout-weight-picker-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import { RestTimer } from '@/components/workout/rest-timer'
import { AthleteExercisePrivateNoteBlock } from '@/components/workout/athlete-exercise-private-note'
import type { AthleteWdeNoteRow } from '@/components/workout/athlete-exercise-private-note'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  FileText,
  Info,
  Lock,
  Pencil,
  PartyPopper,
  Play,
  X,
} from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { useWorkoutSession } from '@/hooks/workouts/use-workout-session'
import { useToast } from '@/components/ui/toast'
import { AthleteTopBarContext } from '@/components/athlete'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { catalogExerciseIdFromSessionExercise } from '@/lib/workout/catalog-exercise-id'
import { notifyError } from '@/lib/notifications'
import { isValidProfile } from '@/lib/utils/type-guards'
import { cn } from '@/lib/utils'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import {
  workoutsPaneEmbedBodyClass,
  workoutsPaneEmbedRootClass,
} from '@/lib/embed/workouts-pane-body-layout'
import {
  STAFF_WORKOUTS_EMBED_DIRTY,
  STAFF_WORKOUTS_EMBED_AUTH_REQUIRED,
  STAFF_WORKOUTS_EMBED_SAVE_ERROR,
  STAFF_WORKOUTS_EMBED_SAVE_OK,
  STAFF_WORKOUTS_EMBED_SAVE_START,
} from '@/lib/embed/staff-workouts-embed-events'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { useAutoplayPreviewVideo } from '@/hooks/use-autoplay-preview-video'
import { AllenamentiPageHeader } from '@/app/home/allenamenti/AllenamentiPageHeader'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import { invalidateAfterWorkoutSessionWrite } from '@/lib/react-query/post-mutation-cache'
import { repairOrphanWorkoutSetsToLog } from '@/lib/workout-sets-repair-orphan-log'
import { isMissingAthleteWdeNoteImageColumnError } from '@/lib/workout/athlete-wde-private-note-db'
import { requestCoachedSessionDebitClient } from '@/lib/credits/request-coached-session-debit-client'
import type { WorkoutSession, WorkoutSetData } from '@/types/workout'
import {
  loadAllenamentoOggiDraft,
  saveAllenamentoOggiDraftSync,
  clearAllenamentoOggiDraft,
  sessionIdentityEqual,
  clampBlockIndexForSession,
} from '@/lib/allenamento-oggi-session-draft'
import type { Tables } from '@/types/supabase'

const logger = createLogger('app:home:allenamenti:oggi:page')

const CARD_DS =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

function getWorkoutColumnsTemplate(columnCount: number, hasRest: boolean): string {
  const columns = `repeat(${columnCount}, minmax(0, 1fr))`
  return hasRest ? `${columns} 2.5rem` : columns
}

function resolveSetWeightKgForPicker(
  set: Record<string, unknown>,
  exercise: Record<string, unknown>,
): number {
  const sw = set.weight_kg as number | null | undefined
  const tw = exercise.target_weight as number | null | undefined
  if (sw !== null && sw !== undefined && Number.isFinite(sw)) return sw
  if (tw !== null && tw !== undefined && Number.isFinite(tw)) return tw
  return 0
}

/** Target o ripetizioni eseguite: mostra MAX se il trainer ha impostato il sentinel -1. */
function displayWorkoutRepsCell(
  setReps: number | null | undefined,
  targetReps: number | null | undefined,
): string | number {
  const resolved = setReps ?? targetReps
  if (resolved == null) return 0
  if (resolved === WORKOUT_REPS_MAX_SENTINEL) return 'MAX'
  return resolved
}

/** Suono timer: crea e avvia un tono con Web Audio API (durata in ms, volume 0-1, frequenza Hz) */
function playTimerTone(
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  durationMs: number,
  volume: number,
  frequencyHz = 520,
): void {
  try {
    if (typeof window === 'undefined') return
    const ctx =
      audioContextRef.current ??
      new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
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

/** Secondi di countdown "Preparati" nel circuito fullscreen prima dell'esecuzione automatica */
const CIRCUIT_FULLSCREEN_PREPARE_SECONDS = 10

/** 5 beep ascendenti (Hz crescenti) durante il countdown 5→1 prima del timer di esecuzione */
const EXECUTION_PRE_ROLL_FREQ_HZ = [523.25, 587.33, 659.25, 783.99, 880] as const

function playExecutionPreRollTone(
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  stepRemaining: number,
): void {
  const idx = 5 - Math.min(5, Math.max(1, stepRemaining))
  const hz = EXECUTION_PRE_ROLL_FREQ_HZ[idx] ?? 523.25
  playTimerTone(audioContextRef, 200, 0.88, hz)
}

function workoutDayExerciseRowId(ex: unknown): string {
  if (!ex || typeof ex !== 'object') return ''
  const o = ex as Record<string, unknown>
  const raw = o.id ?? o.workout_day_exercise_id ?? o.workoutDayExerciseId
  if (raw === null || raw === undefined) return ''
  return String(raw).trim()
}

/** Serie da persistere sul workout_log al termine (stesso shape di saveCompletedBlockToDb). */
type SessionExerciseSetsForLog = {
  id: string
  exercise_id?: string | null
  sets: Array<{
    set_number: number
    reps?: number | null
    weight_kg?: number | null
    execution_time_sec?: number | null
    rest_timer_sec?: number | null
  }>
}

function sessionExercisesToPersistPayload(
  exercises: unknown[] | undefined,
): SessionExerciseSetsForLog[] {
  if (!exercises?.length) return []
  const out: SessionExerciseSetsForLog[] = []
  for (const ex of exercises) {
    const id = workoutDayExerciseRowId(ex)
    if (!id) continue
    const rec = ex as Record<string, unknown>
    const rawSets = (rec.sets as unknown[] | undefined) ?? []
    const exCatalogId = catalogExerciseIdFromSessionExercise(ex)

    const sets: SessionExerciseSetsForLog['sets'] = []
    for (const s of rawSets) {
      if (!s || typeof s !== 'object') continue
      const row = s as Record<string, unknown>
      sets.push({
        set_number: Number(row.set_number ?? 0),
        reps: row.reps != null && row.reps !== '' ? Number(row.reps) : null,
        weight_kg: row.weight_kg != null && row.weight_kg !== '' ? Number(row.weight_kg) : null,
        execution_time_sec:
          row.execution_time_sec != null && row.execution_time_sec !== ''
            ? Number(row.execution_time_sec)
            : null,
        rest_timer_sec:
          row.rest_timer_sec != null && row.rest_timer_sec !== ''
            ? Number(row.rest_timer_sec)
            : null,
      })
    }
    out.push({ id, ...(exCatalogId ? { exercise_id: exCatalogId } : {}), sets })
  }
  return out
}

/** Serie segnata come eseguita (tollerante a valori numerici da JSON/API). */
function isWorkoutSetCompleted(s: Record<string, unknown>): boolean {
  const c = s.completed
  return c === true || c === 1
}

function resolveExerciseIndexInSession(
  exercises: unknown[] | undefined,
  exercise: unknown,
): number {
  if (!exercises?.length) return -1
  const id = workoutDayExerciseRowId(exercise)
  if (!id) return -1
  return exercises.findIndex((e) => workoutDayExerciseRowId(e) === id)
}

function applyExerciseSetPatch(
  prev: WorkoutSession,
  exerciseIndex: number,
  setNumber: number,
  updates: Partial<WorkoutSetData>,
): WorkoutSession | null {
  if (!prev.exercises?.length) return null
  if (exerciseIndex < 0 || exerciseIndex >= prev.exercises.length) return null
  const targetN = Number(setNumber)
  const exercises = prev.exercises.map((ex, idx) => {
    if (idx !== exerciseIndex) return ex
    const rawSets = (ex as { sets?: unknown }).sets
    const prevSets = Array.isArray(rawSets) ? (rawSets as Record<string, unknown>[]) : []
    const newSets = prevSets.map((set) =>
      Number(set.set_number) === targetN ? { ...set, ...updates } : set,
    )
    const allSetsDone = newSets.length > 0 && newSets.every((s) => isWorkoutSetCompleted(s))
    return { ...ex, sets: newSets, is_completed: allSetsDone }
  })
  const completedCount = exercises.filter(
    (ex) => (ex as { is_completed?: boolean }).is_completed === true,
  ).length
  const total = Math.max(prev.total_exercises || 1, 1)
  return {
    ...prev,
    exercises,
    completed_exercises: completedCount,
    progress_percentage: Math.round((completedCount / total) * 100),
  }
}

/** Video a tutto schermo / dialog: autoplay affidabile (muted) quando il modal è aperto. */
function ModalAutoplayExerciseVideo({
  videoSrc,
  posterSrc,
}: {
  videoSrc: string
  posterSrc?: string | null
}) {
  const ref = useAutoplayPreviewVideo({ enabled: true, pauseWhenOffscreen: false })
  return (
    <video
      ref={ref}
      key={videoSrc}
      className="h-full w-full object-contain"
      src={videoSrc}
      poster={posterSrc || undefined}
      controls
      muted
      loop
      autoPlay
      playsInline
      preload="auto"
    />
  )
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

  const shouldShowVideo = isValidVideoUrl && Boolean(videoUrl) && !videoError
  const videoRef = useAutoplayPreviewVideo({
    enabled: shouldShowVideo,
    pauseWhenOffscreen: true,
  })

  // Su mobile l'autoplay può essere bloccato: avvia play() via JS e, se fallisce, mostra overlay Play
  const tryPlay = React.useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.play()
      .then(() => {
        setAutoplayBlocked(false)
      })
      .catch(() => {
        setAutoplayBlocked(true)
      })
  }, [videoRef])

  useEffect(() => {
    if (!videoUrl || !isValidVideoUrl || videoError) return
    setAutoplayBlocked(false)
  }, [videoUrl, isValidVideoUrl, videoError])

  // Log per debug
  useEffect(() => {
    console.log('[ExerciseMediaDisplay] Stato media:', {
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
  const shouldShowImage =
    (!shouldShowVideo || videoError) && isValidThumbUrl && thumbUrl && !imageError

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {shouldShowVideo ? (
        <>
          <video
            ref={videoRef}
            key={videoUrl}
            className="h-full w-full object-contain"
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
                console.error('[video] Errore caricamento:', JSON.stringify(errorDetails, null, 2))
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
                console.log('[video] Metadata caricato:', {
                  exerciseId: exercise.id,
                  videoUrl,
                })
              }
              logger.debug('Video metadata caricato', { exerciseId: exercise.id, videoUrl })
            }}
            onCanPlay={(ev) => {
              const videoElement = ev.currentTarget as HTMLVideoElement
              videoElement.playbackRate = 1.1 // Velocizza del 10%
              if (process.env.NODE_ENV === 'development') {
                console.log('[video] Pronto per la riproduzione:', {
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
                  ? {
                      background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${thumbUrl}) center/cover`,
                    }
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
          className="object-contain"
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

/** Barra progresso countdown circuito fullscreen: fluida (rAF + deadline wall-clock), non a scatti col tick 1s. */
function useSmoothCircuitProgressPercent(opts: {
  active: boolean
  phaseKey: string
  phaseTotalSeconds: number
  remainingSeconds: number | null
  running: boolean
  stalePercent: number
}) {
  const endMsRef = React.useRef<number | null>(null)
  const totalMsRef = React.useRef(0)
  const lastPhaseKeyRef = React.useRef<string | null>(null)
  const wasRunningRef = React.useRef(false)
  const [rafTick, setRafTick] = React.useState(0)

  React.useEffect(() => {
    if (!opts.active) {
      lastPhaseKeyRef.current = null
      endMsRef.current = null
      return
    }
    if (
      opts.phaseTotalSeconds <= 0 ||
      opts.remainingSeconds === null ||
      opts.remainingSeconds <= 0
    ) {
      if (opts.phaseKey !== lastPhaseKeyRef.current) {
        lastPhaseKeyRef.current = opts.phaseKey
      }
      endMsRef.current = null
      return
    }
    if (opts.phaseKey !== lastPhaseKeyRef.current) {
      lastPhaseKeyRef.current = opts.phaseKey
      endMsRef.current = Date.now() + opts.remainingSeconds * 1000
      totalMsRef.current = opts.phaseTotalSeconds * 1000
    }
  }, [opts.active, opts.phaseKey, opts.phaseTotalSeconds, opts.remainingSeconds])

  React.useEffect(() => {
    if (!opts.active) {
      wasRunningRef.current = false
      return
    }
    if (opts.running) {
      if (
        !wasRunningRef.current &&
        opts.remainingSeconds != null &&
        opts.remainingSeconds > 0 &&
        opts.phaseTotalSeconds > 0
      ) {
        endMsRef.current = Date.now() + opts.remainingSeconds * 1000
        totalMsRef.current = opts.phaseTotalSeconds * 1000
      }
      wasRunningRef.current = true
    } else {
      wasRunningRef.current = false
    }
  }, [opts.active, opts.running, opts.remainingSeconds, opts.phaseTotalSeconds])

  React.useEffect(() => {
    if (!opts.active || !opts.running || endMsRef.current === null || totalMsRef.current <= 0) {
      return undefined
    }
    let id = 0
    const loop = () => {
      setRafTick((t) => (t + 1) % 1_000_000)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [opts.active, opts.running, opts.phaseKey])

  return React.useMemo(() => {
    // Invalidazione memo su tick RAF e cambio fase (corpo legge solo ref / Date.now)
    void rafTick
    void opts.phaseKey
    if (!opts.active) return opts.stalePercent
    if (opts.phaseTotalSeconds <= 0) return opts.stalePercent
    if (!opts.running) {
      if (opts.remainingSeconds === null) return opts.stalePercent
      return Math.min(100, Math.max(0, (opts.remainingSeconds / opts.phaseTotalSeconds) * 100))
    }
    if (endMsRef.current === null || totalMsRef.current <= 0) return opts.stalePercent
    const rem = Math.max(0, endMsRef.current - Date.now())
    return Math.min(100, Math.max(0, (rem / totalMsRef.current) * 100))
  }, [
    opts.active,
    opts.running,
    opts.phaseTotalSeconds,
    opts.remainingSeconds,
    opts.stalePercent,
    opts.phaseKey,
    rafTick,
  ])
}

export function AllenamentiOggiPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user, loading: authLoading, authRecovery, retryAuthSession } = useAuth()
  const { addToast } = useToast()
  const supabase = useSupabaseClient()
  const { pathBase, isPreview } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  /** Due colonne /dashboard/workouts: niente scroll interno — altezza naturale, scroll sul layout staff. */
  const workoutsPaneNaturalFlow = Boolean(workoutsPane)

  const requestCoachedSessionDebit = useCallback(
    async (workoutLogId: string) => {
      const debit = await requestCoachedSessionDebitClient(workoutLogId)
      if (!debit.ok) {
        addToast({
          title: 'Attenzione',
          message:
            'Allenamento salvato. Se le lezioni non risultano aggiornate, contatta la reception.',
          variant: 'warning',
        })
        return
      }
      if (debit.skipped_duplicate_calendar) {
        addToast({
          title: 'Lezione non scalata da app',
          message:
            'Risulta già una seduta in calendario vicina a questo orario conteggiata come scalata. Se non è il tuo caso, scrivi in reception.',
          variant: 'info',
        })
      }
    },
    [addToast],
  )

  // Type guard per user
  const isValidUser = user && isValidProfile(user)
  const hasRetriedSessionRef = React.useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (user) {
      hasRetriedSessionRef.current = false
      return
    }
    if (!hasRetriedSessionRef.current) {
      hasRetriedSessionRef.current = true
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[auth-recovery] oggi: user assente, retry sessione')
      }
      void retryAuthSession()
    }
  }, [authLoading, user, retryAuthSession])

  const { athleteProfileId: resolvedAthleteId } = useResolvedAthleteProfileForAllenamenti()
  const athleteProfileId = resolvedAthleteId

  const embedDirtyRef = React.useRef(false)
  const postEmbedDirty = useCallback(
    (dirty: boolean) => {
      if (!isPreview) return
      if (workoutsPane?.setDirty) {
        workoutsPane.setDirty(dirty)
        return
      }
      if (typeof window === 'undefined') return
      if (window.parent === window) return
      if (!athleteProfileId) return
      try {
        window.parent.postMessage(
          { type: STAFF_WORKOUTS_EMBED_DIRTY, athleteProfileId, dirty },
          window.location.origin,
        )
      } catch {
        /* ignore */
      }
    },
    [athleteProfileId, isPreview, workoutsPane],
  )

  const postEmbedSaveEvent = useCallback(
    (
      event:
        | { type: typeof STAFF_WORKOUTS_EMBED_SAVE_START; scope: 'block' | 'workout' }
        | { type: typeof STAFF_WORKOUTS_EMBED_SAVE_OK; scope: 'block' | 'workout' }
        | {
            type: typeof STAFF_WORKOUTS_EMBED_SAVE_ERROR
            scope: 'block' | 'workout'
            message: string
          },
    ) => {
      if (!isPreview) return
      if (typeof window === 'undefined') return
      if (window.parent === window) return
      if (!athleteProfileId) return
      try {
        window.parent.postMessage({ ...event, athleteProfileId }, window.location.origin)
      } catch {
        /* ignore */
      }
    },
    [athleteProfileId, isPreview],
  )

  const requestAuthFromParent = useCallback(() => {
    if (!isPreview) return false
    if (typeof window === 'undefined') return false
    if (window.parent === window) return false
    if (!athleteProfileId) return false
    try {
      window.parent.postMessage(
        { type: STAFF_WORKOUTS_EMBED_AUTH_REQUIRED, athleteProfileId, reason: 'no_session' },
        window.location.origin,
      )
      return true
    } catch {
      return false
    }
  }, [athleteProfileId, isPreview])

  useEffect(() => {
    if (authLoading) return
    if (user && isValidUser) return
    void requestAuthFromParent()
  }, [authLoading, isValidUser, requestAuthFromParent, user])

  const markEmbedDirty = useCallback(() => {
    if (embedDirtyRef.current) return
    embedDirtyRef.current = true
    postEmbedDirty(true)
  }, [postEmbedDirty])

  const clearEmbedDirty = useCallback(() => {
    if (!embedDirtyRef.current) return
    embedDirtyRef.current = false
    postEmbedDirty(false)
  }, [postEmbedDirty])

  /** Evita che solo un cambio identità di clearEmbedDirty riesegua la sync da currentWorkout (reset locale serie). */
  const clearEmbedDirtyForSyncRef = React.useRef(clearEmbedDirty)
  clearEmbedDirtyForSyncRef.current = clearEmbedDirty

  const [privateNotesByWdeId, setPrivateNotesByWdeId] = useState<Record<string, AthleteWdeNoteRow>>(
    {},
  )

  const handlePrivateNoteSaved = useCallback((wdeId: string, row: AthleteWdeNoteRow | null) => {
    setPrivateNotesByWdeId((prev) => {
      const next = { ...prev }
      if (row === null) delete next[wdeId]
      else next[wdeId] = row
      return next
    })
  }, [])

  // Recupera parametri dalla query string
  const panePrefix = workoutsPane?.slotId ?? null
  const workoutPlanId = panePrefix
    ? searchParams?.get(`${panePrefix}workoutPlanId`)
    : searchParams?.get('workout_plan_id')
  const workoutDayId = panePrefix
    ? searchParams?.get(`${panePrefix}dayId`)
    : searchParams?.get('workout_day_id')
  const exerciseId = panePrefix
    ? searchParams?.get(`${panePrefix}exerciseId`)
    : searchParams?.get('exercise_id')
  const allenamentiHeaderBackHref = useMemo(() => {
    if (workoutPlanId && workoutDayId) {
      return `${pathBase}/${workoutPlanId}/giorno/${workoutDayId}`
    }
    if (workoutPlanId) {
      return `${pathBase}/${workoutPlanId}`
    }
    return pathBase
  }, [workoutPlanId, workoutDayId, pathBase])

  // Recupera workout session reale dal database
  const { currentWorkout, fetchCurrentWorkout } = useWorkoutSession()
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null)
  const workoutSessionRef = React.useRef(workoutSession)
  workoutSessionRef.current = workoutSession

  const handleWorkoutsPaneBackToHome = useCallback(() => {
    if (workoutsPane) {
      workoutsPane.navigateTo({ kind: 'home' })
    } else {
      router.push(pathBase)
    }
  }, [workoutsPane, router, pathBase])

  const workoutsSplitPaneHeader = useMemo(() => {
    if (!workoutsPane) return null
    return (
      <div className="w-full shrink-0 px-3 sm:px-4 md:px-6">
        <div className="mx-auto w-full max-w-lg lg:max-w-3xl">
          <AllenamentiPageHeader
            title={workoutSession?.plan_name?.trim() || 'Allenamento di oggi'}
            subtitle={
              workoutSession?.day_title?.trim() ||
              workoutSession?.plan_description?.trim() ||
              undefined
            }
            onBack={handleWorkoutsPaneBackToHome}
          />
        </div>
      </div>
    )
  }, [
    workoutsPane,
    workoutSession?.plan_name,
    workoutSession?.day_title,
    workoutSession?.plan_description,
    handleWorkoutsPaneBackToHome,
  ])

  useEffect(() => {
    if (!isPreview) return
    if (typeof window === 'undefined') return
    if (window.parent === window) return
    if (!athleteProfileId) return

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as unknown
      if (!d || typeof d !== 'object') return
      const msg = d as { type?: unknown; athleteProfileId?: unknown }
      if (msg.type !== '22club:staff-workouts-embed-refresh') return
      const id = typeof msg.athleteProfileId === 'string' ? msg.athleteProfileId.trim() : ''
      if (!id || id !== athleteProfileId) return
      void fetchCurrentWorkout(
        athleteProfileId,
        workoutPlanId ?? undefined,
        workoutDayId ?? undefined,
      )
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [athleteProfileId, fetchCurrentWorkout, isPreview, workoutDayId, workoutPlanId])

  const privateNotesFetchKey = useMemo(() => {
    if (!workoutSession?.exercises?.length) return ''
    const ids = workoutSession.exercises
      .map((e) => workoutDayExerciseRowId(e))
      .filter(Boolean)
      .sort()
      .join(',')
    return `${workoutSession.workout_day_id ?? ''}:${ids}`
  }, [workoutSession?.workout_day_id, workoutSession?.exercises])

  /** Indice del blocco corrente (singolo esercizio o circuito = 1 blocco) */
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const allenamentoDraftPersistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const allenamentoDraftSnapshotRef = useRef({
    workoutSession: null as WorkoutSession | null,
    currentBlockIndex: 0,
  })
  /** Una tantum per workout_id+day_id: ripristina bozza sessionStorage se coincide col fetch. */
  const allenamentoDraftRestoreKeyRef = useRef<string | null>(null)

  useEffect(() => {
    allenamentoDraftSnapshotRef.current = { workoutSession, currentBlockIndex }
  }, [workoutSession, currentBlockIndex])

  useEffect(() => {
    if (!athleteProfileId || !workoutSession?.exercises?.length) return
    const sessionKey = `${athleteProfileId}:${workoutSession.workout_id ?? ''}:${workoutSession.workout_day_id ?? ''}`
    if (allenamentoDraftRestoreKeyRef.current === sessionKey) return
    allenamentoDraftRestoreKeyRef.current = sessionKey

    const draft = loadAllenamentoOggiDraft(athleteProfileId)
    if (!draft) return
    if (!sessionIdentityEqual(draft.workoutSession, workoutSession)) {
      clearAllenamentoOggiDraft(athleteProfileId)
      return
    }
    setWorkoutSession(draft.workoutSession)
    setCurrentBlockIndex(clampBlockIndexForSession(draft.currentBlockIndex, draft.workoutSession))
    addToast({
      title: 'Sessione recuperata',
      message:
        'Ripristinato il lavoro non ancora salvato sul server in questa scheda. Verifica le serie prima di completare.',
      variant: 'success',
    })
  }, [athleteProfileId, workoutSession, addToast])

  useEffect(() => {
    if (!athleteProfileId || !workoutSession?.exercises?.length) return
    const flush = () => {
      const { workoutSession: ws, currentBlockIndex: bi } = allenamentoDraftSnapshotRef.current
      if (!ws?.exercises?.length) return
      saveAllenamentoOggiDraftSync(athleteProfileId, {
        savedAt: new Date().toISOString(),
        workoutSession: ws,
        currentBlockIndex: bi,
      })
    }
    window.addEventListener('beforeunload', flush)
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      window.removeEventListener('pagehide', flush)
    }
  }, [athleteProfileId, workoutSession])

  useEffect(() => {
    if (!athleteProfileId || !workoutSession?.exercises?.length) return
    if (allenamentoDraftPersistTimerRef.current)
      clearTimeout(allenamentoDraftPersistTimerRef.current)
    allenamentoDraftPersistTimerRef.current = setTimeout(() => {
      allenamentoDraftPersistTimerRef.current = null
      saveAllenamentoOggiDraftSync(athleteProfileId, {
        savedAt: new Date().toISOString(),
        workoutSession,
        currentBlockIndex,
      })
    }, 500)
    return () => {
      if (allenamentoDraftPersistTimerRef.current)
        clearTimeout(allenamentoDraftPersistTimerRef.current)
    }
  }, [athleteProfileId, workoutSession, currentBlockIndex])

  const [showRestTimer, setShowRestTimer] = useState(false)
  /** Overlay centro schermo con timer recupero/esecuzione (aperto dal Play in tabella) */
  const [restTimersOverlayOpen, setRestTimersOverlayOpen] = useState(false)
  const [inlineTimerSeconds, setInlineTimerSeconds] = useState<number | null>(null)
  const [inlineTimerRunning, setInlineTimerRunning] = useState(false)
  const [inlineExecutionTimerSeconds, setInlineExecutionTimerSeconds] = useState<number | null>(
    null,
  )
  const [inlineExecutionTimerRunning, setInlineExecutionTimerRunning] = useState(false)
  /** Countdown 5→1 con beep crescenti prima che parta il timer di esecuzione */
  const [inlineExecutionPreRollRemaining, setInlineExecutionPreRollRemaining] = useState<
    number | null
  >(null)
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
  /** Vista fullscreen circuito: primo piano + esercizio attivo con relativi valori set. */
  const [circuitFullscreenPreview, setCircuitFullscreenPreview] = useState<{
    exercises: Record<string, unknown>[]
    activeIndex: number
  } | null>(null)
  const [circuitAutoPhase, setCircuitAutoPhase] = useState<
    'idle' | 'prepare' | 'execution' | 'reps' | 'rest' | 'completed'
  >('idle')
  const [circuitAutoSeconds, setCircuitAutoSeconds] = useState<number | null>(null)
  const [circuitAutoRunning, setCircuitAutoRunning] = useState(false)
  const circuitCycleTargetRef = React.useRef(1)
  const circuitCompletedCyclesRef = React.useRef(0)
  const lastCircuitExercisesRef = React.useRef<Record<string, unknown>[] | null>(null)
  const [weightPicker, setWeightPicker] = useState<{
    exerciseId: string
    setNumber: number
    initialKg: number
  } | null>(null)
  /** Serial per esercizio: incrementato apre il blocco nota privata (`AthleteExercisePrivateNoteBlock`). */
  const [privateNoteExpandSerialByWde, setPrivateNoteExpandSerialByWde] = useState<
    Record<string, number>
  >({})
  /** Timestamp inizio sessione (per calcolo durata_minuti al completamento) */
  const sessionStartedAtRef = React.useRef<number | null>(null)
  /** Log sessione corrente (in_corso) creato al primo "Completa esercizio"; il completamento finale aggiorna questa riga */
  const activeWorkoutLogIdRef = React.useRef<string | null>(null)
  const lastWorkoutSessionKeyRef = React.useRef<string>('')
  /** AudioContext per suoni timer (creato al primo uso dopo gesto utente) */
  const timerAudioContextRef = React.useRef<AudioContext | null>(null)
  /** Set (esercizio + numero serie) per cui è attivo il timer recupero inline — per marcare la serie completata allo scadere */
  const restTimerTargetRef = React.useRef<{
    exerciseId: string
    setNumber: number
    /** Indice in session.exercises — usato se l'id non combacia nello stato */
    exerciseIndex: number | null
  } | null>(null)
  /** Play colonna recupero: prima recupero poi esecuzione. Play colonna tempo: prima esecuzione poi recupero. */
  const timerChainModeRef = React.useRef<'rest_then_execution' | 'execution_then_rest' | null>(null)
  /** Ref del contenitore scrollabile per header/barra visibili solo in cima/fondo */
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showHeaderScroll, setShowHeaderScroll] = useState(true)
  const SCROLL_THRESHOLD = 60

  const handleScrollOggi = React.useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollTop } = el
    const atTop = scrollTop <= SCROLL_THRESHOLD
    setShowHeaderScroll(atTop)
  }, [])

  useEffect(() => {
    if (workoutsPaneNaturalFlow) setShowHeaderScroll(true)
  }, [workoutsPaneNaturalFlow])

  const setTopBarConfig = useContext(AthleteTopBarContext)?.setConfig

  // Top bar unificata nel layout (logo a destra): tutti gli stati + titolo nascosto quando non sei in cima allo scroll
  useEffect(() => {
    if (!setTopBarConfig) return

    if (authLoading || loading) {
      setTopBarConfig(null)
      return () => setTopBarConfig(null)
    }

    if (error) {
      setTopBarConfig({
        title: 'Allenamento di Oggi',
        backHref: allenamentiHeaderBackHref,
      })
      return () => setTopBarConfig(null)
    }

    if (!workoutSession?.exercises?.length) {
      setTopBarConfig({
        title: workoutSession?.plan_name?.trim() || 'Allenamento',
        subtitle:
          workoutSession?.day_title?.trim() ||
          workoutSession?.plan_description?.trim() ||
          undefined,
        backHref: allenamentiHeaderBackHref,
      })
      return () => setTopBarConfig(null)
    }

    if (!showHeaderScroll) {
      setTopBarConfig(null)
      return () => setTopBarConfig(null)
    }

    setTopBarConfig({
      title: workoutSession.plan_name?.trim() || 'Allenamento',
      subtitle:
        workoutSession.day_title?.trim() || workoutSession.plan_description?.trim() || undefined,
      backHref: allenamentiHeaderBackHref,
    })
    return () => setTopBarConfig(null)
  }, [
    setTopBarConfig,
    authLoading,
    loading,
    error,
    workoutSession,
    showHeaderScroll,
    allenamentiHeaderBackHref,
  ])

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
      clearEmbedDirtyForSyncRef.current()
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
      clearEmbedDirtyForSyncRef.current()
    }
  }, [currentWorkout, loading, authLoading, exerciseId, workoutDayId])

  useEffect(() => {
    if (!athleteProfileId || !privateNotesFetchKey) {
      setPrivateNotesByWdeId({})
      return
    }
    const colon = privateNotesFetchKey.indexOf(':')
    const idsCsv = colon >= 0 ? privateNotesFetchKey.slice(colon + 1) : ''
    const ids = idsCsv.split(',').filter(Boolean)
    if (ids.length === 0) return

    let cancelled = false
    ;(async () => {
      type NoteRow = {
        id: string
        workout_day_exercise_id: string | null
        note: string | null
        image_storage_path?: string | null
      }
      const rows: NoteRow[] = []
      for (const idChunk of chunkForSupabaseIn(ids)) {
        const selWithImage = 'id, workout_day_exercise_id, note, image_storage_path' as const
        const selBase = 'id, workout_day_exercise_id, note' as const
        const first = await supabase
          .from('athlete_workout_day_exercise_notes')
          .select(selWithImage)
          .eq('profile_id', athleteProfileId)
          .in('workout_day_exercise_id', idChunk)
        let data = first.data as NoteRow[] | null
        let error = first.error
        if (error && isMissingAthleteWdeNoteImageColumnError(error)) {
          const second = await supabase
            .from('athlete_workout_day_exercise_notes')
            .select(selBase)
            .eq('profile_id', athleteProfileId)
            .in('workout_day_exercise_id', idChunk)
          data = second.data as NoteRow[] | null
          error = second.error
        }
        if (error) {
          if (!cancelled) {
            logger.warn('fetch note private allenamento', {
              message: error.message,
              code: error.code,
            })
          }
          return
        }
        rows.push(...((data ?? []) as NoteRow[]))
      }

      if (cancelled) return
      const next: Record<string, AthleteWdeNoteRow> = {}
      for (const row of rows) {
        const wde = row.workout_day_exercise_id
        if (wde)
          next[wde] = {
            id: row.id,
            note: row.note ?? '',
            image_storage_path: row.image_storage_path ?? null,
          }
      }
      setPrivateNotesByWdeId(next)
    })()

    return () => {
      cancelled = true
    }
  }, [athleteProfileId, privateNotesFetchKey, supabase])

  useEffect(() => {
    const key = `${workoutSession?.workout_id ?? ''}:${workoutSession?.workout_day_id ?? ''}`
    if (!workoutSession) return
    if (lastWorkoutSessionKeyRef.current !== key) {
      lastWorkoutSessionKeyRef.current = key
      activeWorkoutLogIdRef.current = null
    }
  }, [workoutSession?.workout_id, workoutSession?.workout_day_id, workoutSession])

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

  // Ricalcola visibilità top bar (titolo) in base allo scroll quando cambia esercizio o contenuto
  useEffect(() => {
    handleScrollOggi()
  }, [handleScrollOggi, currentBlockIndex, workoutSession?.exercises?.length])

  // Reset quando cambia il blocco (video rimosso)
  useEffect(() => {
    setInlineTimerSeconds(null)
    setInlineTimerRunning(false)
    restTimerTargetRef.current = null
    timerChainModeRef.current = null
  }, [currentBlockIndex])

  // Quando il wizard circuito è aperto blocca lo scroll pagina sottostante (solo vista atleta full viewport).
  // In `/dashboard/workouts` l’overlay è `absolute` sulla colonna: non bloccare lo scroll del layout staff.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!circuitFullscreenPreview) return
    if (workoutsPane) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [circuitFullscreenPreview, workoutsPane])

  const getCircuitExerciseTimerValues = useCallback(
    (exerciseItem: Record<string, unknown>, cycleNumber?: number) => {
      const nestedExercise = ((exerciseItem?.exercise as Record<string, unknown> | undefined) ??
        null) as Record<string, unknown> | null
      const sets = ((exerciseItem?.sets as Record<string, unknown>[] | undefined) ??
        (nestedExercise?.sets as Record<string, unknown>[] | undefined) ??
        []) as Record<string, unknown>[]
      const cycleSet =
        typeof cycleNumber === 'number' && cycleNumber > 0
          ? (sets.find((set) => Number(set?.set_number ?? 0) === cycleNumber) ?? null)
          : null
      const currentSetIndex = sets.findIndex((set) => !isWorkoutSetCompleted(set))
      const activeSet =
        cycleSet ??
        (sets.length > 0 ? (currentSetIndex >= 0 ? sets[currentSetIndex] : sets[0]) : null)
      const execution =
        ((activeSet?.execution_time_sec ??
          exerciseItem?.execution_time_sec ??
          nestedExercise?.execution_time_sec ??
          null) as number | null) ?? 0
      const rest =
        ((activeSet?.rest_timer_sec ??
          exerciseItem?.rest_timer_sec ??
          nestedExercise?.rest_timer_sec ??
          null) as number | null) ?? 0
      return {
        execution: execution > 0 ? execution : 0,
        rest: rest > 0 ? rest : 60,
      }
    },
    [],
  )

  const getCircuitCycleStats = useCallback((items: Record<string, unknown>[]) => {
    const nestedSets = (item: Record<string, unknown>) => {
      const nestedExercise = (item?.exercise as Record<string, unknown> | undefined) ?? null
      return ((item?.sets as Record<string, unknown>[] | undefined) ??
        (nestedExercise?.sets as Record<string, unknown>[] | undefined) ??
        []) as Record<string, unknown>[]
    }
    const totals = items
      .map((item) => nestedSets(item as Record<string, unknown>).length)
      .filter((n) => n > 0)
    // Totale cicli = numero serie massimo tra gli esercizi del circuito.
    const totalCycles = totals.length > 0 ? Math.max(...totals) : 1
    /** Giri completati in ordine 1…N: il giro k è fatto se ogni esercizio che ha la serie k l’ha completata. Non usare min(conteggio serie spunte): un esercizio con 1 sola serie resterebbe a count 1 e bloccherebbe il contatore. */
    let completedCycles = 0
    for (let round = 1; round <= totalCycles; round++) {
      const roundDone = items.every((item) => {
        const sets = nestedSets(item as Record<string, unknown>)
        const target = sets.find((set) => Number(set?.set_number ?? 0) === round)
        if (!target) return true
        return isWorkoutSetCompleted(target)
      })
      if (roundDone) completedCycles = round
      else break
    }
    return {
      totalCycles,
      completedCycles: Math.max(0, Math.min(totalCycles, completedCycles)),
    }
  }, [])

  const getCircuitExerciseIndexesForCycle = useCallback(
    (items: Record<string, unknown>[], cycleNumber: number): number[] => {
      if (cycleNumber <= 0) return []
      return items
        .map((item, index) => {
          const nestedExercise = (item?.exercise as Record<string, unknown> | undefined) ?? null
          const sets = ((item?.sets as Record<string, unknown>[] | undefined) ??
            (nestedExercise?.sets as Record<string, unknown>[] | undefined) ??
            []) as Record<string, unknown>[]
          return sets.some((set) => Number(set?.set_number ?? 0) === cycleNumber) ? index : -1
        })
        .filter((index) => index >= 0)
    },
    [],
  )

  const updateSetByIndex = useCallback(
    (exerciseIndex: number, setNumber: number, updates: Partial<WorkoutSetData>) => {
      markEmbedDirty()
      setWorkoutSession((prev) => {
        if (!prev) return prev
        const next = applyExerciseSetPatch(prev, exerciseIndex, setNumber, updates)
        return next ?? prev
      })
    },
    [markEmbedDirty],
  )

  const updateSet = useCallback(
    (exerciseId: string, setNumber: number, updates: Partial<WorkoutSetData>) => {
      markEmbedDirty()
      const idNorm = String(exerciseId ?? '').trim()
      setWorkoutSession((prev) => {
        if (!prev?.exercises?.length) return prev
        const idx = prev.exercises.findIndex((ex) => workoutDayExerciseRowId(ex) === idNorm)
        if (idx < 0) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn(
              'updateSet: id esercizio (workout_day_exercise) non trovato nella sessione',
              {
                idNorm,
                targetN: Number(setNumber),
              },
            )
          }
          return prev
        }
        const next = applyExerciseSetPatch(prev, idx, setNumber, updates)
        return next ?? prev
      })
    },
    [markEmbedDirty],
  )

  useEffect(() => {
    if (!circuitFullscreenPreview) {
      setCircuitAutoPhase('idle')
      setCircuitAutoSeconds(null)
      setCircuitAutoRunning(false)
      circuitCycleTargetRef.current = 1
      circuitCompletedCyclesRef.current = 0
      lastCircuitExercisesRef.current = null
      return
    }
    const exercisesRef = circuitFullscreenPreview.exercises
    // Non ricalcolare ad ogni cambio activeIndex: altrimenti azzera il contatore cicli durante l'autoplay.
    if (lastCircuitExercisesRef.current === exercisesRef) return
    lastCircuitExercisesRef.current = exercisesRef
    const { totalCycles, completedCycles } = getCircuitCycleStats(
      circuitFullscreenPreview.exercises,
    )
    circuitCycleTargetRef.current = totalCycles
    circuitCompletedCyclesRef.current = completedCycles
  }, [circuitFullscreenPreview, getCircuitCycleStats])

  /** Allinea la lista esercizi del fullscreen al workout session (serie completate da autoplay circuito). */
  useEffect(() => {
    const exercises = workoutSession?.exercises
    if (!exercises?.length) return
    setCircuitFullscreenPreview((prev) => {
      if (!prev) return prev
      const block = blocks[currentBlockIndex]
      if (!block) return prev
      const fresh = exercises.slice(block.startIndex, block.endIndex + 1) as Record<
        string,
        unknown
      >[]
      return { ...prev, exercises: fresh }
    })
  }, [workoutSession?.exercises, currentBlockIndex, blocks])

  const advanceCircuitAutoplay = useCallback(() => {
    if (!circuitFullscreenPreview) return
    const total = circuitFullscreenPreview.exercises.length
    if (total <= 0) {
      setCircuitAutoRunning(false)
      setCircuitAutoPhase('completed')
      setCircuitAutoSeconds(0)
      return
    }

    const safeIndex = Math.min(Math.max(circuitFullscreenPreview.activeIndex, 0), total - 1)
    const { totalCycles, completedCycles: roundsCompleted } = getCircuitCycleStats(
      circuitFullscreenPreview.exercises,
    )
    /** Serie (set_number) del giro corrente: dopo aver completato tutte le serie N per tutti gli esercizi, roundsCompleted=N e qui risulta N+1. Non usare circuitCompletedCycles+1 alla fine del rest (si sommava già il sync da sessione). */
    const currentCycleNumber = Math.min(totalCycles, Math.max(1, roundsCompleted + 1))
    const cycleIndexes = getCircuitExerciseIndexesForCycle(
      circuitFullscreenPreview.exercises,
      currentCycleNumber,
    )
    if (cycleIndexes.length <= 0) {
      if (roundsCompleted >= totalCycles) {
        setCircuitAutoPhase('completed')
        setCircuitAutoSeconds(0)
        setCircuitAutoRunning(false)
      } else {
        setCircuitAutoPhase('prepare')
        setCircuitAutoSeconds(CIRCUIT_FULLSCREEN_PREPARE_SECONDS)
        setCircuitAutoRunning(true)
      }
      return
    }
    const normalizedIndex = cycleIndexes.includes(safeIndex) ? safeIndex : cycleIndexes[0]
    const cyclePosition = cycleIndexes.indexOf(normalizedIndex)
    const activeItem = circuitFullscreenPreview.exercises[normalizedIndex] ?? null
    const { execution, rest } = activeItem
      ? getCircuitExerciseTimerValues(activeItem as Record<string, unknown>, currentCycleNumber)
      : { execution: 0, rest: 60 }

    if (circuitAutoPhase === 'prepare') {
      if (normalizedIndex !== safeIndex) {
        setCircuitFullscreenPreview((prev) =>
          prev ? { ...prev, activeIndex: normalizedIndex } : prev,
        )
      }
      if (execution > 0) {
        setCircuitAutoPhase('execution')
        setCircuitAutoSeconds(execution)
        setCircuitAutoRunning(true)
        return
      }
      setCircuitAutoPhase('reps')
      setCircuitAutoSeconds(null)
      setCircuitAutoRunning(false)
      return
    }

    if (circuitAutoPhase === 'execution' || circuitAutoPhase === 'reps') {
      const block = blocks[currentBlockIndex]
      if (block) {
        const sessionExerciseIndex = block.startIndex + normalizedIndex
        if (
          sessionExerciseIndex >= block.startIndex &&
          sessionExerciseIndex <= block.endIndex &&
          currentCycleNumber > 0
        ) {
          updateSetByIndex(sessionExerciseIndex, currentCycleNumber, { completed: true })
        }
      }
      if (cyclePosition < cycleIndexes.length - 1) {
        const nextIndex = cycleIndexes[cyclePosition + 1]
        setCircuitFullscreenPreview((prev) =>
          prev ? { ...prev, activeIndex: Math.min(prev.exercises.length - 1, nextIndex) } : prev,
        )
        setCircuitAutoPhase('prepare')
        setCircuitAutoSeconds(CIRCUIT_FULLSCREEN_PREPARE_SECONDS)
        setCircuitAutoRunning(true)
        return
      }

      // Nessun altro esercizio del ciclo corrente: vai al recupero finale.
      setCircuitAutoPhase('rest')
      setCircuitAutoSeconds(rest > 0 ? rest : 1)
      setCircuitAutoRunning(true)
      return
    }

    if (circuitAutoPhase === 'rest') {
      const { totalCycles: tc, completedCycles: cc } = getCircuitCycleStats(
        circuitFullscreenPreview.exercises,
      )
      if (cc >= tc) {
        setCircuitAutoPhase('completed')
        setCircuitAutoSeconds(0)
        setCircuitAutoRunning(false)
        return
      }
      setCircuitFullscreenPreview((prev) => (prev ? { ...prev, activeIndex: 0 } : prev))
      setCircuitAutoPhase('prepare')
      setCircuitAutoSeconds(CIRCUIT_FULLSCREEN_PREPARE_SECONDS)
      setCircuitAutoRunning(true)
    }
  }, [
    circuitAutoPhase,
    circuitFullscreenPreview,
    getCircuitCycleStats,
    getCircuitExerciseIndexesForCycle,
    getCircuitExerciseTimerValues,
    blocks,
    currentBlockIndex,
    updateSetByIndex,
  ])

  useEffect(() => {
    if (!circuitAutoRunning || circuitAutoSeconds === null || circuitAutoSeconds <= 0)
      return undefined
    const intervalId = window.setInterval(() => {
      setCircuitAutoSeconds((prev) => {
        if (prev === null) return prev
        if (prev <= 1) {
          window.setTimeout(() => {
            advanceCircuitAutoplay()
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [advanceCircuitAutoplay, circuitAutoRunning, circuitAutoSeconds])

  const startCircuitAutoplay = useCallback(() => {
    if (!circuitFullscreenPreview) return
    if (circuitAutoPhase === 'idle') {
      const { totalCycles, completedCycles } = getCircuitCycleStats(
        circuitFullscreenPreview.exercises,
      )
      circuitCycleTargetRef.current = totalCycles
      circuitCompletedCyclesRef.current = completedCycles
    }
    setCircuitAutoPhase('prepare')
    setCircuitAutoSeconds(CIRCUIT_FULLSCREEN_PREPARE_SECONDS)
    setCircuitAutoRunning(true)
  }, [circuitAutoPhase, circuitFullscreenPreview, getCircuitCycleStats])

  const toggleCircuitAutoplayPause = useCallback(() => {
    if (circuitAutoPhase === 'idle' || circuitAutoPhase === 'completed') return
    setCircuitAutoRunning((prev) => !prev)
  }, [circuitAutoPhase])

  const circuitFullscreenProgressModel = useMemo(() => {
    if (!circuitFullscreenPreview) return null
    const totalExercises = circuitFullscreenPreview.exercises.length
    const { totalCycles: tc, completedCycles: rc } = getCircuitCycleStats(
      circuitFullscreenPreview.exercises,
    )
    const currentCycleNumber = Math.min(Math.max(1, tc), Math.max(1, rc + 1))
    const safeIndex =
      totalExercises > 0
        ? Math.min(Math.max(circuitFullscreenPreview.activeIndex, 0), totalExercises - 1)
        : 0
    const activeItem = circuitFullscreenPreview.exercises[safeIndex]
    const activeExercise = ((activeItem?.exercise as Record<string, unknown> | undefined) ??
      {}) as Record<string, unknown>
    const activeSets = ((activeItem?.sets as Record<string, unknown>[] | undefined) ??
      []) as Record<string, unknown>[]
    const activeSetIndex =
      activeSets.length > 0
        ? activeSets.findIndex((set) => Number(set?.set_number ?? 0) === currentCycleNumber)
        : -1
    const activeSet =
      activeSets.length > 0
        ? activeSetIndex >= 0
          ? activeSets[activeSetIndex]
          : activeSets[0]
        : null
    const valueReps = displayWorkoutRepsCell(
      (activeSet?.reps as number | null | undefined) ?? null,
      (activeExercise.target_reps as number | null | undefined) ?? null,
    )
    const valueRepsNum = typeof valueReps === 'number' ? valueReps : 0
    const valueExecutionRaw = (activeSet?.execution_time_sec ??
      activeItem?.execution_time_sec ??
      activeExercise?.execution_time_sec ??
      null) as number | string | null | undefined
    const valueExecution =
      valueExecutionRaw == null
        ? null
        : Number.isFinite(Number(valueExecutionRaw))
          ? Number(valueExecutionRaw)
          : null
    const valueRestRaw = (activeSet?.rest_timer_sec ??
      activeItem?.rest_timer_sec ??
      activeExercise?.rest_timer_sec ??
      null) as number | string | null | undefined
    const valueRest =
      valueRestRaw == null
        ? null
        : Number.isFinite(Number(valueRestRaw))
          ? Number(valueRestRaw)
          : null
    const circuitTimerMainValue =
      circuitAutoSeconds !== null
        ? circuitAutoSeconds
        : circuitAutoPhase === 'reps'
          ? valueRepsNum
          : circuitAutoPhase === 'execution' && valueExecution != null && valueExecution > 0
            ? valueExecution
            : circuitAutoPhase === 'prepare'
              ? CIRCUIT_FULLSCREEN_PREPARE_SECONDS
              : 5
    const circuitPhaseTotalSeconds =
      circuitAutoPhase === 'prepare'
        ? CIRCUIT_FULLSCREEN_PREPARE_SECONDS
        : circuitAutoPhase === 'execution'
          ? valueExecution != null && valueExecution > 0
            ? valueExecution
            : circuitTimerMainValue
          : circuitAutoPhase === 'reps'
            ? 0
            : circuitAutoPhase === 'rest'
              ? valueRest != null && valueRest > 0
                ? valueRest
                : 60
              : 0
    const circuitProgressPercent =
      circuitAutoPhase === 'completed'
        ? 0
        : circuitAutoPhase === 'idle'
          ? 100
          : circuitPhaseTotalSeconds > 0
            ? Math.min(
                100,
                Math.max(
                  0,
                  ((circuitAutoSeconds ?? circuitPhaseTotalSeconds) / circuitPhaseTotalSeconds) *
                    100,
                ),
              )
            : 0
    const phaseKey = `${circuitAutoPhase}-${circuitPhaseTotalSeconds}-${currentCycleNumber}-${safeIndex}`
    return {
      circuitPhaseTotalSeconds,
      circuitProgressPercent,
      phaseKey,
    }
  }, [
    circuitFullscreenPreview,
    circuitAutoPhase,
    circuitAutoSeconds,
    getCircuitCycleStats,
  ])

  const smoothCircuitProgressPercent = useSmoothCircuitProgressPercent(
    circuitFullscreenProgressModel
      ? {
          active:
            circuitAutoPhase !== 'reps' &&
            circuitFullscreenProgressModel.circuitPhaseTotalSeconds > 0,
          phaseKey: circuitFullscreenProgressModel.phaseKey,
          phaseTotalSeconds: circuitFullscreenProgressModel.circuitPhaseTotalSeconds,
          remainingSeconds: circuitAutoSeconds,
          running: circuitAutoRunning,
          stalePercent: circuitFullscreenProgressModel.circuitProgressPercent,
        }
      : {
          active: false,
          phaseKey: '',
          phaseTotalSeconds: 0,
          remainingSeconds: null,
          running: false,
          stalePercent: 0,
        },
  )

  const _completeExercise = (exerciseId: string) => {
    markEmbedDirty()
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

  type BlockExerciseForSave = {
    id: string
    exercise_id?: string | null
    sets?: Array<{
      set_number: number
      reps?: number | null
      weight_kg?: number | null
      execution_time_sec?: number | null
      rest_timer_sec?: number | null
    }>
  }

  const ensureActiveWorkoutLog = useCallback(async (): Promise<string | null> => {
    if (activeWorkoutLogIdRef.current) return activeWorkoutLogIdRef.current
    if (!athleteProfileId) return null
    const ws = workoutSessionRef.current
    if (!ws) return null
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        athlete_id: athleteProfileId,
        atleta_id: athleteProfileId,
        scheda_id: ws.workout_id || null,
        workout_day_id: ws.workout_day_id ?? null,
        data: new Date().toISOString().split('T')[0],
        stato: 'in_corso',
        started_at: new Date().toISOString(),
        completed_at: null,
        esercizi_completati: 0,
        esercizi_totali: ws.total_exercises ?? 0,
        durata_minuti: null,
        volume_totale: null,
        note: null,
        execution_mode: 'solo',
        is_coached: false,
        coached_by_profile_id: null,
      } as never)
      .select('id')
      .single()
    if (error || !data?.id) {
      logger.error('Creazione workout_log in_corso fallita', error)
      addToast({
        title: 'Errore',
        message: 'Impossibile salvare la sessione. Riprova.',
        variant: 'error',
      })
      return null
    }
    activeWorkoutLogIdRef.current = data.id
    return data.id
  }, [athleteProfileId, supabase, addToast])

  const saveCompletedBlockToDb = useCallback(
    async (blockExercises: BlockExerciseForSave[]) => {
      postEmbedSaveEvent({ type: STAFF_WORKOUTS_EMBED_SAVE_START, scope: 'block' })
      const logId = await ensureActiveWorkoutLog()
      if (!logId) {
        postEmbedSaveEvent({
          type: STAFF_WORKOUTS_EMBED_SAVE_ERROR,
          scope: 'block',
          message: 'Impossibile salvare la sessione. Riprova.',
        })
        return
      }
      const now = new Date().toISOString()
      for (const ex of blockExercises) {
        const wdeId = ex.id
        const { error: delErr } = await supabase
          .from('workout_sets')
          .delete()
          .eq('workout_log_id', logId)
          .eq('workout_day_exercise_id', wdeId)
        if (delErr) {
          logger.warn('Eliminazione serie precedenti per blocco', delErr, { wdeId, logId })
        }
        const sets = ex.sets ?? []
        const catalogExId = catalogExerciseIdFromSessionExercise(ex)
        for (const set of sets) {
          const { error: insErr } = await supabase.from('workout_sets').insert({
            workout_day_exercise_id: wdeId,
            ...(catalogExId ? { exercise_id: catalogExId } : {}),
            set_number: set.set_number,
            reps: set.reps ?? null,
            weight_kg: set.weight_kg != null ? Number(set.weight_kg) : null,
            execution_time_sec: set.execution_time_sec ?? null,
            rest_timer_sec: set.rest_timer_sec ?? null,
            completed_at: now,
            workout_log_id: logId,
          } as never)
          if (insErr) {
            logger.error('insert set blocco fallito', insErr, { wdeId, set_number: set.set_number })
            throw insErr
          }
        }
      }
      clearEmbedDirty()
      postEmbedSaveEvent({ type: STAFF_WORKOUTS_EMBED_SAVE_OK, scope: 'block' })
      void invalidateAfterWorkoutSessionWrite(queryClient, user?.user_id ?? null)
    },
    [
      ensureActiveWorkoutLog,
      supabase,
      clearEmbedDirty,
      postEmbedSaveEvent,
      queryClient,
      user?.user_id,
    ],
  )

  /** Alla chiusura sessione: allinea DB a tutta la sessione (non solo blocchi marcati completati). */
  const persistAllSessionSetsToWorkoutLog = useCallback(
    async (
      logId: string,
      exercisesPayload: SessionExerciseSetsForLog[],
      completedAtIso: string,
    ) => {
      for (const ex of exercisesPayload) {
        const wdeId = ex.id
        const { error: delErr } = await supabase
          .from('workout_sets')
          .delete()
          .eq('workout_log_id', logId)
          .eq('workout_day_exercise_id', wdeId)
        if (delErr) {
          logger.warn('Eliminazione serie prima di sync finale sessione', delErr, { wdeId, logId })
        }
        const sets = ex.sets ?? []
        const catalogExIdFinale = catalogExerciseIdFromSessionExercise(ex)
        for (const set of sets) {
          const { error: insErr } = await supabase.from('workout_sets').insert({
            workout_day_exercise_id: wdeId,
            ...(catalogExIdFinale ? { exercise_id: catalogExIdFinale } : {}),
            set_number: set.set_number,
            reps: set.reps ?? null,
            weight_kg: set.weight_kg != null ? Number(set.weight_kg) : null,
            execution_time_sec: set.execution_time_sec ?? null,
            rest_timer_sec: set.rest_timer_sec ?? null,
            completed_at: completedAtIso,
            workout_log_id: logId,
          } as never)
          if (insErr) {
            logger.error('insert set (sync finale sessione) fallito', insErr, {
              wdeId,
              set_number: set.set_number,
            })
            throw insErr
          }
        }
      }
    },
    [supabase],
  )

  const removeBlockFromDb = useCallback(
    async (wdeIds: string[]) => {
      postEmbedSaveEvent({ type: STAFF_WORKOUTS_EMBED_SAVE_START, scope: 'block' })
      const logId = activeWorkoutLogIdRef.current
      if (!logId || wdeIds.length === 0) {
        postEmbedSaveEvent({
          type: STAFF_WORKOUTS_EMBED_SAVE_ERROR,
          scope: 'block',
          message: 'Nessuna sessione attiva da aggiornare.',
        })
        return
      }
      for (const wdeId of wdeIds) {
        const { error } = await supabase
          .from('workout_sets')
          .delete()
          .eq('workout_log_id', logId)
          .eq('workout_day_exercise_id', wdeId)
        if (error) {
          logger.warn('Eliminazione serie su annulla completamento', error, { wdeId })
        }
      }
      clearEmbedDirty()
      postEmbedSaveEvent({ type: STAFF_WORKOUTS_EMBED_SAVE_OK, scope: 'block' })
    },
    [supabase, clearEmbedDirty, postEmbedSaveEvent],
  )

  /** Completa (o toglie completamento) all'intero blocco: singolo esercizio o circuito */
  const completeBlock = (blockIndex: number) => {
    const block = blocks[blockIndex]
    if (!block || !workoutSession) return
    markEmbedDirty()
    const exercisesList = workoutSession.exercises
    if (!exercisesList) return
    const prev = workoutSession
    const start = block.startIndex
    const end = block.endIndex
    const slice = exercisesList.slice(start, end + 1) as Record<string, unknown>[]
    const anyIncomplete = slice.some((ex) => !(ex.is_completed as boolean))
    const newStatus = anyIncomplete

    const exercises = exercisesList.map((ex, idx) => {
      if (idx >= start && idx <= end) {
        return { ...ex, is_completed: newStatus }
      }
      return ex
    })
    const completedCount = exercises.filter(
      (ex) => (ex as { is_completed?: boolean }).is_completed === true,
    ).length
    const nextSession: WorkoutSession = {
      ...prev,
      exercises,
      completed_exercises: completedCount,
      progress_percentage: Math.round((completedCount / (prev.total_exercises || 1)) * 100),
    }
    setWorkoutSession(nextSession)

    const blockExercises = exercises.slice(start, end + 1) as BlockExerciseForSave[]

    if (newStatus) {
      void (async () => {
        try {
          await saveCompletedBlockToDb(blockExercises)
        } catch (e) {
          logger.error('Salvataggio blocco esercizio fallito', e)
          postEmbedSaveEvent({
            type: STAFF_WORKOUTS_EMBED_SAVE_ERROR,
            scope: 'block',
            message: 'Impossibile salvare i dati dell’esercizio.',
          })
          addToast({
            title: 'Errore',
            message: 'Impossibile salvare i dati dell’esercizio.',
            variant: 'error',
          })
        }
      })()
    } else {
      void (async () => {
        try {
          await removeBlockFromDb(blockExercises.map((e) => e.id))
        } catch (e) {
          logger.error('Annulla completamento blocco fallito', e)
          postEmbedSaveEvent({
            type: STAFF_WORKOUTS_EMBED_SAVE_ERROR,
            scope: 'block',
            message: 'Impossibile aggiornare i dati dell’esercizio.',
          })
        }
      })()
    }
  }

  const handleRestTimerComplete = () => {
    setShowRestTimer(false)

    // Controlla se l'esercizio ha execution_time_sec e mostra il timer di esecuzione
    if (currentExercise) {
      const sets = (currentExercise.sets as Record<string, unknown>[]) || []
      const currentSetIndex = sets.findIndex((s) => !isWorkoutSetCompleted(s))
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
        setInlineExecutionTimerRunning(false)
        setInlineExecutionPreRollRemaining(5)
      }
    }
  }

  const toggleInlineExecutionTimer = () => {
    if (currentExercise) {
      if (inlineExecutionPreRollRemaining !== null) {
        timerChainModeRef.current = null
        resetInlineExecutionTimer()
        return
      }

      // Se il timer è già in esecuzione, resettalo invece di metterlo in pausa (stessa logica del timer di recupero)
      if (inlineExecutionTimerRunning && inlineExecutionTimerSeconds !== null) {
        timerChainModeRef.current = null
        resetInlineExecutionTimer()
        return
      }

      // Se il timer è a 0 (completato), resettalo (stessa logica del timer di recupero)
      if (inlineExecutionTimerSeconds === 0) {
        const restPhaseAfterExecution =
          timerChainModeRef.current === 'execution_then_rest' &&
          inlineTimerRunning &&
          inlineTimerSeconds !== null &&
          inlineTimerSeconds > 0
        if (!restPhaseAfterExecution) {
          timerChainModeRef.current = null
        }
        resetInlineExecutionTimer()
        return
      }

      // Se il timer non è ancora stato avviato, avvialo
      if (inlineExecutionTimerSeconds === null) {
        const sets = (currentExercise.sets as Record<string, unknown>[]) || []
        const currentSetIndex = sets.findIndex((s) => !isWorkoutSetCompleted(s))
        const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
        const executionTime =
          ((activeSet?.execution_time_sec ?? currentExercise.execution_time_sec ?? null) as
            | number
            | null) ?? null

        if (executionTime !== null && executionTime > 0) {
          setInlineExecutionTimerSeconds(executionTime)
          setInlineExecutionTimerRunning(false)
          setInlineExecutionPreRollRemaining(5)
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
    setInlineExecutionPreRollRemaining(null)
  }

  // Gestione timer inline circolare
  const toggleInlineTimer = () => {
    if (
      timerChainModeRef.current === 'execution_then_rest' &&
      (inlineExecutionTimerRunning || inlineExecutionPreRollRemaining !== null)
    ) {
      return
    }
    if (currentExercise) {
      // Se il timer è già in esecuzione, resettalo invece di metterlo in pausa
      if (inlineTimerRunning && inlineTimerSeconds !== null) {
        resetInlineTimer()
        return
      }

      const sets = (currentExercise.sets as Record<string, unknown>[]) || []
      const currentSetIndex = sets.findIndex((s) => !isWorkoutSetCompleted(s))
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
        restTimerTargetRef.current = {
          exerciseId: workoutDayExerciseRowId(currentExercise),
          setNumber: Number(activeSet.set_number) || 1,
          exerciseIndex: currentExerciseIndex,
        }
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
    restTimerTargetRef.current = null
    setRestTimersOverlayOpen(false)
    timerChainModeRef.current = null
  }

  const dismissRestTimersOverlay = () => {
    resetInlineExecutionTimer()
    resetInlineTimer()
  }

  /** Avvia il timer di recupero inline con i secondi del set indicato (stessa logica della colonna Recupero). */
  const startRestTimerFromSet = (
    set: Record<string, unknown>,
    exercise: Record<string, unknown>,
  ) => {
    timerChainModeRef.current = 'rest_then_execution'
    setInlineExecutionTimerSeconds(null)
    setInlineExecutionTimerRunning(false)
    setInlineExecutionPreRollRemaining(null)
    const restSec = ((set.rest_timer_sec ?? exercise.rest_timer_sec ?? null) as number | null) ?? 0
    if (restSec <= 0) {
      return
    }
    const finalRest = restSec
    playTimerTone(timerAudioContextRef, 700, 0.5)
    const exIdx = resolveExerciseIndexInSession(workoutSessionRef.current?.exercises, exercise)
    restTimerTargetRef.current = {
      exerciseId: workoutDayExerciseRowId(exercise),
      setNumber: Number(set.set_number) || 1,
      exerciseIndex: exIdx >= 0 ? exIdx : null,
    }
    setInlineTimerSeconds(finalRest)
    setInlineTimerRunning(true)
    setRestTimersOverlayOpen(true)
  }

  /** Play colonna tempo: overlay con prima esecuzione, poi recupero; a fine recupero serie completata e overlay chiuso. */
  const startExecutionThenRestFromSet = (
    set: Record<string, unknown>,
    exercise: Record<string, unknown>,
  ) => {
    const execSec =
      ((set.execution_time_sec ?? exercise.execution_time_sec ?? null) as number | null) ?? 0
    if (execSec <= 0) return

    timerChainModeRef.current = 'execution_then_rest'
    setInlineTimerSeconds(null)
    setInlineTimerRunning(false)
    const exIdx = resolveExerciseIndexInSession(workoutSessionRef.current?.exercises, exercise)
    restTimerTargetRef.current = {
      exerciseId: workoutDayExerciseRowId(exercise),
      setNumber: Number(set.set_number) || 1,
      exerciseIndex: exIdx >= 0 ? exIdx : null,
    }
    setInlineExecutionTimerSeconds(execSec)
    setInlineExecutionTimerRunning(false)
    setInlineExecutionPreRollRemaining(5)
    setRestTimersOverlayOpen(true)
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
        const currentSetIndex = sets.findIndex((s) => !isWorkoutSetCompleted(s))
        const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
        // Usa la stessa logica della colonna "RECUPERO (SEC)" nella tabella
        const newTimerValue =
          ((activeSet?.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as
            | number
            | null) ?? 0
        const finalValue = newTimerValue > 0 ? newTimerValue : null

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
          // Suoni ultimi 5 secondi: volume crescente; ultimo secondo = suono più prolungato
          // (suoniamo in base al valore prima del decremento, quindi prev 2 = ultimo secondo)
          if (prev !== null && prev > 1 && prev <= 6) {
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
            // Non chiamare setState su altri componenti o altri hook da dentro questo updater:
            // differiamo dopo il commit (es. embed dirty su WorkoutsShell).
            queueMicrotask(() => {
              setInlineTimerRunning(false)
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200])
              }

              const currentExerciseForTimer = workoutSession?.exercises?.[currentExerciseIndex] as
                | Record<string, unknown>
                | undefined
              if (currentExerciseForTimer) {
                const chainMode = timerChainModeRef.current
                const sets = (currentExerciseForTimer.sets as Record<string, unknown>[]) || []
                const currentSetIndex = sets.findIndex((s) => !isWorkoutSetCompleted(s))
                const activeSet =
                  currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
                const bound = restTimerTargetRef.current
                const setNum = (activeSet?.set_number as number) ?? 1

                if (chainMode === 'execution_then_rest') {
                  if (bound) {
                    if (bound.exerciseIndex !== null && bound.exerciseIndex >= 0) {
                      updateSetByIndex(bound.exerciseIndex, bound.setNumber, { completed: true })
                    } else {
                      updateSet(bound.exerciseId, bound.setNumber, { completed: true })
                    }
                  } else {
                    updateSet(workoutDayExerciseRowId(currentExerciseForTimer), setNum, {
                      completed: true,
                    })
                  }
                  restTimerTargetRef.current = null
                  timerChainModeRef.current = null
                  return
                }

                // rest_then_execution: dopo recupero mostra eventuale esecuzione e segna serie completata
                const executionTime =
                  ((activeSet?.execution_time_sec ??
                    currentExerciseForTimer.execution_time_sec ??
                    null) as number | null) ?? null

                if (process.env.NODE_ENV === 'development') {
                  console.log('Timer recupero completato - Verifica execution_time_sec:', {
                    executionTime,
                    activeSetExecutionTime: activeSet?.execution_time_sec,
                    exerciseExecutionTime: currentExerciseForTimer.execution_time_sec,
                    willShowTimer: executionTime !== null && executionTime > 0,
                  })
                }

                if (executionTime !== null && executionTime > 0) {
                  setInlineExecutionTimerSeconds(executionTime)
                  setInlineExecutionTimerRunning(false)
                  setInlineExecutionPreRollRemaining(5)
                }
                if (bound) {
                  if (bound.exerciseIndex !== null && bound.exerciseIndex >= 0) {
                    updateSetByIndex(bound.exerciseIndex, bound.setNumber, { completed: true })
                  } else {
                    updateSet(bound.exerciseId, bound.setNumber, { completed: true })
                  }
                } else {
                  updateSet(workoutDayExerciseRowId(currentExerciseForTimer), setNum, {
                    completed: true,
                  })
                }
                restTimerTargetRef.current = null
              }
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
    return undefined
  }, [
    inlineTimerRunning,
    inlineTimerSeconds,
    workoutSession?.exercises,
    currentExerciseIndex,
    updateSet,
    updateSetByIndex,
  ])

  // Prima dell’esecuzione: 5 secondi con beep a frequenza crescente, poi parte il countdown
  useEffect(() => {
    if (inlineExecutionPreRollRemaining === null) return undefined
    playExecutionPreRollTone(timerAudioContextRef, inlineExecutionPreRollRemaining)
    const id = window.setTimeout(() => {
      setInlineExecutionPreRollRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setInlineExecutionTimerRunning(true)
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearTimeout(id)
  }, [inlineExecutionPreRollRemaining])

  // Chiude l'overlay timer quando recupero ed eventuale esecuzione sono terminati
  useEffect(() => {
    if (!restTimersOverlayOpen) return
    if (inlineExecutionPreRollRemaining !== null) return
    const recoveryDone =
      inlineTimerSeconds !== null && inlineTimerSeconds === 0 && !inlineTimerRunning
    if (!recoveryDone) return
    const executionRunning =
      inlineExecutionTimerRunning &&
      inlineExecutionTimerSeconds !== null &&
      inlineExecutionTimerSeconds > 0
    if (executionRunning) return
    const executionSettled =
      inlineExecutionTimerSeconds === null ||
      (inlineExecutionTimerSeconds === 0 && !inlineExecutionTimerRunning)
    if (executionSettled) {
      setRestTimersOverlayOpen(false)
    }
  }, [
    restTimersOverlayOpen,
    inlineTimerSeconds,
    inlineTimerRunning,
    inlineExecutionTimerSeconds,
    inlineExecutionTimerRunning,
    inlineExecutionPreRollRemaining,
  ])

  // Effetto per il countdown del timer di esecuzione inline
  useEffect(() => {
    if (
      inlineExecutionPreRollRemaining !== null ||
      !inlineExecutionTimerRunning ||
      inlineExecutionTimerSeconds === null ||
      inlineExecutionTimerSeconds <= 0
    ) {
      return undefined
    }
    const interval = setInterval(() => {
      setInlineExecutionTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setInlineExecutionTimerRunning(false)
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200])
          }
          if (timerChainModeRef.current === 'execution_then_rest' && restTimerTargetRef.current) {
            const b = restTimerTargetRef.current
            const list = workoutSessionRef.current?.exercises
            const ex = (
              b.exerciseIndex !== null && b.exerciseIndex >= 0
                ? list?.[b.exerciseIndex]
                : list?.find((e) => workoutDayExerciseRowId(e) === String(b.exerciseId).trim())
            ) as Record<string, unknown> | undefined
            if (ex) {
              const setList = (ex.sets as Record<string, unknown>[]) || []
              const st =
                setList.find((s) => (s.set_number as number) === b.setNumber) ??
                setList[setList.length - 1]
              const restSec =
                ((st?.rest_timer_sec ?? ex.rest_timer_sec ?? null) as number | null) ?? 0
              if (restSec > 0) {
                setInlineTimerSeconds(restSec)
                setInlineTimerRunning(true)
                playTimerTone(timerAudioContextRef, 700, 0.5)
              } else {
                if (b.exerciseIndex !== null && b.exerciseIndex >= 0) {
                  updateSetByIndex(b.exerciseIndex, b.setNumber, { completed: true })
                } else {
                  updateSet(b.exerciseId, b.setNumber, { completed: true })
                }
                restTimerTargetRef.current = null
                timerChainModeRef.current = null
                setRestTimersOverlayOpen(false)
              }
            }
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [
    inlineExecutionTimerRunning,
    inlineExecutionTimerSeconds,
    inlineExecutionPreRollRemaining,
    updateSet,
    updateSetByIndex,
  ])

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
    /** Embed iframe: coachato. Dashboard Workouts: coachato solo se c'è allenamento valido in agenda per lo slot. App atleta: solo. */
    const withTrainer =
      workoutsPane != null ? Boolean(workoutsPane.countCompletionAsCoached) : Boolean(isPreview)
    void handleTrainerSessionConfirm(withTrainer)
  }

  const handleTrainerSessionConfirm = async (withTrainer: boolean) => {
    try {
      setCompletingWorkout(true)
      postEmbedSaveEvent({ type: STAFF_WORKOUTS_EMBED_SAVE_START, scope: 'workout' })

      if (!athleteProfileId) {
        throw new Error('Profilo atleta non disponibile')
      }
      const profileTyped = { id: athleteProfileId }

      let coachedByProfileId: string | null = null
      if (withTrainer) {
        if (isPreview) {
          const { data: tid } = await supabase.rpc('get_current_trainer_profile_id')
          let staffPid = typeof tid === 'string' ? tid.trim() : ''
          if (!staffPid) {
            const { data: sid } = await supabase.rpc('get_current_staff_profile_id')
            staffPid = typeof sid === 'string' ? sid.trim() : ''
          }
          if (!staffPid) {
            const { data: gid } = await supabase.rpc('get_profile_id')
            staffPid = typeof gid === 'string' ? gid.trim() : ''
          }
          coachedByProfileId = staffPid || null
        } else {
          const { data: trainerRow } = await supabase.rpc('get_my_trainer_profile')
          const row =
            Array.isArray(trainerRow) && trainerRow[0]
              ? (trainerRow[0] as { pt_id?: string })
              : null
          coachedByProfileId = row?.pt_id ?? null
        }
      }

      type ExWithSets = {
        id: string
        sets?: Array<{
          set_number: number
          reps?: number | null
          weight_kg?: number | null
          execution_time_sec?: number | null
          rest_timer_sec?: number | null
        }>
      }
      const exercises: ExWithSets[] = (workoutSession?.exercises ?? []) as ExWithSets[]

      const durataMinuti =
        sessionStartedAtRef.current != null
          ? Math.round((Date.now() - sessionStartedAtRef.current) / 60000)
          : null

      const completedAt = new Date().toISOString()
      const today = completedAt.split('T')[0]

      const syncPayload = sessionExercisesToPersistPayload(
        workoutSession?.exercises as unknown[] | undefined,
      )

      /** Senza log incrementale (mai salvato un blocco in sessione), prima era solo insert nuovo log:
       * spesso le serie non venivano persistite. Creiamo il log in_corso qui e unifichiamo il sync. */
      let logId = activeWorkoutLogIdRef.current
      if (!logId) {
        const ensured = await ensureActiveWorkoutLog()
        if (ensured) {
          logId = ensured
          activeWorkoutLogIdRef.current = ensured
        }
      }

      if (logId) {
        try {
          await persistAllSessionSetsToWorkoutLog(logId, syncPayload, completedAt)
        } catch (syncErr) {
          logger.error('Sync finale serie sessione fallito', syncErr)
          throw new Error(
            syncErr instanceof Error
              ? syncErr.message
              : 'Impossibile salvare tutte le serie dell’allenamento.',
          )
        }

        const wdeIdsForRepair = syncPayload.map((e) => e.id).filter((id) => id.trim().length > 0)
        try {
          const linked = await repairOrphanWorkoutSetsToLog(
            supabase,
            logId,
            wdeIdsForRepair,
            completedAt,
            completedAt,
          )
          if (linked > 0) {
            logger.info('Serie orfane riagganciate al workout_log', {
              count: linked,
              workoutLogId: logId,
            })
          }
        } catch (repairErr) {
          logger.warn('Repair serie orfane non riuscito (non bloccante)', repairErr, {
            workoutLogId: logId,
          })
        }

        const { data: setsRows, error: setsErr } = await supabase
          .from('workout_sets')
          .select('reps, weight_kg')
          .eq('workout_log_id', logId)

        if (setsErr) {
          logger.warn('Lettura volume workout_sets', setsErr)
        }

        let volumeTotale = 0
        for (const row of setsRows ?? []) {
          const r = row.reps ?? 0
          const w = row.weight_kg != null ? Number(row.weight_kg) : 0
          if (r > 0 && w >= 0) volumeTotale += r * w
        }

        const { error: updErr } = await supabase
          .from('workout_logs')
          .update({
            stato: 'completato',
            completed_at: completedAt,
            data: today,
            esercizi_completati: workoutSession?.completed_exercises ?? 0,
            esercizi_totali: workoutSession?.total_exercises ?? 0,
            durata_minuti: durataMinuti,
            volume_totale: volumeTotale > 0 ? volumeTotale : null,
            note: withTrainer ? 'Completato con trainer' : 'Completato da solo',
            execution_mode: withTrainer ? 'coached' : 'solo',
            is_coached: withTrainer,
            coached_by_profile_id: coachedByProfileId,
          } as never)
          .eq('id', logId)
          .eq('atleta_id', profileTyped.id)

        if (updErr) {
          logger.error('Aggiornamento workout_log fallito', updErr)
          throw new Error(updErr.message || 'Errore aggiornamento log allenamento')
        }

        activeWorkoutLogIdRef.current = null

        if (withTrainer) {
          await requestCoachedSessionDebit(logId)
        }

        addToast({
          title: 'Successo',
          message: 'Allenamento completato!',
          variant: 'success',
        })

        await invalidateAfterWorkoutSessionWrite(queryClient, user?.user_id ?? null)

        clearEmbedDirty()
        postEmbedSaveEvent({ type: STAFF_WORKOUTS_EMBED_SAVE_OK, scope: 'workout' })
        clearAllenamentoOggiDraft(profileTyped.id)

        try {
          if (workoutsPane?.onWorkoutCompleted) {
            await Promise.resolve(
              workoutsPane.onWorkoutCompleted({
                athleteProfileId: profileTyped.id,
                withTrainer,
                workoutLogId: logId,
              }),
            )
          } else if (isPreview && typeof window !== 'undefined' && window.parent !== window) {
            window.parent.postMessage(
              {
                type: '22club:embed-coached-workout-done',
                athleteProfileId: profileTyped.id,
                withTrainer,
                workoutLogId: logId,
              },
              window.location.origin,
            )
          }
        } catch {
          /* ignore */
        }

        if (workoutsPane) {
          workoutsPane.navigateTo({ kind: 'riepilogo', workoutLogId: logId })
        } else {
          router.push(`${pathBase}/riepilogo?workout_id=${logId}`)
        }
        return
      }

      let volumeTotale = 0
      for (const ex of exercises) {
        for (const set of ex.sets ?? []) {
          const reps = set.reps ?? 0
          const kg = set.weight_kg != null ? Number(set.weight_kg) : 0
          if (reps > 0 && kg >= 0) volumeTotale += reps * kg
        }
      }

      type WorkoutLogInsert = {
        athlete_id: string
        atleta_id: string
        scheda_id?: string | null
        workout_day_id?: string | null
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
        workout_day_id: workoutSession?.workout_day_id ?? null,
        data: today,
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

      if (process.env.NODE_ENV === 'development') {
        console.log('[workout_log] Tentativo inserimento:', {
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
        const errorDetails: Record<string, unknown> = {
          message: logError.message || 'Errore sconosciuto',
          code: logError.code || 'UNKNOWN',
          details: logError.details || null,
          hint: logError.hint || null,
          athleteId: profileTyped.id,
          workoutLogData,
        }
        if (logError instanceof Error) {
          errorDetails.errorName = logError.name
          errorDetails.errorStack = logError.stack
        }
        if (process.env.NODE_ENV === 'development') {
          console.error('[workout_log] Errore salvataggio:', JSON.stringify(errorDetails, null, 2))
        }
        logger.error('Errore salvataggio workout_log', logError, errorDetails)
        const errorMessage =
          logError.message || "Errore nel salvataggio dell'allenamento completato"
        throw new Error(`${errorMessage}${logError.hint ? ` (${logError.hint})` : ''}`)
      }

      type WorkoutLogRow = Pick<Tables<'workout_logs'>, 'id'>
      const workoutLogId = (insertedLog as WorkoutLogRow | null)?.id

      const now = completedAt
      if (exercises.length > 0 && workoutLogId) {
        for (const ex of exercises) {
          const wdeId = ex.id
          const catId = catalogExerciseIdFromSessionExercise(ex)
          for (const set of ex.sets ?? []) {
            const { error: insErr } = await supabase.from('workout_sets').insert({
              workout_day_exercise_id: wdeId,
              ...(catId ? { exercise_id: catId } : {}),
              set_number: set.set_number,
              reps: set.reps ?? null,
              weight_kg: set.weight_kg != null ? Number(set.weight_kg) : null,
              execution_time_sec: set.execution_time_sec ?? null,
              rest_timer_sec: set.rest_timer_sec ?? null,
              completed_at: now,
              workout_log_id: workoutLogId,
            } as never)
            if (insErr) {
              logger.error('Insert set (fallback completamento) fallito', insErr, {
                wdeId,
                set_number: set.set_number,
              })
              throw new Error(
                insErr.message ||
                  'Impossibile salvare una o più serie: allenamento non completato nel database.',
              )
            }
          }
        }
      } else if (exercises.length > 0 && !workoutLogId) {
        logger.warn('workout_log senza id dopo insert', undefined, {
          workoutId: workoutSession?.workout_id,
        })
      }

      if (withTrainer && workoutLogId) {
        await requestCoachedSessionDebit(workoutLogId)
      }

      addToast({
        title: 'Successo',
        message: 'Allenamento completato!',
        variant: 'success',
      })

      await invalidateAfterWorkoutSessionWrite(queryClient, user?.user_id ?? null)

      clearEmbedDirty()
      postEmbedSaveEvent({ type: STAFF_WORKOUTS_EMBED_SAVE_OK, scope: 'workout' })
      clearAllenamentoOggiDraft(profileTyped.id)

      try {
        if (workoutsPane?.onWorkoutCompleted) {
          await Promise.resolve(
            workoutsPane.onWorkoutCompleted({
              athleteProfileId: profileTyped.id,
              withTrainer,
              workoutLogId: workoutLogId ?? undefined,
            }),
          )
        } else if (isPreview && typeof window !== 'undefined' && window.parent !== window) {
          window.parent.postMessage(
            {
              type: '22club:embed-coached-workout-done',
              athleteProfileId: profileTyped.id,
              withTrainer,
              workoutLogId: workoutLogId ?? undefined,
            },
            window.location.origin,
          )
        }
      } catch {
        /* ignore */
      }

      if (workoutsPane) {
        workoutsPane.navigateTo({ kind: 'riepilogo', workoutLogId: workoutLogId ?? undefined })
      } else {
        if (workoutLogId) {
          router.push(`${pathBase}/riepilogo?workout_id=${workoutLogId}`)
        } else {
          router.push(`${pathBase}/riepilogo`)
        }
      }
    } catch (err) {
      logger.error('Errore completamento allenamento', err)
      postEmbedSaveEvent({
        type: STAFF_WORKOUTS_EMBED_SAVE_ERROR,
        scope: 'workout',
        message: err instanceof Error ? err.message : "Errore nel completamento dell'allenamento",
      })
      addToast({
        title: 'Errore',
        message: err instanceof Error ? err.message : "Errore nel completamento dell'allenamento",
        variant: 'error',
      })
    } finally {
      setCompletingWorkout(false)
    }
  }

  // Early return se user non è valido
  if (!authLoading && authRecovery !== 'retrying' && (!user || !isValidUser)) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        {workoutsSplitPaneHeader}
        <div
          className={workoutsPaneEmbedBodyClass(
            workoutsPaneNaturalFlow,
            undefined,
            'px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 md:px-6 md:pb-28 md:pt-6 flex items-center justify-center',
          )}
        >
          <Card className="relative overflow-hidden border-red-500/30 bg-background-secondary/50 max-w-md w-full">
            <CardContent className="p-6 md:p-8 text-center relative z-10">
              <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                <Lock className="h-10 w-10 text-text-tertiary" />
              </div>
              <p className="text-text-primary mb-4 text-sm md:text-base font-medium">
                Accesso richiesto
              </p>
              <Button
                onClick={() => {
                  if (requestAuthFromParent()) return
                  router.push('/login?reason=auth_required')
                }}
                className="min-h-[44px] h-9 md:h-10 text-sm rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white"
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
        {workoutsSplitPaneHeader}
        <div
          className={workoutsPaneEmbedBodyClass(
            workoutsPaneNaturalFlow,
            undefined,
            'px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 md:px-6 md:pb-28 md:pt-6',
          )}
        />
      </div>
    )
  }

  // Nessun workout disponibile o scheda senza esercizi
  if (!workoutSession || !workoutSession.exercises || workoutSession.exercises.length === 0) {
    const isSpecificWorkout = !!workoutPlanId
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        {workoutsSplitPaneHeader}
        <div
          className={workoutsPaneEmbedBodyClass(
            workoutsPaneNaturalFlow,
            undefined,
            'px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 md:px-6 md:pb-28 md:pt-6',
          )}
        >
          <div className="mx-auto w-full max-w-lg space-y-4 md:space-y-5 lg:max-w-3xl">
            <Card className={CARD_DS}>
              <CardContent className="p-5 md:p-6 text-center relative z-10">
                <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                  <Dumbbell className="h-10 w-10 text-text-tertiary" />
                </div>
                <h3 className="text-text-primary mb-2 text-base md:text-lg font-medium">
                  {isSpecificWorkout
                    ? 'Scheda senza esercizi configurati'
                    : 'Nessun allenamento programmato per oggi'}
                </h3>
                <p className="text-text-secondary mb-4 text-xs md:text-sm line-clamp-3">
                  {isSpecificWorkout
                    ? 'Questa scheda non ha ancora esercizi configurati. Contatta il tuo trainer per completare la configurazione.'
                    : 'Contatta il tuo trainer per ricevere una scheda di allenamento'}
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    onClick={() => router.push(pathBase)}
                    className="min-h-[44px] h-9 touch-manipulation rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:h-10"
                  >
                    Vai agli Allenamenti
                  </Button>
                  {isSpecificWorkout && (
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="min-h-[44px] h-9 touch-manipulation rounded-xl border border-white/10 text-sm text-text-primary hover:bg-white/5 sm:h-10"
                    >
                      Indietro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Errore nel caricamento
  if (error) {
    return (
      <div className={workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow)}>
        {workoutsSplitPaneHeader}
        <div
          className={workoutsPaneEmbedBodyClass(
            workoutsPaneNaturalFlow,
            undefined,
            'px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 md:px-6 md:pb-28 md:pt-6',
          )}
        >
          <div className="mx-auto w-full max-w-lg lg:max-w-3xl">
            <Card className="relative overflow-hidden border border-state-error/50 bg-background-secondary/50">
              <CardContent className="p-5 md:p-6 text-center relative z-10">
                <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                  <X className="h-10 w-10 text-state-error" />
                </div>
                <h3 className="text-text-primary mb-2 text-base md:text-lg font-medium">
                  Errore nel caricamento
                </h3>
                <p className="text-text-secondary mb-4 text-xs md:text-sm line-clamp-3">{error}</p>
                <Button
                  onClick={() => {
                    setError(null)
                    if (athleteProfileId) fetchCurrentWorkout(athleteProfileId)
                  }}
                  className="min-h-[44px] h-9 md:h-10 text-sm rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium"
                >
                  Riprova
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow),
        workoutsPane && 'relative isolate',
      )}
    >
      {workoutsSplitPaneHeader}
      <div
        ref={workoutsPaneNaturalFlow ? undefined : scrollContainerRef}
        onScroll={workoutsPaneNaturalFlow ? undefined : handleScrollOggi}
        className={workoutsPaneEmbedBodyClass(
          workoutsPaneNaturalFlow,
          { overflow: 'y' },
          'px-3 pt-4 sm:px-4 sm:pt-5 md:px-6 md:pt-6',
          workoutSession && isWorkoutComplete
            ? 'pb-[calc(9rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(9rem+env(safe-area-inset-bottom,0px))]'
            : 'pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]',
        )}
      >
        <div className="mx-auto w-full max-w-lg space-y-4 md:space-y-5 lg:max-w-3xl">
          {/* Esercizio corrente */}
          {currentExercise
            ? ((): React.ReactElement | null => {
                const rawExercise = currentExercise.exercise
                if (rawExercise == null || typeof rawExercise !== 'object') {
                  return (
                    <Card className={CARD_DS}>
                      <CardContent className="p-4 sm:p-5">
                        <p className="text-sm text-text-secondary">
                          Dati dell&apos;esercizio non disponibili. Contatta il trainer se il
                          problema persiste.
                        </p>
                      </CardContent>
                    </Card>
                  )
                }
                const exercise = rawExercise as Record<string, unknown>
                const exerciseVideoUrl = exercise.video_url as string | undefined | null
                const exerciseThumbUrl = exercise.thumb_url as string | undefined | null
                const exerciseNote = currentExercise.note as string | null | undefined
                const currentWdeId = workoutDayExerciseRowId(currentExercise)
                const privateNoteRow = currentWdeId ? privateNotesByWdeId[currentWdeId] : undefined
                const hasPrivateNote = Boolean(
                  privateNoteRow &&
                  (privateNoteRow.note.trim().length > 0 || privateNoteRow.image_storage_path),
                )

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

                // Estrai la condizione per evitare problemi di inferenza tipo
                const shouldShowMedia = Boolean(isValidVideoUrl || isValidThumbUrl)

                // Vista circuito: griglia 3x3 video + lista info per ogni esercizio
                if (circuitGroup.length > 0) {
                  const firstCircuitExercise = (circuitGroup[0]?.exercise ?? {}) as Record<
                    string,
                    unknown
                  >
                  const firstCircuitVideoUrl =
                    (firstCircuitExercise.video_url as string | undefined | null) ?? null
                  const firstCircuitThumbUrl =
                    (firstCircuitExercise.thumb_url as string | undefined | null) ?? null
                  const canStartCircuitPreview = Boolean(
                    (firstCircuitVideoUrl &&
                      typeof firstCircuitVideoUrl === 'string' &&
                      firstCircuitVideoUrl.trim() !== '') ||
                    (firstCircuitThumbUrl &&
                      typeof firstCircuitThumbUrl === 'string' &&
                      firstCircuitThumbUrl.trim() !== ''),
                  )
                  return (
                    <Card className={`${CARD_DS} p-3 sm:p-3.5`}>
                      <CardHeader
                        className="relative z-10 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3"
                        padding="sm"
                      >
                        <CardTitle
                          size="md"
                          className="flex flex-1 items-center gap-2 truncate text-sm text-text-primary"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                            <Dumbbell className="h-3 w-3 shrink-0 text-cyan-400" />
                          </span>
                          {`Circuito \u00b7 ${circuitGroup.length} esercizi`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10 space-y-3 pt-3 p-0 sm:space-y-4">
                        <div
                          className={`grid gap-2 sm:gap-3 ${circuitGroup.length <= 5 ? 'grid-cols-2' : 'grid-cols-3'}`}
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
                                className={`relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-white/5 ${canEnlarge ? 'cursor-pointer transition-all hover:border-white/20 hover:ring-2 hover:ring-white/20' : ''}`}
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
                        <Button
                          type="button"
                          className="h-11 w-full rounded-xl bg-cyan-500 text-sm font-semibold text-white hover:bg-cyan-400"
                          disabled={!canStartCircuitPreview}
                          onClick={() => {
                            if (!canStartCircuitPreview) return
                            const firstPlayableIndex = circuitGroup.findIndex((entry) => {
                              const playableExercise = (entry.exercise ?? {}) as Record<
                                string,
                                unknown
                              >
                              const playableVideo =
                                (playableExercise.video_url as string | undefined | null) ?? null
                              const playableThumb =
                                (playableExercise.thumb_url as string | undefined | null) ?? null
                              return Boolean(
                                (playableVideo &&
                                  typeof playableVideo === 'string' &&
                                  playableVideo.trim() !== '') ||
                                (playableThumb &&
                                  typeof playableThumb === 'string' &&
                                  playableThumb.trim() !== ''),
                              )
                            })
                            setCircuitFullscreenPreview({
                              exercises: circuitGroup,
                              activeIndex: firstPlayableIndex >= 0 ? firstPlayableIndex : 0,
                            })
                          }}
                        >
                          Avvia circuito
                        </Button>
                        <div className="space-y-2 pt-2">
                          {(() => {
                            const hasReps = true
                            const hasWeight = true
                            const hasTime = circuitGroup.some((item) => {
                              const sets =
                                (item.sets as Record<string, unknown>[] | undefined) ?? []
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
                                label: 'Peso',
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
                                label: 'Esecuzione',
                                field: 'execution_time_sec' as const,
                              },
                              {
                                key: 'rest',
                                show: hasRest,
                                label: 'Recupero',
                                field: 'rest_timer_sec' as const,
                              },
                            ].filter((col) => col.show)
                            const columnCount = visibleColumns.length
                            const columnsMain = visibleColumns.filter((c) => c.key !== 'rest')
                            const restColumn = visibleColumns.find((c) => c.key === 'rest')
                            return (
                              <>
                                <div className="mb-0.5 flex items-center gap-2">
                                  <div className="w-5 shrink-0" aria-hidden />
                                  <div className="min-w-0 flex-1 px-2.5">
                                    <div
                                      className="grid gap-1 md:gap-2"
                                      style={{
                                        gridTemplateColumns: getWorkoutColumnsTemplate(
                                          columnCount,
                                          hasRest,
                                        ),
                                      }}
                                    >
                                      {columnsMain.map((col) => (
                                        <div key={col.key} className="text-center">
                                          <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide whitespace-nowrap truncate">
                                            {col.label}
                                          </div>
                                        </div>
                                      ))}
                                      {hasRest && restColumn ? (
                                        <div
                                          className="text-center"
                                          style={{ gridColumn: 'span 2' }}
                                        >
                                          <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide whitespace-nowrap truncate">
                                            {restColumn.label}
                                          </div>
                                        </div>
                                      ) : null}
                                      {hasRest && restColumn ? (
                                        <div className="text-center">
                                          <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide whitespace-nowrap truncate">
                                            &nbsp;
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                                {circuitGroup.map((item) => {
                                  const ex = (item.exercise ?? {}) as Record<string, unknown>
                                  const name = (ex.name as string) ?? 'Esercizio'
                                  const sets = (item.sets as Record<string, unknown>[]) ?? []
                                  const itemWdeId = workoutDayExerciseRowId(item)
                                  const itemNote = item.note as string | null | undefined
                                  const itemPrivateNoteRow = itemWdeId
                                    ? privateNotesByWdeId[itemWdeId]
                                    : undefined
                                  const itemHasPrivateNote = Boolean(
                                    itemPrivateNoteRow &&
                                    (itemPrivateNoteRow.note.trim().length > 0 ||
                                      itemPrivateNoteRow.image_storage_path),
                                  )
                                  return (
                                    <div key={String(item.id)} className="space-y-1.5">
                                      <div className="text-text-primary text-xs font-medium truncate pl-0.5">
                                        {name}
                                      </div>
                                      {sets.map((set: Record<string, unknown>, index: number) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <div
                                            className={`w-5 shrink-0 text-left text-sm font-bold leading-none tabular-nums ${
                                              isWorkoutSetCompleted(set)
                                                ? 'text-cyan-300'
                                                : weightPicker?.exerciseId ===
                                                      workoutDayExerciseRowId(item) &&
                                                    weightPicker?.setNumber ===
                                                      Number(set.set_number)
                                                  ? 'text-orange-300'
                                                  : 'text-text-primary'
                                            }`}
                                            aria-hidden="true"
                                          >
                                            {Number(set.set_number) || 1}
                                          </div>
                                          <div
                                            role="button"
                                            tabIndex={0}
                                            title={
                                              isWorkoutSetCompleted(set)
                                                ? 'Tocca la riga per annullare il completamento del set'
                                                : 'Tocca la riga per completare il set (avvia il recupero). Il peso e modificabile con tap.'
                                            }
                                            onClick={(e) => {
                                              if (
                                                (e.target as HTMLElement).closest(
                                                  '[data-set-menu-trigger="true"]',
                                                )
                                              ) {
                                                return
                                              }
                                              const sn = Number(set.set_number) || 1
                                              const exIdx = resolveExerciseIndexInSession(
                                                workoutSession?.exercises,
                                                item,
                                              )
                                              if (isWorkoutSetCompleted(set)) {
                                                if (exIdx >= 0) {
                                                  updateSetByIndex(exIdx, sn, { completed: false })
                                                } else {
                                                  updateSet(workoutDayExerciseRowId(item), sn, {
                                                    completed: false,
                                                  })
                                                }
                                                setInlineTimerSeconds(null)
                                                setInlineTimerRunning(false)
                                                restTimerTargetRef.current = null
                                                return
                                              }
                                              if (exIdx >= 0) {
                                                updateSetByIndex(exIdx, sn, { completed: true })
                                              } else {
                                                updateSet(workoutDayExerciseRowId(item), sn, {
                                                  completed: true,
                                                })
                                              }
                                              restTimerTargetRef.current = {
                                                exerciseId: workoutDayExerciseRowId(item),
                                                setNumber: sn,
                                                exerciseIndex: exIdx >= 0 ? exIdx : null,
                                              }
                                              const restSec =
                                                ((set.rest_timer_sec ??
                                                  item.rest_timer_sec ??
                                                  null) as number | null) ?? 0
                                              if (restSec > 0) {
                                                playTimerTone(timerAudioContextRef, 700, 0.5)
                                                setInlineTimerSeconds(restSec)
                                                setInlineTimerRunning(true)
                                              }
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                ;(e.currentTarget as HTMLElement).click()
                                              }
                                            }}
                                            className={`relative min-w-0 flex-1 overflow-hidden rounded-lg border p-2.5 transition-all duration-200 focus:outline-none focus-visible:ring-0 cursor-pointer hover:border-white/20 hover:bg-white/10 ${
                                              isWorkoutSetCompleted(set)
                                                ? 'border-cyan-400/80 bg-cyan-500/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                                                : weightPicker?.exerciseId ===
                                                      workoutDayExerciseRowId(item) &&
                                                    weightPicker?.setNumber ===
                                                      Number(set.set_number)
                                                  ? 'border-orange-400/80 bg-orange-500/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                                                  : 'border-white/10 bg-white/5'
                                            }`}
                                          >
                                            <div className="grid gap-2 items-center">
                                              <div
                                                className="grid gap-2 md:gap-3 items-center min-w-0"
                                                style={{
                                                  gridTemplateColumns: getWorkoutColumnsTemplate(
                                                    columnCount,
                                                    hasRest,
                                                  ),
                                                }}
                                              >
                                                {columnsMain.map((col) => {
                                                  const execSecForPlay =
                                                    ((set.execution_time_sec ??
                                                      item.execution_time_sec ??
                                                      null) as number | null) ?? 0
                                                  return (
                                                    <div
                                                      key={col.key}
                                                      className={`text-center flex items-center justify-center min-h-[2rem] min-w-0 ${
                                                        col.field === 'execution_time_sec' &&
                                                        execSecForPlay <= 0
                                                          ? 'w-9 justify-self-center'
                                                          : ''
                                                      }`}
                                                    >
                                                      {col.field === 'execution_time_sec' ? (
                                                        execSecForPlay > 0 ? (
                                                          <div className="flex items-center justify-center">
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                startExecutionThenRestFromSet(
                                                                  set,
                                                                  item as Record<string, unknown>,
                                                                )
                                                              }}
                                                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-400/35 bg-orange-500/15 text-orange-400 transition-colors hover:bg-orange-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 ${
                                                                isWorkoutSetCompleted(set)
                                                                  ? 'opacity-60'
                                                                  : ''
                                                              }`}
                                                              aria-label={`Avvia timer esecuzione e recupero (${execSecForPlay} sec.)`}
                                                              title={`Avvia timer esecuzione e recupero (${execSecForPlay} sec.)`}
                                                            >
                                                              <Play className="h-4 w-4 fill-current" />
                                                            </button>
                                                          </div>
                                                        ) : (
                                                          <div
                                                            className={`text-base font-bold text-white text-center whitespace-nowrap min-h-[2rem] flex items-center justify-center ${
                                                              isWorkoutSetCompleted(set)
                                                                ? 'opacity-70'
                                                                : 'opacity-100'
                                                            }`}
                                                          >
                                                            {execSecForPlay}
                                                          </div>
                                                        )
                                                      ) : (
                                                        <div
                                                          className={`text-base font-bold text-white text-center whitespace-nowrap ${
                                                            isWorkoutSetCompleted(set)
                                                              ? 'opacity-70'
                                                              : 'opacity-100'
                                                          }`}
                                                        >
                                                          {col.field === 'reps'
                                                            ? displayWorkoutRepsCell(
                                                                set.reps as
                                                                  | number
                                                                  | null
                                                                  | undefined,
                                                                item.target_reps as
                                                                  | number
                                                                  | null
                                                                  | undefined,
                                                              )
                                                            : col.field === 'weight_kg'
                                                              ? (() => {
                                                                  const setWeight =
                                                                    set.weight_kg as
                                                                      | number
                                                                      | null
                                                                      | undefined
                                                                  const exerciseWeight =
                                                                    item.target_weight as
                                                                      | number
                                                                      | null
                                                                      | undefined
                                                                  const resolvedWeight =
                                                                    setWeight !== null &&
                                                                    setWeight !== undefined
                                                                      ? setWeight
                                                                      : exerciseWeight !== null &&
                                                                          exerciseWeight !==
                                                                            undefined
                                                                        ? exerciseWeight
                                                                        : null
                                                                  return (
                                                                    <button
                                                                      type="button"
                                                                      data-set-menu-trigger="true"
                                                                      onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setWeightPicker({
                                                                          exerciseId:
                                                                            workoutDayExerciseRowId(
                                                                              item,
                                                                            ),
                                                                          setNumber:
                                                                            Number(
                                                                              set.set_number,
                                                                            ) || 1,
                                                                          initialKg:
                                                                            resolveSetWeightKgForPicker(
                                                                              set,
                                                                              item as Record<
                                                                                string,
                                                                                unknown
                                                                              >,
                                                                            ),
                                                                        })
                                                                      }}
                                                                      className="inline-flex min-h-[2rem] items-center justify-center rounded-md border border-orange-400/55 bg-orange-500/[0.14] px-2 py-0.5 text-base font-bold leading-none text-orange-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-colors hover:bg-orange-500/[0.24] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                                                                      aria-label="Modifica peso in kg"
                                                                      title="Modifica peso"
                                                                    >
                                                                      {resolvedWeight ?? '-'}
                                                                    </button>
                                                                  )
                                                                })()
                                                              : ((set[
                                                                  (col as { field: string }).field
                                                                ] as number | null | undefined) ??
                                                                '-')}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                })}
                                                {hasRest
                                                  ? (() => {
                                                      const restSec =
                                                        ((set.rest_timer_sec ??
                                                          item.rest_timer_sec ??
                                                          null) as number | null) ?? 0
                                                      const execSec =
                                                        ((set.execution_time_sec ??
                                                          item.execution_time_sec ??
                                                          null) as number | null) ?? 0
                                                      const recoveryPlayDisabledByExecution =
                                                        execSec > 0
                                                      const restPlayBlockedClass =
                                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-text-tertiary/50 opacity-40 pointer-events-none'
                                                      const showRestPlayOnly = restSec > 0
                                                      if (showRestPlayOnly) {
                                                        return (
                                                          <div
                                                            className="flex items-center justify-center min-h-[2rem]"
                                                            style={{ gridColumn: 'span 2' }}
                                                          >
                                                            {recoveryPlayDisabledByExecution ? (
                                                              <div
                                                                role="img"
                                                                aria-label="Recupero: si avvia dopo il timer di esecuzione (play arancione)"
                                                                title="Recupero automatico dopo il timer di esecuzione"
                                                                className={`${restPlayBlockedClass} ${
                                                                  isWorkoutSetCompleted(set)
                                                                    ? 'opacity-50'
                                                                    : ''
                                                                }`}
                                                              >
                                                                <Play className="h-4 w-4 fill-current" />
                                                              </div>
                                                            ) : (
                                                              <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                  e.stopPropagation()
                                                                  startRestTimerFromSet(
                                                                    set,
                                                                    item as Record<string, unknown>,
                                                                  )
                                                                }}
                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 text-cyan-400 transition-colors hover:bg-cyan-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
                                                                  isWorkoutSetCompleted(set)
                                                                    ? 'opacity-60'
                                                                    : ''
                                                                }`}
                                                                aria-label={`Avvia timer recupero (${restSec} sec.)`}
                                                                title={`Avvia timer recupero (${restSec} sec.)`}
                                                              >
                                                                <Play className="h-4 w-4 fill-current" />
                                                              </button>
                                                            )}
                                                          </div>
                                                        )
                                                      }
                                                      return (
                                                        <>
                                                          <div className="text-center flex items-center justify-center min-h-[2rem]">
                                                            <div
                                                              className={`text-base font-bold text-white text-center whitespace-nowrap ${
                                                                isWorkoutSetCompleted(set)
                                                                  ? 'opacity-70'
                                                                  : 'opacity-100'
                                                              }`}
                                                            >
                                                              {restSec}
                                                            </div>
                                                          </div>
                                                          {!isWorkoutSetCompleted(set) && (
                                                            <div className="flex items-center justify-center">
                                                              {recoveryPlayDisabledByExecution ? (
                                                                <div
                                                                  role="img"
                                                                  aria-label="Recupero: si avvia dopo il timer di esecuzione (play arancione)"
                                                                  title="Recupero automatico dopo il timer di esecuzione"
                                                                  className={restPlayBlockedClass}
                                                                >
                                                                  <Play className="h-4 w-4 fill-current" />
                                                                </div>
                                                              ) : (
                                                                restSec > 0 && (
                                                                  <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                      e.stopPropagation()
                                                                      startRestTimerFromSet(
                                                                        set,
                                                                        item as Record<
                                                                          string,
                                                                          unknown
                                                                        >,
                                                                      )
                                                                    }}
                                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 text-cyan-400 transition-colors hover:bg-cyan-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                                                                    aria-label={`Avvia timer recupero (${restSec} sec.)`}
                                                                    title={`Avvia timer recupero (${restSec} sec.)`}
                                                                  >
                                                                    <Play className="h-4 w-4 fill-current" />
                                                                  </button>
                                                                )
                                                              )}
                                                            </div>
                                                          )}
                                                        </>
                                                      )
                                                    })()
                                                  : null}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      <div className="mt-2 border-t border-white/10 pt-2">
                                        <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                                          <div className="flex items-center gap-1.5">
                                            <span className="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5">
                                              <FileText className="h-2.5 w-2.5 shrink-0 text-cyan-400" />
                                            </span>
                                            <span>Nota trainer</span>
                                          </div>
                                          {athleteProfileId && itemWdeId ? (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className={
                                                itemHasPrivateNote
                                                  ? 'h-7 rounded-md border border-amber-300/40 bg-amber-400/10 px-2 text-[10px] normal-case tracking-normal text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-200/55 hover:bg-amber-400/18 hover:text-amber-50'
                                                  : 'h-7 rounded-md border border-white/15 bg-white/5 px-2 text-[10px] normal-case tracking-normal text-text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/25 hover:bg-white/10 hover:text-text-primary'
                                              }
                                              onClick={() => {
                                                setPrivateNoteExpandSerialByWde((prev) => ({
                                                  ...prev,
                                                  [itemWdeId]: (prev[itemWdeId] ?? 0) + 1,
                                                }))
                                              }}
                                              aria-label={
                                                itemHasPrivateNote
                                                  ? 'Vedi nota privata esercizio'
                                                  : 'Aggiungi nota privata esercizio'
                                              }
                                            >
                                              <Pencil className="mr-1 h-3 w-3 shrink-0" />
                                              {itemHasPrivateNote ? 'Vedi nota' : 'Aggiungi nota'}
                                            </Button>
                                          ) : null}
                                        </div>
                                        {itemNote ? (
                                          <p className="text-text-primary text-xs leading-relaxed whitespace-pre-wrap break-words">
                                            {itemNote}
                                          </p>
                                        ) : null}
                                      </div>
                                      {athleteProfileId && itemWdeId ? (
                                        <AthleteExercisePrivateNoteBlock
                                          workoutDayExerciseId={itemWdeId}
                                          athleteProfileId={athleteProfileId}
                                          savedRow={privateNotesByWdeId[itemWdeId]}
                                          onSaved={handlePrivateNoteSaved}
                                          expandRequestSerial={
                                            privateNoteExpandSerialByWde[itemWdeId] ?? 0
                                          }
                                        />
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </>
                            )
                          })()}
                        </div>
                        <div className="space-y-3 pt-4 sm:space-y-4">
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
                                return (
                                  sets.length === 0 ||
                                  sets.every((s: Record<string, unknown>) =>
                                    isWorkoutSetCompleted(s),
                                  )
                                )
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
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                return (
                  <Card className={`${CARD_DS} p-3 sm:p-3.5`}>
                    <CardHeader
                      className="relative z-10 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3"
                      padding="sm"
                    >
                      <CardTitle
                        size="md"
                        className="flex flex-1 items-center gap-2 truncate text-sm text-text-primary"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <Dumbbell className="h-3 w-3 shrink-0 text-cyan-400" />
                        </span>
                        <span className="truncate flex-1">{exercise.name as string}</span>
                        {Boolean(exercise.description) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0 rounded-full p-0 text-cyan-400 hover:bg-white/5 hover:text-cyan-300"
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
                    <CardContent className="relative z-10 space-y-3 pt-3 p-0 sm:space-y-4">
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

                      {/* Nota trainer + accesso alla nota privata atleta (sempre visibile) */}
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-white/5">
                              <FileText className="h-2.5 w-2.5 shrink-0 text-cyan-400" />
                            </span>
                            <span>Nota trainer</span>
                          </div>
                          {athleteProfileId && currentWdeId ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={
                                hasPrivateNote
                                  ? 'h-7 rounded-md border border-amber-300/40 bg-amber-400/10 px-2 text-[10px] normal-case tracking-normal text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-200/55 hover:bg-amber-400/18 hover:text-amber-50'
                                  : 'h-7 rounded-md border border-white/15 bg-white/5 px-2 text-[10px] normal-case tracking-normal text-text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/25 hover:bg-white/10 hover:text-text-primary'
                              }
                              onClick={() => {
                                setPrivateNoteExpandSerialByWde((prev) => ({
                                  ...prev,
                                  [currentWdeId]: (prev[currentWdeId] ?? 0) + 1,
                                }))
                              }}
                              aria-label={
                                hasPrivateNote
                                  ? 'Vedi nota privata esercizio'
                                  : 'Aggiungi nota privata esercizio'
                              }
                            >
                              <Pencil className="mr-1 h-3 w-3 shrink-0" />
                              {hasPrivateNote ? 'Vedi nota' : 'Aggiungi nota'}
                            </Button>
                          ) : null}
                        </div>
                        {exerciseNote ? (
                          <p className="text-text-primary text-xs leading-relaxed whitespace-pre-wrap break-words">
                            {exerciseNote}
                          </p>
                        ) : null}
                      </div>

                      {/* Set - Design Moderno e Uniforme */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {(() => {
                            const sets = currentExercise.sets as Record<string, unknown>[]

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
                                label: 'Peso',
                                field: 'weight_kg',
                              },
                              { key: 'reps', show: hasReps, label: 'Ripetizioni', field: 'reps' },
                              {
                                key: 'time',
                                show: hasTime,
                                label: 'Esecuzione',
                                field: 'execution_time_sec',
                              },
                              {
                                key: 'rest',
                                show: hasRest,
                                label: 'Recupero',
                                field: 'rest_timer_sec',
                              },
                            ].filter((col) => col.show)

                            const columnCount = visibleColumns.length
                            const columnsMain = visibleColumns.filter((c) => c.key !== 'rest')
                            const restColumn = visibleColumns.find((c) => c.key === 'rest')

                            return (
                              <>
                                {/* Header delle colonne (solo per la prima riga) */}
                                <div className="mb-2 flex items-center gap-2">
                                  <div className="w-5 shrink-0" aria-hidden />
                                  <div className="min-w-0 flex-1 px-2.5">
                                    <div
                                      className="grid gap-2 md:gap-3"
                                      style={{
                                        gridTemplateColumns: getWorkoutColumnsTemplate(
                                          columnCount,
                                          hasRest,
                                        ),
                                      }}
                                    >
                                      {columnsMain.map((col) => (
                                        <div key={col.key} className="text-center">
                                          <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide mb-0.5 whitespace-nowrap truncate">
                                            {col.label}
                                          </div>
                                        </div>
                                      ))}
                                      {hasRest && restColumn ? (
                                        <div
                                          className="text-center"
                                          style={{ gridColumn: 'span 2' }}
                                        >
                                          <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide mb-0.5 whitespace-nowrap truncate">
                                            {restColumn.label}
                                          </div>
                                        </div>
                                      ) : null}
                                      {hasRest && restColumn ? (
                                        <div className="text-center">
                                          <div className="text-[10px] text-text-tertiary opacity-60 uppercase tracking-wide mb-0.5 whitespace-nowrap truncate">
                                            &nbsp;
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                                {sets.map((set: Record<string, unknown>, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div
                                      className={`w-5 shrink-0 text-left text-sm font-bold leading-none tabular-nums ${
                                        isWorkoutSetCompleted(set)
                                          ? 'text-cyan-300'
                                          : weightPicker?.exerciseId ===
                                                workoutDayExerciseRowId(currentExercise) &&
                                              weightPicker?.setNumber === Number(set.set_number)
                                            ? 'text-orange-300'
                                            : 'text-text-primary'
                                      }`}
                                      aria-hidden="true"
                                    >
                                      {Number(set.set_number) || 1}
                                    </div>
                                    <div
                                      role={circuitGroup.length === 0 ? 'button' : undefined}
                                      tabIndex={circuitGroup.length === 0 ? 0 : undefined}
                                      title={
                                        circuitGroup.length === 0
                                          ? isWorkoutSetCompleted(set)
                                            ? 'Tocca la riga per annullare il completamento del set'
                                            : 'Tocca la riga per completare il set (avvia il recupero). Il peso e modificabile con tap.'
                                          : isWorkoutSetCompleted(set)
                                            ? undefined
                                            : 'In circuito: il peso e modificabile con tap.'
                                      }
                                      onClick={(e) => {
                                        if (
                                          (e.target as HTMLElement).closest(
                                            '[data-set-menu-trigger="true"]',
                                          )
                                        ) {
                                          return
                                        }
                                        if (circuitGroup.length !== 0) return
                                        const sn = Number(set.set_number) || 1
                                        const exIdx = currentExerciseIndex
                                        if (isWorkoutSetCompleted(set)) {
                                          updateSetByIndex(exIdx, sn, { completed: false })
                                          setInlineTimerSeconds(null)
                                          setInlineTimerRunning(false)
                                          restTimerTargetRef.current = null
                                          return
                                        }
                                        updateSetByIndex(exIdx, sn, { completed: true })
                                        restTimerTargetRef.current = {
                                          exerciseId: workoutDayExerciseRowId(currentExercise),
                                          setNumber: sn,
                                          exerciseIndex: exIdx,
                                        }
                                        const restSec =
                                          ((set.rest_timer_sec ??
                                            currentExercise.rest_timer_sec ??
                                            null) as number | null) ?? 0
                                        if (restSec > 0) {
                                          playTimerTone(timerAudioContextRef, 700, 0.5)
                                          setInlineTimerSeconds(restSec)
                                          setInlineTimerRunning(true)
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (
                                          circuitGroup.length === 0 &&
                                          (e.key === 'Enter' || e.key === ' ')
                                        ) {
                                          e.preventDefault()
                                          ;(e.currentTarget as HTMLElement).click()
                                        }
                                      }}
                                      className={`relative min-w-0 flex-1 overflow-hidden rounded-lg border p-2.5 transition-all duration-200 focus:outline-none focus-visible:ring-0 ${
                                        isWorkoutSetCompleted(set)
                                          ? 'border-cyan-400/80 bg-cyan-500/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                                          : weightPicker?.exerciseId ===
                                                workoutDayExerciseRowId(currentExercise) &&
                                              weightPicker?.setNumber === Number(set.set_number)
                                            ? 'border-orange-400/80 bg-orange-500/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                                            : 'border-white/10 bg-white/5'
                                      } ${circuitGroup.length === 0 ? 'cursor-pointer hover:border-white/20 hover:bg-white/10' : ''}`}
                                    >
                                      <div
                                        className="grid gap-2 md:gap-3 items-center min-w-0"
                                        style={{
                                          gridTemplateColumns: getWorkoutColumnsTemplate(
                                            columnCount,
                                            hasRest,
                                          ),
                                        }}
                                      >
                                        {columnsMain.map((col) => {
                                          const execSecForPlay =
                                            ((set.execution_time_sec ??
                                              currentExercise.execution_time_sec ??
                                              null) as number | null) ?? 0
                                          return (
                                            <div
                                              key={col.key}
                                              className={`text-center flex items-center justify-center min-h-[2rem] min-w-0 ${
                                                col.field === 'execution_time_sec' &&
                                                execSecForPlay <= 0
                                                  ? 'w-9 justify-self-center'
                                                  : ''
                                              }`}
                                            >
                                              {col.field === 'execution_time_sec' ? (
                                                execSecForPlay > 0 ? (
                                                  <div className="flex items-center justify-center">
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        startExecutionThenRestFromSet(
                                                          set,
                                                          currentExercise as Record<
                                                            string,
                                                            unknown
                                                          >,
                                                        )
                                                      }}
                                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-400/35 bg-orange-500/15 text-orange-400 transition-colors hover:bg-orange-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 ${
                                                        isWorkoutSetCompleted(set)
                                                          ? 'opacity-60'
                                                          : ''
                                                      }`}
                                                      aria-label={`Avvia timer esecuzione e recupero (${execSecForPlay} sec.)`}
                                                      title={`Avvia timer esecuzione e recupero (${execSecForPlay} sec.)`}
                                                    >
                                                      <Play className="h-4 w-4 fill-current" />
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <div
                                                    className={`text-base font-bold text-white text-center whitespace-nowrap min-h-[2rem] flex items-center justify-center ${
                                                      isWorkoutSetCompleted(set)
                                                        ? 'opacity-70'
                                                        : 'opacity-100'
                                                    }`}
                                                  >
                                                    {execSecForPlay}
                                                  </div>
                                                )
                                              ) : (
                                                <div
                                                  className={`text-base font-bold text-white text-center whitespace-nowrap ${
                                                    isWorkoutSetCompleted(set)
                                                      ? 'opacity-70'
                                                      : 'opacity-100'
                                                  }`}
                                                >
                                                  {col.field === 'reps'
                                                    ? displayWorkoutRepsCell(
                                                        set.reps as number | null | undefined,
                                                        currentExercise.target_reps as
                                                          | number
                                                          | null
                                                          | undefined,
                                                      )
                                                    : col.field === 'weight_kg'
                                                      ? (() => {
                                                          const setWeight = set.weight_kg as
                                                            | number
                                                            | null
                                                            | undefined
                                                          const exerciseWeight =
                                                            currentExercise.target_weight as
                                                              | number
                                                              | null
                                                              | undefined
                                                          const resolvedWeight =
                                                            setWeight !== null &&
                                                            setWeight !== undefined
                                                              ? setWeight
                                                              : exerciseWeight !== null &&
                                                                  exerciseWeight !== undefined
                                                                ? exerciseWeight
                                                                : null
                                                          return (
                                                            <button
                                                              type="button"
                                                              data-set-menu-trigger="true"
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                setWeightPicker({
                                                                  exerciseId:
                                                                    workoutDayExerciseRowId(
                                                                      currentExercise,
                                                                    ),
                                                                  setNumber:
                                                                    Number(set.set_number) || 1,
                                                                  initialKg:
                                                                    resolveSetWeightKgForPicker(
                                                                      set,
                                                                      currentExercise as Record<
                                                                        string,
                                                                        unknown
                                                                      >,
                                                                    ),
                                                                })
                                                              }}
                                                              className="inline-flex min-h-[2rem] items-center justify-center rounded-md border border-orange-400/55 bg-orange-500/[0.14] px-2 py-0.5 text-base font-bold leading-none text-orange-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-colors hover:bg-orange-500/[0.24] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                                                              aria-label="Modifica peso in kg"
                                                              title="Modifica peso"
                                                            >
                                                              {resolvedWeight ?? '-'}
                                                            </button>
                                                          )
                                                        })()
                                                      : ((set[(col as { field: string }).field] as
                                                          | number
                                                          | null
                                                          | undefined) ?? '-')}
                                                </div>
                                              )}
                                            </div>
                                          )
                                        })}
                                        {hasRest
                                          ? (() => {
                                              const restSec =
                                                ((set.rest_timer_sec ??
                                                  currentExercise.rest_timer_sec ??
                                                  null) as number | null) ?? 0
                                              const execSec =
                                                ((set.execution_time_sec ??
                                                  currentExercise.execution_time_sec ??
                                                  null) as number | null) ?? 0
                                              const recoveryPlayDisabledByExecution = execSec > 0
                                              const restPlayBlockedClass =
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-text-tertiary/50 opacity-40 pointer-events-none'
                                              const showRestPlayOnly = restSec > 0
                                              if (showRestPlayOnly) {
                                                return (
                                                  <div
                                                    className="flex items-center justify-center min-h-[2rem]"
                                                    style={{ gridColumn: 'span 2' }}
                                                  >
                                                    {recoveryPlayDisabledByExecution ? (
                                                      <div
                                                        role="img"
                                                        aria-label="Recupero: si avvia dopo il timer di esecuzione (play arancione)"
                                                        title="Recupero automatico dopo il timer di esecuzione"
                                                        className={`${restPlayBlockedClass} ${
                                                          isWorkoutSetCompleted(set)
                                                            ? 'opacity-50'
                                                            : ''
                                                        }`}
                                                      >
                                                        <Play className="h-4 w-4 fill-current" />
                                                      </div>
                                                    ) : (
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          startRestTimerFromSet(
                                                            set,
                                                            currentExercise as Record<
                                                              string,
                                                              unknown
                                                            >,
                                                          )
                                                        }}
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 text-cyan-400 transition-colors hover:bg-cyan-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
                                                          isWorkoutSetCompleted(set)
                                                            ? 'opacity-60'
                                                            : ''
                                                        }`}
                                                        aria-label={`Avvia timer recupero (${restSec} sec.)`}
                                                        title={`Avvia timer recupero (${restSec} sec.)`}
                                                      >
                                                        <Play className="h-4 w-4 fill-current" />
                                                      </button>
                                                    )}
                                                  </div>
                                                )
                                              }
                                              return (
                                                <>
                                                  <div className="text-center flex items-center justify-center min-h-[2rem]">
                                                    <div
                                                      className={`text-base font-bold text-white text-center whitespace-nowrap ${
                                                        isWorkoutSetCompleted(set)
                                                          ? 'opacity-70'
                                                          : 'opacity-100'
                                                      }`}
                                                    >
                                                      {restSec}
                                                    </div>
                                                  </div>
                                                  {!isWorkoutSetCompleted(set) && (
                                                    <div className="flex items-center justify-center">
                                                      {recoveryPlayDisabledByExecution ? (
                                                        <div
                                                          role="img"
                                                          aria-label="Recupero: si avvia dopo il timer di esecuzione (play arancione)"
                                                          title="Recupero automatico dopo il timer di esecuzione"
                                                          className={restPlayBlockedClass}
                                                        >
                                                          <Play className="h-4 w-4 fill-current" />
                                                        </div>
                                                      ) : (
                                                        restSec > 0 && (
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation()
                                                              startRestTimerFromSet(
                                                                set,
                                                                currentExercise as Record<
                                                                  string,
                                                                  unknown
                                                                >,
                                                              )
                                                            }}
                                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 text-cyan-400 transition-colors hover:bg-cyan-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                                                            aria-label={`Avvia timer recupero (${restSec} sec.)`}
                                                            title={`Avvia timer recupero (${restSec} sec.)`}
                                                          >
                                                            <Play className="h-4 w-4 fill-current" />
                                                          </button>
                                                        )
                                                      )}
                                                    </div>
                                                  )}
                                                </>
                                              )
                                            })()
                                          : null}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )
                          })()}
                        </div>
                        {athleteProfileId && currentWdeId ? (
                          <AthleteExercisePrivateNoteBlock
                            workoutDayExerciseId={currentWdeId}
                            athleteProfileId={athleteProfileId}
                            savedRow={privateNotesByWdeId[currentWdeId]}
                            onSaved={handlePrivateNoteSaved}
                            expandRequestSerial={privateNoteExpandSerialByWde[currentWdeId] ?? 0}
                          />
                        ) : null}
                      </div>

                      {/* Azioni - Design Moderno e Uniforme: bottone solo quando tutte le serie sono completate */}
                      <div className="space-y-3 pt-4 sm:space-y-4">
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
                              return (
                                sets.length === 0 ||
                                sets.every((s: Record<string, unknown>) => isWorkoutSetCompleted(s))
                              )
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
                      </div>
                    </CardContent>
                  </Card>
                )
              })()
            : null}
        </div>
      </div>

      {/* Navigazione esercizi — fissa in basso (viewport o pane staff); area sopra scrollabile */}
      <div
        className={cn(
          'z-20 flex w-full min-w-0 flex-col bg-background px-3 pt-2 sm:px-4 md:px-6',
          workoutsPane ? 'absolute inset-x-0 bottom-0' : 'fixed inset-x-0 bottom-0',
        )}
      >
        <header
          className="relative w-full min-w-0 overflow-hidden rounded-t-2xl border-t border-white/10 bg-black/95 backdrop-blur-md p-4 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)] md:p-5"
          style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent 0%, rgb(34 211 238) 50%, transparent 100%)',
            }}
            aria-hidden
          />
          <div className="relative z-10 flex items-center justify-between gap-2">
            <Button
              onClick={previousExercise}
              disabled={currentBlockIndex === 0}
              variant="outline"
              className="h-9 min-h-[44px] touch-manipulation rounded-xl border border-white/10 text-[10px] text-text-primary hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="mr-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Precedente
            </Button>
            <div className="flex min-w-0 flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                Esercizio
              </span>
              <span className="text-sm font-bold text-text-primary">
                {currentBlockIndex + 1} / {blocks.length}
              </span>
            </div>
            <Button
              onClick={nextExercise}
              disabled={currentBlockIndex === blocks.length - 1}
              variant="outline"
              className="h-9 min-h-[44px] touch-manipulation rounded-xl border border-white/10 text-[10px] text-text-primary hover:bg-white/5 disabled:opacity-30"
            >
              Successivo
              <ChevronRight className="ml-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            </Button>
          </div>
          {workoutSession && isWorkoutComplete ? (
            <div className="relative z-10 mt-3 w-full min-w-0">
              <Button
                onClick={finishWorkout}
                disabled={completingWorkout}
                className="h-10 w-full min-h-11 text-xs rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all duration-200 hover:scale-[1.02]"
              >
                <PartyPopper className="mr-1.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Completa allenamento
              </Button>
            </div>
          ) : null}
        </header>
      </div>

      {/* Timer recupero/esecuzione: solo in overlay (aperto dal Play in tabella) */}
      {restTimersOverlayOpen && currentExercise ? (
        <div
          className={cn(
            workoutsPane ? 'absolute inset-0 z-[100]' : 'fixed inset-0 z-[100]',
            'flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]',
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Timer recupero e esecuzione"
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-black/75 p-3 pt-12 shadow-2xl shadow-black/40">
            <button
              type="button"
              onClick={dismissRestTimersOverlay}
              className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              aria-label="Chiudi e annulla timer"
              title="Chiudi e annulla"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <div className="flex flex-row items-center justify-center gap-5 sm:gap-8">
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
                    const activeSet = setIdx >= 0 ? itemSets[setIdx] : itemSets[itemSets.length - 1]
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
                  inlineExecutionPreRollRemaining !== null
                    ? 100
                    : currentSeconds === 0
                      ? 0
                      : (currentSeconds / initialSeconds) * 100
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
                            : inlineExecutionPreRollRemaining !== null
                              ? "Annulla conto alla rovescia prima dell'esecuzione"
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
                                : inlineExecutionPreRollRemaining !== null
                                  ? 'text-orange-500'
                                  : inlineExecutionTimerRunning
                                    ? 'text-orange-600'
                                    : 'text-orange-600/60'
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-1.5 pb-1 pointer-events-none">
                        <div className="flex flex-col items-center justify-center gap-1 text-center">
                          {inlineExecutionTimerSeconds === null ? (
                            <>
                              <div className="text-4xl font-bold text-white leading-none tabular-nums">
                                {formatTime(initialSeconds)}
                              </div>
                              <div className="text-[10px] text-orange-600/70 font-medium uppercase tracking-wider">
                                ESECUZIONE
                              </div>
                            </>
                          ) : currentSeconds === 0 ? (
                            <>
                              <div className="text-4xl font-bold text-green-500 leading-none tabular-nums">
                                0
                              </div>
                              <div className="text-[10px] text-green-500/70 font-medium uppercase tracking-wider">
                                Completato
                              </div>
                            </>
                          ) : inlineExecutionPreRollRemaining !== null ? (
                            <>
                              <div className="text-4xl font-bold text-white leading-none tabular-nums">
                                {formatTime(inlineExecutionPreRollRemaining)}
                              </div>
                              <div className="text-[10px] text-orange-500/80 font-medium uppercase tracking-wider leading-tight">
                                {'Pronti\u2026'}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-4xl font-bold text-white leading-none tabular-nums">
                                {formatTime(currentSeconds)}
                              </div>
                              <div className="text-[10px] text-orange-600/70 font-medium uppercase tracking-wider">
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

                const showRecoveryWaiting =
                  inlineTimerSeconds === null &&
                  inlineExecutionTimerSeconds !== null &&
                  inlineExecutionTimerSeconds > 0 &&
                  (inlineExecutionTimerRunning || inlineExecutionPreRollRemaining !== null)

                if (
                  !restTimersOverlayOpen &&
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
                      className={`relative h-36 w-36 transition-transform duration-200 ${
                        showRecoveryWaiting
                          ? 'cursor-default opacity-80'
                          : 'cursor-pointer hover:scale-105 active:scale-95'
                      }`}
                      onClick={showRecoveryWaiting ? undefined : toggleInlineTimer}
                      role={showRecoveryWaiting ? undefined : 'button'}
                      tabIndex={showRecoveryWaiting ? undefined : 0}
                      onKeyDown={(e) => {
                        if (showRecoveryWaiting) return
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleInlineTimer()
                        }
                      }}
                      aria-label={
                        showRecoveryWaiting
                          ? 'Recupero dopo esecuzione'
                          : inlineTimerRunning
                            ? 'Pausa timer recupero'
                            : 'Avvia timer recupero'
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-1.5 pb-1.5 pointer-events-none">
                        <div className="flex max-w-[6.5rem] flex-col items-center justify-center gap-1 text-center sm:max-w-[7rem]">
                          {inlineTimerSeconds === null ? (
                            <>
                              <div className="text-[10px] font-medium uppercase leading-tight tracking-wider text-cyan-400/70">
                                RECUPERO
                              </div>
                              <div className="text-4xl font-bold text-white leading-none tabular-nums">
                                {formatTime(initialSeconds)}
                              </div>
                              <div className="text-[9px] font-medium uppercase leading-snug tracking-wider text-cyan-400/50 sm:text-[10px]">
                                {showRecoveryWaiting ? 'Dopo esecuzione' : 'Tocca per avviare'}
                              </div>
                            </>
                          ) : currentSeconds === 0 ? (
                            <>
                              <div className="text-4xl font-bold text-green-500 leading-none tabular-nums">
                                0
                              </div>
                              <div className="text-[10px] text-green-500/70 font-medium uppercase tracking-wider">
                                Completato
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-4xl font-bold text-white leading-none tabular-nums">
                                {formatTime(currentSeconds)}
                              </div>
                              <div className="text-[10px] text-cyan-400/70 font-medium uppercase tracking-wider">
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
          </div>
        </div>
      ) : null}

      {/* Vista fullscreen aggiuntiva circuito (solo UI) */}
      {circuitFullscreenPreview
        ? (() => {
            const totalExercises = circuitFullscreenPreview.exercises.length
            const circuitStats = getCircuitCycleStats(circuitFullscreenPreview.exercises)
            const currentCycleNumber = Math.min(
              Math.max(1, circuitStats.totalCycles),
              Math.max(1, circuitStats.completedCycles + 1),
            )
            const cycleIndexesView = getCircuitExerciseIndexesForCycle(
              circuitFullscreenPreview.exercises,
              currentCycleNumber,
            )
            const hasCycleIndexesView = cycleIndexesView.length > 0
            const safeIndex =
              totalExercises > 0
                ? Math.min(Math.max(circuitFullscreenPreview.activeIndex, 0), totalExercises - 1)
                : 0
            const safeCyclePosition = hasCycleIndexesView
              ? Math.max(0, cycleIndexesView.indexOf(safeIndex))
              : -1
            const activeItem = circuitFullscreenPreview.exercises[safeIndex]
            const activeExercise = ((activeItem?.exercise as Record<string, unknown> | undefined) ??
              {}) as Record<string, unknown>
            const activeName = (activeExercise.name as string | undefined) ?? 'Esercizio'
            const activeVideoUrl =
              (activeExercise.video_url as string | undefined | null)?.trim() || undefined
            const activeThumbUrl =
              (activeExercise.thumb_url as string | undefined | null)?.trim() || undefined
            const activeSets = ((activeItem?.sets as Record<string, unknown>[] | undefined) ??
              []) as Record<string, unknown>[]
            const activeSetIndex =
              activeSets.length > 0
                ? activeSets.findIndex((set) => Number(set?.set_number ?? 0) === currentCycleNumber)
                : -1
            const activeSet =
              activeSets.length > 0
                ? activeSetIndex >= 0
                  ? activeSets[activeSetIndex]
                  : activeSets[0]
                : null

            const valueWeight = (() => {
              const fromSet = activeSet?.weight_kg as number | null | undefined
              if (fromSet != null && Number.isFinite(fromSet)) return fromSet
              const fromTarget = activeExercise.target_weight as number | null | undefined
              if (fromTarget != null && Number.isFinite(fromTarget)) return fromTarget
              return 0
            })()
            const valueReps = displayWorkoutRepsCell(
              (activeSet?.reps as number | null | undefined) ?? null,
              (activeExercise.target_reps as number | null | undefined) ?? null,
            )
            const valueExecutionRaw = (activeSet?.execution_time_sec ??
              activeItem?.execution_time_sec ??
              activeExercise?.execution_time_sec ??
              null) as number | string | null | undefined
            const valueExecution =
              valueExecutionRaw == null
                ? null
                : Number.isFinite(Number(valueExecutionRaw))
                  ? Number(valueExecutionRaw)
                  : null
            const valueRestRaw = (activeSet?.rest_timer_sec ??
              activeItem?.rest_timer_sec ??
              activeExercise?.rest_timer_sec ??
              null) as number | string | null | undefined
            const valueRest =
              valueRestRaw == null
                ? null
                : Number.isFinite(Number(valueRestRaw))
                  ? Number(valueRestRaw)
                  : null
            const circuitPrepareSecondsLeft =
              circuitAutoPhase === 'prepare'
                ? (circuitAutoSeconds ?? CIRCUIT_FULLSCREEN_PREPARE_SECONDS)
                : null
            const circuitPrepareTierTextClass =
              circuitAutoPhase === 'prepare'
                ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
                  ? 'text-red-500'
                  : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                    ? 'text-yellow-400'
                    : 'text-green-500'
                : ''
            const circuitPrepareTierBarClass =
              circuitAutoPhase === 'prepare'
                ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
                  ? 'bg-red-500'
                  : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                    ? 'bg-yellow-400'
                    : 'bg-green-500'
                : ''
            const circuitPrepareOverlayTitle =
              circuitAutoPhase === 'prepare'
                ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
                  ? 'Preparati!'
                  : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                    ? 'Pronti!'
                    : 'Via!'
                : ''
            const circuitTimerLabel =
              circuitAutoPhase === 'prepare'
                ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
                  ? 'Preparati'
                  : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                    ? 'Pronti!'
                    : 'Via!'
                : circuitAutoPhase === 'execution'
                  ? 'Esecuzione'
                  : circuitAutoPhase === 'reps'
                    ? 'Ripetizioni'
                    : circuitAutoPhase === 'rest'
                      ? 'Recupero'
                      : circuitAutoPhase === 'completed'
                        ? 'Circuito completato'
                        : 'Pronti...'
            const circuitTimerColorClass =
              circuitAutoPhase === 'prepare'
                ? circuitPrepareTierTextClass
                : circuitAutoPhase === 'execution'
                  ? 'text-orange-400'
                  : circuitAutoPhase === 'reps'
                    ? 'text-violet-300'
                    : circuitAutoPhase === 'rest'
                      ? 'text-cyan-300'
                      : circuitAutoPhase === 'completed'
                        ? 'text-green-400'
                        : 'text-cyan-300'
            const circuitTimerMainValue =
              circuitAutoSeconds !== null
                ? circuitAutoSeconds
                : circuitAutoPhase === 'reps'
                  ? valueReps
                  : circuitAutoPhase === 'execution' && valueExecution != null && valueExecution > 0
                    ? valueExecution
                    : circuitAutoPhase === 'prepare'
                      ? CIRCUIT_FULLSCREEN_PREPARE_SECONDS
                      : 5
            const circuitTimerSubtitle =
              circuitAutoPhase === 'idle'
                ? null
                : circuitAutoPhase === 'prepare'
                  ? 'Partenza automatica esecuzione'
                  : circuitAutoPhase === 'execution'
                    ? `Esecuzione ${valueExecution != null && valueExecution > 0 ? valueExecution : '-'} sec`
                    : circuitAutoPhase === 'reps'
                      ? `Completa ${valueReps} e premi FATTO`
                      : circuitAutoPhase === 'rest'
                        ? `Recupero ${valueRest != null && valueRest > 0 ? valueRest : 60} sec`
                        : circuitAutoPhase === 'completed'
                          ? 'Recupero terminato'
                          : `Recupero ${valueRest != null && valueRest > 0 ? valueRest : 60} dopo esecuzione`
            const circuitProgressColorClass =
              circuitAutoPhase === 'prepare'
                ? circuitPrepareTierBarClass
                : circuitAutoPhase === 'execution'
                  ? 'bg-orange-500'
                  : circuitAutoPhase === 'reps'
                    ? 'bg-violet-500'
                    : circuitAutoPhase === 'rest'
                      ? 'bg-cyan-400'
                      : circuitAutoPhase === 'completed'
                        ? 'bg-green-500'
                        : 'bg-zinc-500'
            const circuitTotalCycles = Math.max(1, circuitStats.totalCycles)
            const canNavigateManually = !circuitAutoRunning && circuitAutoPhase !== 'prepare'
            const canStartCircuit =
              !circuitAutoRunning &&
              (circuitAutoPhase === 'idle' || circuitAutoPhase === 'completed')
            const pauseLabel = circuitAutoRunning ? 'Pausa' : 'Riprendi'
            const pauseDisabled =
              circuitAutoPhase === 'idle' ||
              circuitAutoPhase === 'completed' ||
              circuitAutoPhase === 'reps'
            const cycleTargetReached = circuitStats.completedCycles >= circuitStats.totalCycles
            const block = blocks[currentBlockIndex]
            const blockExercises = block
              ? (workoutSession?.exercises ?? []).slice(block.startIndex, block.endIndex + 1)
              : []
            const isBlockCompleted = block
              ? blockExercises.every(
                  (ex) => (ex as { is_completed?: boolean }).is_completed === true,
                )
              : false

            return (
              <div
                className={cn(
                  workoutsPane ? 'absolute inset-0 z-[320]' : 'fixed inset-x-0 bottom-0 z-[320]',
                  'isolate overflow-hidden bg-black',
                )}
                style={workoutsPane ? undefined : { top: 'var(--home-athlete-brand-top, 0px)' }}
                role="dialog"
                aria-modal="true"
                aria-label="Vista circuito fullscreen"
              >
                <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xl border-white/20 text-xs text-white hover:bg-white/10"
                      disabled={safeCyclePosition <= 0 || !canNavigateManually}
                      onClick={() =>
                        setCircuitFullscreenPreview((prev) =>
                          prev
                            ? {
                                ...prev,
                                activeIndex:
                                  hasCycleIndexesView && safeCyclePosition > 0
                                    ? cycleIndexesView[safeCyclePosition - 1]
                                    : Math.max(0, prev.activeIndex - 1),
                              }
                            : prev,
                        )
                      }
                    >
                      Precedente
                    </Button>
                    <div className="flex items-center justify-center rounded-xl border border-white/20 bg-zinc-900 text-xs font-semibold text-white">
                      {hasCycleIndexesView ? safeCyclePosition + 1 : safeIndex + 1} /{' '}
                      {hasCycleIndexesView ? cycleIndexesView.length : Math.max(totalExercises, 1)}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xl border-white/20 text-xs text-white hover:bg-white/10"
                      disabled={
                        (hasCycleIndexesView
                          ? safeCyclePosition >= cycleIndexesView.length - 1
                          : safeIndex >= totalExercises - 1) || !canNavigateManually
                      }
                      onClick={() =>
                        setCircuitFullscreenPreview((prev) =>
                          prev
                            ? {
                                ...prev,
                                activeIndex:
                                  hasCycleIndexesView && safeCyclePosition >= 0
                                    ? cycleIndexesView[
                                        Math.min(cycleIndexesView.length - 1, safeCyclePosition + 1)
                                      ]
                                    : Math.min(prev.exercises.length - 1, prev.activeIndex + 1),
                              }
                            : prev,
                        )
                      }
                    >
                      Successivo
                    </Button>
                  </div>

                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black">
                    {activeVideoUrl ? (
                      <ModalAutoplayExerciseVideo
                        videoSrc={activeVideoUrl}
                        posterSrc={activeThumbUrl}
                      />
                    ) : activeThumbUrl ? (
                      <Image
                        src={activeThumbUrl}
                        alt={activeName}
                        className="h-full w-full object-contain"
                        fill
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-300">
                        Nessun media disponibile per questo esercizio
                      </div>
                    )}
                    {circuitAutoPhase === 'prepare' ? (
                      <div
                        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/40"
                        aria-hidden
                      >
                        <div
                          className={`text-center text-7xl font-black leading-none sm:text-8xl ${circuitPrepareTierTextClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                        >
                          {circuitPrepareOverlayTitle}
                        </div>
                        <div
                          className={`text-7xl font-black leading-none tabular-nums sm:text-8xl ${circuitPrepareTierTextClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                        >
                          {circuitAutoSeconds ?? CIRCUIT_FULLSCREEN_PREPARE_SECONDS}
                        </div>
                      </div>
                    ) : circuitAutoPhase === 'rest' ? (
                      <div
                        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/40"
                        aria-hidden
                      >
                        <div
                          className={`text-center text-7xl font-black leading-none sm:text-8xl ${circuitTimerColorClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                        >
                          RECUPERO
                        </div>
                        <div
                          className={`text-7xl font-black leading-none tabular-nums sm:text-8xl ${circuitTimerColorClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                        >
                          {circuitAutoSeconds ??
                            (valueRest != null && valueRest > 0 ? valueRest : 60)}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-zinc-950/90 p-3">
                    <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                      Impostazioni esercizio corrente
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-lg border border-white/10 bg-black p-2">
                        <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                          Peso
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">{valueWeight}</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black p-2">
                        <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                          Ripetizioni
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">{valueReps}</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black p-2">
                        <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                          Esecuzione
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">
                          {valueExecution != null && valueExecution > 0 ? valueExecution : '-'}
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black p-2">
                        <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                          Recupero
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">
                          {valueRest != null && valueRest > 0 ? valueRest : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 p-5 shadow-2xl shadow-black/60">
                    <div
                      className={`flex items-center justify-center text-center ${
                        circuitAutoPhase === 'idle' ? 'min-h-[220px]' : 'min-h-[180px]'
                      }`}
                    >
                      <div className="w-full max-w-xl space-y-3">
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                          {circuitTimerLabel}
                        </div>
                        {circuitAutoPhase === 'idle' ? (
                          <div className="flex flex-col items-center gap-4 pt-1">
                            <Button
                              type="button"
                              disabled={!canStartCircuit}
                              onClick={startCircuitAutoplay}
                              className="mx-auto h-[5.25rem] w-full max-w-md rounded-2xl bg-cyan-500 px-8 text-2xl font-black uppercase tracking-wider text-white shadow-[0_0_40px_-8px_rgba(34,211,238,0.45)] transition-transform hover:bg-cyan-400 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 sm:h-24 sm:max-w-lg sm:text-3xl"
                            >
                              Start
                            </Button>
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                              Poi parte il countdown di preparazione (
                              {CIRCUIT_FULLSCREEN_PREPARE_SECONDS} sec)
                            </p>
                          </div>
                        ) : circuitAutoPhase === 'reps' ? (
                          <div className="space-y-3">
                            <div className="text-4xl font-black leading-none text-violet-300 sm:text-5xl">
                              {valueReps}
                            </div>
                            <Button
                              type="button"
                              className="h-24 w-full rounded-2xl bg-violet-500 text-3xl font-black uppercase tracking-wide text-white hover:bg-violet-400 sm:h-28 sm:text-4xl"
                              onClick={advanceCircuitAutoplay}
                            >
                              Fatto
                            </Button>
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                              Completa le ripetizioni e conferma per continuare
                            </p>
                          </div>
                        ) : (
                          <>
                            {circuitAutoPhase !== 'prepare' && circuitAutoPhase !== 'rest' ? (
                              <div
                                className={
                                  circuitAutoPhase === 'completed'
                                    ? `px-2 text-3xl font-black leading-tight sm:text-5xl ${circuitTimerColorClass}`
                                    : `text-7xl font-black leading-none sm:text-8xl ${circuitTimerColorClass}`
                                }
                              >
                                {circuitAutoPhase === 'completed'
                                  ? 'Congratulazione!'
                                  : circuitTimerMainValue}
                              </div>
                            ) : null}
                            {circuitAutoPhase !== 'completed' ? (
                              <div className="mx-auto mt-2 w-full max-w-lg">
                                <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                  <span>Progresso</span>
                                  <span>{Math.round(smoothCircuitProgressPercent)}%</span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                                  <div
                                    className={`h-full rounded-full ${circuitProgressColorClass}`}
                                    style={{ width: `${smoothCircuitProgressPercent}%` }}
                                  />
                                </div>
                              </div>
                            ) : null}
                          </>
                        )}
                        {circuitTimerSubtitle ? (
                          <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            {circuitTimerSubtitle}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-zinc-950/95 px-4 py-3 text-center">
                    <div className="text-3xl font-black leading-none text-cyan-300 sm:text-4xl">
                      {circuitStats.completedCycles} <span className="text-zinc-500">/</span>{' '}
                      {circuitTotalCycles}
                    </div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                      {circuitStats.completedCycles === 1 ? 'Ciclo completato' : 'Cicli completati'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/15 bg-zinc-950/95 p-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl border-white/20 text-sm font-semibold text-white hover:bg-white/10"
                      disabled={pauseDisabled}
                      onClick={toggleCircuitAutoplayPause}
                    >
                      {pauseLabel}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-11 rounded-xl text-sm font-semibold"
                      onClick={() => {
                        setCircuitAutoPhase('idle')
                        setCircuitAutoSeconds(null)
                        setCircuitAutoRunning(false)
                        circuitCompletedCyclesRef.current = 0
                        circuitCycleTargetRef.current = 1
                        setCircuitFullscreenPreview(null)
                      }}
                    >
                      Esci
                    </Button>
                  </div>
                </div>
                {cycleTargetReached ? (
                  <div
                    className="absolute inset-0 z-[400] flex items-center justify-center bg-black/75 p-4 sm:p-6"
                    aria-live="polite"
                  >
                    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl shadow-black/60">
                      <p className="mb-4 text-center text-sm font-medium text-zinc-300">
                        Tutti i cicli del circuito sono stati completati.
                      </p>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!isBlockCompleted) {
                            completeBlock(currentBlockIndex)
                          }
                          setCircuitAutoPhase('idle')
                          setCircuitAutoSeconds(null)
                          setCircuitAutoRunning(false)
                          circuitCompletedCyclesRef.current = 0
                          circuitCycleTargetRef.current = 1
                          setCircuitFullscreenPreview(null)
                        }}
                        variant={isBlockCompleted ? 'success' : 'default'}
                        className={
                          isBlockCompleted
                            ? 'h-11 w-full rounded-xl bg-green-500 text-sm font-semibold text-white hover:bg-emerald-500'
                            : 'h-11 w-full rounded-xl bg-cyan-500 text-sm font-semibold text-white hover:bg-cyan-400'
                        }
                      >
                        <Check className="mr-2 h-4 w-4 shrink-0" />
                        {isBlockCompleted ? 'Esercizio completato' : 'Completa esercizio'}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })()
        : null}

      {/* Rest Timer Modal */}
      {showRestTimer &&
        currentExercise &&
        (() => {
          // Trova il set corrente (il primo non completato o l'ultimo)
          const sets = (currentExercise.sets as Record<string, unknown>[]) || []
          const currentSetIndex = sets.findIndex((s) => !isWorkoutSetCompleted(s))
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
            <div
              className={cn(
                workoutsPane ? 'absolute inset-0 z-50' : 'fixed inset-0 z-50',
                'flex items-center justify-center bg-black/50 p-4',
              )}
            >
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

      {/* Dialog video circuito ingrandito */}
      <Dialog
        open={enlargedCircuitVideo !== null}
        onOpenChange={(open) => {
          if (!open) setEnlargedCircuitVideo(null)
        }}
      >
        <DialogContent className="relative w-[95vw] max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-background shadow-xl">
          {enlargedCircuitVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-text-primary text-base font-bold truncate pr-8">
                  {enlargedCircuitVideo.name}
                </DialogTitle>
              </DialogHeader>
              <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
                {enlargedCircuitVideo.videoUrl ? (
                  <ModalAutoplayExerciseVideo
                    videoSrc={enlargedCircuitVideo.videoUrl}
                    posterSrc={enlargedCircuitVideo.thumbUrl}
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
        <DialogContent className="relative max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Info className="h-5 w-5 text-cyan-400" />
              </span>
              {selectedExerciseDescription?.name || 'Descrizione Esercizio'}
            </DialogTitle>
            <DialogDescription className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
              {selectedExerciseDescription?.description || 'Nessuna descrizione disponibile.'}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <WorkoutWeightPickerDialog
        open={weightPicker !== null}
        onOpenChange={(open) => {
          if (!open) setWeightPicker(null)
        }}
        initialKg={weightPicker?.initialKg ?? 0}
        onSave={(kg) => {
          if (!weightPicker) return
          updateSet(weightPicker.exerciseId, weightPicker.setNumber, { weight_kg: kg })
          setWeightPicker(null)
        }}
      />
    </div>
  )
}

export default function AllenamentiOggiPage() {
  return (
    <Suspense fallback={null}>
      <AllenamentiOggiPageContent />
    </Suspense>
  )
}
