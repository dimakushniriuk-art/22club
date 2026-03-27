'use client'

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@/components/ui'
import { Bell, Shield, Globe, UserCircle, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { TablesUpdate } from '@/lib/supabase/types'
import { useNotify } from '@/lib/ui/notify'
import {
  useUserSettings,
  type NotificationSettings,
  type PrivacySettings,
  type AccountSettings,
} from '@/hooks/use-user-settings'
import { useSettingsProfile } from '@/hooks/use-settings-profile'
import { useImpostazioniPageGuard } from '@/hooks/use-impostazioni-page-guard'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'

const logger = createLogger('ImpostazioniPage')

const TAB_TRIGGER_CLASS =
  'w-full h-full min-h-0 min-w-0 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=inactive]:text-text-tertiary hover:text-text-secondary'

const DEFAULT_NOTIFICATIONS = {
  email: true,
  push: true,
  sms: false,
  newClients: true,
  payments: true,
  appointments: true,
  messages: true,
} as const

const DEFAULT_PRIVACY = {
  profileVisible: true,
  showEmail: true,
  showPhone: false,
  analytics: true,
} as const

const DEFAULT_ACCOUNT = {
  language: 'it',
  timezone: 'Europe/Rome',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
} as const

const IMPOSTAZIONI_TABS = [
  'profilo',
  'notifiche',
  'privacy',
  'account',
  'profilo-professionale',
] as const
type ImpostazioniTabValue = (typeof IMPOSTAZIONI_TABS)[number]
type SaveErrorType = 'profile' | 'notifications' | 'privacy' | 'account'

function isImpostazioniTab(t: string | null): t is ImpostazioniTabValue {
  return t !== null && IMPOSTAZIONI_TABS.includes(t as ImpostazioniTabValue)
}

// Lazy load dei tab delle impostazioni
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
const SettingsTrainerProfileTab = lazy(() =>
  import('@/components/settings/settings-trainer-profile-tab').then((mod) => ({
    default: mod.SettingsTrainerProfileTab,
  })),
)

export default function ImpostazioniPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const { notify } = useNotify()
  const { user: authUser, loading: authLoading } = useAuth()
  const { showLoader: showGuardLoader } = useImpostazioniPageGuard()
  const { settings, loadSettings, saveNotifications, savePrivacy, saveAccount, saveTwoFactor } =
    useUserSettings()

  const [notifications, setNotifications] = useState<NotificationSettings>({
    ...DEFAULT_NOTIFICATIONS,
  })
  const [privacy, setPrivacy] = useState<PrivacySettings>({ ...DEFAULT_PRIVACY })
  const [account, setAccount] = useState<AccountSettings>({ ...DEFAULT_ACCOUNT })

  const [activeTab, setActiveTab] = useState<ImpostazioniTabValue>(() => {
    const t = searchParams.get('tab')
    return isImpostazioniTab(t) ? t : 'profilo'
  })

  useEffect(() => {
    const t = searchParams.get('tab')
    if (isImpostazioniTab(t)) setActiveTab(t)
  }, [searchParams])

  // Carica impostazioni quando l'utente è disponibile
  useEffect(() => {
    if (authUser?.id) loadSettings(authUser.id)
  }, [authUser?.id, loadSettings])

  // Sincronizza stato locale quando settings è disponibile
  useEffect(() => {
    if (settings) {
      setNotifications(settings.notifications)
      setPrivacy(settings.privacy)
      setAccount(settings.account)
    }
  }, [settings])

  // Stato password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

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

  const handleConfirmUnsavedAndSwitch = useCallback(() => {
    if (pendingTabChange === null) return
    const tab = isImpostazioniTab(pendingTabChange) ? pendingTabChange : 'profilo'
    if (activeTab === 'profilo') setProfileDirty(false)
    if (activeTab === 'notifiche') setNotificationsDirty(false)
    if (activeTab === 'privacy') setPrivacyDirty(false)
    if (activeTab === 'account') setAccountDirty(false)
    setActiveTab(tab)
    const url = tab === 'profilo' ? '/dashboard/impostazioni' : `/dashboard/impostazioni?tab=${tab}`
    router.replace(url, { scroll: false })
    setShowConfirmUnsaved(false)
    setPendingTabChange(null)
  }, [activeTab, pendingTabChange, router])

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = isImpostazioniTab(value) ? value : 'profilo'
      if (tab === activeTab) return
      if (isCurrentTabDirty()) {
        setPendingTabChange(tab)
        setShowConfirmUnsaved(true)
        return
      }
      setActiveTab(tab)
      const url =
        tab === 'profilo' ? '/dashboard/impostazioni' : `/dashboard/impostazioni?tab=${tab}`
      router.replace(url, { scroll: false })
    },
    [router, activeTab, isCurrentTabDirty],
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
  const handleNotificationsChange = useCallback((updates: Partial<typeof notifications>) => {
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
    return null
  }

  return (
    <StaffContentLayout
      title="Impostazioni"
      description="Gestisci le tue preferenze e configurazioni account"
      theme="teal"
      className="max-w-[1200px]"
    >
      {/* Banner errore salvataggio con Riprova */}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]">
          <div className="relative p-1.5">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-transparent gap-1 items-stretch justify-items-stretch h-10 p-0">
              <TabsTrigger value="profilo" variant="default" className={TAB_TRIGGER_CLASS}>
                <UserCircle className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Profilo</span>
              </TabsTrigger>
              <TabsTrigger value="notifiche" variant="default" className={TAB_TRIGGER_CLASS}>
                <Bell className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Notifiche</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" variant="default" className={TAB_TRIGGER_CLASS}>
                <Shield className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="account" variant="default" className={TAB_TRIGGER_CLASS}>
                <Globe className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger
                value="profilo-professionale"
                variant="default"
                className={TAB_TRIGGER_CLASS}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline truncate max-w-full">Profilo professionale</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab: Profilo */}
        <TabsContent value="profilo" className="mt-6 space-y-6">
          <Suspense fallback={null}>
            <SettingsProfileTab
              profile={profile}
              profileLoading={profileLoading}
              loading={loading}
              onProfileChange={handleProfileChange}
              onSaveProfile={handleSaveProfile}
            />
          </Suspense>
        </TabsContent>

        {/* Tab: Notifiche */}
        <TabsContent value="notifiche" className="mt-6 space-y-6">
          <Suspense fallback={null}>
            <SettingsNotificationsTab
              notifications={notifications}
              loading={loading}
              onNotificationChange={handleNotificationChange}
              onNotificationsChange={handleNotificationsChange}
              onSave={handleSaveNotifications}
            />
          </Suspense>
        </TabsContent>

        {/* Tab: Privacy */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Suspense fallback={null}>
            <SettingsPrivacyTab
              privacy={privacy}
              loading={loading}
              onPrivacyChange={handlePrivacyChange}
              onSave={handleSavePrivacy}
            />
          </Suspense>
        </TabsContent>

        {/* Tab: Profilo professionale (trainer) */}
        <TabsContent value="profilo-professionale" className="mt-6 space-y-6">
          <Suspense fallback={null}>
            <SettingsTrainerProfileTab />
          </Suspense>
        </TabsContent>

        {/* Tab: Account */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Suspense fallback={null}>
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

      {/* Conferma uscita con modifiche non salvate */}
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

      {/* Conferma disabilitazione 2FA */}
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
