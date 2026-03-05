import { vi } from 'vitest'

export const supabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  }),
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnValue({
      subscribe: vi.fn().mockReturnValue({
        unsubscribe: vi.fn(),
      }),
    }),
  }),
}

export const createBrowserClient = vi.fn().mockReturnValue(supabase)
export const createServerClient = vi.fn().mockReturnValue(supabase)
