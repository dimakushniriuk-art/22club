'use client'

import { useMemo, useCallback, lazy, Suspense } from 'react'
import { createLogger } from '@/lib/logger'
import { useToast } from '@/components/ui/toast'
import { usePTProfile } from '@/hooks/use-pt-profile'
import { useProfiloPageGuard } from '@/hooks/use-profilo-page-guard'
import { useNotifications } from '@/hooks/use-notifications'
import { mapStaffNotificationForTab } from '@/lib/dashboard/map-staff-notification-for-tab'
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

export function StaffNotifichePageContent() {
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
    () => apiNotifications.map(mapStaffNotificationForTab),
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
