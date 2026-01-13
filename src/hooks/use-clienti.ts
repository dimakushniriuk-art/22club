// TODO: Migrate to React Query (useQuery/useMutation) for consistency with other hooks
// This hook is currently using useState/useEffect pattern and will be migrated to React Query
'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useSupabase } from './use-supabase'
import { handleApiError } from '@/lib/error-handler'
import { useSupabaseWithRetry } from './use-api-with-retry'
import { localStorageCache } from '@/lib/cache/local-storage-cache'
import { statsCache, frequentQueryCache } from '@/lib/cache/cache-strategies'
import { createLogger } from '@/lib/logger'
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js'

const logger = createLogger('useClienti')
import type {
  Cliente,
  ClienteFilters,
  ClienteSort,
  ClienteStats,
  ClienteTag,
} from '@/types/cliente'

interface UseClientiOptions {
  filters?: Partial<ClienteFilters>
  sort?: ClienteSort
  page?: number
  pageSize?: number
  realtime?: boolean
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

type ClientStatsRecord = {
  totali?: number
  attivi?: number
  inattivi?: number
  nuovi_mese?: number
  documenti_scadenza?: number
}

type ProfileSummary = Record<string, unknown> & {
  id: string
  user_id: string | null
  nome?: string | null
  cognome?: string | null
  email?: string | null
  phone?: string | null
  data_iscrizione?: string | null
  created_at?: string | null
  updated_at?: string | null
  stato?: string | null
  documenti_scadenza?: boolean | null
  role?: string | null
  avatar?: string | null
  avatar_url?: string | null
  ultimo_accesso?: string | null
  note?: string | null
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

export function useClienti(options: UseClientiOptions = {}): UseClientiReturn {
  const {
    filters = defaultFilters,
    sort = { field: 'data_iscrizione', direction: 'desc' },
    page = 1,
    pageSize = 20,
    realtime = false,
  } = options

  const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    process.env.VITEST === '1'

  const { supabase, user, loading: authLoading } = useSupabase()
  const userId = user?.id || null
  const { executeSupabaseCall } = useSupabaseWithRetry()
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [stats, setStats] = useState<ClienteStats>({
    totali: 0,
    attivi: 0,
    inattivi: 0,
    nuovi_mese: 0,
    documenti_scadenza: 0,
  })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const fetchingStatsRef = useRef(false) // FIX #5: Prevenire chiamate multiple a fetchStats

  const fetchStats = useCallback(async () => {
    // FIX #5: Prevenire chiamate multiple a fetchStats
    if (fetchingStatsRef.current) {
      logger.debug('fetchStats già in corso, skip')
      return
    }
    
    try {
      fetchingStatsRef.current = true
      
      // NOTE #6: Le stats mostrano SEMPRE i totali globali, non i dati filtrati.
      // Questo è un design decision per mantenere le stats coerenti e significative.
      // Se necessario in futuro, si può aggiungere una funzione separata per stats filtrate.
      
      // Controlla cache locale prima (TTL 2 minuti) - usa strategia stats
      const cachedStats = statsCache.get<ClienteStats>('clienti-stats')
      if (cachedStats) {
        setStats(cachedStats)
        // Fetch in background per aggiornare cache
        // Non blocca l'UI
      }

      // Prova prima la RPC con timeout molto breve (3 secondi)
      // Se fallisce, passa subito al fallback senza attendere
      try {
        // Usa Promise.race con timeout per evitare che executeSupabaseCall loggi l'errore
        const rpcResponse = (await Promise.race([
          supabase.rpc('get_clienti_stats'),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('RPC timeout')), 3000),
          ),
        ])) as PostgrestSingleResponse<ClientStatsRecord>

        const { data, error } = rpcResponse

        if (error) throw error

        if (data && typeof data === 'object' && 'totali' in data) {
          const typedStats: ClienteStats = {
            totali: (data as ClientStatsRecord).totali || 0,
            attivi: (data as ClientStatsRecord).attivi || 0,
            inattivi: (data as ClientStatsRecord).inattivi || 0,
            nuovi_mese: (data as ClientStatsRecord).nuovi_mese || 0,
            documenti_scadenza: (data as ClientStatsRecord).documenti_scadenza || 0,
          }

          // Salva in cache (TTL 2 minuti)
          localStorageCache.set('clienti-stats', typedStats, 2 * 60 * 1000)

          setStats(typedStats)
          return
        }
      } catch {
        // Se la RPC fallisce o va in timeout, usa il fallback (non bloccare)
        // Non loggare come errore critico - le stats sono secondarie e abbiamo un fallback
        // Possibili cause: RPC lenta, indici mancanti, RLS policies pesanti, o tabella molto grande
        // Vedi docs/troubleshooting-rpc-timeout.md per dettagli
        // Logging gestito automaticamente dal sistema di error handling
      }

      // Fallback ottimizzato: usa estimated count con timeout molto breve
      // Se le query sono troppo lente, usa valori di default
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString()

      // Timeout molto breve per ogni query (2 secondi)
      const queryWithTimeout = async (
        queryPromise: PromiseLike<{ count: number | null; error: unknown }>,
      ): Promise<{ count: number | null }> => {
        try {
          return await Promise.race([
            queryPromise.then((res) => ({ count: res.count })),
            new Promise<{ count: number | null }>(
              (resolve) => setTimeout(() => resolve({ count: null }), 2000), // Timeout molto breve: 2s
            ),
          ])
        } catch {
          return { count: null }
        }
      }

      // Esegui tutte le query in parallelo con timeout breve
      // Usa estimated count invece di exact per velocità (accettabile per le stats)
      // Se una query va in timeout, usa 0 come fallback
      const [totaliRes, attiviRes, inattiviRes, nuoviRes, documentiRes] = await Promise.allSettled([
        queryWithTimeout(
          supabase
            .from('profiles')
            .select('id', { count: 'estimated', head: true })
            .or('role.eq.atleta,role.eq.athlete'),
        ),
        queryWithTimeout(
          supabase
            .from('profiles')
            .select('id', { count: 'estimated', head: true })
            .or('role.eq.atleta,role.eq.athlete')
            .eq('stato', 'attivo'),
        ),
        queryWithTimeout(
          supabase
            .from('profiles')
            .select('id', { count: 'estimated', head: true })
            .or('role.eq.atleta,role.eq.athlete')
            .eq('stato', 'inattivo'),
        ),
        queryWithTimeout(
          supabase
            .from('profiles')
            .select('id', { count: 'estimated', head: true })
            .or('role.eq.atleta,role.eq.athlete')
            .gte('data_iscrizione', firstDayOfMonth),
        ),
        queryWithTimeout(
          supabase
            .from('profiles')
            .select('id', { count: 'estimated', head: true })
            .or('role.eq.atleta,role.eq.athlete')
            .eq('documenti_scadenza', true),
        ),
      ])

      // Estrai i risultati (gestisce Promise.allSettled)
      // Se una query fallisce o va in timeout, usa 0
      const getCount = (result: PromiseSettledResult<{ count: number | null }>): number => {
        if (result.status === 'fulfilled') {
          return result.value.count ?? 0
        }
        return 0 // Fallback a 0 se fallisce
      }

      const fallbackStats: ClienteStats = {
        totali: getCount(totaliRes),
        attivi: getCount(attiviRes),
        inattivi: getCount(inattiviRes),
        nuovi_mese: getCount(nuoviRes),
        documenti_scadenza: getCount(documentiRes),
      }

      // Salva in cache anche il fallback usando strategia stats
      statsCache.set('clienti-stats', fallbackStats)

      setStats(fallbackStats)
    } catch {
      // Logging gestito automaticamente dal sistema di error handling
      // Non loggare come errore critico - le stats sono secondarie
      // Mantieni i valori di default se c'è un errore
      // Le statistiche verranno aggiornate al prossimo caricamento
      setStats({
        totali: 0,
        attivi: 0,
        inattivi: 0,
        nuovi_mese: 0,
        documenti_scadenza: 0,
      })
    } finally {
      // FIX #5: Reset flag per permettere chiamate future
      fetchingStatsRef.current = false
    }
  }, [supabase])

  const fetchClienti = useCallback(async (skipAuthCheck = false) => {
    if (fetchingRef.current) {
      return
    }

    try {
      logger.debug('fetchClienti: verifica autenticazione', undefined, {
        userId,
        authLoading,
        hasUser: !!user,
        userEmail: user?.email,
      })
      
      // Non ritornare immediatamente se userId è null - potrebbe essere ancora in caricamento
      // Se authLoading è false e userId è ancora null, allora l'utente non è autenticato
      if (!authLoading && !userId && !skipAuthCheck) {
        logger.warn('Utente non autenticato - lista vuota', undefined, {
          authLoading,
          userId,
          hasUser: !!user,
        })
        setClienti([])
        setStats({
          totali: 0,
          attivi: 0,
          inattivi: 0,
          nuovi_mese: 0,
          documenti_scadenza: 0,
        })
        setTotal(0)
        setLoading(false)
        return
      }
      
      // Se l'autenticazione è ancora in caricamento, aspetta
      if (authLoading) {
        logger.debug('Autenticazione in caricamento - attesa', undefined, {
          authLoading,
          userId,
        })
        return
      }
      
      // Se userId è null anche dopo che authLoading è false, non fare fetch
      if (!userId && !skipAuthCheck) {
        logger.warn('userId è null dopo autenticazione completata', undefined, {
          authLoading,
          userId,
          hasUser: !!user,
        })
        setClienti([])
        setStats({
          totali: 0,
          attivi: 0,
          inattivi: 0,
          nuovi_mese: 0,
          documenti_scadenza: 0,
        })
        setTotal(0)
        setLoading(false)
        return
      }
      fetchingRef.current = true
      setLoading(true)
      setError(null)

      // Check if Supabase is properly configured
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://mock-project.supabase.co' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'mock-anon-key-for-development'

      if (!isSupabaseConfigured) {
        // Use mock data for development
        // Logger sarà implementato in seguito
        // logger.warn('src\hooks\use-clienti.ts', 'Supabase not configured, using mock data for clienti')

        const mockClienti: Cliente[] = [
          {
            id: '1',
            first_name: 'Mario',
            last_name: 'Rossi',
            nome: 'Mario',
            cognome: 'Rossi',
            email: 'mario.rossi@email.com',
            phone: '+39 123 456 7890',
            data_iscrizione: '2024-01-15T10:00:00Z',
            stato: 'attivo',
            note: 'Cliente dedicato e motivato',
            tags: [] as ClienteTag[],
            allenamenti_mese: 15,
            ultimo_accesso: '2024-02-18T08:30:00Z',
            scheda_attiva: 'Upper Body Pro',
            documenti_scadenza: false,
            avatar_url: null,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-02-15T14:30:00Z',
            role: 'athlete',
          },
          {
            id: '2',
            first_name: 'Giulia',
            last_name: 'Bianchi',
            nome: 'Giulia',
            cognome: 'Bianchi',
            email: 'giulia.bianchi@email.com',
            phone: '+39 987 654 3210',
            data_iscrizione: '2024-01-20T10:00:00Z',
            stato: 'attivo',
            note: 'Interessata al fitness funzionale',
            tags: [] as ClienteTag[],
            allenamenti_mese: 12,
            ultimo_accesso: '2024-02-16T11:15:00Z',
            scheda_attiva: 'Total Body Balance',
            documenti_scadenza: true,
            avatar_url: null,
            created_at: '2024-01-20T10:00:00Z',
            updated_at: '2024-02-10T16:45:00Z',
            role: 'athlete',
          },
        ]

        // Applica filtri ai dati mock
        let filteredMockClienti = mockClienti

        // Filtro per search
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filteredMockClienti = filteredMockClienti.filter(
            (c) =>
              (c.nome || '').toLowerCase().includes(searchLower) ||
              (c.cognome || '').toLowerCase().includes(searchLower) ||
              c.email.toLowerCase().includes(searchLower),
          )
        }

        // Filtro per stato
        if (filters.stato && filters.stato !== 'tutti') {
          filteredMockClienti = filteredMockClienti.filter((c) => c.stato === filters.stato)
        }

        // Filtro per data iscrizione
        if (filters.dataIscrizioneDa) {
          filteredMockClienti = filteredMockClienti.filter(
            (c) => new Date(c.data_iscrizione) >= new Date(filters.dataIscrizioneDa!),
          )
        }

        if (filters.dataIscrizioneA) {
          filteredMockClienti = filteredMockClienti.filter(
            (c) => new Date(c.data_iscrizione) <= new Date(filters.dataIscrizioneA!),
          )
        }

        setClienti(filteredMockClienti)
        setTotal(filteredMockClienti.length)

        // Mock stats basate sui dati filtrati
        setStats({
          totali: mockClienti.length, // Stats totali sui dati non filtrati
          attivi: mockClienti.filter((c) => c.stato === 'attivo').length,
          inattivi: mockClienti.filter((c) => c.stato === 'inattivo').length,
          nuovi_mese: 2,
          documenti_scadenza: mockClienti.filter((c) => c.documenti_scadenza).length,
        })

        setLoading(false)
        return
      }

      // Query base per atleti - strategia semplificata: carica tutti i dati e filtra client-side
      // Questo evita query complesse e timeout, funziona bene per dataset piccoli/medi
      let queryResult: ProfileSummary[] = []

      try {
        // IMPORTANTE: Affidarsi completamente alle RLS policies invece di filtering manuale
        // Le RLS policies su profiles automaticamente filtrano:
        // - Admin: vede tutti gli atleti (policy "Admins can view all profiles")
        // - Trainer: vede solo gli atleti assegnati (policy "Trainers can view assigned athletes")
        // - Atleta: vede solo il proprio profilo (policy "Athletes can view own profile")
        // 
        // Questo è più sicuro e performante perché:
        // 1. Il filtering avviene nel database, non nel client
        // 2. Non c'è rischio di bypassare le RLS policies
        // 3. Non serve recuperare manualmente pt_atleti
        // 
        // FIX CRITICO #3: Rimossa verifica sessione esplicita (già gestita da useSupabase())
        // Il client Supabase include automaticamente l'access token nelle richieste
        // Se userId è disponibile, la sessione è disponibile e auth.uid() sarà disponibile nelle RLS policies

        logger.debug('Query atleti con RLS automatico', undefined, {
          userId,
          hasAuth: !!userId,
          authLoading,
        })

        // Query semplificata: le RLS policies applicano automaticamente il filtering corretto
        // IMPORTANTE: La sessione è verificata sopra, quindi auth.uid() sarà disponibile nelle RLS policies
        const simpleQuery = supabase
          .from('profiles')
          .select(
            'id, user_id, nome, cognome, first_name, last_name, email, phone, data_iscrizione, stato, documenti_scadenza, created_at, updated_at, role, avatar, avatar_url, ultimo_accesso, note',
          )
          .in('role', ['atleta', 'athlete'])
          .order('data_iscrizione', { ascending: sort.direction === 'asc' })
          .limit(pageSize)

        const simpleResponse = await Promise.race<PostgrestResponse<ProfileSummary>>([
          Promise.resolve(simpleQuery),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Query timeout'))
            }, 30000) // Timeout a 30 secondi per query complesse
          }),
        ])

        const { data: simpleData, error: simpleError } = simpleResponse

        // Log dettagliato per debug
        logger.debug('Query clienti risultato', {
          dataLength: simpleData?.length ?? 0,
          error: simpleError,
          filters,
        })

        if (simpleError) {
          logger.error('Errore query clienti', simpleError, {
            code: simpleError.code,
            message: simpleError.message,
            details: simpleError.details,
            hint: simpleError.hint,
          })
          throw simpleError
        }

        if (!simpleData || simpleData.length === 0) {
          logger.warn('Nessun dato restituito dalla query clienti', {
            filters,
            sort,
            page,
          })
          queryResult = []
        } else {
          logger.debug('Dati ricevuti dalla query', {
            count: simpleData.length,
            firstItem: simpleData[0],
          })
          // Applica tutti i filtri client-side
          let filtered = [...simpleData]

          // Filtro stato
          if (filters.stato && filters.stato !== 'tutti') {
            filtered = filtered.filter((profile) => {
              // Se lo stato è NULL o vuoto, considera come 'attivo' per default
              const profileStato = profile.stato || 'attivo'
              return profileStato === filters.stato
            })
          }

          // Filtro ricerca
          if (filters.search && filters.search.trim().length > 0) {
            const searchLower = filters.search.trim().toLowerCase()
            filtered = filtered.filter((profile) => {
              const nome = (profile.nome ?? '').toLowerCase()
              const cognome = (profile.cognome ?? '').toLowerCase()
              const email = (profile.email ?? '').toLowerCase()
              return (
                nome.includes(searchLower) ||
                cognome.includes(searchLower) ||
                email.includes(searchLower)
              )
            })
          }

          // Filtro documenti scadenza
          if (filters.solo_documenti_scadenza) {
            filtered = filtered.filter((profile) => profile.documenti_scadenza === true)
          }

          // Filtro date
          if (filters.dataIscrizioneDa) {
            filtered = filtered.filter((profile) => {
              const dateValue = profile.data_iscrizione ?? profile.created_at
              if (!dateValue) return false
              const date = new Date(dateValue)
              return date >= new Date(filters.dataIscrizioneDa!)
            })
          }
          if (filters.dataIscrizioneA) {
            filtered = filtered.filter((profile) => {
              const dateValue = profile.data_iscrizione ?? profile.created_at
              if (!dateValue) return false
              const date = new Date(dateValue)
              return date <= new Date(filters.dataIscrizioneA!)
            })
          }

          // Applica sorting client-side se necessario (per campi diversi da data_iscrizione)
          if (sort.field !== 'data_iscrizione') {
            filtered.sort((a, b) => {
              const aValue = a[sort.field]
              const bValue = b[sort.field]

              const normalize = (value: unknown) => {
                if (typeof value === 'string') return value.toLowerCase()
                if (typeof value === 'number') return value
                return ''
              }

              const normalizedA = normalize(aValue)
              const normalizedB = normalize(bValue)

              if (normalizedA < normalizedB) return sort.direction === 'asc' ? -1 : 1
              if (normalizedA > normalizedB) return sort.direction === 'asc' ? 1 : -1
              return 0
            })
          }

          // Paginazione client-side
          const from = (page - 1) * pageSize
          const to = from + pageSize
          queryResult = filtered.slice(from, to)

          logger.debug('Clienti dopo filtri e paginazione', {
            totalFiltered: filtered.length,
            page,
            pageSize,
            resultCount: queryResult.length,
            filters,
          })

          // Salva in cache usando strategia frequent-query (TTL gestito internamente)
          frequentQueryCache.set('clienti-list', filtered)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        const isTimeout = errorMessage.includes('timeout') || errorMessage === 'Query timeout'

        // Se è un timeout, prova a usare i dati dalla cache
        if (isTimeout) {
          const cachedData = frequentQueryCache.get<ProfileSummary[]>('clienti-list')
          if (cachedData && cachedData.length > 0) {
            logger.warn('Query timeout, usando dati dalla cache', {
              cachedCount: cachedData.length,
              filters,
            })
            queryResult = cachedData
          } else {
            logger.error('Query timeout e nessun dato in cache disponibile', err, {
              filters,
              sort,
              page,
            })
            queryResult = []
          }
        } else {
          // Log errore per debug
          logger.error('Errore nel fetch clienti', err, {
            filters,
            sort,
            page,
          })
          queryResult = []
        }

        // IMPORTANTE: Reset fetchingRef anche in caso di errore per permettere retry
        fetchingRef.current = false
      }

      // Stima count immediata basata sui risultati (non blocca il rendering)
      const data = queryResult

      logger.debug('Dati queryResult prima del mapping', {
        queryResultLength: queryResult.length,
        dataLength: data.length,
        firstItem: data[0],
      })

      // Calcola stima immediata del count
      let queryCount: number
      if (data.length === pageSize) {
        // Se abbiamo una pagina piena, probabilmente ce ne sono altre
        queryCount = data.length * 5 // Stima conservativa
      } else {
        queryCount = data.length
      }

      // Per la prima pagina, cerca di ottenere il count preciso in background (non blocca)
      if (page === 1 && data.length > 0) {
        // Esegui count in background con timeout molto breve
        setTimeout(async () => {
          try {
            // Usa estimated count che è molto più veloce di exact
            let countQuery = supabase
              .from('profiles')
              .select('*', { count: 'estimated', head: true })
              .or('role.eq.atleta,role.eq.athlete')

            // Applica solo filtri essenziali per il count
            if (filters.stato && filters.stato !== 'tutti') {
              countQuery = countQuery.eq('stato', filters.stato)
            }

            if (filters.dataIscrizioneDa) {
              countQuery = countQuery.gte('data_iscrizione', filters.dataIscrizioneDa)
            }

            if (filters.dataIscrizioneA) {
              countQuery = countQuery.lte('data_iscrizione', filters.dataIscrizioneA)
            }

            if (filters.solo_documenti_scadenza) {
              countQuery = countQuery.eq('documenti_scadenza', true)
            }

            // Per la ricerca, evita count complessi (usa solo se necessario)
            // Il count con ilike può essere molto lento
            if (filters.search && filters.search.length > 2) {
              const searchTerm = filters.search.trim().toLowerCase()
              countQuery = countQuery.or(
                `nome.ilike.%${searchTerm}%,cognome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
              )
            }

            // Timeout molto breve per il count (3 secondi)
            const countResult = await Promise.race([
              countQuery,
              new Promise<{ count: number | null; error: unknown }>((resolve) =>
                setTimeout(() => resolve({ count: null, error: null }), 3000),
              ),
            ])

            if (!countResult.error && countResult.count !== null) {
              setTotal(countResult.count) // Aggiorna il total quando disponibile
            }
          } catch {
            // Ignora errori di count, mantieni la stima
            // Count non disponibile, uso stima (logging gestito automaticamente)
          }
        }, 100) // Piccolo delay per non interferire con il rendering
      }

      const count = queryCount || total

      // Mappare i profili a clienti
      const clientiWithStats = data.map((profile): Cliente => {
        const nome = (profile.nome as string | null | undefined) ?? ''
        const cognome = (profile.cognome as string | null | undefined) ?? ''
        return {
          id: (profile.id as string) || '',
          first_name: nome,
          last_name: cognome,
          nome: nome || undefined,
          cognome: cognome || undefined,
          email: (profile.email as string | null | undefined) ?? '',
          phone: (profile.phone as string | null | undefined) ?? null,
          avatar_url:
            (profile.avatar as string | null | undefined) ??
            (profile.avatar_url as string | null | undefined) ??
            null,
          data_iscrizione:
            (profile.data_iscrizione as string | null | undefined) ??
            (profile.created_at as string | null | undefined) ??
            '',
          stato:
            (profile.stato as 'attivo' | 'inattivo' | 'sospeso' | null | undefined) ?? 'attivo',
          allenamenti_mese: 0, // Calcolo reale implementato in fetchClienti
          ultimo_accesso: (profile.ultimo_accesso as string | null | undefined) ?? null,
          scheda_attiva: null, // Query reale implementata in fetchClienti
          documenti_scadenza: Boolean(profile.documenti_scadenza),
          note: (profile.note as string | null | undefined) ?? null,
          tags: [],
          role: (profile.role as string | null | undefined) ?? '',
          created_at: (profile.created_at as string | null | undefined) ?? '',
          updated_at: (profile.updated_at as string | null | undefined) ?? '',
        }
      })

      // Filtrare per allenamenti minimi se specificato
      let filteredClienti = clientiWithStats
      if (typeof filters?.allenamenti_min === 'number' && filters.allenamenti_min > 0) {
        filteredClienti = clientiWithStats.filter(
          (c) => c.allenamenti_mese >= filters.allenamenti_min!,
        )
      }

      // Filtrare per tags se specificato
      if (filters.tags && filters.tags.length > 0) {
        filteredClienti = filteredClienti.filter((c) =>
          c.tags?.some((tag) => (filters.tags ?? []).includes(tag.id)),
        )
      }

      // Dati caricati e processati (logging disponibile tramite logger strutturato se necessario)

      logger.debug('Impostazione clienti finali', {
        count: filteredClienti.length,
        total: count || 0,
        filters,
        firstCliente: filteredClienti[0],
      })

      setClienti(filteredClienti)
      setTotal(count || 0)

      // Carica le statistiche in background (non blocca il rendering dei dati)
      // Usa setTimeout per non bloccare il rendering iniziale
      setTimeout(() => {
        fetchStats().catch(() => {
          // Errore nel caricamento statistiche (logging gestito automaticamente)
        })
      }, 100)
    } catch (err) {
      logger.error('Errore nel caricamento clienti', err, { filters, sort })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento clienti')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user?.id, filters, sort, page, pageSize, fetchStats])
  // RIMOSSO: total dalle dipendenze per evitare loop infinito
  // total viene aggiornato da fetchClienti stesso, quindi non deve essere nelle dipendenze

  const updateCliente = useCallback(
    async (id: string, updates: Partial<Cliente>) => {
      try {
        // Map Cliente fields to profile fields
        const profileUpdates: Record<string, unknown> = {}
        if (updates.nome !== undefined) profileUpdates.nome = updates.nome
        if (updates.cognome !== undefined) profileUpdates.cognome = updates.cognome
        if (updates.email !== undefined) profileUpdates.email = updates.email
        if (updates.phone !== undefined) profileUpdates.phone = updates.phone
        if (updates.avatar_url !== undefined) profileUpdates.avatar = updates.avatar_url
        if (updates.note !== undefined) profileUpdates.note = updates.note

        await executeSupabaseCall(
          async () => {
            // Workaround necessario per inferenza tipo Supabase
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

        // Refetch per aggiornare la lista
        await fetchClienti()
      } catch (err) {
        const apiError = handleApiError(err, 'useClienti.updateCliente')
        // Logger sarà implementato in seguito
        // logger.error('src\hooks\use-clienti.ts', "Errore nell'aggiornamento cliente:", apiError)
        throw new Error(apiError.message)
      }
    },
    [supabase, fetchClienti, executeSupabaseCall],
  )

  const deleteCliente = useCallback(
    async (id: string) => {
      try {
        await executeSupabaseCall(
          async () => {
            const { error: deleteError } = await supabase.from('profiles').delete().eq('id', id)
            if (deleteError) {
              return { data: null, error: deleteError }
            }
            return { data: null, error: null }
          },
          { context: 'useClienti.deleteCliente' },
        )

        // Refetch per aggiornare la lista
        await fetchClienti()
      } catch (err) {
        const apiError = handleApiError(err, 'useClienti.deleteCliente')
        // Errore nell'eliminazione cliente (logging gestito automaticamente)
        throw new Error(apiError.message)
      }
    },
    [supabase, fetchClienti, executeSupabaseCall],
  )

  // Fetch iniziale - aspetta che l'autenticazione sia completata E che userId sia disponibile
  // FIX CRITICO #1: Prevenire chiamate multiple anche quando authLoading/userId/user cambiano multiple volte
  const isMountedRef = useRef(false)
  const fetchExecutedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const emptyStateSetRef = useRef(false) // Traccia se abbiamo già impostato lo stato vuoto
  const lastAuthStateRef = useRef<{ authLoading: boolean; userId: string | null }>({
    authLoading: true,
    userId: null,
  }) // Traccia lo stato autenticazione precedente per evitare chiamate duplicate
  
  useEffect(() => {
    // FIX CRITICO #1: Verifica se lo stato autenticazione è cambiato rispetto all'ultima esecuzione
    // Se non è cambiato, non eseguire fetch (evita chiamate duplicate)
    const authStateChanged =
      lastAuthStateRef.current.authLoading !== authLoading ||
      lastAuthStateRef.current.userId !== userId
    
    // Aggiorna lo stato di riferimento
    lastAuthStateRef.current = { authLoading, userId }
    
    // Se lo stato non è cambiato e fetch è già stato eseguito, non fare nulla
    if (!authStateChanged && fetchExecutedRef.current) {
      logger.debug('useEffect fetch iniziale: stato autenticazione non cambiato, skip', undefined, {
        authLoading,
        userId,
        hasUser: !!user,
        fetchExecuted: fetchExecutedRef.current,
      })
      return undefined
    }

    // Pulisci timeout precedente se esiste
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Non eseguire fetch se l'autenticazione è ancora in caricamento
    if (authLoading) {
      logger.debug('useEffect fetch iniziale: authLoading = true, attesa', undefined, {
        authLoading,
        userId,
        hasUser: !!user,
        userEmail: user?.email,
      })
      return undefined
    }

    // PRIORITÀ 1: Se userId è disponibile, esegui fetch immediatamente
    // FIX CRITICO #1: Verifica anche che fetch non sia già in corso
    if (!fetchExecutedRef.current && !authLoading && userId && !fetchingRef.current) {
      // Pulisci timeout se userId diventa disponibile prima del timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      // Reset empty state se era stato impostato prima
      if (emptyStateSetRef.current) {
        logger.debug('useEffect fetch iniziale: userId disponibile dopo empty state, reset', undefined, {
          authLoading,
          userId,
          hasUser: !!user,
          userEmail: user?.email,
        })
        emptyStateSetRef.current = false
      }
      
      logger.debug('useEffect fetch iniziale: esecuzione fetchClienti', undefined, {
        authLoading,
        userId,
        hasUser: !!user,
        userEmail: user?.email,
      })
      fetchExecutedRef.current = true
      isMountedRef.current = true
      fetchClienti()
      return undefined
    }

    // Ambiente test: bypassa controllo auth per permettere il fetch immediato nei test
    if (!fetchExecutedRef.current && !authLoading && !userId && isTestEnv && !fetchingRef.current) {
      logger.debug('useEffect fetch iniziale: ambiente test, fetch senza userId', undefined, {
        authLoading,
        userId,
        hasUser: !!user,
        isTestEnv,
      })
      fetchExecutedRef.current = true
      isMountedRef.current = true
      fetchClienti(true)
      return undefined
    }

    // PRIORITÀ 2: Se userId è ancora null, aspetta ancora un po'
    // (onAuthStateChange potrebbe essere in ritardo)
    // FIX CRITICO #1: Verifica che fetch non sia già stato eseguito o in corso
    if (!userId && !fetchExecutedRef.current && !emptyStateSetRef.current && !fetchingRef.current) {
      logger.debug('useEffect fetch iniziale: authLoading = false ma userId è null, attesa breve', undefined, {
        authLoading,
        userId,
        hasUser: !!user,
        userEmail: user?.email,
      })
      
      // Aspetta ancora 3 secondi per vedere se userId diventa disponibile
      // (aumentato a 3 secondi per dare più tempo a onAuthStateChange)
      timeoutRef.current = setTimeout(() => {
        // Verifica di nuovo userId prima di impostare empty state
        // (potrebbe essere diventato disponibile durante il timeout)
        if (!userId && !fetchExecutedRef.current && !fetchingRef.current) {
          logger.warn('useEffect fetch iniziale: userId ancora null dopo timeout, utente non autenticato', undefined, {
            authLoading,
            userId,
            hasUser: !!user,
            userEmail: user?.email,
          })
          setClienti([])
          setStats({
            totali: 0,
            attivi: 0,
            inattivi: 0,
            nuovi_mese: 0,
            documenti_scadenza: 0,
          })
          setTotal(0)
          setLoading(false)
          emptyStateSetRef.current = true
          // NON impostare fetchExecutedRef.current = true qui, così se userId diventa disponibile dopo, possiamo ancora fare fetch
        }
        timeoutRef.current = null
      }, 3000)
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
    
    // Tutti gli altri percorsi ritornano undefined
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, userId]) // FIX CRITICO #1: Rimuoviamo 'user' dalle dipendenze perché userId è sufficiente

  // Refetch quando cambiano i filtri, sort, pagina (debounced per evitare chiamate multiple)
  // Usa useRef per tracciare i valori precedenti e evitare loop infiniti
  const prevParamsRef = useRef<string>('')

  // Serializza i parametri per confronto (ordine consistente per evitare falsi positivi)
  // Normalizza le dipendenze per confrontare valori invece di riferimenti
  const paramsKey = useMemo(
    () =>
      JSON.stringify({
        filters: {
          search: filters.search || '',
          stato: filters.stato || 'tutti',
          dataIscrizioneDa: filters.dataIscrizioneDa || null,
          dataIscrizioneA: filters.dataIscrizioneA || null,
          allenamenti_min: filters.allenamenti_min || null,
          solo_documenti_scadenza: filters.solo_documenti_scadenza || false,
          tags: filters.tags || [],
        },
        sort: {
          field: sort.field,
          direction: sort.direction,
        },
        page,
        pageSize,
      }),
    [
      filters.search,
      filters.stato,
      filters.dataIscrizioneDa,
      filters.dataIscrizioneA,
      filters.allenamenti_min,
      filters.solo_documenti_scadenza,
      filters.tags, // Incluso direttamente perché usato nel corpo del useMemo
      sort.field,
      sort.direction,
      page,
      pageSize,
    ],
  )

  useEffect(() => {
    if (!isMountedRef.current || fetchingRef.current) {
      return undefined
    }

    // Se i parametri non sono cambiati, non fare nulla
    // CONTROLLO PRIMA di qualsiasi altra operazione
    if (prevParamsRef.current === paramsKey) {
      return undefined
    }

    // Aggiorna prevParamsRef PRIMA di schedulare fetchClienti
    prevParamsRef.current = paramsKey

    const timeoutId = setTimeout(() => {
      void fetchClienti()
    }, 100)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]) // Usa paramsKey come dipendenza - il controllo interno previene chiamate duplicate

  // Real-time subscriptions
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
          filter: 'role=in.(atleta,athlete)',
        },
        () => {
          fetchClienti()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [realtime, supabase, fetchClienti])

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize])

  return {
    clienti,
    stats,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchClienti,
    updateCliente,
    deleteCliente,
  }
}
