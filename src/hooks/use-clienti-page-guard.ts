'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { requirePermission } from '@/lib/auth/guards'
import { getRedirectPath } from '@/lib/auth/redirect'

/**
 * Guard per la pagina clienti dashboard.
 * Accesso: trainer, admin.
 * Reindirizza atleti e ruoli non ammessi; ritorna showLoader per lo spinner.
 */
export function useClientiPageGuard(): { showLoader: boolean } {
  const router = useRouter()
  const { role, loading } = useAuth()
  const allowed = requirePermission('staff_dashboard_home', role)

  useEffect(() => {
    if (loading || role === null) return
    if (!allowed) {
      const path = getRedirectPath(role, { kind: 'guard_staff_wrong_area' })
      router.replace(path)
    }
  }, [allowed, role, loading, router])

  const showLoader = loading || (role !== null && !allowed)

  return { showLoader }
}
