import type { SupabaseClient, User } from '@supabase/supabase-js'

export type ServerAuthUserResult = {
  user: User | null
}

function isRecoverableJwtParseError(message: string | undefined): boolean {
  if (!message) return false
  const m = message.toLowerCase()
  return (
    m.includes('jwt') ||
    m.includes('jws') ||
    m.includes('malformed') ||
    m.includes('invalid compact') ||
    m.includes('invalid token')
  )
}

/**
 * Utente autenticato lato server (preferisce `getUser()` = JWT verificato).
 * Se `getUser()` fallisce solo per token/JWS non parsabile, un tentativo con `getSession()`
 * (cookie) evita falsi negativi in dev/embed durante refresh o cookie incoerenti.
 */
export async function getServerAuthUser(supabase: SupabaseClient): Promise<ServerAuthUserResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (user) {
    return { user }
  }

  if (error && isRecoverableJwtParseError(error.message)) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user) {
      return { user: session.user }
    }
  }

  return { user: null }
}
