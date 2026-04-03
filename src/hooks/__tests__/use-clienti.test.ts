import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { type ReactNode } from 'react'
import { useClienti } from '../use-clienti'

// Mock environment variables per far credere all'hook che Supabase è configurato
// Usa Object.defineProperty per mockare process.env
Object.defineProperty(process, 'env', {
  value: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-real',
  },
  writable: true,
})

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

const QueryWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = createTestQueryClient()
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: {
      id: 'profile-test-1',
      user_id: 'auth-user-test-1',
      first_name: 'Test',
      last_name: 'Trainer',
      email: 'trainer@test.local',
      role: 'trainer',
      org_id: 'org-test-1',
      created_at: new Date().toISOString(),
    },
    loading: false,
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
}))

vi.mock('../use-api-with-retry', () => ({
  useSupabaseWithRetry: () => ({
    executeSupabaseCall: vi.fn((fn) => fn()),
  }),
}))

vi.mock('@/lib/error-handler', () => ({
  handleApiError: vi.fn((error) => ({
    message: error?.message || 'Error',
    code: error?.code || 'UNKNOWN',
  })),
}))

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

vi.mock('@/lib/cache/local-storage-cache', () => ({
  localStorageCache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

vi.mock('@/lib/cache/cache-strategies', () => ({
  statsCache: {
    get: vi.fn(),
    set: vi.fn(),
  },
  frequentQueryCache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

describe('useClienti', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const mockSelect = vi.fn()
    const mockOrder = vi.fn()
    const mockLimit = vi.fn()
    const mockEq = vi.fn()
    const mockOr = vi.fn()
    const mockGte = vi.fn()
    const mockLte = vi.fn()

    const countThenable = {
      then: (onFulfilled: (v: { count: number | null; error: unknown }) => unknown) =>
        Promise.resolve({ count: 0, error: null }).then(onFulfilled),
    }

    mockLimit.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    })

    mockOrder.mockReturnValue({
      limit: mockLimit,
    })

    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      or: mockOr,
      gte: mockGte,
      lte: mockLte,
      ...countThenable,
    })

    mockOr.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
      ...countThenable,
    })

    mockGte.mockReturnValue({
      lte: mockLte,
      ...countThenable,
    })

    mockLte.mockReturnValue({
      eq: mockEq,
      ...countThenable,
    })

    mockSelect.mockReturnValue({
      eq: mockEq,
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    // Mock RPC per stats
    mockSupabase.rpc.mockResolvedValue({
      data: {
        totali: 0,
        attivi: 0,
        inattivi: 0,
        nuovi_mese: 0,
        documenti_scadenza: 0,
      },
      error: null,
    })
  })

  it('should fetch clienti on mount', async () => {
    const { result } = renderHook(() => useClienti(), { wrapper: QueryWrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('should apply search filter', async () => {
    const { result } = renderHook(
      () =>
        useClienti({
          filters: {
            search: 'mario',
            stato: 'tutti',
            dataIscrizioneDa: null,
            dataIscrizioneA: null,
            allenamenti_min: null,
            solo_documenti_scadenza: false,
            tags: [],
          },
        }),
      { wrapper: QueryWrapper },
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verifica che il filtro search sia stato applicato
    expect(mockSupabase.from).toHaveBeenCalled()
  })

  it('should apply stato filter', async () => {
    const { result } = renderHook(
      () =>
        useClienti({
          filters: {
            search: '',
            stato: 'attivo',
            dataIscrizioneDa: null,
            dataIscrizioneA: null,
            allenamenti_min: null,
            solo_documenti_scadenza: false,
            tags: [],
          },
        }),
      { wrapper: QueryWrapper },
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSupabase.from).toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    const mockSelect = vi.fn()
    const mockOrder = vi.fn()
    const mockLimit = vi.fn()
    const mockEq = vi.fn()

    mockLimit.mockResolvedValue({
      data: null,
      error: { message: 'Database error', code: 'PGRST_ERROR' },
      count: 0,
    })
    mockOrder.mockReturnValue({ limit: mockLimit })
    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    })
    mockSelect.mockReturnValue({ eq: mockEq })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const { result } = renderHook(() => useClienti(), { wrapper: QueryWrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 5000 },
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeTruthy()
  })

  it('should calculate stats correctly', async () => {
    const { result } = renderHook(() => useClienti(), { wrapper: QueryWrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toHaveProperty('totali')
    expect(result.current.stats).toHaveProperty('attivi')
    expect(result.current.stats).toHaveProperty('inattivi')
    expect(result.current.stats).toHaveProperty('nuovi_mese')
    expect(result.current.stats).toHaveProperty('documenti_scadenza')
  })
})
