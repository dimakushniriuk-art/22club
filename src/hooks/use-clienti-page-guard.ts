'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

const REDIRECT_PATH_BY_ROLE: Record<string, string> = {
  admin: '/dashboard/admin',
  trainer: '/dashboard',
  marketing: '/dashboard/marketing',
  athlete: '/home',
} as const

const DEFAULT_REDIRECT = '/dashboard'

const ALLOWED_CLIENTI_ROLES = ['trainer', 'admin'] as const

/**
 * Guard per la pagina clienti dashboard.
 * Accesso: trainer, admin.
 * Reindirizza atleti e ruoli non ammessi; ritorna showLoader per lo spinner.
 */
export function useClientiPageGuard(): { showLoader: boolean } {
  const router = useRouter()
  const { role, loading } = useAuth()

  useEffect(() => {
    if (loading || role === null) return
    const allowed = ALLOWED_CLIENTI_ROLES.includes(role as (typeof ALLOWED_CLIENTI_ROLES)[number])
    if (!allowed) {
      const path = REDIRECT_PATH_BY_ROLE[role] ?? DEFAULT_REDIRECT
      router.replace(path)
    }
  }, [role, loading, router])

  const showLoader =
    loading ||
    (role !== null &&
      !ALLOWED_CLIENTI_ROLES.includes(role as (typeof ALLOWED_CLIENTI_ROLES)[number]))

  return { showLoader }
}
