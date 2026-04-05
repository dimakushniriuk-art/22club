// ============================================================
// FASE 2: Selezione Destinatari
// ============================================================
// Gestisce la logica per selezionare destinatari in base ai filtri
// ============================================================

import { createLogger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentOrgIdFromProfile } from '@/lib/organizations/current-org'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { RecipientFilter } from './service'

const logger = createLogger('lib:communications:recipients')

export interface Recipient {
  user_id: string
  email?: string | null
  phone?: string | null
  role?: string | null
  has_push_token?: boolean
}

let serviceClient: SupabaseClient<Database> | null = null

function getSupabaseClient() {
  if (!serviceClient) {
    serviceClient = createAdminClient() as unknown as SupabaseClient<Database>
  }
  return serviceClient
}

function resolveFilterOrgId(filter: RecipientFilter): string | null {
  return getCurrentOrgIdFromProfile({
    org_id: (filter as { org_id?: string | null }).org_id ?? null,
  })
}

/**
 * Ottiene i destinatari in base ai filtri specificati
 */
export async function getRecipientsByFilter(
  filter: RecipientFilter,
): Promise<{ data: Recipient[] | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()
    const orgId = resolveFilterOrgId(filter)

    if (
      !filter.all_users &&
      !filter.role &&
      (!filter.athlete_ids || filter.athlete_ids.length === 0)
    ) {
      return { data: [], error: null }
    }

    if ((filter.role || filter.all_users) && !orgId) {
      return { data: [], error: null }
    }

    type ProfileRow = {
      id?: string | null
      user_id?: string | null
      email?: string | null
      telefono?: string | null
      role?: string | null
      [key: string]: unknown
    }

    const runProfilesSelect = (idChunk: string[] | null) => {
      let q = supabase
        .from('profiles')
        .select('id, user_id, email, telefono, role')
        .eq('stato', 'attivo')
      if (orgId) {
        q = q.eq('org_id', orgId)
      }
      if (filter.role) {
        if (filter.role === 'athlete') {
          q = q.eq('role', 'athlete')
        } else {
          q = q.eq('role', filter.role)
        }
      }
      if (idChunk && idChunk.length > 0) {
        q = q.in('id', idChunk)
      }
      return q
    }

    let profiles: ProfileRow[] | null = null
    let profilesError: PostgrestError | null = null

    if (filter.athlete_ids && filter.athlete_ids.length > 0) {
      const mergedByProfileId = new Map<string, ProfileRow>()
      for (const chunk of chunkForSupabaseIn(filter.athlete_ids)) {
        const { data: chunkRows, error: chunkErr } = await runProfilesSelect(chunk)
        if (chunkErr) {
          profilesError = chunkErr
          break
        }
        for (const row of (chunkRows as ProfileRow[] | null) ?? []) {
          if (row.id != null) {
            mergedByProfileId.set(row.id, row)
          }
        }
      }
      profiles = profilesError ? null : Array.from(mergedByProfileId.values())
    } else {
      const res = await runProfilesSelect(null)
      profiles = (res.data as ProfileRow[] | null) ?? null
      profilesError = res.error
    }

    if (profilesError) {
      return { data: null, error: new Error(profilesError.message) }
    }

    const typedProfiles = profiles ?? []

    if (!typedProfiles || typedProfiles.length === 0) {
      return { data: [], error: null }
    }

    const authUserIds = typedProfiles
      .map((p) => p.user_id)
      .filter((id): id is string => id !== null && id !== undefined)

    type PushTokenRow = { user_id?: string | null; [key: string]: unknown }
    const typedPushTokens: PushTokenRow[] = []
    let tokensError: PostgrestError | null = null
    for (const uidChunk of chunkForSupabaseIn(authUserIds)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pushTokens, error: chunkTokErr } = await (supabase as any).from('user_push_tokens')
        .select('user_id')
        .in('user_id', uidChunk)
        .eq('is_active', true)
      if (chunkTokErr) {
        tokensError = chunkTokErr
        break
      }
      typedPushTokens.push(...((pushTokens as PushTokenRow[]) || []))
    }

    if (tokensError) {
      logger.warn('Error fetching push tokens', tokensError, { userIdsCount: authUserIds.length })
    }

    const usersWithPushTokens = new Set(
      typedPushTokens
        .map((t) => t.user_id)
        .filter((id): id is string => id !== null && id !== undefined),
    )

    // user_id in Recipient = profile id (profiles.id), usato come recipient_profile_id in DB
    const recipients: Recipient[] = typedProfiles
      .filter((p) => p.id != null)
      .map((p) => ({
        user_id: p.id!,
        email: p.email || null,
        phone: p.telefono || null,
        role: p.role || null,
        has_push_token: p.user_id != null ? usersWithPushTokens.has(p.user_id) : false,
      }))

    return { data: recipients, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Valida che i destinatari selezionati siano validi (solo email)
 */
export async function validateRecipients(
  recipients: Recipient[],
  communicationType: 'email' | 'all',
): Promise<{ valid: Recipient[]; invalid: Recipient[]; errors: string[] }> {
  const valid: Recipient[] = []
  const invalid: Recipient[] = []
  const errors: string[] = []

  for (const recipient of recipients) {
    const recipientErrors: string[] = []

    if (communicationType === 'email' || communicationType === 'all') {
      if (!recipient.email) {
        recipientErrors.push('No email address')
      }
    }

    if (recipientErrors.length > 0) {
      invalid.push(recipient)
      errors.push(`User ${recipient.user_id}: ${recipientErrors.join(', ')}`)
    } else {
      valid.push(recipient)
    }
  }

  return { valid, invalid, errors }
}

/**
 * Genera la lista di recipients per tipo comunicazione (solo email).
 * Per tipi push/sms (legacy) restituisce array vuoto.
 */
export function generateRecipientTypes(
  recipients: Recipient[],
  communicationType: string,
): Array<{ user_id: string; recipient_type: 'email' }> {
  if (communicationType !== 'email' && communicationType !== 'all') {
    return []
  }
  const recipientTypes: Array<{ user_id: string; recipient_type: 'email' }> = []
  for (const recipient of recipients) {
    if (recipient.email) {
      recipientTypes.push({ user_id: recipient.user_id, recipient_type: 'email' })
    }
  }
  return recipientTypes
}

/**
 * Conta i destinatari in base ai filtri (senza recuperare tutti i dati)
 */
// Cache in-memory per i count dei destinatari (TTL 60 secondi)
interface CachedCount {
  count: number
  expires: number
}

const countCache = new Map<string, CachedCount>()

// Pulisci cache ogni 2 minuti
setInterval(
  () => {
    const now = Date.now()
    let cleaned = 0
    for (const [key, value] of countCache.entries()) {
      if (value.expires < now) {
        countCache.delete(key)
        cleaned++
      }
    }
    if (cleaned > 0) {
      logger.debug(`Pulita cache count destinatari: ${cleaned} entry scadute`)
    }
  },
  2 * 60 * 1000,
)

/**
 * Genera una chiave di cache univoca per il filtro
 */
function getCacheKey(filter: RecipientFilter): string {
  return JSON.stringify({
    org_id: resolveFilterOrgId(filter),
    role: filter.role || null,
    athlete_ids: filter.athlete_ids?.sort().join(',') || null,
    all_users: filter.all_users || false,
  })
}

export async function countRecipientsByFilter(
  filter: RecipientFilter,
  communicationType: string,
): Promise<{ count: number; error: Error | null }> {
  try {
    // Allineato a generateRecipientTypes(): per push/sms (legacy) nessun recipient_type email.
    if (communicationType !== 'email' && communicationType !== 'all') {
      return { count: 0, error: null }
    }

    const orgId = resolveFilterOrgId(filter)

    // Se stiamo contando per ruolo o "tutti" ma manca org_id,
    // seguiamo la stessa regola di getRecipientsByFilter.
    if ((filter.role || filter.all_users) && !orgId) {
      return { count: 0, error: null }
    }

    // Controlla cache (TTL 60 secondi)
    const cacheKey = JSON.stringify({ ...JSON.parse(getCacheKey(filter)), communicationType })
    const cached = countCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      logger.debug('Count destinatari da cache', { filter, count: cached.count })
      return { count: cached.count, error: null }
    }

    const supabase = getSupabaseClient()

    if (
      !filter.all_users &&
      !filter.role &&
      (!filter.athlete_ids || filter.athlete_ids.length === 0)
    ) {
      return { count: 0, error: null }
    }

    const applyCountFilters = (idChunk: string[] | null) => {
      let q = supabase
        .from('profiles')
        .select('user_id', { count: 'exact', head: true })
        .eq('stato', 'attivo')
      if (orgId) {
        q = q.eq('org_id', orgId)
      }
      if (filter.role) {
        if (filter.role === 'athlete') {
          q = q.eq('role', 'athlete')
        } else {
          q = q.eq('role', filter.role)
        }
      }
      if (idChunk && idChunk.length > 0) {
        q = q.in('id', idChunk)
      }
      return q.neq('email', '')
    }

    let resultCount = 0

    if (filter.athlete_ids && filter.athlete_ids.length > 0) {
      for (const chunk of chunkForSupabaseIn(filter.athlete_ids)) {
        const { count, error } = await applyCountFilters(chunk)
        if (error) {
          return { count: 0, error: new Error(error.message) }
        }
        resultCount += count ?? 0
      }
    } else {
      const { count, error } = await applyCountFilters(null)
      if (error) {
        return { count: 0, error: new Error(error.message) }
      }
      resultCount = count ?? 0
    }

    // Salva in cache (60 secondi)
    countCache.set(cacheKey, {
      count: resultCount,
      expires: Date.now() + 60 * 1000,
    })

    logger.debug('Count destinatari caricato da database', { filter, count: resultCount })

    return { count: resultCount, error: null }
  } catch (error) {
    return {
      count: 0,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}
