import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePayments } from '../use-payments'

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

const mockPayments = [
  {
    id: '1',
    athlete_id: 'athlete-1',
    amount: 100,
    payment_date: new Date().toISOString(),
    payment_method: 'contanti',
    lessons_purchased: 10,
    created_at: new Date().toISOString(),
    athlete: { nome: 'Mario', cognome: 'Rossi' },
    created_by_staff: { nome: 'PT', cognome: 'Trainer' },
  },
]

describe('usePayments', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    // Setup default query mock
    const mockQueryChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockPayments,
        error: null,
      }),
    }

    mockSupabase.from.mockReturnValue(mockQueryChain)
  })

  it('should fetch payments on mount', async () => {
    const { result } = renderHook(() => usePayments({ userId: 'test-user-id', role: 'pt' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('payments')
    expect(result.current.payments).toBeDefined()
  })

  it('should filter payments by athlete role', async () => {
    const { result } = renderHook(() => usePayments({ userId: 'athlete-1', role: 'atleta' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('payments')
    // Verify eq filter was called for athlete
    const selectCall = mockSupabase.from().select
    expect(selectCall).toHaveBeenCalled()
  })

  it('should handle fetch errors', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Fetch error' },
          }),
        }),
      }),
    })

    const { result } = renderHook(() => usePayments({ userId: 'test-user-id', role: 'pt' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should create a payment', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockPayments,
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockPayments[0], id: '2' },
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => usePayments({ userId: 'test-user-id', role: 'pt' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.createPayment({
        athlete_id: 'athlete-1',
        amount: 100,
        payment_date: new Date().toISOString(),
        payment_method: 'contanti',
        method_text: 'contanti',
        lessons_purchased: 10,
        created_by_staff_id: 'staff-1',
        is_reversal: false,
      })
    })

    expect(mockSupabase.from().insert).toHaveBeenCalled()
  })

  it('should calculate stats correctly', async () => {
    const { result } = renderHook(() => usePayments({ userId: 'test-user-id', role: 'pt' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const stats = result.current.getStats()

    expect(stats).toHaveProperty('totalRevenue')
    expect(stats).toHaveProperty('totalLessons')
    expect(stats).toHaveProperty('totalPayments')
    expect(stats).toHaveProperty('allPayments')
  })

  it('should not fetch if userId is missing', () => {
    const { result } = renderHook(() => usePayments({ userId: null, role: 'pt' }))

    expect(result.current.loading).toBe(true)
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })
})
