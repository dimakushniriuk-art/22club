'use client'

import { useEffect, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { AthleteAllenamentiPreviewProvider } from '@/contexts/athlete-allenamenti-preview-context'
import { isValidUUID } from '@/lib/utils/type-guards'
import { useNormalizedRole } from '@/lib/utils/role-normalizer-client'
import { EmbedPathToParentBridge } from './embed-path-to-parent-bridge'
import { STAFF_WORKOUTS_EMBED_AUTH_REQUIRED } from '@/lib/embed/staff-workouts-embed-events'

export default function EmbedAthleteAllenamentiLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const rawId = typeof params?.athleteProfileId === 'string' ? params.athleteProfileId : ''
  const normalizedRole = useNormalizedRole(user?.role)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.parent === window) return
    if (loading) return
    if (!isValidUUID(rawId)) {
      try {
        window.parent.postMessage(
          {
            type: STAFF_WORKOUTS_EMBED_AUTH_REQUIRED,
            athleteProfileId: rawId,
            reason: 'invalid_athlete_id',
          },
          window.location.origin,
        )
      } catch {
        /* ignore */
      }
      return
    }
    if (!user) {
      try {
        window.parent.postMessage(
          {
            type: STAFF_WORKOUTS_EMBED_AUTH_REQUIRED,
            athleteProfileId: rawId,
            reason: 'no_session',
          },
          window.location.origin,
        )
      } catch {
        /* ignore */
      }
      return
    }
    if (normalizedRole != null && normalizedRole !== 'trainer' && normalizedRole !== 'admin') {
      try {
        window.parent.postMessage(
          {
            type: STAFF_WORKOUTS_EMBED_AUTH_REQUIRED,
            athleteProfileId: rawId,
            reason: 'forbidden_role',
          },
          window.location.origin,
        )
      } catch {
        /* ignore */
      }
    }
  }, [loading, user, rawId, normalizedRole])

  useEffect(() => {
    if (loading || !user) return
    if (!isValidUUID(rawId)) {
      // Dentro iframe: evitare redirect verso dashboard embeddata. Il parent gestisce.
      if (typeof window !== 'undefined' && window.parent !== window) return
      router.replace('/dashboard/workouts')
      return
    }
    if (normalizedRole === 'athlete') {
      if (typeof window !== 'undefined' && window.parent !== window) return
      router.replace('/home/allenamenti')
      return
    }
    // Se il ruolo non è ancora noto (null), non reindirizzare: altrimenti l’iframe caricherebbe /dashboard dentro la colonna.
    if (normalizedRole != null && normalizedRole !== 'trainer' && normalizedRole !== 'admin') {
      const fallback =
        normalizedRole === 'marketing'
          ? '/dashboard/marketing'
          : normalizedRole === 'nutrizionista'
            ? '/dashboard/nutrizionista'
            : normalizedRole === 'massaggiatore'
              ? '/dashboard/massaggiatore'
              : '/dashboard'
      if (typeof window !== 'undefined' && window.parent !== window) return
      router.replace(fallback)
    }
  }, [loading, user, rawId, normalizedRole, router])

  if (!isValidUUID(rawId)) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 text-sm text-text-secondary">
        Caricamento…
      </div>
    )
  }

  const pathBase = `/embed/athlete-allenamenti/${rawId}`

  return (
    <AthleteAllenamentiPreviewProvider value={{ subjectProfileId: rawId, pathBase }}>
      <EmbedPathToParentBridge />
      <div className="min-h-dvh w-full min-w-0">{children}</div>
    </AthleteAllenamentiPreviewProvider>
  )
}
