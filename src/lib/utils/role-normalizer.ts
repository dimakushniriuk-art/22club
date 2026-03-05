'use client'

import { createLogger } from '@/lib/logger'
import { useMemo } from 'react'

const logger = createLogger('utils:role-normalizer')

/**
 * Ruoli canonici (nessun alias legacy pt/atleta/staff/owner).
 * admin, trainer, athlete, marketing, nutrizionista, massaggiatore.
 */
export type NormalizedRole =
  | 'admin'
  | 'trainer'
  | 'athlete'
  | 'marketing'
  | 'nutrizionista'
  | 'massaggiatore'
  | null

/**
 * Normalizza un ruolo in formato canonico.
 * pt → trainer, atleta → athlete, owner → admin, staff → trainer.
 */
export function normalizeRole(role: string | null | undefined): NormalizedRole {
  if (!role) {
    return null
  }

  const normalized = role.trim().toLowerCase()

  if (normalized === 'pt' || normalized === 'trainer' || normalized === 'staff') {
    return 'trainer'
  }
  if (normalized === 'atleta' || normalized === 'athlete') {
    return 'athlete'
  }
  if (normalized === 'admin' || normalized === 'owner') {
    return 'admin'
  }
  if (normalized === 'nutrizionista' || normalized === 'massaggiatore') {
    return normalized as 'nutrizionista' | 'massaggiatore'
  }
  if (normalized === 'marketing') {
    return 'marketing'
  }

  logger.warn('Ruolo non riconosciuto', undefined, {
    originalRole: role,
    normalizedRole: normalized,
  })
  return null
}

export function useNormalizedRole(role: string | null | undefined): NormalizedRole {
  return useMemo(() => normalizeRole(role), [role])
}

/** Tipo legacy mantenuto per compatibilità; valori canonici. */
export type LegacyRole = NormalizedRole

export function isValidLegacyRole(value: unknown): value is LegacyRole {
  return (
    value === 'admin' ||
    value === 'trainer' ||
    value === 'athlete' ||
    value === 'marketing' ||
    value === 'nutrizionista' ||
    value === 'massaggiatore' ||
    value === null
  )
}

/** Ritorna il ruolo canonico (identità dopo normalizzazione). */
export function toLegacyRole(normalizedRole: NormalizedRole): LegacyRole {
  return normalizedRole
}

/** Accetta ruolo canonico; ritorna come NormalizedRole (identità). */
export function fromLegacyRole(legacyRole: LegacyRole): NormalizedRole {
  return legacyRole
}

/**
 * Normalizza direttamente al formato canonico (trainer, athlete, ...).
 */
export function normalizeRoleToLegacy(role: string | null | undefined): LegacyRole {
  return normalizeRole(role)
}

export function useNormalizedRoleToLegacy(role: string | null | undefined): LegacyRole {
  return useMemo(() => normalizeRoleToLegacy(role), [role])
}
