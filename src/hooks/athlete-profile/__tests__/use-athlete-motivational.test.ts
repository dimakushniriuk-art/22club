/**
 * @fileoverview Test per useAthleteMotivational hook
 * @module hooks/athlete-profile/__tests__/use-athlete-motivational.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAthleteMotivational, useUpdateAthleteMotivational } from '../use-athlete-motivational'
import type { ReactNode } from 'react'
import React from 'react'

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: { from: vi.fn() },
}))

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockMaybeSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => mockSupabase),
  supabase: mockSupabase,
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
  supabase: mockSupabase,
  handleRefreshTokenError: vi.fn(() => false),
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
  createAthleteMotivationalDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteMotivationalDataSchema: {
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

describe('useAthleteMotivational', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMaybeSingle.mockReset()

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

  describe('GET - useAthleteMotivational', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteMotivational(null), {
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

    it('should fetch athlete motivational data successfully', async () => {
      const mockData = {
        id: 'motivational-id',
        athlete_id: 'test-athlete-id',
        motivazione_principale: 'Perdere peso',
        motivazioni_secondarie: ['Tonificazione', 'Salute'],
        ostacoli_percepiti: ['Tempo', 'Motivazione'],
        preferenze_ambiente: ['Palestra'],
        preferenze_compagnia: ['Solo'],
        livello_motivazione: 7,
        storico_abbandoni: [],
        note_motivazionali: 'Note test',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockMaybeSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteMotivational('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.livello_motivazione).toBe(7)
      expect(result.current.data?.motivazione_principale).toBe('Perdere peso')
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_motivational_data')
    })

    it('should return null when no row (maybeSingle)', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const { result } = renderHook(() => useAthleteMotivational('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })
  })

  describe('UPDATE - useUpdateAthleteMotivational', () => {
    it('should update athlete motivational data successfully', async () => {
      const updateData = {
        livello_motivazione: 8,
        motivazioni_secondarie: ['Tonificazione', 'Forza'],
      }

      const mockUpdatedData = {
        id: 'motivational-id',
        athlete_id: 'test-athlete-id',
        motivazione_principale: 'Perdere peso',
        motivazioni_secondarie: ['Tonificazione', 'Forza'],
        ostacoli_percepiti: [],
        preferenze_ambiente: [],
        preferenze_compagnia: [],
        livello_motivazione: 8,
        storico_abbandoni: [],
        note_motivazionali: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockUpdatedData }),
      })
      vi.stubGlobal('fetch', fetchMock)

      try {
        const { result } = renderHook(() => useUpdateAthleteMotivational('test-athlete-id'), {
          wrapper: createWrapper(),
        })

        result.current.mutate(updateData)

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true)
        })

        expect(fetchMock).toHaveBeenCalledWith(
          '/api/athlete-motivational',
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      } finally {
        vi.unstubAllGlobals()
      }
    })
  })
})
