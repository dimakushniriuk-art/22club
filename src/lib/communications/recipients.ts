// ============================================================
// FASE 2: Selezione Destinatari
// ============================================================
// Gestisce la logica per selezionare destinatari in base ai filtri
// ============================================================

import { createLogger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
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

/**
 * Ottiene i destinatari in base ai filtri specificati
 */
export async function getRecipientsByFilter(
  filter: RecipientFilter,
): Promise<{ data: Recipient[] | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    let query = supabase
      .from('profiles')
      .select('id, user_id, email, telefono, role')
      .eq('stato', 'attivo') // Filtra solo utenti attivi

    // Filtro per org (stessa organizzazione del creatore)
    const orgId = (filter as { org_id?: string }).org_id
    if (orgId) {
      query = query.eq('org_id', orgId)
    }

    // Filtro per ruolo (gestisce atleta/athlete come sinonimi)
    if (filter.role) {
      if (filter.role === 'athlete') {
        query = query.eq('role', 'athlete')
      } else {
        query = query.eq('role', filter.role)
      }
    }

    // Filtro per atleti specifici (athlete_ids sono profile id da list-athletes)
    if (filter.athlete_ids && filter.athlete_ids.length > 0) {
      query = query.in('id', filter.athlete_ids)
    }

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

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      return { data: null, error: new Error(profilesError.message) }
    }

    type ProfileRow = {
      id?: string | null
      user_id?: string | null
      email?: string | null
      telefono?: string | null
      role?: string | null
      [key: string]: unknown
    }

    const typedProfiles = (profiles as ProfileRow[]) || []

    if (!typedProfiles || typedProfiles.length === 0) {
      return { data: [], error: null }
    }

    const authUserIds = typedProfiles
      .map((p) => p.user_id)
      .filter((id): id is string => id !== null && id !== undefined)

    const { data: pushTokens, error: tokensError } = await supabase
      .from('user_push_tokens')
      .select('user_id')
      .in('user_id', authUserIds)
      .eq('is_active', true)

    if (tokensError) {
      logger.warn('Error fetching push tokens', tokensError, { userIdsCount: authUserIds.length })
    }

    type PushTokenRow = { user_id?: string | null; [key: string]: unknown }
    const typedPushTokens = (pushTokens as PushTokenRow[]) || []
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
    role: filter.role || null,
    athlete_ids: filter.athlete_ids?.sort().join(',') || null,
    all_users: filter.all_users || false,
  })
}

export async function countRecipientsByFilter(
  filter: RecipientFilter,
): Promise<{ count: number; error: Error | null }> {
  try {
    // Controlla cache (TTL 60 secondi)
    const cacheKey = getCacheKey(filter)
    const cached = countCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      logger.debug('Count destinatari da cache', { filter, count: cached.count })
      return { count: cached.count, error: null }
    }

    const supabase = getSupabaseClient()

    let query = supabase
      .from('profiles')
      // Usa 'estimated' invece di 'exact' per velocità (accettabile per count destinatari)
      .select('user_id', { count: 'estimated', head: true })
      .eq('stato', 'attivo') // Filtra solo utenti attivi

    // Filtro per ruolo (gestisce atleta/athlete come sinonimi)
    if (filter.role) {
      if (filter.role === 'athlete') {
        query = query.eq('role', 'athlete')
      } else {
        query = query.eq('role', filter.role)
      }
    }

    if (filter.athlete_ids && filter.athlete_ids.length > 0) {
      query = query.in('user_id', filter.athlete_ids)
    }

    if (
      !filter.all_users &&
      !filter.role &&
      (!filter.athlete_ids || filter.athlete_ids.length === 0)
    ) {
      return { count: 0, error: null }
    }

    const { count, error } = await query

    if (error) {
      return { count: 0, error: new Error(error.message) }
    }

    const resultCount = count || 0

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
