'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { withNetworkRetry } from '@/lib/network-retry'
import { fetchUserSettings } from '@/lib/user-settings/fetch-user-settings'
import { queryKeys } from '@/lib/query-keys'
import { invalidateUserSettingsQueries } from '@/lib/react-query/post-mutation-cache'

const logger = createLogger('hooks:use-user-settings')

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  newClients: boolean
  payments: boolean
  appointments: boolean
  messages: boolean
}

export interface PrivacySettings {
  profileVisible: boolean
  showEmail: boolean
  showPhone: boolean
  analytics: boolean
}

export interface AccountSettings {
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
}

export interface UserSettings {
  notifications: NotificationSettings
  privacy: PrivacySettings
  account: AccountSettings
  two_factor_enabled: boolean
  two_factor_secret: string | null
  two_factor_backup_codes: string[] | null
  two_factor_enabled_at: string | null
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  email: true,
  push: true,
  sms: false,
  newClients: true,
  payments: true,
  appointments: true,
  messages: true,
}

const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisible: true,
  showEmail: true,
  showPhone: false,
  analytics: true,
}

const DEFAULT_ACCOUNT: AccountSettings = {
  language: 'it',
  timezone: 'Europe/Rome',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
}

export function useUserSettings(authUserId?: string | null) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const queryKey = useMemo(
    () =>
      authUserId
        ? queryKeys.userSettings.byAuthUser(authUserId)
        : (['user-settings', 'self'] as const),
    [authUserId],
  )

  const settingsQuery = useQuery({
    queryKey,
    queryFn: () => fetchUserSettings(authUserId),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previous) => previous,
  })

  const settings = settingsQuery.data ?? null
  const loading = settingsQuery.isPending

  const loadSettings = useCallback(
    async (userId?: string) => {
      await invalidateUserSettingsQueries(queryClient, userId ?? authUserId ?? null)
    },
    [authUserId, queryClient],
  )

  // Salva impostazioni notifiche
  const saveNotifications = useCallback(
    async (notifications: NotificationSettings) => {
      try {
        setError(null)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          throw new Error('Utente non autenticato')
        }

        await withNetworkRetry(async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: updateError } = await (supabase.from('user_settings') as any).upsert(
            {
              user_id: authUser.id,
              notification_settings: notifications,
            },
            {
              onConflict: 'user_id',
            },
          )

          if (updateError) {
            if (updateError.code === '42703') {
              throw new Error(
                'Colonna notification_settings non esiste. Eseguire la migration 20250130_create_user_settings.sql',
              )
            }
            throw updateError
          }
        })

        queryClient.setQueryData<UserSettings>(queryKey, (prev) =>
          prev ? { ...prev, notifications } : prev,
        )
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [queryClient, queryKey],
  )

  // Salva impostazioni privacy
  const savePrivacy = useCallback(
    async (privacy: PrivacySettings) => {
      try {
        setError(null)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          throw new Error('Utente non autenticato')
        }

        await withNetworkRetry(async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: updateError } = await (supabase.from('user_settings') as any).upsert(
            {
              user_id: authUser.id,
              privacy_settings: privacy,
            },
            {
              onConflict: 'user_id',
            },
          )

          if (updateError) {
            if (updateError.code === '42703') {
              throw new Error(
                'Colonna privacy_settings non esiste. Eseguire la migration 20250130_create_user_settings.sql',
              )
            }
            throw updateError
          }
        })

        queryClient.setQueryData<UserSettings>(queryKey, (prev) =>
          prev ? { ...prev, privacy } : prev,
        )
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [queryClient, queryKey],
  )

  // Salva impostazioni account
  const saveAccount = useCallback(
    async (account: AccountSettings) => {
      try {
        setError(null)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          throw new Error('Utente non autenticato')
        }

        await withNetworkRetry(async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: updateError } = await (supabase.from('user_settings') as any).upsert(
            {
              user_id: authUser.id,
              account_settings: account,
            },
            {
              onConflict: 'user_id',
            },
          )

          if (updateError) {
            if (updateError.code === '42703') {
              throw new Error(
                'Colonna account_settings non esiste. Eseguire la migration 20250130_create_user_settings.sql',
              )
            }
            throw updateError
          }
        })

        queryClient.setQueryData<UserSettings>(queryKey, (prev) =>
          prev ? { ...prev, account } : prev,
        )
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        logger.error('Errore salvataggio account', err)
        return { success: false, error: errorMessage }
      }
    },
    [queryClient, queryKey],
  )

  // Salva impostazioni 2FA
  const saveTwoFactor = useCallback(
    async (enabled: boolean, secret?: string, backupCodes?: string[]) => {
      try {
        setError(null)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          throw new Error('Utente non autenticato')
        }

        const updateData: {
          two_factor_enabled: boolean
          two_factor_secret?: string
          two_factor_backup_codes?: string[]
          two_factor_enabled_at?: string
        } = {
          two_factor_enabled: enabled,
        }

        if (enabled) {
          if (secret) updateData.two_factor_secret = secret
          if (backupCodes) updateData.two_factor_backup_codes = backupCodes
          updateData.two_factor_enabled_at = new Date().toISOString()
        } else {
          // Quando si disabilita, rimuovi secret e backup codes
          updateData.two_factor_secret = undefined
          updateData.two_factor_backup_codes = undefined
          updateData.two_factor_enabled_at = undefined
        }

        await withNetworkRetry(async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: updateError } = await (supabase.from('user_settings') as any).upsert(
            {
              user_id: authUser.id,
              ...updateData,
            },
            {
              onConflict: 'user_id',
            },
          )

          if (updateError) {
            if (updateError.code === '42703') {
              throw new Error(
                'Colonne 2FA non esistono. Eseguire la migration 20250130_create_user_settings.sql',
              )
            }
            throw updateError
          }
        })

        queryClient.setQueryData<UserSettings>(queryKey, (prev) =>
          prev
            ? {
                ...prev,
                two_factor_enabled: enabled,
                two_factor_secret: secret || null,
                two_factor_backup_codes: backupCodes || null,
                two_factor_enabled_at: enabled ? new Date().toISOString() : null,
              }
            : prev,
        )
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [queryClient, queryKey],
  )

  const resolvedError =
    error ??
    (settingsQuery.error instanceof Error
      ? settingsQuery.error.message
      : settingsQuery.error
        ? String(settingsQuery.error)
        : null)

  return {
    settings,
    loading,
    error: resolvedError,
    loadSettings,
    saveNotifications,
    savePrivacy,
    saveAccount,
    saveTwoFactor,
  }
}
