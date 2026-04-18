'use client'

import { useMemo, useCallback, lazy, Suspense } from 'react'
import { createLogger } from '@/lib/logger'
import { useToast } from '@/components/ui/toast'
import { usePTProfile } from '@/hooks/use-pt-profile'
import { useProfiloPageGuard } from '@/hooks/use-profilo-page-guard'
import { useNotifications, type Notification as ApiNotification } from '@/hooks/use-notifications'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import {
  StaffDashboardSegmentSkeleton,
  StaffLazyChunkFallback,
} from '@/components/layout/route-loading-skeletons'

const logger = createLogger('DashboardNotifichePage')

const PTNotificationsTab = lazy(() =>
  import('@/components/profile').then((mod) => ({
    default: mod.PTNotificationsTab,
  })),
)

/** Allineato a `src/app/dashboard/profilo/page.tsx` (tab Notifiche). */
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

export default function DashboardNotifichePage() {
  const { addToast } = useToast()
  const { showLoader: showGuardLoader } = useProfiloPageGuard()
  const { authUserId, loading } = usePTProfile()

  const {
    notifications: apiNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ userId: authUserId ?? null })

  const notifications = useMemo(
    () => apiNotifications.map(mapApiNotificationToTab),
    [apiNotifications],
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

  if (showGuardLoader || loading) {
    return <StaffDashboardSegmentSkeleton />
  }

  return (
    <StaffContentLayout
      title="Notifiche"
      description="Avvisi e aggiornamenti per il tuo account staff."
    >
      <Suspense
        fallback={
          <StaffLazyChunkFallback className="w-full min-h-[220px]" label="Caricamento notifiche…" />
        }
      >
        <PTNotificationsTab
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDeleteNotification}
        />
      </Suspense>
    </StaffContentLayout>
  )
}
