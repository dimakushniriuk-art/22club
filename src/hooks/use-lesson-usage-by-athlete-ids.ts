'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AthleteLessonUsageRow } from '@/lib/credits/athlete-training-lessons-display'
import { lessonUsageByAthleteIds } from '@/lib/credits/athlete-training-lessons-display'
import type { ServiceType } from '@/lib/abbonamenti-service-type'

/**
 * Stesso modello di dashboard abbonamenti / tab atleta (ledger + contatore + pagamenti per service_type).
 * refetchKey: incrementare dopo completamento/annullamento appuntamento o pagamenti.
 */
export function useLessonUsageByAthleteIds(
  athleteIds: string[],
  serviceType: ServiceType,
  refetchKey?: number,
): Map<string, AthleteLessonUsageRow> {
  const idsKey = useMemo(() => [...new Set(athleteIds)].sort().join(','), [athleteIds])

  const [usageMap, setUsageMap] = useState<Map<string, AthleteLessonUsageRow>>(new Map())

  useEffect(() => {
    const uniqueIds = idsKey.length === 0 ? [] : idsKey.split(',')
    if (uniqueIds.length === 0) {
      setUsageMap(new Map())
      return
    }
    let cancelled = false
    const supabase = createClient()
    lessonUsageByAthleteIds(supabase, uniqueIds, serviceType)
      .then((m) => {
        if (cancelled) return
        setUsageMap(m)
      })
      .catch(() => {
        if (!cancelled) setUsageMap(new Map())
      })
    return () => {
      cancelled = true
    }
  }, [idsKey, serviceType, refetchKey])

  return usageMap
}
