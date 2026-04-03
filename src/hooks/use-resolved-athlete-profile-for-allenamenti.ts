'use client'

import { useAuth } from '@/providers/auth-provider'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'

/**
 * profiles.id per query allenamenti: in preview embed è l'atleta; altrimenti l'utente loggato (atleta).
 */
export function useResolvedAthleteProfileForAllenamenti() {
  const { user, loading: authLoading } = useAuth()
  const { subjectProfileId } = useAthleteAllenamentiPaths()

  const isValidUser = Boolean(user && isValidProfile(user))
  const fromAuth = isValidUser && user?.id && isValidUUID(user.id) ? user.id : null
  const athleteProfileId = subjectProfileId ?? fromAuth

  return { athleteProfileId, authLoading }
}
