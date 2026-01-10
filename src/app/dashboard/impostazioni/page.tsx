'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { Bell, Shield, Globe, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useUserSettings } from '@/hooks/use-user-settings'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'

const logger = createLogger('ImpostazioniPage')
import {
  SettingsProfileTab,
  SettingsNotificationsTab,
  SettingsPrivacyTab,
  SettingsAccountTab,
} from '@/components/settings'

export default function ImpostazioniPage() {
  const supabase = createClient()
  const { addToast } = useToast()
  const { user: authUser, loading: authLoading } = useAuth()
  const {
    settings,
    // Nota: settingsLoading potrebbe essere usato in futuro per loading states
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loading: settingsLoading,
    saveNotifications,
    savePrivacy,
    saveAccount,
    saveTwoFactor,
  } = useUserSettings()

  // Stato notifiche (inizializzato da settings o default)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newClients: true,
    payments: true,
    appointments: true,
    messages: true,
  })

  // Stato privacy (inizializzato da settings o default)
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: true,
    showPhone: false,
    analytics: true,
  })

  // Stato account (inizializzato da settings o default)
  const [account, setAccount] = useState({
    language: 'it',
    timezone: 'Europe/Rome',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  })

  // Carica impostazioni da database quando disponibili
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
  const [profileLoading, setProfileLoading] = useState(true)

  // Stato profilo utente
  const [profile, setProfile] = useState({
    id: '',
    nome: '',
    cognome: '',
    email: '',
    phone: '',
    avatar: null as string | null,
    avatar_url: null as string | null,
  })

  // Carica profilo utente
  useEffect(() => {
    const loadProfile = async () => {
      // Aspetta che authProvider finisca di caricare
      if (authLoading) {
        return
      }

      try {
        setProfileLoading(true)

        // Usa user da useAuth se disponibile, ma dobbiamo comunque fare query per phone
        // perché UserProfile non include phone
        if (authUser) {
          // Usa i dati base da authUser (più veloce)
          const baseProfile = {
            id: authUser.id || '',
            nome: authUser.nome || authUser.first_name || '',
            cognome: authUser.cognome || authUser.last_name || '',
            email: authUser.email || '',
            phone: '', // Sarà caricato dalla query
            avatar: authUser.avatar || null,
            avatar_url: authUser.avatar_url || null,
          }

          // Query solo per phone (campo mancante in UserProfile)
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', authUser.id)
            .single()

          if (!error && profileData) {
            baseProfile.phone = (profileData as { phone?: string | null }).phone || ''
          }

          setProfile(baseProfile)
          setProfileLoading(false)
          return
        }

        // Fallback: query diretta se authUser non disponibile
        const {
          data: { user: authUserFromSession },
        } = await supabase.auth.getUser()

        if (!authUserFromSession) {
          setProfileLoading(false)
          return
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email, phone, avatar, avatar_url')
          .eq('user_id', authUserFromSession.id)
          .single()

        if (error) {
          // Log dettagliato dell'errore
          const errorDetails = {
            message: error.message,
            code: (error as { code?: string }).code,
            details: (error as { details?: string }).details,
            hint: (error as { hint?: string }).hint,
            userId: authUserFromSession.id,
          }
          logger.error('Errore query profilo', error, errorDetails)
          throw error
        }

        if (profileData) {
          type ProfileRow = {
            id: string
            nome: string | null
            cognome: string | null
            email: string | null
            phone: string | null
            avatar: string | null
            avatar_url: string | null
          }
          const typedProfile = profileData as ProfileRow
          setProfile({
            id: typedProfile.id,
            nome: typedProfile.nome || '',
            cognome: typedProfile.cognome || '',
            email: typedProfile.email || authUserFromSession.email || '',
            phone: typedProfile.phone || '',
            avatar: typedProfile.avatar || null,
            avatar_url: typedProfile.avatar_url || null,
          })
        }
      } catch (error) {
        // Log dettagliato per debug
        const errorObj = error as { message?: string; code?: string; details?: string }
        logger.error('Errore caricamento profilo', error, {
          message: errorObj.message,
          code: errorObj.code,
          details: errorObj.details,
          authUserAvailable: !!authUser,
          authLoading,
        })
        addToast({
          title: 'Errore',
          message: errorObj.message || 'Errore nel caricamento del profilo',
          variant: 'error',
        })
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [supabase, addToast, authUser, authLoading])

  const handleSaveProfile = async () => {
    if (!profile.id) {
      addToast({
        title: 'Errore',
        message: 'Profilo non trovato',
        variant: 'error',
      })
      return
    }

    setLoading(true)
    try {
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any)
        .update({
          nome: profile.nome,
          cognome: profile.cognome,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      addToast({
        title: 'Successo',
        message: 'Profilo aggiornato con successo',
        variant: 'success',
      })
    } catch (error) {
      logger.error('Errore nel salvare il profilo', error)
      addToast({
        title: 'Errore',
        message: error instanceof Error ? error.message : 'Errore nel salvare il profilo',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      const result = await saveNotifications(notifications)
      if (result.success) {
        addToast({
          title: 'Successo',
          message: 'Impostazioni notifiche salvate con successo',
          variant: 'success',
        })
      } else {
        throw new Error(result.error || 'Errore nel salvare le notifiche')
      }
    } catch (error) {
      logger.error('Errore nel salvare le notifiche', error)
      addToast({
        title: 'Errore',
        message: error instanceof Error ? error.message : 'Errore nel salvare le notifiche',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    setLoading(true)
    try {
      const result = await savePrivacy(privacy)
      if (result.success) {
        addToast({
          title: 'Successo',
          message: 'Impostazioni privacy salvate con successo',
          variant: 'success',
        })
      } else {
        throw new Error(result.error || 'Errore nel salvare la privacy')
      }
    } catch (error) {
      logger.error('Errore nel salvare la privacy', error)
      addToast({
        title: 'Errore',
        message: error instanceof Error ? error.message : 'Errore nel salvare la privacy',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAccount = async () => {
    setLoading(true)
    try {
      const result = await saveAccount(account)
      if (result.success) {
        addToast({
          title: 'Successo',
          message: 'Impostazioni account salvate con successo',
          variant: 'success',
        })
      } else {
        throw new Error(result.error || 'Errore nel salvare le impostazioni account')
      }
    } catch (error) {
      logger.error('Errore nel salvare le impostazioni account', error)
      addToast({
        title: 'Errore',
        message:
          error instanceof Error ? error.message : 'Errore nel salvare le impostazioni account',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('Le password non corrispondono')
      return
    }

    if (passwords.new.length < 8) {
      alert('La password deve essere di almeno 8 caratteri')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      })

      if (error) throw error

      alert('Password aggiornata con successo')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      logger.error('Errore nel cambiare la password', error)
      const message =
        error instanceof Error ? error.message : 'Errore durante la modifica della password'
      alert(`Errore nel cambiare la password: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    if (!confirm('Sei sicuro di voler disabilitare 2FA? Il tuo account sarà meno sicuro.')) {
      return
    }

    setLoading(true)
    try {
      const result = await saveTwoFactor(false)
      if (result.success) {
        addToast({
          title: 'Successo',
          message: '2FA disabilitato con successo',
          variant: 'success',
        })
      } else {
        throw new Error(result.error || 'Errore nel disabilitare 2FA')
      }
    } catch (error) {
      logger.error('Errore nel disabilitare 2FA', error)
      addToast({
        title: 'Errore',
        message: error instanceof Error ? error.message : 'Errore nel disabilitare 2FA',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-cyan-500/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1200px] mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-text-primary text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Impostazioni
          </h1>
          <p className="text-text-secondary text-base sm:text-lg">
            Gestisci le tue preferenze e configurazioni account
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profilo" className="w-full">
          <div className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
            <div className="relative p-1.5">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent gap-1">
                <TabsTrigger
                  value="profilo"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-md data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <UserCircle className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Profilo</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifiche"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-md data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <Bell className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Notifiche</span>
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-md data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  variant="default"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-md data-[state=inactive]:text-text-tertiary hover:text-text-secondary"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab: Profilo */}
          <TabsContent value="profilo" className="mt-6 space-y-6">
            <SettingsProfileTab
              profile={profile}
              profileLoading={profileLoading}
              loading={loading}
              onProfileChange={(field, value) =>
                setProfile((prev) => ({ ...prev, [field]: value }))
              }
              onSaveProfile={handleSaveProfile}
            />
          </TabsContent>

          {/* Tab: Notifiche */}
          <TabsContent value="notifiche" className="mt-6 space-y-6">
            <SettingsNotificationsTab
              notifications={notifications}
              loading={loading}
              onNotificationChange={(field, value) => {
                setNotifications((prev) => ({ ...prev, [field]: value }))
              }}
              onNotificationsChange={(updates) => {
                setNotifications((prev) => ({ ...prev, ...updates }))
              }}
              onSave={handleSaveNotifications}
            />
          </TabsContent>

          {/* Tab: Privacy */}
          <TabsContent value="privacy" className="mt-6 space-y-6">
            <SettingsPrivacyTab
              privacy={privacy}
              loading={loading}
              onPrivacyChange={(field, value) =>
                setPrivacy((prev) => ({ ...prev, [field]: value }))
              }
              onSave={handleSavePrivacy}
            />
          </TabsContent>

          {/* Tab: Account */}
          <TabsContent value="account" className="mt-6 space-y-6">
            <SettingsAccountTab
              account={account}
              loading={loading}
              passwords={passwords}
              showCurrentPassword={showCurrentPassword}
              showNewPassword={showNewPassword}
              showConfirmPassword={showConfirmPassword}
              twoFactorEnabled={settings?.two_factor_enabled ?? false}
              onAccountChange={(field, value) =>
                setAccount((prev) => ({ ...prev, [field]: value }))
              }
              onPasswordChange={(field, value) =>
                setPasswords((prev) => ({ ...prev, [field]: value }))
              }
              onTogglePasswordVisibility={(field) => {
                if (field === 'current') setShowCurrentPassword(!showCurrentPassword)
                if (field === 'new') setShowNewPassword(!showNewPassword)
                if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword)
              }}
              onSave={handleSaveAccount}
              onChangePassword={handleChangePassword}
              onTwoFactorSetup={() => {
                // Il drawer si apre automaticamente quando lo switch viene attivato
              }}
              onDisableTwoFactor={handleDisableTwoFactor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
