import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createLogger } from '@/lib/logger'
import { Database } from '@/types/supabase'

const logger = createLogger('lib:supabase:server')

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

type CookieStore = Awaited<ReturnType<typeof cookies>>

export async function createClient(passedCookieStore?: CookieStore) {
  // Next 15 richiede di awaitare cookies()
  const cookieStore = passedCookieStore ?? (await cookies())
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Il cookie potrebbe non essere impostabile in alcuni contesti
          logger.warn('Impossibile impostare il cookie', error, { cookieName: name })
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options })
        } catch (error) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          } catch (fallbackError) {
            // Il cookie potrebbe non essere rimovibile in alcuni contesti
            logger.warn('Impossibile rimuovere il cookie', fallbackError ?? error, {
              cookieName: name,
            })
          }
        }
      },
    },
  })
}
