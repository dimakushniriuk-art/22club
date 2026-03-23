import type { NormalizedRole } from './role-normalizer'
import { normalizeRole } from './role-normalizer'

/**
 * Path di default per ruolo canonico (landing / redirect da aree riservate ad altro ruolo).
 * Atleta: /home (post-login con first_login gestito da getPostLoginRedirectPath).
 */
export const ROLE_DEFAULT_APP_PATH: Record<Exclude<NormalizedRole, null>, string> = {
  admin: '/dashboard/admin',
  trainer: '/dashboard',
  athlete: '/home',
  marketing: '/dashboard/marketing',
  nutrizionista: '/dashboard/nutrizionista',
  massaggiatore: '/dashboard/massaggiatore',
}

const KNOWN_CANONICAL = new Set<string>(Object.keys(ROLE_DEFAULT_APP_PATH))

/**
 * Dopo login: stesso mapping del middleware su /login.
 */
export function getPostLoginRedirectPath(
  normalizedRole: string,
  firstLogin: boolean | null | undefined,
): string | null {
  const r =
    normalizeRole(normalizedRole) ??
    (KNOWN_CANONICAL.has(normalizedRole) ? (normalizedRole as Exclude<NormalizedRole, null>) : null)
  if (!r) return null
  if (r === 'athlete') {
    return firstLogin === true ? '/welcome' : '/home'
  }
  return ROLE_DEFAULT_APP_PATH[r]
}

/**
 * Dashboard/home per utente non atleta (es. da /home o /welcome). null se atleta o ruolo sconosciuto.
 */
export function getDashboardEntryPathForNonAthleteRole(
  role: string | null | undefined,
): string | null {
  const r = normalizeRole(role)
  if (!r || r === 'athlete') return null
  return ROLE_DEFAULT_APP_PATH[r] ?? null
}

/**
 * Path app per ruolo (include atleta → /home). Fallback null solo se ruolo non riconosciuto.
 */
export function getDefaultAppPathForRole(role: string | null | undefined): string | null {
  const r = normalizeRole(role)
  if (!r) return null
  return ROLE_DEFAULT_APP_PATH[r]
}
