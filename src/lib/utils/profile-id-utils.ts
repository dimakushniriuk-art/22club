'use client'

import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { useState, useEffect, useRef } from 'react'

const logger = createLogger('utils:profile-id-utils')

/**
 * Utility per conversione tra profiles.id e profiles.user_id
 *
 * Schema Database:
 * - profiles.id (UUID, PK) - Usato da: appointments, workout_logs, chat_messages
 * - profiles.user_id (UUID, FK a auth.users.id) - Usato da: workout_plans.created_by, documents, progress_logs
 * - auth.users.id (UUID) - ID dell'utente autenticato
 */

/**
 * Converte user_id (auth.users.id o profiles.user_id) in profile_id (profiles.id)
 * @param userId - L'ID dell'utente (auth.users.id o profiles.user_id)
 * @returns Promise con profile_id o null se non trovato
 */
export async function getProfileIdFromUserId(userId: string): Promise<string | null> {
  if (!userId) {
    logger.warn('getProfileIdFromUserId chiamato con userId null/undefined')
    return null
  }

  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      logger.error('Errore recupero profile_id da user_id', error, { userId })
      return null
    }

    if (!profile?.id) {
      logger.warn('Profilo non trovato per user_id', undefined, { userId })
      return null
    }

    logger.debug('Profile_id recuperato da user_id', { userId, profileId: profile.id })
    return profile.id
  } catch (error) {
    logger.error('Errore inatteso in getProfileIdFromUserId', error, { userId })
    return null
  }
}

/**
 * Converte profile_id (profiles.id) in user_id (profiles.user_id o auth.users.id)
 * @param profileId - L'ID del profilo (profiles.id)
 * @returns Promise con user_id o null se non trovato
 */
export async function getUserIdFromProfileId(profileId: string): Promise<string | null> {
  if (!profileId) {
    logger.warn('getUserIdFromProfileId chiamato con profileId null/undefined')
    return null
  }

  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .maybeSingle()

    if (error) {
      logger.error('Errore recupero user_id da profile_id', error, { profileId })
      return null
    }

    // Tipizza esplicitamente per evitare problemi di inferenza TypeScript
    type ProfileSelect = { user_id: string | null } | null
    const typedProfile = profile as ProfileSelect

    if (!typedProfile || !typedProfile.user_id) {
      logger.warn('Profilo non trovato per profile_id', undefined, { profileId })
      return null
    }

    logger.debug('User_id recuperato da profile_id', { profileId, userId: typedProfile.user_id })
    return typedProfile.user_id
  } catch (error) {
    logger.error('Errore inatteso in getUserIdFromProfileId', error, { profileId })
    return null
  }
}

/**
 * Hook per convertire user_id in profile_id con caching
 * @param userId - L'ID dell'utente (auth.users.id o profiles.user_id)
 * @returns profile_id o null se non disponibile
 */
export function useProfileId(userId: string | null): string | null {
  const [profileId, setProfileId] = useState<string | null>(null)
  const previousUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Evita fetch se userId non è cambiato
    if (userId === previousUserIdRef.current) {
      return
    }
    previousUserIdRef.current = userId

    if (!userId) {
      setProfileId(null)
      return
    }

    // Verifica se siamo in un ambiente browser prima di usare sessionStorage
    if (typeof window === 'undefined') {
      // Server-side rendering: carica direttamente senza cache
      getProfileIdFromUserId(userId)
        .then((id) => {
          setProfileId(id)
        })
        .catch((error) => {
          logger.error('Errore in useProfileId', error, { userId })
          setProfileId(null)
        })
      return
    }

    // Cache semplice in memoria per evitare query duplicate
    const cacheKey = `profile_id_${userId}`
    const cached = sessionStorage.getItem(cacheKey)

    if (cached) {
      setProfileId(cached)
      return
    }

    getProfileIdFromUserId(userId)
      .then((id) => {
        setProfileId(id)
        if (id) {
          sessionStorage.setItem(cacheKey, id)
        }
      })
      .catch((error) => {
        logger.error('Errore in useProfileId', error, { userId })
        setProfileId(null)
      })
  }, [userId])

  return profileId
}

/**
 * Hook per convertire profile_id in user_id con caching
 * @param profileId - L'ID del profilo (profiles.id)
 * @returns user_id o null se non disponibile
 */
export function useUserId(profileId: string | null): string | null {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) {
      setUserId(null)
      return
    }

    // Verifica se siamo in un ambiente browser prima di usare sessionStorage
    if (typeof window === 'undefined') {
      // Server-side rendering: carica direttamente senza cache
      getUserIdFromProfileId(profileId)
        .then((id) => {
          setUserId(id)
        })
        .catch((error) => {
          logger.error('Errore in useUserId', error, { profileId })
          setUserId(null)
        })
      return
    }

    // Cache semplice in memoria per evitare query duplicate
    const cacheKey = `user_id_${profileId}`
    const cached = sessionStorage.getItem(cacheKey)

    if (cached) {
      setUserId(cached)
      return
    }

    getUserIdFromProfileId(profileId)
      .then((id) => {
        setUserId(id)
        if (id) {
          sessionStorage.setItem(cacheKey, id)
        }
      })
      .catch((error) => {
        logger.error('Errore in useUserId', error, { profileId })
        setUserId(null)
      })
  }, [profileId])

  return userId
}
