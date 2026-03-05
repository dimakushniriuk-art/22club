/**
 * Tipi per profilo professionale trainer (trainer_profiles + tabelle 1:N).
 * Allineati allo schema DB: migrations 20260228–20260230.
 */

export interface TrainerProfileRow {
  profile_id: string
  descrizione_breve: string | null
  descrizione_estesa: string | null
  filosofia: string | null
  perche_lavoro: string | null
  target_clienti: string[] | null
  valutazione_iniziale: boolean | null
  test_funzionali: boolean | null
  analisi_postura: boolean | null
  misurazioni_corporee: string[] | null
  periodizzazione: boolean | null
  check_settimanali: boolean | null
  report_progressi: boolean | null
  uso_app: boolean | null
  clienti_seguiti: number | null
  pct_successo: number | null
  media_kg_persi: number | null
  media_aumento_forza: string | null
  no_doping: boolean | null
  no_diete_estreme: boolean | null
  no_promesse_irrealistiche: boolean | null
  focus_salute: boolean | null
  educazione_movimento: boolean | null
  privacy_garantita: boolean | null
  partita_iva: string | null
  assicurazione: boolean | null
  assicurazione_url: string | null
  registro_professionale: string | null
  consenso_immagini_clienti: boolean | null
  termini_accettati: boolean | null
  app_monitoraggio: string | null
  software_programmazione: string | null
  metodi_misurazione: string[] | null
  url_video_presentazione: string | null
  galleria_urls: string[] | null
  created_at: string | null
  updated_at: string | null
}

export type TrainerProfileInsert = Omit<TrainerProfileRow, 'created_at' | 'updated_at'> & {
  created_at?: string | null
  updated_at?: string | null
}

export type TrainerProfileUpdate = Partial<Omit<TrainerProfileInsert, 'profile_id'>>

export interface TrainerEducationRow {
  id: string
  profile_id: string
  tipo: string
  titolo: string
  istituto: string | null
  anno: number | null
  documento_url: string | null
  created_at: string | null
}

export interface TrainerCertificationRow {
  id: string
  profile_id: string
  nome: string
  ente: string | null
  anno: number | null
  numero_certificato: string | null
  stato: 'attivo' | 'aggiornamento' | 'scaduto'
  file_url: string | null
  created_at: string | null
}

export interface TrainerCourseRow {
  id: string
  profile_id: string
  nome: string
  durata_valore: number | null
  durata_unita: string | null
  anno: number | null
  created_at: string | null
}

export interface TrainerSpecializationRow {
  id: string
  profile_id: string
  nome: string
  livello: 'base' | 'avanzato' | 'expert' | null
  anni_esperienza: number | null
  created_at: string | null
}

export interface TrainerExperienceRow {
  id: string
  profile_id: string
  nome_struttura: string
  ruolo: string | null
  data_inizio: string
  data_fine: string | null
  collaborazioni: string | null
  atleti_seguiti: number | null
  created_at: string | null
}

export interface TrainerTestimonialRow {
  id: string
  profile_id: string
  nome_cliente: string | null
  eta: number | null
  obiettivo: string | null
  durata_percorso: string | null
  risultato: string | null
  feedback: string
  valutazione: number | null
  created_at: string | null
}

export interface TrainerTransformationRow {
  id: string
  profile_id: string
  prima_dopo_urls: Record<string, unknown> | null
  durata_settimane: number | null
  obiettivo: string | null
  risultato: string | null
  verificato: boolean | null
  consenso: boolean | null
  created_at: string | null
}

/** Profilo trainer completo (trainer_profiles + tutte le 1:N) */
export interface TrainerProfileFull {
  profile: TrainerProfileRow | null
  education: TrainerEducationRow[]
  certifications: TrainerCertificationRow[]
  courses: TrainerCourseRow[]
  specializations: TrainerSpecializationRow[]
  experience: TrainerExperienceRow[]
  testimonials: TrainerTestimonialRow[]
  transformations: TrainerTransformationRow[]
}
