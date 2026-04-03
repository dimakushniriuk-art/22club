'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

/**
 * Restituisce una mappa athlete_id -> count (lezioni rimanenti) per gli atleti indicati.
 * Utile per griglia clienti e altre viste che mostrano il conteggio lezioni.
 * refetchKey: incrementare dopo completamento/annullamento appuntamento per riaggiornare il conteggio.
 */
export function useLessonCounters(athleteIds: string[], refetchKey?: number): Map<string, number> {
  const [rimastiMap, setRimastiMap] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (athleteIds.length === 0) {
      setRimastiMap(new Map())
      return
    }
    let cancelled = false
    const supabase = createClient()
    const mergeCounters = async () => {
      const rows: { athlete_id: string; count: number | null }[] = []
      for (const idChunk of chunkForSupabaseIn(athleteIds)) {
        const res = await supabase
          .from('lesson_counters')
          .select('athlete_id, count')
          .in('athlete_id', idChunk)
        rows.push(...(Array.isArray(res.data) ? res.data : []))
      }
      if (cancelled) return
      const m = new Map<string, number>()
      rows.forEach((r: { athlete_id: string; count: number | null }) =>
        m.set(r.athlete_id, r.count ?? 0),
      )
      setRimastiMap(m)
    }
    void mergeCounters()
    return () => {
      cancelled = true
    }
  }, [athleteIds, refetchKey])

  return rimastiMap
}
