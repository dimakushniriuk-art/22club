import { createClient } from '@/lib/supabase/server'

export type CurrentProfile = {
  profileId: string
  orgId: string | null
  role: string | null
}

/**
 * Restituisce il profilo corrente (profiles.id, org_id, role) per la sessione Supabase.
 * Da usare solo server-side (API routes, Server Components).
 * Legge auth session e poi profiles tramite user_id (legame auth → profilo).
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user?.id) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('user_id', session.user.id)
    .single()

  if (error || !profile) {
    return null
  }

  const row = profile as { id: string; org_id: string | null; role: string | null }
  return {
    profileId: row.id,
    orgId: row.org_id ?? null,
    role: row.role ?? null,
  }
}

/**
 * Restituisce solo l'id profilo (profiles.id) per la sessione corrente.
 */
export async function getCurrentProfileId(): Promise<string | null> {
  const profile = await getCurrentProfile()
  return profile?.profileId ?? null
}
