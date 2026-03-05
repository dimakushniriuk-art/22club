import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider } from '@/providers/auth-provider'
import { useAuth } from '../use-auth'

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
  supabase: mockSupabase,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(AuthProvider, null, children)
  }
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // AuthProvider usa getUser() non getSession()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    // Setup profile query mock
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'profile-id',
              user_id: 'test-user-id',
              nome: 'Test',
              cognome: 'User',
              role: 'trainer',
            },
            error: null,
          }),
        }),
      }),
    })

    // Setup auth state change subscription
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })
  })

  it('should load user on mount', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    expect(result.current.user).toBeDefined()
  })

  it('should handle session error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Session error' },
    })

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // useAuth espone sempre error: null; in caso di errore sessione l'utente è null
    expect(result.current.user).toBeNull()
  })

  it('should handle profile not found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Profile not found', code: 'PGRST116' },
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // useAuth espone sempre error: null; in caso profilo non trovato l'utente è null
    expect(result.current.user).toBeNull()
  })

  it('should handle no session', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('should subscribe to auth state changes', () => {
    renderHook(() => useAuth(), { wrapper: createWrapper() })

    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
  })

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn()

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    })

    const { unmount } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
