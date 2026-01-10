/**
 * @fileoverview Test per useAthleteSmartTracking hook
 * @module hooks/athlete-profile/__tests__/use-athlete-smart-tracking.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAthleteSmartTracking,
  useUpdateAthleteSmartTracking,
} from '../use-athlete-smart-tracking'
import type { ReactNode } from 'react'
import React from 'react'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
}

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockEq2 = vi.fn() // Secondo eq per check esistenza
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockMaybeSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockRange = vi.fn()

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

// Mock per @/lib/supabase/client (usato da createClient)
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/error-handler', () => ({
  handleApiError: vi.fn((error) => {
    throw error
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

vi.mock('@/types/athlete-profile.schema', () => ({
  createAthleteSmartTrackingDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteSmartTrackingDataSchema: {
    parse: vi.fn((data) => data),
  },
}))

// Helper per creare QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const TestWrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  TestWrapper.displayName = 'TestWrapper'
  return TestWrapper
}

describe('useAthleteSmartTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chain mock
    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      insert: mockInsert,
    })

    mockSelect.mockReturnValue({
      eq: mockEq,
    })

    // Mock per supportare due eq() consecutivi (per check esistenza)
    mockEq.mockReturnValue({
      eq: mockEq2,
      order: mockOrder,
      single: vi.fn(),
    })

    // Secondo eq ritorna maybeSingle (per check esistenza)
    mockEq2.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    })

    mockOrder.mockReturnValue({
      limit: mockLimit,
    })

    mockLimit.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    })

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })

    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })
  })

  describe('GET - useAthleteSmartTracking', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteSmartTracking(null), {
        wrapper: createWrapper(),
      })

      // Quando athleteId è null, la query è disabilitata (enabled: !!athleteId)
      await waitFor(
        () => {
          expect(mockSupabase.from).not.toHaveBeenCalled()
        },
        { timeout: 1000 },
      )

      // Quando la query è disabilitata:
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should fetch latest athlete smart tracking data successfully', async () => {
      const mockData = {
        id: 'tracking-id',
        athlete_id: 'test-athlete-id',
        data_rilevazione: '2025-01-28',
        dispositivo_tipo: 'smartwatch',
        dispositivo_marca: 'Apple',
        passi_giornalieri: 10000,
        calorie_bruciate: 2500,
        distanza_percorsa_km: 8.5,
        battito_cardiaco_medio: 75,
        battito_cardiaco_max: 150,
        battito_cardiaco_min: 60,
        ore_sonno: 7.5,
        qualita_sonno: 'buona',
        attivita_minuti: 60,
        metrica_custom: {},
        created_at: '2025-01-28T00:00:00Z',
        updated_at: '2025-01-28T00:00:00Z',
      }

      mockMaybeSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteSmartTracking('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.passi_giornalieri).toBe(10000)
      expect(result.current.data?.dispositivo_tipo).toBe('smartwatch')
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_smart_tracking_data')
    })
  })

  describe('UPDATE/CREATE - useUpdateAthleteSmartTracking', () => {
    it('should create new smart tracking entry successfully', async () => {
      const updateData = {
        data_rilevazione: '2025-01-29',
        passi_giornalieri: 12000,
        calorie_bruciate: 2800,
      }

      const mockCreatedData = {
        id: 'tracking-id',
        athlete_id: 'test-athlete-id',
        data_rilevazione: '2025-01-29',
        dispositivo_tipo: null,
        dispositivo_marca: null,
        passi_giornalieri: 12000,
        calorie_bruciate: 2800,
        distanza_percorsa_km: null,
        battito_cardiaco_medio: null,
        battito_cardiaco_max: null,
        battito_cardiaco_min: null,
        ore_sonno: null,
        qualita_sonno: null,
        attivita_minuti: null,
        metrica_custom: {},
        created_at: '2025-01-29T00:00:00Z',
        updated_at: '2025-01-29T00:00:00Z',
      }

      // Mock per check esistenza record (non esiste) - prima chiamata maybeSingle
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Mock per insert - sovrascrivi il mock di default
      const mockInsertSelect = vi.fn()
      const mockInsertSingle = vi.fn()

      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle,
      })

      mockInsertSingle.mockResolvedValue({
        data: mockCreatedData,
        error: null,
      })

      mockInsert.mockReturnValue({
        select: mockInsertSelect,
      })

      const { result } = renderHook(() => useUpdateAthleteSmartTracking('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_smart_tracking_data')
    })
  })
})
