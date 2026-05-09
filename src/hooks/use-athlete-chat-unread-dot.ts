'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { subscribePostgresChanges } from '@/lib/realtimeClient'
import { useRealtimeResubscribeToken } from '@/hooks/useRealtimeChannel'

function useReceiverUnreadDot(profileId: string | null, realtimeChannelPrefix: string): boolean {
  const [hasUnread, setHasUnread] = useState(false)
  const resubscribeToken = useRealtimeResubscribeToken()

  const refresh = useCallback(async () => {
    if (!profileId) {
      setHasUnread(false)
      return
    }

    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', profileId)
      .is('read_at', null)

    if (error) {
      setHasUnread(false)
      return
    }
    setHasUnread((count ?? 0) > 0)
  }, [profileId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  useEffect(() => {
    if (!profileId) return

    return subscribePostgresChanges(`${realtimeChannelPrefix}:${profileId}`, [
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${profileId}`,
        onEvent: () => void refresh(),
      },
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${profileId}`,
        onEvent: () => void refresh(),
      },
    ])
  }, [profileId, refresh, resubscribeToken, realtimeChannelPrefix])

  return hasUnread
}

/**
 * True se l’atleta ha almeno un messaggio in chat con `read_at` null (ricevuti).
 * Usato sulla home (`/home`) per il pallino sulla tile CHAT.
 */
export function useAthleteChatUnreadDot(profileId: string | null): boolean {
  return useReceiverUnreadDot(profileId, 'home-athlete-chat-unread')
}

/**
 * True se lo staff ha almeno un messaggio ricevuto non letto (`receiver_id` = profilo).
 * Dashboard: tile Chat nelle azioni rapide.
 */
export function useStaffChatUnreadDot(profileId: string | null): boolean {
  return useReceiverUnreadDot(profileId, 'dashboard-staff-chat-unread')
}
