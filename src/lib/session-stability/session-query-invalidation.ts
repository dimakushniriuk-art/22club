import { queryKeys } from '@/lib/query-keys'

/**
 * Radici `queryKey[0]` da invalidare dopo risveglio tab o TOKEN_REFRESHED.
 * Estendere qui quando si introducono nuove famiglie di query critiche per la dashboard.
 */
const SESSION_INVALIDATION_ROOTS = new Set<string>([
  queryKeys.appointments.all[0],
  queryKeys.documents.all[0],
  queryKeys.allenamenti.all[0],
  queryKeys.progressi.all[0],
  queryKeys.clienti.all[0],
  queryKeys.payments.all[0],
  'notifications',
  'chat',
  'athlete-profile',
  'athlete-profile-complete',
  'athlete-insights',
  'progress-analytics',
  'workout-exercise-stats',
])

export function shouldInvalidateQueryOnSessionResume(queryKey: readonly unknown[]): boolean {
  const first = queryKey[0]
  if (typeof first !== 'string') return false
  return SESSION_INVALIDATION_ROOTS.has(first)
}

export function sessionInvalidationRoots(): ReadonlySet<string> {
  return SESSION_INVALIDATION_ROOTS
}
