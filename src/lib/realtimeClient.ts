import { supabase } from '@/lib/supabase/client'
import { sessionStabilityBreadcrumb } from '@/lib/session-stability/sentry-session-stability'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '@/types/supabase'

const channels = new Map<string, RealtimeChannel>()

type TableEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/** Multiplex: più `subscribeToTable` sulla stessa tabella condividono un canale e un solo `postgres_changes` (`*`). */
type TableMuxListener = {
  eventType: TableEvent
  onEvent: (payload: unknown) => void
}
const tableMuxByChannelName = new Map<
  string,
  { listeners: Map<number, TableMuxListener>; subscribed: boolean }
>()
let tableMuxListenerSeq = 0

function removeChannel(name: string) {
  tableMuxByChannelName.delete(name)
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

function dispatchTableMux(channelName: string, payload: unknown) {
  const mux = tableMuxByChannelName.get(channelName)
  if (!mux) return
  const eventType = (payload as { eventType?: string }).eventType
  for (const l of mux.listeners.values()) {
    if (l.eventType !== '*' && l.eventType !== eventType) continue
    l.onEvent(payload)
  }
}

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
  let mux = tableMuxByChannelName.get(channelName)
  if (!mux) {
    mux = { listeners: new Map(), subscribed: false }
    tableMuxByChannelName.set(channelName, mux)
  }
  const listenerId = ++tableMuxListenerSeq
  mux.listeners.set(listenerId, {
    eventType,
    onEvent: onEvent as (payload: unknown) => void,
  })

  const channel = getRealtimeChannel(channelName)
  if (!mux.subscribed) {
    mux.subscribed = true
    const tableStr = String(table)
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
          event: '*',
          schema: 'public',
          table: tableStr,
        },
        (payload: unknown) => {
          dispatchTableMux(channelName, payload)
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          sessionStabilityBreadcrumb('realtime', 'postgres_table_channel_status', {
            status,
            channel: channelName,
          })
          removeChannel(channelName)
        }
      })
  }

  return () => {
    const m = tableMuxByChannelName.get(channelName)
    if (!m) return
    m.listeners.delete(listenerId)
    if (m.listeners.size === 0) {
      removeChannel(channelName)
    }
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
        sessionStabilityBreadcrumb('realtime', 'broadcast_channel_status', {
          status,
          channel: channelName,
        })
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
>(channelName: string, specs: PostgresChangesSpec<Row>[]) {
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
      sessionStabilityBreadcrumb('realtime', 'postgres_multi_channel_status', {
        status,
        channel: channelName,
      })
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
  tableMuxByChannelName.clear()
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
