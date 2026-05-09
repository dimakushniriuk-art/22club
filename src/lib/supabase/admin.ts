import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

let adminSingleton: SupabaseClient<Database> | null = null

/**
 * Client Supabase con service role (bypass RLS).
 * Singleton server-side. Usare solo in API routes, mai nel browser.
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (adminSingleton) {
    return adminSingleton
  }
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY').trim()
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (anon && serviceRoleKey === anon) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY coincide con NEXT_PUBLIC_SUPABASE_ANON_KEY: usa il secret service_role dalla dashboard Supabase.',
    )
  }
  adminSingleton = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return adminSingleton
}
