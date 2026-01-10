/**
 * @fileoverview Test per useAthleteAdministrative hook
 * @module hooks/athlete-profile/__tests__/use-athlete-administrative.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAthleteAdministrative,
  useUpdateAthleteAdministrative,
  useUploadDocumentoContrattuale,
} from '../use-athlete-administrative'
import type { ReactNode } from 'react'
import React from 'react'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
}

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
const mockStorageBucket = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  remove: vi.fn(),
}

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
  createAthleteAdministrativeDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteAdministrativeDataSchema: {
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

describe('useAthleteAdministrative', () => {
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

    mockSupabase.storage.from.mockReturnValue(mockStorageBucket)
    mockStorageBucket.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/documento.pdf' },
    })
  })

  describe('GET - useAthleteAdministrative', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteAdministrative(null), {
        wrapper: createWrapper(),
      })

      // Quando athleteId è null, la query è disabilitata (enabled: !!athleteId)
      // Quindi React Query non la esegue e isSuccess rimane false
      // Verifichiamo che la query non sia stata chiamata
      await waitFor(
        () => {
          expect(mockSupabase.from).not.toHaveBeenCalled()
        },
        { timeout: 1000 },
      )

      // Quando la query è disabilitata:
      // - data è undefined (query non eseguita)
      // - isLoading è false (query non in esecuzione)
      // - isSuccess è false (query non completata)
      // - isError è false (nessun errore)
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should fetch athlete administrative data successfully', async () => {
      const mockData = {
        id: 'administrative-id',
        athlete_id: 'test-athlete-id',
        tipo_abbonamento: 'mensile',
        stato_abbonamento: 'attivo',
        data_inizio_abbonamento: '2025-01-01',
        data_scadenza_abbonamento: '2025-02-01',
        lezioni_incluse: 10,
        lezioni_utilizzate: 3,
        lezioni_rimanenti: 7,
        metodo_pagamento_preferito: 'carta',
        note_contrattuali: 'Note test',
        documenti_contrattuali: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteAdministrative('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.stato_abbonamento).toBe('attivo')
      expect(result.current.data?.lezioni_rimanenti).toBe(7)
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_administrative_data')
    })
  })

  describe('UPDATE - useUpdateAthleteAdministrative', () => {
    it('should update athlete administrative data successfully', async () => {
      const updateData = {
        stato_abbonamento: 'scaduto' as const,
        lezioni_utilizzate: 5,
      }

      const mockUpdatedData = {
        id: 'administrative-id',
        athlete_id: 'test-athlete-id',
        tipo_abbonamento: 'mensile',
        stato_abbonamento: 'scaduto',
        data_inizio_abbonamento: '2025-01-01',
        data_scadenza_abbonamento: '2025-02-01',
        lezioni_incluse: 10,
        lezioni_utilizzate: 5,
        lezioni_rimanenti: 5,
        metodo_pagamento_preferito: null,
        note_contrattuali: null,
        documenti_contrattuali: [],
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
        data: { id: 'administrative-id' },
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

      const { result } = renderHook(() => useUpdateAthleteAdministrative('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_administrative_data')
    })
  })

  describe('UPLOAD - useUploadDocumentoContrattuale', () => {
    it('should upload documento contrattuale successfully', async () => {
      const mockFile = new File(['test'], 'contratto.pdf', { type: 'application/pdf' })
      const uploadParams = {
        file: mockFile,
        nome: 'contratto.pdf',
        tipo: 'contratto',
        note: 'Contratto test',
      }

      // Mock per check esistenza record
      mockSingle.mockResolvedValueOnce({
        data: { id: 'administrative-id', documenti_contrattuali: [] },
        error: null,
      })

      // Mock per upload storage
      mockStorageBucket.upload.mockResolvedValue({
        error: null,
      })

      // Mock per update database
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const { result } = renderHook(() => useUploadDocumentoContrattuale('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(uploadParams)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockStorageBucket.upload).toHaveBeenCalled()
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('athlete-documents')
    })
  })
})
