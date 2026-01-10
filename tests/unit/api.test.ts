import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/auth/context/route'

// Mock per le funzioni di API
const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status || 200 })),
    next: vi.fn(() => ({ status: 200 })),
  },
}))

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/context', () => {
    it('should handle successful context update', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'staff', org_id: 'test-org-id' },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }

      createClientMock.mockReturnValue(mockSupabase)

      const mockRequest = {
        headers: {
          get: vi
            .fn()
            .mockReturnValueOnce('staff') // x-user-role
            .mockReturnValueOnce('test-org-id'), // x-org-id
        },
      } as unknown as NextRequest

      const result = await POST(mockRequest)

      expect(result).toBeDefined()
    })

    it('should handle missing headers', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null,
          }),
        },
      }

      createClientMock.mockReturnValue(mockSupabase)

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest

      const result = await POST(mockRequest)

      expect(result).toBeDefined()
    })

    it('should handle invalid role', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null,
          }),
        },
      }

      createClientMock.mockReturnValue(mockSupabase)

      const mockRequest = {
        headers: {
          get: vi
            .fn()
            .mockReturnValueOnce('invalid-role') // x-user-role
            .mockReturnValueOnce('test-org-id'), // x-org-id
        },
      } as unknown as NextRequest

      const result = await POST(mockRequest)

      expect(result).toBeDefined()
    })
  })

  describe('GET /api/auth/context', () => {
    it('should handle successful context retrieval', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  role: 'staff',
                  org_id: 'test-org-id',
                  full_name: 'Test User',
                  email: 'test@example.com',
                },
                error: null,
              }),
            }),
          }),
        }),
      }

      createClientMock.mockReturnValue(mockSupabase)

      const result = await GET()

      expect(result).toBeDefined()
    })

    it('should handle missing session', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: null },
            error: null,
          }),
        },
      }

      createClientMock.mockReturnValue(mockSupabase)

      const result = await GET()

      expect(result).toBeDefined()
    })

    it('should handle profile not found', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Profile not found' },
              }),
            }),
          }),
        }),
      }

      createClientMock.mockReturnValue(mockSupabase)

      const result = await GET()

      expect(result).toBeDefined()
    })
  })
})
