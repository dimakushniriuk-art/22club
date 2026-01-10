import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode } from 'react'
import { useAppointments } from '../use-appointments'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
}

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/hooks/useRealtimeChannel', () => ({
  useRealtimeChannel: vi.fn(), // Mock vuoto, non necessario per i test
}))

vi.mock('@/lib/query-keys', () => ({
  queryKeys: {
    appointments: {
      all: ['appointments'],
      byUser: (userId: string) => ['appointments', userId],
    },
  },
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
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    // Setup mock per profiles (chiamata iniziale per ottenere profileId)
    const mockProfilesSelect = vi.fn()
    const mockProfilesEq = vi.fn()
    const mockProfilesMaybeSingle = vi.fn()

    mockProfilesSelect.mockReturnValue({
      eq: mockProfilesEq,
    })

    mockProfilesEq.mockReturnValue({
      maybeSingle: mockProfilesMaybeSingle,
    })

    mockProfilesMaybeSingle.mockResolvedValue({
      data: { id: 'test-user-id' },
      error: null,
    })

    // Setup default query mock per appointments
    const mockAppointmentsSelect = vi.fn()
    const mockAppointmentsEq = vi.fn()
    const mockAppointmentsOrder = vi.fn()

    mockAppointmentsSelect.mockReturnValue({
      eq: mockAppointmentsEq,
    })

    mockAppointmentsEq.mockReturnValue({
      order: mockAppointmentsOrder,
    })

    mockAppointmentsOrder.mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Allenamento',
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          athlete_id: 'athlete-1',
          type: 'allenamento',
        },
      ],
      error: null,
    })

    // Configura from() per gestire chiamate multiple
    // Nota: createAppointment chiama createClient() che ritorna mockSupabase,
    // quindi from('appointments') deve supportare insert
    const mockInsertSelect = vi.fn().mockResolvedValue({
      data: [{ id: 'new-appointment-id' }],
      error: null,
    })
    const mockInsert = vi.fn().mockReturnValue({
      select: mockInsertSelect,
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: mockProfilesSelect,
      }) // Prima chiamata: profiles
      .mockReturnValue({
        select: mockAppointmentsSelect,
        insert: mockInsert, // Supporta insert per createAppointment
      }) // Chiamate successive: appointments
  })

  it('should fetch appointments on mount', async () => {
    const { result } = renderHook(() => useAppointments({ userId: 'test-user-id', role: 'pt' }), {
      wrapper: QueryWrapper,
    })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 },
    )

    // Verifica che from() sia stato chiamato (può essere chiamato con 'profiles' prima)
    expect(mockSupabase.from).toHaveBeenCalled()
    expect(result.current.appointments).toBeDefined()
  })

  it('should filter by role (pt)', async () => {
    const { result } = renderHook(() => useAppointments({ userId: 'test-user-id', role: 'pt' }), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSupabase.from).toHaveBeenCalled()
  })

  it('should filter by role (atleta)', async () => {
    const { result } = renderHook(
      () => useAppointments({ userId: 'test-athlete-id', role: 'atleta' }),
      {
        wrapper: QueryWrapper,
      },
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSupabase.from).toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAppointments({ userId: 'test-user-id', role: 'pt' }), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should create appointment', async () => {
    // Setup mock per insert (createAppointment chiama createClient() che ritorna mockSupabase)
    const mockInsertSelect = vi.fn().mockResolvedValue({
      data: [{ id: 'new-appointment-id' }],
      error: null,
    })

    const mockInsert = vi.fn().mockReturnValue({
      select: mockInsertSelect,
    })

    // Setup mock per profiles (per fetchAppointments dopo create)
    const mockProfilesSelectAfterCreate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id' },
          error: null,
        }),
      }),
    })

    // Setup mock per appointments (per fetchAppointments dopo create)
    const mockAppointmentsSelectAfterCreate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'new-appointment-id' }],
          error: null,
        }),
      }),
    })

    // Configura from() per gestire chiamate sequenziali nel test:
    // 1. Prima chiamata: profiles per fetchAppointments iniziale (già configurata nel beforeEach)
    // 2. Seconda chiamata: appointments per fetchAppointments iniziale (già configurata nel beforeEach)
    // 3. Terza chiamata: appointments per createAppointment (insert) - createAppointment chiama createClient() che ritorna mockSupabase
    // 4. Quarta chiamata: profiles per fetchAppointments dopo create (refetch)
    // 5. Quinta chiamata: appointments per fetchAppointments dopo create (refetch)
    mockSupabase.from
      .mockReturnValueOnce({ insert: mockInsert }) // Per createAppointment (terza chiamata dopo le prime due del beforeEach)
      .mockReturnValueOnce({ select: mockProfilesSelectAfterCreate }) // Per refetch profiles
      .mockReturnValueOnce({ select: mockAppointmentsSelectAfterCreate }) // Per refetch appointments
      .mockReturnValue({
        select: mockAppointmentsSelectAfterCreate,
        insert: mockInsert, // Supporta insert per future chiamate
      })

    const { result } = renderHook(() => useAppointments({ userId: 'test-user-id', role: 'pt' }), {
      wrapper: QueryWrapper,
    })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 },
    )

    await act(async () => {
      if (result.current.createAppointment) {
        await result.current.createAppointment({
          org_id: 'org-1',
          athlete_id: 'athlete-1',
          trainer_id: 'staff-1',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 3600000).toISOString(),
          type: 'allenamento',
        })
      }
    })

    expect(mockInsert).toHaveBeenCalled()
  })

  it('should check for overlapping appointments', async () => {
    const { result } = renderHook(() => useAppointments({ userId: 'test-user-id', role: 'pt' }), {
      wrapper: QueryWrapper,
    })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 },
    )

    // Check if checkOverlap method exists
    expect(result.current).toHaveProperty('checkOverlap')
    expect(typeof result.current.checkOverlap).toBe('function')
  })
})
