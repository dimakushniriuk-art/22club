/**
 * @fileoverview Test per useAthleteAnagrafica hook
 * @module hooks/athlete-profile/__tests__/use-athlete-anagrafica.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAthleteAnagrafica, useUpdateAthleteAnagrafica } from '../use-athlete-anagrafica'
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
  createAthleteAnagraficaSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteAnagraficaSchema: {
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

describe('useAthleteAnagrafica', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chain mock
    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
      single: mockSingle,
      update: mockUpdate,
    })

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })
  })

  describe('GET - useAthleteAnagrafica', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteAnagrafica(null), {
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

    it('should fetch athlete anagrafica data successfully', async () => {
      const mockData = {
        user_id: 'test-athlete-id',
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@example.com',
        telefono: '+39 123 456 7890',
        data_nascita: '1990-01-01',
        sesso: 'M' as const,
        codice_fiscale: 'RSSMRA90A01H501X',
        indirizzo: 'Via Roma 1',
        citta: 'Milano',
        cap: '20100',
        provincia: 'MI',
        nazione: 'Italia',
        contatto_emergenza_nome: 'Giulia Rossi',
        contatto_emergenza_telefono: '+39 123 456 7891',
        contatto_emergenza_relazione: 'moglie',
        professione: 'Ingegnere',
        altezza_cm: 180,
        peso_iniziale_kg: 75,
        gruppo_sanguigno: 'A+',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteAnagrafica('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.nome).toBe('Mario')
      expect(result.current.data?.cognome).toBe('Rossi')
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle error when fetching fails', async () => {
      // PGRST116 è "not found", che viene gestito come null (non è un errore)
      // Usiamo un errore diverso per testare il caso di errore reale
      const mockError = { message: 'Database error', code: 'PGRST301' }

      mockSingle.mockResolvedValue({
        data: null,
        error: mockError,
      })

      const { result } = renderHook(() => useAthleteAnagrafica('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 3000 },
      )

      expect(result.current.error).toBeDefined()
    })
  })

  describe('UPDATE - useUpdateAthleteAnagrafica', () => {
    it('should update athlete anagrafica data successfully', async () => {
      const updateData = {
        telefono: '+39 987 654 3210',
        indirizzo: 'Via Verdi 2',
        citta: 'Roma',
      }

      const mockUpdatedData = {
        user_id: 'test-athlete-id',
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@example.com',
        telefono: '+39 987 654 3210',
        indirizzo: 'Via Verdi 2',
        citta: 'Roma',
        data_nascita: '1990-01-01',
        sesso: 'M' as const,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

      // Reset mock per questo test
      vi.clearAllMocks()

      // Setup chain per update
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

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: mockUpdateEq,
        }),
      })

      const { result } = renderHook(() => useUpdateAthleteAnagrafica('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle validation error', async () => {
      const invalidData = {
        email: 'invalid-email', // Email non valida
      }

      const { result } = renderHook(() => useUpdateAthleteAnagrafica('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      // Intenzionalmente usiamo any per testare dati invalidi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.current.mutate(invalidData as any)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })
})
