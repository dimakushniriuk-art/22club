'use client'

import { Suspense, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RoleLayout } from '@/components/shared/dashboard/role-layout'
import { ImpersonationBanner } from '@/components/shared/impersonation-banner'
// RIMOSSO: NavigationLoading non serve più - Next.js Link gestisce già la navigazione
// import { NavigationLoading } from '@/components/ui'
import { NotificationToast } from '@/components/shared/ui/notification-toast'
// RIMOSSO: useNavigationState non serve più - Next.js Link gestisce già la navigazione
// import { useNavigationState } from '@/hooks/use-navigation-state'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import { useAuth } from '@/providers/auth-provider'
import { queryKeys } from '@/lib/query-keys'
import {
  STAFF_APPOINTMENTS_INVALIDATE_EVENT,
  type StaffAppointmentsInvalidateDetail,
} from '@/lib/staff-cross-tab-events'
import { notifyInfo } from '@/lib/notifications'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { ModalsWrapper } from '@/components/dashboard/modals-wrapper'
import { StaffDashboardSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

const STAFF_APPOINTMENTS_REALTIME_THROTTLE_MS = 450
const STAFF_PROFILES_REALTIME_THROTTLE_MS = 600

function isAthleteProfileRole(role: string | null | undefined): boolean {
  const r = (role ?? '').toLowerCase()
  return r === 'athlete' || r === 'atleta'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { org_id: orgId } = useAuth()
  const queryClient = useQueryClient()
  const lastApptInvalidateAtRef = useRef(0)
  const lastClientiInvalidateAtRef = useRef(0)

  useRealtimeChannel(
    'appointments',
    (payload) => {
      if (!orgId) return
      const row = (payload.new ?? payload.old) as { org_id?: string | null } | null
      const rowOrg = row?.org_id ?? null
      if (!rowOrg || rowOrg !== orgId) return

      const now = Date.now()
      if (now - lastApptInvalidateAtRef.current < STAFF_APPOINTMENTS_REALTIME_THROTTLE_MS) {
        return
      }
      lastApptInvalidateAtRef.current = now

      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent<StaffAppointmentsInvalidateDetail>(STAFF_APPOINTMENTS_INVALIDATE_EVENT, {
            detail: { org_id: rowOrg },
          }),
        )
      }
    },
    '*',
  )

  useRealtimeChannel(
    'profiles',
    (payload) => {
      if (!orgId) return
      const row = (payload.new ?? payload.old) as {
        org_id?: string | null
        role?: string | null
      } | null
      const rowOrg = row?.org_id ?? null
      if (!rowOrg || rowOrg !== orgId) return
      if (!isAthleteProfileRole(row?.role ?? null)) return

      const now = Date.now()
      if (now - lastClientiInvalidateAtRef.current < STAFF_PROFILES_REALTIME_THROTTLE_MS) {
        return
      }
      lastClientiInvalidateAtRef.current = now

      void queryClient.invalidateQueries({ queryKey: queryKeys.clienti.all })
    },
    '*',
  )

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
      <ImpersonationBanner />
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
      <NotificationToast />

      {/* Modals Wrapper - disponibile per tutti i componenti dashboard */}
      <Suspense>
        <ModalsWrapper />
      </Suspense>
    </>
  )
}
