import type { SupabaseClient } from '@supabase/supabase-js'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'

const PROFILE_SELECT =
  'id, user_id, role, org_id, nome, cognome, first_name, last_name, email' as const

/** Fallback se la SELECT estesa fallisce (es. schema diverso da types/generato). */
const PROFILE_SELECT_MINIMAL = 'id, user_id, role, org_id, nome, cognome, email' as const

export type CurrentProfile = {
  authUserId: string
  profileId: string
  orgId: string | null
  role: string | null
  user_id: string | null
  email: string | null
  nome: string | null
  cognome: string | null
  first_name: string | null
  last_name: string | null
}

type ProfileRow = {
  id: string
  user_id: string | null
  role: string | null
  org_id: string | null
  nome: string | null
  cognome: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
}

/**
 * Riga profilo per identificatore sessione (auth.users.id o, se coerente col DB, profiles.id).
 * Allineato a `resolveProfileByIdentifier` (match su id, poi user_id). Condiviso da getCurrentProfile e getUserProfile.
 */
export async function fetchCurrentProfileForAuthUserId(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<CurrentProfile | null> {
  let row = await resolveProfileByIdentifier(supabase, authUserId, PROFILE_SELECT)
  if (!row || typeof row.id !== 'string') {
    row = await resolveProfileByIdentifier(supabase, authUserId, PROFILE_SELECT_MINIMAL)
  }
  if (!row || typeof row.id !== 'string') {
    return null
  }

  const profile = row as unknown as ProfileRow
  return {
    authUserId,
    profileId: profile.id,
    orgId: profile.org_id ?? null,
    role: profile.role ?? null,
    user_id: profile.user_id ?? null,
    email: profile.email ?? null,
    nome: profile.nome ?? null,
    cognome: profile.cognome ?? null,
    first_name: profile.first_name ?? null,
    last_name: profile.last_name ?? null,
  }
}

/**
 * Profilo corrente: stessa fonte auth di `getUserProfile` / `getServerAuthUser` (getUser),
 * poi row profilo via `fetchCurrentProfileForAuthUserId`.
 * Opzionale `supabase` per riusare lo stesso client (es. API route con query successive).
 */
export async function getCurrentProfile(
  supabaseArg?: SupabaseClient,
): Promise<CurrentProfile | null> {
  const supabase = supabaseArg ?? (await createClient())
  const { user } = await getServerAuthUser(supabase)
  if (!user?.id) {
    return null
  }

  return fetchCurrentProfileForAuthUserId(supabase, user.id)
}

/**
 * Solo profiles.id per la sessione corrente.
 */
export async function getCurrentProfileId(): Promise<string | null> {
  const profile = await getCurrentProfile()
  return profile?.profileId ?? null
}
