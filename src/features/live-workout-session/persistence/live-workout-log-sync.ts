import { useCallback } from 'react'
import type { MutableRefObject } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { createLogger } from '@/lib/logger'
import { catalogExerciseIdFromSessionExercise } from '@/lib/workout/catalog-exercise-id'
import { invalidateAfterWorkoutSessionWrite } from '@/lib/react-query/post-mutation-cache'
import {
  STAFF_WORKOUTS_EMBED_SAVE_ERROR,
  STAFF_WORKOUTS_EMBED_SAVE_OK,
  STAFF_WORKOUTS_EMBED_SAVE_START,
} from '@/lib/embed/staff-workouts-embed-events'
import type { WorkoutSession } from '@/types/workout'
import type { SessionExerciseSetsForLog } from '@/features/live-workout-session/lib/live-workout-session-helpers'

const logger = createLogger('app:home:allenamenti:oggi:page')

type EmbedSaveEvent =
  | { type: typeof STAFF_WORKOUTS_EMBED_SAVE_START; scope: 'block' | 'workout' }
  | { type: typeof STAFF_WORKOUTS_EMBED_SAVE_OK; scope: 'block' | 'workout' }
  | {
      type: typeof STAFF_WORKOUTS_EMBED_SAVE_ERROR
      scope: 'block' | 'workout'
      message: string
    }

type ToastArgs = {
  title: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
}

export type BlockExerciseForSave = {
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

type UseLiveWorkoutLogSyncArgs = {
  athleteProfileId: string | null
  workoutSessionRef: MutableRefObject<WorkoutSession | null>
  activeWorkoutLogIdRef: MutableRefObject<string | null>
  supabase: any
  addToast: (args: ToastArgs) => void
  clearEmbedDirty: () => void
  postEmbedSaveEvent: (event: EmbedSaveEvent) => void
  queryClient: QueryClient
  userId: string | null
}

export function useLiveWorkoutLogSync({
  athleteProfileId,
  workoutSessionRef,
  activeWorkoutLogIdRef,
  supabase,
  addToast,
  clearEmbedDirty,
  postEmbedSaveEvent,
  queryClient,
  userId,
}: UseLiveWorkoutLogSyncArgs) {
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
  }, [activeWorkoutLogIdRef, addToast, athleteProfileId, supabase, workoutSessionRef])

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
      void invalidateAfterWorkoutSessionWrite(queryClient, userId)
    },
    [clearEmbedDirty, ensureActiveWorkoutLog, postEmbedSaveEvent, queryClient, supabase, userId],
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
    [activeWorkoutLogIdRef, clearEmbedDirty, postEmbedSaveEvent, supabase],
  )

  return {
    ensureActiveWorkoutLog,
    saveCompletedBlockToDb,
    persistAllSessionSetsToWorkoutLog,
    removeBlockFromDb,
  }
}
