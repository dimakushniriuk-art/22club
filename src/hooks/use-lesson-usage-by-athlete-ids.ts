'use client'

import { useState, useLayoutEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AthleteLessonUsageRow } from '@/lib/credits/athlete-training-lessons-display'
import { lessonUsageByAthleteIds } from '@/lib/credits/athlete-training-lessons-display'
import type { ServiceType } from '@/lib/abbonamenti-service-type'

export type LessonUsageByAthleteIdsState = {
  usageMap: Map<string, AthleteLessonUsageRow>
  loading: boolean
  error: string | null
}

const LESSON_USAGE_FETCH_ERROR = 'Impossibile caricare i crediti lezioni.'

/**
 * Stesso modello di dashboard abbonamenti / tab atleta (ledger + contatore + pagamenti per service_type).
 * refetchKey: incrementare dopo completamento/annullamento appuntamento o pagamenti.
 * useLayoutEffect: `loading` passa a true prima del paint quando compaiono id, riducendo flash “agenda completa”.
 */
export function useLessonUsageByAthleteIdsState(
  athleteIds: string[],
  serviceType: ServiceType,
  refetchKey?: number,
): LessonUsageByAthleteIdsState {
  const idsKey = useMemo(() => [...new Set(athleteIds)].sort().join(','), [athleteIds])

  const [usageMap, setUsageMap] = useState<Map<string, AthleteLessonUsageRow>>(() => new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useLayoutEffect(() => {
    const uniqueIds = idsKey.length === 0 ? [] : idsKey.split(',')
    if (uniqueIds.length === 0) {
      setUsageMap(new Map())
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    let cancelled = false
    const supabase = createClient()

    void lessonUsageByAthleteIds(supabase, uniqueIds, serviceType)
      .then((m) => {
        if (cancelled) return
        setUsageMap(m)
        setLoading(false)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setUsageMap(new Map())
        setLoading(false)
        setError(LESSON_USAGE_FETCH_ERROR)
      })

    return () => {
      cancelled = true
    }
  }, [idsKey, serviceType, refetchKey])

  return { usageMap, loading, error }
}

/**
 * Compat: i consumer esistenti attendono solo la Map.
 */
export function useLessonUsageByAthleteIds(
  athleteIds: string[],
  serviceType: ServiceType,
  refetchKey?: number,
): Map<string, AthleteLessonUsageRow> {
  const { usageMap } = useLessonUsageByAthleteIdsState(athleteIds, serviceType, refetchKey)
  return usageMap
}
