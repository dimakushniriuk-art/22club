/**
 * Bozza sessione allenamento "oggi" in sessionStorage: crash refresh nella stessa tab,
 * senza duplicare la coda pending-write (salvataggi server).
 */
import type { WorkoutSession } from '@/types/workout'

const PREFIX = '22club-allenamento-oggi-draft:v1:'
/** Massima età bozza (tab può restare aperta molte ore). */
const MAX_AGE_MS = 36 * 60 * 60 * 1000

export interface AllenamentoOggiDraftPayload {
  v: 1
  savedAt: string
  workoutSession: WorkoutSession
  currentBlockIndex: number
}

function storageKey(athleteProfileId: string): string {
  return `${PREFIX}${athleteProfileId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

function parse(raw: string | null): AllenamentoOggiDraftPayload | null {
  if (!raw) return null
  try {
    const o = JSON.parse(raw) as AllenamentoOggiDraftPayload
    if (o?.v !== 1 || !o.workoutSession || typeof o.currentBlockIndex !== 'number') return null
    if (typeof o.savedAt !== 'string') return null
    return o
  } catch {
    return null
  }
}

/** Numero di blocchi (esercizio singolo o circuito = 1 blocco). */
export function countBlocksInSession(workoutSession: WorkoutSession): number {
  const exercises = workoutSession.exercises ?? []
  if (exercises.length === 0) return 1
  let n = 0
  let i = 0
  while (i < exercises.length) {
    const row = exercises[i] as Record<string, unknown>
    const blockId = (row?.circuit_block_id as string | null) ?? null
    if (blockId) {
      while (
        i + 1 < exercises.length &&
        (exercises[i + 1] as Record<string, unknown>)?.circuit_block_id === blockId
      ) {
        i += 1
      }
    }
    n += 1
    i += 1
  }
  return Math.max(1, n)
}

export function clampBlockIndexForSession(index: number, workoutSession: WorkoutSession): number {
  const n = countBlocksInSession(workoutSession)
  return Math.max(0, Math.min(index, n - 1))
}

export function sessionIdentityEqual(a: WorkoutSession | null, b: WorkoutSession | null): boolean {
  if (!a || !b) return false
  return (
    (a.workout_id ?? '') === (b.workout_id ?? '') &&
    (a.workout_day_id ?? '') === (b.workout_day_id ?? '')
  )
}

export function loadAllenamentoOggiDraft(
  athleteProfileId: string,
): AllenamentoOggiDraftPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const p = parse(sessionStorage.getItem(storageKey(athleteProfileId)))
    if (!p) return null
    const age = Date.now() - new Date(p.savedAt).getTime()
    if (!Number.isFinite(age) || age > MAX_AGE_MS) {
      clearAllenamentoOggiDraft(athleteProfileId)
      return null
    }
    return p
  } catch {
    return null
  }
}

export function saveAllenamentoOggiDraftSync(
  athleteProfileId: string,
  data: Omit<AllenamentoOggiDraftPayload, 'v'>,
): void {
  if (typeof window === 'undefined') return
  try {
    const full: AllenamentoOggiDraftPayload = { v: 1, ...data }
    sessionStorage.setItem(storageKey(athleteProfileId), JSON.stringify(full))
  } catch {
    /* quota */
  }
}

export function clearAllenamentoOggiDraft(athleteProfileId: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(storageKey(athleteProfileId))
  } catch {
    /* ignore */
  }
}
