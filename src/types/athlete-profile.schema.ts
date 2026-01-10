/**
 * @fileoverview Schema Zod per validazione modulo Profilo Atleta
 * @description Validazione completa per tutte le 9 categorie dati del profilo atleta
 * @module types/athlete-profile.schema
 */

import { z } from 'zod'

// ============================================================================
// SEZIONE 1: SCHEMA ENUM
// ============================================================================

export const sexEnumSchema = z.enum(['maschio', 'femmina', 'altro', 'non_specificato'])

export const certificatoTipoEnumSchema = z.enum(['agonistico', 'non_agonistico', 'sportivo'])

export const livelloEsperienzaEnumSchema = z.enum([
  'principiante',
  'intermedio',
  'avanzato',
  'professionista',
])

export const obiettivoFitnessEnumSchema = z.enum([
  'dimagrimento',
  'massa_muscolare',
  'forza',
  'resistenza',
  'tonificazione',
  'riabilitazione',
  'altro',
])

export const obiettivoNutrizionaleEnumSchema = z.enum([
  'dimagrimento',
  'massa',
  'mantenimento',
  'performance',
  'salute',
])

export const dietaEnumSchema = z.enum([
  'onnivora',
  'vegetariana',
  'vegana',
  'keto',
  'paleo',
  'mediterranea',
  'altro',
])

// Definisci l'array di valori prima per evitare problemi di tree-shaking
const tipoAbbonamentoValues = [
  'mensile',
  'trimestrale',
  'semestrale',
  'annuale',
  'pacchetto_lezioni',
  'nessuno',
] as const

export const tipoAbbonamentoEnumSchema = z.enum(tipoAbbonamentoValues)

export const statoAbbonamentoEnumSchema = z.enum(['attivo', 'scaduto', 'sospeso', 'in_attesa'])

export const tipoMassaggioEnumSchema = z.enum([
  'svedese',
  'sportivo',
  'decontratturante',
  'rilassante',
  'linfodrenante',
  'altro',
])

export const intensitaMassaggioEnumSchema = z.enum(['leggera', 'media', 'intensa'])

export const qualitaSonnoEnumSchema = z.enum(['ottima', 'buona', 'media', 'scarsa'])

export const dispositivoTipoEnumSchema = z.enum([
  'smartwatch',
  'fitness_tracker',
  'app_mobile',
  'altro',
])

export const metodoPagamentoEnumSchema = z.enum(['carta', 'bonifico', 'contanti', 'altro'])

// ============================================================================
// SEZIONE 2: SCHEMA ANAGRAFICA
// ============================================================================

export const athleteAnagraficaSchema = z.object({
  user_id: z.string().uuid('ID utente non valido'),
  nome: z.string().min(1, 'Nome obbligatorio').max(100, 'Nome troppo lungo'),
  cognome: z.string().min(1, 'Cognome obbligatorio').max(100, 'Cognome troppo lungo'),
  email: z.string().email('Email non valida'),
  telefono: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Numero di telefono non valido')
    .nullable()
    .optional(),
  data_nascita: z
    .string()
    .date('Data di nascita non valida')
    .or(z.string().datetime()) // Accetta anche datetime
    .nullable()
    .optional(), // Rilassato: accetta date o datetime
  sesso: sexEnumSchema.nullable().optional(),
  codice_fiscale: z
    .string()
    .refine(
      (val) => {
        if (!val || val === '') return true
        // Accetta codice fiscale (16 caratteri) o partita IVA (11 caratteri)
        return /^[A-Z0-9]{16}$/i.test(val) || /^[0-9]{11}$/.test(val)
      },
      {
        message: 'Codice fiscale (16 caratteri) o Partita IVA (11 caratteri) non valido',
      },
    )
    .nullable()
    .optional(), // Rilassato: accetta CF o P.IVA
  indirizzo: z.string().max(200, 'Indirizzo troppo lungo').nullable().optional(),
  citta: z.string().max(100, 'Città troppo lunga').nullable().optional(),
  cap: z.string().max(10, 'CAP troppo lungo').nullable().optional(),
  provincia: z.string().max(50, 'Provincia troppo lunga').nullable().optional(),
  nazione: z.string().max(50, 'Nazione troppo lunga').nullable().optional(),
  contatto_emergenza_nome: z
    .string()
    .max(200, 'Nome contatto emergenza troppo lungo')
    .nullable()
    .optional(),
  contatto_emergenza_telefono: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Numero di telefono non valido')
    .nullable()
    .optional(),
  contatto_emergenza_relazione: z.string().max(50, 'Relazione troppo lunga').nullable().optional(),
  professione: z.string().max(100, 'Professione troppo lunga').nullable().optional(),
  altezza_cm: z
    .number()
    .int()
    .min(50, 'Altezza minima 50 cm')
    .max(250, 'Altezza massima 250 cm')
    .nullable()
    .optional(),
  peso_iniziale_kg: z
    .number()
    .min(20, 'Peso minimo 20 kg')
    .max(300, 'Peso massimo 300 kg')
    .nullable()
    .optional(),
  gruppo_sanguigno: z
    .string()
    .regex(/^(A|B|AB|O)[+-]$/, 'Gruppo sanguigno non valido (es: A+, B-, AB+, O-)')
    .nullable()
    .optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteAnagraficaSchema = athleteAnagraficaSchema
  .omit({ user_id: true, created_at: true, updated_at: true })
  .extend({
    user_id: z.string().uuid('ID utente non valido').optional(),
  })

export const updateAthleteAnagraficaSchema = createAthleteAnagraficaSchema.partial()

// ============================================================================
// SEZIONE 3: SCHEMA MEDICA
// ============================================================================

export const refertoMedicoSchema = z.object({
  url: z
    .string()
    .url('URL referto non valido')
    .or(z.string().startsWith('/')) // Accetta anche path relativi (bucket privati con signed URL)
    .nullable()
    .transform((v) => v ?? ''), // Mantieni compatibilità con dati esistenti
  data: z.string().date('Data referto non valida'),
  tipo: z.string().min(1, 'Tipo referto obbligatorio').max(100, 'Tipo referto troppo lungo'),
  note: z.string().max(500, 'Note troppo lunghe').optional(),
})

export const farmacoAssuntoSchema = z.object({
  nome: z.string().min(1, 'Nome farmaco obbligatorio').max(100, 'Nome farmaco troppo lungo'),
  dosaggio: z.string().min(1, 'Dosaggio obbligatorio').max(50, 'Dosaggio troppo lungo'),
  frequenza: z.string().min(1, 'Frequenza obbligatoria').max(50, 'Frequenza troppo lunga'),
  note: z.string().max(500, 'Note troppo lunghe').optional(),
})

export const interventoChirurgicoSchema = z.object({
  data: z.string().date('Data intervento non valida'),
  tipo: z.string().min(1, 'Tipo intervento obbligatorio').max(100, 'Tipo intervento troppo lungo'),
  note: z.string().max(500, 'Note troppo lunghe').optional(),
})

export const athleteMedicalDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  certificato_medico_url: z
    .string()
    .url('URL certificato non valido')
    .or(z.string().startsWith('/')) // Accetta anche path relativi
    .nullable()
    .optional(), // Rilassato: accetta URL o path relativi
  certificato_medico_scadenza: z.string().date('Data scadenza non valida').nullable().optional(),
  certificato_medico_tipo: certificatoTipoEnumSchema.nullable().optional(),
  referti_medici: z.array(refertoMedicoSchema).default([]),
  allergie: z.array(z.string().min(1).max(100)).default([]),
  patologie: z.array(z.string().min(1).max(100)).default([]),
  farmaci_assunti: z.array(farmacoAssuntoSchema).default([]),
  interventi_chirurgici: z.array(interventoChirurgicoSchema).default([]),
  note_mediche: z.string().max(2000, 'Note troppo lunghe').nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteMedicalDataSchema = athleteMedicalDataSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
  })

export const updateAthleteMedicalDataSchema = createAthleteMedicalDataSchema
  .partial()
  .omit({ athlete_id: true })

// ============================================================================
// SEZIONE 4: SCHEMA FITNESS
// ============================================================================

export const infortunioPregressoSchema = z.object({
  data: z.string().date('Data infortunio non valida'),
  tipo: z.string().min(1, 'Tipo infortunio obbligatorio').max(100, 'Tipo infortunio troppo lungo'),
  recuperato: z.boolean(),
  note: z.string().max(500, 'Note troppo lunghe').optional(),
})

export const athleteFitnessDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  livello_esperienza: livelloEsperienzaEnumSchema.nullable().optional(),
  obiettivo_primario: obiettivoFitnessEnumSchema.nullable().optional(),
  obiettivi_secondari: z.array(obiettivoFitnessEnumSchema).default([]),
  giorni_settimana_allenamento: z
    .number()
    .int()
    .min(1, 'Minimo 1 giorno')
    .max(7, 'Massimo 7 giorni')
    .nullable()
    .optional(),
  durata_sessione_minuti: z
    .number()
    .int()
    .min(15, 'Durata minima 15 minuti')
    .max(300, 'Durata massima 300 minuti')
    .nullable()
    .optional(),
  preferenze_orario: z.array(z.string().max(20)).default([]),
  attivita_precedenti: z.array(z.string().min(1).max(100)).default([]),
  infortuni_pregressi: z.array(infortunioPregressoSchema).default([]),
  zone_problematiche: z.array(z.string().min(1).max(100)).default([]),
  note_fitness: z.string().max(2000, 'Note troppo lunghe').nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteFitnessDataSchema = athleteFitnessDataSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
  })

export const updateAthleteFitnessDataSchema = createAthleteFitnessDataSchema
  .partial()
  .omit({ athlete_id: true })

// ============================================================================
// SEZIONE 5: SCHEMA MOTIVAZIONALE
// ============================================================================

export const abbandonoStoricoSchema = z.object({
  data: z.string().date('Data abbandono non valida'),
  motivo: z.string().min(1, 'Motivo obbligatorio').max(500, 'Motivo troppo lungo'),
  durata_mesi: z.number().int().min(1).max(120).optional(),
})

export const athleteMotivationalDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  motivazione_principale: z.string().max(1000, 'Motivazione troppo lunga').nullable().optional(),
  motivazioni_secondarie: z.array(z.string().min(1).max(500)).default([]),
  ostacoli_percepiti: z.array(z.string().min(1).max(500)).default([]),
  preferenze_ambiente: z.array(z.string().max(20)).default([]),
  preferenze_compagnia: z.array(z.string().max(20)).default([]),
  livello_motivazione: z
    .number()
    .int()
    .min(1, 'Livello minimo 1')
    .max(10, 'Livello massimo 10')
    .nullable()
    .optional(),
  storico_abbandoni: z.array(abbandonoStoricoSchema).default([]),
  note_motivazionali: z.string().max(2000, 'Note troppo lunghe').nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteMotivationalDataSchema = athleteMotivationalDataSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
  })

export const updateAthleteMotivationalDataSchema = createAthleteMotivationalDataSchema
  .partial()
  .omit({ athlete_id: true })

// ============================================================================
// SEZIONE 6: SCHEMA NUTRIZIONE
// ============================================================================

export const macronutrientiTargetSchema = z.object({
  proteine_g: z
    .number()
    .min(0, 'Proteine non possono essere negative')
    .max(1000, 'Proteine troppo alte')
    .nullable()
    .optional(),
  carboidrati_g: z
    .number()
    .min(0, 'Carboidrati non possono essere negativi')
    .max(2000, 'Carboidrati troppo alti')
    .nullable()
    .optional(),
  grassi_g: z
    .number()
    .min(0, 'Grassi non possono essere negativi')
    .max(500, 'Grassi troppo alti')
    .nullable()
    .optional(),
})

export const preferenzeOrariPastiSchema = z.object({
  colazione: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:mm)')
    .nullable()
    .optional(),
  pranzo: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:mm)')
    .nullable()
    .optional(),
  cena: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:mm)')
    .nullable()
    .optional(),
  spuntini: z
    .array(
      z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:mm)'),
    )
    .default([]),
})

export const athleteNutritionDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  obiettivo_nutrizionale: obiettivoNutrizionaleEnumSchema.nullable().optional(),
  calorie_giornaliere_target: z
    .number()
    .int()
    .min(800, 'Calorie minime 800 kcal')
    .max(8000, 'Calorie massime 8000 kcal') // Ridotto da 10000 a 8000 (più realistico)
    .nullable()
    .optional(),
  macronutrienti_target: macronutrientiTargetSchema.default({
    proteine_g: null,
    carboidrati_g: null,
    grassi_g: null,
  }),
  dieta_seguita: dietaEnumSchema.nullable().optional(),
  intolleranze_alimentari: z.array(z.string().min(1).max(100)).default([]),
  allergie_alimentari: z.array(z.string().min(1).max(100)).default([]),
  alimenti_preferiti: z.array(z.string().min(1).max(100)).default([]),
  alimenti_evitati: z.array(z.string().min(1).max(100)).default([]),
  preferenze_orari_pasti: preferenzeOrariPastiSchema.default({
    colazione: null,
    pranzo: null,
    cena: null,
    spuntini: [],
  }),
  note_nutrizionali: z.string().max(2000, 'Note troppo lunghe').nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteNutritionDataSchema = athleteNutritionDataSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
  })

export const updateAthleteNutritionDataSchema = createAthleteNutritionDataSchema
  .partial()
  .omit({ athlete_id: true })

// ============================================================================
// SEZIONE 7: SCHEMA MASSAGGI
// ============================================================================

export const massaggioStoricoSchema = z.object({
  data: z.string().date('Data massaggio non valida'),
  tipo: tipoMassaggioEnumSchema,
  durata_minuti: z
    .number()
    .int()
    .min(15, 'Durata minima 15 minuti')
    .max(180, 'Durata massima 180 minuti'),
  note: z.string().max(500, 'Note troppo lunghe').optional(),
})

export const athleteMassageDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  preferenze_tipo_massaggio: z.array(tipoMassaggioEnumSchema).default([]),
  zone_problematiche: z.array(z.string().min(1).max(100)).default([]),
  intensita_preferita: intensitaMassaggioEnumSchema.nullable().optional(),
  allergie_prodotti: z.array(z.string().min(1).max(100)).default([]),
  note_terapeutiche: z.string().max(2000, 'Note troppo lunghe').nullable().optional(),
  storico_massaggi: z.array(massaggioStoricoSchema).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteMassageDataSchema = athleteMassageDataSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
  })

export const updateAthleteMassageDataSchema = createAthleteMassageDataSchema
  .partial()
  .omit({ athlete_id: true })

// ============================================================================
// SEZIONE 8: SCHEMA AMMINISTRATIVA
// ============================================================================

export const documentoContrattualeSchema = z.object({
  url: z.string().url('URL documento non valido'),
  nome: z.string().min(1, 'Nome documento obbligatorio').max(200, 'Nome documento troppo lungo'),
  tipo: z.string().min(1, 'Tipo documento obbligatorio').max(50, 'Tipo documento troppo lungo'),
  data_upload: z.string().datetime('Data upload non valida'),
  note: z.string().max(500, 'Note troppo lunghe').optional(),
})

export const athleteAdministrativeDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  tipo_abbonamento: tipoAbbonamentoEnumSchema.nullable().optional(),
  stato_abbonamento: statoAbbonamentoEnumSchema.nullable().optional(),
  data_inizio_abbonamento: z.string().date('Data inizio non valida').nullable().optional(),
  data_scadenza_abbonamento: z.string().date('Data scadenza non valida').nullable().optional(),
  lezioni_incluse: z
    .number()
    .int()
    .min(0, 'Lezioni incluse non possono essere negative')
    .default(0),
  lezioni_utilizzate: z
    .number()
    .int()
    .min(0, 'Lezioni utilizzate non possono essere negative')
    .default(0),
  lezioni_rimanenti: z
    .number()
    .int()
    .min(0, 'Lezioni rimanenti non possono essere negative')
    .default(0),
  metodo_pagamento_preferito: metodoPagamentoEnumSchema.nullable().optional(),
  note_contrattuali: z.string().max(2000, 'Note troppo lunghe').nullable().optional(),
  documenti_contrattuali: z.array(documentoContrattualeSchema).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteAdministrativeDataSchema = athleteAdministrativeDataSchema
  .omit({ id: true, lezioni_rimanenti: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
    lezioni_rimanenti: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.lezioni_utilizzate !== undefined && data.lezioni_incluse !== undefined) {
        return data.lezioni_utilizzate <= data.lezioni_incluse
      }
      return true
    },
    {
      message: 'Lezioni utilizzate non possono essere maggiori delle lezioni incluse',
      path: ['lezioni_utilizzate'],
    },
  )

export const updateAthleteAdministrativeDataSchema = createAthleteAdministrativeDataSchema
  .partial()
  .omit({ athlete_id: true })
  .refine(
    (data) => {
      if (data.lezioni_utilizzate !== undefined && data.lezioni_incluse !== undefined) {
        return data.lezioni_utilizzate <= data.lezioni_incluse
      }
      return true
    },
    {
      message: 'Lezioni utilizzate non possono essere maggiori delle lezioni incluse',
      path: ['lezioni_utilizzate'],
    },
  )

// ============================================================================
// SEZIONE 9: SCHEMA SMART TRACKING
// ============================================================================

export const metricaCustomSchema = z.record(z.string(), z.unknown())

export const athleteSmartTrackingDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  data_rilevazione: z.string().date('Data rilevazione non valida'),
  dispositivo_tipo: dispositivoTipoEnumSchema.nullable().optional(),
  dispositivo_marca: z.string().max(50, 'Marca dispositivo troppo lunga').nullable().optional(),
  passi_giornalieri: z
    .number()
    .int()
    .min(0, 'Passi non possono essere negativi')
    .max(100000, 'Passi troppo alti')
    .nullable()
    .optional(),
  calorie_bruciate: z
    .number()
    .int()
    .min(0, 'Calorie non possono essere negative')
    .max(20000, 'Calorie troppo alte')
    .nullable()
    .optional(),
  distanza_percorsa_km: z
    .number()
    .min(0, 'Distanza non può essere negativa')
    .max(1000, 'Distanza troppo alta')
    .nullable()
    .optional(),
  battito_cardiaco_medio: z
    .number()
    .int()
    .min(30, 'Battito minimo 30 bpm')
    .max(250, 'Battito massimo 250 bpm')
    .nullable()
    .optional(),
  battito_cardiaco_max: z
    .number()
    .int()
    .min(30, 'Battito minimo 30 bpm')
    .max(250, 'Battito massimo 250 bpm')
    .nullable()
    .optional(),
  battito_cardiaco_min: z
    .number()
    .int()
    .min(30, 'Battito minimo 30 bpm')
    .max(250, 'Battito massimo 250 bpm')
    .nullable()
    .optional(),
  ore_sonno: z
    .number()
    .min(0, 'Ore sonno non possono essere negative')
    .max(24, 'Ore sonno massime 24')
    .nullable()
    .optional(),
  qualita_sonno: qualitaSonnoEnumSchema.nullable().optional(),
  attivita_minuti: z
    .number()
    .int()
    .min(0, 'Minuti attività non possono essere negativi')
    .max(1440, 'Massimo 1440 minuti')
    .nullable()
    .optional(),
  metrica_custom: metricaCustomSchema.default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteSmartTrackingDataSchema = athleteSmartTrackingDataSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
  })

export const updateAthleteSmartTrackingDataSchema = createAthleteSmartTrackingDataSchema
  .partial()
  .omit({ athlete_id: true, data_rilevazione: true })

// ============================================================================
// SEZIONE 10: SCHEMA AI DATA
// ============================================================================

export const insightAggregatoSchema = z.record(z.string(), z.unknown())

export const raccomandazioneSchema = z.object({
  tipo: z.string().min(1, 'Tipo raccomandazione obbligatorio').max(50, 'Tipo troppo lungo'),
  priorita: z.enum(['alta', 'media', 'bassa']),
  descrizione: z.string().min(1, 'Descrizione obbligatoria').max(1000, 'Descrizione troppo lunga'),
  azione: z.string().max(500, 'Azione troppo lunga').optional(),
})

export const patternRilevatoSchema = z.object({
  tipo: z.string().min(1, 'Tipo pattern obbligatorio').max(50, 'Tipo troppo lungo'),
  descrizione: z.string().min(1, 'Descrizione obbligatoria').max(1000, 'Descrizione troppo lunga'),
  frequenza: z.string().min(1, 'Frequenza obbligatoria').max(100, 'Frequenza troppo lunga'),
})

export const predizionePerformanceSchema = z.object({
  metrica: z.string().min(1, 'Metrica obbligatoria').max(50, 'Metrica troppo lunga'),
  valore_predetto: z.number(),
  confidenza: z.number().int().min(0, 'Confidenza minima 0').max(100, 'Confidenza massima 100'),
  data_target: z.string().date('Data target non valida'),
})

export const athleteAIDataSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid('ID atleta non valido'),
  data_analisi: z.string().datetime('Data analisi non valida'),
  insights_aggregati: insightAggregatoSchema.default({}),
  raccomandazioni: z.array(raccomandazioneSchema).default([]),
  pattern_rilevati: z.array(patternRilevatoSchema).default([]),
  predizioni_performance: z.array(predizionePerformanceSchema).default([]),
  score_engagement: z
    .number()
    .min(0, 'Score minimo 0')
    .max(100, 'Score massimo 100')
    .nullable()
    .optional(),
  score_progresso: z
    .number()
    .min(0, 'Score minimo 0')
    .max(100, 'Score massimo 100')
    .nullable()
    .optional(),
  fattori_rischio: z.array(z.string().min(1).max(200)).default([]),
  note_ai: z.string().max(2000, 'Note troppo lunghe').nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createAthleteAIDataSchema = athleteAIDataSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid().optional(),
  })

export const updateAthleteAIDataSchema = createAthleteAIDataSchema
  .partial()
  .omit({ athlete_id: true, data_analisi: true })

// ============================================================================
// SEZIONE 11: TIPI INFERITI (per TypeScript)
// ============================================================================

export type AthleteAnagraficaValidation = z.infer<typeof athleteAnagraficaSchema>
export type CreateAthleteAnagraficaValidation = z.infer<typeof createAthleteAnagraficaSchema>
export type UpdateAthleteAnagraficaValidation = z.infer<typeof updateAthleteAnagraficaSchema>

export type AthleteMedicalDataValidation = z.infer<typeof athleteMedicalDataSchema>
export type CreateAthleteMedicalDataValidation = z.infer<typeof createAthleteMedicalDataSchema>
export type UpdateAthleteMedicalDataValidation = z.infer<typeof updateAthleteMedicalDataSchema>

export type AthleteFitnessDataValidation = z.infer<typeof athleteFitnessDataSchema>
export type CreateAthleteFitnessDataValidation = z.infer<typeof createAthleteFitnessDataSchema>
export type UpdateAthleteFitnessDataValidation = z.infer<typeof updateAthleteFitnessDataSchema>

export type AthleteMotivationalDataValidation = z.infer<typeof athleteMotivationalDataSchema>
export type CreateAthleteMotivationalDataValidation = z.infer<
  typeof createAthleteMotivationalDataSchema
>
export type UpdateAthleteMotivationalDataValidation = z.infer<
  typeof updateAthleteMotivationalDataSchema
>

export type AthleteNutritionDataValidation = z.infer<typeof athleteNutritionDataSchema>
export type CreateAthleteNutritionDataValidation = z.infer<typeof createAthleteNutritionDataSchema>
export type UpdateAthleteNutritionDataValidation = z.infer<typeof updateAthleteNutritionDataSchema>

export type AthleteMassageDataValidation = z.infer<typeof athleteMassageDataSchema>
export type CreateAthleteMassageDataValidation = z.infer<typeof createAthleteMassageDataSchema>
export type UpdateAthleteMassageDataValidation = z.infer<typeof updateAthleteMassageDataSchema>

export type AthleteAdministrativeDataValidation = z.infer<typeof athleteAdministrativeDataSchema>
export type CreateAthleteAdministrativeDataValidation = z.infer<
  typeof createAthleteAdministrativeDataSchema
>
export type UpdateAthleteAdministrativeDataValidation = z.infer<
  typeof updateAthleteAdministrativeDataSchema
>

export type AthleteSmartTrackingDataValidation = z.infer<typeof athleteSmartTrackingDataSchema>
export type CreateAthleteSmartTrackingDataValidation = z.infer<
  typeof createAthleteSmartTrackingDataSchema
>
export type UpdateAthleteSmartTrackingDataValidation = z.infer<
  typeof updateAthleteSmartTrackingDataSchema
>

export type AthleteAIDataValidation = z.infer<typeof athleteAIDataSchema>
export type CreateAthleteAIDataValidation = z.infer<typeof createAthleteAIDataSchema>
export type UpdateAthleteAIDataValidation = z.infer<typeof updateAthleteAIDataSchema>
