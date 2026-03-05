import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  useRealtimeChannel,
  useCustomChannel,
  useRealtimeNotifications,
  useAppointmentsRealtime,
  useDocumentsRealtime,
  useChatRealtime,
} from '@/hooks/useRealtimeChannel'

// Mock per le funzioni di realtime
const { subscribeToTableMock, subscribeToChannelMock } = vi.hoisted(() => ({
  subscribeToTableMock: vi.fn(),
  subscribeToChannelMock: vi.fn(),
}))

vi.mock('@/lib/realtimeClient', () => ({
  subscribeToTable: subscribeToTableMock,
  subscribeToChannel: subscribeToChannelMock,
}))

describe('Realtime Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useRealtimeChannel', () => {
    it('should subscribe to table changes', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      subscribeToTableMock.mockReturnValue(mockUnsubscribe)

      renderHook(() => useRealtimeChannel('notifications', mockCallback, 'INSERT'))

      expect(subscribeToTableMock).toHaveBeenCalledWith(
        'notifications',
        expect.any(Function),
        'INSERT',
      )
    })

    it('should use default event type', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      subscribeToTableMock.mockReturnValue(mockUnsubscribe)

      renderHook(() => useRealtimeChannel('appointments', mockCallback))

      expect(subscribeToTableMock).toHaveBeenCalledWith('appointments', expect.any(Function), '*')
    })
  })

  describe('useCustomChannel', () => {
    it('should subscribe to custom channel', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      subscribeToChannelMock.mockReturnValue(mockUnsubscribe)

      renderHook(() => useCustomChannel('test-channel', 'test-event', mockCallback))

      expect(subscribeToChannelMock).toHaveBeenCalledWith(
        'test-channel',
        'test-event',
        expect.any(Function),
      )
    })
  })

  describe('useRealtimeNotifications', () => {
    it('should subscribe to notifications', () => {
      const mockUnsubscribe = vi.fn()

      subscribeToTableMock.mockReturnValue(mockUnsubscribe)

      renderHook(() => useRealtimeNotifications('test-user-id'))

      expect(subscribeToTableMock).toHaveBeenCalledWith(
        'notifications',
        expect.any(Function),
        'INSERT',
      )
    })
  })

  describe('useAppointmentsRealtime', () => {
    it('should subscribe to appointments', () => {
      const mockUnsubscribe = vi.fn()

      subscribeToTableMock.mockReturnValue(mockUnsubscribe)

      renderHook(() => useAppointmentsRealtime('test-org-id'))

      expect(subscribeToTableMock).toHaveBeenCalledWith('appointments', expect.any(Function), '*')
    })
  })

  describe('useDocumentsRealtime', () => {
    it('should subscribe to documents', () => {
      const mockUnsubscribe = vi.fn()

      subscribeToTableMock.mockReturnValue(mockUnsubscribe)

      renderHook(() => useDocumentsRealtime('test-org-id'))

      expect(subscribeToTableMock).toHaveBeenCalledWith('documents', expect.any(Function), '*')
    })
  })

  describe('useChatRealtime', () => {
    it('should subscribe to chat', () => {
      const mockUnsubscribe = vi.fn()

      subscribeToChannelMock.mockReturnValue(mockUnsubscribe)

      renderHook(() => useChatRealtime('test-chat-id'))

      expect(subscribeToChannelMock).toHaveBeenCalledWith(
        'chat:test-chat-id',
        'message',
        expect.any(Function),
      )
    })
  })
})
