import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { subscribePostgresChanges } from '@/lib/realtimeClient'
import { useRealtimeResubscribeToken } from '@/hooks/useRealtimeChannel'

/** @deprecated Preferire `useChatRealtimeOptimized` (filtro su `profiles.id`). */
export function useChatRealtime(onMessageReceived: () => void, onMessageUpdated: () => void) {
  const isMountedRef = useRef(true)
  const resubscribeToken = useRealtimeResubscribeToken()

  useEffect(() => {
    isMountedRef.current = true
    let disposed = false
    let unsubscribe: (() => void) | undefined
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || disposed) return

      const channelName = `chat_realtime_auth_${user.id}`

      const u = subscribePostgresChanges(channelName, [
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`,
          onEvent: () => {
            if (isMountedRef.current) onMessageReceived()
          },
        },
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`,
          onEvent: () => {
            if (isMountedRef.current) onMessageUpdated()
          },
        },
      ])

      if (disposed) {
        u()
        return
      }
      unsubscribe = u
    })()

    return () => {
      disposed = true
      isMountedRef.current = false
      unsubscribe?.()
    }
  }, [onMessageReceived, onMessageUpdated, resubscribeToken])
}
