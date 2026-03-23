import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export type ProfileResolveSupabase = SupabaseClient<Database>

/**
 * Risolve la riga `profiles` il cui PK (`id`) o `user_id` coincide con `identifier`
 * (es. auth.users.id o già profiles.id). Ordine: match su `id`, poi su `user_id`.
 */
export async function resolveProfileByIdentifier(
  client: ProfileResolveSupabase,
  identifier: string,
  columns: string,
  options?: { profileIdCache?: Map<string, string> },
): Promise<Record<string, unknown> | null> {
  if (!identifier) return null

  const cache = options?.profileIdCache
  if (cache?.has(identifier)) {
    const profileId = cache.get(identifier)!
    if (columns === 'id') {
      return { id: profileId }
    }
    const { data } = await client
      .from('profiles')
      .select(columns)
      .eq('id', profileId)
      .limit(1)
      .maybeSingle()
    return data != null ? (data as unknown as Record<string, unknown>) : null
  }

  const { data: byId } = await client
    .from('profiles')
    .select(columns)
    .eq('id', identifier)
    .limit(1)
    .maybeSingle()
  if (byId) {
    const row = byId as unknown as Record<string, unknown>
    const pid = row.id as string | undefined
    if (pid && cache) cache.set(identifier, pid)
    return row
  }

  // limit(1): più righe con lo stesso user_id fanno fallire .maybeSingle() senza limit
  const { data: byUserId } = await client
    .from('profiles')
    .select(columns)
    .eq('user_id', identifier)
    .limit(1)
    .maybeSingle()
  if (byUserId) {
    const row = byUserId as unknown as Record<string, unknown>
    const pid = row.id as string | undefined
    if (pid && cache) cache.set(identifier, pid)
    return row
  }

  return null
}
