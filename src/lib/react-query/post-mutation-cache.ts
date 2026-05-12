/**
 * Invalidazioni React Query e sync profilo auth dopo mutazioni lato client.
 * Centralizza pattern ripetuti (evita UI obsoleta senza F5).
 */

import type { QueryClient } from '@tanstack/react-query'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import { athleteAnagraficaKeys } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import { queryKeys } from '@/lib/query-keys'

export async function invalidateAthleteAnagraficaAll(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: athleteAnagraficaKeys.all })
}

export async function invalidateAllenamentiQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.allenamenti.all })
}

export async function invalidateWorkoutExerciseStatsQueries(
  queryClient: QueryClient,
  athleteId?: string | null,
): Promise<void> {
  if (athleteId) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.progressi.workoutExerciseStats(athleteId),
    })
    return
  }
  await queryClient.invalidateQueries({ queryKey: ['progressi', 'workout-exercise-stats'] })
}

/** Dopo scrittura su workout_logs / workout_sets lato atleta. */
export async function invalidateAfterWorkoutSessionWrite(
  queryClient: QueryClient,
  athleteUserId?: string | null,
): Promise<void> {
  await invalidateAllenamentiQueries(queryClient)
  await invalidateWorkoutExerciseStatsQueries(queryClient, athleteUserId)
}

export async function invalidateClientiQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.clienti.all })
  await queryClient.invalidateQueries({ queryKey: ['clienti', 'massaggiatore-list'] })
  await queryClient.invalidateQueries({ queryKey: ['clienti', 'massaggiatore-detail'] })
  await queryClient.invalidateQueries({ queryKey: ['clienti', 'nutrizionista-list'] })
  await queryClient.invalidateQueries({ queryKey: ['nutrition', 'settings-bootstrap'] })
  await queryClient.invalidateQueries({ queryKey: ['nutrition', 'checkins-list'] })
  await queryClient.invalidateQueries({ queryKey: ['nutrition', 'weekly-analysis'] })
  await queryClient.invalidateQueries({ queryKey: ['nutrition', 'progress-overview'] })
  await queryClient.invalidateQueries({ queryKey: ['nutrition', 'plans-list'] })
  await queryClient.invalidateQueries({ queryKey: ['dashboard', 'massaggiatore-stats'] })
  await queryClient.invalidateQueries({ queryKey: ['dashboard', 'nutrizionista-stats'] })
}

export async function invalidateProgressAnalyticsQueries(
  queryClient: QueryClient,
  athleteUserId?: string | null,
): Promise<void> {
  if (athleteUserId) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.progressi.analytics(athleteUserId),
    })
    return
  }
  await queryClient.invalidateQueries({ queryKey: ['progressi', 'analytics'] })
}

export async function invalidateProgressPhotosQueries(
  queryClient: QueryClient,
  athleteProfileId?: string | null,
): Promise<void> {
  if (athleteProfileId) {
    await queryClient.invalidateQueries({
      queryKey: ['progressi', 'photos', athleteProfileId],
    })
    return
  }
  await queryClient.invalidateQueries({ queryKey: ['progressi', 'photos'] })
}

/** @deprecated Usare `invalidateProgressPhotosQueries` (React Query). */
export function invalidateProgressPhotosFrequentCache(userId: string | null | undefined): void {
  if (!userId) return
  frequentQueryCache.invalidatePrefix(`progress-photos:${userId}`)
}

export async function invalidateDocumentsQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
  await queryClient.invalidateQueries({ queryKey: ['nutrition', 'documents-list'] })
}

export async function invalidateAppointmentsQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
  await queryClient.invalidateQueries({ queryKey: ['dashboard', 'massaggiatore-stats'] })
  await queryClient.invalidateQueries({ queryKey: ['dashboard', 'nutrizionista-stats'] })
}

export async function invalidateStaffCommunicationsListQueries(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['communications', 'staff-list'] })
}

export async function invalidateStaffNotificationsListQueries(
  queryClient: QueryClient,
  userId?: string | null,
): Promise<void> {
  if (userId) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.staffList(userId),
    })
    return
  }
  await queryClient.invalidateQueries({ queryKey: ['notifications', 'staff-list'] })
}

export async function invalidateUserSettingsQueries(
  queryClient: QueryClient,
  authUserId?: string | null,
): Promise<void> {
  if (authUserId) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.userSettings.byAuthUser(authUserId),
    })
    return
  }
  await queryClient.invalidateQueries({ queryKey: ['user-settings'] })
}

export async function invalidatePaymentsQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
  await queryClient.invalidateQueries({ queryKey: ['dashboard', 'massaggiatore-stats'] })
  await queryClient.invalidateQueries({ queryKey: ['dashboard', 'nutrizionista-stats'] })
}

export async function invalidateAbbonamentiStaffListQueries(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['payments', 'abbonamenti-staff-list'] })
}

export async function invalidateStaffAthletePaymentsPageQueries(
  queryClient: QueryClient,
  athleteId?: string | null,
  serviceType?: string | null,
): Promise<void> {
  if (athleteId && serviceType) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.payments.staffAthletePage(athleteId, serviceType),
    })
    return
  }
  await queryClient.invalidateQueries({ queryKey: ['payments', 'staff-athlete-page'] })
}

/** Per liste che usano `queryKeys.progressi` (distinto da `progress-analytics`). */
export async function invalidateProgressiQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.progressi.all })
}

function isAthleteDomainQueryHead(head: unknown): boolean {
  if (typeof head !== 'string') return false
  if (head.startsWith('athlete-')) return true
  return head === 'athlete-profile-complete' || head === 'athlete-insights'
}

/** Staff ha aggiornato dati atleta: svuota cache domini profilo/overview (chiavi `athlete-*`). */
export async function invalidateAllAthleteDomainQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({
    predicate: (q) => isAthleteDomainQueryHead(q.queryKey[0]),
  })
}

/**
 * Dopo UPDATE su `profiles` della riga dell’utente loggato: ricarica Auth + anagrafica in cache.
 * `authProfileId` e `updatedProfileId` sono entrambi `profiles.id`.
 */
export async function syncAuthContextAfterOwnProfilesRowUpdate(
  queryClient: QueryClient,
  args: {
    authProfileId: string | null | undefined
    updatedProfileId: string
    refreshUserProfile: () => Promise<void>
  },
): Promise<void> {
  if (!args.authProfileId || args.authProfileId !== args.updatedProfileId) return
  await invalidateAthleteAnagraficaAll(queryClient)
  await args.refreshUserProfile()
}
