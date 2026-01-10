/**
 * @fileoverview Test per useAthleteMassage hook
 * @module hooks/athlete-profile/__tests__/use-athlete-massage.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAthleteMassage, useUpdateAthleteMassage } from '../use-athlete-massage'
import type { ReactNode } from 'react'
import React from 'react'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
}

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()

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
  createAthleteMassageDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteMassageDataSchema: {
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

describe('useAthleteMassage', () => {
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
      single: mockSingle,
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

  describe('GET - useAthleteMassage', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteMassage(null), {
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

    it('should fetch athlete massage data successfully', async () => {
      const mockData = {
        id: 'massage-id',
        athlete_id: 'test-athlete-id',
        preferenze_tipo_massaggio: ['sportivo', 'rilassante'] as const,
        zone_problematiche: ['schiena', 'spalle'],
        intensita_preferita: 'media' as const,
        allergie_prodotti: [],
        note_terapeutiche: 'Note test',
        storico_massaggi: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteMassage('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.intensita_preferita).toBe('media')
      expect(result.current.data?.preferenze_tipo_massaggio).toContain('sportivo')
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_massage_data')
    })
  })

  describe('UPDATE - useUpdateAthleteMassage', () => {
    it('should update athlete massage data successfully', async () => {
      const updateData = {
        intensita_preferita: 'intensa' as const,
        zone_problematiche: ['schiena', 'spalle', 'gambe'],
      }

      const mockUpdatedData = {
        id: 'massage-id',
        athlete_id: 'test-athlete-id',
        preferenze_tipo_massaggio: ['sportivo'] as const,
        zone_problematiche: ['schiena', 'spalle', 'gambe'],
        intensita_preferita: 'intensa' as const,
        allergie_prodotti: [],
        note_terapeutiche: null,
        storico_massaggi: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

      // Mock per query profiles (verifica esistenza profilo)
      const mockSelectProfiles = vi.fn()
      const mockEqProfiles = vi.fn()
      const mockMaybeSingleProfiles = vi.fn()

      mockSelectProfiles.mockReturnValue({
        eq: mockEqProfiles,
      })

      mockEqProfiles.mockReturnValue({
        maybeSingle: mockMaybeSingleProfiles,
      })

      mockMaybeSingleProfiles.mockResolvedValue({
        data: { id: 'profile-id', user_id: 'test-athlete-id' },
        error: null,
      })

      // Setup chain per check esistenza record massage (seconda chiamata)
      const mockSelectForCheck = vi.fn()
      const mockEqForCheck = vi.fn()
      const mockMaybeSingleForCheck = vi.fn()

      mockSelectForCheck.mockReturnValue({
        eq: mockEqForCheck,
      })

      mockEqForCheck.mockReturnValue({
        maybeSingle: mockMaybeSingleForCheck,
      })

      mockMaybeSingleForCheck.mockResolvedValue({
        data: { id: 'massage-id' },
        error: null,
      })

      // Setup chain per update (terza chiamata)
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
          select: mockSelectProfiles,
          update: mockUpdate,
          insert: mockInsert,
        }) // Prima chiamata: profiles
        .mockReturnValueOnce({
          select: mockSelectForCheck,
          update: vi.fn().mockReturnValue({
            eq: mockUpdateEq,
          }),
          insert: mockInsert,
        }) // Seconda chiamata: check esistenza massage
        .mockReturnValueOnce({
          select: mockSelectForCheck,
          update: vi.fn().mockReturnValue({
            eq: mockUpdateEq,
          }),
          insert: mockInsert,
        }) // Terza chiamata: update

      const { result } = renderHook(() => useUpdateAthleteMassage('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_massage_data')
    })
  })
})
