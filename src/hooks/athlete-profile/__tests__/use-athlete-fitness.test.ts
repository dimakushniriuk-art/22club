/**
 * @fileoverview Test per useAthleteFitness hook
 * @module hooks/athlete-profile/__tests__/use-athlete-fitness.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAthleteFitness, useUpdateAthleteFitness } from '../use-athlete-fitness'
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
  createAthleteFitnessDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteFitnessDataSchema: {
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

describe('useAthleteFitness', () => {
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

  describe('GET - useAthleteFitness', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteFitness(null), {
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

    it('should fetch athlete fitness data successfully', async () => {
      const mockData = {
        id: 'fitness-id',
        athlete_id: 'test-athlete-id',
        livello_esperienza: 'intermedio',
        obiettivo_primario: 'perdita_peso',
        obiettivi_secondari: ['tonificazione'],
        giorni_settimana_allenamento: 3,
        durata_sessione_minuti: 60,
        preferenze_orario: ['mattina'],
        attivita_precedenti: ['corsa'],
        infortuni_pregressi: [],
        zone_problematiche: ['schiena'],
        note_fitness: 'Nessuna nota',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteFitness('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.livello_esperienza).toBe('intermedio')
      expect(result.current.data?.obiettivo_primario).toBe('perdita_peso')
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_fitness_data')
    })

    it('should handle error when fetching fails', async () => {
      const mockError = { message: 'Database error', code: 'PGRST116' }

      mockSingle.mockResolvedValue({
        data: null,
        error: mockError,
      })

      const { result } = renderHook(() => useAthleteFitness('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // PGRST116 significa "no rows returned", quindi ritorna null (non errore)
      expect(result.current.data).toBeNull()
    })
  })

  describe('UPDATE - useUpdateAthleteFitness', () => {
    it('should update athlete fitness data successfully', async () => {
      const updateData = {
        livello_esperienza: 'avanzato' as const,
        obiettivi_secondari: ['tonificazione', 'forza'] as ('tonificazione' | 'forza')[],
      }

      const mockUpdatedData = {
        id: 'fitness-id',
        athlete_id: 'test-athlete-id',
        livello_esperienza: 'avanzato',
        obiettivo_primario: 'perdita_peso',
        obiettivi_secondari: ['tonificazione', 'forza'],
        giorni_settimana_allenamento: 3,
        durata_sessione_minuti: 60,
        preferenze_orario: [],
        attivita_precedenti: [],
        infortuni_pregressi: [],
        zone_problematiche: [],
        note_fitness: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

      // Reset mock per questo test
      vi.clearAllMocks()

      // Setup chain per check esistenza (prima chiamata)
      const mockSelectForCheck = vi.fn()
      const mockEqForCheck = vi.fn()
      const mockSingleForCheck = vi.fn()

      mockSelectForCheck.mockReturnValue({
        eq: mockEqForCheck,
      })

      mockEqForCheck.mockReturnValue({
        single: mockSingleForCheck,
      })

      mockSingleForCheck.mockResolvedValue({
        data: { id: 'fitness-id' },
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

      const { result } = renderHook(() => useUpdateAthleteFitness('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_fitness_data')
    })
  })
})
