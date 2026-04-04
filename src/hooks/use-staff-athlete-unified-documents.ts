'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAllAthleteDocuments,
  mapUnifiedItemsToStaffDocuments,
} from '@/lib/all-athlete-documents'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import type { Document } from '@/types/document'

const logger = createLogger('hooks:use-staff-athlete-unified-documents')

/**
 * Tutti i documenti dell’atleta (tabella `documents` + medico + contratti + fatture),
 * per `/dashboard/documenti?atleta=` — stessa logica di `/home/documenti`.
 */
export function useStaffAthleteUnifiedDocuments(athleteProfileId: string | null) {
  const queryClient = useQueryClient()

  useRealtimeChannel('documents', () => {
    void queryClient.invalidateQueries({ queryKey: ['documents', 'unified-staff'] })
  })

  const q = useQuery({
    queryKey: athleteProfileId
      ? queryKeys.documents.unifiedStaffByAthlete(athleteProfileId)
      : ['documents', 'unified-staff', 'none'],
    enabled: Boolean(athleteProfileId),
    queryFn: async (): Promise<Document[]> => {
      if (!athleteProfileId) return []

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id, nome, cognome')
        .eq('id', athleteProfileId)
        .single()

      if (profileErr) {
        logger.error('Profilo atleta per documenti unificati', profileErr, { athleteProfileId })
        throw profileErr
      }

      const row = profile as {
        user_id?: string | null
        nome?: string | null
        cognome?: string | null
      }
      const displayName = [row.nome, row.cognome].filter(Boolean).join(' ').trim() || null

      const items = await getAllAthleteDocuments(athleteProfileId, row.user_id ?? null)
      return mapUnifiedItemsToStaffDocuments(items, athleteProfileId, displayName)
    },
  })

  return q
}
