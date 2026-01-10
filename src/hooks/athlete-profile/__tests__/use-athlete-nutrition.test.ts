/**
 * @fileoverview Test per useAthleteNutrition hook
 * @module hooks/athlete-profile/__tests__/use-athlete-nutrition.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAthleteNutrition, useUpdateAthleteNutrition } from '../use-athlete-nutrition'
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
  createAthleteNutritionDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteNutritionDataSchema: {
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

describe('useAthleteNutrition', () => {
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

  describe('GET - useAthleteNutrition', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteNutrition(null), {
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

    it('should fetch athlete nutrition data successfully', async () => {
      const mockData = {
        id: 'nutrition-id',
        athlete_id: 'test-athlete-id',
        obiettivo_nutrizionale: 'dimagrimento' as const,
        calorie_giornaliere_target: 2000,
        macronutrienti_target: {
          proteine_g: 150,
          carboidrati_g: 200,
          grassi_g: 65,
        },
        dieta_seguita: 'mediterranea' as const,
        intolleranze_alimentari: ['lattosio'],
        allergie_alimentari: [],
        alimenti_preferiti: ['Vegetariano'],
        alimenti_evitati: [],
        preferenze_orari_pasti: {
          colazione: '08:00',
          pranzo: '13:00',
          cena: '20:00',
          spuntini: [],
        },
        note_nutrizionali: 'Note test',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteNutrition('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.calorie_giornaliere_target).toBe(2000)
      expect(result.current.data?.intolleranze_alimentari).toContain('lattosio')
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_nutrition_data')
    })
  })

  describe('UPDATE - useUpdateAthleteNutrition', () => {
    it('should update athlete nutrition data successfully', async () => {
      const updateData = {
        calorie_giornaliere_target: 2200,
        intolleranze_alimentari: ['lattosio', 'glutine'],
      }

      const mockUpdatedData = {
        id: 'nutrition-id',
        athlete_id: 'test-athlete-id',
        obiettivo_nutrizionale: 'dimagrimento' as const,
        calorie_giornaliere_target: 2200,
        macronutrienti_target: {
          proteine_g: 150,
          carboidrati_g: 200,
          grassi_g: 65,
        },
        dieta_seguita: 'mediterranea' as const,
        intolleranze_alimentari: ['lattosio', 'glutine'],
        allergie_alimentari: [],
        alimenti_preferiti: [],
        alimenti_evitati: [],
        preferenze_orari_pasti: {
          colazione: '08:00',
          pranzo: '13:00',
          cena: '20:00',
          spuntini: [],
        },
        note_nutrizionali: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

      // Setup chain per verifica profile (prima chiamata)
      const mockProfileSelect = vi.fn()
      const mockProfileEq = vi.fn()
      const mockProfileMaybeSingle = vi.fn()

      mockProfileSelect.mockReturnValue({
        eq: mockProfileEq,
      })

      mockProfileEq.mockReturnValue({
        maybeSingle: mockProfileMaybeSingle,
      })

      mockProfileMaybeSingle.mockResolvedValue({
        data: { id: 'profile-id', user_id: 'test-athlete-id' },
        error: null,
      })

      // Setup chain per check esistenza (seconda chiamata)
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
        data: { id: 'nutrition-id' },
        error: null,
      })

      // Setup chain per update (terza chiamata)
      const mockUpdate = vi.fn()
      const mockUpdateEq = vi.fn()
      const mockUpdateSelect = vi.fn()
      const mockUpdateSingle = vi.fn()

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      })

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
          select: mockProfileSelect,
        }) // Prima chiamata: verifica profile
        .mockReturnValueOnce({
          select: mockSelectForCheck,
        }) // Seconda chiamata: check esistenza
        .mockReturnValueOnce({
          update: mockUpdate,
        }) // Terza chiamata: update

      const { result } = renderHook(() => useUpdateAthleteNutrition('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_nutrition_data')
    })
  })
})
