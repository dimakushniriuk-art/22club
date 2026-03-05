export interface Cliente {
  id: string
  first_name: string
  last_name: string
  nome?: string // Per compatibilità
  cognome?: string // Per compatibilità
  email: string
  phone: string | null
  avatar_url: string | null
  data_iscrizione: string
  stato: 'attivo' | 'inattivo' | 'sospeso'
  allenamenti_mese: number
  /** Lezioni rimanenti (lesson_counters, unica riga per atleta). Opzionale, valorizzato in dashboard clienti. */
  lessons_remaining?: number
  /** Lezioni acquistate (somma da payments completed). Valorizzato in dashboard clienti. */
  lessons_acquired?: number
  /** Lezioni utilizzate (appuntamenti completati). Valorizzato in dashboard clienti. */
  lessons_used?: number
  ultimo_accesso: string | null
  scheda_attiva: string | null
  documenti_scadenza: boolean
  note: string | null
  tags: ClienteTag[]
  role: string
  created_at: string
  updated_at: string
  /** True se l'atleta è invitato ma non ha ancora accettato (solo nutrizionista/massaggiatore, filtro Inattivi). Non interagibile. */
  invitatoInAttesa?: boolean
}

export interface ClienteTag {
  id: string
  nome: string
  colore: string
}

export interface ClienteFilters {
  search: string
  stato: 'tutti' | 'attivo' | 'inattivo' | 'sospeso'
  dataIscrizioneDa: string | null
  dataIscrizioneA: string | null
  allenamenti_min: number | null
  solo_documenti_scadenza: boolean
  tags: string[]
}

export interface ClienteStats {
  totali: number
  attivi: number
  inattivi: number
  nuovi_mese: number
  documenti_scadenza: number
}

export type ClienteSortField =
  | 'nome'
  | 'cognome'
  | 'email'
  | 'data_iscrizione'
  | 'stato'
  | 'allenamenti_mese'

export type SortDirection = 'asc' | 'desc'

export interface ClienteSort {
  field: ClienteSortField
  direction: SortDirection
}

export interface ClientiPaginationResult {
  data: Cliente[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
