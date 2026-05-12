'use client'

import { useCallback, useEffect, useState } from 'react'
import { hasAthleteExpiredDocuments } from '@/lib/all-athlete-documents'
import { subscribePostgresChanges } from '@/lib/realtimeClient'
import { useRealtimeResubscribeToken } from '@/hooks/useRealtimeChannel'

/**
 * True se in `getAllAthleteDocuments` c’è almeno un elemento con `status === 'scaduto'`
 * (stessa logica della pagina /home/documenti). Tile DOCUMENTI su /home: pallino giallo.
 */
export function useAthleteDocumentsExpiredDot(
  profileId: string | null,
  athleteUserId: string | null,
  enabled = true,
): boolean {
  const [hasExpired, setHasExpired] = useState(false)
  const resubscribeToken = useRealtimeResubscribeToken()

  const refresh = useCallback(async () => {
    if (!profileId || !enabled) {
      setHasExpired(false)
      return
    }
    try {
      setHasExpired(await hasAthleteExpiredDocuments(profileId, athleteUserId))
    } catch {
      setHasExpired(false)
    }
  }, [profileId, athleteUserId, enabled])

  useEffect(() => {
    if (!enabled) {
      setHasExpired(false)
      return
    }
    void refresh()
  }, [refresh, enabled])

  useEffect(() => {
    if (!enabled) return

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh, enabled])

  /** Best-effort: variazioni su `documents` (altre fonti = refresh al focus). */
  useEffect(() => {
    if (!profileId || !enabled) return

    return subscribePostgresChanges(`home-athlete-doc-expired:${profileId}`, [
      {
        event: 'INSERT',
        schema: 'public',
        table: 'documents',
        filter: `athlete_id=eq.${profileId}`,
        onEvent: () => void refresh(),
      },
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'documents',
        filter: `athlete_id=eq.${profileId}`,
        onEvent: () => void refresh(),
      },
      {
        event: 'DELETE',
        schema: 'public',
        table: 'documents',
        filter: `athlete_id=eq.${profileId}`,
        onEvent: () => void refresh(),
      },
    ])
  }, [profileId, refresh, resubscribeToken, enabled])

  return hasExpired
}
