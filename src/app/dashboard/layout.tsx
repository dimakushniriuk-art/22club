'use client'

import { Suspense, useEffect } from 'react'
import { RoleLayout } from '@/components/shared/dashboard/role-layout'
// RIMOSSO: NavigationLoading non serve più - Next.js Link gestisce già la navigazione
// import { NavigationLoading } from '@/components/ui'
import { NotificationToast } from '@/components/shared/ui/notification-toast'
// RIMOSSO: useNavigationState non serve più - Next.js Link gestisce già la navigazione
// import { useNavigationState } from '@/hooks/use-navigation-state'
import {
  useRealtimeChannel,
  useAppointmentsRealtime,
  useDocumentsRealtime,
} from '@/hooks/useRealtimeChannel'
import { useAuth } from '@/providers/auth-provider'
import { notifyInfo } from '@/lib/notifications'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { ModalsWrapper } from '@/components/dashboard/modals-wrapper'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // RIMOSSO: useNavigationState non serve più - Next.js Link gestisce già la navigazione
  // const navigationState = useNavigationState()
  const { org_id } = useAuth()

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'dashboard/layout.tsx:20',
        message: 'DashboardLayout - component render',
        data: {
          org_id: org_id || null,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'M',
      }),
    }).catch(() => {})
  }, [org_id])
  // #endregion

  // Fine navigazione quando i children cambiano - RIMOSSO perché non serve più
  // useEffect(() => {
  //   if (navigationState.isLoading) {
  //     navigationState.endNavigation()
  //   }
  // }, [children])

  // Ascolta aggiornamenti appuntamenti
  useAppointmentsRealtime(org_id || undefined)

  // Ascolta aggiornamenti documenti
  useDocumentsRealtime(org_id || undefined)

  // Ascolta notifiche generali
  useRealtimeChannel(
    'notifications',
    (payload) => {
      const newNotification = (payload.new ?? null) as { message?: string } | null

      if (newNotification) {
        notifyInfo('Nuova notifica', newNotification.message || 'Hai ricevuto una nuova notifica')
      }
    },
    'INSERT',
  )

  return (
    <>
      <RoleLayout role="staff">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </ErrorBoundary>

        {/* Navigation Loading Overlay - DISABILITATO TEMPORANEAMENTE per debug refresh multipli */}
        {/* <NavigationLoading
          isLoading={navigationState.isLoading}
          loadingDuration={navigationState.getLoadingDuration()}
          isSlow={navigationState.isNavigationSlow()}
          targetPath={navigationState.currentPath}
        /> */}
      </RoleLayout>
      <NotificationToast />

      {/* Modals Wrapper - disponibile per tutti i componenti dashboard */}
      <Suspense>
        <ModalsWrapper />
      </Suspense>
    </>
  )
}
