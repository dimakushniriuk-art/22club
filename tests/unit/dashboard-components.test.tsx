import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { KpiCard } from '@/components/shared/dashboard/kpi-card'
import { Sidebar } from '@/components/shared/dashboard/sidebar'
import { RoleLayout } from '@/components/shared/dashboard/role-layout'
import { AuthProvider } from '@/providers/auth-provider'
import { ToastProvider } from '@/components/ui/toast'

// Mock Supabase client
const { mockSupabaseClient } = vi.hoisted(() => ({
  mockSupabaseClient: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
  supabase: mockSupabaseClient,
  handleRefreshTokenError: vi.fn(() => false),
}))

// Mock API route
vi.mock('@/app/api/auth/context/route', () => ({
  POST: vi.fn(),
  GET: vi.fn(),
}))

describe('Dashboard Components', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
  })
  describe('KpiCard', () => {
    it('renders with label and value', () => {
      render(<KpiCard label="Test Label" value="123" />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
    })

    it('renders with trend indicator', () => {
      render(<KpiCard label="Test Label" value="123" trend="up" />)

      expect(screen.getByText('↗')).toBeInTheDocument()
    })

    it('renders with icon', () => {
      const icon = <span data-testid="icon">🏋️</span>
      render(<KpiCard label="Test Label" value="123" icon={icon} />)

      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      render(<KpiCard label="Test Label" value="123" />)

      const card = screen.getByText('Test Label').closest('div')
      expect(card).toHaveClass('flex', 'flex-col', 'justify-center', 'items-center')
    })
  })

  describe('Sidebar', () => {
    it('renders for staff role', () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <Sidebar role="staff" />
          </AuthProvider>
        </ToastProvider>,
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('renders navigation items', () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <Sidebar role="staff" />
          </AuthProvider>
        </ToastProvider>,
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Prenotazioni')).toBeInTheDocument()
      expect(screen.getByText('Schede')).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <Sidebar role="staff" />
          </AuthProvider>
        </ToastProvider>,
      )

      const sidebar = screen.getByText('Dashboard').closest('aside')
      expect(sidebar).toHaveClass('hidden', 'md:flex', 'flex-col')
    })
  })

  describe('RoleLayout', () => {
    it('renders for staff role', () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <RoleLayout role="staff">
              <div data-testid="content">Staff Content</div>
            </RoleLayout>
          </AuthProvider>
        </ToastProvider>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Staff Content')
    })

    it('renders for athlete role', () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <RoleLayout role="athlete">
              <div data-testid="content">Athlete Content</div>
            </RoleLayout>
          </AuthProvider>
        </ToastProvider>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Athlete Content')
    })

    it('applies correct layout classes', () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <RoleLayout role="staff">
              <div data-testid="content">Staff Content</div>
            </RoleLayout>
          </AuthProvider>
        </ToastProvider>,
      )

      const content = screen.getByTestId('content')
      const main = content.closest('main')
      const layout = main?.parentElement

      expect(layout).toBeInTheDocument()
      expect(layout).toHaveClass(
        'flex',
        'w-full',
        'min-w-0',
        'flex-1',
        'min-h-0',
        'flex-col',
        'md:flex-row',
      )
    })
  })
})
