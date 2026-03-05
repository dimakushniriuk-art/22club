// Helper per ottenere il profilo utente con cache in-memory
// Evita query duplicate al database per verificare ruolo/permessi

import type { SupabaseClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:supabase:get-user-profile')

interface CachedProfile {
  role: string
  id: string
  expires: number
}

// Cache in-memory per la durata della richiesta (non persistente tra richieste)
const requestProfileCache = new Map<string, CachedProfile>()

// Pulisci cache ogni 5 minuti
setInterval(
  () => {
    const now = Date.now()
    let cleaned = 0
    for (const [key, value] of requestProfileCache.entries()) {
      if (value.expires < now) {
        requestProfileCache.delete(key)
        cleaned++
      }
    }
    if (cleaned > 0) {
      logger.debug(`Pulita cache profili: ${cleaned} entry scadute`)
    }
  },
  5 * 60 * 1000,
)

/**
 * Ottiene il profilo utente con cache in-memory (TTL 30 secondi)
 * Evita query duplicate al database quando più API routes verificano lo stesso utente
 *
 * @param supabase - Client Supabase
 * @returns Profilo utente con role e id, o null se non autenticato/errore
 */
export async function getUserProfile(
  supabase: SupabaseClient,
): Promise<{ role: string; id: string } | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Controlla cache (TTL 30 secondi per richiesta)
    const cacheKey = user.id
    const cached = requestProfileCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      logger.debug('Profilo utente da cache', { userId: user.id, role: cached.role })
      return cached
    }

    // Query al database solo se non in cache o scaduta
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      logger.warn('Errore query profilo utente', profileError, { userId: user.id })
      return null
    }

    const profileData = profile as { role?: string; id: string } | null
    if (!profileData || !profileData.role) {
      logger.warn('Profilo utente senza ruolo', undefined, {
        userId: user.id,
        profileId: profileData?.id,
      })
      return null
    }

    // Salva in cache (30 secondi)
    const profileResult: CachedProfile = {
      role: profileData.role,
      id: profileData.id,
      expires: Date.now() + 30 * 1000,
    }
    requestProfileCache.set(cacheKey, profileResult)

    logger.debug('Profilo utente caricato da database', {
      userId: user.id,
      profileId: profileData.id,
      role: profileData.role,
    })

    return profileResult
  } catch (error) {
    logger.error('Errore in getUserProfile', error)
    return null
  }
}

/**
 * Verifica se l'utente ha uno dei ruoli specificati
 *
 * @param supabase - Client Supabase
 * @param allowedRoles - Array di ruoli permessi
 * @returns true se l'utente ha uno dei ruoli permessi
 */
export async function hasRole(supabase: SupabaseClient, allowedRoles: string[]): Promise<boolean> {
  const profile = await getUserProfile(supabase)
  if (!profile) {
    return false
  }

  // Normalizza ruolo (pt -> trainer, atleta -> athlete)
  const normalizedRole =
    profile.role === 'pt' ? 'trainer' : profile.role === 'atleta' ? 'athlete' : profile.role

  return allowedRoles.includes(normalizedRole)
}
