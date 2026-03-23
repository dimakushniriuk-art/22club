'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { requirePermission } from '@/lib/auth/guards'
import { getRedirectPath } from '@/lib/auth/redirect'
import { useAuth } from '@/providers/auth-provider'

/**
 * Guard per la pagina calendario dashboard.
 * Accesso: trainer, admin.
 * Reindirizza atleti e ruoli non ammessi; ritorna showLoader per lo spinner.
 */
export function useCalendarPageGuard(): { showLoader: boolean } {
  const router = useRouter()
  const { role, loading } = useAuth()
  const isAllowed = requirePermission('staff_dashboard_home', role)

  useEffect(() => {
    if (loading || role === null) return
    if (!isAllowed) {
      const path = getRedirectPath(role, { kind: 'guard_staff_wrong_area' })
      router.replace(path)
    }
  }, [role, loading, router, isAllowed])

  const showLoader = loading || (role !== null && !isAllowed)

  return { showLoader }
}

/**
 * Guard per la pagina Impostazioni calendario.
 * Accesso: trainer, admin, nutrizionista, massaggiatore.
 */
export function useCalendarSettingsPageGuard(): { showLoader: boolean } {
  const router = useRouter()
  const { role, loading } = useAuth()
  const isAllowed = requirePermission('calendar_settings_staff', role)

  useEffect(() => {
    if (loading || role === null) return
    if (!isAllowed) {
      const path = getRedirectPath(role, { kind: 'guard_staff_wrong_area' })
      router.replace(path)
    }
  }, [role, loading, router, isAllowed])

  const showLoader = loading || (role !== null && !isAllowed)

  return { showLoader }
}
