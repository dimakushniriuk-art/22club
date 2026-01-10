/**
 * @fileoverview Test per useAthleteAIData hook
 * @module hooks/athlete-profile/__tests__/use-athlete-ai-data.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAthleteAIData, useUpdateAthleteAIData } from '../use-athlete-ai-data'
import type { ReactNode } from 'react'
import React from 'react'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
}

const mockSelect = vi.fn()
const mockEq = vi.fn()
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
    if (error instanceof Error) {
      return error
    }
    return new Error(error?.message || 'Error')
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
  createAthleteAIDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteAIDataSchema: {
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

describe('useAthleteAIData', () => {
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

    mockEq.mockReturnValue({
      order: mockOrder,
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

  describe('GET - useAthleteAIData', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteAIData(null), {
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

    it('should fetch latest athlete AI data successfully', async () => {
      const mockData = {
        id: 'ai-data-id',
        athlete_id: 'test-athlete-id',
        data_analisi: '2025-01-28',
        insights_aggregati: {
          performance: 'buona',
          trend: 'miglioramento',
        },
        raccomandazioni: ['Aumenta frequenza allenamenti'],
        pattern_rilevati: ['Consistenza alta'],
        predizioni_performance: [],
        score_engagement: 8.5,
        score_progresso: 7.2,
        fattori_rischio: [],
        note_ai: 'Note AI test',
        created_at: '2025-01-28T00:00:00Z',
        updated_at: '2025-01-28T00:00:00Z',
      }

      mockMaybeSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteAIData('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.score_engagement).toBe(8.5)
      expect(result.current.data?.raccomandazioni).toContain('Aumenta frequenza allenamenti')
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_ai_data')
    })
  })

  describe('UPDATE - useUpdateAthleteAIData', () => {
    it('should update athlete AI data successfully', async () => {
      const updateData = {
        score_engagement: 9.0,
        note_ai: 'Note aggiornate',
      }

      const mockUpdatedData = {
        id: 'ai-data-id',
        athlete_id: 'test-athlete-id',
        data_analisi: '2025-01-28',
        insights_aggregati: {},
        raccomandazioni: [],
        pattern_rilevati: [],
        predizioni_performance: [],
        score_engagement: 9.0,
        score_progresso: null,
        fattori_rischio: [],
        note_ai: 'Note aggiornate',
        created_at: '2025-01-28T00:00:00Z',
        updated_at: '2025-01-29T00:00:00Z',
      }

      // Reset mock per questo test
      vi.clearAllMocks()

      // Setup chain per check esistenza (prima chiamata - usa maybeSingle)
      const mockSelectForCheck = vi.fn()
      const mockEqForCheck = vi.fn()
      const mockOrderForCheck = vi.fn()
      const mockLimitForCheck = vi.fn()
      const mockMaybeSingleForCheck = vi.fn()

      mockSelectForCheck.mockReturnValue({
        eq: mockEqForCheck,
      })

      mockEqForCheck.mockReturnValue({
        order: mockOrderForCheck,
      })

      mockOrderForCheck.mockReturnValue({
        limit: mockLimitForCheck,
      })

      mockLimitForCheck.mockReturnValue({
        maybeSingle: mockMaybeSingleForCheck,
      })

      mockMaybeSingleForCheck.mockResolvedValue({
        data: { id: 'ai-data-id' },
        error: null,
      })

      // Setup chain per update (seconda chiamata)
      const mockUpdateEq = vi.fn()
      const mockUpdateSelect = vi.fn()
      const mockUpdateSingle = vi.fn()

      mockUpdateEq.mockReturnValue({
        select: mockUpdateSelect,
      })

      mockUpdateSelect.mockReturnValue({
        single: mockUpdateSingle,
      })

      mockUpdateSingle.mockResolvedValue({
        data: mockUpdatedData,
        error: null,
      })

      // Configura from() per ritornare chain corretta
      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelectForCheck,
          update: vi.fn().mockReturnValue({
            eq: mockUpdateEq,
          }),
        }) // Prima chiamata: check esistenza
        .mockReturnValueOnce({
          select: mockSelectForCheck,
          update: vi.fn().mockReturnValue({
            eq: mockUpdateEq,
          }),
        }) // Seconda chiamata: update

      const { result } = renderHook(() => useUpdateAthleteAIData('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_ai_data')
    })
  })
})
