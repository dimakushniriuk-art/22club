'use client'

import { supabase } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import type { CreateInvitationData, InvitationStats, InvitationWithPT } from '@/types/invitation'
import type { Tables } from '@/types/supabase'
import { useCallback, useEffect, useState } from 'react'

const logger = createLogger('hooks:use-invitations')

const INVITATIONS_PER_PAGE = 50 // Soglia per attivare paginazione
// const CACHE_TTL_MS = 3 * 60 * 1000 // 3 minuti (non utilizzato)

interface UseInvitationsProps {
  userId?: string | null
  role?: string | null
  page?: number
  pageSize?: number
  enablePagination?: boolean
}

interface UseInvitationsReturn {
  invitations: InvitationWithPT[]
  stats: InvitationStats
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  currentPage: number
  totalPages: number
  fetchInvitations: () => Promise<void>
  loadPage: (page: number) => Promise<void>
  createInvitation: (data: CreateInvitationData) => Promise<Tables<'inviti_atleti'> | null>
  deleteInvitation: (invitationId: string) => Promise<boolean>
  bulkDeleteInvitations: (ids: string[]) => Promise<boolean>
  generateQRCode: (invitationCode: string) => string
  copyToClipboard: (text: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useInvitations({
  userId,
  role,
  page: initialPage = 0,
  pageSize = INVITATIONS_PER_PAGE,
  enablePagination = false,
}: UseInvitationsProps): UseInvitationsReturn {
  const [invitations, setInvitations] = useState<InvitationWithPT[]>([])
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    inviati: 0,
    registrati: 0,
    scaduti: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const fetchInvitations = useCallback(async () => {
    if (!userId || (role !== 'admin' && role !== 'trainer')) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const cacheKey = `invitations:${userId}:${role}:${currentPage}`
      const cached = frequentQueryCache.get<{
        invitations: InvitationWithPT[]
        totalCount: number
        stats: InvitationStats
      }>(cacheKey)

      if (cached && !enablePagination) {
        setInvitations(cached.invitations)
        setTotalCount(cached.totalCount)
        setStats(cached.stats)
        setLoading(false)
        return
      }

      // Caricamento lato server (sessione da cookie, evita RLS 42501 dal client)
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
        enablePagination: String(enablePagination),
      })
      const res = await fetch(`/api/invitations?${params.toString()}`)
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          (json as { error?: string }).error || 'Errore nel caricamento degli inviti',
        )
      }

      const rawData = (json as { data?: Tables<'inviti_atleti'>[] }).data ?? []
      const count = (json as { count?: number }).count ?? rawData.length

      const mapStatusToStato = (status: string | null): 'inviato' | 'registrato' | 'scaduto' => {
        if (status === 'accepted') return 'registrato'
        if (status === 'expired') return 'scaduto'
        return 'inviato'
      }

      const invitationsData: InvitationWithPT[] = rawData.map((invitation) => ({
        id: invitation.id ?? '',
        codice: invitation.codice ?? '',
        qr_url: invitation.qr_url ?? null,
        pt_id: invitation.pt_id ?? '',
        nome_atleta: invitation.nome_atleta ?? '',
        email: invitation.email ?? '',
        stato: mapStatusToStato(invitation.status),
        created_at: invitation.created_at ?? new Date().toISOString(),
        accepted_at: invitation.accepted_at ?? null,
        expires_at: invitation.expires_at ?? null,
        pt_nome: '',
        pt_cognome: '',
      }))

      const statsData = {
        total: count,
        inviati: invitationsData.filter((inv) => inv.stato === 'inviato').length,
        registrati: invitationsData.filter((inv) => inv.stato === 'registrato').length,
        scaduti: invitationsData.filter((inv) => inv.stato === 'scaduto').length,
      }

      setInvitations(invitationsData)
      setTotalCount(count)
      setStats(statsData)
      frequentQueryCache.set(cacheKey, {
        invitations: invitationsData,
        totalCount: count,
        stats: statsData,
      })
    } catch (err) {
      logger.error('Error fetching invitations', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli inviti')
    } finally {
      setLoading(false)
    }
  }, [userId, role, enablePagination, currentPage, pageSize])

  const loadPage = useCallback(async (page: number) => {
    setCurrentPage(page)
    // fetchInvitations verrà chiamato automaticamente quando currentPage cambia
  }, [])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations, currentPage])

  const createInvitation = useCallback(
    async (data: CreateInvitationData) => {
      if (!userId) {
        setError('User ID is required to create invitation.')
        return null
      }

      try {
        setError(null)

        const res = await fetch('/api/invitations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome_atleta: data.nome_atleta,
            email: data.email ?? '',
            giorni_validita: data.giorni_validita ?? 7,
          }),
        })

        const responseData = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(
            (responseData as { error?: string }).error || "Errore nella creazione dell'invito",
          )
        }

        const invitation = responseData as Tables<'inviti_atleti'>

        if (userId) {
          frequentQueryCache.invalidate(`invitations:${userId}:${role}:${currentPage}`)
        }
        await fetchInvitations()

        return invitation
      } catch (err) {
        const errorDetails =
          err instanceof Error
            ? { message: err.message, name: err.name, stack: err.stack }
            : typeof err === 'object' && err !== null
              ? { ...(err as Record<string, unknown>), stringified: JSON.stringify(err) }
              : { rawError: String(err) }

        logger.error('Error creating invitation', err, {
          email: data.email,
          userId,
          role,
          errorDetails,
        })

        const supabaseError = err as {
          message?: string
          code?: string
          details?: string
          hint?: string
        }
        const errorMessage =
          supabaseError?.message ||
          supabaseError?.details ||
          supabaseError?.hint ||
          "Errore nella creazione dell'invito"

        setError(errorMessage)
        throw err
      }
    },
    [userId, role, currentPage, fetchInvitations],
  )

  const deleteInvitation = useCallback(async (invitationId: string) => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('inviti_atleti')
        .delete()
        .eq('id', invitationId)

      if (deleteError) throw deleteError

      // Invalida cache
      if (userId) {
        frequentQueryCache.invalidate(`invitations:${userId}:${role}:${currentPage}`)
      }

      // Ricarica gli inviti
      await fetchInvitations()

      return true
    } catch (err) {
      logger.error('Error deleting invitation', err, { invitationId })
      setError(err instanceof Error ? err.message : "Errore nell'eliminazione dell'invito")
      throw err
    }
  }, [userId, role, currentPage, fetchInvitations])

  const bulkDeleteInvitations = useCallback(async (ids: string[]) => {
    if (!ids || ids.length === 0) {
      return false
    }

    try {
      setError(null)

      // Batch DELETE usando .in() invece di loop con delete singoli
      const { error: deleteError } = await supabase.from('inviti_atleti').delete().in('id', ids)

      if (deleteError) throw deleteError

      // Invalida cache
      if (userId) {
        frequentQueryCache.invalidate(`invitations:${userId}:${role}:${currentPage}`)
        // Invalida anche altre pagine potenzialmente interessate
        for (let i = 0; i <= currentPage; i++) {
          frequentQueryCache.invalidate(`invitations:${userId}:${role}:${i}`)
        }
      }

      // Ricarica gli inviti
      await fetchInvitations()

      return true
    } catch (err) {
      logger.error('Error bulk deleting invitations', err, { count: ids.length })
      setError(
        err instanceof Error ? err.message : "Errore nell'eliminazione multipla degli inviti",
      )
      throw err
    }
  }, [userId, role, currentPage, fetchInvitations])

  const generateQRCode = useCallback((invitationCode: string) => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'https://app.22club.it'
    return `${baseUrl}/registrati?codice=${encodeURIComponent(invitationCode)}`
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      logger.error('Error copying to clipboard', err)
      return false
    }
  }, [])

  const totalPages = enablePagination ? Math.ceil(totalCount / pageSize) : 1
  const hasMore = enablePagination ? currentPage < totalPages - 1 : false

  return {
    invitations,
    stats,
    loading,
    error,
    totalCount,
    hasMore,
    currentPage,
    totalPages,
    fetchInvitations,
    loadPage,
    refetch: fetchInvitations, // Alias for compatibility
    createInvitation,
    deleteInvitation,
    bulkDeleteInvitations,
    generateQRCode,
    copyToClipboard,
  }
}
