'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LessonStats {
  acquired: number
  used: number
}

/**
 * Per una lista di athlete_id restituisce acquistati (somma lessons_purchased da payments completed)
 * e eseguiti (conteggio appointments completati), come nella sezione Abbonamento del profilo atleta.
 * refetchKey: incrementare dopo completamento/annullamento appuntamento per riaggiornare (es. Rimasti 599→598).
 */
export function useLessonStatsBulk(
  athleteIds: string[],
  refetchKey?: number,
): Map<string, LessonStats> {
  const [statsMap, setStatsMap] = useState<Map<string, LessonStats>>(new Map())

  useEffect(() => {
    if (athleteIds.length === 0) {
      setStatsMap(new Map())
      return
    }
    let cancelled = false
    const supabase = createClient()

    Promise.all([
      supabase
        .from('payments')
        .select('athlete_id, lessons_purchased')
        .in('athlete_id', athleteIds)
        .eq('status', 'completed'),
      supabase
        .from('appointments')
        .select('athlete_id')
        .in('athlete_id', athleteIds)
        .eq('status', 'completato'),
    ]).then(([paymentsRes, appointmentsRes]) => {
      if (cancelled) return
      const acquiredByAthlete = new Map<string, number>()
      const usedByAthlete = new Map<string, number>()
      athleteIds.forEach((id) => {
        acquiredByAthlete.set(id, 0)
        usedByAthlete.set(id, 0)
      })
      ;(Array.isArray(paymentsRes.data) ? paymentsRes.data : []).forEach(
        (r: { athlete_id: string; lessons_purchased?: number | null }) => {
          const id = r.athlete_id
          acquiredByAthlete.set(id, (acquiredByAthlete.get(id) ?? 0) + (r.lessons_purchased ?? 0))
        },
      )
      ;(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []).forEach(
        (r: { athlete_id: string | null }) => {
          const id = r.athlete_id
          if (id == null) return
          usedByAthlete.set(id, (usedByAthlete.get(id) ?? 0) + 1)
        },
      )
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
  }, [athleteIds.join(','), refetchKey])

  return statsMap
}
