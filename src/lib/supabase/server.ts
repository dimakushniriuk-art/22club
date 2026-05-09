import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

type CookieStore = Awaited<ReturnType<typeof cookies>>

/**
 * Client Supabase per API routes e Server Components (SSR).
 * Usa cookie getAll/setAll compatibile con Route Handlers.
 * Nessun singleton: può essere ricreato per richiesta.
 */
export async function createClient(passedCookieStore?: CookieStore) {
  const cookieStore = passedCookieStore ?? (await cookies())
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options ?? {}),
          )
        } catch {
          // Ignorato se in contesto dove i cookie non sono scrivibili (es. middleware)
        }
      },
    },
  })
}

/**
 * Client anon con JWT in header (no cookie, no adapter SSR).
 * Per `getUser(jwt)` e query RLS con lo stesso JWT verso PostgREST.
 */
export function createJwtForwardClient(accessToken: string): SupabaseClient<Database> {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const token = accessToken.trim()
  return createSupabaseJsClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

export { createAdminClient } from './admin'
