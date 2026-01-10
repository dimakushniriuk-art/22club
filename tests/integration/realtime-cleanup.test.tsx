import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  subscribeToTable,
  subscribeToChannel,
  cleanupRealtimeChannels,
  getChannelsCount,
  cleanupChannel,
} from '@/lib/realtimeClient'
import { useRealtimeChannel, useCustomChannel } from '@/hooks/useRealtimeChannel'

// Mock Supabase client
const mockUnsubscribe = vi.fn()
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
  unsubscribe: mockUnsubscribe,
} as unknown as RealtimeChannel

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
  },
}))

describe('Realtime Memory Leak Prevention', () => {
  beforeEach(() => {
    // Pulisci tutti i canali prima di ogni test
    cleanupRealtimeChannels()
    vi.clearAllMocks()
  })

  describe('subscribeToTable cleanup', () => {
    it('should remove channel from Map when cleanup function is called', () => {
      const callback = vi.fn()

      // Crea subscription
      const cleanup1 = subscribeToTable('appointments', callback)
      const cleanup2 = subscribeToTable('documents', callback)

      // Verifica che ci siano 2 canali
      expect(getChannelsCount()).toBe(2)

      // Chiama cleanup
      cleanup1()
      cleanup2()

      // Verifica che Map sia vuota dopo cleanup
      expect(getChannelsCount()).toBe(0)
      expect(mockUnsubscribe).toHaveBeenCalledTimes(2)
    })

    it('should handle multiple subscriptions to same table', () => {
      const callback = vi.fn()

      // Crea multiple subscription allo stesso table (dovrebbe riutilizzare canale)
      const cleanup1 = subscribeToTable('appointments', callback)
      const cleanup2 = subscribeToTable('appointments', callback)

      // Dovrebbe essere 1 canale (stesso nome)
      expect(getChannelsCount()).toBe(1)

      // Cleanup
      cleanup1()
      expect(getChannelsCount()).toBe(0)

      cleanup2() // Non dovrebbe crashare anche se già pulito
      expect(getChannelsCount()).toBe(0)
    })
  })

  describe('subscribeToChannel cleanup', () => {
    it('should remove channel from Map when cleanup function is called', () => {
      const callback = vi.fn()

      // Crea subscription
      const cleanup1 = subscribeToChannel('chat:123', 'message', callback)
      const cleanup2 = subscribeToChannel('chat:456', 'message', callback)

      // Verifica che ci siano 2 canali
      expect(getChannelsCount()).toBe(2)

      // Chiama cleanup
      cleanup1()
      cleanup2()

      // Verifica che Map sia vuota dopo cleanup
      expect(getChannelsCount()).toBe(0)
      expect(mockUnsubscribe).toHaveBeenCalledTimes(2)
    })
  })

  describe('cleanupChannel function', () => {
    it('should remove specific channel from Map', () => {
      const callback = vi.fn()

      // Crea subscription
      subscribeToTable('appointments', callback)
      subscribeToTable('documents', callback)

      expect(getChannelsCount()).toBe(2)

      // Cleanup canale specifico
      cleanupChannel('realtime:appointments')

      expect(getChannelsCount()).toBe(1)
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })

    it('should handle cleanup of non-existent channel gracefully', () => {
      expect(getChannelsCount()).toBe(0)

      // Cleanup canale non esistente non dovrebbe crashare
      cleanupChannel('realtime:nonexistent')

      expect(getChannelsCount()).toBe(0)
    })
  })

  describe('useRealtimeChannel hook cleanup', () => {
    it('should cleanup on unmount', () => {
      const callback = vi.fn()

      const { unmount } = renderHook(() => useRealtimeChannel('appointments', callback))

      // Verifica che canale sia stato creato
      expect(getChannelsCount()).toBeGreaterThan(0)

      // Unmount dovrebbe triggerare cleanup
      unmount()

      // Verifica che Map sia vuota dopo unmount
      expect(getChannelsCount()).toBe(0)
    })

    it('should cleanup multiple hooks on unmount', () => {
      const callback = vi.fn()

      const { unmount: unmount1 } = renderHook(() => useRealtimeChannel('appointments', callback))
      const { unmount: unmount2 } = renderHook(() => useRealtimeChannel('documents', callback))

      // Verifica che ci siano canali
      expect(getChannelsCount()).toBeGreaterThan(0)

      // Unmount entrambi
      unmount1()
      unmount2()

      // Verifica che Map sia vuota
      expect(getChannelsCount()).toBe(0)
    })
  })

  describe('useCustomChannel hook cleanup', () => {
    it('should cleanup on unmount', () => {
      const callback = vi.fn()

      const { unmount } = renderHook(() => useCustomChannel('chat:123', 'message', callback))

      // Verifica che canale sia stato creato
      expect(getChannelsCount()).toBeGreaterThan(0)

      // Unmount dovrebbe triggerare cleanup
      unmount()

      // Verifica che Map sia vuota dopo unmount
      expect(getChannelsCount()).toBe(0)
    })
  })

  describe('cleanupRealtimeChannels', () => {
    it('should remove all channels from Map', () => {
      const callback = vi.fn()

      // Crea multiple subscription
      subscribeToTable('appointments', callback)
      subscribeToTable('documents', callback)
      subscribeToChannel('chat:123', 'message', callback)

      expect(getChannelsCount()).toBe(3)

      // Cleanup tutti
      cleanupRealtimeChannels()

      expect(getChannelsCount()).toBe(0)
      expect(mockUnsubscribe).toHaveBeenCalledTimes(3)
    })
  })

  describe('Memory leak prevention', () => {
    it('should not accumulate channels after multiple mount/unmount cycles', () => {
      const callback = vi.fn()

      // Simula 5 cicli di mount/unmount
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderHook(() => useRealtimeChannel('appointments', callback))
        unmount()
      }

      // Dopo tutti i cicli, Map dovrebbe essere vuota
      expect(getChannelsCount()).toBe(0)
    })

    it('should handle rapid mount/unmount without memory leak', () => {
      const callback = vi.fn()

      // Crea e distruggi rapidamente
      const hooks = Array.from({ length: 10 }, () =>
        renderHook(() => useRealtimeChannel('appointments', callback)),
      )

      // Unmount tutti
      hooks.forEach(({ unmount }) => unmount())

      // Verifica che non ci siano canali orfani
      expect(getChannelsCount()).toBe(0)
    })
  })
})
