'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import type { ProgressPhoto } from '@/types/progress'

const logger = createLogger('hooks:use-progress-photos')

const PHOTOS_PER_PAGE = 20
// const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minuti (non utilizzato)

interface UseProgressPhotosProps {
  userId?: string | null
  role?: string | null
  angle?: 'fronte' | 'profilo' | 'retro' | null
  dateFilter?: string | null // Filtro per data (YYYY-MM-DD)
}

interface UseProgressPhotosReturn {
  photos: ProgressPhoto[]
  loading: boolean
  error: string | null
  hasMore: boolean
  totalCount: number
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  filterByAngle: (angle: 'fronte' | 'profilo' | 'retro' | null) => void
  filterByDate: (date: string | null) => void
}

export function useProgressPhotos({
  userId,
  role,
  angle: initialAngle = null,
  dateFilter: initialDateFilter = null,
}: UseProgressPhotosProps): UseProgressPhotosReturn {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [angle, setAngle] = useState<'fronte' | 'profilo' | 'retro' | null>(initialAngle)
  const [dateFilter, setDateFilter] = useState<string | null>(initialDateFilter)

  const supabase = createClient()
  const loadingRef = useRef(false)

  // Costruisce chiave cache basata su filtri
  const getCacheKey = useCallback(
    (page: number) => {
      const parts = ['progress-photos', userId || 'all', page.toString()]
      if (angle) parts.push(`angle:${angle}`)
      if (dateFilter) parts.push(`date:${dateFilter}`)
      return parts.join(':')
    },
    [userId, angle, dateFilter],
  )

  // Carica foto con paginazione
  const fetchPhotos = useCallback(
    async (page: number, append: boolean = false) => {
      if (!userId || loadingRef.current) return

      try {
        loadingRef.current = true
        setError(null)

        // Controlla cache
        const cacheKey = getCacheKey(page)
        const cached = frequentQueryCache.get<{
          photos: ProgressPhoto[]
          totalCount: number
        }>(cacheKey)

        if (cached && append) {
          // Se stiamo appendendo e abbiamo cache, usa quella
          setPhotos((prev) => [...prev, ...cached.photos])
          setTotalCount(cached.totalCount)
          setHasMore(cached.photos.length === PHOTOS_PER_PAGE)
          setCurrentPage(page)
          loadingRef.current = false
          return
        }

        // Query base
        let query = supabase.from('progress_photos').select('*', { count: 'exact' })

        // Filtri per ruolo
        if (role === 'atleta' && userId) {
          query = query.eq('athlete_id', userId)
        }
        // Staff può vedere tutte le foto (nessun filtro aggiuntivo)

        // Filtro per angolo
        if (angle) {
          query = query.eq('angle', angle)
        }

        // Filtro per data
        if (dateFilter) {
          query = query.eq('date', dateFilter)
        }

        // Paginazione
        const from = page * PHOTOS_PER_PAGE
        const to = from + PHOTOS_PER_PAGE - 1

        const {
          data,
          error: fetchError,
          count,
        } = await query
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .range(from, to)

        if (fetchError) throw fetchError

        const fetchedPhotos = (data || []) as ProgressPhoto[]
        const total = count || 0

        // Salva in cache
        frequentQueryCache.set(cacheKey, { photos: fetchedPhotos, totalCount: total })

        // Aggiorna stato
        if (append) {
          setPhotos((prev) => [...prev, ...fetchedPhotos])
        } else {
          setPhotos(fetchedPhotos)
        }

        setTotalCount(total)
        setHasMore(fetchedPhotos.length === PHOTOS_PER_PAGE && from + fetchedPhotos.length < total)
        setCurrentPage(page)
      } catch (err) {
        logger.error('Error fetching progress photos', err, { userId, page, angle, dateFilter })
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle foto')
      } finally {
        loadingRef.current = false
        setLoading(false)
      }
    },
    [userId, role, angle, dateFilter, supabase, getCacheKey],
  )

  // Carica più foto (paginazione)
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return
    await fetchPhotos(currentPage + 1, true)
  }, [hasMore, currentPage, fetchPhotos])

  // Refresh completo
  const refresh = useCallback(async () => {
    // Invalida cache per questo utente
    if (userId) {
      for (let i = 0; i <= currentPage; i++) {
        frequentQueryCache.invalidate(getCacheKey(i))
      }
    }
    setCurrentPage(0)
    setLoading(true)
    await fetchPhotos(0, false)
  }, [userId, currentPage, fetchPhotos, getCacheKey])

  // Filtra per angolo
  const filterByAngle = useCallback(
    (newAngle: 'fronte' | 'profilo' | 'retro' | null) => {
      setAngle(newAngle)
      setCurrentPage(0)
      setLoading(true)
      // Invalida cache quando cambia filtro
      if (userId) {
        for (let i = 0; i <= currentPage; i++) {
          frequentQueryCache.invalidate(getCacheKey(i))
        }
      }
    },
    [userId, currentPage, getCacheKey],
  )

  // Filtra per data
  const filterByDate = useCallback(
    (date: string | null) => {
      setDateFilter(date)
      setCurrentPage(0)
      setLoading(true)
      // Invalida cache quando cambia filtro
      if (userId) {
        for (let i = 0; i <= currentPage; i++) {
          frequentQueryCache.invalidate(getCacheKey(i))
        }
      }
    },
    [userId, currentPage, getCacheKey],
  )

  // Carica iniziale
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchPhotos(0, false)
  }, [userId, fetchPhotos])

  // Ricarica quando cambiano i filtri
  useEffect(() => {
    if (!userId) return
    fetchPhotos(0, false)
  }, [angle, dateFilter, userId, fetchPhotos])

  return {
    photos,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    filterByAngle,
    filterByDate,
  }
}
