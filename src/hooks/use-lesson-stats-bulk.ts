'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

export interface LessonStats {
  acquired: number
  used: number
}

/**
 * Per una lista di athlete_id: PT (training) — acquistati da `payments` completed training,
 * eseguiti da somma DEBIT su `credit_ledger` (stessa logica di computeAthleteTrainingLessonUsage).
 * refetchKey: incrementare dopo pagamento / scalatura / appuntamento.
 */
export function useLessonStatsBulk(
  athleteIds: string[],
  refetchKey?: number,
): Map<string, LessonStats> {
  const [statsMap, setStatsMap] = useState<Map<string, LessonStats>>(new Map())
  const athleteIdsKey = athleteIds.join(',')

  useEffect(() => {
    if (athleteIds.length === 0) {
      setStatsMap(new Map())
      return
    }
    let cancelled = false
    const supabase = createClient()

    const paymentsRows: { athlete_id: string; lessons_purchased?: number | null }[] = []
    const ledgerRows: { athlete_id: string; qty?: number | null }[] = []

    const fetchChunks = async () => {
      for (const idChunk of chunkForSupabaseIn(athleteIds)) {
        const [paymentsRes, ledgerRes] = await Promise.all([
          supabase
            .from('payments')
            .select('athlete_id, lessons_purchased')
            .in('athlete_id', idChunk)
            .eq('status', 'completed')
            .eq('service_type', 'training'),
          supabase
            .from('credit_ledger')
            .select('athlete_id, qty')
            .in('athlete_id', idChunk)
            .eq('entry_type', 'DEBIT')
            .eq('service_type', 'training'),
        ])
        paymentsRows.push(...(Array.isArray(paymentsRes.data) ? paymentsRes.data : []))
        ledgerRows.push(...(Array.isArray(ledgerRes.data) ? ledgerRes.data : []))
      }
    }

    fetchChunks().then(() => {
      if (cancelled) return
      const acquiredByAthlete = new Map<string, number>()
      const usedByAthlete = new Map<string, number>()
      athleteIds.forEach((id) => {
        acquiredByAthlete.set(id, 0)
        usedByAthlete.set(id, 0)
      })
      paymentsRows.forEach((r: { athlete_id: string; lessons_purchased?: number | null }) => {
        const id = r.athlete_id
        acquiredByAthlete.set(id, (acquiredByAthlete.get(id) ?? 0) + (r.lessons_purchased ?? 0))
      })
      ledgerRows.forEach((r: { athlete_id: string; qty?: number | null }) => {
        const id = r.athlete_id
        const q = Number(r.qty ?? 0)
        usedByAthlete.set(id, (usedByAthlete.get(id) ?? 0) + Math.max(0, -q))
      })
      const next = new Map<string, LessonStats>()
      athleteIds.forEach((id) => {
        next.set(id, {
          acquired: acquiredByAthlete.get(id) ?? 0,
          used: usedByAthlete.get(id) ?? 0,
        })
      })
      setStatsMap(next)
    })

    return () => {
      cancelled = true
    }
  }, [athleteIds, athleteIdsKey, refetchKey])

  return statsMap
}
