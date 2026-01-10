'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { extractFileName } from '@/lib/documents'
import { queryKeys } from '@/lib/query-keys'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import type { Document } from '@/types/document'

const logger = createLogger('hooks:use-documents')
import type { Tables } from '@/types/supabase'

interface UseDocumentsProps {
  athleteId?: string | null
  filters?: {
    status?: string
    category?: string
    search?: string
  }
}

type DocumentWithRelations = Tables<'documents'> & {
  updated_at?: string | null
  athlete: Pick<Tables<'profiles'>, 'nome' | 'cognome'> | null
  uploaded_by: Pick<Tables<'profiles'>, 'nome' | 'cognome'> | null
}

export function useDocuments({ athleteId, filters }: UseDocumentsProps = {}) {
  const queryClient = useQueryClient()
  // Create Supabase client once to avoid recreating it on every render
  const supabase = useMemo(() => createClient(), [])

  // Query key basata su athleteId e filtri per cache separata
  const queryKey = useMemo(() => {
    if (athleteId) {
      return queryKeys.documents.byAthlete(athleteId)
    }
    // Include filtri nella key per cache separata quando cambiano
    const filterKey = filters
      ? JSON.stringify({ status: filters.status, category: filters.category })
      : 'all'
    return [...queryKeys.documents.all, filterKey] as const
  }, [athleteId, filters])

  // Fetch documents con React Query
  const {
    data: documents = [],
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select(
          `
          *,
          athlete:profiles!athlete_id(nome, cognome),
          uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
        `,
        )
        .order('created_at', { ascending: false })

      // Apply athlete filter
      if (athleteId) {
        query = query.eq('athlete_id', athleteId)
      }

      // Apply status filter
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      // Apply category filter
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error: queryError } = await query.returns<DocumentWithRelations[]>()

      if (queryError) {
        logger.error('Error fetching documents', queryError, { athleteId, filters })
        throw queryError
      }

      // Transform data to add athlete names
      const transformedData: Document[] =
        data?.map((doc) => {
          const athlete = doc.athlete
          const uploadedBy = doc.uploaded_by

          return {
            id: doc.id,
            athlete_id: doc.athlete_id ?? '',
            file_url: doc.file_url ?? '',
            category: doc.category ?? '',
            status:
              doc.status === 'valido' ||
              doc.status === 'scaduto' ||
              doc.status === 'in-revisione' ||
              doc.status === 'in_scadenza' ||
              doc.status === 'non_valido'
                ? doc.status
                : 'valido',
            expires_at: doc.expires_at ?? null,
            uploaded_by_profile_id: doc.uploaded_by_profile_id ?? '',
            uploaded_by_name: uploadedBy
              ? `${uploadedBy.nome ?? ''} ${uploadedBy.cognome ?? ''}`.trim() || null
              : null,
            notes: doc.notes ?? null,
            created_at: doc.created_at ?? '',
            updated_at: doc.updated_at ?? null,
            athlete_name: athlete
              ? `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim() || null
              : null,
            staff_name: uploadedBy
              ? `${uploadedBy.nome ?? ''} ${uploadedBy.cognome ?? ''}`.trim() || null
              : null,
          }
        }) || []

      // Apply search filter if needed (client-side)
      let finalData = transformedData
      if (filters?.search) {
        finalData = finalData.filter(
          (doc) =>
            extractFileName(doc.file_url).toLowerCase().includes(filters.search!.toLowerCase()) ||
            doc.notes?.toLowerCase().includes(filters.search!.toLowerCase()),
        )
      }

      return finalData
    },
  })

  // Converti error di React Query in string per compatibilità
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Errore nel caricamento dei documenti'
    : null

  // Realtime subscription per aggiornamenti automatici
  useRealtimeChannel('documents', (payload) => {
    // Invalida query quando ci sono cambiamenti (INSERT, UPDATE, DELETE)
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    logger.debug('Realtime document event received', undefined, {
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
    })
  })

  return {
    documents,
    loading,
    error,
    refetch: async () => {
      await refetchQuery()
    },
  }
}
