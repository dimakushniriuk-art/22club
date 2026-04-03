/** Anteprima/scarico per righe aggregate (medico, contratti, fatture). */
export type DocumentStorageOpen =
  | { type: 'signed'; bucket: string; path: string }
  | { type: 'public'; url: string }

export interface Document {
  id: string
  org_id?: string | null
  athlete_id: string
  file_url: string
  file_name?: string | null
  file_size?: number | null
  file_type?: string | null
  category: string
  status: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido'
  expires_at?: string | null
  uploaded_by_profile_id: string
  uploaded_by_name?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string | null
  athlete_name?: string | null
  staff_name?: string | null
  /** Nome file mostrato se `file_url` non è adatto a `extractFileName`. */
  display_file_name?: string | null
  /** Se valorizzato, ha priorità su `documentsFilePreviewHref(file_url)`. */
  storage_open?: DocumentStorageOpen | null
  /** Riga tabella `documents` (azioni come “non valido”). Default true se assente. */
  is_db_document?: boolean
}
