import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { AppointmentModal } from '../appointment-modal'

// Mock dependencies
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'staff-id' },
            error: null,
          }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}))

vi.mock('@/hooks/use-clienti', () => ({
  useClienti: vi.fn(() => ({
    clienti: [
      {
        id: 'athlete-1',
        nome: 'Mario',
        cognome: 'Rossi',
        user_id: 'athlete-1',
      },
    ],
    loading: false,
    error: null,
  })),
}))

vi.mock('@/components/ui/toast', () => ({
  useToast: vi.fn(() => ({
    addToast: vi.fn(),
    removeToast: vi.fn(),
    toasts: [],
  })),
}))

vi.mock('@/lib/appointment-utils', () => ({
  checkAppointmentOverlap: vi.fn().mockResolvedValue({
    hasOverlap: false,
    conflictingAppointments: [],
  }),
}))

vi.mock('@/lib/recurrence-utils', () => ({
  serializeRecurrence: vi.fn((r) => r),
  generateRecurringAppointments: vi.fn(() => []),
}))

// Helper per creare un QueryClient per i test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disabilita retry nei test per velocità
      },
    },
  })

// Wrapper component per fornire QueryClientProvider
const QueryWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = createTestQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('AppointmentModal', () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    render(
      <QueryWrapper>
        <AppointmentModal open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
      </QueryWrapper>,
    )

    expect(screen.getByText('Crea Nuovo Appuntamento')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <QueryWrapper>
        <AppointmentModal open={false} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
      </QueryWrapper>,
    )

    expect(screen.queryByText('Crea Nuovo Appuntamento')).not.toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(
      <QueryWrapper>
        <AppointmentModal open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
      </QueryWrapper>,
    )

    // Wait for form to be ready (default date should be set automatically)
    await waitFor(() => {
      expect(screen.getByLabelText(/atleta/i)).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /crea/i })
    await user.click(submitButton)

    // Should show validation error
    await waitFor(
      () => {
        expect(screen.getByText(/compila tutti i campi obbligatori/i)).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('should validate start_time < end_time', async () => {
    const user = userEvent.setup()

    render(
      <QueryWrapper>
        <AppointmentModal open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
      </QueryWrapper>,
    )

    // Wait for form to be ready (default date should be set automatically)
    await waitFor(() => {
      expect(screen.getByLabelText(/atleta/i)).toBeInTheDocument()
    })

    // Fill form with invalid times
    const athleteSelect = screen.getByLabelText(/atleta/i)
    const startInput = screen.getByLabelText(/inizio/i)
    const endInput = screen.getByLabelText(/fine/i)

    await user.selectOptions(athleteSelect, 'athlete-1')

    // Replace time values (clear then type for time inputs)
    await user.clear(startInput)
    await user.type(startInput, '10:00')
    await user.clear(endInput)
    await user.type(endInput, '09:00') // End before start

    const submitButton = screen.getByRole('button', { name: /crea/i })
    await user.click(submitButton)

    await waitFor(
      () => {
        expect(screen.getByText(/la data di fine deve essere successiva/i)).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })
})
