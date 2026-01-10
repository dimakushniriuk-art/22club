'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

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

export function useUserSettings() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Carica impostazioni utente
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setError('Utente non autenticato')
        setLoading(false)
        return
      }

      // Usa la funzione RPC per ottenere o creare impostazioni
      // Workaround necessario per tipizzazione Supabase RPC
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase.rpc as any)('get_or_create_user_settings', {
        p_user_id: authUser.id,
      })

      if (rpcError) {
        // Se la funzione RPC non esiste o errore, prova query diretta
        const queryResult = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        let settingsData = queryResult.data
        const queryError = queryResult.error

        if (queryError) {
          // Se errore 42703 (colonna non esiste) o PGRST116 (nessun record), gestisci
          if (queryError.code === 'PGRST116' || queryError.code === '42703') {
            // Nessun record trovato o colonna non esiste, crea impostazioni di default
            // Prova insert con solo user_id (le colonne JSONB useranno i default del DB)
            // Workaround necessario per inferenza tipo Supabase
            const { data: newSettings, error: insertError } =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase.from('user_settings') as any)
                .insert({
                  user_id: authUser.id,
                })
                .select()
                .single()

            if (insertError) {
              // Se anche l'insert fallisce per colonne mancanti, usa solo valori in memoria
              logger.warn('Errore inserimento user_settings, usando valori default', insertError)
              setSettings({
                notifications: DEFAULT_NOTIFICATIONS,
                privacy: DEFAULT_PRIVACY,
                account: DEFAULT_ACCOUNT,
                two_factor_enabled: false,
                two_factor_secret: null,
                two_factor_backup_codes: null,
                two_factor_enabled_at: null,
              })
              setLoading(false)
              return
            }
            settingsData = newSettings
          } else {
            // Altro tipo di errore
            throw queryError
          }
        }

        // Type assertion per settingsData
        type UserSettingsRow = {
          notifications?: NotificationSettings | null
          privacy?: PrivacySettings | null
          account?: AccountSettings | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled_at?: string | null
          [key: string]: unknown
        }

        const typedSettingsData = settingsData as UserSettingsRow | null

        if (typedSettingsData) {
          // Gestisci caso in cui colonne JSONB potrebbero non esistere ancora
          setSettings({
            notifications:
              (typedSettingsData.notifications as NotificationSettings | null) ||
              DEFAULT_NOTIFICATIONS,
            privacy: (typedSettingsData.privacy as PrivacySettings | null) || DEFAULT_PRIVACY,
            account: (typedSettingsData.account as AccountSettings | null) || DEFAULT_ACCOUNT,
            two_factor_enabled: typedSettingsData.two_factor_enabled ?? false,
            two_factor_secret: typedSettingsData.two_factor_secret ?? null,
            two_factor_backup_codes: typedSettingsData.two_factor_backup_codes ?? null,
            two_factor_enabled_at: typedSettingsData.two_factor_enabled_at ?? null,
          })
        } else {
          // Fallback: usa valori default se non ci sono dati
          setSettings({
            notifications: DEFAULT_NOTIFICATIONS,
            privacy: DEFAULT_PRIVACY,
            account: DEFAULT_ACCOUNT,
            two_factor_enabled: false,
            two_factor_secret: null,
            two_factor_backup_codes: null,
            two_factor_enabled_at: null,
          })
        }
      } else if (data) {
        // Type assertion per data
        type UserSettingsRow = {
          notifications?: NotificationSettings | null
          privacy?: PrivacySettings | null
          account?: AccountSettings | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled_at?: string | null
          [key: string]: unknown
        }

        const typedData = data as UserSettingsRow

        // Gestisci caso in cui colonne JSONB potrebbero non esistere ancora
        setSettings({
          notifications:
            (typedData.notifications as NotificationSettings | null) || DEFAULT_NOTIFICATIONS,
          privacy: (typedData.privacy as PrivacySettings | null) || DEFAULT_PRIVACY,
          account: (typedData.account as AccountSettings | null) || DEFAULT_ACCOUNT,
          two_factor_enabled: typedData.two_factor_enabled ?? false,
          two_factor_secret: typedData.two_factor_secret ?? null,
          two_factor_backup_codes: typedData.two_factor_backup_codes ?? null,
          two_factor_enabled_at: typedData.two_factor_enabled_at ?? null,
        })
      } else {
        // Fallback: usa valori default se non ci sono dati
        setSettings({
          notifications: DEFAULT_NOTIFICATIONS,
          privacy: DEFAULT_PRIVACY,
          account: DEFAULT_ACCOUNT,
          two_factor_enabled: false,
          two_factor_secret: null,
          two_factor_backup_codes: null,
          two_factor_enabled_at: null,
        })
      }
    } catch (err) {
      logger.error('Errore caricamento impostazioni', err)
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }, [supabase])

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

        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('user_settings') as any).upsert(
          {
            user_id: authUser.id,
            notifications,
          },
          {
            onConflict: 'user_id',
          },
        )

        if (updateError) {
          // Se errore 42703 (colonna non esiste), la migration deve essere eseguita
          if (updateError.code === '42703') {
            throw new Error(
              'Colonna notifications non esiste. Eseguire la migration 20250130_create_user_settings.sql',
            )
          }
          throw updateError
        }

        // Aggiorna stato locale
        setSettings((prev) => (prev ? { ...prev, notifications } : null))
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [supabase],
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

        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('user_settings') as any).upsert(
          {
            user_id: authUser.id,
            privacy,
          },
          {
            onConflict: 'user_id',
          },
        )

        if (updateError) {
          // Se errore 42703 (colonna non esiste), la migration deve essere eseguita
          if (updateError.code === '42703') {
            throw new Error(
              'Colonna privacy non esiste. Eseguire la migration 20250130_create_user_settings.sql',
            )
          }
          throw updateError
        }

        // Aggiorna stato locale
        setSettings((prev) => (prev ? { ...prev, privacy } : null))
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [supabase],
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

        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('user_settings') as any).upsert(
          {
            user_id: authUser.id,
            account,
          },
          {
            onConflict: 'user_id',
          },
        )

        if (updateError) {
          // Se errore 42703 (colonna non esiste), la migration deve essere eseguita
          if (updateError.code === '42703') {
            throw new Error(
              'Colonna account non esiste. Eseguire la migration 20250130_create_user_settings.sql',
            )
          }
          throw updateError
        }

        // Aggiorna stato locale
        setSettings((prev) => (prev ? { ...prev, account } : null))
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        logger.error('Errore salvataggio account', err)
        return { success: false, error: errorMessage }
      }
    },
    [supabase],
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

        // Workaround necessario per inferenza tipo Supabase
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
          // Se errore 42703 (colonna non esiste), la migration deve essere eseguita
          if (updateError.code === '42703') {
            throw new Error(
              'Colonne 2FA non esistono. Eseguire la migration 20250130_create_user_settings.sql',
            )
          }
          throw updateError
        }

        // Aggiorna stato locale
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                two_factor_enabled: enabled,
                two_factor_secret: secret || null,
                two_factor_backup_codes: backupCodes || null,
                two_factor_enabled_at: enabled ? new Date().toISOString() : null,
              }
            : null,
        )
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [supabase],
  )

  // Carica impostazioni al mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveNotifications,
    savePrivacy,
    saveAccount,
    saveTwoFactor,
  }
}
