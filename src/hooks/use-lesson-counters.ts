'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Restituisce una mappa athlete_id -> count (lezioni rimanenti) per gli atleti indicati.
 * Utile per griglia clienti e altre viste che mostrano il conteggio lezioni.
 */
export function useLessonCounters(athleteIds: string[]): Map<string, number> {
  const [rimastiMap, setRimastiMap] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (athleteIds.length === 0) {
      setRimastiMap(new Map())
      return
    }
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('lesson_counters')
      .select('athlete_id, count')
      .in('athlete_id', athleteIds)
      .then((res: { data: unknown }) => {
        if (cancelled) return
        const data = res.data
        const m = new Map<string, number>()
        ;(Array.isArray(data) ? data : []).forEach((r: { athlete_id: string; count: number | null }) =>
          m.set(r.athlete_id, r.count ?? 0),
        )
        setRimastiMap(m)
      })
    return () => {
      cancelled = true
    }
  }, [athleteIds])

  return rimastiMap
}
