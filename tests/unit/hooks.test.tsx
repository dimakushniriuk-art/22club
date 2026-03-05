import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth, AuthProvider } from '@/providers/auth-provider'

// Mock Supabase client
const { mockSupabaseClient } = vi.hoisted(() => ({
  mockSupabaseClient: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
  supabase: mockSupabaseClient,
}))

// Mock API route
vi.mock('@/app/api/auth/context/route', () => ({
  POST: vi.fn(),
  GET: vi.fn(),
}))

describe('Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAuth', () => {
    it('should provide auth context', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      expect(result.current).toBeDefined()
      expect(result.current.user).toBeNull()
      expect(result.current.role).toBeNull()
      expect(result.current.org_id).toBeNull()
      expect(result.current.loading).toBeDefined()
    })
  })
})
