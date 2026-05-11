import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '@/types/supabase'

const channels = new Map<string, RealtimeChannel>()

function removeChannel(name: string) {
  const ch = channels.get(name)
  if (!ch) return
  // Remove from the map before unsubscribe(): CLOSED/error callbacks run synchronously
  // during unsubscribe and call removeChannel again — keeping the entry caused stack overflow.
  channels.delete(name)
  try {
    void ch.unsubscribe()
  } catch {
    // ignore
  }
}

/** Alias pubblico per test e cleanup mirato. */
export function cleanupChannel(name: string) {
  removeChannel(name)
}

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

export type PostgresChangesSpec<Row extends Record<string, unknown> = Record<string, unknown>> = {
  event: TableEvent
  schema?: string
  table: string
  filter?: string
  onEvent: (payload: RealtimePostgresChangesPayload<Row>) => void
}

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
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        removeChannel(channelName)
      }
    })

  return () => {
    removeChannel(channelName)
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
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        removeChannel(channelName)
      }
    })

  return () => {
    removeChannel(channelName)
  }
}

/**
 * Una subscription Realtime con nome canale dedicato e una o più clausole `postgres_changes`
 * (filtri inclusi). Usare un `channelName` stabile e univoco per contesto (es. suffisso profilo).
 * Allineato a cleanup su errore / timeout come `subscribeToTable`.
 */
export function subscribePostgresChanges<
  Row extends Record<string, unknown> = Record<string, unknown>,
>(
  channelName: string,
  specs: PostgresChangesSpec<Row>[],
) {
  if (specs.length === 0) {
    return () => {}
  }

  const channel = getRealtimeChannel(channelName)

  for (const spec of specs) {
    const schema = spec.schema ?? 'public'
    const opts: Record<string, unknown> = {
      event: spec.event,
      schema,
      table: spec.table,
    }
    if (spec.filter) {
      opts.filter = spec.filter
    }

    ;(
      channel as unknown as {
        on: (
          event: string,
          options: Record<string, unknown>,
          callback: (payload: unknown) => void,
        ) => RealtimeChannel
      }
    ).on('postgres_changes', opts, (payload: unknown) =>
      spec.onEvent(payload as RealtimePostgresChangesPayload<Row>),
    )
  }

  channel.subscribe((status) => {
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      removeChannel(channelName)
    }
  })

  return () => {
    removeChannel(channelName)
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

export function cleanupRealtimeChannels() {
  for (const name of [...channels.keys()]) {
    removeChannel(name)
  }
}

/**
 * @internal - Solo per test e debugging
 */
export function getChannelsCount(): number {
  return channels.size
}
