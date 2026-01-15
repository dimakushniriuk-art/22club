'use client'

import { createClient } from '@/lib/supabase'
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

  const supabase = createClient()

  const fetchInvitations = useCallback(async () => {
    // Supporta sia 'pt' (legacy) che 'trainer' (normalizzato)
    if (!userId || (role !== 'admin' && role !== 'pt' && role !== 'trainer')) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Controlla cache
      const cacheKey = `invitations:${userId}:${role}:${currentPage}`
      const cached = frequentQueryCache.get<{
        invitations: InvitationWithPT[]
        totalCount: number
        stats: InvitationStats
      }>(cacheKey)

      if (cached && !enablePagination) {
        // Se non usiamo paginazione e abbiamo cache, usa quella
        setInvitations(cached.invitations)
        setTotalCount(cached.totalCount)
        setStats(cached.stats)
        setLoading(false)
        return
      }

      // Query base con count per paginazione
      let query = supabase
        .from('inviti_atleti')
        .select('*', { count: enablePagination ? 'exact' : undefined })
        .order('created_at', { ascending: false })

      // Admin può vedere tutti, PT/Trainer solo i propri
      if (role === 'pt' || role === 'trainer') {
        query = query.eq('pt_id', userId)
      }

      // Applica paginazione se abilitata
      if (enablePagination) {
        const from = currentPage * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error: fetchError, count } = await query.returns<Tables<'inviti_atleti'>[]>()

      if (fetchError) throw fetchError

      // Mappa stati DB → UI: 'accepted' → 'registrato', 'expired' → 'scaduto'
      const mapStatusToStato = (status: string | null): 'inviato' | 'registrato' | 'scaduto' => {
        if (status === 'accepted') return 'registrato'
        if (status === 'expired') return 'scaduto'
        return 'inviato' // Default e 'inviato' restano invariati
      }

      const invitationsData: InvitationWithPT[] = (data ?? []).map((invitation) => ({
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

      // Calcola statistiche (sempre su tutti i dati, non solo la pagina corrente)
      // Per statistiche accurate, potremmo dover fare una query separata
      const statsData = {
        total: count || invitationsData.length,
        inviati: invitationsData.filter((inv) => inv.stato === 'inviato').length,
        registrati: invitationsData.filter((inv) => inv.stato === 'registrato').length,
        scaduti: invitationsData.filter((inv) => inv.stato === 'scaduto').length,
      }

      setInvitations(invitationsData)
      setTotalCount(count || invitationsData.length)
      setStats(statsData)

      // Salva in cache (TTL gestito internamente)
      frequentQueryCache.set(cacheKey, {
        invitations: invitationsData,
        totalCount: count || invitationsData.length,
        stats: statsData,
      })
    } catch (err) {
      logger.error('Error fetching invitations', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli inviti')
    } finally {
      setLoading(false)
    }
  }, [userId, role, supabase, enablePagination, currentPage, pageSize])

  const loadPage = useCallback(async (page: number) => {
    setCurrentPage(page)
    // fetchInvitations verrà chiamato automaticamente quando currentPage cambia
  }, [])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations, currentPage])

  const createInvitation = async (data: CreateInvitationData) => {
    if (!userId) {
      setError('User ID is required to create invitation.')
      return null
    }

    try {
      setError(null)

      // Genera codice invito univoco lato client
      const generateInviteCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
      }

      const inviteCode = generateInviteCode()

      const insertData = {
        codice: inviteCode,
        pt_id: userId,
        nome_atleta: data.nome_atleta,
        email: data.email || '',
        token: inviteCode, // Usa codice come token se richiesto
        stato: 'inviato', // Stato iniziale (colonna NOT NULL)
        status: 'pending', // Status per compatibilità
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      // Log dei dati prima dell'insert per debug
      console.log('[DEBUG] Insert data:', JSON.stringify(insertData, null, 2))
      console.log('[DEBUG] userId:', userId)
      
      const { data: invitation, error: insertError } = await supabase
        .from('inviti_atleti')
        .insert(insertData)
        .select()
        .single()

      // Log dettagliato dell'errore Supabase
      if (insertError) {
        console.error('[DEBUG] Supabase insertError RAW:', insertError)
        console.error('[DEBUG] Supabase insertError keys:', Object.keys(insertError))
        console.error('[DEBUG] Supabase insertError props:', Object.getOwnPropertyNames(insertError))
        console.error('[DEBUG] Supabase insertError message:', insertError.message)
        console.error('[DEBUG] Supabase insertError code:', insertError.code)
        console.error('[DEBUG] Supabase insertError stringified:', JSON.stringify(insertError, Object.getOwnPropertyNames(insertError)))
        throw insertError
      }
      
      console.log('[DEBUG] Insert SUCCESS, invitation:', invitation)

      // Invalida cache
      if (userId) {
        frequentQueryCache.invalidate(`invitations:${userId}:${role}:${currentPage}`)
      }

      // Ricarica gli inviti
      await fetchInvitations()

      return invitation
    } catch (err) {
      // Log dettagliato dell'errore
      const errorDetails = err instanceof Error 
        ? { message: err.message, name: err.name, stack: err.stack }
        : typeof err === 'object' && err !== null
          ? { ...err as Record<string, unknown>, stringified: JSON.stringify(err) }
          : { rawError: String(err) }
      
      logger.error('Error creating invitation', err, { 
        email: data.email,
        userId,
        role,
        errorDetails,
      })
      
      // Estrai messaggio errore Supabase se disponibile
      const supabaseError = err as { message?: string; code?: string; details?: string; hint?: string }
      const errorMessage = supabaseError?.message || supabaseError?.details || supabaseError?.hint || "Errore nella creazione dell'invito"
      
      setError(errorMessage)
      throw err
    }
  }

  const deleteInvitation = async (invitationId: string) => {
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
  }

  const bulkDeleteInvitations = async (ids: string[]) => {
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
  }

  const generateQRCode = (invitationCode: string) => {
    // Production-safe: usa window.location.origin invece di NEXT_PUBLIC_APP_URL
    // Evita problemi di redirect strani su Vercel con dominio custom
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'https://app.22club.it'
    const registrationUrl = `${baseUrl}/registrati?code=${invitationCode}`
    return registrationUrl
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      logger.error('Error copying to clipboard', err)
      return false
    }
  }

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
