'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchStaffExercisesList } from '@/lib/exercises/fetch-staff-exercises-list'
import { queryKeys } from '@/lib/query-keys'

const STALE_MS = 3 * 60 * 1000

export function useStaffExercisesList() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.exercises.staffList,
    queryFn: fetchStaffExercisesList,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.exercises.staffList })
    await query.refetch()
  }

  return {
    items: query.data ?? [],
    loading: query.isLoading,
    loadError: query.error instanceof Error ? query.error : query.error ? new Error(String(query.error)) : null,
    reload,
    refetch: query.refetch,
  }
}
