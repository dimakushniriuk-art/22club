'use client'

import { Suspense } from 'react'
import { RoleLayout } from '@/components/shared/dashboard/role-layout'
import { ImpersonationBanner } from '@/components/shared/impersonation-banner'
// RIMOSSO: NavigationLoading non serve più - Next.js Link gestisce già la navigazione
// import { NavigationLoading } from '@/components/ui'
import { NotificationToast } from '@/components/shared/ui/notification-toast'
// RIMOSSO: useNavigationState non serve più - Next.js Link gestisce già la navigazione
// import { useNavigationState } from '@/hooks/use-navigation-state'
import { isStaffDashboardRealtimeEnabled } from '@/lib/session-stability/platform-sync-constants'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { ModalsWrapper } from '@/components/dashboard/modals-wrapper'
import { StaffDashboardSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'
import { DashboardNavigationRecover } from '@/app/dashboard/_components/dashboard-navigation-recover'
import { StaffDashboardRealtimeBindings } from '@/app/dashboard/_components/staff-dashboard-realtime-bindings'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
       * Shell viewport dashboard globale: `NonHomeViewportShell` (`variant="fill"`) = root flex fill;
       * scroll/overflow delegati ai figli (RoleLayout / staff chrome). Contratto: `src/components/layout/non-home-viewport-shell.tsx`.
       */}
      <NonHomeViewportShell variant="fill" className="min-h-0">
        {isStaffDashboardRealtimeEnabled() ? <StaffDashboardRealtimeBindings /> : null}
        <DashboardNavigationRecover />
        <ImpersonationBanner />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <RoleLayout role="staff">
            <ErrorBoundary>
              <Suspense fallback={<StaffDashboardSegmentSkeleton />}>{children}</Suspense>
            </ErrorBoundary>

            {/* Navigation Loading Overlay - DISABILITATO TEMPORANEAMENTE per debug refresh multipli */}
            {/* <NavigationLoading
          isLoading={navigationState.isLoading}
          loadingDuration={navigationState.getLoadingDuration()}
          isSlow={navigationState.isNavigationSlow()}
          targetPath={navigationState.currentPath}
        /> */}
          </RoleLayout>
        </div>
      </NonHomeViewportShell>
      <NotificationToast />

      {/* Modals Wrapper - disponibile per tutti i componenti dashboard */}
      <Suspense>
        <ModalsWrapper />
      </Suspense>
    </>
  )
}
