import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWithCache, getAppointmentsCached, getClientiStatsCached } from '@/lib/fetchWithCache'
import type { Tables } from '@/types/supabase'

// Mock per le funzioni di cache
vi.mock('@/lib/fetchWithCache', () => ({
  fetchWithCache: vi.fn(),
  getAppointmentsCached: vi.fn(),
  getClientiStatsCached: vi.fn(),
}))

describe('Fetch with Cache functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchWithCache', () => {
    it('should cache data for specified TTL', async () => {
      const mockData = { message: 'Cached data' }
      const mockFn = vi.fn().mockResolvedValue(mockData)

      vi.mocked(fetchWithCache).mockResolvedValue(mockData)

      const result = await fetchWithCache('test-key', mockFn, { ttlMs: 60000 })

      expect(fetchWithCache).toHaveBeenCalledWith('test-key', mockFn, { ttlMs: 60000 })
      expect(result).toEqual(mockData)
    })

    it('should use default TTL when not specified', async () => {
      const mockData = { message: 'Cached data' }
      const mockFn = vi.fn().mockResolvedValue(mockData)

      vi.mocked(fetchWithCache).mockResolvedValue(mockData)

      const result = await fetchWithCache('test-key', mockFn)

      expect(fetchWithCache).toHaveBeenCalledWith('test-key', mockFn)
      expect(result).toEqual(mockData)
    })

    it('should handle function errors', async () => {
      const mockError = new Error('Function failed')
      const mockFn = vi.fn().mockRejectedValue(mockError)

      vi.mocked(fetchWithCache).mockRejectedValue(mockError)

      await expect(fetchWithCache('test-key', mockFn)).rejects.toThrow('Function failed')
    })
  })

  describe('getAppointmentsCached', () => {
    it('should return cached appointments', async () => {
      const mockAppointments: Tables<'appointments'>[] = [
        {
          id: '1',
          org_id: 'test-org-id',
          athlete_id: 'test-athlete-id',
          athlete_name: null,
          staff_id: 'test-trainer-id',
          trainer_id: 'test-trainer-id',
          trainer_name: null,
          starts_at: '2024-01-15T09:00:00Z',
          ends_at: '2024-01-15T10:00:00Z',
          status: 'attivo',
          type: 'allenamento',
          notes: 'Test note',
          recurrence_rule: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: null,
          cancelled_at: null,
          location: null,
        },
      ]

      vi.mocked(getAppointmentsCached).mockResolvedValue(mockAppointments)

      const result = await getAppointmentsCached()

      expect(getAppointmentsCached).toHaveBeenCalled()
      expect(result).toEqual(mockAppointments)
    })

    it('should handle empty appointments', async () => {
      vi.mocked(getAppointmentsCached).mockResolvedValue([])

      const result = await getAppointmentsCached()

      expect(result).toEqual([])
    })
  })

  describe('getClientiStatsCached', () => {
    it('should return cached client stats', async () => {
      const mockStats = [
        {
          id: '1',
          org_id: 'test-org-id',
          full_name: 'Test Client',
          email: 'client@example.com',
          role: 'athlete' as const,
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: null,
          cancelled_at: null,
          location: null,
        },
      ]

      vi.mocked(getClientiStatsCached).mockResolvedValue(mockStats)

      const result = await getClientiStatsCached()

      expect(getClientiStatsCached).toHaveBeenCalled()
      expect(result).toEqual(mockStats)
    })

    it('should handle empty stats', async () => {
      vi.mocked(getClientiStatsCached).mockResolvedValue([])

      const result = await getClientiStatsCached()

      expect(result).toEqual([])
    })
  })
})
