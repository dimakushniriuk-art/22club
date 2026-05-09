'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PENDING_WRITES_FLUSHED_EVENT } from '@/lib/session-stability/app-events'
import {
  flushPendingWrites,
  registerPendingWriteHandler,
  subscribePendingWriteFlush,
} from '@/lib/session-stability/pending-write-queue'
import {
  invalidateAllenamentiQueries,
  invalidateAppointmentsQueries,
} from '@/lib/react-query/post-mutation-cache'
import { buildWorkoutLogUpdatePayload } from '@/lib/workout-logs/build-workout-log-update-payload'
import type { Allenamento } from '@/types/allenamento'

/**
 * Registra handler coda scritture, flush su online/session-resumed, invalidazione RQ dopo flush.
 */
export function PendingWriteBootstrap() {
  const queryClient = useQueryClient()

  useEffect(() => {
    registerPendingWriteHandler('appointments_update', async (payload) => {
      const body = payload as { id: string; updates: Record<string, unknown> }
      const client = createClient()
      const { error } = await client.from('appointments').update(body.updates).eq('id', body.id)
      if (error) throw error
    })

    registerPendingWriteHandler('appointments_cancel', async (payload) => {
      const { id } = payload as { id: string }
      const client = createClient()
      const { error } = await client
        .from('appointments')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    })

    registerPendingWriteHandler('notifications_mark_read', async (payload) => {
      const { notificationId, userId } = payload as { notificationId: string; userId: string }
      const client = createClient()
      const { error } = await client
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)
      if (error) throw error
    })

    registerPendingWriteHandler('notifications_mark_all_read', async (payload) => {
      const { userId } = payload as { userId: string }
      const client = createClient()
      const { error } = await client
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      if (error) throw error
    })

    registerPendingWriteHandler('workout_logs_update', async (payload) => {
      const body = payload as { id: string; updates: Partial<Allenamento> }
      const client = createClient()
      const patch = buildWorkoutLogUpdatePayload(body.updates)
      const { error } = await client.from('workout_logs').update(patch).eq('id', body.id)
      if (error) throw error
    })

    registerPendingWriteHandler('workout_logs_delete', async (payload) => {
      const { id } = payload as { id: string }
      const client = createClient()
      const { error } = await client.from('workout_logs').delete().eq('id', id)
      if (error) throw error
    })

    const offFlush = subscribePendingWriteFlush()
    void flushPendingWrites()

    const onFlushed = (ev: Event) => {
      const ce = ev as CustomEvent<{ count?: number }>
      const n = ce.detail?.count ?? 0
      if (n > 0) {
        void invalidateAppointmentsQueries(queryClient)
        void invalidateAllenamentiQueries(queryClient)
      }
    }
    window.addEventListener(PENDING_WRITES_FLUSHED_EVENT, onFlushed)

    return () => {
      offFlush()
      window.removeEventListener(PENDING_WRITES_FLUSHED_EVENT, onFlushed)
    }
  }, [queryClient])

  return null
}
