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

const ALLOWED_PROFILO_ROLES = ['trainer', 'admin'] as const

/**
 * Guard per la pagina profilo dashboard (PT/staff).
 * Accesso: trainer, admin.
 * Reindirizza atleti e ruoli non ammessi; ritorna showLoader per lo spinner.
 */
export function useProfiloPageGuard(): { showLoader: boolean } {
  const router = useRouter()
  const { role, loading } = useAuth()

  useEffect(() => {
    if (loading || role === null) return
    const allowed = ALLOWED_PROFILO_ROLES.includes(role as (typeof ALLOWED_PROFILO_ROLES)[number])
    if (!allowed) {
      const path = REDIRECT_PATH_BY_ROLE[role] ?? DEFAULT_REDIRECT
      router.replace(path)
    }
  }, [role, loading, router])

  const showLoader =
    loading || (role !== null && !ALLOWED_PROFILO_ROLES.includes(role as (typeof ALLOWED_PROFILO_ROLES)[number]))

  return { showLoader }
}
