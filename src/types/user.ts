// 👤 User Types — 22Club
export type UserRole =
  | 'athlete'
  | 'trainer'
  | 'admin'
  | 'marketing'
  | 'nutrizionista'
  | 'massaggiatore'

export interface UserProfile {
  id: string // profiles.id
  user_id?: string // auth.users.id (per compatibilità con hook legacy)
  org_id: string | null
  first_name: string
  last_name: string
  full_name?: string // Per compatibilità
  email: string
  role: UserRole
  phone?: string | null // Telefono utente (aggiunto per evitare query duplicate)
  avatar_url?: string
  avatar?: string // Alias per avatar_url (compatibilità)
  nome?: string // Alias per first_name (compatibilità)
  cognome?: string // Alias per last_name (compatibilità)
  /** Data iscrizione effettiva (DB); diversa da created_at quando valorizzata. */
  data_iscrizione?: string | null
  created_at: string
  updated_at?: string
  /** Stato abbonamento/iscrizione: trial | attivo | sospeso | archiviato */
  stato?: string | null
  /** Prima volta che l'atleta accede (onboarding) */
  first_login?: boolean | null
}

export interface AuthContext {
  user: UserProfile | null
  role: UserRole | null
  org_id: string | null
  loading: boolean
  /** Profilo reale (admin) quando isImpersonating; altrimenti uguale a user */
  actorProfile?: UserProfile | null
  /** Profilo effettivo (target) quando isImpersonating; altrimenti uguale a user */
  effectiveProfile?: UserProfile | null
  /** True se admin sta impersonando un altro utente */
  isImpersonating?: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  /** Invalida cache profilo in-memory e ricarica da DB (es. dopo salvataggio in Impostazioni). */
  refreshUserProfile: () => Promise<void>
}

export interface JWTClaims {
  sub: string
  email: string
  role: UserRole
  org_id: string
  iat: number
  exp: number
}

// Helper per verificare i permessi
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    athlete: 1,
    trainer: 2,
    marketing: 2,
    nutrizionista: 2,
    massaggiatore: 2,
    admin: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Helper per verificare se l'utente può accedere a una risorsa
export const canAccessResource = (
  userOrgId: string | null,
  resourceOrgId: string,
  userRole: UserRole,
  requiredRole: UserRole = 'athlete',
): boolean => {
  return userOrgId === resourceOrgId && hasPermission(userRole, requiredRole)
}
