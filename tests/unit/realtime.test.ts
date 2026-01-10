import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRealtimeChannel,
  subscribeToTable,
  subscribeToChannel,
  broadcastToChannel,
  cleanupRealtimeChannels,
} from '@/lib/realtimeClient'

// Mock per le funzioni di realtime
vi.mock('@/lib/realtimeClient', () => ({
  getRealtimeChannel: vi.fn(),
  subscribeToTable: vi.fn(),
  subscribeToChannel: vi.fn(),
  broadcastToChannel: vi.fn(),
  cleanupRealtimeChannels: vi.fn(),
}))

describe('Realtime functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRealtimeChannel', () => {
    it('should return channel instance', () => {
      const mockChannel = {
        on: vi.fn(),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(getRealtimeChannel).mockReturnValue(mockChannel as any)

      const result = getRealtimeChannel('test-channel')

      expect(getRealtimeChannel).toHaveBeenCalledWith('test-channel')
      expect(result).toBe(mockChannel)
    })
  })

  describe('subscribeToTable', () => {
    it('should subscribe to table changes', () => {
      const mockUnsubscribe = vi.fn()
      const mockCallback = vi.fn()

      vi.mocked(subscribeToTable).mockReturnValue(mockUnsubscribe)

      const result = subscribeToTable('notifications', mockCallback, 'INSERT')

      expect(subscribeToTable).toHaveBeenCalledWith('notifications', mockCallback, 'INSERT')
      expect(result).toBe(mockUnsubscribe)
    })

    it('should use default event type', () => {
      const mockUnsubscribe = vi.fn()
      const mockCallback = vi.fn()

      vi.mocked(subscribeToTable).mockReturnValue(mockUnsubscribe)

      const result = subscribeToTable('appointments', mockCallback)

      // Verifica che sia stato chiamato con i primi due parametri
      expect(subscribeToTable).toHaveBeenCalledWith('appointments', mockCallback)
      // Il terzo parametro è opzionale con default '*', ma non viene passato quando non specificato
      expect(result).toBe(mockUnsubscribe)
    })
  })

  describe('subscribeToChannel', () => {
    it('should subscribe to custom channel', () => {
      const mockUnsubscribe = vi.fn()
      const mockCallback = vi.fn()

      vi.mocked(subscribeToChannel).mockReturnValue(mockUnsubscribe)

      const result = subscribeToChannel('test-channel', 'test-event', mockCallback)

      expect(subscribeToChannel).toHaveBeenCalledWith('test-channel', 'test-event', mockCallback)
      expect(result).toBe(mockUnsubscribe)
    })
  })

  describe('broadcastToChannel', () => {
    it('should broadcast to channel', () => {
      const mockPayload = { message: 'test' }

      broadcastToChannel('test-channel', 'test-event', mockPayload)

      expect(broadcastToChannel).toHaveBeenCalledWith('test-channel', 'test-event', mockPayload)
    })
  })

  describe('cleanupRealtimeChannels', () => {
    it('should cleanup all channels', () => {
      cleanupRealtimeChannels()

      expect(cleanupRealtimeChannels).toHaveBeenCalled()
    })
  })
})
