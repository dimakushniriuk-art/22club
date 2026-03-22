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

const ALLOWED_CALENDAR_ROLES = ['trainer', 'admin'] as const

/** Ruoli che possono accedere al calendario e alla pagina Impostazioni calendario. */
export const ALLOWED_CALENDAR_SETTINGS_ROLES = [
  'trainer',
  'admin',
  'nutrizionista',
  'massaggiatore',
] as const

/**
 * Guard per la pagina calendario dashboard.
 * Accesso: trainer, admin.
 * Reindirizza atleti e ruoli non ammessi; ritorna showLoader per lo spinner.
 */
export function useCalendarPageGuard(): { showLoader: boolean } {
  const router = useRouter()
  const { role, loading } = useAuth()

  useEffect(() => {
    if (loading || role === null) return
    const allowed = ALLOWED_CALENDAR_ROLES.includes(role as (typeof ALLOWED_CALENDAR_ROLES)[number])
    if (!allowed) {
      const path = REDIRECT_PATH_BY_ROLE[role] ?? DEFAULT_REDIRECT
      router.replace(path)
    }
  }, [role, loading, router])

  const showLoader =
    loading ||
    (role !== null &&
      !ALLOWED_CALENDAR_ROLES.includes(role as (typeof ALLOWED_CALENDAR_ROLES)[number]))

  return { showLoader }
}

/**
 * Guard per la pagina Impostazioni calendario.
 * Accesso: trainer, admin, nutrizionista, massaggiatore.
 */
export function useCalendarSettingsPageGuard(): { showLoader: boolean } {
  const router = useRouter()
  const { role, loading } = useAuth()

  useEffect(() => {
    if (loading || role === null) return
    const allowed = ALLOWED_CALENDAR_SETTINGS_ROLES.includes(
      role as (typeof ALLOWED_CALENDAR_SETTINGS_ROLES)[number],
    )
    if (!allowed) {
      const path = REDIRECT_PATH_BY_ROLE[role] ?? DEFAULT_REDIRECT
      router.replace(path)
    }
  }, [role, loading, router])

  const showLoader =
    loading ||
    (role !== null &&
      !ALLOWED_CALENDAR_SETTINGS_ROLES.includes(
        role as (typeof ALLOWED_CALENDAR_SETTINGS_ROLES)[number],
      ))

  return { showLoader }
}
