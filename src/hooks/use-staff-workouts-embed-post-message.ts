'use client'

import { useCallback } from 'react'

type EmbedEventModule = typeof import('@/lib/embed/staff-workouts-embed-events')

let embedEventsPromise: Promise<EmbedEventModule> | null = null

function loadStaffWorkoutsEmbedEvents(): Promise<EmbedEventModule> {
  if (!embedEventsPromise) {
    embedEventsPromise = import('@/lib/embed/staff-workouts-embed-events')
  }
  return embedEventsPromise
}

export function useStaffWorkoutsEmbedPostMessage() {
  const postEmbedDirty = useCallback(async (athleteProfileId: string, dirty: boolean) => {
    const mod = await loadStaffWorkoutsEmbedEvents()
    window.parent.postMessage(
      { type: mod.STAFF_WORKOUTS_EMBED_DIRTY, athleteProfileId, dirty },
      window.location.origin,
    )
  }, [])

  const postEmbedAuthRequired = useCallback(async (athleteProfileId: string) => {
    const mod = await loadStaffWorkoutsEmbedEvents()
    window.parent.postMessage(
      { type: mod.STAFF_WORKOUTS_EMBED_AUTH_REQUIRED, athleteProfileId, reason: 'no_session' },
      window.location.origin,
    )
  }, [])

  return { postEmbedDirty, postEmbedAuthRequired }
}
