/**
 * Hook ottimizzato per realtime chat
 * Gestisce correttamente cleanup delle subscriptions per evitare memory leak
 */

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { subscribePostgresChanges } from '@/lib/realtimeClient'
import { useRealtimeResubscribeToken } from '@/hooks/useRealtimeChannel'
import { useChatProfile } from './use-chat-profile'

const logger = createLogger('useChatRealtimeOptimized')

export function useChatRealtimeOptimized(
  onMessageReceived: () => void,
  onMessageUpdated: () => void,
  onMessageDeleted?: () => void,
) {
  const isMountedRef = useRef(true)
  const { getCurrentProfileId } = useChatProfile()
  const resubscribeToken = useRealtimeResubscribeToken()

  useEffect(() => {
    isMountedRef.current = true
    let disposed = false
    let unsubscribe: (() => void) | undefined

    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !isMountedRef.current || disposed) return

      let profileId: string | null = null
      try {
        profileId = await getCurrentProfileId()
      } catch (error) {
        logger.error('Error getting profile ID for realtime', error)
        return
      }

      if (!profileId || !isMountedRef.current || disposed) return

      const channelName = `chat_realtime_${profileId}`

      const u = subscribePostgresChanges(channelName, [
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${profileId}`,
          onEvent: () => {
            if (isMountedRef.current) {
              onMessageReceived()
            }
          },
        },
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${profileId}`,
          onEvent: () => {
            if (isMountedRef.current) {
              onMessageUpdated()
            }
          },
        },
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${profileId}`,
          onEvent: () => {
            if (isMountedRef.current && onMessageDeleted) {
              onMessageDeleted()
            }
          },
        },
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${profileId}`,
          onEvent: () => {
            if (isMountedRef.current && onMessageDeleted) {
              onMessageDeleted()
            }
          },
        },
      ])

      if (disposed) {
        u()
        return
      }
      unsubscribe = u
    }

    void setupSubscription()

    return () => {
      disposed = true
      isMountedRef.current = false
      unsubscribe?.()
    }
  }, [onMessageReceived, onMessageUpdated, onMessageDeleted, getCurrentProfileId, resubscribeToken])
}
