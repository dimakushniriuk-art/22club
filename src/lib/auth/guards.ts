import type { NormalizedRole } from '@/lib/utils/role-normalizer'
import { normalizeRole } from '@/lib/utils/role-normalizer'
import type { AuthFeature } from './permissions'
import { canAccess } from './permissions'

/** Sessione / utente presente (id profilo o auth). */
export function requireAuth(userId: string | null | undefined): boolean {
  return userId != null && String(userId).length > 0
}

/**
 * Il ruolo normalizzato è uno di quelli attesi.
 */
export function requireRole(
  role: string | null | undefined,
  allowed: NormalizedRole | NormalizedRole[],
): boolean {
  const r = normalizeRole(role)
  if (!r) return false
  const list = Array.isArray(allowed) ? allowed : [allowed]
  return list.includes(r)
}

/**
 * Accesso alla feature (delega a canAccess / permissions).
 */
export function requirePermission(feature: AuthFeature, role: string | null | undefined): boolean {
  return canAccess(feature, role)
}
