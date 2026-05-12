import { getPostLoginRedirectPath } from '@/lib/utils/role-redirect-paths'

export type LoginFormValidationErrors = {
  email?: string
  password?: string
}

export type LoginProfileForRedirect = {
  role: string
  first_login: boolean | null
}

export function validateLoginForm(
  email: string,
  password: string,
): LoginFormValidationErrors {
  const errors: LoginFormValidationErrors = {}
  if (!email.trim()) errors.email = 'Email è richiesta'
  if (!password) errors.password = 'Password è richiesta'
  return errors
}

/** Path interno `/home…` sicuro dopo login atleta (es. invito da email con `redirectedFrom`). */
export function resolveAthleteRedirectFromLoginQuery(
  profileData: LoginProfileForRedirect,
  redirectedFrom: string | null | undefined,
): string | null {
  if (profileData.role !== 'athlete' || !redirectedFrom?.trim()) return null

  let path = redirectedFrom.trim()
  try {
    path = decodeURIComponent(path)
  } catch {
    // mantieni path originale
  }

  if (!path.startsWith('/home')) return null
  if (path.includes('://') || path.includes('..')) return null
  if (path.length > 2048) return null

  return path
}

export function resolvePostLoginRedirectPath(
  profileData: LoginProfileForRedirect,
): string | null {
  return getPostLoginRedirectPath(profileData.role, profileData.first_login)
}

export function getUnknownLoginRoleError(role: string): string {
  return `Ruolo non riconosciuto: ${role}. Contatta l'amministratore.`
}
