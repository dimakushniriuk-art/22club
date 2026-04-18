import type { SupabaseClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('workout-sets-repair-orphan-log')

const SELECT_ORPHAN =
  'id, workout_day_exercise_id, set_number, reps, weight_kg, completed_at, workout_log_id, created_at' as const

export type OrphanWorkoutSetRow = {
  id: string
  workout_day_exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  completed_at: string | null
  workout_log_id: string | null
}

export type WorkoutSetSummaryForRepair = {
  set_number: number
  reps: number
  weight_kg: number
  is_completed: boolean
}

function normalizeWdeIds(wdeIds: readonly string[]): string[] {
  return [...new Set(wdeIds.map((id) => String(id).trim()).filter((id) => id.length > 0))]
}

/** Finestra temporale coerente con `riepilogo` (data-only vs timestamp). */
export function workoutSetsRepairTimeWindowFromAnchor(
  anchorRaw: string,
): { winStart: string; winEnd: string } | null {
  const raw = String(anchorRaw).trim()
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { winStart: `${raw}T00:00:00.000Z`, winEnd: `${raw}T23:59:59.999Z` }
  }
  const t0 = new Date(raw).getTime()
  if (Number.isNaN(t0)) return null
  return {
    winStart: new Date(t0 - 45 * 60 * 1000).toISOString(),
    winEnd: new Date(t0 + 15 * 60 * 1000).toISOString(),
  }
}

/**
 * `workout_sets` con `workout_log_id` null per gli slot indicati, nella finestra dell’ancora.
 * Pass 1: `completed_at` nella finestra. Pass 2 (solo se pass 1 vuoto): `created_at` ±90/+20 min da `fallbackIso`.
 */
export async function collectOrphanWorkoutSetsForLogRepair(
  supabase: SupabaseClient,
  wdeIds: readonly string[],
  anchorIso: string,
  fallbackIso: string | null,
): Promise<OrphanWorkoutSetRow[]> {
  const ids = normalizeWdeIds(wdeIds)
  const tw = workoutSetsRepairTimeWindowFromAnchor(anchorIso)
  if (ids.length === 0 || !tw) return []

  const { winStart, winEnd } = tw
  const byId = new Map<string, OrphanWorkoutSetRow>()

  for (const wdeChunk of chunkForSupabaseIn(ids)) {
    const { data, error } = await supabase
      .from('workout_sets')
      .select(SELECT_ORPHAN)
      .in('workout_day_exercise_id', wdeChunk)
      .is('workout_log_id', null)
      .gte('completed_at', winStart)
      .lte('completed_at', winEnd)
    if (error) {
      logger.warn('Orphan workout_sets (completed_at) query fallita', error, { winStart, winEnd })
      continue
    }
    for (const row of (data ?? []) as OrphanWorkoutSetRow[]) {
      byId.set(row.id, row)
    }
  }

  if (byId.size === 0 && fallbackIso) {
    const tc = new Date(fallbackIso).getTime()
    if (!Number.isNaN(tc)) {
      const tMin = new Date(tc - 90 * 60 * 1000).toISOString()
      const tMax = new Date(tc + 20 * 60 * 1000).toISOString()
      for (const wdeChunk of chunkForSupabaseIn(ids)) {
        const { data, error } = await supabase
          .from('workout_sets')
          .select(SELECT_ORPHAN)
          .in('workout_day_exercise_id', wdeChunk)
          .is('workout_log_id', null)
          .gte('created_at', tMin)
          .lte('created_at', tMax)
        if (error) {
          logger.warn('Orphan workout_sets (created_at) query fallita', error, { tMin, tMax })
          continue
        }
        for (const row of (data ?? []) as OrphanWorkoutSetRow[]) {
          byId.set(row.id, row)
        }
      }
    }
  }

  return [...byId.values()]
}

async function applyWorkoutLogIdToSetIds(
  supabase: SupabaseClient,
  workoutLogId: string,
  setIds: string[],
): Promise<void> {
  if (setIds.length === 0) return
  for (const idChunk of chunkForSupabaseIn(setIds)) {
    const { error } = await supabase
      .from('workout_sets')
      .update({ workout_log_id: workoutLogId })
      .in('id', idChunk)
    if (error) {
      logger.warn('Repair workout_sets → workout_log fallito', error, { workoutLogId })
      break
    }
  }
}

/**
 * Aggiorna in DB le serie orfane (`workout_log_id` null) nella finestra, legandole al log indicato.
 * @returns numero di righe candidate (prima dell’update; in pratica coincide con gli id aggiornati se nessun errore).
 */
export async function repairOrphanWorkoutSetsToLog(
  supabase: SupabaseClient,
  workoutLogId: string,
  wdeIds: readonly string[],
  anchorIso: string,
  fallbackIso: string | null,
): Promise<number> {
  const rows = await collectOrphanWorkoutSetsForLogRepair(supabase, wdeIds, anchorIso, fallbackIso)
  const repairIds = rows.filter((r) => r.workout_log_id == null).map((r) => r.id)
  if (repairIds.length === 0) return 0
  await applyWorkoutLogIdToSetIds(supabase, workoutLogId, repairIds)
  return repairIds.length
}

/**
 * Come `repairOrphanWorkoutSetsToLog`, ma aggiunge anche le serie orfane alla mappa riepilogo
 * (senza duplicare `set_number` già presenti per lo stesso `workout_day_exercise_id`).
 */
export async function mergeOrphanWorkoutSetsIntoSetsByWdeIdAndRepair(
  supabase: SupabaseClient,
  workoutLogId: string,
  wdeIds: readonly string[],
  anchorIso: string,
  fallbackIso: string | null,
  setsByWdeId: Map<string, WorkoutSetSummaryForRepair[]>,
): Promise<void> {
  const rows = await collectOrphanWorkoutSetsForLogRepair(supabase, wdeIds, anchorIso, fallbackIso)
  const repairIds: string[] = []

  for (const row of rows) {
    if (row.workout_log_id != null && row.workout_log_id !== workoutLogId) continue
    const wdeId = row.workout_day_exercise_id
    if (!setsByWdeId.has(wdeId)) setsByWdeId.set(wdeId, [])
    const arr = setsByWdeId.get(wdeId)!
    if (arr.some((s) => s.set_number === row.set_number)) continue
    arr.push({
      set_number: row.set_number,
      reps: row.reps ?? 0,
      weight_kg: row.weight_kg ?? 0,
      is_completed: Boolean(row.completed_at),
    })
    if (row.workout_log_id == null) repairIds.push(row.id)
  }

  for (const arr of setsByWdeId.values()) {
    arr.sort((a, b) => a.set_number - b.set_number)
  }

  await applyWorkoutLogIdToSetIds(supabase, workoutLogId, repairIds)
}
