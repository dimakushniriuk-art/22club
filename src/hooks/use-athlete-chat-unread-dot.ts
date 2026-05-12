'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { subscribePostgresChanges } from '@/lib/realtimeClient'
import { useRealtimeResubscribeToken } from '@/hooks/useRealtimeChannel'
import { queryKeys } from '@/lib/query-keys'

async function fetchReceiverHasUnread(profileId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', profileId)
    .is('read_at', null)

  if (error) {
    return false
  }
  return (count ?? 0) > 0
}

function useReceiverUnreadDot(
  profileId: string | null,
  realtimeChannelPrefix: string,
  enabled = true,
): boolean {
  const queryClient = useQueryClient()
  const resubscribeToken = useRealtimeResubscribeToken()
  const queryKey = queryKeys.chat.unreadReceiver(realtimeChannelPrefix, profileId ?? '')

  const { data: hasUnread = false } = useQuery({
    queryKey,
    queryFn: () => fetchReceiverHasUnread(profileId!),
    enabled: enabled && Boolean(profileId),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    if (!profileId || !enabled) return

    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey })
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') invalidate()
    }
    window.addEventListener('focus', invalidate)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', invalidate)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [profileId, enabled, queryClient, queryKey])

  useEffect(() => {
    if (!profileId || !enabled) return

    return subscribePostgresChanges(`${realtimeChannelPrefix}:${profileId}`, [
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${profileId}`,
        onEvent: () => {
          void queryClient.invalidateQueries({ queryKey })
        },
      },
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${profileId}`,
        onEvent: () => {
          void queryClient.invalidateQueries({ queryKey })
        },
      },
    ])
  }, [profileId, enabled, queryClient, queryKey, resubscribeToken, realtimeChannelPrefix])

  return hasUnread
}

/**
 * True se l’atleta ha almeno un messaggio in chat con `read_at` null (ricevuti).
 * Usato sulla home (`/home`) per il pallino sulla tile CHAT.
 */
export function useAthleteChatUnreadDot(profileId: string | null, enabled = true): boolean {
  return useReceiverUnreadDot(profileId, 'home-athlete-chat-unread', enabled)
}

/**
 * True se lo staff ha almeno un messaggio ricevuto non letto (`receiver_id` = profilo).
 * Dashboard: tile Chat nelle azioni rapide.
 */
export function useStaffChatUnreadDot(profileId: string | null, enabled = true): boolean {
  return useReceiverUnreadDot(profileId, 'dashboard-staff-chat-unread', enabled)
}
