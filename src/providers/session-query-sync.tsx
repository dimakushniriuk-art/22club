'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  AUTH_TOKEN_REFRESHED_EVENT,
  SESSION_RESUMED_EVENT,
  dispatchRealtimeResubscribe,
} from '@/lib/session-stability/app-events'
import { shouldInvalidateQueryOnSessionResume } from '@/lib/session-stability/session-query-invalidation'
import { sessionStabilityBreadcrumb } from '@/lib/session-stability/sentry-session-stability'
import { cleanupRealtimeChannels } from '@/lib/realtimeClient'
import { SESSION_QUERY_SYNC_DEBOUNCE_MS } from '@/lib/session-stability/platform-sync-constants'

/**
 * Dopo risveglio tab o refresh JWT: invalida query whitelist, pulisce canali Realtime zombie,
 * notifica gli hook che devono ri-sottoscriversi.
 * `router.refresh` solo su `session_resumed` (tab visibile): evita burst su `TOKEN_REFRESHED`.
 */
export function SessionQuerySync() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    let sessionDebounce: ReturnType<typeof setTimeout> | null = null
    let tokenDebounce: ReturnType<typeof setTimeout> | null = null

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
      // `router.refresh` solo dopo risveglio tab: allinea RSC/cookie senza burst su ogni TOKEN_REFRESHED.
      const canRefreshRsc =
        source === 'session_resumed' &&
        (typeof document === 'undefined' || document.visibilityState === 'visible')
      if (canRefreshRsc) {
        try {
          router.refresh()
        } catch {
          /* no-op */
        }
      }
    }

    const schedule = (source: 'session_resumed' | 'token_refreshed') => {
      if (source === 'session_resumed') {
        if (sessionDebounce) clearTimeout(sessionDebounce)
        sessionDebounce = setTimeout(() => {
          sessionDebounce = null
          runInvalidate(source)
        }, SESSION_QUERY_SYNC_DEBOUNCE_MS)
      } else {
        if (tokenDebounce) clearTimeout(tokenDebounce)
        tokenDebounce = setTimeout(() => {
          tokenDebounce = null
          runInvalidate(source)
        }, SESSION_QUERY_SYNC_DEBOUNCE_MS)
      }
    }

    const onSession = () => schedule('session_resumed')
    const onToken = () => schedule('token_refreshed')

    window.addEventListener(SESSION_RESUMED_EVENT, onSession)
    window.addEventListener(AUTH_TOKEN_REFRESHED_EVENT, onToken)
    return () => {
      window.removeEventListener(SESSION_RESUMED_EVENT, onSession)
      window.removeEventListener(AUTH_TOKEN_REFRESHED_EVENT, onToken)
      if (sessionDebounce) clearTimeout(sessionDebounce)
      if (tokenDebounce) clearTimeout(tokenDebounce)
    }
  }, [queryClient, router])

  return null
}
