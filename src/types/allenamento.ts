export interface Allenamento {
  id: string
  atleta_id: string
  atleta_nome: string
  scheda_id: string | null
  scheda_nome: string
  data: string
  durata_minuti: number
  stato: 'completato' | 'in_corso' | 'programmato' | 'saltato'
  esercizi_completati: number
  esercizi_totali: number
  volume_totale: number
  note: string | null
  created_at: string
  updated_at: string
  trainer_name?: string | null
}

export interface AllenamentoStats {
  oggi: number
  completati: number
  in_corso: number
  programmati: number
  saltati: number
  questa_settimana: number
  questo_mese: number
}

export interface AllenamentoFilters {
  search: string
  stato: 'tutti' | 'completato' | 'in_corso' | 'programmato' | 'saltato'
  atleta_id: string | null
  data_da: string | null
  data_a: string | null
  periodo: 'tutti' | 'oggi' | 'settimana' | 'mese'
}

export interface AllenamentoDettaglio {
  allenamento: Allenamento
  esercizi: EsercizioDettaglio[]
}

export interface EsercizioDettaglio {
  id: string
  nome: string
  sets_completati: number
  sets_totali: number
  volume: number
  note: string | null
}

export type AllenamentoSort = 'data_desc' | 'data_asc' | 'atleta_asc' | 'durata_desc'
