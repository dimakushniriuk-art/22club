import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/providers/auth-provider'

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

describe('AuthProvider Integration', () => {
  it('should render children', () => {
    render(
      <AuthProvider>
        <div>Test Content</div>
      </AuthProvider>,
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should provide auth context', async () => {
    const TestComponent = () => {
      const { user, loading } = useAuth()
      return (
        <div>
          <span data-testid="user">{user ? 'logged-in' : 'logged-out'}</span>
          <span data-testid="loading">{loading ? 'loading' : 'not-loading'}</span>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // AuthProvider inizia con loading=true, poi diventa false dopo getSession
    // Aspettiamo che loading diventi false
    await waitFor(
      () => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      },
      { timeout: 3000 },
    )

    expect(screen.getByTestId('user')).toHaveTextContent('logged-out')
  })
})
