import { normalizeRole } from '@/lib/utils/role-normalizer'

/**
 * Feature RBAC ad alto livello (non sostituisce RLS).
 * Estendere qui per nuove aree invece di mappe sparse nei componenti.
 */
export type AuthFeature =
  | 'page_nutrizionista_dashboard'
  | 'page_massaggiatore_dashboard'
  | 'staff_dashboard_home'
  | 'calendar_settings_staff'
  | 'athlete_portal'

/**
 * Verifica se il ruolo normalizzato può accedere alla feature.
 * Usa solo {@link normalizeRole}; nessuna logica duplicata.
 */
export function canAccess(feature: AuthFeature, role: string | null | undefined): boolean {
  const r = normalizeRole(role)
  if (!r) return false

  switch (feature) {
    case 'page_nutrizionista_dashboard':
      return r === 'nutrizionista'
    case 'page_massaggiatore_dashboard':
      return r === 'massaggiatore'
    case 'staff_dashboard_home':
      return r === 'trainer' || r === 'admin'
    case 'calendar_settings_staff':
      return r === 'trainer' || r === 'admin' || r === 'nutrizionista' || r === 'massaggiatore'
    case 'athlete_portal':
      return r === 'athlete'
    default: {
      const _exhaustive: never = feature
      return _exhaustive
    }
  }
}
