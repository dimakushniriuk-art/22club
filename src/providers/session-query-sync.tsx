'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import {
  AUTH_TOKEN_REFRESHED_EVENT,
  SESSION_RESUMED_EVENT,
  dispatchRealtimeResubscribe,
} from '@/lib/session-stability/app-events'
import { shouldInvalidateQueryOnSessionResume } from '@/lib/session-stability/session-query-invalidation'
import { sessionStabilityBreadcrumb } from '@/lib/session-stability/sentry-session-stability'
import { cleanupRealtimeChannels } from '@/lib/realtimeClient'

const DEBOUNCE_MS = 450

/**
 * Dopo risveglio tab o refresh JWT: invalida query whitelist, pulisce canali Realtime zombie,
 * notifica gli hook che devono ri-sottoscriversi.
 */
export function SessionQuerySync() {
  const queryClient = useQueryClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tokenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const runInvalidate = (source: 'session_resumed' | 'token_refreshed') => {
      sessionStabilityBreadcrumb(
        source === 'session_resumed' ? 'session_resumed' : 'token_refreshed',
        'invalidate_queries',
        { source },
      )
      if (source === 'session_resumed') {
        cleanupRealtimeChannels()
        dispatchRealtimeResubscribe()
      }
      void queryClient.invalidateQueries({
        predicate: (q) => shouldInvalidateQueryOnSessionResume(q.queryKey as readonly unknown[]),
      })
    }

    const schedule = (source: 'session_resumed' | 'token_refreshed') => {
      const ref = source === 'session_resumed' ? timerRef : tokenTimerRef
      if (ref.current) clearTimeout(ref.current)
      ref.current = setTimeout(() => {
        ref.current = null
        runInvalidate(source)
      }, DEBOUNCE_MS)
    }

    const onSession = () => schedule('session_resumed')
    const onToken = () => schedule('token_refreshed')

    window.addEventListener(SESSION_RESUMED_EVENT, onSession)
    window.addEventListener(AUTH_TOKEN_REFRESHED_EVENT, onToken)
    return () => {
      window.removeEventListener(SESSION_RESUMED_EVENT, onSession)
      window.removeEventListener(AUTH_TOKEN_REFRESHED_EVENT, onToken)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (tokenTimerRef.current) clearTimeout(tokenTimerRef.current)
    }
  }, [queryClient])

  return null
}
