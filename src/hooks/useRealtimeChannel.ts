'use client'
import { useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '@/types/supabase'
import { subscribeToTable, subscribeToChannel } from '@/lib/realtimeClient'

type TableEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

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

  useEffect(() => {
    const unsubscribe = subscribeToTable(table, (payload) => onEventRef.current(payload), eventType)

    return unsubscribe
  }, [table, eventType])
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

  useEffect(() => {
    if (!channelName) {
      return undefined
    }

    const unsubscribe = subscribeToChannel(channelName, eventName, (payload: T) =>
      onEventRef.current(payload),
    )

    return unsubscribe
  }, [channelName, eventName])
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

export function useAppointmentsRealtime(orgId?: string) {
  useRealtimeChannel(
    'appointments',
    (payload) => {
      const newAppointment = payload.new as
        | SupabaseDatabase['public']['Tables']['appointments']['Row']
        | null
      if (newAppointment && newAppointment.org_id === orgId) {
        // Gestisci aggiornamento appuntamento
      }
    },
    '*',
  )
}

export function useDocumentsRealtime(orgId?: string) {
  useRealtimeChannel(
    'documents',
    (payload) => {
      const newDocument = payload.new as
        | SupabaseDatabase['public']['Tables']['documents']['Row']
        | null
      if (newDocument && newDocument.org_id === orgId) {
        // Gestisci aggiornamento documento
      }
    },
    '*',
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
