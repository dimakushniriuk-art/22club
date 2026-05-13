import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type {
  AccountSettings,
  NotificationSettings,
  PrivacySettings,
  UserSettings,
} from '@/hooks/use-user-settings'

const logger = createLogger('lib:user-settings:fetch-user-settings')

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

type UserSettingsRow = {
  notification_settings?: NotificationSettings | null
  privacy_settings?: PrivacySettings | null
  account_settings?: AccountSettings | null
  two_factor_enabled?: boolean | null
  two_factor_secret?: string | null
  two_factor_backup_codes?: string[] | null
  two_factor_enabled_at?: string | null
}

function mapUserSettingsRow(row: UserSettingsRow | null | undefined): UserSettings {
  if (!row) {
    return {
      notifications: DEFAULT_NOTIFICATIONS,
      privacy: DEFAULT_PRIVACY,
      account: DEFAULT_ACCOUNT,
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: null,
      two_factor_enabled_at: null,
    }
  }

  return {
    notifications: row.notification_settings ?? DEFAULT_NOTIFICATIONS,
    privacy: row.privacy_settings ?? DEFAULT_PRIVACY,
    account: row.account_settings ?? DEFAULT_ACCOUNT,
    two_factor_enabled: row.two_factor_enabled ?? false,
    two_factor_secret: row.two_factor_secret ?? null,
    two_factor_backup_codes: row.two_factor_backup_codes ?? null,
    two_factor_enabled_at: row.two_factor_enabled_at ?? null,
  }
}

export async function fetchUserSettings(authUserId?: string | null): Promise<UserSettings> {
  let targetUserId = authUserId ?? undefined
  if (!targetUserId) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    targetUserId = authUser?.id
  }

  if (!targetUserId) {
    throw new Error('Utente non autenticato')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error: rpcError } = await (supabase.rpc as any)('get_or_create_user_settings', {
    p_user_id: targetUserId,
  })

  if (!rpcError) {
    return mapUserSettingsRow(data as UserSettingsRow)
  }

  const queryResult = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  let settingsData = queryResult.data
  const queryError = queryResult.error

  if (queryError) {
    if (queryError.code === 'PGRST116' || queryError.code === '42703') {
      const { data: newSettings, error: insertError } =
        await // eslint-disable-next-line @typescript-eslint/no-explicit-any -- fallback insert quando RPC non disponibile
        (supabase.from('user_settings') as any).insert({ user_id: targetUserId }).select().single()

      if (insertError) {
        logger.warn('Errore inserimento user_settings, usando valori default', insertError)
        return mapUserSettingsRow(null)
      }
      settingsData = newSettings
    } else {
      throw queryError
    }
  }

  return mapUserSettingsRow(settingsData as UserSettingsRow)
}
