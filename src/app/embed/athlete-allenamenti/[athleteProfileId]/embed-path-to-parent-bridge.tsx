'use client'

import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import {
  EMBED_ATHLETE_PATH_UPDATE,
  isValidEmbedPathForAthlete,
} from '@/lib/embed/staff-workouts-embed-path'
import { isValidUUID } from '@/lib/utils/type-guards'
import {
  STAFF_WORKOUTS_EMBED_CONTEXT,
  STAFF_WORKOUTS_EMBED_READY,
  isStaffWorkoutsEmbedOutboundEvent,
} from '@/lib/embed/staff-workouts-embed-events'

/** Invia al parent (dashboard Workouts) il path corrente: sessionStorage iframe ≠ parent. */
export function EmbedPathToParentBridge() {
  const pathname = usePathname()
  const params = useParams()
  const rawId = typeof params?.athleteProfileId === 'string' ? params.athleteProfileId : ''

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.parent === window) return
    if (!isValidUUID(rawId)) return
    try {
      window.parent.postMessage(
        { type: STAFF_WORKOUTS_EMBED_READY, athleteProfileId: rawId },
        window.location.origin,
      )
    } catch {
      /* ignore */
    }
  }, [rawId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.parent === window) return
    if (!isValidUUID(rawId)) return
    if (!isValidEmbedPathForAthlete(pathname, rawId)) return
    window.parent.postMessage(
      { type: EMBED_ATHLETE_PATH_UPDATE, athleteProfileId: rawId, path: pathname },
      window.location.origin,
    )
  }, [pathname, rawId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.parent === window) return
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as unknown
      if (!isStaffWorkoutsEmbedOutboundEvent(d)) return
      if (d.type !== STAFF_WORKOUTS_EMBED_CONTEXT) return
      if (d.athleteProfileId.trim() !== rawId.trim()) return
      // Per ora non usiamo lo slotId: serve per i prossimi step (dirty/save/invalidate).
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [rawId])

  return null
}
