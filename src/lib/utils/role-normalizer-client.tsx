'use client'

import { useMemo } from 'react'
import {
  normalizeRole,
  normalizeRoleToLegacy,
  type NormalizedRole,
  type LegacyRole,
} from '@/lib/utils/role-normalizer'

export {
  toLegacyRole,
  fromLegacyRole,
  isValidLegacyRole,
  normalizeRole,
} from '@/lib/utils/role-normalizer'
export type { NormalizedRole, LegacyRole } from '@/lib/utils/role-normalizer'

export function useNormalizedRole(role: string | null | undefined): NormalizedRole {
  return useMemo(() => normalizeRole(role), [role])
}

export function useNormalizedRoleToLegacy(role: string | null | undefined): LegacyRole {
  return useMemo(() => normalizeRoleToLegacy(role), [role])
}
