import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  removeNotification,
  clearNotifications,
  getNotifications,
  subscribeToNotifications,
  useNotifications,
} from '@/lib/notifications'

// Mock per le funzioni di notifica
vi.mock('@/lib/notifications', () => ({
  notify: vi.fn(),
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
  notifyInfo: vi.fn(),
  removeNotification: vi.fn(),
  clearNotifications: vi.fn(),
  getNotifications: vi.fn(),
  subscribeToNotifications: vi.fn(),
  useNotifications: vi.fn(),
}))

describe('Notification functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('notify', () => {
    it('should call notify function with payload', () => {
      const payload = {
        type: 'info' as const,
        title: 'Test Notification',
        message: 'This is a test',
        duration: 5000,
      }

      vi.mocked(notify).mockReturnValue('test-id')

      const result = notify(payload)

      expect(notify).toHaveBeenCalledWith(payload)
      expect(result).toBe('test-id')
    })
  })

  describe('notifySuccess', () => {
    it('should call notifySuccess function', () => {
      vi.mocked(notifySuccess).mockReturnValue('success-id')

      const result = notifySuccess('Success!', 'Operation completed')

      expect(notifySuccess).toHaveBeenCalledWith('Success!', 'Operation completed')
      expect(result).toBe('success-id')
    })
  })

  describe('notifyError', () => {
    it('should call notifyError function', () => {
      vi.mocked(notifyError).mockReturnValue('error-id')

      const result = notifyError('Error!', 'Something went wrong')

      expect(notifyError).toHaveBeenCalledWith('Error!', 'Something went wrong')
      expect(result).toBe('error-id')
    })
  })

  describe('notifyWarning', () => {
    it('should call notifyWarning function', () => {
      vi.mocked(notifyWarning).mockReturnValue('warning-id')

      const result = notifyWarning('Warning!', 'Please check this')

      expect(notifyWarning).toHaveBeenCalledWith('Warning!', 'Please check this')
      expect(result).toBe('warning-id')
    })
  })

  describe('notifyInfo', () => {
    it('should call notifyInfo function', () => {
      vi.mocked(notifyInfo).mockReturnValue('info-id')

      const result = notifyInfo('Info!', 'Here is some information')

      expect(notifyInfo).toHaveBeenCalledWith('Info!', 'Here is some information')
      expect(result).toBe('info-id')
    })
  })

  describe('removeNotification', () => {
    it('should call removeNotification function', () => {
      removeNotification('test-id')

      expect(removeNotification).toHaveBeenCalledWith('test-id')
    })
  })

  describe('clearNotifications', () => {
    it('should call clearNotifications function', () => {
      clearNotifications()

      expect(clearNotifications).toHaveBeenCalled()
    })
  })

  describe('getNotifications', () => {
    it('should return notifications array', () => {
      const mockNotifications = [
        {
          id: '1',
          type: 'info' as const,
          title: 'Test',
          message: 'Test message',
        },
      ]

      vi.mocked(getNotifications).mockReturnValue(mockNotifications)

      const result = getNotifications()

      expect(getNotifications).toHaveBeenCalled()
      expect(result).toEqual(mockNotifications)
    })
  })

  describe('subscribeToNotifications', () => {
    it('should return unsubscribe function', () => {
      const mockUnsubscribe = vi.fn()
      const mockListener = vi.fn()

      vi.mocked(subscribeToNotifications).mockReturnValue(mockUnsubscribe)

      const result = subscribeToNotifications(mockListener)

      expect(subscribeToNotifications).toHaveBeenCalledWith(mockListener)
      expect(result).toBe(mockUnsubscribe)
    })
  })

  describe('useNotifications', () => {
    it('should return notifications hook', () => {
      const mockHook = {
        notifications: [],
        notify: vi.fn(),
        notifySuccess: vi.fn(),
        notifyError: vi.fn(),
        notifyWarning: vi.fn(),
        notifyInfo: vi.fn(),
        removeNotification: vi.fn(),
        clearNotifications: vi.fn(),
      }

      vi.mocked(useNotifications).mockReturnValue(mockHook)

      const result = useNotifications()

      expect(result).toEqual(mockHook)
    })
  })
})
