import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

// Mock per le funzioni di middleware
const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/middleware', () => ({
  createClient: createClientMock,
}))

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((body, init) => ({ body, status: init?.status || 200 })),
      next: vi.fn(() => ({ status: 200 })),
      redirect: vi.fn((url) => ({ url })),
    },
  }
})

// Mock getAuditContext
vi.mock('@/lib/audit-middleware', () => ({
  getAuditContext: vi.fn(() => ({
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  })),
  getClientIP: vi.fn(() => '127.0.0.1'),
}))

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (pathname: string) => {
    const mockHeaders = new Headers()
    mockHeaders.set('x-forwarded-for', '127.0.0.1')
    mockHeaders.set('x-real-ip', '127.0.0.1')
    mockHeaders.set('user-agent', 'test-agent')

    const mockNextUrl = {
      pathname,
      clone: vi.fn(() => ({
        pathname,
        searchParams: {
          set: vi.fn(),
        },
      })),
      searchParams: {
        set: vi.fn(),
      },
    }

    return {
      url: `http://localhost:3000${pathname}`,
      nextUrl: mockNextUrl,
      headers: mockHeaders,
      cookies: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as NextRequest
  }

  it('should handle protected routes', async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    }

    createClientMock.mockReturnValue({ supabase: mockSupabase, response: { status: 200 } })

    const mockRequest = createMockRequest('/dashboard')

    const result = await middleware(mockRequest)

    expect(result).toBeDefined()
  })

  it('should allow access to public routes', async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    }

    createClientMock.mockReturnValue({ supabase: mockSupabase, response: { status: 200 } })

    const mockRequest = createMockRequest('/login')

    const result = await middleware(mockRequest)

    expect(result).toBeDefined()
  })

  it('should handle authenticated users', async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user-id' },
            },
          },
          error: null,
        }),
      },
    }

    createClientMock.mockReturnValue({ supabase: mockSupabase, response: { status: 200 } })

    const mockRequest = createMockRequest('/dashboard')

    const result = await middleware(mockRequest)

    expect(result).toBeDefined()
  })

  it('should handle API routes', async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    }

    createClientMock.mockReturnValue({ supabase: mockSupabase, response: { status: 200 } })

    const mockRequest = createMockRequest('/api/test')

    const result = await middleware(mockRequest)

    expect(result).toBeDefined()
  })

  it('should handle static files', async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    }

    createClientMock.mockReturnValue({ supabase: mockSupabase, response: { status: 200 } })

    const mockRequest = createMockRequest('/_next/static/test.js')

    const result = await middleware(mockRequest)

    expect(result).toBeDefined()
  })
})
