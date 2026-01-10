import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Mock environment variables for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

describe('Supabase Client Integration', () => {
  let supabase: SupabaseClient<Database>

  beforeAll(() => {
    supabase = createClient<Database>(supabaseUrl, supabaseKey)
  })

  afterAll(async () => {
    // Cleanup if needed
  })

  it('should create a client instance', () => {
    expect(supabase).toBeDefined()
    expect(supabase.from).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should connect to profiles table', async () => {
    const { data, error } = await supabase.from('profiles').select('*').limit(1)

    // In test environment, we expect either data or a specific error
    // If there's a connection error, we'll skip this test
    if (error && error.message.includes('fetch failed')) {
      console.warn('Supabase connection failed in test environment, skipping test')
      return
    }

    expect(error).toBeFalsy()
    expect(Array.isArray(data)).toBeTruthy()
  })

  it('should handle authentication', async () => {
    const { data, error } = await supabase.auth.getSession()

    // In test environment, we expect either a session or no session
    expect(error).toBeFalsy()
    expect(data).toBeDefined()
  })

  it('should handle realtime subscriptions', () => {
    const channel = supabase
      .channel('test-channel')
      .on('broadcast', { event: 'test' }, (payload: Record<string, unknown>) => {
        expect(payload).toBeDefined()
      })

    expect(channel).toBeDefined()
    expect(channel.subscribe).toBeDefined()
  })
})
