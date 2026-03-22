'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

const REDIRECT_PATH_BY_ROLE: Record<string, string> = {
  admin: '/dashboard/admin',
  trainer: '/dashboard',
  nutrizionista: '/dashboard/nutrizionista',
  massaggiatore: '/dashboard/massaggiatore',
  athlete: '/home',
} as const

const DEFAULT_REDIRECT = '/dashboard'

export type StaffRole = 'massaggiatore' | 'nutrizionista'

/**
 * Guard per le dashboard staff (massaggiatore, nutrizionista).
 * Reindirizza se il ruolo non è quello consentito; ritorna showLoader per mostrare lo spinner.
 */
export function useStaffDashboardGuard(allowedRole: StaffRole): {
  showLoader: boolean
} {
  const router = useRouter()
  const { role, loading } = useAuth()

  useEffect(() => {
    if (loading || role === null) return
    if (role !== allowedRole) {
      const path = REDIRECT_PATH_BY_ROLE[role] ?? DEFAULT_REDIRECT
      router.replace(path)
    }
  }, [role, loading, router, allowedRole])

  const showLoader = loading || (role !== null && role !== allowedRole)

  return { showLoader }
}
