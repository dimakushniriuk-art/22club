'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { handleApiError } from '@/lib/error-handler'
import { useSupabaseWithRetry } from './use-api-with-retry'
import { queryKeys } from '@/lib/query-keys'
import { fetchClientiList, fetchClientiStats } from '@/lib/clienti/fetch-clienti-data'
import type { Cliente, ClienteFilters, ClienteSort, ClienteStats } from '@/types/cliente'

interface UseClientiOptions {
  filters?: Partial<ClienteFilters>
  sort?: ClienteSort
  page?: number
  pageSize?: number
  realtime?: boolean
  /** Se false, la query lista non parte (es. defer dopo altri dati). Default true. */
  listQueryEnabled?: boolean
}

interface UseClientiReturn {
  clienti: Cliente[]
  stats: ClienteStats
  total: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateCliente: (id: string, updates: Partial<Cliente>) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
}

const defaultFilters: ClienteFilters = {
  search: '',
  stato: 'tutti',
  dataIscrizioneDa: null,
  dataIscrizioneA: null,
  allenamenti_min: null,
  solo_documenti_scadenza: false,
  tags: [],
}

const emptyStats = {
  totali: 0,
  attivi: 0,
  inattivi: 0,
  nuovi_mese: 0,
  documenti_scadenza: 0,
}

export function useClienti(options: UseClientiOptions = {}): UseClientiReturn {
  const {
    filters = defaultFilters,
    sort = { field: 'data_iscrizione', direction: 'desc' },
    page = 1,
    pageSize = 20,
    realtime = false,
    listQueryEnabled: listQueryEnabledOption = true,
  } = options

  const listQueryActive = listQueryEnabledOption !== false

  const isTestEnv =
    process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.VITEST === '1'

  const { user: authProfile, loading: authLoading } = useAuth()
  const userId = authProfile?.user_id ?? authProfile?.id ?? null
  const { executeSupabaseCall } = useSupabaseWithRetry()
  const queryClient = useQueryClient()

  const mergedFilters = useMemo(() => ({ ...defaultFilters, ...filters }), [filters])

  const paramsKey = useMemo(
    () =>
      JSON.stringify({
        filters: {
          search: mergedFilters.search || '',
          stato: mergedFilters.stato || 'tutti',
          dataIscrizioneDa: mergedFilters.dataIscrizioneDa || null,
          dataIscrizioneA: mergedFilters.dataIscrizioneA || null,
          allenamenti_min: mergedFilters.allenamenti_min || null,
          solo_documenti_scadenza: mergedFilters.solo_documenti_scadenza || false,
          tags: mergedFilters.tags || [],
        },
        sort: {
          field: sort.field,
          direction: sort.direction,
        },
        page,
        pageSize,
      }),
    [
      mergedFilters.search,
      mergedFilters.stato,
      mergedFilters.dataIscrizioneDa,
      mergedFilters.dataIscrizioneA,
      mergedFilters.allenamenti_min,
      mergedFilters.solo_documenti_scadenza,
      mergedFilters.tags,
      sort.field,
      sort.direction,
      page,
      pageSize,
    ],
  )

  const listEnabled = !authLoading && (!!userId || isTestEnv)

  const listQuery = useQuery({
    queryKey: [...queryKeys.clienti.all, 'list', userId ?? '_', paramsKey] as const,
    queryFn: () =>
      fetchClientiList({
        filters: mergedFilters,
        sort,
        page,
        pageSize,
        userId,
        skipAuthCheck: isTestEnv && !userId,
      }),
    enabled: listEnabled && listQueryActive,
  })

  const statsQuery = useQuery({
    queryKey: queryKeys.clienti.stats,
    queryFn: fetchClientiStats,
    enabled: listEnabled,
    staleTime: 2 * 60 * 1000,
  })

  const refetchAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.clienti.all })
  }, [queryClient])

  const updateCliente = useCallback(
    async (id: string, updates: Partial<Cliente>) => {
      try {
        const profileUpdates: Record<string, unknown> = {}
        if (updates.nome !== undefined) profileUpdates.nome = updates.nome
        if (updates.cognome !== undefined) profileUpdates.cognome = updates.cognome
        if (updates.email !== undefined) profileUpdates.email = updates.email
        if (updates.phone !== undefined) profileUpdates.phone = updates.phone
        if (updates.avatar_url !== undefined) profileUpdates.avatar = updates.avatar_url
        if (updates.note !== undefined) profileUpdates.note = updates.note
        if (updates.stato !== undefined) profileUpdates.stato = updates.stato

        await executeSupabaseCall(
          async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateError } = await (supabase.from('profiles') as any)
              .update(profileUpdates as Record<string, unknown>)
              .eq('id', id)

            if (updateError) {
              return { data: null, error: updateError }
            }
            return { data: null, error: null }
          },
          { context: 'useClienti.updateCliente' },
        )

        await refetchAll()
      } catch (err) {
        const apiError = handleApiError(err, 'useClienti.updateCliente')
        throw new Error(apiError.message)
      }
    },
    [executeSupabaseCall, refetchAll],
  )

  const deleteCliente = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/athletes/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
          throw new Error(errorData.error || `Errore ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || "Errore nell'eliminazione dell'atleta")
        }

        await refetchAll()
      } catch (err) {
        const apiError = handleApiError(err, 'useClienti.deleteCliente')
        throw new Error(apiError.message)
      }
    },
    [refetchAll],
  )

  useEffect(() => {
    if (!realtime) return

    const channel = supabase
      .channel('clienti-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.athlete',
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.clienti.all })
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [realtime, queryClient])

  const listErr = listQuery.error
  const errorMessage =
    listErr instanceof Error
      ? listErr.message
      : listErr != null &&
          typeof listErr === 'object' &&
          'message' in listErr &&
          typeof (listErr as { message: unknown }).message === 'string'
        ? (listErr as { message: string }).message
        : listErr != null
          ? String(listErr)
          : null

  const loading = authLoading || (listEnabled && listQueryActive && listQuery.isFetching)

  const clienti = listQuery.data?.clienti ?? []
  const total = listQuery.data?.total ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    clienti,
    stats: statsQuery.data ?? emptyStats,
    total,
    totalPages,
    loading,
    error: errorMessage,
    refetch: refetchAll,
    updateCliente,
    deleteCliente,
  }
}
