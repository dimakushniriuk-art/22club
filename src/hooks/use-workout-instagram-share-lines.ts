'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { AthleteWorkoutSummary } from '@/features/athlete-allenamenti/types/athlete-workout-summary'
import {
  pickExerciseSharePreviewUrl,
  pickExerciseShareVideoUrl,
} from '@/features/athlete-allenamenti/lib/riepilogo-helpers'
import type { WorkoutShareExerciseMediaLine } from '@/lib/workouts/workout-share-types'

const logger = createLogger('hooks:use-workout-instagram-share-lines')

function buildFallbackInstagramShareLines(
  summary: AthleteWorkoutSummary,
  origin?: string,
): WorkoutShareExerciseMediaLine[] {
  return summary.exercises.map((ex) => ({
    name: ex.exercise.name,
    maxWeightKg: Math.max(0, ...ex.sets.map((s) => s.performed_weight)),
    isPersonalRecord: false,
    mediaPreviewUrl: pickExerciseSharePreviewUrl(ex.exercise, origin),
    mediaVideoUrl: pickExerciseShareVideoUrl(ex.exercise, origin),
  }))
}

async function computeInstagramShareLines(
  supabase: SupabaseClient<Database>,
  summary: AthleteWorkoutSummary,
  athleteProfileId: string,
  origin?: string,
): Promise<WorkoutShareExerciseMediaLine[]> {
  const fallbackLines = buildFallbackInstagramShareLines(summary, origin)
  try {
    const currentLogId = summary.workout_log_id
    const { data: pastLogs, error: pastErr } = await supabase
      .from('workout_logs')
      .select('id')
      .eq('atleta_id', athleteProfileId)
      .in('stato', ['completato', 'completed'])
      .neq('id', currentLogId)

    if (pastErr) {
      logger.warn('Share Instagram: storico workout_logs fallito', pastErr)
    }

    const pastLogIds = (pastLogs ?? [])
      .map((r: { id: string }) => r.id)
      .filter((id: string) => Boolean(id))
    const maxByExercise = new Map<string, number>()

    if (pastLogIds.length > 0) {
      type SetRow = { weight_kg: number | null; workout_day_exercise_id: string }
      const allSets: SetRow[] = []
      for (const chunk of chunkForSupabaseIn(pastLogIds)) {
        const { data: sets, error: setsErr } = await supabase
          .from('workout_sets')
          .select('weight_kg, workout_day_exercise_id')
          .in('workout_log_id', chunk)
          .not('completed_at', 'is', null)

        if (setsErr) {
          logger.warn('Share Instagram: storico workout_sets fallito', setsErr)
          continue
        }
        allSets.push(...((sets ?? []) as SetRow[]))
      }

      const wdeIds = [...new Set(allSets.map((s) => s.workout_day_exercise_id).filter(Boolean))]
      if (wdeIds.length > 0) {
        const wdeToEx = new Map<string, string>()
        for (const wdeChunk of chunkForSupabaseIn(wdeIds)) {
          const { data: wdeRows } = await supabase
            .from('workout_day_exercises')
            .select('id, exercise_id')
            .in('id', wdeChunk)

          for (const row of wdeRows ?? []) {
            const r = row as { id: string; exercise_id: string | null }
            if (r.id && r.exercise_id) wdeToEx.set(r.id, r.exercise_id)
          }
        }

        for (const s of allSets) {
          const exId = wdeToEx.get(s.workout_day_exercise_id)
          if (!exId || s.weight_kg == null) continue
          const w = Number(s.weight_kg)
          if (!Number.isFinite(w) || w <= 0) continue
          const prev = maxByExercise.get(exId) ?? 0
          if (w > prev) maxByExercise.set(exId, w)
        }
      }
    }

    return summary.exercises.map((ex) => {
      const sessionMax = Math.max(0, ...ex.sets.map((s) => s.performed_weight))
      const hist = maxByExercise.get(ex.exercise.id)
      const histVal = hist !== undefined ? hist : null
      const isPr = sessionMax > 0 && (histVal === null || sessionMax > histVal)
      return {
        name: ex.exercise.name,
        maxWeightKg: sessionMax,
        isPersonalRecord: isPr,
        mediaPreviewUrl: pickExerciseSharePreviewUrl(ex.exercise, origin),
        mediaVideoUrl: pickExerciseShareVideoUrl(ex.exercise, origin),
      }
    })
  } catch (e) {
    logger.warn('Share Instagram: calcolo PR fallito', e)
    return fallbackLines
  }
}

export function useWorkoutInstagramShareLines(
  summary: AthleteWorkoutSummary | null | undefined,
  athleteProfileId: string | null,
  supabase: SupabaseClient<Database>,
) {
  const [lines, setLines] = useState<WorkoutShareExerciseMediaLine[]>([])

  useEffect(() => {
    if (!summary || !athleteProfileId) {
      setLines([])
      return
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : undefined
    setLines(buildFallbackInstagramShareLines(summary, origin))

    let cancelled = false
    const run = async () => {
      const next = await computeInstagramShareLines(supabase, summary, athleteProfileId, origin)
      if (!cancelled) setLines(next)
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
  }, [summary, athleteProfileId, supabase])

  return lines
}
