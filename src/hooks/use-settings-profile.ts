'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/lib/ui/notify'
import { createLogger } from '@/lib/logger'
import type { UserProfile } from '@/types/user'

const logger = createLogger('hooks:use-settings-profile')

export type SettingsProfileState = {
  id: string
  nome: string
  cognome: string
  email: string
  phone: string
  avatar: string | null
  avatar_url: string | null
}

const INITIAL_PROFILE: SettingsProfileState = {
  id: '',
  nome: '',
  cognome: '',
  email: '',
  phone: '',
  avatar: null,
  avatar_url: null,
}

/**
 * Carica il profilo per la pagina Impostazioni: da authUser (useAuth) o fallback a getUser + query profiles.
 */
export function useSettingsProfile(
  authUser: UserProfile | null,
  authLoading: boolean,
): {
  profile: SettingsProfileState
  profileLoading: boolean
  setProfile: React.Dispatch<React.SetStateAction<SettingsProfileState>>
} {
  const supabase = useMemo(() => createClient(), [])
  const { notify } = useNotify()
  const [profile, setProfile] = useState<SettingsProfileState>(INITIAL_PROFILE)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return

      try {
        setProfileLoading(true)

        if (authUser) {
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('[profiles] dashboard/impostazioni → usa useAuth (no query)', {
              userId: authUser.user_id,
              profileId: authUser.id,
              source: 'dashboard/impostazioni',
            })
          }
          setProfile({
            id: authUser.id || '',
            nome: authUser.nome ?? authUser.first_name ?? '',
            cognome: authUser.cognome ?? authUser.last_name ?? '',
            email: authUser.email ?? '',
            phone: authUser.phone ?? '',
            avatar: authUser.avatar ?? null,
            avatar_url: authUser.avatar_url ?? null,
          })
          setProfileLoading(false)
          return
        }

        const { data: { user: sessionUser } } = await supabase.auth.getUser()
        if (!sessionUser) {
          setProfileLoading(false)
          return
        }

        if (process.env.NODE_ENV !== 'production') {
          logger.debug('[profiles] dashboard/impostazioni → query DB (fallback)', {
            userId: sessionUser.id,
            source: 'dashboard/impostazioni',
          })
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email, phone, avatar, avatar_url')
          .eq('user_id', sessionUser.id)
          .single()

        if (error) {
          logger.error('Errore query profilo', error, {
            message: error.message,
            userId: sessionUser.id,
          })
          throw error
        }

        if (profileData) {
          const row = profileData as {
            id: string
            nome: string | null
            cognome: string | null
            email: string | null
            phone: string | null
            avatar: string | null
            avatar_url: string | null
          }
          setProfile({
            id: row.id,
            nome: row.nome ?? '',
            cognome: row.cognome ?? '',
            email: row.email ?? sessionUser.email ?? '',
            phone: row.phone ?? '',
            avatar: row.avatar ?? null,
            avatar_url: row.avatar_url ?? null,
          })
        }
      } catch (error) {
        const err = error as { message?: string }
        logger.error('Errore caricamento profilo', error, {
          authUserAvailable: !!authUser,
          authLoading,
        })
        notify(err.message ?? 'Errore nel caricamento del profilo', 'error', 'Errore')
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [supabase, authUser, authLoading, notify])

  return { profile, profileLoading, setProfile }
}
