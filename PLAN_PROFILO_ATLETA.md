# 📋 Piano di Sviluppo Completo — Modulo Profilo Atleta (PT + Atleta)

## 22Club — Versione 1.0

**Data Creazione**: 2025-01-27  
**Obiettivo**: Costruire l'intero modulo Profilo Atleta in modo affidabile, scalabile e completo al 100%  
**Modalità**: Step-by-step con conferma esplicita per ogni migrazione SQL

---

## 🎯 Overview Generale

### 9 Categorie Dati del Profilo Atleta

1. **Anagrafica** — Dati personali estesi (data nascita, indirizzo, contatti emergenza, ecc.)
2. **Medica** — Certificati, referti, allergie, patologie, farmaci
3. **Fitness** — Misurazioni, obiettivi fitness, livello esperienza
4. **Motivazionale** — Obiettivi personali, motivazioni, preferenze allenamento
5. **Nutrizione** — Obiettivi nutrizionali, preferenze alimentari, intolleranze
6. **Massaggi** — Preferenze massaggi, zone problematiche, note terapeutiche
7. **Amministrativa** — Abbonamenti, pagamenti, documenti contrattuali
8. **Smart Tracking** — Dati da dispositivi wearable, metriche automatiche
9. **AI Data** — Dati aggregati per AI, insights, raccomandazioni

---

## 📊 Struttura Piano: Fasi → Epiche → Task → Sub-task

---

# FASE 1: DATABASE & SUPABASE (PRIORITÀ ALTA)

## 🎯 Obiettivo Fase 1

Creare tutte le tabelle, relazioni, RLS policies, trigger, funzioni e storage buckets necessari per il modulo Profilo Atleta.

**Modalità**: Un file SQL alla volta → Conferma → Prossimo step

---

## 📦 EPICA 1.1: Estensione Tabella Profiles (Anagrafica)

### Task 1.1.1: Migrazione Colonne Anagrafiche Aggiuntive

**File SQL**: `20250127_extend_profiles_anagrafica.sql`

**Sub-task**:

- [ ] Aggiungere colonna `data_nascita` (DATE)
- [ ] Aggiungere colonna `sesso` (VARCHAR(10) CHECK IN ('maschio', 'femmina', 'altro', 'non_specificato'))
- [ ] Aggiungere colonna `codice_fiscale` (VARCHAR(16))
- [ ] Aggiungere colonna `indirizzo` (TEXT)
- [ ] Aggiungere colonna `citta` (VARCHAR(100))
- [ ] Aggiungere colonna `cap` (VARCHAR(10))
- [ ] Aggiungere colonna `provincia` (VARCHAR(50))
- [ ] Aggiungere colonna `nazione` (VARCHAR(50) DEFAULT 'Italia')
- [ ] Aggiungere colonna `contatto_emergenza_nome` (VARCHAR(200))
- [ ] Aggiungere colonna `contatto_emergenza_telefono` (VARCHAR(20))
- [ ] Aggiungere colonna `contatto_emergenza_relazione` (VARCHAR(50))
- [ ] Aggiungere colonna `professione` (VARCHAR(100))
- [ ] Aggiungere colonna `altezza_cm` (INTEGER)
- [ ] Aggiungere colonna `peso_iniziale_kg` (DECIMAL(5,2))
- [ ] Aggiungere colonna `gruppo_sanguigno` (VARCHAR(5))

**Indici**:

- [ ] `idx_profiles_data_nascita` (data_nascita)
- [ ] `idx_profiles_citta` (citta)
- [ ] `idx_profiles_codice_fiscale` (codice_fiscale) UNIQUE

**Criteri di Accettazione**:

- ✅ Tutte le colonne aggiunte senza errori
- ✅ Indici creati correttamente
- ✅ Nessun dato esistente perso
- ✅ Migrazione idempotente (può essere eseguita più volte)

**Dipendenze**: Nessuna (primo step)

**⚠️ PRIMA RICHIESTA**: Questo è lo Step 1 che deve essere eseguito per primo.

---

## 📦 EPICA 1.2: Tabella Dati Medici

### Task 1.2.1: Creazione Tabella `athlete_medical_data`

**File SQL**: `20250127_create_athlete_medical_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `certificato_medico_url` (TEXT) — path file storage
  - `certificato_medico_scadenza` (DATE)
  - `certificato_medico_tipo` (VARCHAR(50)) — 'agonistico', 'non_agonistico', 'sportivo'
  - `referti_medici` (JSONB) — array di referti con url, data, tipo
  - `allergie` (TEXT[]) — array allergie
  - `patologie` (TEXT[]) — array patologie croniche
  - `farmaci_assunti` (JSONB) — array farmaci con nome, dosaggio, frequenza
  - `interventi_chirurgici` (JSONB) — array interventi con data, tipo, note
  - `note_mediche` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_medical_athlete_id` (athlete_id)
- [ ] `idx_medical_certificato_scadenza` (certificato_medico_scadenza) WHERE certificato_medico_scadenza IS NOT NULL

**Trigger**:

- [ ] Trigger `update_medical_updated_at` per updated_at

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT: Solo PT e Admin
- [ ] Policy UPDATE: Solo PT e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ Foreign key funzionante
- ✅ RLS policies testate
- ✅ Trigger funzionante

**Dipendenze**: Task 1.1.1 (profiles esteso)

---

## 📦 EPICA 1.3: Tabella Dati Fitness

### Task 1.3.1: Creazione Tabella `athlete_fitness_data`

**File SQL**: `20250127_create_athlete_fitness_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `livello_esperienza` (VARCHAR(20)) — 'principiante', 'intermedio', 'avanzato', 'professionista'
  - `obiettivo_primario` (VARCHAR(50)) — 'dimagrimento', 'massa_muscolare', 'forza', 'resistenza', 'tonificazione', 'riabilitazione', 'altro'
  - `obiettivi_secondari` (VARCHAR(50)[])
  - `giorni_settimana_allenamento` (INTEGER DEFAULT 3)
  - `durata_sessione_minuti` (INTEGER DEFAULT 60)
  - `preferenze_orario` (VARCHAR(20)[]) — 'mattina', 'pomeriggio', 'sera'
  - `attivita_precedenti` (TEXT[])
  - `infortuni_pregressi` (JSONB) — array infortuni con data, tipo, recuperato
  - `zone_problematiche` (TEXT[]) — zone del corpo con problemi
  - `note_fitness` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_fitness_athlete_id` (athlete_id)
- [ ] `idx_fitness_obiettivo` (obiettivo_primario)

**Trigger**:

- [ ] Trigger `update_fitness_updated_at`

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT/UPDATE: Solo PT e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ Relazione con profiles funzionante
- ✅ RLS policies testate

**Dipendenze**: Task 1.1.1

---

## 📦 EPICA 1.4: Tabella Dati Motivazionali

### Task 1.4.1: Creazione Tabella `athlete_motivational_data`

**File SQL**: `20250127_create_athlete_motivational_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `motivazione_principale` (TEXT)
  - `motivazioni_secondarie` (TEXT[])
  - `ostacoli_percepiti` (TEXT[])
  - `preferenze_ambiente` (VARCHAR(20)[]) — 'palestra', 'casa', 'outdoor', 'misto'
  - `preferenze_compagnia` (VARCHAR(20)[]) — 'solo', 'partner', 'gruppo', 'misto'
  - `livello_motivazione` (INTEGER CHECK (livello_motivazione BETWEEN 1 AND 10)) DEFAULT 5
  - `storico_abbandoni` (JSONB) — array con date e motivi
  - `note_motivazionali` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_motivational_athlete_id` (athlete_id)

**Trigger**:

- [ ] Trigger `update_motivational_updated_at`

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT/UPDATE: Solo PT e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ RLS policies testate

**Dipendenze**: Task 1.1.1

---

## 📦 EPICA 1.5: Tabella Dati Nutrizionali

### Task 1.5.1: Creazione Tabella `athlete_nutrition_data`

**File SQL**: `20250127_create_athlete_nutrition_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `obiettivo_nutrizionale` (VARCHAR(50)) — 'dimagrimento', 'massa', 'mantenimento', 'performance', 'salute'
  - `calorie_giornaliere_target` (INTEGER)
  - `macronutrienti_target` (JSONB) — {proteine_g: INT, carboidrati_g: INT, grassi_g: INT}
  - `dieta_seguita` (VARCHAR(50)) — 'onnivora', 'vegetariana', 'vegana', 'keto', 'paleo', 'mediterranea', 'altro'
  - `intolleranze_alimentari` (TEXT[])
  - `allergie_alimentari` (TEXT[])
  - `alimenti_preferiti` (TEXT[])
  - `alimenti_evitati` (TEXT[])
  - `preferenze_orari_pasti` (JSONB) — {colazione: TIME, pranzo: TIME, cena: TIME, spuntini: TIME[]}
  - `note_nutrizionali` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_nutrition_athlete_id` (athlete_id)

**Trigger**:

- [ ] Trigger `update_nutrition_updated_at`

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT/UPDATE: Solo PT e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ RLS policies testate

**Dipendenze**: Task 1.1.1

---

## 📦 EPICA 1.6: Tabella Dati Massaggi

### Task 1.6.1: Creazione Tabella `athlete_massage_data`

**File SQL**: `20250127_create_athlete_massage_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `preferenze_tipo_massaggio` (VARCHAR(50)[]) — 'svedese', 'sportivo', 'decontratturante', 'rilassante', 'linfodrenante', 'altro'
  - `zone_problematiche` (TEXT[]) — zone del corpo che richiedono attenzione
  - `intensita_preferita` (VARCHAR(20)) — 'leggera', 'media', 'intensa'
  - `allergie_prodotti` (TEXT[]) — allergie a oli, creme, prodotti
  - `note_terapeutiche` (TEXT)
  - `storico_massaggi` (JSONB) — array con data, tipo, operatore, note
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_massage_athlete_id` (athlete_id)

**Trigger**:

- [ ] Trigger `update_massage_updated_at`

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT/UPDATE: Solo PT e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ RLS policies testate

**Dipendenze**: Task 1.1.1

---

## 📦 EPICA 1.7: Tabella Dati Amministrativi

### Task 1.7.1: Creazione Tabella `athlete_administrative_data`

**File SQL**: `20250127_create_athlete_administrative_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `tipo_abbonamento` (VARCHAR(50)) — 'mensile', 'trimestrale', 'semestrale', 'annuale', 'pacchetto_lezioni', 'nessuno'
  - `stato_abbonamento` (VARCHAR(20)) — 'attivo', 'scaduto', 'sospeso', 'in_attesa'
  - `data_inizio_abbonamento` (DATE)
  - `data_scadenza_abbonamento` (DATE)
  - `lezioni_incluse` (INTEGER)
  - `lezioni_utilizzate` (INTEGER DEFAULT 0)
  - `lezioni_rimanenti` (INTEGER)
  - `metodo_pagamento_preferito` (VARCHAR(50)) — 'carta', 'bonifico', 'contanti', 'altro'
  - `note_contrattuali` (TEXT)
  - `documenti_contrattuali` (JSONB) — array documenti con url, tipo, data
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_administrative_athlete_id` (athlete_id)
- [ ] `idx_administrative_scadenza` (data_scadenza_abbonamento) WHERE data_scadenza_abbonamento IS NOT NULL

**Trigger**:

- [ ] Trigger `update_administrative_updated_at`
- [ ] Trigger `calculate_lezioni_rimanenti` — calcola automaticamente lezioni_rimanenti

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT/UPDATE: Solo PT e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ Trigger calcolo lezioni funzionante
- ✅ RLS policies testate

**Dipendenze**: Task 1.1.1

---

## 📦 EPICA 1.8: Tabella Smart Tracking

### Task 1.8.1: Creazione Tabella `athlete_smart_tracking_data`

**File SQL**: `20250127_create_athlete_smart_tracking_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `data_rilevazione` (DATE NOT NULL)
  - `dispositivo_tipo` (VARCHAR(50)) — 'smartwatch', 'fitness_tracker', 'app_mobile', 'altro'
  - `dispositivo_marca` (VARCHAR(50))
  - `passi_giornalieri` (INTEGER)
  - `calorie_bruciate` (INTEGER)
  - `distanza_percorsa_km` (DECIMAL(6,2))
  - `battito_cardiaco_medio` (INTEGER)
  - `battito_cardiaco_max` (INTEGER)
  - `battito_cardiaco_min` (INTEGER)
  - `ore_sonno` (DECIMAL(4,2))
  - `qualita_sonno` (VARCHAR(20)) — 'ottima', 'buona', 'media', 'scarsa'
  - `attivita_minuti` (INTEGER) — minuti di attività moderata/intensa
  - `metrica_custom` (JSONB) — metriche aggiuntive dispositivo-specifiche
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_smart_tracking_athlete_date` (athlete_id, data_rilevazione DESC)
- [ ] `idx_smart_tracking_data_rilevazione` (data_rilevazione DESC)

**Trigger**:

- [ ] Trigger `update_smart_tracking_updated_at`

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT/UPDATE: Solo PT, Atleta e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ Supporto per dati storici (più record per atleta)
- ✅ RLS policies testate

**Dipendenze**: Task 1.1.1

---

## 📦 EPICA 1.9: Tabella AI Data

### Task 1.9.1: Creazione Tabella `athlete_ai_data`

**File SQL**: `20250127_create_athlete_ai_data.sql`

**Sub-task**:

- [ ] Creare tabella con colonne:
  - `id` (UUID PRIMARY KEY)
  - `athlete_id` (UUID REFERENCES profiles(user_id) ON DELETE CASCADE)
  - `data_analisi` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
  - `insights_aggregati` (JSONB) — insights generati da AI
  - `raccomandazioni` (JSONB) — array raccomandazioni con tipo, priorità, descrizione
  - `pattern_rilevati` (JSONB) — pattern comportamentali identificati
  - `predizioni_performance` (JSONB) — predizioni future basate su dati storici
  - `score_engagement` (DECIMAL(3,2)) — score 0-100 engagement atleta
  - `score_progresso` (DECIMAL(3,2)) — score 0-100 progresso verso obiettivi
  - `fattori_rischio` (TEXT[]) — fattori di rischio identificati
  - `note_ai` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indici**:

- [ ] `idx_ai_data_athlete_date` (athlete_id, data_analisi DESC)
- [ ] `idx_ai_data_engagement` (score_engagement DESC)

**Trigger**:

- [ ] Trigger `update_ai_data_updated_at`

**RLS Policies**:

- [ ] Policy SELECT: PT può vedere atleti assegnati, Atleta può vedere solo i propri
- [ ] Policy INSERT/UPDATE: Solo sistema (funzione server-side) e Admin
- [ ] Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tabella creata correttamente
- ✅ Supporto per storico analisi (più record per atleta)
- ✅ RLS policies testate

**Dipendenze**: Task 1.1.1

---

## 📦 EPICA 1.10: Storage Buckets e File Storage

### Task 1.10.1: Configurazione Storage Buckets

**File SQL**: `20250127_setup_storage_buckets.sql`

**Sub-task**:

- [ ] Creare bucket `athlete-certificates` (pubblico: false)
  - Policy SELECT: PT e Atleta possono vedere solo i propri file
  - Policy INSERT: Solo PT e Admin
  - Policy UPDATE: Solo PT e Admin
  - Policy DELETE: Solo Admin
- [ ] Creare bucket `athlete-referti` (pubblico: false)
  - Policy SELECT: PT e Atleta possono vedere solo i propri file
  - Policy INSERT: Solo PT e Admin
  - Policy UPDATE: Solo PT e Admin
  - Policy DELETE: Solo Admin
- [ ] Creare bucket `athlete-progress-photos` (pubblico: false)
  - Policy SELECT: PT e Atleta possono vedere solo i propri file
  - Policy INSERT: PT, Atleta e Admin
  - Policy UPDATE: Solo Admin
  - Policy DELETE: Solo Admin
- [ ] Creare bucket `athlete-documents` (pubblico: false)
  - Policy SELECT: PT e Atleta possono vedere solo i propri file
  - Policy INSERT: Solo PT e Admin
  - Policy UPDATE: Solo PT e Admin
  - Policy DELETE: Solo Admin

**Criteri di Accettazione**:

- ✅ Tutti i bucket creati correttamente
- ✅ Policies RLS testate per ogni bucket
- ✅ Test upload/download file

**Dipendenze**: Tutte le epiche precedenti

---

## 📦 EPICA 1.11: Funzioni e Trigger Utili

### Task 1.11.1: Funzioni Helper

**File SQL**: `20250127_create_helper_functions.sql`

**Sub-task**:

- [ ] Funzione `get_athlete_profile_complete(athlete_uuid UUID)` — ritorna tutti i dati profilo in un JSON
- [ ] Funzione `check_certificato_scadenza(athlete_uuid UUID)` — verifica scadenze certificati
- [ ] Funzione `calculate_athlete_progress_score(athlete_uuid UUID)` — calcola score progresso
- [ ] Funzione `get_athlete_insights(athlete_uuid UUID)` — ritorna insights aggregati

**Criteri di Accettazione**:

- ✅ Tutte le funzioni create e testate
- ✅ Documentazione inline SQL

**Dipendenze**: Tutte le tabelle create

---

# FASE 2: TYPESCRIPT TYPES (PRIORITÀ ALTA)

## 🎯 Obiettivo Fase 2

Creare tutti i tipi TypeScript necessari per il modulo Profilo Atleta, con validazione Zod integrata.

---

## 📦 EPICA 2.1: File Types Principale

### Task 2.1.1: Creazione `src/types/athlete-profile.ts`

**File**: `src/types/athlete-profile.ts`

**Sub-task**:

- [ ] Sezione 1: Enum comuni
  - `SexEnum` — 'maschio' | 'femmina' | 'altro' | 'non_specificato'
  - `CertificatoTipoEnum` — 'agonistico' | 'non_agonistico' | 'sportivo'
  - `LivelloEsperienzaEnum` — 'principiante' | 'intermedio' | 'avanzato' | 'professionista'
  - `ObiettivoFitnessEnum` — 'dimagrimento' | 'massa_muscolare' | 'forza' | 'resistenza' | 'tonificazione' | 'riabilitazione' | 'altro'
  - `ObiettivoNutrizionaleEnum` — 'dimagrimento' | 'massa' | 'mantenimento' | 'performance' | 'salute'
  - `DietaEnum` — 'onnivora' | 'vegetariana' | 'vegana' | 'keto' | 'paleo' | 'mediterranea' | 'altro'
  - `TipoAbbonamentoEnum` — 'mensile' | 'trimestrale' | 'semestrale' | 'annuale' | 'pacchetto_lezioni' | 'nessuno'
  - `StatoAbbonamentoEnum` — 'attivo' | 'scaduto' | 'sospeso' | 'in_attesa'
  - `TipoMassaggioEnum` — 'svedese' | 'sportivo' | 'decontratturante' | 'rilassante' | 'linfodrenante' | 'altro'
  - `IntensitaMassaggioEnum` — 'leggera' | 'media' | 'intensa'
  - `QualitaSonnoEnum` — 'ottima' | 'buona' | 'media' | 'scarsa'

- [ ] Sezione 2: Tipi Anagrafica
  - `AthleteAnagrafica` — tipo completo dati anagrafici
  - `AthleteAnagraficaInsert` — tipo per insert
  - `AthleteAnagraficaUpdate` — tipo per update

- [ ] Sezione 3: Tipi Medica
  - `RefertoMedico` — tipo referto singolo
  - `FarmacoAssunto` — tipo farmaco
  - `InterventoChirurgico` — tipo intervento
  - `AthleteMedicalData` — tipo completo dati medici
  - `AthleteMedicalDataInsert`
  - `AthleteMedicalDataUpdate`

- [ ] Sezione 4: Tipi Fitness
  - `InfortunioPregresso` — tipo infortunio
  - `AthleteFitnessData` — tipo completo dati fitness
  - `AthleteFitnessDataInsert`
  - `AthleteFitnessDataUpdate`

- [ ] Sezione 5: Tipi Motivazionale
  - `AbbandonoStorico` — tipo abbandono
  - `AthleteMotivationalData` — tipo completo dati motivazionali
  - `AthleteMotivationalDataInsert`
  - `AthleteMotivationalDataUpdate`

- [ ] Sezione 6: Tipi Nutrizione
  - `MacronutrientiTarget` — tipo macronutrienti
  - `PreferenzeOrariPasti` — tipo orari pasti
  - `AthleteNutritionData` — tipo completo dati nutrizionali
  - `AthleteNutritionDataInsert`
  - `AthleteNutritionDataUpdate`

- [ ] Sezione 7: Tipi Massaggi
  - `MassaggioStorico` — tipo massaggio storico
  - `AthleteMassageData` — tipo completo dati massaggi
  - `AthleteMassageDataInsert`
  - `AthleteMassageDataUpdate`

- [ ] Sezione 8: Tipi Amministrativa
  - `DocumentoContrattuale` — tipo documento
  - `AthleteAdministrativeData` — tipo completo dati amministrativi
  - `AthleteAdministrativeDataInsert`
  - `AthleteAdministrativeDataUpdate`

- [ ] Sezione 9: Tipi Smart Tracking
  - `MetricaCustom` — tipo metriche custom
  - `AthleteSmartTrackingData` — tipo completo dati smart tracking
  - `AthleteSmartTrackingDataInsert`
  - `AthleteSmartTrackingDataUpdate`

- [ ] Sezione 10: Tipi AI Data
  - `InsightAggregato` — tipo insight
  - `Raccomandazione` — tipo raccomandazione
  - `PatternRilevato` — tipo pattern
  - `PredizionePerformance` — tipo predizione
  - `AthleteAIData` — tipo completo dati AI
  - `AthleteAIDataInsert`
  - `AthleteAIDataUpdate`

- [ ] Sezione 11: Tipi Compositi
  - `AthleteProfileComplete` — tipo unificato con tutte le categorie
  - `AthleteProfileTabData` — tipo per tab multi-origine
  - `AthleteProfileStats` — tipo statistiche profilo

**Criteri di Accettazione**:

- ✅ Tutti i tipi definiti correttamente
- ✅ Tipi allineati con schema database
- ✅ Tipi exportati correttamente
- ✅ Documentazione JSDoc per ogni tipo

**Dipendenze**: Fase 1 completata

---

## 📦 EPICA 2.2: Schema Zod per Validazione

### Task 2.2.1: Creazione `src/types/athlete-profile.schema.ts`

**File**: `src/types/athlete-profile.schema.ts`

**Sub-task**:

- [ ] Schema Zod per ogni categoria dati
- [ ] Validazione campi obbligatori
- [ ] Validazione formati (email, telefono, date, ecc.)
- [ ] Validazione range numerici
- [ ] Validazione enum

**Criteri di Accettazione**:

- ✅ Tutti gli schema Zod creati
- ✅ Validazione completa e accurata
- ✅ Messaggi di errore chiari

**Dipendenze**: Task 2.1.1

---

# FASE 3: HOOKS (PRIORITÀ MEDIA)

## 🎯 Obiettivo Fase 3

Creare 9 hook React Query per gestire tutte le categorie dati del profilo atleta.

---

## 📦 EPICA 3.1: Hook Anagrafica

### Task 3.1.1: Creazione `src/hooks/athlete-profile/use-athlete-anagrafica.ts`

**File**: `src/hooks/athlete-profile/use-athlete-anagrafica.ts`

**Sub-task**:

- [ ] Hook `useAthleteAnagrafica(athleteId: string)` — GET dati anagrafici
- [ ] Hook `useUpdateAthleteAnagrafica()` — MUTATION per update
- [ ] Validazione Zod prima di inviare
- [ ] Error handling uniforme
- [ ] Optimistic updates
- [ ] Cache invalidation

**Criteri di Accettazione**:

- ✅ Hook funzionante con React Query
- ✅ Validazione Zod integrata
- ✅ Error handling completo
- ✅ Test manuale CRUD

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

## 📦 EPICA 3.2: Hook Medica

### Task 3.2.1: Creazione `src/hooks/athlete-profile/use-athlete-medical.ts`

**File**: `src/hooks/athlete-profile/use-athlete-medical.ts`

**Sub-task**:

- [ ] Hook `useAthleteMedical(athleteId: string)` — GET dati medici
- [ ] Hook `useUpdateAthleteMedical()` — MUTATION per update
- [ ] Hook `useUploadMedicalFile()` — upload certificati/referti
- [ ] Validazione Zod
- [ ] Error handling
- [ ] Gestione file storage

**Criteri di Accettazione**:

- ✅ Hook funzionante
- ✅ Upload file funzionante
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1, Fase 1.10 (storage buckets)

---

## 📦 EPICA 3.3: Hook Fitness

### Task 3.3.1: Creazione `src/hooks/athlete-profile/use-athlete-fitness.ts`

**File**: `src/hooks/athlete-profile/use-athlete-fitness.ts`

**Sub-task**:

- [ ] Hook `useAthleteFitness(athleteId: string)` — GET dati fitness
- [ ] Hook `useUpdateAthleteFitness()` — MUTATION per update
- [ ] Validazione Zod
- [ ] Error handling
- [ ] Optimistic updates

**Criteri di Accettazione**:

- ✅ Hook funzionante
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

## 📦 EPICA 3.4: Hook Motivazionale

### Task 3.4.1: Creazione `src/hooks/athlete-profile/use-athlete-motivational.ts`

**File**: `src/hooks/athlete-profile/use-athlete-motivational.ts`

**Sub-task**:

- [ ] Hook `useAthleteMotivational(athleteId: string)` — GET dati motivazionali
- [ ] Hook `useUpdateAthleteMotivational()` — MUTATION per update
- [ ] Validazione Zod
- [ ] Error handling

**Criteri di Accettazione**:

- ✅ Hook funzionante
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

## 📦 EPICA 3.5: Hook Nutrizione

### Task 3.5.1: Creazione `src/hooks/athlete-profile/use-athlete-nutrition.ts`

**File**: `src/hooks/athlete-profile/use-athlete-nutrition.ts`

**Sub-task**:

- [ ] Hook `useAthleteNutrition(athleteId: string)` — GET dati nutrizionali
- [ ] Hook `useUpdateAthleteNutrition()` — MUTATION per update
- [ ] Validazione Zod
- [ ] Error handling

**Criteri di Accettazione**:

- ✅ Hook funzionante
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

## 📦 EPICA 3.6: Hook Massaggi

### Task 3.6.1: Creazione `src/hooks/athlete-profile/use-athlete-massage.ts`

**File**: `src/hooks/athlete-profile/use-athlete-massage.ts`

**Sub-task**:

- [ ] Hook `useAthleteMassage(athleteId: string)` — GET dati massaggi
- [ ] Hook `useUpdateAthleteMassage()` — MUTATION per update
- [ ] Validazione Zod
- [ ] Error handling

**Criteri di Accettazione**:

- ✅ Hook funzionante
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

## 📦 EPICA 3.7: Hook Amministrativa

### Task 3.7.1: Creazione `src/hooks/athlete-profile/use-athlete-administrative.ts`

**File**: `src/hooks/athlete-profile/use-athlete-administrative.ts`

**Sub-task**:

- [ ] Hook `useAthleteAdministrative(athleteId: string)` — GET dati amministrativi
- [ ] Hook `useUpdateAthleteAdministrative()` — MUTATION per update
- [ ] Validazione Zod
- [ ] Error handling
- [ ] Integrazione con tabella `payments` esistente

**Criteri di Accettazione**:

- ✅ Hook funzionante
- ✅ Integrazione payments funzionante
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

## 📦 EPICA 3.8: Hook Smart Tracking

### Task 3.8.1: Creazione `src/hooks/athlete-profile/use-athlete-smart-tracking.ts`

**File**: `src/hooks/athlete-profile/use-athlete-smart-tracking.ts`

**Sub-task**:

- [ ] Hook `useAthleteSmartTracking(athleteId: string, filters?)` — GET dati con paginazione
- [ ] Hook `useCreateSmartTrackingEntry()` — MUTATION per nuovo entry
- [ ] Hook `useUpdateSmartTrackingEntry()` — MUTATION per update
- [ ] Paginazione integrata
- [ ] Filtri per data range
- [ ] Validazione Zod
- [ ] Error handling

**Criteri di Accettazione**:

- ✅ Hook funzionante con paginazione
- ✅ Filtri funzionanti
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

## 📦 EPICA 3.9: Hook AI Data

### Task 3.9.1: Creazione `src/hooks/athlete-profile/use-athlete-ai-data.ts`

**File**: `src/hooks/athlete-profile/use-athlete-ai-data.ts`

**Sub-task**:

- [ ] Hook `useAthleteAIData(athleteId: string)` — GET dati AI (ultima analisi)
- [ ] Hook `useAthleteAIHistory(athleteId: string, filters?)` — GET storico analisi con paginazione
- [ ] Hook `useRefreshAIData()` — MUTATION per triggerare nuova analisi
- [ ] Paginazione per storico
- [ ] Error handling

**Criteri di Accettazione**:

- ✅ Hook funzionante
- ✅ Paginazione funzionante
- ✅ Test completo

**Dipendenze**: Task 2.1.1, Task 2.2.1

---

# FASE 4: UI/UX — TABS PT (PRIORITÀ MEDIA)

## 🎯 Obiettivo Fase 4

Creare tutti i componenti tab per la visualizzazione e modifica del profilo atleta nella dashboard PT.

---

## 📦 EPICA 4.1: Componenti Condivisi

### Task 4.1.1: Creazione Componenti Condivisi

**Directory**: `src/components/dashboard/athlete-profile/shared/`

**Sub-task**:

- [ ] `editable-field.tsx` — campo editabile inline
- [ ] `file-upload-field.tsx` — upload file con preview
- [ ] `array-input.tsx` — input per array (allergie, preferenze, ecc.)
- [ ] `date-range-picker.tsx` — selettore range date
- [ ] `progress-photos-viewer.tsx` — visualizzatore foto progressi
- [ ] `validation-indicator.tsx` — indicatore validità/completamento campo

**Criteri di Accettazione**:

- ✅ Tutti i componenti creati e funzionanti
- ✅ Stile coerente con design system
- ✅ Accessibilità (a11y) verificata

**Dipendenze**: Fase 3 (hooks)

---

## 📦 EPICA 4.2: Tab Anagrafica

### Task 4.2.1: Creazione `src/components/dashboard/athlete-profile/athlete-anagrafica-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-anagrafica-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteAnagrafica`
- [ ] Form editabile inline
- [ ] Indicatori validità/completamento
- [ ] Empty state se dati mancanti
- [ ] Error state
- [ ] Loading state

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Edit inline funzionante
- ✅ Salvataggio funzionante
- ✅ UX fluida

**Dipendenze**: Task 3.1.1, Task 4.1.1

---

## 📦 EPICA 4.3: Tab Medica

### Task 4.3.1: Creazione `src/components/dashboard/athlete-profile/athlete-medica-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-medica-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteMedical`
- [ ] Upload certificati
- [ ] Upload referti
- [ ] Gestione array (allergie, patologie, farmaci)
- [ ] Visualizzazione scadenze certificati
- [ ] Alert scadenze prossime

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Upload file funzionante
- ✅ Gestione array funzionante
- ✅ Alert scadenze funzionante

**Dipendenze**: Task 3.2.1, Task 4.1.1

---

## 📦 EPICA 4.4: Tab Fitness

### Task 4.4.1: Creazione `src/components/dashboard/athlete-profile/athlete-fitness-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-fitness-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteFitness`
- [ ] Form editabile
- [ ] Selezione obiettivi (primario + secondari)
- [ ] Gestione infortuni pregressi
- [ ] Visualizzazione zone problematiche

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Form completo
- ✅ Salvataggio funzionante

**Dipendenze**: Task 3.3.1, Task 4.1.1

---

## 📦 EPICA 4.5: Tab Motivazionale

### Task 4.5.1: Creazione `src/components/dashboard/athlete-profile/athlete-motivazionale-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-motivazionale-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteMotivational`
- [ ] Slider livello motivazione (1-10)
- [ ] Gestione array motivazioni/ostacoli
- [ ] Visualizzazione storico abbandoni
- [ ] Form editabile

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Slider funzionante
- ✅ Salvataggio funzionante

**Dipendenze**: Task 3.4.1, Task 4.1.1

---

## 📦 EPICA 4.6: Tab Nutrizione

### Task 4.6.1: Creazione `src/components/dashboard/athlete-profile/athlete-nutrizione-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-nutrizione-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteNutrition`
- [ ] Form editabile
- [ ] Calcolatore macronutrienti
- [ ] Gestione array (intolleranze, allergie, preferenze)
- [ ] Selettore orari pasti

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Calcolatore funzionante
- ✅ Salvataggio funzionante

**Dipendenze**: Task 3.5.1, Task 4.1.1

---

## 📦 EPICA 4.7: Tab Massaggi

### Task 4.7.1: Creazione `src/components/dashboard/athlete-profile/athlete-massaggi-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-massaggi-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteMassage`
- [ ] Form editabile
- [ ] Selezione multipla tipi massaggio
- [ ] Gestione zone problematiche
- [ ] Visualizzazione storico massaggi

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Form completo
- ✅ Salvataggio funzionante

**Dipendenze**: Task 3.6.1, Task 4.1.1

---

## 📦 EPICA 4.8: Tab Amministrativa

### Task 4.8.1: Creazione `src/components/dashboard/athlete-profile/athlete-amministrativa-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-amministrativa-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteAdministrative`
- [ ] Form editabile
- [ ] Visualizzazione abbonamento attivo
- [ ] Contatore lezioni (incluse/utilizzate/rimanenti)
- [ ] Upload documenti contrattuali
- [ ] Integrazione con tabella `payments`

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Visualizzazione abbonamento funzionante
- ✅ Integrazione payments funzionante

**Dipendenze**: Task 3.7.1, Task 4.1.1

---

## 📦 EPICA 4.9: Tab Smart Tracking

### Task 4.9.1: Creazione `src/components/dashboard/athlete-profile/athlete-smart-tracking-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-smart-tracking-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteSmartTracking` con paginazione
- [ ] Tabella dati con paginazione
- [ ] Filtri per data range
- [ ] Grafici metriche (passi, calorie, sonno, battito)
- [ ] Form inserimento nuovo entry
- [ ] Lazy load dati

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Paginazione funzionante
- ✅ Grafici funzionanti
- ✅ Performance ottimale

**Dipendenze**: Task 3.8.1, Task 4.1.1

---

## 📦 EPICA 4.10: Tab AI Data

### Task 4.10.1: Creazione `src/components/dashboard/athlete-profile/athlete-ai-data-tab.tsx`

**File**: `src/components/dashboard/athlete-profile/athlete-ai-data-tab.tsx`

**Sub-task**:

- [ ] Componente tab completo
- [ ] Utilizzo hook `useAthleteAIData` e `useAthleteAIHistory`
- [ ] Visualizzazione insights aggregati
- [ ] Visualizzazione raccomandazioni
- [ ] Visualizzazione pattern rilevati
- [ ] Visualizzazione predizioni
- [ ] Score engagement e progresso
- [ ] Pulsante refresh analisi
- [ ] Paginazione storico

**Criteri di Accettazione**:

- ✅ Tab funzionante
- ✅ Visualizzazione dati AI funzionante
- ✅ Refresh analisi funzionante

**Dipendenze**: Task 3.9.1, Task 4.1.1

---

## 📦 EPICA 4.11: Integrazione Tab nella Pagina Profilo Atleta PT

### Task 4.11.1: Aggiornamento `src/app/dashboard/atleti/[id]/page.tsx`

**File**: `src/app/dashboard/atleti/[id]/page.tsx`

**Sub-task**:

- [ ] Aggiungere 9 nuovi tab al componente Tabs esistente
- [ ] Lazy load tab (caricare solo tab attivo)
- [ ] Indicatori completamento per ogni tab
- [ ] Onboarding iniziale per PT (se profilo vuoto)
- [ ] Gestione stato errore per singola categoria
- [ ] Empty state per singola categoria

**Criteri di Accettazione**:

- ✅ Tutti i tab integrati
- ✅ Lazy load funzionante
- ✅ Indicatori funzionanti
- ✅ Onboarding funzionante

**Dipendenze**: Tutte le epiche 4.2-4.10

---

# FASE 5: UI/UX — PROFILO ATLETA (/home/profilo) (PRIORITÀ MEDIA)

## 🎯 Obiettivo Fase 5

Allineare la pagina profilo atleta con le nuove sezioni, mostrando dati reali (non mock) in modalità read-only dove necessario.

---

## 📦 EPICA 5.1: Aggiornamento Pagina Profilo Atleta

### Task 5.1.1: Aggiornamento `src/app/home/profilo/page.tsx`

**File**: `src/app/home/profilo/page.tsx`

**Sub-task**:

- [ ] Sostituire dati mock con hook reali
- [ ] Aggiungere sezioni per tutte le 9 categorie (read-only per atleta)
- [ ] Visualizzazione statistiche reali
- [ ] Visualizzazione progressi (foto, grafici)
- [ ] Visualizzazione obiettivi
- [ ] Struttura responsive mobile-first
- [ ] Permessi: atleta può vedere tutto, modificare solo alcune sezioni

**Criteri di Accettazione**:

- ✅ Dati reali visualizzati
- ✅ Nessun dato mock
- ✅ Responsive funzionante
- ✅ Permessi corretti

**Dipendenze**: Fase 3 (hooks), Fase 4 (componenti)

---

# FASE 6: SICUREZZA (PRIORITÀ ALTISSIMA)

## 🎯 Obiettivo Fase 6

Garantire sicurezza completa per tutti i dati sensibili del profilo atleta.

---

## 📦 EPICA 6.1: Verifica e Rafforzamento RLS

### Task 6.1.1: Audit RLS Policies

**Sub-task**:

- [ ] Verificare tutte le RLS policies create in Fase 1
- [ ] Testare accesso PT → atleti assegnati
- [ ] Testare accesso Atleta → solo propri dati
- [ ] Testare accesso Admin → tutti i dati
- [ ] Verificare che dati medici siano accessibili solo a PT assegnato e Admin
- [ ] Verificare che dati amministrativi siano accessibili solo a PT assegnato e Admin

**Criteri di Accettazione**:

- ✅ Tutte le policies testate
- ✅ Nessun accesso non autorizzato possibile
- ✅ Documentazione accessi

**Dipendenze**: Fase 1

---

## 📦 EPICA 6.2: Sanitizzazione Input

### Task 6.2.1: Sanitizzazione Input Client-Side

**Sub-task**:

- [ ] Sanitizzazione tutti gli input text
- [ ] Validazione formato email
- [ ] Validazione formato telefono
- [ ] Validazione date
- [ ] Validazione numeri
- [ ] Escape caratteri speciali

**Criteri di Accettazione**:

- ✅ Tutti gli input sanitizzati
- ✅ Nessun XSS possibile
- ✅ Validazione completa

**Dipendenze**: Fase 4

---

## 📦 EPICA 6.3: Audit Log Dati Sensibili

### Task 6.3.1: Implementazione Audit Log

**Sub-task**:

- [ ] Creare trigger per log modifiche dati medici
- [ ] Creare trigger per log modifiche dati amministrativi
- [ ] Creare trigger per log modifiche dati anagrafici sensibili (codice fiscale, contatti emergenza)
- [ ] Tabella `athlete_profile_audit_log` per tracciare modifiche
- [ ] Log includono: user_id, timestamp, tabella, campo, valore_vecchio, valore_nuovo

**Criteri di Accettazione**:

- ✅ Audit log funzionante
- ✅ Tutte le modifiche sensibili tracciate
- ✅ Query per visualizzare audit log

**Dipendenze**: Fase 1

---

# FASE 7: PERFORMANCE (PRIORITÀ MEDIA)

## 🎯 Obiettivo Fase 7

Ottimizzare performance del modulo Profilo Atleta.

---

## 📦 EPICA 7.1: Caching React Query

### Task 7.1.1: Configurazione Caching

**Sub-task**:

- [ ] Configurare staleTime appropriato per ogni hook
- [ ] Configurare cacheTime appropriato
- [ ] Implementare prefetch intelligente (prefetch tab quando hover)
- [ ] Implementare cache invalidation strategica

**Criteri di Accettazione**:

- ✅ Caching ottimizzato
- ✅ Prefetch funzionante
- ✅ Performance migliorata

**Dipendenze**: Fase 3

---

## 📦 EPICA 7.2: Ottimistic Updates

### Task 7.2.1: Implementazione Ottimistic Updates

**Sub-task**:

- [ ] Ottimistic updates per campi anagrafici
- [ ] Ottimistic updates per campi fitness
- [ ] Rollback in caso di errore
- [ ] UI feedback immediato

**Criteri di Accettazione**:

- ✅ Ottimistic updates funzionanti
- ✅ Rollback funzionante
- ✅ UX migliorata

**Dipendenze**: Fase 3

---

## 📦 EPICA 7.3: Paginazione e Lazy Load

### Task 7.3.1: Ottimizzazione Caricamento Dati

**Sub-task**:

- [ ] Paginazione per smart-tracking (già implementata, verificare)
- [ ] Paginazione per AI data history (già implementata, verificare)
- [ ] Lazy load tab (già implementato, verificare)
- [ ] Virtual scrolling per liste lunghe

**Criteri di Accettazione**:

- ✅ Paginazione funzionante
- ✅ Lazy load funzionante
- ✅ Performance ottimale anche con molti dati

**Dipendenze**: Fase 4

---

# FASE 8: MIGRAZIONE & BACKFILL (PRIORITÀ BASSA)

## 🎯 Obiettivo Fase 8

Migrare dati esistenti nelle nuove tabelle e collegare dati correlati.

---

## 📦 EPICA 8.1: Script Migrazione Dati

### Task 8.1.1: Script Migrazione `progress_logs` → `athlete_fitness_data`

**File**: `scripts/migrate-progress-logs-to-fitness.ts` (solo pianificato, non generato ora)

**Sub-task**:

- [ ] Analizzare struttura `progress_logs` esistente
- [ ] Mappare dati a `athlete_fitness_data`
- [ ] Script migrazione (da creare in futuro)

**Criteri di Accettazione**:

- ✅ Script pianificato
- ✅ Mappatura definita

**Dipendenze**: Fase 1 completata

---

## 📦 EPICA 8.2: Collegamento Dati Esistenti

### Task 8.2.1: Collegamento `documents` → Medica/Amministrativa

**Sub-task**:

- [ ] Analizzare tabella `documents` esistente
- [ ] Collegare documenti medici a `athlete_medical_data`
- [ ] Collegare documenti contrattuali a `athlete_administrative_data`
- [ ] Script migrazione (da creare in futuro)

**Criteri di Accettazione**:

- ✅ Collegamento pianificato
- ✅ Mappatura definita

**Dipendenze**: Fase 1 completata

---

## 📦 EPICA 8.3: Collegamento `payments` → Amministrativa

### Task 8.3.1: Collegamento Pagamenti

**Sub-task**:

- [ ] Analizzare tabella `payments` esistente
- [ ] Collegare pagamenti a `athlete_administrative_data`
- [ ] Script migrazione (da creare in futuro)

**Criteri di Accettazione**:

- ✅ Collegamento pianificato
- ✅ Mappatura definita

**Dipendenze**: Fase 1 completata

---

# FASE 9: QA + TESTING (PRIORITÀ ALTA)

## 🎯 Obiettivo Fase 9

Testare completamente il modulo Profilo Atleta.

---

## 📦 EPICA 9.1: Testing CRUD Hook → DB

### Task 9.1.1: Test Hooks

**Sub-task**:

- [ ] Test `useAthleteAnagrafica` — GET, UPDATE
- [ ] Test `useAthleteMedical` — GET, UPDATE, UPLOAD
- [ ] Test `useAthleteFitness` — GET, UPDATE
- [ ] Test `useAthleteMotivational` — GET, UPDATE
- [ ] Test `useAthleteNutrition` — GET, UPDATE
- [ ] Test `useAthleteMassage` — GET, UPDATE
- [ ] Test `useAthleteAdministrative` — GET, UPDATE
- [ ] Test `useAthleteSmartTracking` — GET, CREATE, UPDATE, PAGINATION
- [ ] Test `useAthleteAIData` — GET, REFRESH, HISTORY

**Criteri di Accettazione**:

- ✅ Tutti i test passati
- ✅ Error handling testato
- ✅ Edge cases testati

**Dipendenze**: Fase 3

---

## 📦 EPICA 9.2: Testing UI Tab → Hook → DB

### Task 9.2.1: Test Integrazione UI

**Sub-task**:

- [ ] Test ogni tab → hook → database
- [ ] Test edit inline → salvataggio → refresh
- [ ] Test upload file → storage → database
- [ ] Test validazione form → errori visualizzati
- [ ] Test empty state → creazione dati
- [ ] Test error state → retry funzionante

**Criteri di Accettazione**:

- ✅ Tutti i test passati
- ✅ Integrazione completa verificata

**Dipendenze**: Fase 4

---

## 📦 EPICA 9.3: Testing RLS

### Task 9.3.1: Test Sicurezza

**Sub-task**:

- [ ] Test PT può vedere solo atleti assegnati
- [ ] Test Atleta può vedere solo propri dati
- [ ] Test Atleta NON può modificare dati medici
- [ ] Test Atleta NON può modificare dati amministrativi
- [ ] Test Admin può vedere e modificare tutto
- [ ] Test accesso file storage (certificati, referti, foto)

**Criteri di Accettazione**:

- ✅ Tutti i test sicurezza passati
- ✅ Nessun accesso non autorizzato possibile

**Dipendenze**: Fase 6

---

## 📦 EPICA 9.4: Testing Caricamento Certificati/Foto

### Task 9.4.1: Test File Storage

**Sub-task**:

- [ ] Test upload certificato medico
- [ ] Test upload referto
- [ ] Test upload foto progressi
- [ ] Test download file
- [ ] Test eliminazione file
- [ ] Test permessi file (PT vs Atleta)

**Criteri di Accettazione**:

- ✅ Tutti i test file storage passati
- ✅ Permessi corretti

**Dipendenze**: Fase 1.10, Fase 4

---

## 📦 EPICA 9.5: Testing Integrazione Pagina Dashboard

### Task 9.5.1: Test Integrazione Completa

**Sub-task**:

- [ ] Test pagina `/dashboard/atleti/[id]` con tutti i tab
- [ ] Test pagina `/home/profilo` con tutte le sezioni
- [ ] Test navigazione tra tab
- [ ] Test lazy load tab
- [ ] Test performance con molti dati
- [ ] Test responsive mobile

**Criteri di Accettazione**:

- ✅ Integrazione completa verificata
- ✅ Performance ottimale
- ✅ Responsive funzionante

**Dipendenze**: Fase 4, Fase 5

---

# FASE 10: DOCUMENTAZIONE (PRIORITÀ BASSA)

## 🎯 Obiettivo Fase 10

Documentare il modulo Profilo Atleta.

---

## 📦 EPICA 10.1: Documentazione Tecnica

### Task 10.1.1: Documentazione

**Sub-task**:

- [ ] Documentazione struttura database
- [ ] Documentazione tipi TypeScript
- [ ] Documentazione hook
- [ ] Documentazione componenti
- [ ] Documentazione API (se presente)

**Criteri di Accettazione**:

- ✅ Documentazione completa
- ✅ Esempi di utilizzo

**Dipendenze**: Tutte le fasi precedenti

---

# 📊 RIEPILOGO E ROADMAP

## ⚡ Sprint Attuale (Alta Priorità)

1. **Fase 1 — Step 1**: Estensione profiles con colonne anagrafiche ⚠️ **PRIMA RICHIESTA**
2. **Fase 1 — Step 2-9**: Creazione 8 nuove tabelle (una alla volta)
3. **Fase 1 — Step 10**: Storage buckets
4. **Fase 1 — Step 11**: Funzioni helper
5. **Fase 2**: TypeScript Types
6. **Fase 3**: Hooks
7. **Fase 4**: UI Tabs PT
8. **Fase 6**: Sicurezza (in parallelo con sviluppo)

## 🔧 Sprint Successivo

- **Fase 5**: UI Profilo Atleta
- **Fase 7**: Performance
- **Fase 9**: QA + Testing

## 📦 Backlog Lungo

- **Fase 8**: Migrazione & Backfill
- **Fase 10**: Documentazione

---

# 🚀 INIZIO LAVORO

## ⚠️ PRIMA RICHIESTA — FASE 1 — STEP 1

**File da generare**: `supabase/migrations/20250127_extend_profiles_anagrafica.sql`

**Contenuto**: Solo le colonne anagrafiche aggiuntive per la tabella `profiles`.

**Dopo la generazione**: Tu chiedi conferma esplicita: "Confermi? Posso passare allo step successivo?"

**Solo dopo il tuo OK**: Procedo con lo step successivo.

---

**Piano generato il**: 2025-01-27  
**Versione**: 1.0  
**Stato**: Pronto per esecuzione step-by-step
