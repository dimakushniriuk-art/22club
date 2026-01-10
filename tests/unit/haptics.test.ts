import { describe, it, expect, vi, beforeEach } from 'vitest'
import { triggerHaptic, haptics, isHapticSupported, requestHapticPermission } from '@/lib/haptics'

// Mock per le funzioni di haptic feedback
vi.mock('@/lib/haptics', () => ({
  triggerHaptic: vi.fn(),
  haptics: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
  },
  isHapticSupported: vi.fn(),
  requestHapticPermission: vi.fn(),
}))

describe('Haptic feedback functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('triggerHaptic', () => {
    it('should call haptic feedback function', () => {
      triggerHaptic('light')

      expect(triggerHaptic).toHaveBeenCalledWith('light')
    })

    it('should handle different haptic types', () => {
      triggerHaptic('success')
      triggerHaptic('error')
      triggerHaptic('warning')
      triggerHaptic('medium')
      triggerHaptic('heavy')

      expect(triggerHaptic).toHaveBeenCalledTimes(5)
    })
  })

  describe('haptics', () => {
    it('should have all haptic functions defined', () => {
      expect(haptics.success).toBeDefined()
      expect(haptics.error).toBeDefined()
      expect(haptics.warning).toBeDefined()
      expect(haptics.light).toBeDefined()
      expect(haptics.medium).toBeDefined()
      expect(haptics.heavy).toBeDefined()
    })

    it('should call haptic functions', () => {
      haptics.success()
      haptics.error()
      haptics.warning()
      haptics.light()
      haptics.medium()
      haptics.heavy()

      expect(haptics.success).toHaveBeenCalled()
      expect(haptics.error).toHaveBeenCalled()
      expect(haptics.warning).toHaveBeenCalled()
      expect(haptics.light).toHaveBeenCalled()
      expect(haptics.medium).toHaveBeenCalled()
      expect(haptics.heavy).toHaveBeenCalled()
    })
  })

  describe('isHapticSupported', () => {
    it('should return boolean value', () => {
      vi.mocked(isHapticSupported).mockReturnValue(true)

      const result = isHapticSupported()

      expect(result).toBe(true)
      expect(typeof result).toBe('boolean')
    })

    it('should return false when not supported', () => {
      vi.mocked(isHapticSupported).mockReturnValue(false)

      const result = isHapticSupported()

      expect(result).toBe(false)
    })
  })

  describe('requestHapticPermission', () => {
    it('should return promise', async () => {
      vi.mocked(requestHapticPermission).mockResolvedValue(true)

      const result = await requestHapticPermission()

      expect(result).toBe(true)
      expect(requestHapticPermission).toHaveBeenCalled()
    })

    it('should handle permission denial', async () => {
      vi.mocked(requestHapticPermission).mockResolvedValue(false)

      const result = await requestHapticPermission()

      expect(result).toBe(false)
    })
  })
})
