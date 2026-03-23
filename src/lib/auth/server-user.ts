import type { SupabaseClient, User } from '@supabase/supabase-js'

export type ServerAuthUserResult = {
  user: User | null
}

/**
 * Fonte canonica server-side per l'utente autenticato.
 * Non usa fallback a getSession per evitare ambiguità nel layer auth.
 */
export async function getServerAuthUser(supabase: SupabaseClient): Promise<ServerAuthUserResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user: user ?? null }
}
