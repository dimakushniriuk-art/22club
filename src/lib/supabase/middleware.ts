import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export const createClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request,
  })

  // autoRefreshToken: true — altrimenti il JWT scade e getUser() fallisce su ogni navigazione → redirect a /login.
  // I cookie aggiornati dal refresh restano su `response` (withMiddlewareSupabaseCookies). persistSession: false = niente storage lato server oltre ai cookie della richiesta.
  const supabase = createServerClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name)
          response = NextResponse.next({ request })
          response.cookies.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    },
  )

  return { supabase: supabase as SupabaseClient<Database>, response }
}
