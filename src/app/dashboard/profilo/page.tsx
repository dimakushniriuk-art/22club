'use client'

import { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('ProfiloPage')
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { LoadingState } from '@/components/dashboard/loading-state'
import { usePTProfile } from '@/hooks/use-pt-profile'
import { usePTSettings } from '@/hooks/use-pt-settings'
import { mockNotifications } from '@/data/mock-profile-data'
import { User, Bell, Shield, Check } from 'lucide-react'

// Lazy load dei componenti tab per migliorare performance iniziale
const PTProfileTab = lazy(() =>
  import('@/components/profile').then((mod) => ({
    default: mod.PTProfileTab,
  })),
)
const PTNotificationsTab = lazy(() =>
  import('@/components/profile').then((mod) => ({
    default: mod.PTNotificationsTab,
  })),
)
const PTSettingsTab = lazy(() =>
  import('@/components/profile').then((mod) => ({
    default: mod.PTSettingsTab,
  })),
)

interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  link: string
  type: string
  sent_at: string
  read_at: string | null
  action_text: string
  is_push_sent: boolean
  created_at: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

export default function ProfiloPTPage() {
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('profilo')
  const [isEditing, setIsEditing] = useState(false)

  // Hook per gestione profilo
  const {
    authUserId,
    profile: profileData,
    loading,
    isSaving,
    saveProfile,
    updateProfileField,
  } = usePTProfile()

  // Hook per gestione impostazioni
  const {
    settings,
    isSavingSettings,
    saveSuccess,
    handleSaveSettings,
    updateProfile: updateSettingsProfile,
    toggleNotification,
    togglePrivacy,
    updateAppearance,
  } = usePTSettings(authUserId || '')

  // Stati per le notifiche (mock per ora)
  const [notifications] = useState<Notification[]>(mockNotifications as Notification[])

  const handleSave = async () => {
    if (!profileData) return

    const result = await saveProfile({
      nome: profileData.nome,
      cognome: profileData.cognome,
      email: profileData.email,
      phone: profileData.phone,
      specializzazione: profileData.specializzazione,
      certificazioni: profileData.certificazioni,
    })

    if (result.success) {
      addToast({
        title: 'Profilo salvato',
        message: 'Profilo salvato con successo! ✅',
        variant: 'success',
      })
      setIsEditing(false)
    } else {
      addToast({
        title: 'Errore',
        message: result.error || 'Errore nel salvare il profilo',
        variant: 'error',
      })
    }
  }

  // Nota: handleLogout potrebbe essere usato in futuro per logout
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      logger.error('Errore nel logout', error)
      addToast({
        title: 'Errore',
        message: 'Errore nel logout. Riprova più tardi.',
        variant: 'error',
      })
    }
  }

  const handleViewSettings = () => {
    setActiveTab('impostazioni')
  }

  const handleViewStats = () => {
    router.push('/dashboard/statistiche')
  }

  // Funzioni per le notifiche
  const unreadCount = notifications.filter((n) => !n.read_at).length

  const markAsRead = (id: string) => {
    // TODO: Implementare logica reale
    logger.debug('Mark as read', { notificationId: id })
  }

  const markAllAsRead = () => {
    // TODO: Implementare logica reale
    logger.debug('Mark all as read')
  }

  const deleteNotification = (id: string) => {
    // TODO: Implementare logica reale
    logger.debug('Delete notification', { notificationId: id })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="bg-background-tertiary h-32 rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background-tertiary h-24 rounded-lg" />
              <div className="bg-background-tertiary h-24 rounded-lg" />
              <div className="bg-background-tertiary h-24 rounded-lg" />
            </div>
            <div className="bg-background-tertiary h-64 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-cyan-500/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Profilo
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Gestisci il tuo profilo, notifiche e impostazioni
            </p>
          </div>
        </div>

        {/* Success message */}
        {saveSuccess && (
          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-emerald-500/5 border-green-500/30 shadow-lg shadow-green-500/10 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
            <CardContent className="flex items-center gap-3 p-4 relative">
              <Check className="text-green-400 h-5 w-5" />
              <p className="text-green-400 font-medium">Impostazioni salvate con successo!</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="pills">
            <TabsTrigger value="profilo" variant="pills">
              <User className="mr-2 h-4 w-4" />
              Profilo
            </TabsTrigger>
            <TabsTrigger value="notifiche" variant="pills">
              <Bell className="mr-2 h-4 w-4" />
              Notifiche
              {unreadCount > 0 && (
                <Badge variant="destructive" size="sm" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="impostazioni" variant="pills">
              <Shield className="mr-2 h-4 w-4" />
              Impostazioni
            </TabsTrigger>
          </TabsList>

          {/* Tab: Profilo */}
          <TabsContent value="profilo">
            {profileData && (
              <Suspense fallback={<LoadingState message="Caricamento profilo..." />}>
                <PTProfileTab
                  profile={profileData}
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onProfileChange={(field, value) => updateProfileField(field as any, value)}
                  isSaving={isSaving}
                  onViewStats={handleViewStats}
                  onViewSettings={handleViewSettings}
                  onLogout={async () => {
                    await supabase.auth.signOut()
                    router.push('/login')
                  }}
                />
              </Suspense>
            )}
          </TabsContent>

          {/* Tab: Notifiche */}
          <TabsContent value="notifiche">
            <Suspense fallback={<LoadingState message="Caricamento notifiche..." />}>
              <PTNotificationsTab
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
              />
            </Suspense>
          </TabsContent>

          {/* Tab: Impostazioni */}
          <TabsContent value="impostazioni">
            <Suspense fallback={<LoadingState message="Caricamento impostazioni..." />}>
              <PTSettingsTab
                settings={settings}
                authUserId={authUserId || ''}
                isSavingSettings={isSavingSettings}
                saveSuccess={saveSuccess}
                onSave={async () => {
                  try {
                    await handleSaveSettings()
                    addToast({
                      title: 'Impostazioni salvate',
                      message: 'Le tue preferenze sono state aggiornate con successo.',
                      variant: 'success',
                    })
                  } catch (error) {
                    addToast({
                      title: 'Errore',
                      message: error instanceof Error ? error.message : 'Errore nel salvataggio',
                      variant: 'error',
                    })
                  }
                }}
                onUpdateProfile={updateSettingsProfile}
                onToggleNotification={toggleNotification}
                onTogglePrivacy={togglePrivacy}
                onUpdateAppearance={updateAppearance}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
