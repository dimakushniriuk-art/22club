import { supabase } from '@/lib/supabase/client'
import { localStorageCache } from '@/lib/cache/local-storage-cache'
import { statsCache, frequentQueryCache } from '@/lib/cache/cache-strategies'
import { createLogger } from '@/lib/logger'
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js'
import type {
  Cliente,
  ClienteFilters,
  ClienteSort,
  ClienteStats,
  ClienteTag,
} from '@/types/cliente'

const logger = createLogger('fetchClienti')

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

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://mock-project.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'mock-anon-key-for-development',
  )
}

const emptyStats: ClienteStats = {
  totali: 0,
  attivi: 0,
  inattivi: 0,
  nuovi_mese: 0,
  documenti_scadenza: 0,
}

/** Stats globali clienti (RLS applicate via Supabase client). */
export async function fetchClientiStats(): Promise<ClienteStats> {
  if (!isSupabaseConfigured()) {
    return {
      totali: 2,
      attivi: 2,
      inattivi: 0,
      nuovi_mese: 2,
      documenti_scadenza: 1,
    }
  }

  try {
    try {
      const rpcResponse = (await Promise.race([
        supabase.rpc('get_clienti_stats'),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('RPC timeout')), 3000)),
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

        localStorageCache.set('clienti-stats', typedStats, 2 * 60 * 1000)
        return typedStats
      }
    } catch {
      /* fallback sotto */
    }

    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString()

    const queryWithTimeout = async (
      queryPromise: PromiseLike<{ count: number | null; error: unknown }>,
    ): Promise<{ count: number | null }> => {
      try {
        return await Promise.race([
          queryPromise.then((res) => ({ count: res.count })),
          new Promise<{ count: number | null }>((resolve) =>
            setTimeout(() => resolve({ count: null }), 2000),
          ),
        ])
      } catch {
        return { count: null }
      }
    }

    const [totaliRes, attiviRes, inattiviRes, nuoviRes, documentiRes] = await Promise.allSettled([
      queryWithTimeout(
        supabase
          .from('profiles')
          .select('id', { count: 'estimated', head: true })
          .eq('role', 'athlete'),
      ),
      queryWithTimeout(
        supabase
          .from('profiles')
          .select('id', { count: 'estimated', head: true })
          .eq('role', 'athlete')
          .eq('stato', 'attivo'),
      ),
      queryWithTimeout(
        supabase
          .from('profiles')
          .select('id', { count: 'estimated', head: true })
          .eq('role', 'athlete')
          .eq('stato', 'inattivo'),
      ),
      queryWithTimeout(
        supabase
          .from('profiles')
          .select('id', { count: 'estimated', head: true })
          .eq('role', 'athlete')
          .gte('data_iscrizione', firstDayOfMonth),
      ),
      queryWithTimeout(
        supabase
          .from('profiles')
          .select('id', { count: 'estimated', head: true })
          .eq('role', 'athlete')
          .eq('documenti_scadenza', true),
      ),
    ])

    const getCount = (result: PromiseSettledResult<{ count: number | null }>): number => {
      if (result.status === 'fulfilled') {
        return result.value.count ?? 0
      }
      return 0
    }

    const fallbackStats: ClienteStats = {
      totali: getCount(totaliRes),
      attivi: getCount(attiviRes),
      inattivi: getCount(inattiviRes),
      nuovi_mese: getCount(nuoviRes),
      documenti_scadenza: getCount(documentiRes),
    }

    statsCache.set('clienti-stats', fallbackStats)
    return fallbackStats
  } catch {
    return emptyStats
  }
}

export type FetchClientiListParams = {
  filters: ClienteFilters
  sort: ClienteSort
  page: number
  pageSize: number
  userId: string | null
  skipAuthCheck?: boolean
}

export async function fetchClientiList(
  params: FetchClientiListParams,
): Promise<{ clienti: Cliente[]; total: number }> {
  const { filters, sort, page, pageSize, userId, skipAuthCheck = false } = params

  if (!userId && !skipAuthCheck) {
    return { clienti: [], total: 0 }
  }

  if (!isSupabaseConfigured()) {
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

    let filteredMockClienti = mockClienti

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredMockClienti = filteredMockClienti.filter(
        (c) =>
          (c.nome || '').toLowerCase().includes(searchLower) ||
          (c.cognome || '').toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower),
      )
    }

    if (filters.stato && filters.stato !== 'tutti') {
      filteredMockClienti = filteredMockClienti.filter((c) => c.stato === filters.stato)
    }

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

    return { clienti: filteredMockClienti, total: filteredMockClienti.length }
  }

  let queryResult: ProfileSummary[] = []

  try {
    logger.debug('Query atleti con RLS automatico', undefined, {
      userId,
      hasAuth: !!userId,
    })

    const simpleQuery = supabase
      .from('profiles')
      .select(
        'id, user_id, nome, cognome, first_name, last_name, email, phone, data_iscrizione, stato, documenti_scadenza, created_at, updated_at, role, avatar, avatar_url, ultimo_accesso, note',
      )
      .eq('role', 'athlete')
      .order('data_iscrizione', { ascending: sort.direction === 'asc' })
      .limit(pageSize)

    const simpleResponse = await Promise.race<PostgrestResponse<ProfileSummary>>([
      Promise.resolve(simpleQuery),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Query timeout'))
        }, 30000)
      }),
    ])

    const { data: simpleData, error: simpleError } = simpleResponse

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
      let filtered = [...simpleData]

      if (filters.stato && filters.stato !== 'tutti') {
        filtered = filtered.filter((profile) => {
          const profileStato = profile.stato || 'attivo'
          return profileStato === filters.stato
        })
      }

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

      if (filters.solo_documenti_scadenza) {
        filtered = filtered.filter((profile) => profile.documenti_scadenza === true)
      }

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

      if (sort.field !== 'data_iscrizione') {
        const row = (p: ProfileSummary) => p as Record<string, unknown>
        filtered.sort((a, b) => {
          const aValue = row(a)[sort.field]
          const bValue = row(b)[sort.field]

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

      frequentQueryCache.set('clienti-list', filtered)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const isTimeout = errorMessage.includes('timeout') || errorMessage === 'Query timeout'

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
      logger.error('Errore nel fetch clienti', err, {
        filters,
        sort,
        page,
      })
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : String(err)
      throw err instanceof Error ? err : new Error(msg)
    }
  }

  const data = queryResult

  logger.debug('Dati queryResult prima del mapping', {
    queryResultLength: queryResult.length,
    dataLength: data.length,
    firstItem: data[0],
  })

  let queryCount: number
  if (data.length === pageSize) {
    queryCount = data.length * 5
  } else {
    queryCount = data.length
  }

  let total = queryCount

  if (page === 1 && data.length > 0) {
    try {
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'estimated', head: true })
        .eq('role', 'athlete')

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

      if (filters.search && filters.search.length > 2) {
        const searchTerm = filters.search.trim().toLowerCase()
        countQuery = countQuery.or(
          `nome.ilike.%${searchTerm}%,cognome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
        )
      }

      const countResult = await Promise.race([
        countQuery,
        new Promise<{ count: number | null; error: unknown }>((resolve) =>
          setTimeout(() => resolve({ count: null, error: null }), 3000),
        ),
      ])

      if (!countResult.error && countResult.count !== null) {
        total = countResult.count
      }
    } catch {
      /* stima */
    }
  }

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
      stato: (profile.stato as 'attivo' | 'inattivo' | 'sospeso' | null | undefined) ?? 'attivo',
      allenamenti_mese: 0,
      ultimo_accesso: (profile.ultimo_accesso as string | null | undefined) ?? null,
      scheda_attiva: null,
      documenti_scadenza: Boolean(profile.documenti_scadenza),
      note: (profile.note as string | null | undefined) ?? null,
      tags: [],
      role: (profile.role as string | null | undefined) ?? '',
      created_at: (profile.created_at as string | null | undefined) ?? '',
      updated_at: (profile.updated_at as string | null | undefined) ?? '',
    }
  })

  let filteredClienti = clientiWithStats
  if (typeof filters?.allenamenti_min === 'number' && filters.allenamenti_min > 0) {
    filteredClienti = clientiWithStats.filter((c) => c.allenamenti_mese >= filters.allenamenti_min!)
  }

  if (filters.tags && filters.tags.length > 0) {
    filteredClienti = filteredClienti.filter((c) =>
      c.tags?.some((tag) => (filters.tags ?? []).includes(tag.id)),
    )
  }

  logger.debug('Impostazione clienti finali', {
    count: filteredClienti.length,
    total: total || 0,
    filters,
    firstCliente: filteredClienti[0],
  })

  return { clienti: filteredClienti, total: total || 0 }
}
