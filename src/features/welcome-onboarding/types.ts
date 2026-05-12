import type { Database } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Client esteso per tabelle/RPC non ancora nei tipi generati (athlete_questionnaires, get_my_trainer_profile). */
export type SupabaseExt = Omit<SupabaseClient<Database>, 'from' | 'rpc'> & {
  from: (table: string) => ReturnType<SupabaseClient<Database>['from']>
  rpc: (fn: string) => Promise<{ data: unknown; error: unknown }>
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/** Stato form onboarding: solo campi usati nel wizard (phone, non telefono) */
export interface OnboardingFormState {
  nome: string
  cognome: string
  sesso: string
  data_nascita: string
  phone: string
  contatto_emergenza_nome: string
  contatto_emergenza_relazione: string
  contatto_emergenza_telefono: string
  indirizzo_residenza: string
  provincia: string
  cap: string
  citta: string
  nazione: string
  codice_fiscale: string
  professione: string
  altezza_cm: number | ''
  peso_corrente_kg: number | ''
  peso_iniziale_kg: number | ''
  obiettivo_peso: number | ''
  bmi: number | null
  livello_esperienza: string
  tipo_atleta: string
  obiettivi_fitness: string[]
  livello_motivazione: number | ''
  note: string
  certificato_medico_tipo: string
  certificato_medico_data_rilascio: string
  certificato_medico_scadenza: string
  limitazioni: string
  infortuni_recenti: string
  operazioni_passate: string
  allergie: string
  obiettivo_nutrizionale: string
  intolleranze: string[]
  allergie_alimentari: string[]
  abitudini_alimentari: string
}

export interface AnamnesiState {
  sonno: string
  bpm_riposo: string
  fumatore: string
  stile_vita: string
  infortuni: string
  infortuni_descrizione: string
  operazioni: string
  operazioni_descrizione: string
  gravidanza: string
  proporzione_armonia: string
  proporzione_note: string
  dichiarazione_veridicita: boolean
  firma_nome_cognome: string
  // Consensi obbligatori
  consenso_termini_condizioni: boolean
  consenso_privacy: boolean
  consenso_idoneita_fisica: boolean
  consenso_dati_sanitari: boolean
  consenso_liberatoria_attivita_fisica: boolean
  // Consensi facoltativi
  consenso_marketing: boolean
  consenso_comunicazioni: boolean
}

export interface ManlevaState {
  nome_cognome: string
  data_nascita: string
  luogo_nascita: string
  residenza: string
  ruolo: string
  nome_minore: string
  dichiarazione_accettazione: boolean
  firma_nome_cognome: string
}

export interface LiberatoriaState {
  authorized: boolean | null
  channels: string[]
  duration: '' | 'fino_a_revoca' | 'illimitata'
  place: string
  firma_nome_cognome: string
}

export interface WelcomeBrowserDraftPayload {
  form: OnboardingFormState
  anamnesi: AnamnesiState
  manleva: ManlevaState
  liberatoria: LiberatoriaState
  currentStep: number
  finalConfirmation: boolean
  obiettivoAltro: string
  intolleranzaAltro: string
  allergiaAlimentareAltro: string
}

export interface PtInfo {
  pt_nome: string
  pt_cognome: string
  pt_email: string
  pt_telefono: string
  pt_avatar_url: string | null
}