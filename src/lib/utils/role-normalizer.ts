'use client'

import { createLogger } from '@/lib/logger'
import { useMemo } from 'react'

const logger = createLogger('utils:role-normalizer')

/**
 * Tipo per ruolo normalizzato
 * - 'admin': Amministratore
 * - 'pt': Personal Trainer (normalizzato da 'pt' o 'trainer')
 * - 'atleta': Atleta (normalizzato da 'atleta' o 'athlete')
 * - 'nutrizionista': Nutrizionista
 * - 'massaggiatore': Massaggiatore
 * - null: Ruolo non riconosciuto o non disponibile
 */
export type NormalizedRole = 'admin' | 'pt' | 'atleta' | 'nutrizionista' | 'massaggiatore' | null

/**
 * Tipo per ruolo in formato legacy (usato da useAppointments e altri hook)
 * - 'admin': Amministratore
 * - 'trainer': Personal Trainer (formato legacy)
 * - 'athlete': Atleta (formato legacy)
 * - 'nutrizionista': Nutrizionista
 * - 'massaggiatore': Massaggiatore
 * - null: Ruolo non riconosciuto o non disponibile
 */
export type LegacyRole = 'admin' | 'trainer' | 'athlete' | 'nutrizionista' | 'massaggiatore' | null

/**
 * Normalizza un ruolo utente in un formato standardizzato
 *
 * Mappatura:
 * - 'pt' o 'trainer' → 'pt'
 * - 'atleta' o 'athlete' → 'atleta'
 * - 'admin' o 'owner' → 'admin'
 * - Altri valori → null (con warning)
 *
 * @param role - Il ruolo da normalizzare (può essere stringa, null o undefined)
 * @returns Ruolo normalizzato o null se non riconosciuto
 */
export function normalizeRole(role: string | null | undefined): NormalizedRole {
  if (!role) {
    return null
  }

  const normalized = role.trim().toLowerCase()

  // Mappatura completa
  if (normalized === 'pt' || normalized === 'trainer') {
    return 'pt'
  }

  if (normalized === 'atleta' || normalized === 'athlete') {
    return 'atleta'
  }

  if (normalized === 'admin' || normalized === 'owner') {
    return 'admin'
  }

  if (normalized === 'nutrizionista') {
    return 'nutrizionista'
  }

  if (normalized === 'massaggiatore') {
    return 'massaggiatore'
  }

  // Ruolo non riconosciuto - logga warning
  logger.warn('Ruolo non riconosciuto', undefined, {
    originalRole: role,
    normalizedRole: normalized,
  })

  return null
}

/**
 * Hook per normalizzare un ruolo con memoization
 *
 * @param role - Il ruolo da normalizzare
 * @returns Ruolo normalizzato (memoizzato)
 */
export function useNormalizedRole(role: string | null | undefined): NormalizedRole {
  return useMemo(() => normalizeRole(role), [role])
}

/**
 * Converte NormalizedRole in formato legacy per compatibilità
 * (usato da use-auth.ts che restituisce 'trainer' e 'athlete')
 *
 * @param normalizedRole - Ruolo normalizzato
 * @returns Ruolo in formato legacy ('admin' | 'trainer' | 'athlete' | null)
 */
/**
 * Type guard per verificare se un valore è un LegacyRole valido
 */
export function isValidLegacyRole(value: unknown): value is LegacyRole {
  return value === 'admin' || value === 'trainer' || value === 'athlete' || value === 'nutrizionista' || value === 'massaggiatore' || value === null
}

export function toLegacyRole(normalizedRole: NormalizedRole): LegacyRole {
  if (!normalizedRole) return null

  if (normalizedRole === 'pt') return 'trainer'
  if (normalizedRole === 'atleta') return 'athlete'
  if (normalizedRole === 'admin') return 'admin'
  if (normalizedRole === 'nutrizionista') return 'nutrizionista'
  if (normalizedRole === 'massaggiatore') return 'massaggiatore'

  return null
}

/**
 * Converte ruolo legacy in NormalizedRole
 *
 * @param legacyRole - Ruolo in formato legacy
 * @returns Ruolo normalizzato
 */
export function fromLegacyRole(legacyRole: LegacyRole): NormalizedRole {
  if (!legacyRole) return null

  if (legacyRole === 'trainer') return 'pt'
  if (legacyRole === 'athlete') return 'atleta'
  if (legacyRole === 'admin') return 'admin'
  if (legacyRole === 'nutrizionista') return 'nutrizionista'
  if (legacyRole === 'massaggiatore') return 'massaggiatore'

  return null
}

/**
 * Normalizza un ruolo direttamente al formato legacy in un unico passaggio
 * Evita doppia normalizzazione (normalize + toLegacy)
 *
 * @param role - Il ruolo da normalizzare (può essere stringa, null o undefined)
 * @returns Ruolo in formato legacy ('admin' | 'trainer' | 'athlete' | null)
 */
export function normalizeRoleToLegacy(role: string | null | undefined): LegacyRole {
  if (!role) {
    return null
  }

  const normalized = role.trim().toLowerCase()

  // Mappatura completa a formato legacy
  if (normalized === 'pt' || normalized === 'trainer') {
    return 'trainer'
  }

  if (normalized === 'atleta' || normalized === 'athlete') {
    return 'athlete'
  }

  if (normalized === 'admin' || normalized === 'owner') {
    return 'admin'
  }

  if (normalized === 'nutrizionista') {
    return 'nutrizionista'
  }

  if (normalized === 'massaggiatore') {
    return 'massaggiatore'
  }

  // Ruolo non riconosciuto - logga warning
  logger.warn('Ruolo non riconosciuto per normalizzazione legacy', undefined, {
    originalRole: role,
    normalizedRole: normalized,
  })

  return null
}

/**
 * Hook per normalizzare un ruolo direttamente al formato legacy con memoization
 * Evita doppia normalizzazione (normalize + toLegacy)
 *
 * @param role - Il ruolo da normalizzare
 * @returns Ruolo in formato legacy (memoizzato)
 */
export function useNormalizedRoleToLegacy(role: string | null | undefined): LegacyRole {
  return useMemo(() => normalizeRoleToLegacy(role), [role])
}
