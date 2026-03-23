import { normalizeRole } from '@/lib/utils/role-normalizer'
import { getDefaultAppPathForRole, getPostLoginRedirectPath } from '@/lib/utils/role-redirect-paths'

/**
 * Contesto per il redirect centralizzato (delega a role-redirect-paths).
 */
export type RedirectContext =
  | { kind: 'post_login'; firstLogin?: boolean | null }
  | { kind: 'default_app' }
  /**
   * Parità con use-staff-dashboard-guard: marketing non era nella mappa locale → /dashboard.
   */
  | { kind: 'guard_staff_wrong_area' }

/**
 * Path di destinazione unico per ruolo e contesto.
 * Non altera le regole in role-redirect-paths; per guard_staff_wrong_area allinea marketing al middleware web.
 */
export function getRedirectPath(role: string | null | undefined, context: RedirectContext): string {
  const normalized = normalizeRole(role)
  const roleForHelpers = normalized ?? role ?? ''

  switch (context.kind) {
    case 'post_login': {
      const path = getPostLoginRedirectPath(roleForHelpers, context.firstLogin)
      return path ?? '/login'
    }
    case 'default_app':
      return getDefaultAppPathForRole(role) ?? '/login'
    case 'guard_staff_wrong_area': {
      if (normalized === 'marketing') {
        return '/dashboard/marketing'
      }
      return getDefaultAppPathForRole(role) ?? '/dashboard'
    }
    default: {
      const _exhaustive: never = context
      return _exhaustive
    }
  }
}
