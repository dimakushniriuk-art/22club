import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '@/types/supabase'

const channels = new Map<string, RealtimeChannel>()

export function getRealtimeChannel(name: string): RealtimeChannel {
  const existing = channels.get(name)
  if (existing) {
    return existing
  }

  const channel = supabase.channel(name)
  channels.set(name, channel)
  return channel
}

type TableEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

type BroadcastPayload<T> = {
  event: string
  payload: T
}

export function subscribeToTable<TableName extends keyof SupabaseDatabase['public']['Tables']>(
  table: TableName,
  onEvent: (
    payload: RealtimePostgresChangesPayload<SupabaseDatabase['public']['Tables'][TableName]['Row']>,
  ) => void,
  eventType: TableEvent = '*',
) {
  const channelName = `realtime:${String(table)}`
  const channel = getRealtimeChannel(channelName)

  ;(
    channel as unknown as {
      on: (
        event: string,
        options: Record<string, unknown>,
        callback: (payload: unknown) => void,
      ) => RealtimeChannel
    }
  )
    .on(
      'postgres_changes',
      {
        event: eventType,
        schema: 'public',
        table: String(table),
      },
      onEvent as (payload: unknown) => void,
    )
    .subscribe()

  // Cleanup function che rimuove canale da Map
  return () => {
    channel.unsubscribe()
    channels.delete(channelName)
  }
}

export function subscribeToChannel<T>(
  channelName: string,
  eventName: string,
  onEvent: (payload: T) => void,
) {
  const channel = getRealtimeChannel(channelName)

  ;(
    channel as unknown as {
      on: (
        event: string,
        options: Record<string, unknown>,
        callback: (payload: BroadcastPayload<T>) => void,
      ) => RealtimeChannel
    }
  )
    .on('broadcast', { event: eventName }, (payload: BroadcastPayload<T>) =>
      onEvent(payload.payload),
    )
    .subscribe()

  // Cleanup function che rimuove canale da Map
  return () => {
    channel.unsubscribe()
    channels.delete(channelName)
  }
}

export function broadcastToChannel<T>(channelName: string, eventName: string, payload: T) {
  const channel = getRealtimeChannel(channelName)
  ;(
    channel as unknown as {
      send: (payload: Record<string, unknown>) => void
    }
  ).send({
    type: 'broadcast',
    event: eventName,
    payload,
  })
}

// Funzione esplicita per cleanup canale singolo
export function cleanupChannel(name: string) {
  const channel = channels.get(name)
  if (channel) {
    channel.unsubscribe()
    channels.delete(name)
  }
}

// Cleanup function per rimuovere tutti i canali
export function cleanupRealtimeChannels() {
  channels.forEach((channel) => {
    channel.unsubscribe()
  })
  channels.clear()
}

/**
 * Helper per test: ritorna il numero di canali attivi
 * @internal - Solo per test e debugging
 */
export function getChannelsCount(): number {
  return channels.size
}
