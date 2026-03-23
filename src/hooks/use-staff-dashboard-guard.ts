'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { requirePermission } from '@/lib/auth/guards'
import { getRedirectPath } from '@/lib/auth/redirect'
import type { AuthFeature } from '@/lib/auth/permissions'

export type StaffRole = 'massaggiatore' | 'nutrizionista'

function featureForStaffRole(allowedRole: StaffRole): AuthFeature {
  return allowedRole === 'nutrizionista'
    ? 'page_nutrizionista_dashboard'
    : 'page_massaggiatore_dashboard'
}

/**
 * Guard per le dashboard staff (massaggiatore, nutrizionista).
 * Reindirizza se il ruolo non è quello consentito; ritorna showLoader per mostrare lo spinner.
 */
export function useStaffDashboardGuard(allowedRole: StaffRole): {
  showLoader: boolean
} {
  const router = useRouter()
  const { role, loading } = useAuth()
  const feature = useMemo(() => featureForStaffRole(allowedRole), [allowedRole])

  useEffect(() => {
    if (loading || role === null) return
    if (!requirePermission(feature, role)) {
      const path = getRedirectPath(role, { kind: 'guard_staff_wrong_area' })
      router.replace(path)
    }
  }, [role, loading, router, feature])

  const showLoader = loading || (role !== null && !requirePermission(feature, role))

  return { showLoader }
}
