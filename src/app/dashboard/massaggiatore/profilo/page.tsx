'use client'

import { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { usePTProfile } from '@/hooks/use-pt-profile'
import { usePTSettings } from '@/hooks/use-pt-settings'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useNotifications, type Notification as ApiNotification } from '@/hooks/use-notifications'
import { User, Bell, Shield, Check } from 'lucide-react'

const logger = createLogger('app:dashboard:massaggiatore:profilo')

const VALID_TABS = ['profilo', 'notifiche', 'impostazioni'] as const
type TabValue = (typeof VALID_TABS)[number]

function isTabValue(t: string | null): t is TabValue {
  return t !== null && VALID_TABS.includes(t as TabValue)
}

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

const PTProfileTab = lazy(() =>
  import('@/components/profile').then((mod) => ({ default: mod.PTProfileTab })),
)
const PTNotificationsTab = lazy(() =>
  import('@/components/profile').then((mod) => ({ default: mod.PTNotificationsTab })),
)
const PTSettingsTab = lazy(() =>
  import('@/components/profile').then((mod) => ({ default: mod.PTSettingsTab })),
)

const ProfiloSaveSuccessCard = () => (
  <Card
    variant="trainer"
    className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/5 border-amber-500/30 shadow-lg shadow-amber-500/10 backdrop-blur-xl"
  >
    <CardContent className="flex items-center gap-3 p-4 relative">
      <Check className="text-amber-400 h-5 w-5" />
      <p className="text-amber-400 font-medium">Impostazioni salvate con successo!</p>
    </CardContent>
  </Card>
)

export default function MassaggiatoreProfiloPage() {
  const { signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const { showLoader: showGuardLoader } = useStaffDashboardGuard('massaggiatore')

  const [activeTab, setActiveTab] = useState<TabValue>(() => {
    const t = searchParams.get('tab')
    return isTabValue(t) ? t : 'profilo'
  })

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const t = searchParams.get('tab')
    if (isTabValue(t)) setActiveTab(t)
  }, [searchParams])

  const {
    authUserId,
    profile: profileData,
    loading,
    isSaving,
    saveProfile,
    updateProfileField,
  } = usePTProfile()

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
    router.replace('/dashboard/massaggiatore/profilo?tab=impostazioni', { scroll: false })
  }, [router])

  const handleViewStats = useCallback(() => {
    router.push('/dashboard/massaggiatore/statistiche')
  }, [router])

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
      const url =
        tab === 'profilo'
          ? '/dashboard/massaggiatore/profilo'
          : `/dashboard/massaggiatore/profilo?tab=${tab}`
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
    return null
  }

  if (loading) {
    return (
      <StaffContentLayout
        title="Profilo"
        description="Gestisci il tuo profilo, notifiche e impostazioni"
        theme="amber"
      >
        {null}
      </StaffContentLayout>
    )
  }

  return (
    <StaffContentLayout
      title="Profilo"
      description="Gestisci il tuo profilo, notifiche e impostazioni"
      theme="amber"
    >
      {saveSuccess && <ProfiloSaveSuccessCard />}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
        <TabsList variant="pills" className="gap-2">
          <TabsTrigger
            value="profilo"
            variant="pills"
            className="data-[state=active]:!bg-amber-600 data-[state=active]:!text-white data-[state=active]:shadow-amber-500/30"
          >
            <User className="mr-2 h-4 w-4" />
            Profilo
          </TabsTrigger>
          <TabsTrigger
            value="notifiche"
            variant="pills"
            className="data-[state=active]:!bg-amber-600 data-[state=active]:!text-white data-[state=active]:shadow-amber-500/30"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifiche
            {unreadCount > 0 && (
              <Badge variant="destructive" size="sm" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="impostazioni"
            variant="pills"
            className="data-[state=active]:!bg-amber-600 data-[state=active]:!text-white data-[state=active]:shadow-amber-500/30"
          >
            <Shield className="mr-2 h-4 w-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profilo">
          {profileData && (
            <Suspense fallback={null}>
              <PTProfileTab
                profile={profileData}
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                onProfileChange={handleProfileFieldChange}
                isSaving={isSaving}
                onViewStats={handleViewStats}
                onViewSettings={handleViewSettings}
                onLogout={signOut}
                roleLabel="Massaggiatore"
                theme="amber"
              />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="notifiche">
          <Suspense fallback={null}>
            <PTNotificationsTab
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={deleteNotification}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="impostazioni">
          <Suspense fallback={null}>
            <PTSettingsTab
              settings={settings}
              authUserId={authUserId || ''}
              isSavingSettings={isSavingSettings}
              saveSuccess={saveSuccess}
              onSave={handleSaveSettingsWithToast}
              onUpdateProfile={updateSettingsProfile}
              onToggleNotification={toggleNotification}
              onTogglePrivacy={togglePrivacy}
              onUpdateAppearance={updateAppearance}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </StaffContentLayout>
  )
}
