import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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

export { createAdminClient } from './admin'
