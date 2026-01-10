/**
 * Hook ottimizzato per realtime chat
 * Gestisce correttamente cleanup delle subscriptions per evitare memory leak
 */

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import { useChatProfile } from './use-chat-profile'

const logger = createLogger('useChatRealtimeOptimized')

export function useChatRealtimeOptimized(
  onMessageReceived: () => void,
  onMessageUpdated: () => void,
  onMessageDeleted?: () => void,
) {
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isMountedRef = useRef(true)
  const { getCurrentProfileId } = useChatProfile()

  useEffect(() => {
    isMountedRef.current = true

    // Funzione async per setup subscription
    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !isMountedRef.current) return

      // Ottieni il profile_id (profiles.id) invece di user.id (auth.users.id)
      let profileId: string | null = null
      try {
        profileId = await getCurrentProfileId()
      } catch (error) {
        logger.error('Error getting profile ID for realtime', error)
        return
      }

      if (!profileId || !isMountedRef.current) return

      // Rimuovi subscription precedente se esiste
      if (channelRef.current) {
        try {
          await supabase.removeChannel(channelRef.current)
        } catch (error) {
          // Ignora errori di cleanup
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Error removing previous channel', { error })
          }
        }
      }

      // Crea nuova subscription usando profile_id
      // IMPORTANTE: receiver_id nella tabella è profiles.id, non auth.users.id
      const channel = supabase
        .channel(`chat_realtime_${profileId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `receiver_id=eq.${profileId}`,
          },
          () => {
            if (isMountedRef.current) {
              onMessageReceived()
            }
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `receiver_id=eq.${profileId}`,
          },
          () => {
            if (isMountedRef.current) {
              onMessageUpdated()
            }
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_messages',
            filter: `receiver_id=eq.${profileId}`,
          },
          () => {
            if (isMountedRef.current && onMessageDeleted) {
              onMessageDeleted()
            }
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_messages',
            filter: `sender_id=eq.${profileId}`,
          },
          () => {
            if (isMountedRef.current && onMessageDeleted) {
              onMessageDeleted()
            }
          },
        )
        .subscribe((status) => {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Subscription status', { status, profileId })
          }
        })

      channelRef.current = channel
    }

    setupSubscription()

    // Cleanup function
    return () => {
      isMountedRef.current = false

      if (channelRef.current) {
        supabase
          .removeChannel(channelRef.current)
          .then(() => {
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Channel removed successfully')
            }
          })
          .catch((error) => {
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Error removing channel', { error })
            }
          })
        channelRef.current = null
      }
    }
  }, [supabase, onMessageReceived, onMessageUpdated, onMessageDeleted, getCurrentProfileId])
}
