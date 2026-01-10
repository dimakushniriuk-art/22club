import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

// Mock the providers
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: null,
    role: null,
    org_id: null,
    loading: false,
  }),
}))

vi.mock('@/providers/theme-provider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggle: vi.fn(),
  }),
}))

describe('Hooks Integration', () => {
  describe('useAuth', () => {
    it('should return auth context', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current).toBeDefined()
      expect(result.current.user).toBeNull()
      expect(result.current.role).toBeNull()
      expect(result.current.org_id).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })

  describe('useTheme', () => {
    it('should return theme context', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current).toBeDefined()
      expect(result.current.theme).toBe('light')
      expect(typeof result.current.setTheme).toBe('function')
      expect(typeof result.current.toggle).toBe('function')
    })
  })
})
