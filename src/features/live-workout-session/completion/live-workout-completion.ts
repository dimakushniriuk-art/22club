import type { MutableRefObject } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { fetchMyTrainerProfile } from '@/hooks/use-my-trainer-profile'
import { repairOrphanWorkoutSetsToLog } from '@/lib/workout-sets-repair-orphan-log'
import { clearAllenamentoOggiDraft } from '@/lib/allenamento-oggi-session-draft'
import { catalogExerciseIdFromSessionExercise } from '@/lib/workout/catalog-exercise-id'
import { invalidateAfterWorkoutSessionWrite } from '@/lib/react-query/post-mutation-cache'
import {
  STAFF_WORKOUTS_EMBED_SAVE_ERROR,
  STAFF_WORKOUTS_EMBED_SAVE_OK,
  STAFF_WORKOUTS_EMBED_SAVE_START,
} from '@/lib/embed/staff-workouts-embed-events'
import type { WorkoutsPaneContextValue } from '@/contexts/workouts-pane-context'
import type { WorkoutSession } from '@/types/workout'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { Tables } from '@/types/supabase'
import { sessionExercisesToPersistPayload } from '@/features/live-workout-session/lib/live-workout-session-helpers'

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

type TrainerProfileLike = { pt_id?: string | null } | null | undefined

type CompleteLiveWorkoutSessionArgs = {
  withTrainer: boolean
  athleteProfileId: string | null
  isPreview: boolean
  supabase: SupabaseClient<Database>
  queryClient: QueryClient
  trainerProfileForCoached: TrainerProfileLike
  workoutSession: WorkoutSession | null
  sessionStartedAtRef: MutableRefObject<number | null>
  activeWorkoutLogIdRef: MutableRefObject<string | null>
  ensureActiveWorkoutLog: () => Promise<string | null>
  persistAllSessionSetsToWorkoutLog: (
    logId: string,
    exercisesPayload: ReturnType<typeof sessionExercisesToPersistPayload>,
    completedAtIso: string,
  ) => Promise<void>
  requestCoachedSessionDebit: (workoutLogId: string) => Promise<void>
  addToast: (args: ToastArgs) => void
  clearEmbedDirty: () => void
  postEmbedSaveEvent: (event: EmbedSaveEvent) => void
  userId: string | null
  workoutsPane: WorkoutsPaneContextValue | null
  goToRiepilogo: (workoutLogId?: string) => void
}

export async function completeLiveWorkoutSession({
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
  userId,
  workoutsPane,
  goToRiepilogo,
}: CompleteLiveWorkoutSessionArgs): Promise<void> {
  try {
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
        const trainerProfile =
          trainerProfileForCoached ??
          (await queryClient.fetchQuery({
            queryKey: queryKeys.athlete.myTrainerProfile,
            queryFn: fetchMyTrainerProfile,
            staleTime: 5 * 60 * 1000,
          }))
        coachedByProfileId = trainerProfile?.pt_id ?? null
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

      await invalidateAfterWorkoutSessionWrite(queryClient, userId)

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

      goToRiepilogo(logId)
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
      const errorMessage = logError.message || "Errore nel salvataggio dell'allenamento completato"
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

    await invalidateAfterWorkoutSessionWrite(queryClient, userId)

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

    goToRiepilogo(workoutLogId ?? undefined)
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
  }
}
