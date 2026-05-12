import React, { useEffect, useRef, useState } from 'react'
import { useWorkoutSession } from '@/hooks/workouts/use-workout-session'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import {
  loadAllenamentoOggiDraft,
  saveAllenamentoOggiDraftSync,
  clearAllenamentoOggiDraft,
  sessionIdentityEqual,
  clampBlockIndexForSession,
} from '@/lib/allenamento-oggi-session-draft'
import type { WorkoutSession } from '@/types/workout'

const logger = createLogger('app:home:allenamenti:oggi:page')

type ToastArgs = {
  title: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
}

type UseLiveWorkoutSessionCoreArgs = {
  authLoading: boolean
  athleteProfileId: string | null
  workoutPlanId: string | null
  workoutDayId: string | null
  exerciseId: string | null
  addToast: (args: ToastArgs) => void
  clearEmbedDirty: () => void
  sessionStartedAtRef: React.MutableRefObject<number | null>
}

export function useLiveWorkoutSessionCore({
  authLoading,
  athleteProfileId,
  workoutPlanId,
  workoutDayId,
  exerciseId,
  addToast,
  clearEmbedDirty,
  sessionStartedAtRef,
}: UseLiveWorkoutSessionCoreArgs) {
  const { currentWorkout, fetchCurrentWorkout } = useWorkoutSession()
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null)
  const workoutSessionRef = useRef(workoutSession)
  workoutSessionRef.current = workoutSession

  /** Indice del blocco corrente (singolo esercizio o circuito = 1 blocco) */
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearEmbedDirtyForSyncRef = useRef(clearEmbedDirty)
  clearEmbedDirtyForSyncRef.current = clearEmbedDirty

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
  }, [currentWorkout, loading, authLoading, exerciseId, workoutDayId, sessionStartedAtRef])

  return {
    currentWorkout,
    fetchCurrentWorkout,
    workoutSession,
    setWorkoutSession,
    workoutSessionRef,
    currentBlockIndex,
    setCurrentBlockIndex,
    loading,
    setLoading,
    error,
    setError,
    allenamentoDraftPersistTimerRef,
    allenamentoDraftSnapshotRef,
    allenamentoDraftRestoreKeyRef,
  }
}
