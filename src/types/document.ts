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
}
