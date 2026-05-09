import {
  PENDING_WRITES_FLUSHED_EVENT,
  SESSION_RESUMED_EVENT,
} from '@/lib/session-stability/app-events'
import { sessionStabilityBreadcrumb } from '@/lib/session-stability/sentry-session-stability'

const STORAGE_KEY = '22club-pending-writes-v1'
const MAX_ITEMS = 40

export type PendingWriteKind =
  | 'appointments_update'
  | 'appointments_cancel'
  | 'notifications_mark_read'
  | 'notifications_mark_all_read'
  | 'workout_logs_update'
  | 'workout_logs_delete'

export interface PendingWriteItem {
  kind: PendingWriteKind
  idempotencyKey: string
  payload: unknown
  enqueuedAt: number
}

type Handler = (payload: unknown) => Promise<void>

const handlers = new Map<string, Handler>()

let flushInFlight: Promise<number> | null = null

export function registerPendingWriteHandler(kind: string, handler: Handler): void {
  handlers.set(kind, handler)
}

function readQueue(): PendingWriteItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPendingWriteItem)
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return []
  }
}

const KNOWN_KINDS = new Set<string>([
  'appointments_update',
  'appointments_cancel',
  'notifications_mark_read',
  'notifications_mark_all_read',
  'workout_logs_update',
  'workout_logs_delete',
])

function isPendingWriteItem(x: unknown): x is PendingWriteItem {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.kind === 'string' &&
    KNOWN_KINDS.has(o.kind) &&
    typeof o.idempotencyKey === 'string' &&
    typeof o.enqueuedAt === 'number'
  )
}

function writeQueue(items: PendingWriteItem[]): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

/**
 * Accoda una scrittura fallita per rete offline/tab chiusa durante fetch.
 * `idempotencyKey` univoco per evitare duplicati alla riproposizione.
 */
export function enqueuePendingWrite(item: Omit<PendingWriteItem, 'enqueuedAt'>): void {
  if (typeof window === 'undefined') return
  const next: PendingWriteItem = { ...item, enqueuedAt: Date.now() }
  const existing = readQueue().filter((q) => q.idempotencyKey !== item.idempotencyKey)
  const merged = [...existing, next].slice(-MAX_ITEMS)
  writeQueue(merged)
  sessionStabilityBreadcrumb('pending_write', 'enqueued', {
    kind: item.kind,
    idempotencyKey: item.idempotencyKey,
  })
}

/**
 * Riesegue le voci in coda (handler registrati). Ritorna quante voci completate con successo.
 */
export function flushPendingWrites(): Promise<number> {
  if (typeof window === 'undefined') return Promise.resolve(0)
  if (flushInFlight) return flushInFlight

  flushInFlight = (async () => {
    const list = readQueue()
    if (list.length === 0) return 0
    let completed = 0
    const remaining: PendingWriteItem[] = []

    for (const item of list) {
      const handler = handlers.get(item.kind)
      if (!handler) {
        remaining.push(item)
        continue
      }
      try {
        await handler(item.payload)
        completed++
        sessionStabilityBreadcrumb('pending_write', 'flushed_ok', { kind: item.kind })
      } catch {
        remaining.push(item)
      }
    }

    writeQueue(remaining)
    if (completed > 0) {
      window.dispatchEvent(
        new CustomEvent(PENDING_WRITES_FLUSHED_EVENT, { detail: { count: completed } }),
      )
    }
    return completed
  })().finally(() => {
    flushInFlight = null
  })

  return flushInFlight
}

/** Listener online + session resumed (stesso canale degli altri recovery). */
export function subscribePendingWriteFlush(): () => void {
  if (typeof window === 'undefined') return () => {}
  const run = () => {
    void flushPendingWrites()
  }
  window.addEventListener('online', run)
  window.addEventListener(SESSION_RESUMED_EVENT, run)
  return () => {
    window.removeEventListener('online', run)
    window.removeEventListener(SESSION_RESUMED_EVENT, run)
  }
}

export function appointmentUpdateIdempotencyKey(
  id: string,
  updates: Record<string, unknown>,
): string {
  const keys = Object.keys(updates).sort()
  const normalized = keys.map((k) => [k, updates[k]] as const)
  return `appointments_update:${id}:${JSON.stringify(normalized)}`
}

export function appointmentCancelIdempotencyKey(id: string): string {
  return `appointments_cancel:${id}`
}

export function notificationMarkReadIdempotencyKey(notificationId: string, userId: string): string {
  return `notifications_mark_read:${userId}:${notificationId}`
}

export function notificationMarkAllReadIdempotencyKey(userId: string): string {
  return `notifications_mark_all_read:${userId}`
}

export function workoutLogsUpdateIdempotencyKey(
  id: string,
  updates: Record<string, unknown>,
): string {
  const keys = Object.keys(updates).sort()
  const normalized = keys.map((k) => [k, updates[k]] as const)
  return `workout_logs_update:${id}:${JSON.stringify(normalized)}`
}

export function workoutLogsDeleteIdempotencyKey(id: string): string {
  return `workout_logs_delete:${id}`
}
