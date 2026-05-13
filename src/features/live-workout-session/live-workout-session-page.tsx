'use client'

import React, { useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
import { useToast } from '@/components/ui/toast'
import { AthleteTopBarContext } from '@/components/athlete'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { isValidProfile } from '@/lib/utils/type-guards'
import { cn } from '@/lib/utils'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { AllenamentiPageHeader } from '@/features/athlete-allenamenti'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import { isMissingAthleteWdeNoteImageColumnError } from '@/lib/workout/athlete-wde-private-note-db'
import { requestCoachedSessionDebitClient } from '@/lib/credits/request-coached-session-debit-client'
import type { WorkoutSession } from '@/types/workout'
import { STAFF_WORKOUTS_EMBED_SAVE_ERROR } from '@/lib/embed/staff-workouts-embed-events'

import {
  displayWorkoutRepsCell,
  getWorkoutColumnsTemplate,
  isWorkoutSetCompleted,
  resolveExerciseIndexInSession,
  resolveSetWeightKgForPicker,
  workoutDayExerciseRowId,
} from '@/features/live-workout-session/lib/live-workout-session-helpers'
import {
  CIRCUIT_FULLSCREEN_PREPARE_SECONDS,
  playExecutionPreRollTone,
  playTimerTone,
} from '@/features/live-workout-session/lib/live-workout-audio'
import { useLiveWorkoutHostAdapter } from '@/features/live-workout-session/host/use-live-workout-host-adapter'
import { useLiveWorkoutSessionCore } from '@/features/live-workout-session/session/use-live-workout-session-core'
import { useLiveWorkoutSessionMutations } from '@/features/live-workout-session/session/live-workout-session-mutations'
import {
  useLiveWorkoutLogSync,
  type BlockExerciseForSave,
} from '@/features/live-workout-session/persistence/live-workout-log-sync'
import { completeLiveWorkoutSession } from '@/features/live-workout-session/completion/live-workout-completion'
import { useSmoothCircuitProgressPercent } from '@/features/live-workout-session/timers/use-smooth-circuit-progress-percent'
import {
  ExerciseMediaDisplay,
  ModalAutoplayExerciseVideo,
} from '@/features/live-workout-session/ui/exercise-media'
import { LiveWorkoutFooter } from '@/features/live-workout-session/ui/live-workout-footer'
import { RestTimerOverlay } from '@/features/live-workout-session/ui/rest-timer-overlay'
import { CircuitFullscreenOverlay } from '@/features/live-workout-session/ui/circuit-fullscreen-overlay'

const logger = createLogger('app:home:allenamenti:oggi:page')

const CARD_DS =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

export function AllenamentiOggiPageContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, loading: authLoading, authRecovery, retryAuthSession } = useAuth()
  const { addToast } = useToast()
  const supabase = useSupabaseClient()

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
  /** Timestamp inizio sessione (per calcolo durata_minuti al completamento) */
  const sessionStartedAtRef = React.useRef<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (user) {
      hasRetriedSessionRef.current = false
      return
    }
    if (authRecovery === 'degraded' || authRecovery === 'retrying') return
    if (!hasRetriedSessionRef.current) {
      hasRetriedSessionRef.current = true
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[auth-recovery] oggi: user assente, retry sessione')
      }
      void retryAuthSession()
    }
  }, [authLoading, user, retryAuthSession, authRecovery])

  const { athleteProfileId: resolvedAthleteId } = useResolvedAthleteProfileForAllenamenti()
  const athleteProfileId = resolvedAthleteId
  const {
    pathBase,
    isPreview,
    workoutsPane,
    workoutsPaneNaturalFlow,
    trainerProfileForCoached,
    workoutPlanId,
    workoutDayId,
    exerciseId,
    allenamentiHeaderBackHref,
    markEmbedDirty,
    clearEmbedDirty,
    postEmbedSaveEvent,
    requestAuthFromParent,
    resolveWithTrainer,
    goToRiepilogo,
    embedRootClass,
    embedBodyClass,
  } = useLiveWorkoutHostAdapter({
    athleteProfileId,
    authLoading,
    isAuthenticated: Boolean(user && isValidUser),
    push: (href) => router.push(href),
  })

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

  const {
    fetchCurrentWorkout,
    workoutSession,
    setWorkoutSession,
    workoutSessionRef,
    currentBlockIndex,
    setCurrentBlockIndex,
    loading,
    error,
    setError,
  } = useLiveWorkoutSessionCore({
    authLoading,
    athleteProfileId,
    workoutPlanId,
    workoutDayId,
    exerciseId,
    addToast,
    clearEmbedDirty,
    sessionStartedAtRef,
  })

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
  const [completingWorkout, setCompletingWorkout] = useState(false)
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
    const run = async () => {
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
    }

    let idleId: number | undefined
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => {
        void run()
      })
    } else {
      timeoutId = globalThis.setTimeout(() => {
        void run()
      }, 0)
    }

    return () => {
      cancelled = true
      if (idleId != null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId != null) {
        globalThis.clearTimeout(timeoutId)
      }
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

  const { updateSetByIndex, updateSet } = useLiveWorkoutSessionMutations({
    markEmbedDirty,
    setWorkoutSession,
  })

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
  }, [circuitFullscreenPreview, circuitAutoPhase, circuitAutoSeconds, getCircuitCycleStats])

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

  const {
    ensureActiveWorkoutLog,
    saveCompletedBlockToDb,
    persistAllSessionSetsToWorkoutLog,
    removeBlockFromDb,
  } = useLiveWorkoutLogSync({
    athleteProfileId,
    workoutSessionRef,
    activeWorkoutLogIdRef,
    supabase,
    addToast,
    clearEmbedDirty,
    postEmbedSaveEvent,
    queryClient,
    userId: user?.user_id ?? null,
  })

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
    const withTrainer = resolveWithTrainer()
    void handleTrainerSessionConfirm(withTrainer)
  }

  const handleTrainerSessionConfirm = async (withTrainer: boolean) => {
    try {
      setCompletingWorkout(true)
      await completeLiveWorkoutSession({
        withTrainer,
        athleteProfileId,
        isPreview,
        supabase,
        queryClient,
        trainerProfileForCoached,
        workoutSession,
        sessionStartedAtRef,
        activeWorkoutLogIdRef,
        ensureActiveWorkoutLog,
        persistAllSessionSetsToWorkoutLog,
        requestCoachedSessionDebit,
        addToast,
        clearEmbedDirty,
        postEmbedSaveEvent,
        userId: user?.user_id ?? null,
        workoutsPane,
        goToRiepilogo,
      })
    } finally {
      setCompletingWorkout(false)
    }
  }

  // Early return se user non è valido
  if (!authLoading && authRecovery !== 'retrying' && (!user || !isValidUser)) {
    return (
      <div className={embedRootClass()}>
        {workoutsSplitPaneHeader}
        <div
          className={embedBodyClass(
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
      <div className={embedRootClass()}>
        {workoutsSplitPaneHeader}
        <div
          className={embedBodyClass(
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
      <div className={embedRootClass()}>
        {workoutsSplitPaneHeader}
        <div
          className={embedBodyClass(
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
      <div className={embedRootClass()}>
        {workoutsSplitPaneHeader}
        <div
          className={embedBodyClass(
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
    <div className={embedRootClass()}>
      {workoutsSplitPaneHeader}
      <div
        ref={workoutsPaneNaturalFlow ? undefined : scrollContainerRef}
        onScroll={workoutsPaneNaturalFlow ? undefined : handleScrollOggi}
        className={embedBodyClass(
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
      <LiveWorkoutFooter
        inPane={Boolean(workoutsPane)}
        currentBlockIndex={currentBlockIndex}
        blocksLength={blocks.length}
        canCompleteWorkout={Boolean(workoutSession && isWorkoutComplete)}
        completingWorkout={completingWorkout}
        onPreviousExercise={previousExercise}
        onNextExercise={nextExercise}
        onFinishWorkout={finishWorkout}
      />

      <RestTimerOverlay
        restTimersOverlayOpen={restTimersOverlayOpen}
        currentExercise={(currentExercise as Record<string, unknown> | null) ?? null}
        workoutsPane={workoutsPane}
        dismissRestTimersOverlay={dismissRestTimersOverlay}
        circuitGroup={circuitGroup}
        inlineExecutionTimerSeconds={inlineExecutionTimerSeconds}
        inlineExecutionTimerRunning={inlineExecutionTimerRunning}
        inlineExecutionPreRollRemaining={inlineExecutionPreRollRemaining}
        inlineTimerSeconds={inlineTimerSeconds}
        inlineTimerRunning={inlineTimerRunning}
        toggleInlineExecutionTimer={toggleInlineExecutionTimer}
        toggleInlineTimer={toggleInlineTimer}
      />

      <CircuitFullscreenOverlay
        circuitFullscreenPreview={circuitFullscreenPreview}
        setCircuitFullscreenPreview={setCircuitFullscreenPreview}
        getCircuitCycleStats={getCircuitCycleStats}
        getCircuitExerciseIndexesForCycle={getCircuitExerciseIndexesForCycle}
        circuitAutoPhase={circuitAutoPhase}
        setCircuitAutoPhase={setCircuitAutoPhase}
        circuitAutoSeconds={circuitAutoSeconds}
        setCircuitAutoSeconds={setCircuitAutoSeconds}
        circuitAutoRunning={circuitAutoRunning}
        setCircuitAutoRunning={setCircuitAutoRunning}
        circuitCycleTargetRef={circuitCycleTargetRef}
        circuitCompletedCyclesRef={circuitCompletedCyclesRef}
        blocks={blocks}
        currentBlockIndex={currentBlockIndex}
        workoutSession={workoutSession}
        completeBlock={completeBlock}
        smoothCircuitProgressPercent={smoothCircuitProgressPercent}
        startCircuitAutoplay={startCircuitAutoplay}
        advanceCircuitAutoplay={advanceCircuitAutoplay}
        toggleCircuitAutoplayPause={toggleCircuitAutoplayPause}
        workoutsPane={workoutsPane}
      />

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
