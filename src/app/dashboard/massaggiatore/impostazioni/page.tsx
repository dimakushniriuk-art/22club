'use client'

import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@/components/ui'
import { Bell, Shield, Globe, UserCircle, Settings } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { TablesUpdate } from '@/lib/supabase/types'
import { useNotify } from '@/lib/ui/notify'
import {
  useUserSettings,
  type NotificationSettings,
  type PrivacySettings,
  type AccountSettings,
} from '@/hooks/use-user-settings'
import { useSettingsProfile } from '@/hooks/use-settings-profile'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { Skeleton } from '@/components/ui'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'

const logger = createLogger('app:dashboard:massaggiatore:impostazioni')

const BASE_PATH = '/dashboard/massaggiatore/impostazioni'

const MASSAGGIATORE_TABS = ['profilo', 'notifiche', 'privacy', 'account'] as const
type MassaggiatoreImpostazioniTab = (typeof MASSAGGIATORE_TABS)[number]
type SaveErrorType = 'profile' | 'notifications' | 'privacy' | 'account'

function isMassaggiatoreImpostazioniTab(t: string | null): t is MassaggiatoreImpostazioniTab {
  return t !== null && MASSAGGIATORE_TABS.includes(t as MassaggiatoreImpostazioniTab)
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

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

function SettingsTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/20 bg-background-secondary/50 p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-3/4 max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

const SettingsProfileTab = lazy(() =>
  import('@/components/settings/settings-profile-tab').then((mod) => ({
    default: mod.SettingsProfileTab,
  })),
)
const SettingsNotificationsTab = lazy(() =>
  import('@/components/settings/settings-notifications-tab').then((mod) => ({
    default: mod.SettingsNotificationsTab,
  })),
)
const SettingsPrivacyTab = lazy(() =>
  import('@/components/settings/settings-privacy-tab').then((mod) => ({
    default: mod.SettingsPrivacyTab,
  })),
)
const SettingsAccountTab = lazy(() =>
  import('@/components/settings/settings-account-tab').then((mod) => ({
    default: mod.SettingsAccountTab,
  })),
)

export default function MassaggiatoreImpostazioniPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()
  const { notify } = useNotify()
  const { user: authUser, loading: authLoading } = useAuth()
  const { showLoader: showGuardLoader } = useStaffDashboardGuard('massaggiatore')
  const { settings, loadSettings, saveNotifications, savePrivacy, saveAccount, saveTwoFactor } =
    useUserSettings()

  const [notifications, setNotifications] = useState<NotificationSettings>({
    ...DEFAULT_NOTIFICATIONS,
  })
  const [privacy, setPrivacy] = useState<PrivacySettings>({ ...DEFAULT_PRIVACY })
  const [account, setAccount] = useState<AccountSettings>({ ...DEFAULT_ACCOUNT })
  const [activeTab, setActiveTab] = useState<MassaggiatoreImpostazioniTab>(() => {
    const t = searchParams.get('tab')
    return isMassaggiatoreImpostazioniTab(t) ? t : 'profilo'
  })

  useEffect(() => {
    const t = searchParams.get('tab')
    if (isMassaggiatoreImpostazioniTab(t)) setActiveTab(t)
  }, [searchParams])

  useEffect(() => {
    if (authUser?.id) loadSettings(authUser.id)
  }, [authUser?.id, loadSettings])

  useEffect(() => {
    if (settings) {
      setNotifications(settings.notifications)
      setPrivacy(settings.privacy)
      setAccount(settings.account)
    }
  }, [settings])

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [profileDirty, setProfileDirty] = useState(false)
  const [notificationsDirty, setNotificationsDirty] = useState(false)
  const [privacyDirty, setPrivacyDirty] = useState(false)
  const [accountDirty, setAccountDirty] = useState(false)
  const [showConfirmUnsaved, setShowConfirmUnsaved] = useState(false)
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)
  const [lastSaveError, setLastSaveError] = useState<{
    message: string
    type: SaveErrorType
  } | null>(null)

  const isCurrentTabDirty = useCallback(() => {
    if (activeTab === 'profilo') return profileDirty
    if (activeTab === 'notifiche') return notificationsDirty
    if (activeTab === 'privacy') return privacyDirty
    if (activeTab === 'account') return accountDirty
    return false
  }, [activeTab, profileDirty, notificationsDirty, privacyDirty, accountDirty])

  const buildUrl = useCallback((tab: MassaggiatoreImpostazioniTab) => {
    return tab === 'profilo' ? BASE_PATH : `${BASE_PATH}?tab=${tab}`
  }, [])

  const handleConfirmUnsavedAndSwitch = useCallback(() => {
    if (pendingTabChange === null) return
    const tab = isMassaggiatoreImpostazioniTab(pendingTabChange) ? pendingTabChange : 'profilo'
    if (activeTab === 'profilo') setProfileDirty(false)
    if (activeTab === 'notifiche') setNotificationsDirty(false)
    if (activeTab === 'privacy') setPrivacyDirty(false)
    if (activeTab === 'account') setAccountDirty(false)
    setActiveTab(tab)
    router.replace(buildUrl(tab), { scroll: false })
    setShowConfirmUnsaved(false)
    setPendingTabChange(null)
  }, [activeTab, pendingTabChange, router, buildUrl])

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = isMassaggiatoreImpostazioniTab(value) ? value : 'profilo'
      if (tab === activeTab) return
      if (isCurrentTabDirty()) {
        setPendingTabChange(tab)
        setShowConfirmUnsaved(true)
        return
      }
      setActiveTab(tab)
      router.replace(buildUrl(tab), { scroll: false })
    },
    [router, activeTab, isCurrentTabDirty, buildUrl],
  )

  const { profile, profileLoading, setProfile } = useSettingsProfile(authUser, authLoading)

  const handleSaveProfile = useCallback(async () => {
    if (!profile.id) {
      notify('Profilo non trovato', 'error', 'Errore')
      return
    }
    const emailTrimmed = profile.email?.trim() ?? ''
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      notify('Inserisci un indirizzo email valido.', 'error', 'Email non valida')
      return
    }
    const phoneTrimmed = profile.phone?.trim() ?? ''
    if (phoneTrimmed && !/^[\d\s+()-]{6,20}$/.test(phoneTrimmed)) {
      notify(
        'Inserisci un numero di telefono valido (6-20 caratteri).',
        'error',
        'Telefono non valido',
      )
      return
    }
    setLoading(true)
    setLastSaveError(null)
    try {
      const payload: TablesUpdate<'profiles'> = {
        nome: profile.nome,
        cognome: profile.cognome,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('profiles').update(payload).eq('id', profile.id)
      if (error) throw error
      setProfileDirty(false)
      notify('Profilo aggiornato con successo', 'success', 'Successo')
    } catch (error) {
      logger.error('Errore nel salvare il profilo', error)
      const msg = error instanceof Error ? error.message : 'Errore nel salvare il profilo'
      notify(msg, 'error', 'Errore')
      setLastSaveError({ message: msg, type: 'profile' })
    } finally {
      setLoading(false)
    }
  }, [supabase, profile, notify])

  const handleSaveNotifications = useCallback(async () => {
    setLoading(true)
    setLastSaveError(null)
    try {
      const result = await saveNotifications(notifications)
      if (result.success) {
        setNotificationsDirty(false)
        notify('Impostazioni notifiche salvate con successo', 'success', 'Successo')
      } else throw new Error(result.error || 'Errore nel salvare le notifiche')
    } catch (error) {
      logger.error('Errore nel salvare le notifiche', error)
      const msg = error instanceof Error ? error.message : 'Errore nel salvare le notifiche'
      notify(msg, 'error', 'Errore')
      setLastSaveError({ message: msg, type: 'notifications' })
    } finally {
      setLoading(false)
    }
  }, [notifications, saveNotifications, notify])

  const handleSavePrivacy = useCallback(async () => {
    setLoading(true)
    setLastSaveError(null)
    try {
      const result = await savePrivacy(privacy)
      if (result.success) {
        setPrivacyDirty(false)
        notify('Impostazioni privacy salvate con successo', 'success', 'Successo')
      } else throw new Error(result.error || 'Errore nel salvare la privacy')
    } catch (error) {
      logger.error('Errore nel salvare la privacy', error)
      const msg = error instanceof Error ? error.message : 'Errore nel salvare la privacy'
      notify(msg, 'error', 'Errore')
      setLastSaveError({ message: msg, type: 'privacy' })
    } finally {
      setLoading(false)
    }
  }, [privacy, savePrivacy, notify])

  const handleSaveAccount = useCallback(async () => {
    setLoading(true)
    setLastSaveError(null)
    try {
      const result = await saveAccount(account)
      if (result.success) {
        setAccountDirty(false)
        notify('Impostazioni account salvate con successo', 'success', 'Successo')
      } else throw new Error(result.error || 'Errore nel salvare le impostazioni account')
    } catch (error) {
      logger.error('Errore nel salvare le impostazioni account', error)
      const msg =
        error instanceof Error ? error.message : 'Errore nel salvare le impostazioni account'
      notify(msg, 'error', 'Errore')
      setLastSaveError({ message: msg, type: 'account' })
    } finally {
      setLoading(false)
    }
  }, [account, saveAccount, notify])

  const handleChangePassword = useCallback(async () => {
    if (passwords.new !== passwords.confirm) {
      notify(
        'Le password inserite non corrispondono. Verifica e riprova.',
        'warning',
        'Password non corrispondenti',
      )
      return
    }
    if (passwords.new.length < 8) {
      notify(
        'La password deve essere di almeno 8 caratteri per motivi di sicurezza.',
        'warning',
        'Password troppo corta',
      )
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new })
      if (error) throw error
      notify('La password è stata aggiornata con successo.', 'success', 'Password aggiornata')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      logger.error('Errore nel cambiare la password', error)
      notify(
        `Errore durante l'aggiornamento della password: ${error instanceof Error ? error.message : 'Errore'}`,
        'error',
        'Errore password',
      )
    } finally {
      setLoading(false)
    }
  }, [passwords, supabase, notify])

  const handleConfirmDisableTwoFactor = useCallback(async () => {
    setLoading(true)
    setShowDisable2FADialog(false)
    try {
      const result = await saveTwoFactor(false)
      if (result.success) notify('2FA disabilitato con successo', 'success', 'Successo')
      else throw new Error(result.error || 'Errore nel disabilitare 2FA')
    } catch (error) {
      logger.error('Errore nel disabilitare 2FA', error)
      notify(
        error instanceof Error ? error.message : 'Errore nel disabilitare 2FA',
        'error',
        'Errore',
      )
    } finally {
      setLoading(false)
    }
  }, [saveTwoFactor, notify])

  const handleDisableTwoFactor = useCallback(async () => {
    setShowDisable2FADialog(true)
  }, [])

  const handleProfileChange = useCallback(
    (field: string, value: unknown) => {
      setProfile((prev) => ({ ...prev, [field]: value }))
      setProfileDirty(true)
    },
    [setProfile],
  )
  const handleNotificationChange = useCallback((field: string, value: unknown) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
    setNotificationsDirty(true)
  }, [])
  const handleNotificationsChange = useCallback((updates: Partial<NotificationSettings>) => {
    setNotifications((prev) => ({ ...prev, ...updates }))
    setNotificationsDirty(true)
  }, [])
  const handlePrivacyChange = useCallback((field: string, value: unknown) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }))
    setPrivacyDirty(true)
  }, [])
  const handleAccountChange = useCallback((field: string, value: unknown) => {
    setAccount((prev) => ({ ...prev, [field]: value }))
    setAccountDirty(true)
  }, [])
  const handlePasswordChange = useCallback((field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))
  }, [])
  const handleTogglePasswordVisibility = useCallback((field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setShowCurrentPassword((p) => !p)
    if (field === 'new') setShowNewPassword((p) => !p)
    if (field === 'confirm') setShowConfirmPassword((p) => !p)
  }, [])
  const noop = useCallback(() => {}, [])

  const handleRetrySave = useCallback(() => {
    if (!lastSaveError) return
    const { type } = lastSaveError
    setLastSaveError(null)
    if (type === 'profile') handleSaveProfile()
    else if (type === 'notifications') handleSaveNotifications()
    else if (type === 'privacy') handleSavePrivacy()
    else if (type === 'account') handleSaveAccount()
  }, [
    lastSaveError,
    handleSaveProfile,
    handleSaveNotifications,
    handleSavePrivacy,
    handleSaveAccount,
  ])

  if (showGuardLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Impostazioni"
      description="Gestisci le tue preferenze e configurazioni account"
      icon={<Settings className="h-6 w-6 sm:h-7 sm:w-7" />}
      theme="amber"
    >
      <div className="space-y-4 sm:space-y-6">
        {lastSaveError && (
          <div
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            role="alert"
          >
            <p className="text-red-400 text-sm">{lastSaveError.message}</p>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLastSaveError(null)}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Chiudi
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleRetrySave}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Riprova
              </Button>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full space-y-4 sm:space-y-6"
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10">
            <div className="relative p-1.5">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent gap-2">
                <TabsTrigger
                  value="profilo"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:!bg-amber-600 data-[state=active]:!text-white data-[state=active]:shadow-amber-500/30 data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <UserCircle className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Profilo</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifiche"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:!bg-amber-600 data-[state=active]:!text-white data-[state=active]:shadow-amber-500/30 data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <Bell className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Notifiche</span>
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:!bg-amber-600 data-[state=active]:!text-white data-[state=active]:shadow-amber-500/30 data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:!bg-amber-600 data-[state=active]:!text-white data-[state=active]:shadow-amber-500/30 data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="profilo" className="mt-0 space-y-6">
            <Suspense fallback={<SettingsTabSkeleton />}>
              <SettingsProfileTab
                profile={profile}
                profileLoading={profileLoading}
                loading={loading}
                onProfileChange={handleProfileChange}
                onSaveProfile={handleSaveProfile}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="notifiche" className="mt-0 space-y-6">
            <Suspense fallback={<SettingsTabSkeleton />}>
              <SettingsNotificationsTab
                notifications={notifications}
                loading={loading}
                onNotificationChange={handleNotificationChange}
                onNotificationsChange={handleNotificationsChange}
                onSave={handleSaveNotifications}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="privacy" className="mt-0 space-y-6">
            <Suspense fallback={<SettingsTabSkeleton />}>
              <SettingsPrivacyTab
                privacy={privacy}
                loading={loading}
                onPrivacyChange={handlePrivacyChange}
                onSave={handleSavePrivacy}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="account" className="mt-0 space-y-6">
            <Suspense fallback={<SettingsTabSkeleton />}>
              <SettingsAccountTab
                account={account}
                loading={loading}
                passwords={passwords}
                showCurrentPassword={showCurrentPassword}
                showNewPassword={showNewPassword}
                showConfirmPassword={showConfirmPassword}
                twoFactorEnabled={settings?.two_factor_enabled ?? false}
                onAccountChange={handleAccountChange}
                onPasswordChange={handlePasswordChange}
                onTogglePasswordVisibility={handleTogglePasswordVisibility}
                onSave={handleSaveAccount}
                onChangePassword={handleChangePassword}
                onTwoFactorSetup={noop}
                onDisableTwoFactor={handleDisableTwoFactor}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={showConfirmUnsaved}
        onOpenChange={(open) => {
          if (!open) setPendingTabChange(null)
          setShowConfirmUnsaved(open)
        }}
        title="Modifiche non salvate"
        description="Hai modifiche non salvate. Uscendo le perderai. Vuoi uscire?"
        confirmText="Esci"
        cancelText="Annulla"
        variant="default"
        onConfirm={handleConfirmUnsavedAndSwitch}
      />

      <ConfirmDialog
        open={showDisable2FADialog}
        onOpenChange={setShowDisable2FADialog}
        title="Disabilita autenticazione a due fattori"
        description="Sei sicuro di voler disabilitare 2FA? Il tuo account sarà meno sicuro."
        confirmText="Disabilita 2FA"
        cancelText="Annulla"
        variant="destructive"
        onConfirm={handleConfirmDisableTwoFactor}
        loading={loading}
      />
    </StaffContentLayout>
  )
}
