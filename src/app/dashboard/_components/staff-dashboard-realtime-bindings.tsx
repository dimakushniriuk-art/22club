'use client'

import { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import { useAuth } from '@/providers/auth-provider'
import {
  invalidateAppointmentsQueries,
  invalidateClientiQueries,
  invalidateStaffNotificationsListQueries,
} from '@/lib/react-query/post-mutation-cache'
import {
  STAFF_DASHBOARD_APPOINTMENTS_REALTIME_THROTTLE_MS,
  STAFF_DASHBOARD_PROFILES_REALTIME_THROTTLE_MS,
  isStaffDashboardRealtimeTableEnabled,
} from '@/lib/session-stability/platform-sync-constants'
import {
  STAFF_APPOINTMENTS_INVALIDATE_EVENT,
  type StaffAppointmentsInvalidateDetail,
} from '@/lib/staff-cross-tab-events'
import { notifyInfo } from '@/lib/notifications'

function isAthleteProfileRole(role: string | null | undefined): boolean {
  const r = (role ?? '').toLowerCase()
  return r === 'athlete' || r === 'atleta'
}

export function StaffDashboardRealtimeAppointments() {
  const { org_id: orgId } = useAuth()
  const queryClient = useQueryClient()
  const lastInvalidateAtRef = useRef(0)

  useRealtimeChannel(
    'appointments',
    (payload) => {
      if (!orgId) return
      const row = (payload.new ?? payload.old) as { org_id?: string | null } | null
      const rowOrg = row?.org_id ?? null
      if (!rowOrg || rowOrg !== orgId) return

      const now = Date.now()
      if (now - lastInvalidateAtRef.current < STAFF_DASHBOARD_APPOINTMENTS_REALTIME_THROTTLE_MS) {
        return
      }
      lastInvalidateAtRef.current = now

      void invalidateAppointmentsQueries(queryClient)
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

  return null
}

export function StaffDashboardRealtimeProfiles() {
  const { org_id: orgId } = useAuth()
  const queryClient = useQueryClient()
  const lastInvalidateAtRef = useRef(0)

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
      if (now - lastInvalidateAtRef.current < STAFF_DASHBOARD_PROFILES_REALTIME_THROTTLE_MS) {
        return
      }
      lastInvalidateAtRef.current = now

      void invalidateClientiQueries(queryClient)
    },
    '*',
  )

  return null
}

export function StaffDashboardRealtimeNotifications() {
  const { user } = useAuth()
  const staffProfileId = user?.id ?? null
  const queryClient = useQueryClient()

  useRealtimeChannel(
    'notifications',
    (payload) => {
      const newNotification = (payload.new ?? null) as {
        message?: string
        user_id?: string | null
      } | null
      if (!newNotification || !staffProfileId) return
      if (newNotification.user_id !== staffProfileId) return

      void invalidateStaffNotificationsListQueries(queryClient, staffProfileId)
      notifyInfo('Nuova notifica', newNotification.message || 'Hai ricevuto una nuova notifica')
    },
    'INSERT',
  )

  return null
}

/**
 * Subscription Realtime layout staff: rispetta `NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME`
 * e lista opzionale `NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE`.
 */
export function StaffDashboardRealtimeBindings() {
  return (
    <>
      {isStaffDashboardRealtimeTableEnabled('appointments') ? (
        <StaffDashboardRealtimeAppointments />
      ) : null}
      {isStaffDashboardRealtimeTableEnabled('profiles') ? <StaffDashboardRealtimeProfiles /> : null}
      {isStaffDashboardRealtimeTableEnabled('notifications') ? (
        <StaffDashboardRealtimeNotifications />
      ) : null}
    </>
  )
}
