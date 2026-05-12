'use client'

import { useQuery } from '@tanstack/react-query'
import { getAllAthleteDocuments } from '@/lib/all-athlete-documents'
import { queryKeys } from '@/lib/query-keys'

/**
 * Lista unificata documenti atleta (`getAllAthleteDocuments`) con cache React Query.
 */
export function useAthleteUnifiedDocuments(
  profileId: string | null,
  athleteUserId: string | null,
) {
  const userKey = athleteUserId ?? ''
  return useQuery({
    queryKey: queryKeys.documents.unifiedAthlete(profileId ?? '', userKey),
    queryFn: () => getAllAthleteDocuments(profileId!, athleteUserId),
    enabled: Boolean(profileId),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
