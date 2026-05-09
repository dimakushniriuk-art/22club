'use client'
import { useEffect, useRef, useState } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '@/types/supabase'
import { REALTIME_RESUBSCRIBE_EVENT } from '@/lib/session-stability/app-events'
import { subscribeToTable, subscribeToChannel } from '@/lib/realtimeClient'

type TableEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/** Token incrementato su `app:realtime-resubscribe` (sessione / visibility). */
export function useRealtimeResubscribeToken(): number {
  const [resubscribeToken, setResubscribeToken] = useState(0)

  useEffect(() => {
    const bump = () => setResubscribeToken((t) => t + 1)
    window.addEventListener(REALTIME_RESUBSCRIBE_EVENT, bump)
    return () => window.removeEventListener(REALTIME_RESUBSCRIBE_EVENT, bump)
  }, [])

  return resubscribeToken
}

export function useRealtimeChannel<TableName extends keyof SupabaseDatabase['public']['Tables']>(
  table: TableName,
  onEvent: (
    payload: RealtimePostgresChangesPayload<SupabaseDatabase['public']['Tables'][TableName]['Row']>,
  ) => void,
  eventType: TableEvent = '*',
) {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const resubscribeToken = useRealtimeResubscribeToken()

  useEffect(() => {
    const unsubscribe = subscribeToTable(table, (payload) => onEventRef.current(payload), eventType)

    return unsubscribe
  }, [table, eventType, resubscribeToken])
}

export function useCustomChannel<T>(
  channelName: string | null | undefined,
  eventName: string,
  onEvent: (payload: T) => void,
) {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const resubscribeToken = useRealtimeResubscribeToken()

  useEffect(() => {
    if (!channelName) {
      return undefined
    }

    const unsubscribe = subscribeToChannel(channelName, eventName, (payload: T) =>
      onEventRef.current(payload),
    )

    return unsubscribe
  }, [channelName, eventName, resubscribeToken])
}

export function useRealtimeNotifications(userId?: string) {
  useRealtimeChannel(
    'notifications',
    (payload) => {
      const newNotification = payload.new as
        | SupabaseDatabase['public']['Tables']['notifications']['Row']
        | null
      if (newNotification && newNotification.user_id === userId) {
        // Gestisci la notifica
      }
    },
    'INSERT',
  )
}

export interface ChatMessagePayload {
  id: string
  message: string
  created_at: string
  sender_id: string
  receiver_id: string
}

export function useChatRealtime(chatId?: string) {
  useCustomChannel<ChatMessagePayload>(chatId ? `chat:${chatId}` : null, 'message', () => {
    // Gestisci nuovo messaggio
  })
}
