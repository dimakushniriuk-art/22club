'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { readPendingInviteCodice } from '@/lib/auth/athlete-invite'
import { useMyTrainerProfile } from '@/hooks/use-my-trainer-profile'
import { QUESTIONNAIRE_VERSION } from '@/features/welcome-onboarding/constants'
import {
  fetchWelcomeAthleteProfile,
  fetchWelcomeQuestionnaire,
} from '@/features/welcome-onboarding/lib/welcome-onboarding-fetch'
import type { SupabaseExt } from '@/features/welcome-onboarding/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('welcome-onboarding:bootstrap')

type WelcomeBootstrapUser = {
  id: string
  email?: string | null
  user_metadata?: unknown
}

type UseWelcomeOnboardingDataArgs = {
  authUserId: string | undefined
  codiceFromUrl: string
  user: WelcomeBootstrapUser | null | undefined
  supabase: SupabaseClient<Database>
  supabaseExt: SupabaseExt
}

export function useWelcomeOnboardingData({
  authUserId,
  codiceFromUrl,
  user,
  supabase,
  supabaseExt,
}: UseWelcomeOnboardingDataArgs) {
  const completedProfileRef = useRef(false)
  const [bootstrapUserId, setBootstrapUserId] = useState<string | null>(null)
  const [bootstrapLoading, setBootstrapLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        setBootstrapLoading(true)
        let { data: sessionData } = await supabase.auth.getSession()
        let session = sessionData?.session
        let authUser = session?.user
        let userId = authUser?.id ?? authUserId

        if (!userId) {
          await new Promise((resolve) => setTimeout(resolve, 600))
          if (cancelled) return
          const retry = await supabase.auth.getSession()
          sessionData = retry?.data
          session = sessionData?.session
          authUser = session?.user
          userId = authUser?.id ?? authUserId
        }

        if (!userId) {
          if (!cancelled) setBootstrapUserId(null)
          return
        }

        if (!completedProfileRef.current) {
          if (session?.access_token && session?.refresh_token) {
            const codice = codiceFromUrl || readPendingInviteCodice() || ''
            const meta = (authUser?.user_metadata ??
              (user as { user_metadata?: unknown } | null)?.user_metadata) as
              | { nome?: string; cognome?: string }
              | undefined
            const res = await fetch('/api/register/complete-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nome: meta?.nome ?? '',
                cognome: meta?.cognome ?? '',
                email: authUser?.email ?? user?.email ?? '',
                ...(codice && { codice }),
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            })
            if (!cancelled) completedProfileRef.current = true
            if (codice && typeof window !== 'undefined') {
              try {
                sessionStorage.removeItem('pending_invite_codice')
              } catch {
                // ignore
              }
            }
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}))
              logger.warn('complete-profile da welcome fallito', { status: res.status, errData })
            }
          }
        }

        if (!cancelled) setBootstrapUserId(userId)
      } catch (err) {
        if (!cancelled) {
          const msg = (err instanceof Error ? err.message : String(err ?? '')).toLowerCase()
          const isLockOrAbort =
            (err instanceof Error && err.name === 'AbortError') ||
            msg.includes('aborted') ||
            msg.includes('lock broken')
          if (isLockOrAbort) {
            if (process.env.NODE_ENV !== 'production') {
              logger.debug('Welcome bootstrap: lock/abort (transiente)', { userId: authUserId })
            }
          } else {
            logger.error('Welcome bootstrap failed', err, { userId: authUserId })
          }
        }
      } finally {
        if (!cancelled) setBootstrapLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [authUserId, codiceFromUrl, user, supabase, supabaseExt])

  const profileQuery = useQuery({
    queryKey: queryKeys.athlete.welcomeProfile(bootstrapUserId ?? 'pending'),
    queryFn: () => fetchWelcomeAthleteProfile(supabase, bootstrapUserId!),
    enabled: Boolean(bootstrapUserId) && !bootstrapLoading,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const athleteId = profileQuery.data?.id ?? null

  const questionnaireQuery = useQuery({
    queryKey: queryKeys.athlete.welcomeQuestionnaire(athleteId ?? 'pending', QUESTIONNAIRE_VERSION),
    queryFn: () => fetchWelcomeQuestionnaire(supabaseExt, athleteId!, QUESTIONNAIRE_VERSION),
    enabled: Boolean(athleteId) && !bootstrapLoading,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const trainerQuery = useMyTrainerProfile(Boolean(bootstrapUserId) && !bootstrapLoading)

  const isLoading =
    bootstrapLoading ||
    (Boolean(bootstrapUserId) &&
      (profileQuery.isPending || profileQuery.isFetching || trainerQuery.isPending))

  return {
    bootstrapUserId,
    isLoading,
    profileRow: profileQuery.data ?? null,
    questionnaireRow: questionnaireQuery.data ?? null,
    trainerProfile: trainerQuery.data ?? null,
    profileQuery,
    questionnaireQuery,
    trainerQuery,
  }
}
