/**
 * @fileoverview Test per useAthleteMedical hook
 * @module hooks/athlete-profile/__tests__/use-athlete-medical.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAthleteMedical,
  useUpdateAthleteMedical,
  useUploadCertificatoMedico,
  useUploadRefertoMedico,
} from '../use-athlete-medical'
import type { ReactNode } from 'react'
import React from 'react'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
  auth: {
    getUser: vi.fn(),
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
  createAthleteMedicalDataSchema: {
    parse: vi.fn((data) => data),
  },
  updateAthleteMedicalDataSchema: {
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

describe('useAthleteMedical', () => {
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
      data: { publicUrl: 'https://example.com/file.pdf' },
    })

    // Mock auth.getUser() per useUploadCertificatoMedico
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
  })

  describe('GET - useAthleteMedical', () => {
    it('should return null when athleteId is null', async () => {
      const { result } = renderHook(() => useAthleteMedical(null), {
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

    it('should fetch athlete medical data successfully', async () => {
      const mockData = {
        id: 'medical-id',
        athlete_id: 'test-athlete-id',
        certificato_medico_url: 'https://example.com/cert.pdf',
        certificato_medico_scadenza: '2025-12-31',
        certificato_medico_tipo: 'agonistico',
        referti_medici: [],
        allergie: ['latte'],
        patologie: [],
        farmaci_assunti: [],
        interventi_chirurgici: [],
        note_mediche: 'Nessuna nota',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const { result } = renderHook(() => useAthleteMedical('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.athlete_id).toBe('test-athlete-id')
      expect(result.current.data?.allergie).toContain('latte')
      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_medical_data')
    })

    it('should handle error when fetching fails', async () => {
      const mockError = { message: 'Database error', code: 'PGRST116' }

      mockSingle.mockResolvedValue({
        data: null,
        error: mockError,
      })

      const { result } = renderHook(() => useAthleteMedical('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // PGRST116 significa "no rows returned", quindi ritorna null (non errore)
      expect(result.current.data).toBeNull()
    })
  })

  describe('UPDATE - useUpdateAthleteMedical', () => {
    it('should update athlete medical data successfully', async () => {
      const updateData = {
        allergie: ['latte', 'glutine'],
        note_mediche: 'Aggiornato',
      }

      const mockUpdatedData = {
        id: 'medical-id',
        athlete_id: 'test-athlete-id',
        allergie: ['latte', 'glutine'],
        note_mediche: 'Aggiornato',
        certificato_medico_url: null,
        certificato_medico_scadenza: null,
        certificato_medico_tipo: null,
        referti_medici: [],
        patologie: [],
        farmaci_assunti: [],
        interventi_chirurgici: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

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
        data: { id: 'medical-id' },
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

      const { result } = renderHook(() => useUpdateAthleteMedical('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('athlete_medical_data')
    })
  })

  describe('UPLOAD - useUploadCertificatoMedico', () => {
    it('should upload certificato medico successfully', async () => {
      const mockFile = new File(['test'], 'certificato.pdf', { type: 'application/pdf' })
      const uploadParams = {
        file: mockFile,
        tipo: 'agonistico' as const,
        scadenza: '2025-12-31',
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
        data: { user_id: 'test-athlete-id' },
        error: null,
      })

      // Mock per check esistenza record medical
      mockSingle.mockResolvedValueOnce({
        data: { id: 'medical-id' },
        error: null,
      })

      // Mock per upload storage
      mockStorageBucket.upload.mockResolvedValue({
        error: null,
      })

      // Mock per update database
      const mockUpdateEq = vi.fn()
      mockUpdateEq.mockResolvedValue({
        data: null,
        error: null,
      })

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      })

      // Configura from() per ritornare chain corretta per profiles
      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelectProfiles,
          update: mockUpdate,
          insert: mockInsert,
        }) // Prima chiamata: profiles
        .mockReturnValueOnce({
          select: mockSelect,
          update: mockUpdate,
          insert: mockInsert,
        }) // Seconda chiamata: athlete_medical_data (check esistenza)
        .mockReturnValue({
          select: mockSelect,
          update: mockUpdate,
          insert: mockInsert,
        }) // Chiamate successive: athlete_medical_data (update)

      const { result } = renderHook(() => useUploadCertificatoMedico('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(uploadParams)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockStorageBucket.upload).toHaveBeenCalled()
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('athlete-certificates')
    })

    it('should handle upload error', async () => {
      const mockFile = new File(['test'], 'certificato.pdf', { type: 'application/pdf' })
      const uploadParams = {
        file: mockFile,
        tipo: 'agonistico' as const,
        scadenza: '2025-12-31',
      }

      // Mock per upload storage error
      mockStorageBucket.upload.mockResolvedValue({
        error: { message: 'Upload failed' },
      })

      const { result } = renderHook(() => useUploadCertificatoMedico('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(uploadParams)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('UPLOAD - useUploadRefertoMedico', () => {
    it('should upload referto medico successfully', async () => {
      const mockFile = new File(['test'], 'referto.pdf', { type: 'application/pdf' })
      const uploadParams = {
        file: mockFile,
        tipo: 'esami del sangue',
        data: '2025-01-15',
        note: 'Tutto ok',
      }

      // Mock per check esistenza record
      mockSingle.mockResolvedValueOnce({
        data: { id: 'medical-id', referti_medici: [] },
        error: null,
      })

      // Mock per upload storage
      mockStorageBucket.upload.mockResolvedValue({
        error: null,
      })

      // Mock per update database
      const mockUpdateEq = vi.fn()
      mockUpdateEq.mockResolvedValue({
        data: null,
        error: null,
      })

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      })

      const { result } = renderHook(() => useUploadRefertoMedico('test-athlete-id'), {
        wrapper: createWrapper(),
      })

      result.current.mutate(uploadParams)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockStorageBucket.upload).toHaveBeenCalled()
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('athlete-referti')
    })
  })
})
