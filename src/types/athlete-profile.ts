/**
 * @fileoverview Tipi TypeScript per il modulo Profilo Atleta
 * @description Definizioni complete per tutte le 9 categorie dati del profilo atleta
 * @module types/athlete-profile
 */

// ============================================================================
// SEZIONE 1: ENUM COMUNI
// ============================================================================

/**
 * Enum per sesso/genere
 */
export type SexEnum = 'maschio' | 'femmina' | 'altro' | 'non_specificato'

/**
 * Enum per tipo certificato medico
 */
export type CertificatoTipoEnum = 'agonistico' | 'non_agonistico' | 'sportivo'

/**
 * Enum per livello esperienza fitness
 */
export type LivelloEsperienzaEnum = 'principiante' | 'intermedio' | 'avanzato' | 'professionista'

/**
 * Enum per obiettivi fitness
 */
export type ObiettivoFitnessEnum =
  | 'dimagrimento'
  | 'massa_muscolare'
  | 'forza'
  | 'resistenza'
  | 'tonificazione'
  | 'riabilitazione'
  | 'altro'

/**
 * Enum per obiettivi nutrizionali
 */
export type ObiettivoNutrizionaleEnum =
  | 'dimagrimento'
  | 'massa'
  | 'mantenimento'
  | 'performance'
  | 'salute'

/**
 * Enum per tipo dieta
 */
export type DietaEnum =
  | 'onnivora'
  | 'vegetariana'
  | 'vegana'
  | 'keto'
  | 'paleo'
  | 'mediterranea'
  | 'altro'

/**
 * Enum per tipo abbonamento
 */
export type TipoAbbonamentoEnum =
  | 'mensile'
  | 'trimestrale'
  | 'semestrale'
  | 'annuale'
  | 'pacchetto_lezioni'
  | 'nessuno'

/**
 * Enum per stato abbonamento
 */
export type StatoAbbonamentoEnum = 'attivo' | 'scaduto' | 'sospeso' | 'in_attesa'

/**
 * Enum per tipo massaggio
 */
export type TipoMassaggioEnum =
  | 'svedese'
  | 'sportivo'
  | 'decontratturante'
  | 'rilassante'
  | 'linfodrenante'
  | 'altro'

/**
 * Enum per intensità massaggio
 */
export type IntensitaMassaggioEnum = 'leggera' | 'media' | 'intensa'

/**
 * Enum per qualità sonno
 */
export type QualitaSonnoEnum = 'ottima' | 'buona' | 'media' | 'scarsa'

/**
 * Enum per tipo dispositivo smart tracking
 */
export type DispositivoTipoEnum = 'smartwatch' | 'fitness_tracker' | 'app_mobile' | 'altro'

/**
 * Enum per metodo pagamento
 */
export type MetodoPagamentoEnum = 'carta' | 'bonifico' | 'contanti' | 'altro'

// ============================================================================
// SEZIONE 2: TIPI ANAGRAFICA
// ============================================================================

/**
 * Tipo completo dati anagrafici estesi (estende profiles)
 */
export interface AthleteAnagrafica {
  user_id: string
  nome: string
  cognome: string
  email: string
  telefono: string | null
  data_nascita: string | null // DATE in formato ISO string
  sesso: SexEnum | null
  codice_fiscale: string | null
  indirizzo: string | null
  citta: string | null
  cap: string | null
  provincia: string | null
  nazione: string | null
  contatto_emergenza_nome: string | null
  contatto_emergenza_telefono: string | null
  contatto_emergenza_relazione: string | null
  professione: string | null
  altezza_cm: number | null
  peso_iniziale_kg: number | null
  gruppo_sanguigno: string | null
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati anagrafici
 */
export type AthleteAnagraficaInsert = Omit<
  AthleteAnagrafica,
  'user_id' | 'created_at' | 'updated_at'
> & {
  user_id?: string
}

/**
 * Tipo per update dati anagrafici (tutti i campi opzionali)
 */
export type AthleteAnagraficaUpdate = Partial<
  Omit<AthleteAnagrafica, 'user_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// SEZIONE 3: TIPI MEDICA
// ============================================================================

/**
 * Tipo per referto medico singolo (JSONB)
 */
export interface RefertoMedico {
  url: string
  data: string // DATE in formato ISO string
  tipo: string
  note?: string
}

/**
 * Tipo per farmaco assunto (JSONB)
 */
export interface FarmacoAssunto {
  nome: string
  dosaggio: string
  frequenza: string
  note?: string
}

/**
 * Tipo per intervento chirurgico (JSONB)
 */
export interface InterventoChirurgico {
  data: string // DATE in formato ISO string
  tipo: string
  note?: string
}

/**
 * Tipo completo dati medici
 */
export interface AthleteMedicalData {
  id: string
  athlete_id: string
  certificato_medico_url: string | null
  certificato_medico_scadenza: string | null // DATE in formato ISO string
  certificato_medico_tipo: CertificatoTipoEnum | null
  referti_medici: RefertoMedico[]
  allergie: string[]
  patologie: string[]
  farmaci_assunti: FarmacoAssunto[]
  interventi_chirurgici: InterventoChirurgico[]
  note_mediche: string | null
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati medici
 */
export type AthleteMedicalDataInsert = Omit<
  AthleteMedicalData,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
}

/**
 * Tipo per update dati medici
 */
export type AthleteMedicalDataUpdate = Partial<
  Omit<AthleteMedicalData, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// SEZIONE 4: TIPI FITNESS
// ============================================================================

/**
 * Tipo per infortunio pregresso (JSONB)
 */
export interface InfortunioPregresso {
  data: string // DATE in formato ISO string
  tipo: string
  recuperato: boolean
  note?: string
}

/**
 * Tipo completo dati fitness
 */
export interface AthleteFitnessData {
  id: string
  athlete_id: string
  livello_esperienza: LivelloEsperienzaEnum | null
  obiettivo_primario: ObiettivoFitnessEnum | null
  obiettivi_secondari: ObiettivoFitnessEnum[]
  giorni_settimana_allenamento: number | null // 1-7
  durata_sessione_minuti: number | null
  preferenze_orario: string[] // ['mattina', 'pomeriggio', 'sera']
  attivita_precedenti: string[]
  infortuni_pregressi: InfortunioPregresso[]
  zone_problematiche: string[]
  note_fitness: string | null
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati fitness
 */
export type AthleteFitnessDataInsert = Omit<
  AthleteFitnessData,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
}

/**
 * Tipo per update dati fitness
 */
export type AthleteFitnessDataUpdate = Partial<
  Omit<AthleteFitnessData, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// SEZIONE 5: TIPI MOTIVAZIONALE
// ============================================================================

/**
 * Tipo per abbandono storico (JSONB)
 */
export interface AbbandonoStorico {
  data: string // DATE in formato ISO string
  motivo: string
  durata_mesi?: number
}

/**
 * Tipo completo dati motivazionali
 */
export interface AthleteMotivationalData {
  id: string
  athlete_id: string
  motivazione_principale: string | null
  motivazioni_secondarie: string[]
  ostacoli_percepiti: string[]
  preferenze_ambiente: string[] // ['palestra', 'casa', 'outdoor', 'misto']
  preferenze_compagnia: string[] // ['solo', 'partner', 'gruppo', 'misto']
  livello_motivazione: number | null // 1-10
  storico_abbandoni: AbbandonoStorico[]
  note_motivazionali: string | null
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati motivazionali
 */
export type AthleteMotivationalDataInsert = Omit<
  AthleteMotivationalData,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
}

/**
 * Tipo per update dati motivazionali
 */
export type AthleteMotivationalDataUpdate = Partial<
  Omit<AthleteMotivationalData, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// SEZIONE 6: TIPI NUTRIZIONE
// ============================================================================

/**
 * Tipo per macronutrienti target (JSONB)
 */
export interface MacronutrientiTarget {
  proteine_g: number | null
  carboidrati_g: number | null
  grassi_g: number | null
}

/**
 * Tipo per preferenze orari pasti (JSONB)
 */
export interface PreferenzeOrariPasti {
  colazione: string | null // Orario in formato HH:mm
  pranzo: string | null
  cena: string | null
  spuntini: string[] // Array di orari
}

/**
 * Tipo completo dati nutrizionali
 */
export interface AthleteNutritionData {
  id: string
  athlete_id: string
  obiettivo_nutrizionale: ObiettivoNutrizionaleEnum | null
  calorie_giornaliere_target: number | null
  macronutrienti_target: MacronutrientiTarget
  dieta_seguita: DietaEnum | null
  intolleranze_alimentari: string[]
  allergie_alimentari: string[]
  alimenti_preferiti: string[]
  alimenti_evitati: string[]
  preferenze_orari_pasti: PreferenzeOrariPasti
  note_nutrizionali: string | null
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati nutrizionali
 */
export type AthleteNutritionDataInsert = Omit<
  AthleteNutritionData,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
}

/**
 * Tipo per update dati nutrizionali
 */
export type AthleteNutritionDataUpdate = Partial<
  Omit<AthleteNutritionData, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// SEZIONE 7: TIPI MASSAGGI
// ============================================================================

/**
 * Tipo per massaggio storico (JSONB)
 */
export interface MassaggioStorico {
  data: string // DATE in formato ISO string
  tipo: TipoMassaggioEnum
  durata_minuti: number
  note?: string
}

/**
 * Tipo completo dati massaggi
 */
export interface AthleteMassageData {
  id: string
  athlete_id: string
  preferenze_tipo_massaggio: TipoMassaggioEnum[]
  zone_problematiche: string[]
  intensita_preferita: IntensitaMassaggioEnum | null
  allergie_prodotti: string[]
  note_terapeutiche: string | null
  storico_massaggi: MassaggioStorico[]
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati massaggi
 */
export type AthleteMassageDataInsert = Omit<
  AthleteMassageData,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
}

/**
 * Tipo per update dati massaggi
 */
export type AthleteMassageDataUpdate = Partial<
  Omit<AthleteMassageData, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// SEZIONE 8: TIPI AMMINISTRATIVA
// ============================================================================

/**
 * Tipo per documento contrattuale (JSONB)
 */
export interface DocumentoContrattuale {
  url: string
  nome: string
  tipo: string
  data_upload: string // TIMESTAMP in formato ISO string
  note?: string
}

/**
 * Tipo completo dati amministrativi
 */
export interface AthleteAdministrativeData {
  id: string
  athlete_id: string
  tipo_abbonamento: TipoAbbonamentoEnum | null
  stato_abbonamento: StatoAbbonamentoEnum | null
  data_inizio_abbonamento: string | null // DATE in formato ISO string
  data_scadenza_abbonamento: string | null // DATE in formato ISO string
  lezioni_incluse: number
  lezioni_utilizzate: number
  lezioni_rimanenti: number // Calcolato automaticamente
  metodo_pagamento_preferito: MetodoPagamentoEnum | null
  note_contrattuali: string | null
  documenti_contrattuali: DocumentoContrattuale[]
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati amministrativi
 */
export type AthleteAdministrativeDataInsert = Omit<
  AthleteAdministrativeData,
  'id' | 'lezioni_rimanenti' | 'created_at' | 'updated_at'
> & {
  id?: string
  lezioni_rimanenti?: number
}

/**
 * Tipo per update dati amministrativi
 */
export type AthleteAdministrativeDataUpdate = Partial<
  Omit<
    AthleteAdministrativeData,
    'id' | 'athlete_id' | 'lezioni_rimanenti' | 'created_at' | 'updated_at'
  >
> & {
  lezioni_rimanenti?: number // Può essere aggiornato manualmente se necessario
}

// ============================================================================
// SEZIONE 9: TIPI SMART TRACKING
// ============================================================================

/**
 * Tipo per metriche custom (JSONB flessibile)
 */
export type MetricaCustom = Record<string, unknown>

/**
 * Tipo completo dati smart tracking
 */
export interface AthleteSmartTrackingData {
  id: string
  athlete_id: string
  data_rilevazione: string // DATE in formato ISO string
  dispositivo_tipo: DispositivoTipoEnum | null
  dispositivo_marca: string | null
  passi_giornalieri: number | null
  calorie_bruciate: number | null
  distanza_percorsa_km: number | null
  battito_cardiaco_medio: number | null // bpm, range 1-250
  battito_cardiaco_max: number | null
  battito_cardiaco_min: number | null
  ore_sonno: number | null // range 0-24
  qualita_sonno: QualitaSonnoEnum | null
  attivita_minuti: number | null
  metrica_custom: MetricaCustom
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati smart tracking
 */
export type AthleteSmartTrackingDataInsert = Omit<
  AthleteSmartTrackingData,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
}

/**
 * Tipo per update dati smart tracking
 */
export type AthleteSmartTrackingDataUpdate = Partial<
  Omit<
    AthleteSmartTrackingData,
    'id' | 'athlete_id' | 'data_rilevazione' | 'created_at' | 'updated_at'
  >
>

// ============================================================================
// SEZIONE 10: TIPI AI DATA
// ============================================================================

/**
 * Tipo per insight aggregato (JSONB flessibile)
 */
export type InsightAggregato = Record<string, unknown>

/**
 * Tipo per raccomandazione (JSONB)
 */
export interface Raccomandazione {
  tipo: string
  priorita: 'alta' | 'media' | 'bassa'
  descrizione: string
  azione?: string
}

/**
 * Tipo per pattern rilevato (JSONB)
 */
export interface PatternRilevato {
  tipo: string
  descrizione: string
  frequenza: string
}

/**
 * Tipo per predizione performance (JSONB)
 */
export interface PredizionePerformance {
  metrica: string
  valore_predetto: number
  confidenza: number // 0-100
  data_target: string // DATE in formato ISO string
}

/**
 * Tipo completo dati AI
 */
export interface AthleteAIData {
  id: string
  athlete_id: string
  data_analisi: string // TIMESTAMP in formato ISO string
  insights_aggregati: InsightAggregato
  raccomandazioni: Raccomandazione[]
  pattern_rilevati: PatternRilevato[]
  predizioni_performance: PredizionePerformance[]
  score_engagement: number | null // 0-100
  score_progresso: number | null // 0-100
  fattori_rischio: string[]
  note_ai: string | null
  created_at: string
  updated_at: string
}

/**
 * Tipo per insert dati AI
 */
export type AthleteAIDataInsert = Omit<AthleteAIData, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
}

/**
 * Tipo per update dati AI
 */
export type AthleteAIDataUpdate = Partial<
  Omit<AthleteAIData, 'id' | 'athlete_id' | 'data_analisi' | 'created_at' | 'updated_at'>
>

// ============================================================================
// SEZIONE 11: TIPI COMPOSITI
// ============================================================================

/**
 * Tipo completo profilo atleta con tutte le 9 categorie dati
 * Corrisponde al risultato di get_athlete_profile_complete()
 */
export interface AthleteProfileComplete {
  anagrafica: AthleteAnagrafica | Record<string, never>
  medica: AthleteMedicalData | Record<string, never>
  fitness: AthleteFitnessData | Record<string, never>
  motivazionale: AthleteMotivationalData | Record<string, never>
  nutrizione: AthleteNutritionData | Record<string, never>
  massaggi: AthleteMassageData | Record<string, never>
  amministrativa: AthleteAdministrativeData | Record<string, never>
  smart_tracking_latest: AthleteSmartTrackingData | Record<string, never>
  ai_data_latest: AthleteAIData | Record<string, never>
  timestamp: string
}

/**
 * Tipo per dati tab multi-origine (per UI tabs che combinano più categorie)
 */
export interface AthleteProfileTabData {
  anagrafica?: AthleteAnagrafica
  medica?: AthleteMedicalData
  fitness?: AthleteFitnessData
  motivazionale?: AthleteMotivationalData
  nutrizione?: AthleteNutritionData
  massaggi?: AthleteMassageData
  amministrativa?: AthleteAdministrativeData
  smart_tracking?: AthleteSmartTrackingData[]
  ai_data?: AthleteAIData[]
}

/**
 * Tipo per statistiche profilo atleta
 * Corrisponde al risultato di calculate_athlete_progress_score()
 */
export interface AthleteProfileStats {
  score_totale: number
  score_medico: number
  score_fitness: number
  score_nutrizione: number
  score_amministrativo: number
  score_ai: number
  breakdown: {
    peso_medico: number
    peso_fitness: number
    peso_nutrizione: number
    peso_amministrativo: number
    peso_ai: number
  }
  indicatori: {
    certificato_valido: boolean
    lezioni_rimanenti: number
    score_engagement: number
    score_progresso: number
  }
  timestamp: string
}

/**
 * Tipo per info certificato
 * Corrisponde al risultato di check_certificato_scadenza()
 */
export interface CertificatoInfo {
  ha_certificato: boolean
  stato: 'assente' | 'scaduto' | 'in_scadenza' | 'in_scadenza_presto' | 'valido'
  data_scadenza: string | null // DATE in formato ISO string
  giorni_alla_scadenza: number | null
  avviso: string
  urgenza: 'critica' | 'alta' | 'media' | 'bassa'
  timestamp: string
}

/**
 * Tipo per insights aggregati
 * Corrisponde al risultato di get_athlete_insights()
 */
export interface AthleteInsights {
  ai_data: {
    disponibile: boolean
    data_analisi?: string
    insights_aggregati?: InsightAggregato
    raccomandazioni?: Raccomandazione[]
    pattern_rilevati?: PatternRilevato[]
    predizioni_performance?: PredizionePerformance[]
    score_engagement?: number
    score_progresso?: number
    fattori_rischio?: string[]
    note_ai?: string
  }
  certificato: CertificatoInfo
  progress_score: AthleteProfileStats
  statistiche: {
    smart_tracking: {
      giorni_attivita_ultimi_30: number
      media_passi_giornalieri: number
      media_calorie_bruciate: number
      media_ore_sonno: number
    }
  }
  timestamp: string
}
