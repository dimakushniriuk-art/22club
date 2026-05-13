'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { PROGRESS_PHOTOS_LIST_COLUMNS } from '@/lib/progress/progress-photos-columns'
import type { ProgressPhoto } from '@/types/progress'

const logger = createLogger('hooks:use-progress-photos')

const PHOTOS_PER_PAGE = 20

interface UseProgressPhotosProps {
  userId?: string | null
  role?: string | null
  angle?: 'fronte' | 'profilo' | 'retro' | null
  dateFilter?: string | null
}

interface UseProgressPhotosReturn {
  photos: ProgressPhoto[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  filterByAngle: (angle: 'fronte' | 'profilo' | 'retro' | null) => void
  filterByDate: (date: string | null) => void
}

async function fetchProgressPhotosPage(args: {
  userId: string
  role?: string | null
  angle: 'fronte' | 'profilo' | 'retro' | null
  dateFilter: string | null
  page: number
}): Promise<ProgressPhoto[]> {
  let query = supabase.from('progress_photos').select(PROGRESS_PHOTOS_LIST_COLUMNS)

  if (args.role === 'athlete') {
    query = query.eq('athlete_id', args.userId)
  }

  if (args.angle) {
    query = query.eq('angle', args.angle)
  }

  if (args.dateFilter) {
    query = query.eq('date', args.dateFilter)
  }

  const from = args.page * PHOTOS_PER_PAGE
  const to = from + PHOTOS_PER_PAGE - 1

  const { data, error } = await query
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return (data ?? []) as ProgressPhoto[]
}

export function useProgressPhotos({
  userId,
  role,
  angle: initialAngle = null,
  dateFilter: initialDateFilter = null,
}: UseProgressPhotosProps): UseProgressPhotosReturn {
  const queryClient = useQueryClient()
  const [angle, setAngle] = useState<'fronte' | 'profilo' | 'retro' | null>(initialAngle)
  const [dateFilter, setDateFilter] = useState<string | null>(initialDateFilter)

  useEffect(() => {
    setAngle(initialAngle)
  }, [initialAngle])

  useEffect(() => {
    setDateFilter(initialDateFilter)
  }, [initialDateFilter])

  const angleKey = angle ?? 'all'
  const dateKey = dateFilter ?? 'all'

  const query = useInfiniteQuery({
    queryKey: queryKeys.progressi.photos(userId ?? '', angleKey, dateKey),
    queryFn: async ({ pageParam }) => {
      try {
        return await fetchProgressPhotosPage({
          userId: userId!,
          role,
          angle,
          dateFilter,
          page: pageParam,
        })
      } catch (err) {
        logger.error('Error fetching progress photos', err, {
          userId,
          page: pageParam,
          angle,
          dateFilter,
        })
        throw err
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === PHOTOS_PER_PAGE ? lastPageParam + 1 : undefined,
    enabled: Boolean(userId),
    staleTime: 3 * 60 * 1000,
  })

  const photos = query.data?.pages.flat() ?? []
  const loading = query.isLoading || query.isFetchingNextPage
  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? 'Errore nel caricamento delle foto'
        : null
  const hasMore = query.hasNextPage ?? false

  const loadMore = useCallback(async () => {
    if (!hasMore || query.isFetchingNextPage) return
    await query.fetchNextPage()
  }, [hasMore, query])

  const refresh = useCallback(async () => {
    if (!userId) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.progressi.photos(userId, angleKey, dateKey),
    })
    await query.refetch()
  }, [angleKey, dateKey, query, queryClient, userId])

  const filterByAngle = useCallback((newAngle: 'fronte' | 'profilo' | 'retro' | null) => {
    setAngle(newAngle)
  }, [])

  const filterByDate = useCallback((date: string | null) => {
    setDateFilter(date)
  }, [])

  return {
    photos,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    filterByAngle,
    filterByDate,
  }
}
