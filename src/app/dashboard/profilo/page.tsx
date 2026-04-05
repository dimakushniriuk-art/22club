'use client'

import { useState, useMemo, useCallback, lazy, Suspense, memo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { ProfiloPageHeader } from '@/components/dashboard/profilo-page-header'
import { usePTProfile } from '@/hooks/use-pt-profile'
import { usePTSettings } from '@/hooks/use-pt-settings'
import { useProfiloPageGuard } from '@/hooks/use-profilo-page-guard'
import { useNotifications, type Notification as ApiNotification } from '@/hooks/use-notifications'
import { User, Bell, Shield, Check } from 'lucide-react'
import {
  StaffDashboardSegmentSkeleton,
  StaffLazyChunkFallback,
} from '@/components/layout/route-loading-skeletons'

const VALID_TABS = ['profilo', 'notifiche', 'impostazioni'] as const
type TabValue = (typeof VALID_TABS)[number]

function isTabValue(t: string | null): t is TabValue {
  return t !== null && VALID_TABS.includes(t as TabValue)
}

const logger = createLogger('ProfiloPage')

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

const ProfiloSaveSuccessCard = memo(function ProfiloSaveSuccessCard() {
  return (
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
  )
})

/** Formato notifiche per PTNotificationsTab (con priority/category e campi obbligatori) */
interface NotificationForTab {
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

function mapApiNotificationToTab(n: ApiNotification): NotificationForTab {
  const ext = n as ApiNotification & { priority?: 'high' | 'medium' | 'low'; category?: string }
  return {
    ...n,
    link: n.link ?? '',
    sent_at: n.sent_at ?? n.created_at,
    action_text: n.action_text ?? '',
    priority: ext.priority ?? 'medium',
    category: ext.category ?? '',
    read_at: n.read_at ?? null,
  }
}

export default function ProfiloPTPage() {
  const { signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const { showLoader: showGuardLoader } = useProfiloPageGuard()

  const [activeTab, setActiveTab] = useState<TabValue>(() => {
    const t = searchParams.get('tab')
    return isTabValue(t) ? t : 'profilo'
  })
  const [isEditing, setIsEditing] = useState(false)

  // Sincronizza tab da URL (es. indietro/avanti del browser)
  useEffect(() => {
    const t = searchParams.get('tab')
    if (isTabValue(t)) setActiveTab(t)
  }, [searchParams])

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
  } = usePTSettings(authUserId || '')

  // Notifiche da backend (Supabase)
  const {
    notifications: apiNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ userId: authUserId ?? null })

  const notifications = useMemo(
    () => apiNotifications.map(mapApiNotificationToTab),
    [apiNotifications],
  )

  const handleSave = useCallback(async () => {
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
  }, [profileData, saveProfile, addToast])

  const handleViewSettings = useCallback(() => {
    setActiveTab('impostazioni')
    router.replace('/dashboard/profilo?tab=impostazioni', { scroll: false })
  }, [router])
  const handleViewStats = useCallback(() => router.push('/dashboard/statistiche'), [router])

  const setEditingTrue = useCallback(() => setIsEditing(true), [])
  const setEditingFalse = useCallback(() => setIsEditing(false), [])

  const handleProfileFieldChange = useCallback(
    (field: string, value: unknown) => {
      updateProfileField(field as Parameters<typeof updateProfileField>[0], value)
    },
    [updateProfileField],
  )

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = isTabValue(value) ? value : 'profilo'
      setActiveTab(tab)
      const url = tab === 'profilo' ? '/dashboard/profilo' : `/dashboard/profilo?tab=${tab}`
      router.replace(url, { scroll: false })
    },
    [router],
  )

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await markAsRead(id)
      } catch (err) {
        logger.error('Mark as read failed', err, { notificationId: id })
        addToast({ title: 'Errore', message: 'Impossibile marcare come letta', variant: 'error' })
      }
    },
    [markAsRead, addToast],
  )
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
    } catch (err) {
      logger.error('Mark all as read failed', err)
      addToast({
        title: 'Errore',
        message: 'Impossibile marcare tutte come lette',
        variant: 'error',
      })
    }
  }, [markAllAsRead, addToast])
  const handleDeleteNotification = useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id)
      } catch (err) {
        logger.error('Delete notification failed', err, { notificationId: id })
        addToast({
          title: 'Errore',
          message: 'Impossibile eliminare la notifica',
          variant: 'error',
        })
      }
    },
    [deleteNotification, addToast],
  )

  const handleSaveSettingsWithToast = useCallback(async () => {
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
  }, [handleSaveSettings, addToast])

  if (showGuardLoader) {
    return <StaffDashboardSegmentSkeleton />
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-primary/5 via-transparent to-transparent" />
        </div>
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <ProfiloPageHeader />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <ProfiloPageHeader />

        {saveSuccess && <ProfiloSaveSuccessCard />}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
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
              <Suspense
                fallback={
                  <StaffLazyChunkFallback
                    className="w-full min-h-[220px]"
                    label="Caricamento profilo…"
                  />
                }
              >
                <PTProfileTab
                  profile={profileData}
                  isEditing={isEditing}
                  onEdit={setEditingTrue}
                  onSave={handleSave}
                  onCancel={setEditingFalse}
                  onProfileChange={handleProfileFieldChange}
                  isSaving={isSaving}
                  onViewStats={handleViewStats}
                  onViewSettings={handleViewSettings}
                  onLogout={signOut}
                />
              </Suspense>
            )}
          </TabsContent>

          {/* Tab: Notifiche */}
          <TabsContent value="notifiche">
            <Suspense
              fallback={
                <StaffLazyChunkFallback
                  className="w-full min-h-[220px]"
                  label="Caricamento notifiche…"
                />
              }
            >
              <PTNotificationsTab
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDelete={handleDeleteNotification}
              />
            </Suspense>
          </TabsContent>

          {/* Tab: Impostazioni */}
          <TabsContent value="impostazioni">
            <Suspense
              fallback={
                <StaffLazyChunkFallback
                  className="w-full min-h-[220px]"
                  label="Caricamento impostazioni…"
                />
              }
            >
              <PTSettingsTab
                settings={settings}
                authUserId={authUserId || ''}
                isSavingSettings={isSavingSettings}
                saveSuccess={saveSuccess}
                onSave={handleSaveSettingsWithToast}
                onUpdateProfile={updateSettingsProfile}
                onToggleNotification={toggleNotification}
                onTogglePrivacy={togglePrivacy}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
