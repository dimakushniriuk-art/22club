// ============================================================
// FASE 2: Selezione Destinatari
// ============================================================
// Gestisce la logica per selezionare destinatari in base ai filtri
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
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

let serviceClient: ReturnType<typeof createClient<Database>> | null = null

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function getSupabaseClient() {
  if (!serviceClient) {
    serviceClient = createClient<Database>(
      requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
        },
      },
    )
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
      .select('user_id, email, telefono, role')
      .not('user_id', 'is', null)
      .eq('stato', 'attivo') // Filtra solo utenti attivi

    // Filtro per ruolo (gestisce atleta/athlete come sinonimi)
    if (filter.role) {
      if (filter.role === 'atleta') {
        // Include sia 'atleta' che 'athlete'
        query = query.or('role.eq.atleta,role.eq.athlete')
      } else {
        query = query.eq('role', filter.role)
      }
    }

    // Filtro per atleti specifici
    if (filter.athlete_ids && filter.athlete_ids.length > 0) {
      query = query.in('user_id', filter.athlete_ids)
    }

    // Se all_users è true, non aggiungere filtri aggiuntivi (tutti gli utenti)
    // Se all_users è false o undefined, e non ci sono altri filtri, restituisci array vuoto
    if (
      !filter.all_users &&
      !filter.role &&
      (!filter.athlete_ids || filter.athlete_ids.length === 0)
    ) {
      return { data: [], error: null }
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      return { data: null, error: new Error(profilesError.message) }
    }

    // Type assertion per profiles
    type ProfileRow = {
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

    // Verifica quali utenti hanno token push attivi (per filtrare destinatari push)
    const userIds = typedProfiles
      .map((p) => p.user_id)
      .filter((id): id is string => id !== null && id !== undefined)

    const { data: pushTokens, error: tokensError } = await supabase
      .from('user_push_tokens')
      .select('user_id')
      .in('user_id', userIds)
      .eq('is_active', true)

    if (tokensError) {
      // Non è critico, continuiamo senza filtrare per push tokens
      logger.warn('Error fetching push tokens', tokensError, { userIdsCount: userIds.length })
    }

    // Type assertion per pushTokens
    type PushTokenRow = {
      user_id?: string | null
      [key: string]: unknown
    }

    const typedPushTokens = (pushTokens as PushTokenRow[]) || []

    const usersWithPushTokens = new Set(
      typedPushTokens
        .map((t) => t.user_id)
        .filter((id): id is string => id !== null && id !== undefined),
    )

    // Mappa i profili a Recipient
    const recipients: Recipient[] = typedProfiles
      .filter((p) => p.user_id !== null && p.user_id !== undefined)
      .map((p) => ({
        user_id: p.user_id!,
        email: p.email || null,
        phone: p.telefono || null,
        role: p.role || null,
        has_push_token: usersWithPushTokens.has(p.user_id!),
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
 * Valida che i destinatari selezionati siano validi
 */
export async function validateRecipients(
  recipients: Recipient[],
  communicationType: 'push' | 'email' | 'sms' | 'all',
): Promise<{ valid: Recipient[]; invalid: Recipient[]; errors: string[] }> {
  const valid: Recipient[] = []
  const invalid: Recipient[] = []
  const errors: string[] = []

  for (const recipient of recipients) {
    const recipientErrors: string[] = []

    // Validazione per push
    if (communicationType === 'push' || communicationType === 'all') {
      if (!recipient.has_push_token) {
        recipientErrors.push('No active push token')
      }
    }

    // Validazione per email
    if (communicationType === 'email' || communicationType === 'all') {
      if (!recipient.email) {
        recipientErrors.push('No email address')
      }
    }

    // Validazione per SMS
    if (communicationType === 'sms' || communicationType === 'all') {
      if (!recipient.phone) {
        recipientErrors.push('No phone number')
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
 * Genera la lista di recipients per ogni tipo di comunicazione
 * (push, email, sms) in base al tipo di comunicazione
 *
 * NOTA: Per push, crea recipients anche se non hanno token attivi.
 * Durante l'invio verranno marcati come failed se non hanno token.
 * Questo permette di avere un conteggio accurato dei destinatari.
 */
export function generateRecipientTypes(
  recipients: Recipient[],
  communicationType: 'push' | 'email' | 'sms' | 'all',
): Array<{ user_id: string; recipient_type: 'push' | 'email' | 'sms' }> {
  const recipientTypes: Array<{ user_id: string; recipient_type: 'push' | 'email' | 'sms' }> = []

  for (const recipient of recipients) {
    if (communicationType === 'all') {
      // Aggiungi tutti i tipi disponibili per questo utente
      if (recipient.has_push_token) {
        recipientTypes.push({ user_id: recipient.user_id, recipient_type: 'push' })
      }
      if (recipient.email) {
        recipientTypes.push({ user_id: recipient.user_id, recipient_type: 'email' })
      }
      if (recipient.phone) {
        recipientTypes.push({ user_id: recipient.user_id, recipient_type: 'sms' })
      }
    } else if (communicationType === 'push') {
      // Per push, crea recipients anche senza token (saranno marcati come failed durante l'invio)
      recipientTypes.push({ user_id: recipient.user_id, recipient_type: 'push' })
    } else if (communicationType === 'email' && recipient.email) {
      recipientTypes.push({ user_id: recipient.user_id, recipient_type: 'email' })
    } else if (communicationType === 'sms' && recipient.phone) {
      recipientTypes.push({ user_id: recipient.user_id, recipient_type: 'sms' })
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
      if (filter.role === 'atleta') {
        // Include sia 'atleta' che 'athlete'
        query = query.or('role.eq.atleta,role.eq.athlete')
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
