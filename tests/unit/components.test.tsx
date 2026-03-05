import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppointmentsCard } from '@/components/shared/appointments-card'
import { RoleLayout } from '@/components/shared/dashboard/role-layout'
import { Sidebar } from '@/components/shared/dashboard/sidebar'
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
}))

// Mock API route
vi.mock('@/app/api/auth/context/route', () => ({
  POST: vi.fn(),
  GET: vi.fn(),
}))

describe('Shared Components', () => {
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
  describe('AppointmentsCard', () => {
    it('renders for athlete role', () => {
      const mockData = { date: '2024-01-15' }
      render(<AppointmentsCard role="athlete" data={mockData} />)

      expect(screen.getByText('Prossimo allenamento')).toBeInTheDocument()
      expect(screen.getByText('2024-01-15')).toBeInTheDocument()
    })

    it('renders for staff role', () => {
      const mockData = { date: '2024-01-15' }
      render(<AppointmentsCard role="staff" data={mockData} />)

      expect(screen.getByText('Prossimo appuntamento')).toBeInTheDocument()
      expect(screen.getByText('2024-01-15')).toBeInTheDocument()
    })

    it('applies correct styling for athlete role', () => {
      const mockData = { date: '2024-01-15' }
      render(<AppointmentsCard role="athlete" data={mockData} />)

      const card = screen.getByText('Prossimo allenamento').closest('div')
      expect(card).toHaveClass('bg-teal-950')
    })

    it('applies correct styling for staff role', () => {
      const mockData = { date: '2024-01-15' }
      render(<AppointmentsCard role="staff" data={mockData} />)

      const card = screen.getByText('Prossimo appuntamento').closest('div')
      expect(card).toHaveClass('bg-indigo-950')
    })
  })

  describe('RoleLayout', () => {
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

      // Il div con flex min-h-screen è il container principale, non il div più vicino a content
      // Cerchiamo il div che contiene main e ha le classi flex min-h-screen
      const content = screen.getByTestId('content')
      const main = content.closest('main')
      const layout = main?.parentElement

      expect(layout).toBeInTheDocument()
      expect(layout).toHaveClass('flex', 'min-h-screen')
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
      expect(screen.getByText('Clienti')).toBeInTheDocument()
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
})
