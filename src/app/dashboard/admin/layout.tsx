'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { normalizeRole } from '@/lib/utils/role-normalizer'
import { getDefaultAppPathForRole, getPostLoginRedirectPath } from '@/lib/utils/role-redirect-paths'
import { StaffAdminSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

/**
 * Fallback client-only per /dashboard/admin (es. CAPACITOR senza middleware).
 * Ruolo effettivo normalizzato "admin", oppure admin in impersonation (actorProfile).
 */
export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, isImpersonating, actorProfile } = useAuth()
  const router = useRouter()
  const didRedirect = useRef(false)

  const isAdminAccess =
    normalizeRole(role) === 'admin' ||
    (isImpersonating === true &&
      actorProfile != null &&
      normalizeRole(actorProfile.role) === 'admin')

  useEffect(() => {
    if (loading || didRedirect.current) return

    if (!user) {
      didRedirect.current = true
      router.replace('/login')
      return
    }

    if (!isAdminAccess) {
      didRedirect.current = true
      const path =
        getPostLoginRedirectPath(role ?? 'athlete', user.first_login) ??
        getDefaultAppPathForRole(role) ??
        '/home'
      router.replace(path)
    }
  }, [loading, user, role, isAdminAccess, router])

  if (loading) {
    return <StaffAdminSegmentSkeleton />
  }

  if (!user || !isAdminAccess) {
    return null
  }

  return children
}
