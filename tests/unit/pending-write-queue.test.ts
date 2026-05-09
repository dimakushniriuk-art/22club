import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pending-write-queue', () => {
  it('enqueue dedupes by idempotencyKey and flush invokes handler', async () => {
    vi.resetModules()
    const { enqueuePendingWrite, flushPendingWrites, registerPendingWriteHandler } =
      await import('@/lib/session-stability/pending-write-queue')

    const calls: unknown[] = []
    registerPendingWriteHandler('appointments_update', async (payload) => {
      calls.push(payload)
    })

    enqueuePendingWrite({
      kind: 'appointments_update',
      idempotencyKey: 'k1',
      payload: { id: 'a', updates: { status: 'completato' } },
    })
    enqueuePendingWrite({
      kind: 'appointments_update',
      idempotencyKey: 'k1',
      payload: { id: 'a', updates: { status: 'completato' } },
    })

    const n = await flushPendingWrites()
    expect(n).toBe(1)
    expect(calls).toHaveLength(1)
  })

  it('flush workout_logs_update handler receives payload', async () => {
    vi.resetModules()
    const { enqueuePendingWrite, flushPendingWrites, registerPendingWriteHandler } =
      await import('@/lib/session-stability/pending-write-queue')

    const calls: unknown[] = []
    registerPendingWriteHandler('workout_logs_update', async (payload) => {
      calls.push(payload)
    })

    enqueuePendingWrite({
      kind: 'workout_logs_update',
      idempotencyKey: 'w1',
      payload: { id: 'log-1', updates: { stato: 'completato' } },
    })

    const n = await flushPendingWrites()
    expect(n).toBe(1)
    expect(calls).toEqual([{ id: 'log-1', updates: { stato: 'completato' } }])
  })
})
