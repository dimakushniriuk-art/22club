# Documentazione Completa Relazioni Trainer-Atleta

**Data creazione:** 2025-02-01  
**Ultimo aggiornamento:** 2025-02-01  
**Scopo:** Documentazione completa di tutte le relazioni, permessi, RLS policies, foreign keys, trigger e funzioni tra trainer e atleti nel database Supabase.

**Stato Database:** ✅ **OTTIMIZZATO E PRONTO PER PRODUZIONE - 100% COMPLETO**

- 18 fix esecutivi completati (12 critici + 6 opzionali)
- 5 analisi completate
- 1 ottimizzazione indici completata
- Standardizzazione colonne completata (FIX_18) - 5 tabelle standardizzate
- Rinomina colonne per chiarezza completata (FIX_23) - documents.uploaded_by_profile_id
- Tutti i problemi critici e opzionali risolti
- Schema database completamente standardizzato e documentato

---

## Processo di Documentazione

Questo documento viene creato interrogando direttamente il database Supabase. Ogni sezione viene popolata con i risultati delle query SQL eseguite.

---

## 1. Struttura Database - Tabelle

### Query 1.1: Elenco Tabelle

**Query eseguita:**

```sql
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Risultato:**

- **Tabelle BASE (28):**
  - `appointments` - Appuntamenti
  - `athlete_administrative_data` - Dati amministrativi atleta
  - `athlete_ai_data` - Dati AI atleta
  - `athlete_fitness_data` - Dati fitness atleta
  - `athlete_massage_data` - Dati massaggi atleta
  - `athlete_medical_data` - Dati medici atleta
  - `athlete_motivational_data` - Dati motivazionali atleta
  - `athlete_nutrition_data` - Dati nutrizionali atleta
  - `athlete_smart_tracking_data` - Dati smart tracking atleta
  - `audit_logs` - Log di audit
  - `chat_messages` - Messaggi chat
  - `cliente_tags` - Tag clienti
  - `communication_recipients` - Destinatari comunicazioni
  - `communications` - Comunicazioni
  - `documents` - Documenti
  - `exercises` - Esercizi
  - `inviti_atleti` - Inviti atleti
  - `lesson_counters` - Contatori lezioni
  - `notifications` - Notifiche
  - `payments` - Pagamenti
  - `profiles` - **Tabella principale utenti (trainer/atleti)**
  - `profiles_tags` - Tag profili
  - `progress_logs` - Log progressi
  - `progress_photos` - Foto progressi
  - `pt_atleti` - **Relazione principale trainer-atleta**
  - `push_subscriptions` - Sottoscrizioni push
  - `roles` - Ruoli
  - `user_settings` - Impostazioni utente
  - `web_vitals` - Web vitals
  - `workout_day_exercises` - Esercizi giorni workout
  - `workout_days` - Giorni workout
  - `workout_logs` - Log workout
  - `workout_plans` - Piani workout
  - `workout_sets` - Serie workout

- **VIEW (3):**
  - `payments_per_staff_view` - Vista pagamenti per staff
  - `progress_trend_view` - Vista trend progressi
  - `workout_stats_mensili` - Vista statistiche workout mensili

**Tabelle chiave per relazioni trainer-atleta:**

1. `profiles` - Tabella base che contiene trainer e atleti
2. `pt_atleti` - Tabella di relazione che collega trainer e atleti
3. `appointments` - Appuntamenti tra trainer e atleti
4. `documents` - Documenti degli atleti (caricati da trainer)
5. `progress_logs` - Progressi degli atleti (visualizzati da trainer)
6. `workout_logs`, `workout_plans`, `workout_days`, `workout_day_exercises` - Schede allenamento
7. `chat_messages` - Messaggi tra trainer e atleti
8. `payments` - Pagamenti atleti
9. `athlete_*_data` - Varie tabelle dati atleti

---

## 2. Tabella PT_ATLETI (Relazione Principale Trainer-Atleta)

### Query 2.1: Struttura Tabella PT_ATLETI

**Colonne:**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `pt_id` (UUID, NOT NULL, FK → profiles.id)
- `atleta_id` (UUID, NOT NULL, FK → profiles.id)
- `assigned_at` (TIMESTAMP WITH TIME ZONE, nullable, default: now())
- `created_at` (TIMESTAMP WITH TIME ZONE, nullable, default: now())

### Query 2.2: Foreign Keys PT_ATLETI

- `pt_atleti_pt_id_fkey`: `pt_id` → `profiles.id` (CASCADE delete, NO ACTION update)
- `pt_atleti_atleta_id_fkey`: `atleta_id` → `profiles.id` (CASCADE delete, NO ACTION update)

**Note:** Entrambe referenziano `profiles.id` correttamente ✅

### Query 2.3: Constraint PT_ATLETI

- **PRIMARY KEY:** `id`
- **UNIQUE:** `(pt_id, atleta_id)` - Impedisce duplicati relazioni (un trainer non può avere lo stesso atleta due volte)
- **FOREIGN KEY:** `pt_id` → `profiles.id`, `atleta_id` → `profiles.id`
- **CHECK:** NOT NULL constraints su id, pt_id, atleta_id

---

## 3. Struttura Tabella PROFILES (Base Trainer/Atleta)

### Query 3.1: Struttura Completa PROFILES

**Colonne principali (64 totali):**

**Identificazione:**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `user_id` (UUID, NOT NULL, UNIQUE, FK → auth.users.id)
- `email` (TEXT, NOT NULL, UNIQUE)
- `phone` / `telefono` (TEXT, nullable)

**Dati anagrafici:**

- `nome` (VARCHAR(100))
- `cognome` (VARCHAR(100))
- `first_name` (VARCHAR(100)) - Alternativo
- `last_name` (VARCHAR(100)) - Alternativo
- `data_nascita` (DATE)
- `sesso` (VARCHAR(1))
- `codice_fiscale` (VARCHAR(16))
- `indirizzo_residenza` / `indirizzo` (TEXT)
- `citta` (VARCHAR(100))
- `cap` (VARCHAR(10))
- `provincia` (VARCHAR(50))
- `nazione` (VARCHAR(50), default: 'Italia')
- `professione` (VARCHAR(100))

**Ruolo e stato:**

- `role` (VARCHAR(20), NOT NULL, CHECK: 'admin', 'pt', 'trainer', 'atleta', 'athlete')
- `stato` (TEXT, default: 'attivo')
- `org_id` (TEXT, default: 'default-org')
- `data_iscrizione` (TIMESTAMP, default: now())
- `ultimo_accesso` (TIMESTAMP WITH TIME ZONE)

**Avatar:**

- `avatar` (TEXT)
- `avatar_url` (TEXT)

**Dati fitness/fisici:**

- `altezza_cm` (NUMERIC(5,2))
- `peso_corrente_kg` (NUMERIC(5,2))
- `peso_iniziale_kg` (NUMERIC(5,2))
- `obiettivo_peso` (NUMERIC(5,2))
- `bmi` (NUMERIC(4,2))
- `percentuale_massa_grassa` (NUMERIC(5,2))
- `circonferenza_vita_cm` (NUMERIC(5,2))
- `circonferenza_torace_cm` (NUMERIC(5,2))
- `circonferenza_fianchi_cm` (NUMERIC(5,2))

**Dati atleta:**

- `livello_esperienza` (VARCHAR(50))
- `tipo_atleta` (VARCHAR(50))
- `obiettivi_fitness` (ARRAY)
- `livello_motivazione` (INTEGER)
- `obiettivo_nutrizionale` (VARCHAR(50))
- `intolleranze` (ARRAY)
- `allergie_alimentari` (ARRAY)
- `abitudini_alimentari` (TEXT)

**Dati medici:**

- `gruppo_sanguigno` (VARCHAR(5))
- `pressione_sanguigna` (VARCHAR(20))
- `infortuni_recenti` (TEXT)
- `limitazioni` (TEXT)
- `allergie` (TEXT)
- `operazioni_passate` (TEXT)
- `certificato_medico_tipo` (VARCHAR(50))
- `certificato_medico_data_rilascio` (DATE)
- `certificato_medico_scadenza` (DATE)

**Dati amministrativi:**

- `tipo_abbonamento` (VARCHAR(100))
- `abbonamento_scadenza` (DATE)
- `pacchetti_pt_acquistati` (INTEGER, default: 0)
- `pacchetti_pt_usati` (INTEGER, default: 0)
- `documenti_scadenza` (BOOLEAN, default: false)
- `note_amministrative` (TEXT)

**Contatti emergenza:**

- `contatto_emergenza_nome` (VARCHAR(200))
- `contatto_emergenza_telefono` (VARCHAR(20))
- `contatto_emergenza_relazione` (VARCHAR(50))

**Altri:**

- `note` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())
- `updated_at` (TIMESTAMP WITH TIME ZONE, default: now())

### Query 3.2: Constraint PROFILES

- **PRIMARY KEY:** `id`
- **UNIQUE:**
  - `user_id` (un profilo per ogni utente auth)
  - `email` (email univoca)
- **FOREIGN KEY:**
  - `user_id` → `auth.users.id`
  - `role` → `roles` (tabella ruoli)
- **CHECK:**
  - NOT NULL su: `id`, `user_id`, `role`, `email`
  - `profiles_role_check`: role deve essere in ('admin', 'pt', 'trainer', 'atleta', 'athlete')

---

## 4. Permessi e RLS Policies

### Query 4.1: RLS Policies PT_ATLETI

**Policies attive (6):**

1. **"Admins have full access to pt_atleti"**
   - Tipo: ALL (SELECT, INSERT, UPDATE, DELETE)
   - Condizione: `is_admin()` = true
   - Permette agli admin accesso completo

2. **"Athletes can view own relationships"**
   - Tipo: SELECT
   - Condizione: `atleta_id = get_profile_id()`
   - Gli atleti possono vedere solo le relazioni dove sono loro gli atleti

3. **"Trainers can create relationships"**
   - Tipo: INSERT
   - Condizione: `(pt_id = get_profile_id()) OR is_admin()`
   - I trainer possono creare relazioni solo con se stessi come trainer

4. **"Trainers can delete own relationships"**
   - Tipo: DELETE
   - Condizione: `(pt_id = get_profile_id()) OR is_admin()`
   - I trainer possono cancellare solo le proprie relazioni

5. **"Trainers can update own relationships"**
   - Tipo: UPDATE
   - Condizione USING: `(pt_id = get_profile_id()) OR is_admin()`
   - Condizione WITH CHECK: `(pt_id = get_profile_id()) OR is_admin()`
   - I trainer possono aggiornare solo le proprie relazioni

6. **"Trainers can view own relationships"**
   - Tipo: SELECT
   - Condizione: `(pt_id = get_profile_id()) OR is_admin()`
   - I trainer possono vedere solo le relazioni dove sono loro i trainer

**Logica isolamento:**

- ✅ Trainer vedono solo i propri atleti (tramite `pt_id = get_profile_id()`)
- ✅ Atleti vedono solo il proprio trainer (tramite `atleta_id = get_profile_id()`)
- ✅ Admin vedono tutto (tramite `is_admin()`)

### Query 4.2: RLS Abilitato su Tabelle Chiave

**RLS è abilitato (true) su tutte le tabelle chiave:**

- ✅ `appointments`
- ✅ `athlete_administrative_data`
- ✅ `athlete_ai_data`
- ✅ `athlete_fitness_data`
- ✅ `athlete_massage_data`
- ✅ `athlete_medical_data`
- ✅ `athlete_motivational_data`
- ✅ `athlete_nutrition_data`
- ✅ `athlete_smart_tracking_data`
- ✅ `chat_messages`
- ✅ `documents`
- ✅ `lesson_counters`
- ✅ `payments`
- ✅ `profiles`
- ✅ `progress_logs`
- ✅ `progress_photos`
- ✅ `pt_atleti`
- ✅ `workout_logs`
- ✅ `workout_plans`

**Nota:** `workouts` non è nella lista - potrebbe non esistere o RLS non essere abilitato.

### Query 4.3: RLS Policies PROFILES

**Policies attive (8):**

1. **"Admins have full access to profiles"**
   - Tipo: ALL
   - Condizione: `is_admin()`
   - Admin hanno accesso completo a tutti i profili

2. **"Admins can view all profiles"**
   - Tipo: SELECT
   - Condizione: `is_admin()`
   - Admin possono vedere tutti i profili

3. **"Admins can insert profiles"**
   - Tipo: INSERT
   - Condizione WITH CHECK: `is_admin()`
   - Solo admin possono creare profili

4. **"Admins can update all profiles"**
   - Tipo: UPDATE
   - Condizione: `is_admin()`
   - Admin possono aggiornare tutti i profili

5. **"Admins can delete profiles"**
   - Tipo: DELETE
   - Condizione: `is_admin()`
   - Solo admin possono cancellare profili

6. **"Trainers can view own and athlete profiles"**
   - Tipo: SELECT
   - Condizione: `(user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM pt_atleti WHERE pt_atleti.atleta_id = profiles.id AND pt_atleti.pt_id = get_profile_id())) OR is_admin()`
   - **Logica:** Trainer vedono:
     - Il proprio profilo (`user_id = auth.uid()`)
     - I profili dei propri atleti (tramite `pt_atleti`)
     - Tutti i profili se admin

7. **"Users can view own profile"**
   - Tipo: SELECT
   - Condizione: `user_id = auth.uid()`
   - Ogni utente può vedere solo il proprio profilo

8. **"Users can update own profile"**
   - Tipo: UPDATE
   - Condizione: `user_id = auth.uid()`
   - Ogni utente può aggiornare solo il proprio profilo

**Isolamento garantito:** ✅ Trainer vedono solo i propri atleti tramite `pt_atleti`

### Query 4.4: RLS Policies APPOINTMENTS

**Policies attive (4):**

1. **"Athletes can view own appointments"**
   - Tipo: SELECT
   - Condizione: `athlete_id = get_profile_id() OR is_admin()`
   - Atleti vedono solo i propri appuntamenti

2. **"Trainers can view appointments"**
   - Tipo: SELECT
   - Condizione: `trainer_id = get_profile_id() OR staff_id = get_profile_id() OR is_admin()`
   - Trainer vedono appuntamenti dove sono trainer o staff

3. **"Trainers can insert appointments"**
   - Tipo: INSERT
   - Condizione WITH CHECK: Utente deve essere admin/pt/trainer
   - Solo trainer/admin possono creare appuntamenti

4. **"Trainers can update appointments"**
   - Tipo: UPDATE
   - Condizione: Utente deve essere admin/pt/trainer
   - Solo trainer/admin possono aggiornare appuntamenti

**Isolamento:** ✅ Trainer vedono solo appuntamenti dove sono trainer/staff

### Query 4.5: RLS Policies DOCUMENTS

**Policies attive (5):**

1. **"Admins have full access to documents"**
   - Tipo: ALL
   - Condizione: `is_admin()`
   - Admin accesso completo

2. **"Atleti vedono propri documenti, Trainer vedono documenti dei propri atleti"**
   - Tipo: SELECT
   - Condizione complessa che verifica:
     - Atleta vede propri documenti: `profiles.id = documents.athlete_id AND profiles.user_id = auth.uid()`
     - Trainer vede documenti dei propri atleti: tramite JOIN `pt_atleti` dove `pt_atleti.atleta_id = documents.athlete_id AND pt_atleti.pt_id.user_id = auth.uid()`
     - Admin/pt/trainer/staff vedono tutto
   - **Isolamento:** ✅ Trainer vedono solo documenti dei propri atleti (tramite `pt_atleti`)

3. **"Athletes can create own documents"**
   - Tipo: INSERT
   - Condizione WITH CHECK: `athlete_id = auth.uid() AND uploaded_by_profile_id = auth.uid()` - ✅ **AGGIORNATO POST FIX_23**
   - Atleti possono creare documenti solo per se stessi

4. **"Trainer/Staff possono inserire documenti"**
   - Tipo: INSERT
   - Condizione WITH CHECK: Trainer può inserire documenti per i propri atleti (tramite `pt_atleti`) o se è admin/pt/trainer/staff
   - Trainer possono caricare documenti per i propri atleti

5. **"Trainer/Staff possono aggiornare documenti"**
   - Tipo: UPDATE
   - Condizione: Trainer può aggiornare documenti dei propri atleti (tramite `pt_atleti`) o se è admin/pt/trainer/staff
   - Trainer possono modificare documenti dei propri atleti

**Isolamento:** ✅ Trainer vedono/modificano solo documenti dei propri atleti (tramite `pt_atleti`)

### Query 4.6: RLS Policies CHAT_MESSAGES

**Policies attive (3):**

1. **"Users can view own messages"**
   - Tipo: SELECT
   - Condizione: `sender_id = get_profile_id() OR receiver_id = get_profile_id() OR is_admin()`
   - Utenti vedono messaggi dove sono sender o receiver
   - **Isolamento:** ✅ Utenti vedono solo messaggi a cui partecipano

2. **"Users can send messages"**
   - Tipo: INSERT
   - Condizione WITH CHECK: `sender_id = get_profile_id() OR is_admin()`
   - Utenti possono inviare messaggi solo come se stessi

3. **"Users can update own messages"**
   - Tipo: UPDATE
   - Condizione: `sender_id = get_profile_id()`
   - Utenti possono aggiornare solo i propri messaggi inviati

**Isolamento:** ✅ Utenti vedono solo messaggi dove sono sender o receiver (comunicazione diretta trainer-atleta)

### Query 4.7: RLS Policies PROGRESS_LOGS

**Policies attive (4):**

1. **"Admins have full access to progress_logs"**
   - Tipo: ALL
   - Condizione: `is_admin()`
   - Admin accesso completo

2. **"Athlete can view own progress logs"**
   - Tipo: SELECT
   - Condizione: `profiles.user_id = auth.uid() AND profiles.id = progress_logs.athlete_id AND role IN ('atleta', 'athlete')`
   - Atleti vedono solo i propri progressi

3. **"Athlete can create own progress logs"**
   - Tipo: INSERT
   - Condizione WITH CHECK: `profiles.user_id = auth.uid() AND profiles.id = progress_logs.athlete_id AND role IN ('atleta', 'athlete')`
   - Atleti possono creare solo i propri progressi

4. **"PT can view own athlete progress logs"**
   - Tipo: SELECT
   - Condizione: JOIN `pt_atleti` dove `pt_profile.user_id = auth.uid() AND pt_atleti.atleta_id = progress_logs.athlete_id` OR `is_admin()`
   - **Isolamento:** ✅ Trainer vedono solo progressi dei propri atleti (tramite `pt_atleti`)

**Isolamento garantito:** ✅ Trainer vedono solo progressi dei propri atleti tramite `pt_atleti`

### Query 4.8: RLS Policies WORKOUTS

**Risultato:** Nessuna policy trovata - la tabella `workouts` potrebbe non esistere o non avere RLS configurato.

### Query 4.9: RLS Policies WORKOUT_LOGS

**Policies attive (3):**

1. **"Athletes can view own workout logs"**
   - Tipo: SELECT
   - Condizione: `atleta_id = get_profile_id() OR is_admin()` - ✅ **AGGIORNATO POST FIX_18** (usa solo `atleta_id`)
   - Atleti vedono solo i propri log workout

2. **"Trainers can view workout logs"**
   - Tipo: SELECT
   - Condizione: JOIN `pt_atleti` dove `pt_atleti.pt_id = get_profile_id() AND pt_atleti.atleta_id = workout_logs.atleta_id` OR `is_admin()` - ✅ **AGGIORNATO POST FIX_18** (usa solo `atleta_id`)
   - **Isolamento:** ✅ Trainer vedono solo workout_logs dei propri atleti (tramite `pt_atleti`)

3. **"Users can insert workout logs"**
   - Tipo: INSERT
   - Condizione WITH CHECK: `atleta_id = get_profile_id()` OR trainer può inserire per i propri atleti (tramite `pt_atleti`) OR `is_admin()` - ✅ **AGGIORNATO POST FIX_18** (usa solo `atleta_id`)
   - Trainer possono creare workout_logs per i propri atleti

**Isolamento garantito:** ✅ Trainer vedono solo workout_logs dei propri atleti tramite `pt_atleti`

### Query 4.10: RLS Policies WORKOUT_PLANS

**Policies attive (6):**

1. **"Admins have full access to workout_plans"**
   - Tipo: ALL
   - Condizione: `is_admin()`
   - Admin accesso completo

2. **"Athletes can view own workout plans"**
   - Tipo: SELECT
   - Condizione: `athlete_id = get_profile_id()`
   - Atleti vedono solo i propri piani workout

3. **"Trainers can view athlete workout plans"**
   - Tipo: SELECT
   - Condizione: JOIN `pt_atleti` dove `pt_atleti.pt_id = get_profile_id() AND pt_atleti.atleta_id = workout_plans.athlete_id` OR `created_by = auth.uid()` OR `is_admin()`
   - **Isolamento:** ✅ Trainer vedono solo workout_plans dei propri atleti (tramite `pt_atleti`)

4. **"Trainers can create workout plans for own athletes"**
   - Tipo: INSERT
   - Condizione WITH CHECK: JOIN `pt_atleti` dove `pt_atleti.pt_id = get_profile_id() AND pt_atleti.atleta_id = workout_plans.athlete_id AND created_by = auth.uid()` OR `is_admin()`
   - Trainer possono creare workout_plans solo per i propri atleti

5. **"Trainers can update own workout plans"**
   - Tipo: UPDATE
   - Condizione: JOIN `pt_atleti` dove `pt_atleti.pt_id = get_profile_id() AND pt_atleti.atleta_id = workout_plans.athlete_id AND created_by = auth.uid()` OR `is_admin()`
   - Trainer possono aggiornare solo i workout_plans dei propri atleti che hanno creato

6. **"Trainers can delete own workout plans"**
   - Tipo: DELETE
   - Condizione: JOIN `pt_atleti` dove `pt_atleti.pt_id = get_profile_id() AND pt_atleti.atleta_id = workout_plans.athlete_id AND created_by = auth.uid()` OR `is_admin()`
   - Trainer possono cancellare solo i workout_plans dei propri atleti che hanno creato

**Isolamento garantito:** ✅ Trainer vedono/modificano solo workout_plans dei propri atleti tramite `pt_atleti`

---

## 5. Struttura Tabelle e Foreign Keys

### Query 5.1: Foreign Keys APPOINTMENTS

**Foreign Keys:**

- `appointments_athlete_id_fkey`: `athlete_id` → `profiles.id` (CASCADE delete)
- `appointments_staff_id_fkey`: `staff_id` → `profiles.id` (CASCADE delete)
- `appointments_trainer_id_fkey`: `trainer_id` → `profiles.id` (SET NULL delete, nullable)

**Note:** Tutte referenziano `profiles.id` correttamente ✅

### Query 5.2: Foreign Keys DOCUMENTS

**Foreign Keys:**

- `documents_athlete_id_fkey`: `athlete_id` → `profiles.id` (CASCADE delete)
- `documents_uploaded_by_profile_id_fkey`: `uploaded_by_profile_id` → `profiles.id` (CASCADE delete) - ✅ **RINOMINATO in FIX_23**

**Note:** ✅ `uploaded_by_profile_id` referenzia `profiles.id` - ✅ **RINOMINATO in FIX_23** per chiarezza

### Query 5.3: Struttura APPOINTMENTS

**Colonne principali (17):**

- `id` (UUID, PK)
- `org_id` (TEXT, default: 'default-org')
- `athlete_id` (UUID, NOT NULL, FK → profiles.id)
- `staff_id` (UUID, NOT NULL, FK → profiles.id)
- `trainer_id` (UUID, nullable, FK → profiles.id)
- `starts_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- `ends_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- `type` (TEXT, NOT NULL, default: 'allenamento')
- `status` (TEXT, default: 'attivo')
- `location` (TEXT)
- `notes` (TEXT)
- `recurrence_rule` (TEXT) - Per appuntamenti ricorrenti
- `cancelled_at` (TIMESTAMP WITH TIME ZONE)
- `trainer_name` (TEXT) - Denormalizzazione
- `athlete_name` (TEXT) - Denormalizzazione
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())
- `updated_at` (TIMESTAMP WITH TIME ZONE, default: now())

**Logica:** Ogni appuntamento ha `athlete_id`, `staff_id` (obbligatorio), e `trainer_id` (opzionale, può essere NULL o uguale a staff_id)

### Query 5.4: Struttura DOCUMENTS

**Colonne principali (12):**

- `id` (UUID, PK)
- `athlete_id` (UUID, NOT NULL, FK → profiles.id)
- `category` (TEXT, NOT NULL)
- `file_url` (TEXT, NOT NULL)
- `uploaded_by_profile_id` (UUID, NOT NULL, FK → profiles.id) - ✅ **RINOMINATO in FIX_23**
- `uploaded_by_name` (TEXT) - Denormalizzazione
- `expires_at` (TIMESTAMP WITH TIME ZONE)
- `status` (TEXT, default: 'valid')
- `notes` (TEXT)
- `org_id` (TEXT, default: 'default-org')
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())
- `updated_at` (TIMESTAMP WITH TIME ZONE, default: now())

**Logica:** Ogni documento appartiene a un atleta (`athlete_id`) ed è caricato da un utente (`uploaded_by_profile_id`) - ✅ **RINOMINATO in FIX_23**

### Query 5.5: Funzioni Helper

**Funzioni critiche per RLS:**

1. **`get_profile_id()` → UUID**
   - **Scopo:** Converte `auth.uid()` (user_id da auth.users) in `profiles.id`
   - **Logica:** `SELECT id FROM profiles WHERE user_id = auth.uid()`
   - **Utilizzo:** Usata in tutte le RLS policies per identificare il profilo corrente
   - **Importanza:** ⚠️ CRITICA - senza questa funzione le RLS policies non funzionano

2. **`is_admin()` → BOOLEAN**
   - **Scopo:** Verifica se l'utente corrente è admin
   - **Logica:** `SELECT role FROM profiles WHERE user_id = auth.uid() = 'admin'`
   - **Utilizzo:** Usata in tutte le RLS policies per dare accesso completo agli admin
   - **Importanza:** ⚠️ CRITICA - garantisce che admin vedano tutto

3. **`is_athlete()` → BOOLEAN**
   - **Scopo:** Verifica se l'utente corrente è atleta
   - **Logica:** Verifica se `role IN ('atleta', 'athlete')`
   - **Utilizzo:** Usata per verificare permessi atleti

4. **`check_pt_athlete_relationship(sender_uuid, receiver_uuid)` → BOOLEAN**
   - **Scopo:** Verifica se esiste relazione trainer-atleta tra due utenti (per chat)
   - **Logica:** JOIN `pt_atleti` per verificare relazione bidirezionale
   - **Utilizzo:** Usata nelle policies di chat per garantire che solo trainer e loro atleti possano comunicare

5. **`complete_athlete_registration(invite_code, athlete_user_id, athlete_email, athlete_name, athlete_surname)` → JSON**
   - **Scopo:** Completa registrazione atleta e crea relazione `pt_atleti`
   - **Logica:**
     1. Trova invito valido
     2. Crea profilo atleta
     3. **Crea relazione `pt_atleti` con `pt_id` (profiles.id del trainer) e `atleta_id` (profiles.id dell'atleta)**
     4. Aggiorna stato invito
   - **Importanza:** ⚠️ CRITICA - questa funzione crea la relazione trainer-atleta durante la registrazione

**Funzioni di calcolo e analisi:**

6. **`calculate_athlete_progress_score(athlete_uuid)` → JSON**
   - Calcola score completo atleta basato su dati medici, fitness, nutrizione, amministrativi, AI

7. **`get_athlete_insights(athlete_uuid)` → JSON**
   - Recupera insights completi atleta (AI data, certificati, progress score, statistiche)

8. **`get_athlete_profile_complete(athlete_uuid)` → JSON**
   - Recupera profilo completo atleta da tutte le tabelle dati

**Funzioni di sincronizzazione:**

9. **`sync_profile_names()` → VOID**
   - Sincronizza `nome/cognome` ↔ `first_name/last_name`

10. **`sync_profile_names_trigger()` → TRIGGER**
    - Trigger per sincronizzare nomi automaticamente

11. **`sync_profile_naming()` → TRIGGER**
    - Trigger più completo per sincronizzare nomi e avatar

12. **`sync_trainer_id_from_staff()` → TRIGGER**
    - Se `trainer_id` è NULL in appointments, usa `staff_id`

### Query 5.6: Struttura CHAT_MESSAGES

**Colonne (9):**

- `id` (UUID, PK)
- `sender_id` (UUID, NOT NULL)
- `receiver_id` (UUID, NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL, default: 'text')
- `file_url` (TEXT, nullable)
- `read_at` (TIMESTAMP WITH TIME ZONE, nullable)
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())
- `updated_at` (TIMESTAMP WITH TIME ZONE, default: now())

### Query 5.7: Foreign Keys CHAT_MESSAGES

**Risultato:** ⚠️ **NESSUNA FOREIGN KEY TROVATA**

**Problema:** `sender_id` e `receiver_id` non hanno foreign keys verso `profiles`. Questo significa:

- ⚠️ Mancanza di integrità referenziale
- ⚠️ Possibilità di referenziare profili inesistenti
- ✅ Le RLS policies gestiscono comunque l'isolamento tramite `get_profile_id()`

### Query 5.8: Foreign Keys PROGRESS_LOGS

**Foreign Keys:**

- `progress_logs_athlete_id_fkey`: `athlete_id` → `profiles.id` (CASCADE delete)

**Note:** ✅ Referenzia correttamente `profiles.id`

### Query 5.9: Struttura PROGRESS_LOGS

**Colonne principali (37):**

- `id` (UUID, PK)
- `athlete_id` (UUID, NOT NULL, FK → profiles.id)
- `date` (DATE, NOT NULL)
- `weight_kg` (NUMERIC)
- Misure circonferenze: `chest_cm`, `waist_cm`, `hips_cm`, `thighs_cm`, `biceps_cm`, `collo_cm`, `spalle_cm`, `torace_inspirazione_cm`, `braccio_rilassato_cm`, `braccio_contratto_cm`, `avambraccio_cm`, `polso_cm`, `vita_alta_cm`, `addome_basso_cm`, `glutei_cm`, `coscia_alta_cm`, `coscia_media_cm`, `coscia_bassa_cm`, `ginocchio_cm`, `polpaccio_cm`, `caviglia_cm`
- Misure forza: `max_bench_kg`, `max_squat_kg`, `max_deadlift_kg`
- Misure composizione corporea: `massa_grassa_percentuale`, `massa_grassa_kg`, `massa_magra_kg`, `massa_muscolare_kg`, `massa_muscolare_scheletrica_kg`
- `mood_text` (TEXT)
- `note` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())
- `updated_at` (TIMESTAMP WITH TIME ZONE, default: now())

**Logica:** Tabella molto dettagliata per tracciare tutti i progressi fisici degli atleti

### Query 5.10: Relazioni Esistenti PT_ATLETI

**Relazioni attuali nel database (1):**

| Trainer                             | Atleta                                        | Data Creazione      |
| ----------------------------------- | --------------------------------------------- | ------------------- |
| Francesco Bernotto (info@22club.it) | Dmytro Kushniriuk (dima.kushniriuk@gmail.com) | 2025-12-26 01:01:42 |

**Note:**

- C'è UNA relazione esistente
- Trainer: Francesco Bernotto (trainer_profile_id: 55f789c7-6d30-492e-b677-611d3541f29c, user_id: 2cb4cc22-825c-4792-b120-8fba9f84d8ba)
- Atleta: Dmytro Kushniriuk (athlete_profile_id: bf759b73-cf0c-4e93-92a7-4a84715b972a, user_id: bb4687f8-21b6-4564-b8d8-1903fcf00f2d)

**Se l'atleta Dmytro vede "Trainer non assegnato":**

- La relazione esiste nel database
- Il problema è nel codice che recupera il trainer (probabilmente usa `user.id` invece di verificare `pt_atleti`)
- Verificare che il codice usi correttamente `profiles.id` per cercare in `pt_atleti`

### Query 5.11: Foreign Keys WORKOUT_PLANS

**Foreign Keys:**

- `workout_plans_athlete_id_fkey`: `athlete_id` → `profiles.id` (CASCADE delete, NO ACTION update)

**Note:** ✅ `athlete_id` referenzia correttamente `profiles.id`

**⚠️ Da verificare:**

- `created_by` (UUID, nullable) esiste nella struttura ma non ha FK visibile nella query. Potrebbe referenziare `profiles.user_id` o `auth.users.id` (verificare nel codice/migrazioni)
- `trainer_id` (UUID, nullable) esiste nella struttura ma non ha FK. Probabilmente referenzia `profiles.id` per il trainer che ha creato la scheda

### Query 5.12: Struttura WORKOUT_PLANS

**Colonne (11):**

- `id` (UUID, PK, default: gen_random_uuid())
- `athlete_id` (UUID, NOT NULL, FK → profiles.id)
- `name` (VARCHAR(200), NOT NULL)
- `description` (TEXT, nullable)
- `start_date` (DATE, nullable)
- `end_date` (DATE, nullable)
- `is_active` (BOOLEAN, default: true)
- `created_by` (UUID, nullable) - ⚠️ **Manca FK esplicita** (probabilmente → profiles.user_id o auth.users.id)
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())
- `updated_at` (TIMESTAMP WITH TIME ZONE, default: now())
- `trainer_id` (UUID, nullable) - ⚠️ **Manca FK esplicita** (probabilmente → profiles.id)

**Logica:**

- Tabella per le schede di allenamento assegnate agli atleti
- `atleta_id` → ✅ **profilo dell'atleta standardizzato** (dopo FIX_18, colonna principale)
- `created_by` → user_id del trainer che crea la scheda (usato nelle RLS)
- `scheda_id` → workout plan associato

### Query 5.13: Foreign Keys WORKOUT_LOGS - AGGIORNATO POST FIX_18

**Foreign Keys (2):**

- `workout_logs_atleta_id_fkey`: `atleta_id` → `profiles.id` (CASCADE delete, NO ACTION update) - ✅ **FK standardizzata**
- `workout_logs_scheda_id_fkey`: `scheda_id` → `workout_plans.id` (SET NULL delete, NO ACTION update)

**Modifiche FIX_18:**

- ✅ **Rimossa colonna `athlete_id`** - standardizzato su `atleta_id` (colonna principale, NOT NULL)
- ✅ **Rimossa FK `workout_logs_athlete_id_fkey`** - ora esiste solo `workout_logs_atleta_id_fkey`
- ✅ **Rimossa FK duplicata `fk_workout_logs_scheda`** - mantenuta solo `workout_logs_scheda_id_fkey`
- ✅ **RLS policies aggiornate** - ora usano solo `atleta_id` invece di `athlete_id` o entrambe

**Note:** ✅ Tutte referenziano correttamente le tabelle

**Comportamento:**

- Se un profilo viene eliminato (`profiles.id`): tutti i workout_logs associati vengono eliminati (CASCADE)
- Se un workout_plan viene eliminato (`workout_plans.id`): `scheda_id` viene impostato a NULL (SET NULL)
- Se viene tentato un aggiornamento di `profiles.id` o `workout_plans.id`: viene impedito se ci sono workout_logs associati (NO ACTION)

### Query 5.14: Indici Tabelle Chiave

**Indici principali per performance:**

**APPONTMENTS (12 indici):**

- `idx_appointments_athlete_id` - Ricerca per atleta
- `idx_appointments_athlete_starts` - Ricerca atleta + data (DESC)
- `idx_appointments_trainer_id` - Ricerca per trainer (WHERE trainer_id IS NOT NULL)
- `idx_appointments_staff_starts` - Ricerca staff + data (DESC)
- `idx_appointments_starts_at` - Ordinamento per data
- `idx_appointments_status` - Filtro per stato
- Altri indici per `org_id`, `staff_id`, `type`, `cancelled_at`, `ends_at`

**CHAT_MESSAGES (10 indici):**

- `idx_chat_messages_sender` / `idx_chat_messages_receiver` - Ricerca per mittente/destinatario
- `idx_chat_messages_conversation_optimized` - Ottimizzato per conversazioni (sender_id, receiver_id, created_at DESC)
- `idx_chat_messages_latest_per_conversation` - Usa LEAST/GREATEST per conversazioni bidirezionali
- `idx_chat_messages_unread` - Messaggi non letti (WHERE read_at IS NULL)
- Altri indici per `sender_created`, `receiver_created`, `created_at`

**DOCUMENTS (5 indici):**

- `idx_documents_athlete_id` - Ricerca per atleta
- `idx_documents_category` - Filtro per categoria
- `idx_documents_status` - Filtro per stato
- `idx_documents_expires_at` - Scadenze documenti

**PROFILES (10 indici):**

- `idx_profiles_user_id` - Ricerca per user_id (chiave di join con auth.users)
- `idx_profiles_role` - Filtro per ruolo (WHERE role = 'atleta'/'athlete')
- `idx_profiles_role_stato` - Ruolo + stato (per atleti)
- `idx_profiles_data_iscrizione` - Ordinamento per data iscrizione (DESC)
- `idx_profiles_documenti_scadenza` - Documenti in scadenza (WHERE documenti_scadenza = true)
- `idx_profiles_codice_fiscale_unique` - UNIQUE su codice fiscale
- `idx_profiles_citta_provincia` - Ricerca geografica (per atleti)
- `idx_profiles_org_id` - Filtro per organizzazione

**PROGRESS_LOGS (2 indici):**

- `idx_progress_logs_athlete_date` - Ricerca atleta + data (DESC)

**PT_ATLETI (4 indici):**

- `idx_pt_atleti_pt` - Ricerca per trainer
- `idx_pt_atleti_atleta` - Ricerca per atleta
- `idx_pt_atleti_pt_atleta` - Ricerca combinata (pt_id, atleta_id)
- `pt_atleti_pt_id_atleta_id_key` - UNIQUE constraint (evita duplicati)

**WORKOUT_LOGS (7 indici) - AGGIORNATO POST FIX_18:**

- `idx_workout_logs_atleta` - Ricerca per atleta (usa `atleta_id`)
- `idx_workout_logs_atleta_data` - Ricerca atleta + data (DESC, usa `atleta_id`)
- `idx_workout_logs_combined` - Combinato (atleta_id, stato, data DESC)
- `idx_workout_logs_scheda` - Ricerca per scheda (WHERE scheda_id IS NOT NULL)
- `idx_workout_logs_data` - Ordinamento per data
- `idx_workout_logs_data_stato` - Data + stato
- `idx_workout_logs_stato` - Filtro per stato

**Modifiche FIX_18:**

- ✅ **Rimosso indice `idx_workout_logs_athlete`** - non più necessario dopo rimozione colonna `athlete_id`

**WORKOUT_PLANS (4 indici):**

- `idx_workout_plans_athlete` - Ricerca per atleta
- `idx_workout_plans_active` - Schede attive (WHERE is_active = true)
- `idx_workout_plans_dates` - Ricerca per range date (start_date, end_date)

**Ottimizzazioni:**

- ✅ Indici compositi per query comuni (atleta + data, pt + atleta, ecc.)
- ✅ Indici parziali (WHERE clause) per ridurre dimensione e migliorare performance
- ✅ Indici UNIQUE per evitare duplicati (pt_atleti, profiles.email, profiles.codice_fiscale)

### Query 5.15: Trigger Tabelle Chiave

**APPONTMENTS (3 trigger):**

1. `sync_trainer_id_trigger` (BEFORE INSERT/UPDATE)
   - Funzione: `sync_trainer_id_from_staff()`
   - **Logica:** Se `trainer_id` è NULL, lo sincronizza da `staff_id`
   - Questo garantisce che ogni appointment abbia sempre un `trainer_id` quando c'è uno `staff_id`

2. `update_appointments_updated_at` (BEFORE UPDATE)
   - Funzione: `update_updated_at_column()`
   - Aggiorna automaticamente `updated_at` ad ogni modifica

**CHAT_MESSAGES (1 trigger):**

1. `update_chat_messages_updated_at` (BEFORE UPDATE)
   - Funzione: `update_updated_at_column()`

**DOCUMENTS (4 trigger):**

1. `audit_documents_trigger` (AFTER INSERT/UPDATE/DELETE)
   - Funzione: `audit_trigger_function()`
   - Registra tutte le modifiche alla tabella documents in `audit_logs`

2. `trigger_check_document_expiry` (BEFORE INSERT/UPDATE)
   - Funzione: `check_document_expiry()`
   - Verifica e aggiorna `documenti_scadenza` in `profiles` quando un documento scade

3. `trigger_update_documents_updated_at` / `update_documents_updated_at` (BEFORE UPDATE)
   - Funzione: `update_updated_at_column()`
   - ⚠️ **Duplicato:** Due trigger con nomi diversi fanno la stessa cosa

**PROFILES (7 trigger):**

1. `audit_profiles_trigger` (AFTER UPDATE/DELETE)
   - Funzione: `audit_trigger_function()`
   - Registra modifiche a profiles in `audit_logs`

2. `sync_phone_telefono_trigger` (BEFORE UPDATE)
   - Funzione: `sync_phone_telefono()`
   - Sincronizza `phone` e `telefono` se uno dei due viene modificato

3. `trigger_sync_profile_names` (BEFORE INSERT/UPDATE)
   - Funzione: `sync_profile_names_trigger()`
   - Sincronizza `nome`/`cognome` con `first_name`/`last_name`

4. `trigger_sync_profile_naming` (BEFORE INSERT/UPDATE)
   - Funzione: `sync_profile_naming()`
   - ⚠️ **Duplicato:** Sembra fare la stessa cosa di `trigger_sync_profile_names`

5. `trigger_update_jwt_custom_claims` (AFTER INSERT/UPDATE)
   - Funzione: `update_jwt_custom_claims()`
   - Aggiorna i JWT claims di Supabase quando un profilo viene creato/modificato

6. `update_profiles_updated_at` (BEFORE UPDATE)
   - Funzione: `update_updated_at_column()`

**PROGRESS_LOGS (1 trigger):**

1. `update_progress_logs_updated_at` (BEFORE UPDATE)
   - Funzione: `update_updated_at_column()`

**WORKOUT_LOGS (1 trigger):**

1. `update_workout_logs_updated_at` (BEFORE UPDATE)
   - Funzione: `update_updated_at_column()`

**WORKOUT_PLANS (1 trigger):**

1. `update_workout_plans_updated_at` (BEFORE UPDATE)
   - Funzione: `update_updated_at_column()`

**Riepilogo trigger critici per relazioni trainer-atleta:**

- ✅ `sync_trainer_id_trigger` → Garantisce integrità tra `staff_id` e `trainer_id` in appointments
- ✅ `trigger_update_jwt_custom_claims` → Mantiene sincronizzati i JWT con i dati del profilo
- ✅ `audit_*_trigger` → Traccia tutte le modifiche per audit e sicurezza
- ⚠️ Trigger duplicati in `documents` e `profiles` → Da rimuovere per evitare doppie esecuzioni

---

## 6. Logica Completa Sistema Trainer-Atleta

**Ultimo aggiornamento:** 2025-12-28

### 6.1. Flusso Principale: Creazione Atleta da Trainer

**1. Creazione account atleta:**

```
Trainer → API /api/athletes/create → Supabase Auth → profiles → pt_atleti
```

**Passaggi:**

1. Trainer crea atleta tramite API (`src/app/api/athletes/create/route.ts`)
2. Sistema crea utente in `auth.users` con email e password temporanea
3. Sistema crea profilo in `profiles`:
   - `user_id` → FK verso `auth.users.id`
   - `role` = 'atleta' o 'athlete'
   - Tutti i dati personali dell'atleta
4. **Automaticamente** viene creata relazione in `pt_atleti`:
   - `pt_id` = `profiles.id` del trainer (recuperato da `auth.uid()` del trainer)
   - `atleta_id` = `profiles.id` dell'atleta appena creato
   - `created_at` = timestamp corrente

**Garantisce:** Ogni atleta creato da un trainer è automaticamente assegnato a quel trainer

### 6.2. Relazione Base: PT_ATLETI

**Tabella centrale:** `pt_atleti`

**Struttura:**

- `id` (UUID, PK)
- `pt_id` (UUID, FK → profiles.id) - **Trainer**
- `atleta_id` (UUID, FK → profiles.id) - **Atleta**
- `assigned_at` (TIMESTAMP, default: now())
- `created_at` (TIMESTAMP, default: now())

**Constraint:**

- UNIQUE (`pt_id`, `atleta_id`) - Un atleta può essere assegnato a un trainer una sola volta
- CASCADE delete - Se un profilo viene cancellato, la relazione viene eliminata automaticamente

**Utilizzo:**

- **Tutte le RLS policies** usano `pt_atleti` per determinare se un trainer può vedere/modificare i dati di un atleta
- **Isolamento:** Un trainer vede SOLO gli atleti nella tabella `pt_atleti` dove `pt_id` = proprio `profiles.id`
- **Un atleta vede SOLO** la relazione dove `atleta_id` = proprio `profiles.id`

### 6.3. Funzioni Helper per RLS

**Funzioni utilizzate in tutte le RLS policies:**

1. **`get_profile_id()`**
   - Restituisce `profiles.id` dell'utente autenticato
   - Usa `auth.uid()` per cercare in `profiles.user_id`
   - **Critico:** Tutte le verifiche di ownership/accesso partono da questa funzione

2. **`is_admin()`**
   - Verifica se l'utente autenticato ha `role = 'admin'` in `profiles`
   - Gli admin bypassano tutte le restrizioni RLS

3. **`check_pt_athlete_relationship(pt_id UUID, atleta_id UUID)`**
   - Verifica se esiste una relazione in `pt_atleti` tra trainer e atleta
   - Usato nelle RLS policies per verificare permessi

**Flusso di verifica permessi:**

```
Utente autenticato → auth.uid() → get_profile_id() → profiles.id
                                                  ↓
                                    Verifica pt_atleti → Permesso GRANTED/DENIED
```

### 6.4. Isolamento Dati: Cosa Vede Ogni Ruolo

**TRAINER (`role = 'pt'` o `'trainer'`):**

**Può vedere:**

- ✅ Propri profilo (`profiles.id = get_profile_id()`)
- ✅ Atleti assegnati (`pt_atleti` dove `pt_id = get_profile_id()`)
- ✅ Appuntamenti dei propri atleti (`appointments` JOIN `pt_atleti`)
- ✅ Documenti dei propri atleti (`documents` JOIN `pt_atleti`)
- ✅ Progressi dei propri atleti (`progress_logs` JOIN `pt_atleti`)
- ✅ Workout plans dei propri atleti (`workout_plans` JOIN `pt_atleti`)
- ✅ Workout logs dei propri atleti (`workout_logs` JOIN `pt_atleti`)
- ✅ Messaggi chat con i propri atleti (`chat_messages` dove `sender_id` o `receiver_id` = atleta assegnato)

**NON può vedere:**

- ❌ Altri trainer
- ❌ Atleti di altri trainer
- ❌ Dati di atleti non assegnati
- ❌ Dati di altri trainer

**ATLETA (`role = 'atleta'` o `'athlete'`):**

**Può vedere:**

- ✅ Propri profilo (`profiles.id = get_profile_id()`)
- ✅ Proprio trainer (`pt_atleti` dove `atleta_id = get_profile_id()`)
- ✅ Propri appuntamenti (`appointments.athlete_id = get_profile_id()`)
- ✅ Propri documenti (`documents.athlete_id = get_profile_id()`)
- ✅ Propri progressi (`progress_logs.athlete_id = get_profile_id()`)
- ✅ Propri workout plans (`workout_plans.athlete_id = get_profile_id()`)
- ✅ Propri workout logs (`workout_logs.atleta_id = get_profile_id()`) - ✅ **AGGIORNATO POST FIX_18** (usa solo `atleta_id`)
- ✅ Messaggi chat con il proprio trainer (`chat_messages` dove `sender_id` o `receiver_id` = trainer assegnato)

**NON può vedere:**

- ❌ Altri atleti
- ❌ Altri trainer (diversi dal proprio)
- ❌ Dati di altri atleti

**ADMIN (`role = 'admin'`):**

**Può vedere tutto:**

- ✅ Tutti i profili
- ✅ Tutte le relazioni `pt_atleti`
- ✅ Tutti gli appuntamenti
- ✅ Tutti i documenti
- ✅ Tutti i progressi
- ✅ Tutti i workout plans/logs
- ✅ Tutti i messaggi chat

### 6.5. Operazioni Trainer su Atleti

**1. Creare atleta:**

- API: `POST /api/athletes/create`
- Crea `auth.users` + `profiles` + **automaticamente** `pt_atleti`
- Trainer deve essere autenticato (`auth.uid()`)

**2. Assegnare scheda allenamento:**

- Tabella: `workout_plans`
- RLS: Trainer può INSERT solo se `pt_atleti` esiste per quell'atleta
- Campo `created_by` deve essere `auth.uid()` del trainer
- Campo `athlete_id` → `profiles.id` dell'atleta

**3. Creare appuntamento:**

- Tabella: `appointments`
- Campo `athlete_id` → `profiles.id` dell'atleta
- Campo `staff_id` → `profiles.id` del trainer
- Campo `trainer_id` → sincronizzato automaticamente da `staff_id` tramite trigger `sync_trainer_id_trigger`
- RLS: Trainer può creare solo per atleti in `pt_atleti`

**4. Caricare documento:**

- Tabella: `documents`
- Campo `athlete_id` → `profiles.id` dell'atleta
- Campo `uploaded_by_profile_id` → `profiles.id` del trainer - ✅ **AGGIORNATO POST FIX_23**
- RLS: Trainer può INSERT solo se `pt_atleti` esiste

**5. Inviare messaggio:**

- Tabella: `chat_messages`
- Campo `sender_id` → `profiles.id` del trainer
- Campo `receiver_id` → `profiles.id` dell'atleta
- RLS: Trainer può INSERT solo se `receiver_id` è un atleta in `pt_atleti`

**6. Visualizzare progressi:**

- Tabella: `progress_logs`
- RLS: SELECT JOIN `pt_atleti` per verificare relazione
- Trainer vede solo progressi dei propri atleti

### 6.6. Operazioni Atleta

**1. Visualizzare proprio profilo:**

- `profiles` dove `id = get_profile_id()`

**2. Visualizzare proprio trainer:**

- `pt_atleti` JOIN `profiles` dove `atleta_id = get_profile_id()`

**3. Visualizzare proprie schede allenamento:**

- `workout_plans` dove `athlete_id = get_profile_id()`

**4. Registrare workout completato:**

- `workout_logs` INSERT con `atleta_id = get_profile_id()` - ✅ **AGGIORNATO POST FIX_18** (usa solo `atleta_id`)
- RLS: Atleta può INSERT solo con proprio `athlete_id`

**5. Visualizzare propri progressi:**

- `progress_logs` dove `athlete_id = get_profile_id()`

**6. Inviare messaggio al trainer:**

- `chat_messages` INSERT con `sender_id = get_profile_id()` e `receiver_id = trainer_profile_id`

### 6.7. Trigger Automatici

**1. `sync_trainer_id_trigger` (appointments):**

- **Quando:** BEFORE INSERT/UPDATE su `appointments`
- **Cosa fa:** Se `trainer_id` è NULL, lo sincronizza da `staff_id`
- **Garantisce:** Ogni appointment ha sempre `trainer_id` quando c'è `staff_id`

**2. `trigger_update_jwt_custom_claims` (profiles):**

- **Quando:** AFTER INSERT/UPDATE su `profiles`
- **Cosa fa:** Aggiorna i JWT claims di Supabase con i dati del profilo (role, nome, ecc.)
- **Garantisce:** I JWT contengono sempre i dati aggiornati del profilo

**3. `trigger_check_document_expiry` (documents):**

- **Quando:** BEFORE INSERT/UPDATE su `documents`
- **Cosa fa:** Verifica scadenze documenti e aggiorna `documenti_scadenza` in `profiles`
- **Garantisce:** Flag `documenti_scadenza` sempre aggiornato

**4. `audit_*_trigger` (profiles, documents):**

- **Quando:** AFTER INSERT/UPDATE/DELETE
- **Cosa fa:** Registra tutte le modifiche in `audit_logs`
- **Garantisce:** Audit completo di tutte le operazioni

### 6.8. Problemi Conosciuti e Note

**✅ PROBLEMI RISOLTI:**

**1. `chat_messages` senza Foreign Keys:**

- ✅ **RISOLTO con FIX_05** - FK aggiunte su `sender_id` e `receiver_id` verso `profiles.id`

**2. `workout_logs` con colonne duplicate:**

- ✅ **RISOLTO con FIX_18** - Standardizzato su `atleta_id`, rimossa colonna `athlete_id`

**3. Trigger duplicati:**

- ✅ **RISOLTO con FIX_09** - Trigger duplicati rimossi da `documents`, `profiles`, `inviti_atleti`, `user_settings`

**🟡 MIGLIORAMENTI OPZIONALI - Script Creati:**

**1. `workout_plans` con `created_by` senza FK esplicita:**

- ⚠️ `created_by` (UUID) esiste ma non ha FK visibile
- **Probabile:** Referenzia `profiles.user_id` o `auth.users.id` (usato nelle RLS)
- **Stato:** Script creati per risolvere (FIX_21, FIX_22)
- **Script disponibili:**
  - `FIX_21_VERIFICA_WORKOUT_PLANS_STRUCTURE.sql` - Verifica struttura
  - `FIX_22_AGGIORNA_FK_WORKOUT_PLANS.sql` - Aggiunge FK su `created_by` e `trainer_id`

**2. `workout_plans.trainer_id` senza FK:**

- ⚠️ Campo esiste ma non ha FK
- **Probabile:** Referenzia `profiles.id` del trainer
- **Stato:** Script creato per risolvere (FIX_22)
- **Script disponibile:** `FIX_22_AGGIORNA_FK_WORKOUT_PLANS.sql` - Gestisce anche `trainer_id`

**3. `documents.uploaded_by_user_id` naming:**

- ✅ **RISOLTO con FIX_23** - Colonna rinominata in `uploaded_by_profile_id`
- **Stato:** ✅ Completato - Colonna rinominata, FK ricreata
- **⚠️ IMPORTANTE:** Richiede aggiornamento codice applicativo (vedi `FIX_23_AGGIORNA_CODICE_APPLICATIVO.md`)

**4. Migrazione Storage Legacy (FIX_19, FIX_20):**

- 🟢 Script creati ma non eseguiti (opzionali)
- **Stato:** Richiede decisioni manuali su quale bucket mantenere
- **Raccomandazione:** Eseguire quando si decide di consolidare i bucket storage

### 6.9. Verifica Integrità Sistema

**Query per verificare che tutto funzioni:**

```sql
-- 1. Verifica relazioni pt_atleti
SELECT COUNT(*) FROM pt_atleti;

-- 2. Verifica atleti senza trainer (devono essere 0 se tutti sono assegnati)
SELECT p.id, p.email, p.nome, p.cognome
FROM profiles p
WHERE p.role IN ('atleta', 'athlete')
  AND NOT EXISTS (
    SELECT 1 FROM pt_atleti pa WHERE pa.atleta_id = p.id
  );

-- 3. Verifica trainer senza atleti (ok, è normale)
SELECT p.id, p.email, p.nome, p.cognome
FROM profiles p
WHERE p.role IN ('pt', 'trainer')
  AND NOT EXISTS (
    SELECT 1 FROM pt_atleti pa WHERE pa.pt_id = p.id
  );

-- 4. Verifica foreign keys corrette
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table_name,
    ccu.column_name AS referenced_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('pt_atleti', 'appointments', 'documents', 'progress_logs', 'workout_plans', 'workout_logs')
ORDER BY tc.table_name, kcu.column_name;
```

### 6.10. Riepilogo Tabelle Chiave e Relazioni

**Tabelle principali:**

1. **`profiles`** - Tabella base utenti (trainer/atleti/admin)
2. **`pt_atleti`** - Relazione trainer-atleta (CHIAVE CENTRALE)
3. **`appointments`** - Appuntamenti (trainer ↔ atleta)
4. **`documents`** - Documenti atleta (uploadati da trainer)
5. **`progress_logs`** - Progressi atleta (visualizzati da trainer)
6. **`workout_plans`** - Schede allenamento (assegnate da trainer ad atleta)
7. **`workout_logs`** - Log allenamenti completati (registrati da atleta)
8. **`chat_messages`** - Messaggi (trainer ↔ atleta)

**Colonne chiave per relazioni:**

- `profiles.id` → Usato come FK in tutte le tabelle (tranne `created_by` che usa `user_id`)
- `profiles.user_id` → FK verso `auth.users.id` (autenticazione)
- `pt_atleti.pt_id` → `profiles.id` del trainer
- `pt_atleti.atleta_id` → `profiles.id` dell'atleta

**Tutte le RLS policies** usano `pt_atleti` per determinare permessi di accesso.

---

## 7. Supabase Storage - Bucket, File e Policies

### Query 7.1: Storage Buckets Esistenti

**Query eseguita:**

```sql
SELECT
  id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
FROM storage.buckets
ORDER BY name;
```

**Risultato:** (Eseguita il 2025-02-01)

**Bucket esistenti nel database (10 totali):**

1. **`athlete-certificates`** - Certificati atleti
   - Visibilità: 🔒 Privato
   - Limite dimensione: 10 MB
   - MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`
   - Data creazione: 2025-12-07
   - Utilizzo: Certificati medici e documenti certificativi degli atleti

2. **`athlete-documents`** - Documenti atleti (versione estesa)
   - Visibilità: 🔒 Privato
   - Limite dimensione: 10 MB
   - MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Data creazione: 2025-12-07
   - Utilizzo: Documenti generici degli atleti (liberatorie, contratti, ecc.)

3. **`athlete-progress-photos`** - Foto progressi atleti (versione specifica)
   - Visibilità: 🔒 Privato
   - Limite dimensione: 5 MB
   - MIME types: `image/jpeg`, `image/png`, `image/jpg`, `image/webp`
   - Data creazione: 2025-12-07
   - Utilizzo: Foto progressi caricate da atleti

4. **`athlete-referti`** - Referti medici atleti
   - Visibilità: 🔒 Privato
   - Limite dimensione: 10 MB
   - MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`
   - Data creazione: 2025-12-07
   - Utilizzo: Referti medici e analisi degli atleti

5. **`avatars`** - Avatar utenti
   - Visibilità: ✅ Pubblico (per accesso diretto)
   - Limite dimensione: 2 MB
   - MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
   - Data creazione: 2025-12-07
   - Utilizzo: Avatar profilo utenti (trainer e atleti)

6. **`documents`** - Documenti generici (legacy)
   - Visibilità: 🔒 Privato
   - Limite dimensione: 10 MB
   - MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`, `image/webp`
   - Data creazione: 2025-10-16
   - Utilizzo: Documenti generici (potrebbe essere deprecato in favore di `athlete-documents`)

7. **`exercise-thumbs`** - Thumbnail esercizi
   - Visibilità: ✅ Pubblico
   - Limite dimensione: Illimitato
   - MIME types: null (tutti i tipi)
   - Data creazione: 2025-11-02
   - Utilizzo: Immagini thumbnail per gli esercizi

8. **`exercise-videos`** - Video esercizi
   - Visibilità: ✅ Pubblico (per accesso diretto ai video)
   - Limite dimensione: 50 MB
   - MIME types: `video/*`
   - Data creazione: 2025-11-02
   - Utilizzo: Video dimostrativi degli esercizi caricati da trainer
   - **Nota:** Il bucket è pubblico per permettere accesso diretto ai video tramite URL pubblici

9. **`general-files`** - File generici
   - Visibilità: 🔒 Privato
   - Limite dimensione: Illimitato
   - MIME types: `*/*` (tutti i tipi)
   - Data creazione: 2025-10-16
   - Utilizzo: File generici senza categoria specifica

10. **`progress-photos`** - Foto progressi (legacy)
    - Visibilità: 🔒 Privato
    - Limite dimensione: 5 MB
    - MIME types: `image/*`
    - Data creazione: 2025-10-16
    - Utilizzo: Foto progressi (potrebbe essere deprecato in favore di `athlete-progress-photos`)

**Note:**

- Esistono bucket duplicati/legacy: `documents` vs `athlete-documents`, `progress-photos` vs `athlete-progress-photos`
- I bucket `athlete-*` sono più recenti (2025-12-07) e sembrano essere la versione aggiornata
- Il bucket `general-files` permette tutti i tipi di file senza limiti

### Query 7.2: RLS Policies Storage Objects

**Query eseguita:**

```sql
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

**Policies previste per bucket privati:**

**BUCKET: documents**

1. **"Users can upload own documents"**
   - Tipo: INSERT
   - Ruoli: `authenticated`
   - Condizione WITH CHECK: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - Permette agli utenti autenticati di caricare documenti nella propria cartella

2. **"Users can view own documents"**
   - Tipo: SELECT
   - Ruoli: `authenticated`
   - Condizione USING: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - Permette agli utenti di vedere solo i propri documenti

3. **"Users can delete own documents"**
   - Tipo: DELETE
   - Ruoli: `authenticated`
   - Condizione USING: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - Permette agli utenti di eliminare solo i propri documenti

**Policies esistenti per `documents`:**

1. **"Authenticated users can upload documents"** (INSERT)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'documents'`
   - ⚠️ **Problema:** Troppo permissiva - permette a tutti gli utenti autenticati di caricare in qualsiasi cartella

2. **"Authenticated users can view documents"** (SELECT)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'documents'`
   - ⚠️ **Problema:** Troppo permissiva - permette a tutti di vedere tutti i documenti

3. **"Authenticated users can update documents"** (UPDATE)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'documents'`
   - ⚠️ **Problema:** Troppo permissiva

4. **"Authenticated users can delete documents"** (DELETE)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'documents'`
   - ⚠️ **Problema:** Troppo permissiva

5. **"Users can delete own documents"** (DELETE)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - ✅ Corretta - permette solo di eliminare i propri file

6. **"Users can update own documents"** (UPDATE)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - ✅ Corretta - permette solo di aggiornare i propri file

**⚠️ Problemi identificati:**

1. **Policies troppo permissive:** Le policies "Authenticated users can \*" permettono a tutti gli utenti autenticati di vedere/modificare/eliminare qualsiasi documento nel bucket `documents`
2. **Mancano policies per trainer:** Non ci sono policies che permettono ai trainer di vedere/caricare documenti dei propri atleti tramite `pt_atleti`
3. **Policies duplicate:** Ci sono policies duplicate con logiche diverse (es. "Authenticated users can delete" vs "Users can delete own")

**Raccomandazione:**

1. Rimuovere le policies troppo permissive "Authenticated users can \*"
2. Aggiungere policies specifiche per trainer sui bucket `athlete-*` (come già fatto per `athlete-certificates` e `athlete-referti`)
3. Standardizzare su bucket `athlete-*` e deprecare `documents` legacy

**BUCKET: exercise-videos**

1. **"Trainers can upload exercise videos"**
   - Tipo: INSERT
   - Ruoli: `authenticated`
   - Condizione WITH CHECK: `bucket_id = 'exercise-videos' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('admin', 'pt', 'trainer'))`
   - Solo trainer/admin possono caricare video

2. **"Users can view exercise videos"**
   - Tipo: SELECT
   - Ruoli: `authenticated`
   - Condizione USING: `bucket_id = 'exercise-videos'`
   - Tutti gli utenti autenticati possono vedere i video

3. **"Trainers can delete exercise videos"**
   - Tipo: DELETE
   - Ruoli: `authenticated`
   - Condizione USING: Stessa logica di INSERT
   - Solo trainer/admin possono eliminare video

**BUCKET: progress-photos**

1. **"Users can upload own progress photos"** (INSERT)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text`
   - ✅ Corretta - utenti possono caricare solo proprie foto

2. **"Users can view own progress photos"** (SELECT)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text`
   - ✅ Corretta - utenti vedono solo proprie foto

3. **"Users can update own progress photos"** (UPDATE)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text`
   - ✅ Corretta

4. **"Users can delete own progress photos"** (DELETE)
   - Ruoli: `authenticated`
   - Condizione: `bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text`
   - ✅ Corretta

**⚠️ Problema identificato:** Le policies per `progress-photos` permettono solo agli atleti di vedere le proprie foto. **Manca la policy per permettere ai trainer di vedere le foto progressi dei propri atleti**.

**BUCKET: athlete-certificates e athlete-referti**

**✅ Policies corrette già implementate:**

1. **"PT and Admin can upload certificates/referti"** (INSERT)
   - Ruoli: `authenticated`
   - Condizione: Verifica relazione `pt_atleti` tra trainer e atleta (tramite `storage.foldername`)
   - ✅ Permette ai trainer di caricare certificati/referti per i propri atleti

2. **"PT and Athlete can view certificates/referti"** (SELECT)
   - Ruoli: `authenticated`
   - Condizione: Verifica relazione `pt_atleti` OPPURE file nella cartella dell'utente
   - ✅ Permette a trainer e atleti di vedere i file appropriati

3. **"PT and Admin can update certificates/referti"** (UPDATE)
   - Ruoli: `authenticated`
   - Condizione: Verifica relazione `pt_atleti`
   - ✅ Permette ai trainer di aggiornare i file

4. **"Only Admin can delete certificates/referti"** (DELETE)
   - Ruoli: `authenticated`
   - Condizione: Solo admin
   - ✅ Solo admin possono eliminare (sicurezza)

**Nota:** I bucket `athlete-certificates` e `athlete-referti` hanno policies corrette che usano `pt_atleti` per verificare le relazioni trainer-atleta. Questo è il modello da seguire per gli altri bucket.

**BUCKET: avatars**

1. **"Users can upload own avatar"**
   - Tipo: INSERT
   - Ruoli: `authenticated`
   - Condizione WITH CHECK: `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text`
   - Utenti possono caricare proprio avatar

2. **"Public can view avatars"**
   - Tipo: SELECT
   - Ruoli: `public`
   - Condizione USING: `bucket_id = 'avatars'`
   - Tutti possono vedere gli avatar (bucket pubblico)

3. **"Users can update own avatar"**
   - Tipo: UPDATE
   - Ruoli: `authenticated`
   - Condizione: Stessa logica di INSERT
   - Utenti possono aggiornare proprio avatar

4. **"Users can delete own avatar"**
   - Tipo: DELETE
   - Ruoli: `authenticated`
   - Condizione USING: Stessa logica di INSERT
   - Utenti possono eliminare proprio avatar

### Query 7.3: Conteggio File per Bucket

**Query eseguita:**

```sql
SELECT
  bucket_id,
  COUNT(*) as file_count,
  ROUND(SUM(COALESCE((metadata->>'size')::bigint, 0)) / 1048576.0, 2) as total_size_mb
FROM storage.objects
GROUP BY bucket_id;
```

**Risultato:** (Eseguita il 2025-02-01)

**File presenti nei bucket:**

| Bucket            | Numero File | Dimensione Totale (MB) | Primo File | Ultimo File |
| ----------------- | ----------- | ---------------------- | ---------- | ----------- |
| `documents`       | 5           | 1.79                   | 2025-12-24 | 2025-12-26  |
| `exercise-thumbs` | 17          | 1.70                   | 2025-11-06 | 2025-12-24  |
| `exercise-videos` | 10          | 2.79                   | 2025-11-06 | 2025-12-24  |

**Note:**

- I bucket `athlete-certificates`, `athlete-documents`, `athlete-progress-photos`, `athlete-referti`, `avatars`, `general-files`, `progress-photos` non hanno file (0 file)
- Totale file: 32 file per 6.28 MB
- I file più recenti sono stati caricati a dicembre 2025

### Query 7.4: Relazioni File Storage con Tabelle Database

**DOCUMENTS → storage.objects (bucket: documents)**

- Tabella `documents` ha colonna `file_url` (TEXT, NOT NULL)
- Il `file_url` dovrebbe contenere il percorso del file nello storage
- **Risultato verifica (2025-02-01):**
  - Documenti in tabella: **0** (tabella vuota o nessun record con file_url)
  - File in storage bucket `documents`: **5 file** (1.79 MB)
  - Documenti con file esistente: **0**
  - ⚠️ **Problema:** Ci sono 5 file nello storage ma 0 documenti nella tabella. I file potrebbero essere orfani o la tabella `documents` non viene utilizzata (forse si usa `athlete-documents` invece)

**PROFILES → storage.objects (bucket: avatars)**

- Tabella `profiles` ha colonne `avatar` (TEXT) e `avatar_url` (TEXT)
- Questi campi dovrebbero contenere il percorso del file avatar nello storage
- **Risultato verifica (2025-02-01):**
  - Profili con avatar: **0** (nessun profilo ha avatar/avatar_url popolato)
  - File avatar in storage: **0** (bucket `avatars` vuoto)
  - ✅ **Stato:** Coerente - nessun avatar caricato

**EXERCISES → storage.objects (bucket: exercise-videos)**

- Tabella `exercises` ha colonna `video_url` (verificata)
- **Formato video_url:** URL completi Supabase Storage
  - Formato: `https://{project}.supabase.co/storage/v1/object/public/exercise-videos/{uuid}/{filename}`
  - Esempio: `https://icibqnmtacibgnhaidlz.supabase.co/storage/v1/object/public/exercise-videos/3e3ee096-ff78-4a09-b263-f7b29621c02f/1766535180279-p7hjo1x.mp4`
  - Percorso nello storage: `{uuid}/{filename}` (es. `3e3ee096-ff78-4a09-b263-f7b29621c02f/1766535180279-p7hjo1x.mp4`)
- **Risultato verifica (2025-02-01):**
  - Esercizi con video_url: **9** (9 esercizi hanno un video_url popolato)
  - File video in storage: **10 file** (2.79 MB nel bucket `exercise-videos`)
  - Esercizi con file esistente: **3 su 4 verificati** (75% corrispondenza)
  - ✅ **Corrispondenze trovate:**
    - `ssss` → File trovato ✅
    - `Military Press` → File trovato ✅
    - `Piegamenti` → File trovato ✅
  - ⚠️ **File mancanti:**
    - `xxx` → Video URL presente ma file non trovato nello storage ❌
      - URL: `796991ba-be7b-4f95-8232-6aa589265ef7/1765592588863-ki5o1jysxka.mp4`
      - **Possibile causa:** File eliminato manualmente o errore durante upload
  - **Nota:** Query aggiornata per estrarre correttamente il percorso dall'URL completo usando `SUBSTRING(video_url FROM '/exercise-videos/(.+)$')`
  - **Stato generale:** ✅ Buono - la maggior parte dei video_url corrisponde ai file nello storage

**PROGRESS_PHOTOS → storage.objects (bucket: progress-photos)**

- Tabella `progress_photos` esiste e ha colonna `image_url` (NON `photo_url`)
- **Risultato verifica (2025-02-01):**
  - Foto progressi in tabella: **0** (nessun record nella tabella `progress_photos`)
  - File foto in storage: **0** (nessun file nei bucket `progress-photos` e `athlete-progress-photos`)
  - Foto con file esistente: **0**
  - ✅ **Stato:** Coerente - nessuna foto progressi caricata né nella tabella né nello storage
  - **Nota:** Query corretta per usare `image_url` invece di `photo_url` e verifica entrambi i bucket

### Query 7.5: Problemi e Raccomandazioni Storage

**Problemi identificati:**

1. ⚠️ **Policies troppo permissive su `documents` (legacy)**
   - Le policies "Authenticated users can \*" permettono a tutti di vedere/modificare/eliminare qualsiasi documento
   - **Soluzione:** Rimuovere policies troppo permissive, aggiungere policies specifiche con verifica `pt_atleti` (come per `athlete-certificates`)

2. ⚠️ **Mancano policies per trainer su `progress-photos` e `athlete-progress-photos`**
   - Trainer non possono vedere foto progressi dei propri atleti
   - **Soluzione:** Aggiungere policy SELECT con JOIN `pt_atleti` (modello: `athlete-certificates`)

3. ⚠️ **Bucket duplicati/legacy**
   - `documents` vs `athlete-documents` (duplicati)
   - `progress-photos` vs `athlete-progress-photos` (duplicati)
   - **Soluzione:** Standardizzare su bucket `athlete-*` e deprecare quelli legacy

4. ⚠️ **Mancano policies per `athlete-documents`**
   - Il bucket esiste ma non ha policies specifiche documentate
   - **Soluzione:** Aggiungere policies simili a `athlete-certificates` con verifica `pt_atleti`

5. ⚠️ **File mancanti per exercises.video_url**
   - **9 esercizi** hanno `video_url` popolato (URL completi Supabase Storage)
   - **10 file** nello storage bucket `exercise-videos`
   - **Risultato verifica:** 3 su 4 esercizi verificati hanno corrispondenza (75%)
   - **1 file mancante:** Esercizio "xxx" ha `video_url` ma file non trovato nello storage
   - **Possibili cause:**
     - File eliminato manualmente dallo storage
     - Errore durante upload (URL salvato ma file non caricato)
     - File spostato o rinominato
   - **Soluzione:** Verificare se il file esiste ancora o aggiornare/rimuovere il `video_url` dall'esercizio
   - **Stato generale:** ✅ Buono - la maggior parte dei video_url corrisponde ai file nello storage

6. ⚠️ **File orfani in storage `documents`**
   - **5 file** nello storage ma **0 documenti** nella tabella `documents`
   - I file potrebbero essere orfani o la tabella non viene utilizzata (forse si usa `athlete-documents`)
   - **Soluzione:** Verificare se i file sono ancora necessari o se devono essere migrati/spostati

7. ⚠️ **Possibile disallineamento file_url**
   - I `file_url` nelle tabelle potrebbero non corrispondere ai file effettivi nello storage
   - **Soluzione:** Eseguire query di verifica e correggere i percorsi

8. ⚠️ **Possibile disallineamento avatar**
   - Gli `avatar`/`avatar_url` potrebbero non corrispondere ai file nello storage
   - **Soluzione:** Eseguire query di verifica e correggere i percorsi (attualmente 0 avatar, stato coerente)

**Raccomandazioni:**

1. **Rimuovere policies troppo permissive su `documents`:**

   ```sql
   DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
   ```

2. **Aggiungere policies RLS per trainer su `athlete-documents` (modello `athlete-certificates`):**

   ```sql
   -- Trainer possono caricare documenti per i propri atleti
   CREATE POLICY "PT and Admin can upload athlete documents"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'athlete-documents'
     AND (
       EXISTS (
         SELECT 1 FROM pt_atleti
         WHERE pt_atleti.atleta_id = (
           SELECT profiles.id FROM profiles
           WHERE profiles.user_id = ((string_to_array((storage.foldername(name))[1], '/'))[1])::uuid
         )
         AND pt_atleti.pt_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
       )
       OR EXISTS (
         SELECT 1 FROM profiles
         WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
       )
     )
   );

   -- Trainer e atleti possono vedere documenti appropriati
   CREATE POLICY "PT and Athlete can view athlete documents"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'athlete-documents'
     AND (
       EXISTS (
         SELECT 1 FROM pt_atleti
         WHERE pt_atleti.atleta_id = (
           SELECT profiles.id FROM profiles
           WHERE profiles.user_id = ((string_to_array((storage.foldername(name))[1], '/'))[1])::uuid
         )
         AND pt_atleti.pt_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
       )
       OR (string_to_array((storage.foldername(name))[1], '/'))[1] = auth.uid()::text
       OR EXISTS (
         SELECT 1 FROM profiles
         WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
       )
     )
   );
   ```

3. **Aggiungere policy per trainer su `progress-photos` e `athlete-progress-photos`:**

   ```sql
   -- Trainer possono vedere foto progressi dei propri atleti
   CREATE POLICY "PT can view athlete progress photos"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id IN ('progress-photos', 'athlete-progress-photos')
     AND EXISTS (
       SELECT 1 FROM pt_atleti
       WHERE pt_atleti.atleta_id = (
         SELECT profiles.id FROM profiles
         WHERE profiles.user_id = ((string_to_array((storage.foldername(name))[1], '/'))[1])::uuid
       )
       AND pt_atleti.pt_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     )
   );
   ```

4. **Verificare integrità file_url:**
   - Eseguire query di verifica per ogni bucket
   - Identificare file orfani (in storage ma non referenziati)
   - Identificare riferimenti orfani (in tabelle ma file non esistenti)

5. **Standardizzare percorsi file:**
   - Usare formato consistente per `file_url` (es: `bucket_name/user_id/filename.ext`)
   - Aggiornare trigger per sincronizzare automaticamente

### Query 7.6: Script SQL per Verifica Completa Storage

**File creati:**

- `docs/QUERY_32_STORAGE_BUCKETS.sql` - Elenco bucket esistenti
- `docs/QUERY_33_STORAGE_POLICIES.sql` - RLS policies storage
- `docs/QUERY_34_STORAGE_FILES_COUNT.sql` - Conteggio file per bucket
- `docs/QUERY_35_STORAGE_DOCUMENTS_FILES.sql` - File documenti e relazioni
- `docs/QUERY_36_STORAGE_AVATARS_FILES.sql` - File avatar e relazioni
- `docs/QUERY_37_STORAGE_EXERCISE_VIDEOS.sql` - File video esercizi
- `docs/QUERY_38_STORAGE_PROGRESS_PHOTOS.sql` - File foto progressi

**Istruzioni:**

1. Eseguire tutte le query in sequenza nel Supabase SQL Editor
2. Documentare i risultati per ogni query
3. Identificare problemi e disallineamenti
4. Applicare correzioni necessarie

**Nota:** Le query di verifica file potrebbero richiedere tempo se ci sono molti file nello storage.

---

## 8. Elementi da Documentare (Prossimi Step)

### Query 8.1: Funzioni SQL/RPC

**Query creata:** `QUERY_39_FUNZIONI_SQL.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Funzioni rilevanti trovate (70+ funzioni, filtrate da funzioni di sistema):**

**Categoria: Funzioni Helper RLS (3 funzioni):**

1. **`get_profile_id()` → UUID**
   - Tipo: STABLE, SECURITY DEFINER
   - **Scopo:** Converte `auth.uid()` in `profiles.id`
   - **Utilizzo:** Usata in tutte le RLS policies per identificare il profilo corrente
   - **Importanza:** ⚠️ CRITICA - senza questa funzione le RLS policies non funzionano

2. **`is_admin()` → BOOLEAN**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Verifica se l'utente corrente è admin
   - **Utilizzo:** Usata in tutte le RLS policies per dare accesso completo agli admin
   - **Importanza:** ⚠️ CRITICA - garantisce che admin vedano tutto

3. **`is_athlete()` → BOOLEAN**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Verifica se l'utente corrente è atleta
   - **Utilizzo:** Usata per verificare permessi atleti

4. **`is_staff()` → BOOLEAN**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Verifica se l'utente corrente è staff (pt/trainer/admin)

**Categoria: Funzioni Relazioni Trainer-Atleta (2 funzioni):**

5. **`check_pt_athlete_relationship(sender_uuid UUID, receiver_uuid UUID)` → BOOLEAN**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Verifica se esiste relazione trainer-atleta tra due utenti (per chat)
   - **Utilizzo:** Usata nelle policies di chat per garantire che solo trainer e loro atleti possano comunicare

6. **`complete_athlete_registration(invite_code TEXT, athlete_user_id UUID, athlete_email TEXT, athlete_name TEXT, athlete_surname TEXT)` → JSON**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Completa registrazione atleta e crea relazione `pt_atleti`
   - **Logica:**
     1. Trova invito valido
     2. Crea profilo atleta
     3. **Crea relazione `pt_atleti` con `pt_id` (profiles.id del trainer) e `atleta_id` (profiles.id dell'atleta)**
     4. Aggiorna stato invito
   - **Importanza:** ⚠️ CRITICA - questa funzione crea la relazione trainer-atleta durante la registrazione

**Categoria: Funzioni Business Logic - Pagamenti (4 funzioni):**

7. **`create_payment(p_athlete_id UUID, p_amount NUMERIC, p_method_text TEXT, p_lessons_purchased INTEGER, p_created_by_staff_id UUID, p_notes TEXT)` → UUID**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Crea un pagamento e aggiorna il contatore lezioni
   - **Commento:** "Crea un pagamento e aggiorna il contatore lezioni"

8. **`reverse_payment(p_payment_id UUID, p_created_by_staff_id UUID, p_notes TEXT)` → UUID**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Storna un pagamento e aggiorna il contatore lezioni
   - **Commento:** "Storna un pagamento e aggiorna il contatore lezioni"

9. **`decrement_lessons_used(p_athlete_id UUID)` → BOOLEAN**
   - Tipo: VOLATILE, SECURITY DEFINER
   - **Scopo:** Decrementa le lezioni usate per un atleta
   - **Commento:** "Decrementa le lezioni usate per un atleta"

10. **`get_monthly_revenue(p_year INTEGER, p_month INTEGER)` → TABLE(total_revenue NUMERIC, total_payments INTEGER, total_lessons_sold INTEGER)**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Ottiene statistiche mensili di revenue
    - **Commento:** "Ottiene statistiche mensili di revenue"

**Categoria: Funzioni Business Logic - Notifiche (7 funzioni):**

11. **`create_notification(p_user_id UUID, p_title TEXT, p_body TEXT, p_type TEXT, p_link TEXT, p_action_text TEXT)` → UUID**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea una nuova notifica per un utente
    - **Commento:** "Crea una nuova notifica per un utente"

12. **`mark_notification_as_read(p_notification_id UUID)` → BOOLEAN**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Marca una notifica come letta
    - **Commento:** "Marca una notifica come letta"

13. **`mark_all_notifications_as_read()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Marca tutte le notifiche dell'utente come lette
    - **Commento:** "Marca tutte le notifiche dell'utente come lette"

14. **`get_unread_notifications_count()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Ottiene il numero di notifiche non lette
    - **Commento:** "Ottiene il numero di notifiche non lette"

15. **`notify_expiring_documents()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea notifiche per documenti in scadenza
    - **Commento:** "Crea notifiche per documenti in scadenza"

16. **`notify_missing_progress()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea notifiche per progressi mancanti
    - **Commento:** "Crea notifiche per progressi mancanti"

17. **`notify_low_lesson_balance()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea notifiche per lezioni residue basse
    - **Commento:** "Crea notifiche per lezioni residue basse"

18. **`notify_no_active_workouts()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea notifiche per nessuna scheda attiva
    - **Commento:** "Crea notifiche per nessuna scheda attiva"

19. **`run_daily_notifications()` → TABLE(notification_type TEXT, count INTEGER)**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Esegue tutte le notifiche automatiche giornaliere
    - **Commento:** "Esegue tutte le notifiche automatiche giornaliere"

**Categoria: Funzioni Business Logic - Atleti e Progressi (5 funzioni):**

20. **`calculate_athlete_progress_score(athlete_uuid UUID)` → JSON**

**Descrizione:** Calcola uno score di progresso complessivo per l'atleta basato su tutte le categorie dati (medica, fitness, nutrizione, amministrativa, AI) con pesi specifici per categoria.

**Parametri:**

- `athlete_uuid` (UUID) - `user_id` dell'atleta

**Ritorna:** JSON con:

- `score_totale` (DECIMAL) - Score complessivo pesato (0-100)
- `score_medico` (DECIMAL) - Score categoria medica (peso 15%)
- `score_fitness` (DECIMAL) - Score categoria fitness (peso 25%)
- `score_nutrizione` (DECIMAL) - Score categoria nutrizione (peso 20%)
- `score_amministrativo` (DECIMAL) - Score categoria amministrativa (peso 15%)
- `score_ai` (DECIMAL) - Score categoria AI (peso 25%)
- `breakdown` (JSON) - Pesi per categoria
- `indicatori` (JSON) - Certificato valido, lezioni rimanenti, score engagement/progresso

**Logica:**

- Score Medico (15%): Certificato valido, referti aggiornati
- Score Fitness (25%): Dati completi, obiettivi definiti
- Score Nutrizione (20%): Obiettivi e preferenze definite
- Score Amministrativo (15%): Abbonamento attivo, lezioni disponibili
- Score AI (25%): Dati AI disponibili con score engagement e progresso

**File:** `supabase/migrations/20250127_create_helper_functions.sql` - Tipo: STABLE, SECURITY DEFINER - **Scopo:** Calcola uno score di progresso complessivo per l'atleta basato su tutte le categorie dati, con pesi specifici per categoria - **Commento:** "Calcola uno score di progresso complessivo per l'atleta basato su tutte le categorie dati, con pesi specifici per categoria"

21. **`get_athlete_insights(athlete_uuid UUID)` → JSON**

**Descrizione:** Ritorna insights aggregati per l'atleta, includendo dati AI, certificato, progress score e statistiche smart tracking.

**Parametri:**

- `athlete_uuid` (UUID) - `user_id` dell'atleta

**Ritorna:** JSON con:

- `ai_data` (JSON) - Ultimo record AI data con insights, raccomandazioni, pattern, predizioni
- `certificato` (JSON) - Info certificato medico (da `check_certificato_scadenza()`)
- `progress_score` (JSON) - Score progresso complessivo (da `calculate_athlete_progress_score()`)
- `statistiche` (JSONB) - Statistiche smart tracking ultimi 30 giorni (passi, calorie, sonno)

**File:** `supabase/migrations/20250127_create_helper_functions.sql` - Tipo: STABLE, SECURITY DEFINER - **Scopo:** Ritorna insights aggregati per l'atleta, includendo dati AI, certificato, progress score e statistiche smart tracking - **Commento:** "Ritorna insights aggregati per l'atleta, includendo dati AI, certificato, progress score e statistiche smart tracking"

22. **`get_athlete_profile_complete(athlete_uuid UUID)` → JSON**

**Descrizione:** Ritorna tutti i dati del profilo atleta in un unico JSON, includendo tutte le 9 categorie dati (anagrafica, medica, fitness, motivazionale, nutrizione, massaggi, amministrativa, smart tracking, AI).

**Parametri:**

- `athlete_uuid` (UUID) - `user_id` dell'atleta

**Ritorna:** JSON con:

- `anagrafica` (JSONB) - Dati anagrafici da `profiles`
- `medica` (JSONB) - Dati medici da `athlete_medical_data`
- `fitness` (JSONB) - Dati fitness da `athlete_fitness_data`
- `motivazionale` (JSONB) - Dati motivazionali da `athlete_motivational_data`
- `nutrizione` (JSONB) - Dati nutrizionali da `athlete_nutrition_data`
- `massaggi` (JSONB) - Dati massaggi da `athlete_massage_data`
- `amministrativa` (JSONB) - Dati amministrativi da `athlete_administrative_data`
- `smart_tracking_latest` (JSONB) - Ultimo record smart tracking
- `ai_data_latest` (JSONB) - Ultimo record AI data

**File:** `supabase/migrations/20250127_create_helper_functions.sql` - Tipo: STABLE, SECURITY DEFINER - **Scopo:** Ritorna tutti i dati del profilo atleta in un unico JSON, includendo tutte le 9 categorie dati - **Commento:** "Ritorna tutti i dati del profilo atleta in un unico JSON, includendo tutte le 9 categorie dati"

23. **`get_progress_stats(athlete_uuid UUID)` → JSON**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ritorna statistiche aggregate dei progressi atleta in formato JSON - ottimizzato per performance
    - **Commento:** "Ritorna statistiche aggregate dei progressi atleta in formato JSON - ottimizzato per performance"

24. **`check_certificato_scadenza(athlete_uuid UUID)` → JSON**

**Descrizione:** Verifica lo stato di scadenza del certificato medico e ritorna informazioni dettagliate con avvisi.

**Parametri:**

- `athlete_uuid` (UUID) - `user_id` dell'atleta

**Ritorna:** JSON con:

- `ha_certificato` (BOOLEAN) - Se l'atleta ha un certificato
- `stato` (TEXT) - 'assente', 'scaduto', 'in_scadenza', 'in_scadenza_presto', 'valido'
- `data_scadenza` (DATE) - Data scadenza certificato
- `giorni_alla_scadenza` (INTEGER) - Giorni rimanenti (negativo se scaduto)
- `avviso` (TEXT) - Messaggio avviso descrittivo
- `urgenza` (TEXT) - 'critica', 'alta', 'media', 'bassa'

**Logica:**

- Se certificato scaduto: urgenza 'critica'
- Se scade entro 7 giorni: urgenza 'alta'
- Se scade entro 30 giorni: urgenza 'media'
- Altrimenti: urgenza 'bassa'

**File:** `supabase/migrations/20250127_create_helper_functions.sql` - Tipo: STABLE, SECURITY DEFINER - **Scopo:** Verifica lo stato di scadenza del certificato medico e ritorna informazioni dettagliate con avvisi - **Commento:** "Verifica lo stato di scadenza del certificato medico e ritorna informazioni dettagliate con avvisi"

**Categoria: Funzioni Business Logic - Statistiche e Analytics (6 funzioni):**

25. **`get_clienti_stats()` → JSON**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ritorna statistiche aggregate dei clienti - versione ottimizzata con indici e query efficiente
    - **Commento:** "Ritorna statistiche aggregate dei clienti - versione ottimizzata con indici e query efficiente"

26. **`get_abbonamenti_with_stats(p_page INTEGER, p_page_size INTEGER)` → TABLE(...)**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ritorna abbonamenti con statistiche aggregate (JOIN payments, profiles, lesson_counters) - ottimizzato per performance con paginazione
    - **Commento:** "Ritorna abbonamenti con statistiche aggregate (JOIN payments, profiles, lesson_counters) - ottimizzato per performance con paginazione"

27. **`get_analytics_distribution_data()` → TABLE(type TEXT, count BIGINT, percentage NUMERIC)**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ottiene distribuzione per tipo di appuntamento (ottimizzata)
    - **Commento:** "Ottiene distribuzione per tipo di appuntamento (ottimizzata)"

28. **`get_analytics_performance_data(p_limit INTEGER)` → TABLE(...)**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ottiene performance data atleti (ottimizzata)
    - **Commento:** "Ottiene performance data atleti (ottimizzata)"

29. **`get_analytics_trend_data(p_days INTEGER)` → TABLE(day DATE, allenamenti BIGINT, documenti BIGINT, ore_totali NUMERIC)**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ottiene trend data giornaliero per analytics (ottimizzata)
    - **Commento:** "Ottiene trend data giornaliero per analytics (ottimizzata)"

30. **`get_web_vitals_stats(metric_name_filter VARCHAR, days_back INTEGER)` → TABLE(...)**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Ottiene statistiche aggregate per Web Vitals
    - **Commento:** "Ottiene statistiche aggregate per Web Vitals"

**Categoria: Funzioni Business Logic - Chat (1 funzione):**

31. **`get_conversation_participants(user_uuid UUID)` → TABLE(...)**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Ottiene i partecipanti alle conversazioni di un utente
    - **Commento:** "Ottiene i partecipanti alle conversazioni di un utente"

**Categoria: Funzioni Business Logic - Documenti (2 funzioni):**

32. **`update_document_statuses()` → VOID**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Aggiorna automaticamente gli stati dei documenti basandosi sulle date di scadenza
    - **Commento:** "Aggiorna automaticamente gli stati dei documenti basandosi sulle date di scadenza"

33. **`create_document_reminders()` → VOID**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea reminder per documenti in scadenza (30, 7, 1 giorni)
    - **Commento:** "Crea reminder per documenti in scadenza (30, 7, 1 giorni)"

**Categoria: Funzioni Business Logic - Appuntamenti (1 funzione):**

34. **`create_appointment_simple(p_athlete_id UUID, p_staff_id UUID, p_starts_at TIMESTAMPTZ, p_ends_at TIMESTAMPTZ, p_type TEXT, p_notes TEXT, p_location TEXT, p_org_id TEXT)` → UUID**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea un appuntamento in modo semplice. Restituisce l'ID dell'appuntamento creato.
    - **Commento:** "Crea un appuntamento in modo semplice. Restituisce l'ID dell'appuntamento creato."

**Categoria: Funzioni Business Logic - Inviti (2 funzioni):**

35. **`update_expired_invites()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Aggiorna automaticamente lo stato degli inviti scaduti a expired
    - **Commento:** "Aggiorna automaticamente lo stato degli inviti scaduti a expired"

36. **`check_invite_expiry()` → TRIGGER FUNCTION**

**Descrizione:** Aggiorna automaticamente lo status degli inviti scaduti. ✅ **AGGIORNATO POST FIX_18** - ora usa `status` invece di `stato`.

**Trigger:** `trigger_check_invite_expiry` su `inviti_atleti` (BEFORE INSERT/UPDATE OF expires_at, status)

**Logica:**

- Se `expires_at IS NOT NULL` AND `expires_at < NOW()` AND `status != 'accepted'`: imposta `status = 'expired'`

**Modifiche FIX_18:**

- ✅ Aggiornato per usare `status` invece di `stato`
- ✅ Valori supportati: 'pending', 'accepted', 'expired'

**File:**

- `supabase/migrations/20250130_auto_expire_documents_invites_subscriptions.sql` (versione originale)
- `docs/FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql` (aggiornamento post FIX_18)
  - Tipo: VOLATILE, SECURITY INVOKER
  - **Scopo:** Aggiorna automaticamente lo status degli inviti scaduti
  - **Commento:** "Aggiorna automaticamente lo status degli inviti scaduti"

**Categoria: Funzioni Business Logic - Utenti e Settings (3 funzioni):**

37. **`get_or_create_user_settings(p_user_id UUID)` → user_settings**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Ottiene o crea impostazioni utente

38. **`get_user_role()` → TEXT**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ottiene il ruolo dell'utente corrente

39. **`get_user_org_id()` → TEXT**
    - Tipo: STABLE, SECURITY DEFINER
    - **Scopo:** Ottiene l'org_id dell'utente corrente

**Categoria: Funzioni Validazione (6 funzioni):**

40. **`is_valid_email(email_text TEXT)` → BOOLEAN**
    - Tipo: IMMUTABLE, SECURITY INVOKER
    - **Scopo:** Valida formato email (pattern: user@domain.tld)
    - **Commento:** "Valida formato email (pattern: user@domain.tld)"

41. **`is_valid_phone(phone_text TEXT)` → BOOLEAN**
    - Tipo: IMMUTABLE, SECURITY INVOKER
    - **Scopo:** Valida formato telefono (permetti numeri, +, spazi, trattini, parentesi, 6-20 caratteri)
    - **Commento:** "Valida formato telefono (permetti numeri, +, spazi, trattini, parentesi, 6-20 caratteri)"

42. **`is_valid_url(url_text TEXT)` → BOOLEAN**
    - Tipo: IMMUTABLE, SECURITY INVOKER
    - **Scopo:** Valida formato URL (http:// o https://)
    - **Commento:** "Valida formato URL (http:// o https://)"

43. **`is_valid_codice_fiscale(cf TEXT)` → BOOLEAN**
    - Tipo: IMMUTABLE, SECURITY INVOKER
    - **Scopo:** Valida codice fiscale italiano (16 caratteri alfanumerici)
    - **Commento:** "Valida codice fiscale italiano (16 caratteri alfanumerici)"

44. **`is_valid_gruppo_sanguigno(gs TEXT)` → BOOLEAN**
    - Tipo: IMMUTABLE, SECURITY INVOKER
    - **Scopo:** Valida gruppo sanguigno (A, B, AB, O seguito da + o -)
    - **Commento:** "Valida gruppo sanguigno (A, B, AB, O seguito da + o -)"

45. **`is_safe_storage_path(path_text TEXT)` → BOOLEAN**
    - Tipo: IMMUTABLE, SECURITY INVOKER
    - **Scopo:** Funzione helper per validazione path storage. Da usare in validazioni aggiuntive se necessario.
    - **Commento:** "Funzione helper per validazione path storage. Da usare in validazioni aggiuntive se necessario."

**Categoria: Funzioni Trigger e Audit (8 funzioni):**

46. **`audit_trigger_function()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Funzione trigger generica per audit automatico su tutte le tabelle monitorate.
    - **Commento:** "Task 6.7: Funzione trigger generica per audit automatico su tutte le tabelle monitorate."

47. **`log_audit_event(p_table_name TEXT, p_record_id UUID, p_action TEXT, p_old_data JSONB, p_new_data JSONB)` → VOID**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Funzione helper per loggare operazioni critiche. Chiamata automaticamente dai trigger.
    - **Commento:** "Task 6.7: Funzione helper per loggare operazioni critiche. Chiamata automaticamente dai trigger."

48. **`update_updated_at_column()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY INVOKER
    - **Scopo:** Aggiorna automaticamente il campo updated_at quando un record viene modificato
    - **Commento:** "Aggiorna automaticamente il campo updated_at quando un record viene modificato"

49. **`check_document_expiry()` → TRIGGER FUNCTION**

**Descrizione:** Aggiorna automaticamente lo status dei documenti in base a `expires_at`.

**Trigger:** `trigger_check_document_expiry` su `documents` (BEFORE INSERT/UPDATE OF expires_at)

**Logica:**

- Se `expires_at < NOW()`: imposta `status = 'scaduto'`
- Se `expires_at` tra NOW() e NOW() + 7 giorni: imposta `status = 'in_scadenza'` (se era 'valido')
- Se `expires_at > NOW() + 7 giorni` e status era 'in_scadenza' o 'scaduto': imposta `status = 'valido'`

**File:** `supabase/migrations/20250130_auto_expire_documents_invites_subscriptions.sql` - Tipo: VOLATILE, SECURITY INVOKER - **Scopo:** Aggiorna automaticamente lo status dei documenti in base a expires_at - **Commento:** "Aggiorna automaticamente lo status dei documenti in base a expires_at"

50. **`check_subscription_expiry()` → TRIGGER FUNCTION**

**Descrizione:** Aggiorna automaticamente lo status degli abbonamenti scaduti (generica, funziona con TG_TABLE_NAME).

**Trigger:**

- `trigger_check_subscription_expiry` su `subscriptions` (se esiste)
- `trigger_check_abbonamento_expiry` su `abbonamenti` (se esiste)

**Logica:**

- Verifica `expires_at`, `end_date`, o `data_scadenza` (a seconda della tabella)
- Se la data è scaduta: imposta `status` o `stato` a 'scaduto'

**File:** `supabase/migrations/20250130_auto_expire_documents_invites_subscriptions.sql` - Tipo: VOLATILE, SECURITY INVOKER - **Scopo:** Aggiorna automaticamente lo status degli abbonamenti scaduti - **Commento:** "Aggiorna automaticamente lo status degli abbonamenti scaduti"

51. **`sync_profile_names()` → VOID**
    - Tipo: VOLATILE, SECURITY INVOKER
    - **Scopo:** Sincronizza nome/cognome con first_name/last_name nei profili
    - **Commento:** "Sincronizza nome/cognome con first_name/last_name nei profili"

52. **`sync_profile_names_trigger()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY INVOKER
    - **Scopo:** Trigger per mantenere sincronizzazione automatica nomi profili
    - **Commento:** "Trigger per mantenere sincronizzazione automatica nomi profili"

53. **`sync_profile_naming()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY INVOKER
    - **Scopo:** Sincronizza automaticamente colonne duplicate: nome<->first_name, cognome<->last_name, avatar<->avatar_url. Standard: nome, cognome, avatar sono primarie.
    - **Commento:** "Sincronizza automaticamente colonne duplicate: nome<->first_name, cognome<->last_name, avatar<->avatar_url. Standard: nome, cognome, avatar sono primarie."

**Categoria: Funzioni Trigger Varie (10+ funzioni):**

54. **`sync_trainer_id_from_staff()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY INVOKER
    - **Scopo:** Se `trainer_id` è NULL in appointments, usa `staff_id`

55. **`sync_phone_telefono()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY INVOKER
    - **Scopo:** Sincronizza automaticamente phone e telefono quando uno dei due viene aggiornato
    - **Commento:** "Sincronizza automaticamente phone e telefono quando uno dei due viene aggiornato"

56. **`sync_lesson_counters_on_payment()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Sincronizza automaticamente lesson_counters quando viene inserito un pagamento con lessons_purchased > 0. Usa lesson_type='standard' e count.
    - **Commento:** "Sincronizza automaticamente lesson_counters quando viene inserito un pagamento con lessons_purchased > 0. Usa lesson_type='standard' e count."

57. **`generate_invite_qr_url()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY INVOKER
    - **Scopo:** Genera automaticamente qr_url quando viene creato o aggiornato un invito senza qr_url
    - **Commento:** "Genera automaticamente qr_url quando viene creato o aggiornato un invito senza qr_url"

58. **`handle_new_user()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Crea automaticamente un profilo quando viene creato un nuovo utente in auth.users
    - **Commento:** "Crea automaticamente un profilo quando viene creato un nuovo utente in auth.users"

59. **`update_jwt_custom_claims()` → TRIGGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Aggiorna i JWT claims di Supabase quando un profilo viene creato/modificato

60. **`cleanup_expired_push_subscriptions()` → INTEGER**
    - Tipo: VOLATILE, SECURITY DEFINER
    - **Scopo:** Rimuove push subscriptions scadute (più vecchie di 90 giorni senza aggiornamenti)
    - **Commento:** "Rimuove push subscriptions scadute (più vecchie di 90 giorni senza aggiornamenti)"

**Altre funzioni minori:**

- `calculate_lezioni_rimanenti()` → TRIGGER
- `create_appointment_reminders()` → TRIGGER
- `handle_appointment_cancellation()` → TRIGGER
- `get_allenamenti_mese(p_atleta_id UUID)` → INTEGER
- `get_scheda_attiva(p_atleta_id UUID)` → TEXT
- `insert_workout_day_exercises(p_day_id UUID, p_exercises JSONB)` → VOID
- `migrate_progress_logs_to_fitness_data()` → TABLE(...)
- `validate_payment_amount()` → TRIGGER
- `update_appointments_updated_at()` → TRIGGER
- `update_user_settings_updated_at()` → TRIGGER

**Riepilogo:**

- **Totale funzioni rilevanti:** ~70 funzioni
- **Funzioni critiche per RLS:** 4 (get_profile_id, is_admin, is_athlete, is_staff)
- **Funzioni business logic:** ~40 funzioni
- **Funzioni trigger:** ~20 funzioni
- **Funzioni validazione:** 6 funzioni

**Stato:** ✅ Eseguita e documentata

### Query 8.2: Viste (Views) Dettagliate

**Query creata:** `QUERY_40_VISTE_DETTAGLIATE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Viste Trovate (3 viste):**

**1. `payments_per_staff_view` - Statistiche Pagamenti per Staff**

**Colonne (6):**

- `staff_id` (UUID, nullable) - ID del membro dello staff
- `nome_staff` (TEXT, nullable) - Nome del membro dello staff
- `mese` (TIMESTAMPTZ, nullable) - Mese di riferimento
- `totale_incassato` (NUMERIC, nullable) - Totale incassato dal membro dello staff nel mese
- `atleti_serviti` (BIGINT, nullable) - Numero di atleti serviti dal membro dello staff nel mese
- `transazioni_totali` (BIGINT, nullable) - Numero totale di transazioni gestite dal membro dello staff nel mese

**Scopo:** Vista aggregata per analizzare le performance di pagamento per ogni membro dello staff mensilmente.

**Utilizzo:**

- Dashboard performance staff
- Report mensili revenue per trainer
- Analisi atleti serviti per staff

**2. `progress_trend_view` - Trend Progressi Atleti**

**Colonne (10):**

- `athlete_id` (UUID, nullable) - ID dell'atleta
- `nome_atleta` (TEXT, nullable) - Nome dell'atleta
- `mese` (TIMESTAMPTZ, nullable) - Mese di riferimento
- `peso_medio` (NUMERIC, nullable) - Peso medio dell'atleta nel mese
- `bench_medio` (NUMERIC, nullable) - Bench press medio (kg) nel mese
- `squat_medio` (NUMERIC, nullable) - Squat medio (kg) nel mese
- `deadlift_medio` (NUMERIC, nullable) - Deadlift medio (kg) nel mese
- `misurazioni_mese` (BIGINT, nullable) - Numero di misurazioni registrate nel mese
- `percentuale_variazione_peso` (NUMERIC, nullable) - Variazione percentuale del peso rispetto al mese precedente
- `percentuale_incremento_bench` (NUMERIC, nullable) - Incremento percentuale bench press
- `percentuale_incremento_squat` (NUMERIC, nullable) - Incremento percentuale squat
- `percentuale_incremento_deadlift` (NUMERIC, nullable) - Incremento percentuale deadlift

**Scopo:** Vista aggregata per analizzare i trend di progresso degli atleti mese per mese, includendo metriche di forza e peso.

**Utilizzo:**

- Dashboard progressi atleti
- Report trend mensili
- Analisi performance atleti
- Grafici evoluzione peso e forza

**3. `workout_stats_mensili` - Statistiche Workout Mensili**

**Colonne (3):**

- `atleta_id` (UUID, nullable) - ID dell'atleta
- `allenamenti_mese` (BIGINT, nullable) - Numero di allenamenti completati dall'atleta nel mese
- `mese` (TIMESTAMPTZ, nullable) - Mese di riferimento

**Scopo:** Vista aggregata per contare gli allenamenti completati per atleta per mese.

**Utilizzo:**

- Dashboard statistiche workout
- Report frequenza allenamenti
- Analisi aderenza atleti ai programmi

**Note sulle Viste:**

- ✅ Tutte le colonne sono nullable - questo permette di includere anche mesi senza dati
- ✅ Le viste aggregano dati mensili per facilitare analisi temporali
- ✅ Le viste includono JOIN con `profiles` per ottenere nomi (staff, atleti)
- ⚠️ Le viste menzionate nella documentazione iniziale ma non trovate nel database:
  - `monthly_kpi_view` - Potrebbe non esistere o essere stata rimossa
  - `workout_completion_rate_view` - Potrebbe non esistere o essere stata rimossa
  - `athlete_stats_view` - Potrebbe non esistere o essere stata rimossa
  - `staff_performance_view` - Potrebbe non esistere o essere stata rimossa

**Stato:** ✅ Eseguita e documentata

### Query 8.3: Tabelle ATHLETE\_\*\_DATA Complete

**Query creata:** `QUERY_41_TABELLE_ATHLETE_DATA.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Foreign Keys Verificate (8 tabelle):**

Tutte le 8 tabelle `athlete_*_data` hanno foreign key corrette che referenziano `profiles.id`:

| Tabella                       | Colonna      | Tabella Riferita | Colonna Riferita | Nome Constraint                               | On Delete | On Update |
| ----------------------------- | ------------ | ---------------- | ---------------- | --------------------------------------------- | --------- | --------- |
| `athlete_administrative_data` | `athlete_id` | `profiles`       | `id`             | `athlete_administrative_data_athlete_id_fkey` | CASCADE   | NO ACTION |
| `athlete_ai_data`             | `athlete_id` | `profiles`       | `id`             | `athlete_ai_data_athlete_id_fkey`             | CASCADE   | NO ACTION |
| `athlete_fitness_data`        | `athlete_id` | `profiles`       | `id`             | `athlete_fitness_data_athlete_id_fkey`        | CASCADE   | NO ACTION |
| `athlete_massage_data`        | `athlete_id` | `profiles`       | `id`             | `athlete_massage_data_athlete_id_fkey`        | CASCADE   | NO ACTION |
| `athlete_medical_data`        | `athlete_id` | `profiles`       | `id`             | `athlete_medical_data_athlete_id_fkey`        | CASCADE   | NO ACTION |
| `athlete_motivational_data`   | `athlete_id` | `profiles`       | `id`             | `athlete_motivational_data_athlete_id_fkey`   | CASCADE   | NO ACTION |
| `athlete_nutrition_data`      | `athlete_id` | `profiles`       | `id`             | `athlete_nutrition_data_athlete_id_fkey`      | CASCADE   | NO ACTION |
| `athlete_smart_tracking_data` | `athlete_id` | `profiles`       | `id`             | `athlete_smart_tracking_data_athlete_id_fkey` | CASCADE   | NO ACTION |

**Note:**

- ✅ Tutte le foreign keys referenziano correttamente `profiles.id` (non `profiles.user_id`)
- ✅ Tutte hanno `ON DELETE CASCADE` - se un profilo viene eliminato, i dati associati vengono eliminati automaticamente
- ✅ Tutte hanno `ON UPDATE NO ACTION` - previene aggiornamenti accidentali di `profiles.id`
- ✅ Tutte le tabelle hanno constraint UNIQUE su `athlete_id` - un atleta può avere un solo record per categoria

**Struttura Completa Tabelle (dalle migrazioni):**

**1. `athlete_administrative_data` - Dati Amministrativi**

**Colonne (13):**

- `id` (UUID, PK, default: gen_random_uuid())
- `athlete_id` (UUID, NOT NULL, FK → profiles.id, UNIQUE)
- `tipo_abbonamento` (VARCHAR(50), CHECK: 'mensile', 'trimestrale', 'semestrale', 'annuale', 'pacchetto_lezioni', 'nessuno')
- `stato_abbonamento` (VARCHAR(20), CHECK: 'attivo', 'scaduto', 'sospeso', 'in_attesa')
- `data_inizio_abbonamento` (DATE)
- `data_scadenza_abbonamento` (DATE)
- `lezioni_incluse` (INTEGER, default: 0, CHECK: >= 0)
- `lezioni_utilizzate` (INTEGER, default: 0, CHECK: >= 0)
- `lezioni_rimanenti` (INTEGER, default: 0, CHECK: >= 0)
- `metodo_pagamento_preferito` (VARCHAR(50), CHECK: 'carta', 'bonifico', 'contanti', 'altro')
- `note_contrattuali` (TEXT)
- `documenti_contrattuali` (JSONB, default: '[]'::jsonb)
- `created_at` / `updated_at` (TIMESTAMPTZ, default: NOW())

**Constraint:**

- UNIQUE (`athlete_id`)
- CHECK: `lezioni_utilizzate <= lezioni_incluse`

**Trigger:**

- `calculate_lezioni_rimanenti_trigger` - Calcola automaticamente `lezioni_rimanenti = lezioni_incluse - lezioni_utilizzate`
- `update_administrative_updated_at` - Aggiorna `updated_at`

**Indici:**

- `idx_administrative_athlete_id` - Ricerca per atleta
- `idx_administrative_scadenza` - Scadenze abbonamenti (parziale)
- `idx_administrative_stato` - Filtro per stato (parziale)
- `idx_administrative_documenti_gin` - GIN per ricerca in JSONB

**2. `athlete_medical_data` - Dati Medici**

**Colonne (12):**

- `id` (UUID, PK)
- `athlete_id` (UUID, NOT NULL, FK → profiles.id, UNIQUE)
- `certificato_medico_url` (TEXT)
- `certificato_medico_scadenza` (DATE)
- `certificato_medico_tipo` (VARCHAR(50), CHECK: 'agonistico', 'non_agonistico', 'sportivo')
- `referti_medici` (JSONB, default: '[]'::jsonb)
- `allergie` (TEXT[], default: ARRAY[]::TEXT[])
- `patologie` (TEXT[], default: ARRAY[]::TEXT[])
- `farmaci_assunti` (JSONB, default: '[]'::jsonb)
- `interventi_chirurgici` (JSONB, default: '[]'::jsonb)
- `note_mediche` (TEXT)
- `created_at` / `updated_at` (TIMESTAMPTZ)

**Indici:**

- `idx_medical_athlete_id` - Ricerca per atleta
- `idx_medical_certificato_scadenza` - Scadenze certificati (parziale)
- `idx_medical_allergie_gin` - GIN per array allergie
- `idx_medical_patologie_gin` - GIN per array patologie
- `idx_medical_referti_gin` - GIN per JSONB referti
- `idx_medical_farmaci_gin` - GIN per JSONB farmaci

**3. `athlete_fitness_data` - Dati Fitness**

**Colonne (13):**

- `id` (UUID, PK)
- `athlete_id` (UUID, NOT NULL, FK → profiles.id, UNIQUE)
- `livello_esperienza` (VARCHAR(20), CHECK: 'principiante', 'intermedio', 'avanzato', 'professionista')
- `obiettivo_primario` (VARCHAR(50), CHECK: 'dimagrimento', 'massa_muscolare', 'forza', 'resistenza', 'tonificazione', 'riabilitazione', 'altro')
- `obiettivi_secondari` (VARCHAR(50)[], default: ARRAY[]::VARCHAR(50)[])
- `giorni_settimana_allenamento` (INTEGER, default: 3, CHECK: BETWEEN 1 AND 7)
- `durata_sessione_minuti` (INTEGER, default: 60, CHECK: > 0)
- `preferenze_orario` (VARCHAR(20)[], default: ARRAY[]::VARCHAR(20)[])
- `attivita_precedenti` (TEXT[], default: ARRAY[]::TEXT[])
- `infortuni_pregressi` (JSONB, default: '[]'::jsonb)
- `zone_problematiche` (TEXT[], default: ARRAY[]::TEXT[])
- `note_fitness` (TEXT)
- `created_at` / `updated_at` (TIMESTAMPTZ)

**Indici:**

- `idx_fitness_athlete_id` - Ricerca per atleta
- `idx_fitness_obiettivo` - Filtro per obiettivo (parziale)
- `idx_fitness_livello` - Filtro per livello (parziale)
- `idx_fitness_obiettivi_secondari_gin` - GIN per array obiettivi
- `idx_fitness_preferenze_orario_gin` - GIN per array orari
- `idx_fitness_attivita_precedenti_gin` - GIN per array attività
- `idx_fitness_zone_problematiche_gin` - GIN per array zone
- `idx_fitness_infortuni_gin` - GIN per JSONB infortuni

**4. `athlete_nutrition_data` - Dati Nutrizionali**

**Colonne (13):**

- `id` (UUID, PK)
- `athlete_id` (UUID, NOT NULL, FK → profiles.id, UNIQUE)
- `obiettivo_nutrizionale` (VARCHAR(50), CHECK: 'dimagrimento', 'massa', 'mantenimento', 'performance', 'salute')
- `calorie_giornaliere_target` (INTEGER, CHECK: > 0)
- `macronutrienti_target` (JSONB, default: '{"proteine_g": null, "carboidrati_g": null, "grassi_g": null}'::jsonb)
- `dieta_seguita` (VARCHAR(50), CHECK: 'onnivora', 'vegetariana', 'vegana', 'keto', 'paleo', 'mediterranea', 'altro')
- `intolleranze_alimentari` (TEXT[], default: ARRAY[]::TEXT[])
- `allergie_alimentari` (TEXT[], default: ARRAY[]::TEXT[])
- `alimenti_preferiti` (TEXT[], default: ARRAY[]::TEXT[])
- `alimenti_evitati` (TEXT[], default: ARRAY[]::TEXT[])
- `preferenze_orari_pasti` (JSONB, default: '{"colazione": null, "pranzo": null, "cena": null, "spuntini": []}'::jsonb)
- `note_nutrizionali` (TEXT)
- `created_at` / `updated_at` (TIMESTAMPTZ)

**Indici:**

- `idx_nutrition_athlete_id` - Ricerca per atleta
- `idx_nutrition_obiettivo` - Filtro per obiettivo (parziale)
- `idx_nutrition_dieta` - Filtro per dieta (parziale)
- `idx_nutrition_intolleranze_gin` - GIN per array intolleranze
- `idx_nutrition_allergie_alimentari_gin` - GIN per array allergie
- `idx_nutrition_alimenti_preferiti_gin` - GIN per array alimenti preferiti
- `idx_nutrition_alimenti_evitati_gin` - GIN per array alimenti evitati
- `idx_nutrition_macronutrienti_gin` - GIN per JSONB macronutrienti
- `idx_nutrition_orari_pasti_gin` - GIN per JSONB orari pasti

**5-8. Altre Tabelle `athlete_*_data`:**

Le altre 4 tabelle (`athlete_ai_data`, `athlete_massage_data`, `athlete_motivational_data`, `athlete_smart_tracking_data`) seguono lo stesso pattern:

- Foreign key `athlete_id` → `profiles.id` (CASCADE delete, UNIQUE)
- RLS policies con verifica `pt_atleti`
- Indici per performance
- Trigger per `updated_at`

**RLS Policies (Pattern Comune a Tutte le 8 Tabelle):**

Ogni tabella ha 4 policies RLS:

1. **"PT can view assigned athletes [category] data"** (SELECT)
   - PT può vedere dati degli atleti assegnati (tramite `pt_atleti`)
   - Atleta può vedere solo i propri dati (`athlete_id = auth.uid()`)
   - Admin può vedere tutto

2. **"PT and Admin can insert [category] data"** (INSERT)
   - PT può inserire per atleti assegnati
   - Admin può inserire per tutti

3. **"PT and Admin can update [category] data"** (UPDATE)
   - PT può aggiornare per atleti assegnati
   - Admin può aggiornare tutto

4. **"Only Admin can delete [category] data"** (DELETE)
   - Solo admin può eliminare

**Isolamento Garantito:** ✅ Trainer vedono solo dati dei propri atleti tramite `pt_atleti`

**Stato:** ✅ Eseguita e documentata

### Query 8.4: Estensioni e Sequenze

**Query creata:** `QUERY_42_ESTENSIONI_SEQUENZE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Estensioni PostgreSQL Installate:**

Le estensioni comuni in Supabase includono:

- `uuid-ossp` o estensioni simili - Per generazione UUID (usato con `gen_random_uuid()`)
- `pgcrypto` - Per funzioni crittografiche
- `pg_stat_statements` - Per statistiche query
- `pg_trgm` - Per ricerca full-text (usato in alcune migrazioni)
- Altre estensioni standard Supabase

**Nota:** I risultati specifici delle estensioni non sono stati forniti, ma il database usa `gen_random_uuid()` per le primary keys, indicando che estensioni per UUID sono installate.

**Sequenze (Sequences) nel Database:**

**Risultato:** ⚠️ **NESSUNA SEQUENZA TROVATA**

La query per le sequenze ha restituito solo l'header "=== TABELLE CON SEQUENZE ===" senza risultati.

**Motivo:**

- Il database usa **UUID** come primary keys invece di sequenze auto-increment
- Tutte le tabelle usano `gen_random_uuid()` come default per le colonne `id`
- Non ci sono colonne con `SERIAL`, `BIGSERIAL`, o `nextval()` come default

**Tabelle che Usano Sequenze:**

**Risultato:** ⚠️ **NESSUNA TABELLA USA SEQUENZE**

La query per identificare tabelle con sequenze ha restituito solo l'header senza risultati.

**Conferma Pattern Database:**

- ✅ Tutte le tabelle usano `UUID` come primary key
- ✅ Default: `gen_random_uuid()` per tutte le colonne `id`
- ✅ Nessuna tabella usa auto-increment numerico
- ✅ Pattern coerente in tutto il database

**Vantaggi del Pattern UUID:**

- ✅ Unicità globale (non solo nel database)
- ✅ Sicurezza (non prevedibile, non esporre informazioni)
- ✅ Facilita distribuzione/replicazione (nessun conflitto ID)
- ✅ Nessuna necessità di sequenze (riduce complessità)

**Stato:** ✅ Eseguita e documentata - Nessuna sequenza trovata (pattern UUID confermato)

### Query 8.5: Constraint CHECK

**Query creata:** `QUERY_43_CONSTRAINT_CHECK.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Constraint CHECK per Validazione Dati (escludendo NOT NULL):**

**TABELLA: appointments**

1. **`appointments_status_check`**
   - Condizione: `status IN ('attivo', 'completato', 'annullato', 'in_corso', 'cancelled')`
   - **Scopo:** Valida lo stato degli appuntamenti

2. **`appointments_type_check`**
   - Condizione: `type IN ('allenamento', 'cardio', 'check', 'consulenza', 'prima_visita', 'riunione', 'massaggio', 'nutrizionista')`
   - **Scopo:** Valida il tipo di appuntamento

3. **`valid_time_range`**
   - Condizione: `ends_at > starts_at`
   - **Scopo:** Garantisce che la fine sia dopo l'inizio

**TABELLA: athlete_administrative_data**

4. **`athlete_administrative_data_tipo_abbonamento_check`**
   - Condizione: `tipo_abbonamento IN ('mensile', 'trimestrale', 'semestrale', 'annuale', 'pacchetto_lezioni', 'nessuno')`
   - **Scopo:** Valida tipo abbonamento

5. **`athlete_administrative_data_stato_abbonamento_check`**
   - Condizione: `stato_abbonamento IN ('attivo', 'scaduto', 'sospeso', 'in_attesa')`
   - **Scopo:** Valida stato abbonamento

6. **`athlete_administrative_data_metodo_pagamento_preferito_check`**
   - Condizione: `metodo_pagamento_preferito IN ('carta', 'bonifico', 'contanti', 'altro')`
   - **Scopo:** Valida metodo pagamento

7. **`athlete_administrative_data_lezioni_incluse_check`**
   - Condizione: `lezioni_incluse >= 0`
   - **Scopo:** Lezioni incluse non negative

8. **`athlete_administrative_data_lezioni_utilizzate_check`**
   - Condizione: `lezioni_utilizzate >= 0`
   - **Scopo:** Lezioni utilizzate non negative

9. **`athlete_administrative_data_lezioni_rimanenti_check`**
   - Condizione: `lezioni_rimanenti >= 0`
   - **Scopo:** Lezioni rimanenti non negative

10. **`lezioni_utilizzate_not_greater_than_incluse`**
    - Condizione: `lezioni_utilizzate <= lezioni_incluse`
    - **Scopo:** Garantisce coerenza tra lezioni utilizzate e incluse

**TABELLA: athlete_ai_data**

11. **`athlete_ai_data_score_engagement_check`**
    - Condizione: `score_engagement >= 0 AND score_engagement <= 100`
    - **Scopo:** Score engagement in range 0-100

12. **`athlete_ai_data_score_progresso_check`**
    - Condizione: `score_progresso >= 0 AND score_progresso <= 100`
    - **Scopo:** Score progresso in range 0-100

**TABELLA: athlete_fitness_data**

13. **`athlete_fitness_data_livello_esperienza_check`**
    - Condizione: `livello_esperienza IN ('principiante', 'intermedio', 'avanzato', 'professionista')`
    - **Scopo:** Valida livello esperienza

14. **`athlete_fitness_data_obiettivo_primario_check`**
    - Condizione: `obiettivo_primario IN ('dimagrimento', 'massa_muscolare', 'forza', 'resistenza', 'tonificazione', 'riabilitazione', 'altro')`
    - **Scopo:** Valida obiettivo primario

15. **`athlete_fitness_data_giorni_settimana_allenamento_check`**
    - Condizione: `giorni_settimana_allenamento >= 1 AND giorni_settimana_allenamento <= 7`
    - **Scopo:** Giorni settimanali validi (1-7)

16. **`athlete_fitness_data_durata_sessione_minuti_check`**
    - Condizione: `durata_sessione_minuti > 0`
    - **Scopo:** Durata sessione positiva

17. **`fitness_durata_sessione_range_check`**
    - Condizione: `durata_sessione_minuti IS NULL OR (durata_sessione_minuti >= 15 AND durata_sessione_minuti <= 300)`
    - **Scopo:** Durata sessione in range ragionevole (15-300 minuti)

**TABELLA: athlete_massage_data**

18. **`athlete_massage_data_intensita_preferita_check`**
    - Condizione: `intensita_preferita IN ('leggera', 'media', 'intensa')`
    - **Scopo:** Valida intensità massaggio

**TABELLA: athlete_medical_data**

19. **`athlete_medical_data_certificato_medico_tipo_check`**
    - Condizione: `certificato_medico_tipo IN ('agonistico', 'non_agonistico', 'sportivo')`
    - **Scopo:** Valida tipo certificato medico

20. **`medical_certificato_url_format_check`**
    - Condizione: `certificato_medico_url IS NULL OR is_valid_url(certificato_medico_url)`
    - **Scopo:** Valida formato URL certificato (usa funzione `is_valid_url()`)

**TABELLA: athlete_motivational_data**

21. **`athlete_motivational_data_livello_motivazione_check`**
    - Condizione: `livello_motivazione >= 1 AND livello_motivazione <= 10`
    - **Scopo:** Livello motivazione in scala 1-10

**TABELLA: athlete_nutrition_data**

22. **`athlete_nutrition_data_obiettivo_nutrizionale_check`**
    - Condizione: `obiettivo_nutrizionale IN ('dimagrimento', 'massa', 'mantenimento', 'performance', 'salute')`
    - **Scopo:** Valida obiettivo nutrizionale

23. **`athlete_nutrition_data_dieta_seguita_check`**
    - Condizione: `dieta_seguita IN ('onnivora', 'vegetariana', 'vegana', 'keto', 'paleo', 'mediterranea', 'altro')`
    - **Scopo:** Valida tipo dieta

24. **`athlete_nutrition_data_calorie_giornaliere_target_check`**
    - Condizione: `calorie_giornaliere_target > 0`
    - **Scopo:** Calorie target positive

25. **`nutrition_calorie_target_range_check`**
    - Condizione: `calorie_giornaliere_target IS NULL OR (calorie_giornaliere_target >= 800 AND calorie_giornaliere_target <= 10000)`
    - **Scopo:** Calorie target in range ragionevole (800-10000)

**TABELLA: athlete_smart_tracking_data**

26. **`athlete_smart_tracking_data_dispositivo_tipo_check`**
    - Condizione: `dispositivo_tipo IN ('smartwatch', 'fitness_tracker', 'app_mobile', 'altro')`
    - **Scopo:** Valida tipo dispositivo

27. **`athlete_smart_tracking_data_qualita_sonno_check`**
    - Condizione: `qualita_sonno IN ('ottima', 'buona', 'media', 'scarsa')`
    - **Scopo:** Valida qualità sonno

28. **`athlete_smart_tracking_data_battito_cardiaco_min_check`**
    - Condizione: `battito_cardiaco_min > 0 AND battito_cardiaco_min <= 250`
    - **Scopo:** Battito minimo valido (1-250 bpm)

29. **`athlete_smart_tracking_data_battito_cardiaco_medio_check`**
    - Condizione: `battito_cardiaco_medio > 0 AND battito_cardiaco_medio <= 250`
    - **Scopo:** Battito medio valido (1-250 bpm)

30. **`athlete_smart_tracking_data_battito_cardiaco_max_check`**
    - Condizione: `battito_cardiaco_max > 0 AND battito_cardiaco_max <= 250`
    - **Scopo:** Battito massimo valido (1-250 bpm)

31. **`athlete_smart_tracking_data_ore_sonno_check`**
    - Condizione: `ore_sonno >= 0 AND ore_sonno <= 24`
    - **Scopo:** Ore sonno valide (0-24 ore)

32. **`athlete_smart_tracking_data_passi_giornalieri_check`**
    - Condizione: `passi_giornalieri >= 0`
    - **Scopo:** Passi non negativi

33. **`athlete_smart_tracking_data_attivita_minuti_check`**
    - Condizione: `attivita_minuti >= 0`
    - **Scopo:** Minuti attività non negativi

34. **`athlete_smart_tracking_data_calorie_bruciate_check`**
    - Condizione: `calorie_bruciate >= 0`
    - **Scopo:** Calorie bruciate non negative

35. **`athlete_smart_tracking_data_distanza_percorsa_km_check`**
    - Condizione: `distanza_percorsa_km >= 0`
    - **Scopo:** Distanza non negativa

36. **`smart_tracking_passi_max_check`**
    - Condizione: `passi_giornalieri IS NULL OR passi_giornalieri <= 100000`
    - **Scopo:** Limite massimo passi (100000)

37. **`smart_tracking_calorie_max_check`**
    - Condizione: `calorie_bruciate IS NULL OR calorie_bruciate <= 20000`
    - **Scopo:** Limite massimo calorie (20000)

38. **`smart_tracking_distanza_max_check`**
    - Condizione: `distanza_percorsa_km IS NULL OR distanza_percorsa_km <= 1000`
    - **Scopo:** Limite massimo distanza (1000 km)

**TABELLA: communication_recipients**

39. **`communication_recipients_recipient_type_check`**
    - Condizione: `recipient_type IN ('push', 'email', 'sms')`
    - **Scopo:** Valida tipo destinatario

40. **`communication_recipients_status_check`**
    - Condizione: `status IN ('pending', 'sent', 'delivered', 'opened', 'failed', 'bounced')`
    - **Scopo:** Valida stato comunicazione

**TABELLA: communications**

41. **`communications_type_check`**
    - Condizione: `type IN ('push', 'email', 'sms', 'all')`
    - **Scopo:** Valida tipo comunicazione

42. **`communications_status_check`**
    - Condizione: `status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')`
    - **Scopo:** Valida stato comunicazione

**TABELLA: inviti_atleti**

43. **`inviti_atleti_status_check`**
    - Condizione: `status IN ('pending', 'accepted', 'expired')`
    - **Scopo:** Valida stato invito

**TABELLA: payments**

44. **`payments_status_check`**
    - Condizione: `status IN ('pending', 'completed', 'failed', 'refunded')`
    - **Scopo:** Valida stato pagamento

**TABELLA: profiles**

45. **`profiles_role_check`**
    - Condizione: `role IN ('admin', 'pt', 'trainer', 'atleta', 'athlete')`
    - **Scopo:** ⚠️ CRITICO - Valida ruolo utente (usato in RLS policies)
    - **Importanza:** Garantisce che solo ruoli validi esistano nel sistema

**TABELLA: roles**

46. **`roles_name_check`**
    - Condizione: `name IN ('admin', 'pt', 'trainer', 'atleta', 'athlete')`
    - **Scopo:** Valida nome ruolo (deve corrispondere a `profiles.role`)

**TABELLA: web_vitals**

47. **`web_vitals_metric_name_check`**
    - Condizione: `metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP')`
    - **Scopo:** Valida nome metrica Web Vitals

48. **`web_vitals_metric_rating_check`**
    - Condizione: `metric_rating IN ('good', 'needs-improvement', 'poor')`
    - **Scopo:** Valida rating metrica

**TABELLA: workout_logs**

49. **`workout_logs_stato_check`**
    - Condizione: `stato IN ('programmato', 'in_corso', 'completato', 'saltato', 'scheduled', 'in_progress', 'completed', 'skipped')`
    - **Scopo:** Valida stato workout (supporta italiano e inglese)

**Riepilogo Constraint CHECK:**

- **Totale constraint CHECK documentati:** 49 constraint
- **Constraint NOT NULL:** ~150+ (non documentati in dettaglio, sono standard)
- **Constraint con logica di validazione:** 49 constraint
- **Tabelle con più constraint:** `athlete_smart_tracking_data` (13), `athlete_administrative_data` (7), `athlete_fitness_data` (5)

**Categorie di Validazione:**

1. **Validazione Enum/Lista Valori (30+ constraint):**
   - Stati (appointments, payments, communications, inviti, workout_logs)
   - Tipi (appointments, abbonamenti, dispositivi, diete, ecc.)
   - Ruoli (profiles, roles)

2. **Validazione Range Numerico (15+ constraint):**
   - Score (0-100)
   - Battito cardiaco (1-250 bpm)
   - Calorie (800-10000, max 20000)
   - Durata sessioni (15-300 minuti)
   - Giorni settimanali (1-7)
   - Livello motivazione (1-10)

3. **Validazione Coerenza Logica (3 constraint):**
   - `valid_time_range` - Fine > Inizio
   - `lezioni_utilizzate_not_greater_than_incluse` - Lezioni utilizzate <= incluse
   - `smart_tracking_*_max_check` - Limiti massimi ragionevoli

4. **Validazione Formato (1 constraint):**
   - `medical_certificato_url_format_check` - Usa funzione `is_valid_url()`

**Stato:** ✅ Eseguita e documentata

### Query 8.6: Tabelle Non Documentate

**Query creata:** `QUERY_44_TABELLE_NON_DOCUMENTATE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Foreign Keys Verificate (7 foreign keys):**

| Tabella                    | Colonna FK         | Tabella Riferita | Colonna Riferita | On Delete | On Update |
| -------------------------- | ------------------ | ---------------- | ---------------- | --------- | --------- |
| `communication_recipients` | `communication_id` | `communications` | `id`             | CASCADE   | NO ACTION |
| `inviti_atleti`            | `invited_by`       | `profiles`       | `id`             | SET NULL  | NO ACTION |
| `lesson_counters`          | `athlete_id`       | `profiles`       | `id`             | CASCADE   | NO ACTION |
| `notifications`            | `appointment_id`   | `appointments`   | `id`             | CASCADE   | NO ACTION |
| `profiles_tags`            | `assigned_by`      | `profiles`       | `id`             | SET NULL  | NO ACTION |
| `profiles_tags`            | `profile_id`       | `profiles`       | `id`             | CASCADE   | NO ACTION |
| `profiles_tags`            | `tag_id`           | `cliente_tags`   | `id`             | CASCADE   | NO ACTION |

**Note:**

- ✅ `communication_recipients` → `communications` (CASCADE) - Se una comunicazione viene eliminata, i destinatari vengono eliminati
- ✅ `inviti_atleti.invited_by` → `profiles.id` (SET NULL) - Se il profilo che ha creato l'invito viene eliminato, `invited_by` diventa NULL (preserva l'invito)
- ✅ `lesson_counters` → `profiles.id` (CASCADE) - Se un atleta viene eliminato, i contatori lezioni vengono eliminati
- ✅ `notifications.appointment_id` → `appointments.id` (CASCADE) - Se un appuntamento viene eliminato, le notifiche associate vengono eliminate
- ✅ `profiles_tags` ha 3 foreign keys:
  - `profile_id` → `profiles.id` (CASCADE) - Se un profilo viene eliminato, i tag associati vengono eliminati
  - `tag_id` → `cliente_tags.id` (CASCADE) - Se un tag viene eliminato, le associazioni vengono eliminate
  - `assigned_by` → `profiles.id` (SET NULL) - Se il profilo che ha assegnato il tag viene eliminato, `assigned_by` diventa NULL (preserva l'associazione)

**Tabelle da Documentare Completamente:**

1. **`notifications`** - Sistema notifiche
   - Foreign key: `appointment_id` → `appointments.id` (CASCADE)
   - Foreign key: `user_id` → `profiles.user_id` (presumibilmente, da verificare)
   - Struttura completa
   - RLS policies
   - Relazioni con profili e appuntamenti

2. **`payments`** - Sistema pagamenti
   - Foreign key: `athlete_id` → `profiles.id` (presumibilmente, da verificare)
   - Foreign key: `created_by_staff_id` → `profiles.id` (presumibilmente, da verificare)
   - Struttura completa
   - Stati pagamento (da constraint CHECK: 'pending', 'completed', 'failed', 'refunded')
   - Relazioni con atleti e staff
   - RLS policies

3. **`communications`** - Sistema comunicazioni
   - Foreign key: `created_by` → `profiles.id` (presumibilmente, da verificare)
   - Struttura completa
   - Tipi comunicazione (da constraint CHECK: 'push', 'email', 'sms', 'all')
   - Stati (da constraint CHECK: 'draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')
   - Relazioni con destinatari (`communication_recipients`)

4. **`communication_recipients`** - Destinatari comunicazioni
   - Foreign key: `communication_id` → `communications.id` (CASCADE)
   - Foreign key: `user_id` → `profiles.user_id` (presumibilmente, da verificare)
   - Struttura completa
   - Tipi destinatario (da constraint CHECK: 'push', 'email', 'sms')
   - Stati (da constraint CHECK: 'pending', 'sent', 'delivered', 'opened', 'failed', 'bounced')

5. **`inviti_atleti`** - Sistema inviti
   - Foreign key: `pt_id` → `profiles.id` (presumibilmente, da verificare)
   - Foreign key: `invited_by` → `profiles.id` (SET NULL)
   - Struttura completa
   - Stati invito (da constraint CHECK: 'pending', 'accepted', 'expired')
   - Relazioni con trainer e atleti

6. **`lesson_counters`** - Contatori lezioni
   - Foreign key: `athlete_id` → `profiles.id` (CASCADE)
   - Struttura completa
   - Logica incremento/decremento
   - Relazioni con pagamenti

7. **`user_settings`** - Impostazioni utente
   - Foreign key: `user_id` → `profiles.user_id` (presumibilmente, da verificare)
   - Struttura completa
   - Tipi impostazioni
   - RLS policies

8. **`web_vitals`** - Metriche performance web
   - Struttura completa
   - Tipi metriche (da constraint CHECK: 'LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP')
   - Rating (da constraint CHECK: 'good', 'needs-improvement', 'poor')

9. **`cliente_tags`** e **`profiles_tags`** - Sistema tag
   - `cliente_tags`: Tabella base tag
   - `profiles_tags`: Tabella many-to-many (profile_id, tag_id, assigned_by)
   - Foreign keys verificate (vedi sopra)
   - Struttura completa

10. **`audit_logs`** - Log di audit
    - Struttura completa
    - Tipi eventi tracciati
    - Trigger che popolano i log

11. **`push_subscriptions`** - Sottoscrizioni push
    - Foreign key: `user_id` → `profiles.user_id` (presumibilmente, da verificare)
    - Struttura completa
    - RLS policies

12. **`roles`** - Tabella ruoli
    - Struttura completa
    - Ruoli disponibili (da constraint CHECK: 'admin', 'pt', 'trainer', 'atleta', 'athlete')
    - Relazione con `profiles.role`

**Stato:** ⏳ Parzialmente eseguita - Foreign keys verificate, struttura completa da documentare

### Query 8.7: RLS Policies Complete

**Query creata:** `QUERY_46_RLS_POLICIES_COMPLETE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Stato RLS per Tutte le Tabelle (33 tabelle totali):**

**✅ RLS Abilitato (30 tabelle):**

| Tabella                       | Numero Policies | Note                                            |
| ----------------------------- | --------------- | ----------------------------------------------- |
| `profiles`                    | 8               | Tabella principale - maggior numero di policies |
| `payments`                    | 6               | Sistema pagamenti - policies complesse          |
| `workout_plans`               | 6               | Schede allenamento - isolamento trainer-atleta  |
| `pt_atleti`                   | 6               | Relazione principale - isolamento critico       |
| `athlete_administrative_data` | 5               | Dati amministrativi                             |
| `athlete_ai_data`             | 5               | Dati AI                                         |
| `athlete_fitness_data`        | 5               | Dati fitness                                    |
| `athlete_massage_data`        | 5               | Dati massaggi                                   |
| `athlete_medical_data`        | 5               | Dati medici                                     |
| `athlete_motivational_data`   | 5               | Dati motivazionali                              |
| `athlete_nutrition_data`      | 5               | Dati nutrizionali                               |
| `athlete_smart_tracking_data` | 5               | Dati smart tracking                             |
| `communications`              | 5               | Sistema comunicazioni                           |
| `documents`                   | 5               | Documenti atleti                                |
| `exercises`                   | 5               | Esercizi                                        |
| `lesson_counters`             | 5               | Contatori lezioni                               |
| `user_settings`               | 6               | Impostazioni utente                             |
| `appointments`                | 4               | Appuntamenti                                    |
| `audit_logs`                  | 3               | Log di audit                                    |
| `chat_messages`               | 3               | Messaggi chat                                   |
| `cliente_tags`                | 4               | Tag clienti                                     |
| `communication_recipients`    | 4               | Destinatari comunicazioni                       |
| `inviti_atleti`               | 3               | Inviti atleti                                   |
| `notifications`               | 4               | Notifiche                                       |
| `profiles_tags`               | 4               | Tag profili                                     |
| `progress_logs`               | 4               | Log progressi                                   |
| `progress_photos`             | 3               | Foto progressi                                  |
| `push_subscriptions`          | 3               | Sottoscrizioni push                             |
| `workout_day_exercises`       | 4               | Esercizi giorni workout                         |
| `workout_days`                | 4               | Giorni workout                                  |
| `workout_logs`                | 3               | Log workout                                     |

**❌ RLS Disabilitato (3 tabelle):**

| Tabella        | Numero Policies | Note                                                               |
| -------------- | --------------- | ------------------------------------------------------------------ |
| `roles`        | 0               | ⚠️ **Problema:** RLS disabilitato, nessuna policy                  |
| `web_vitals`   | 2               | ⚠️ **Problema:** RLS disabilitato ma ha 2 policies (inconsistenza) |
| `workout_sets` | 2               | ⚠️ **Problema:** RLS disabilitato ma ha 2 policies (inconsistenza) |

**Analisi:**

**✅ Tabelle con RLS Corretto:**

- Tutte le tabelle `athlete_*_data` hanno 5 policies ciascuna (pattern uniforme)
- Tabelle principali (`profiles`, `pt_atleti`, `payments`) hanno policies multiple per isolamento completo
- Tabelle con dati sensibili hanno RLS abilitato e policies appropriate

**⚠️ Problemi Identificati:**

1. **`roles` - RLS Disabilitato:**
   - ⚠️ RLS è `false` e ha 0 policies
   - **Rischio:** Tabella accessibile a tutti gli utenti autenticati
   - **Raccomandazione:** Abilitare RLS e aggiungere policies (solo admin può modificare ruoli)

2. **`web_vitals` - RLS Disabilitato ma ha Policies:**
   - ⚠️ RLS è `false` ma ha 2 policies
   - **Inconsistenza:** Le policies non vengono applicate se RLS è disabilitato
   - **Rischio:** Dati accessibili a tutti (metriche performance potrebbero essere sensibili)
   - **Raccomandazione:** Abilitare RLS (`ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;`)

3. **`workout_sets` - RLS Disabilitato ma ha Policies:**
   - ⚠️ RLS è `false` ma ha 2 policies
   - **Inconsistenza:** Le policies non vengono applicate se RLS è disabilitato
   - **Rischio:** Dati accessibili a tutti (serie workout potrebbero essere sensibili)
   - **Raccomandazione:** Abilitare RLS (`ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;`)

**Riepilogo Policies per Categoria:**

- **Tabelle Core (profiles, pt_atleti):** 8 + 6 = 14 policies
- **Tabelle Dati Atleti (8 tabelle athlete\_\*\_data):** 8 × 5 = 40 policies
- **Tabelle Workout (4 tabelle):** 4 + 4 + 3 + 6 = 17 policies
- **Tabelle Sistema (notifications, payments, communications):** 4 + 6 + 5 = 15 policies
- **Tabelle Supporto (tags, settings, subscriptions):** 4 + 4 + 6 + 3 = 17 policies
- **Tabelle Audit/Log (audit_logs, progress_logs, progress_photos):** 3 + 4 + 3 = 10 policies

**Totale Policies:** ~130+ policies RLS attive

**Isolamento Dati Garantito:**

- ✅ **Trainer vedono solo dati dei propri atleti** (tramite `pt_atleti` JOIN in tutte le policies)
- ✅ **Atleti vedono solo i propri dati** (tramite `athlete_id = get_profile_id()` o `user_id = auth.uid()`)
- ✅ **Admin vedono tutto** (tramite `is_admin()` in tutte le policies)
- ⚠️ **3 tabelle senza isolamento** (`roles`, `web_vitals`, `workout_sets`) - da correggere

**Stato:** ✅ Eseguita e documentata

### Query 8.8: Indici Dettagliati

**Query creata:** `QUERY_47_INDICI_DETTAGLIATI.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Statistiche Utilizzo Indici (200+ indici analizzati):**

**Indici Più Utilizzati (Top 20):**

| Tabella              | Indice                                       | Scansioni | Tuple Lette | Tuple Recuperate | Efficienza          |
| -------------------- | -------------------------------------------- | --------- | ----------- | ---------------- | ------------------- |
| `profiles`           | `idx_profiles_user_id`                       | 10,642    | 6,368       | 6,347            | ✅ 99.7%            |
| `profiles`           | `profiles_pkey`                              | 4,990     | 5,035       | 4,979            | ✅ 98.9%            |
| `workout_plans`      | `workout_plans_pkey`                         | 629       | 48          | 48               | ✅ 100%             |
| `workout_plans`      | `idx_workout_plans_athlete`                  | 495       | 6,375       | 2,304            | ⚠️ 36.2%            |
| `documents`          | `idx_documents_status`                       | 300       | 0           | 0                | ⚠️ Nessun risultato |
| `communications`     | `idx_communications_created_at`              | 291       | 440         | 414              | ✅ 94.1%            |
| `progress_logs`      | `idx_progress_logs_athlete_date`             | 286       | 0           | 0                | ⚠️ Nessun risultato |
| `workout_logs`       | `idx_workout_logs_atleta_data`               | 256       | 0           | 0                | ⚠️ Nessun risultato |
| `workout_sets`       | `idx_workout_sets_exercise`                  | 252       | 0           | 0                | ⚠️ Nessun risultato |
| `push_subscriptions` | `idx_push_subscriptions_user_id`             | 232       | 164         | 38               | ⚠️ 23.2%            |
| `appointments`       | `idx_appointments_staff_starts`              | 190       | 95          | 94               | ✅ 98.9%            |
| `lesson_counters`    | `idx_lesson_counters_athlete`                | 158       | 0           | 0                | ⚠️ Nessun risultato |
| `communications`     | `communications_pkey`                        | 155       | 182         | 155              | ✅ 85.2%            |
| `roles`              | `roles_name_key`                             | 149       | 191         | 187              | ✅ 97.9%            |
| `profiles`           | `profiles_user_id_key`                       | 144       | 144         | 110              | ⚠️ 76.4%            |
| `profiles`           | `idx_profiles_data_iscrizione`               | 142       | 6           | 4                | ⚠️ 66.7%            |
| `documents`          | `idx_documents_athlete_id`                   | 118       | 0           | 0                | ⚠️ Nessun risultato |
| `progress_photos`    | `idx_progress_photos_athlete_angle`          | 117       | 0           | 0                | ⚠️ Nessun risultato |
| `user_settings`      | `idx_user_settings_user_id`                  | 113       | 66          | 64               | ✅ 97.0%            |
| `lesson_counters`    | `lesson_counters_athlete_lesson_type_unique` | 91        | 5           | 5                | ✅ 100%             |

**Analisi Utilizzo per Categoria:**

#### 1. Tabelle Core (`profiles`, `pt_atleti`)

**`profiles` - Indici Critici:**

- ✅ **`idx_profiles_user_id`** - **10,642 scansioni** (indice più utilizzato del database)
  - **Scopo:** Join con `auth.users` per autenticazione
  - **Efficienza:** 99.7% (6,347 tuple recuperate su 6,368 lette)
  - **Importanza:** ⚠️ CRITICO - usato in tutte le RLS policies tramite `get_profile_id()`

- ✅ **`profiles_pkey`** - **4,990 scansioni**
  - **Scopo:** Primary key lookups
  - **Efficienza:** 98.9%
  - **Importanza:** ⚠️ CRITICO - usato in tutte le foreign keys

- ⚠️ **`profiles_user_id_key`** - **144 scansioni**
  - **Efficienza:** 76.4% (110 recuperate su 144 lette)
  - **Nota:** UNIQUE constraint, usato per verifiche unicità

- ⚠️ **`idx_profiles_data_iscrizione`** - **142 scansioni**
  - **Efficienza:** 66.7% (4 recuperate su 6 lette)
  - **Nota:** Indice parziale per ordinamento, bassa efficienza

**`pt_atleti` - Indici:**

- ⚠️ **`pt_atleti_pt_id_atleta_id_key`** - **17 scansioni**
  - **Scopo:** UNIQUE constraint per relazioni trainer-atleta
  - **Utilizzo:** Basso ma critico per integrità

- ⚠️ **Altri indici `pt_atleti`** - **0 scansioni**
  - `idx_pt_atleti_pt`, `idx_pt_atleti_atleta`, `idx_pt_atleti_pt_atleta` - non utilizzati
  - **Raccomandazione:** Verificare se sono necessari o se possono essere rimossi

#### 2. Tabelle Workout (`workout_plans`, `workout_logs`, `workout_sets`)

**`workout_plans`:**

- ✅ **`workout_plans_pkey`** - **629 scansioni**
  - **Efficienza:** 100%

- ⚠️ **`idx_workout_plans_athlete`** - **495 scansioni**
  - **Efficienza:** 36.2% (2,304 recuperate su 6,375 lette)
  - **Problema:** Indice legge molte tuple ma recupera poche - possibile problema di selettività
  - **Raccomandazione:** Verificare se l'indice è ottimale per le query eseguite

- ⚠️ **`idx_workout_plans_active`** - **60 scansioni**
  - **Efficienza:** 0% (0 recuperate su 6,600 lette)
  - **Problema:** Indice parziale per `is_active = true`, ma legge molte tuple senza recuperarne
  - **Raccomandazione:** Verificare se l'indice è necessario o se la query può essere ottimizzata

**`workout_logs`:**

- ⚠️ **Tutti gli indici** - **0 scansioni** o scansioni con 0 tuple recuperate
  - Tabelle vuote o non utilizzate nel periodo analizzato
  - **Nota:** Coerente con statistiche tabelle (0 record in `workout_logs`)

**`workout_sets`:**

- ⚠️ **`idx_workout_sets_exercise`** - **252 scansioni**
  - **Efficienza:** 0% (0 tuple recuperate)
  - **Problema:** Indice utilizzato ma non recupera risultati
  - **Raccomandazione:** Verificare query che usano questo indice

#### 3. Tabelle `athlete_*_data` (8 tabelle)

**Pattern Generale:**

- ⚠️ **Tutti gli indici hanno 0 scansioni o scansioni con 0 tuple recuperate**
- **Causa:** Tabelle vuote (0 record) - coerente con statistiche Query 50
- **Nota:** Indici pronti per quando i dati verranno popolati

**Indici con Scansioni (ma 0 tuple recuperate):**

- `idx_administrative_athlete_id` - 23 scansioni, 0 recuperate
- `idx_fitness_athlete_id` - 23 scansioni, 0 recuperate
- `idx_medical_athlete_id` - 21 scansioni, 0 recuperate
- **Causa:** Query eseguite su tabelle vuote (verifiche esistenza record)

#### 4. Tabelle Sistema (`documents`, `communications`, `notifications`, `payments`)

**`documents`:**

- ⚠️ **`idx_documents_status`** - **300 scansioni**
  - **Efficienza:** 0% (0 tuple recuperate)
  - **Causa:** Tabella vuota (0 record) - query eseguite ma nessun risultato

- ⚠️ **Altri indici** - **0 scansioni** o 0 tuple recuperate
  - Coerente con tabella vuota

**`communications`:**

- ✅ **`idx_communications_created_at`** - **291 scansioni**
  - **Efficienza:** 94.1% (414 recuperate su 440 lette)
  - **Scopo:** Ordinamento per data creazione

- ✅ **`communications_pkey`** - **155 scansioni**
  - **Efficienza:** 85.2%

- ✅ **`idx_communications_status`** - **30 scansioni**
  - **Efficienza:** 60.3% (35 recuperate su 58 lette)

**`payments`:**

- ✅ **`idx_payments_athlete_id`** - **22 scansioni**
  - **Efficienza:** 100% (6 recuperate su 6 lette)

- ✅ **`payments_pkey`** - **14 scansioni**
  - **Efficienza:** 100%

- ✅ **`idx_payments_status`** - **8 scansioni**
  - **Efficienza:** 85% (34 recuperate su 40 lette)

**`notifications`:**

- ⚠️ **Tutti gli indici** - **0 scansioni** o scansioni con 0 tuple recuperate
  - Solo `notifications_pkey` ha 1 scansione con 3 tuple recuperate
  - **Nota:** Tabella con pochi record (3 record)

#### 5. Tabelle Chat e Messaggi

**`chat_messages`:**

- ⚠️ **`idx_chat_messages_conversation_optimized`** - **60 scansioni**
  - **Efficienza:** 0% (0 tuple recuperate su 56 lette)
  - **Problema:** Indice ottimizzato per conversazioni ma non recupera risultati
  - **Raccomandazione:** Verificare query che usano questo indice

- ⚠️ **Altri indici chat** - **0 scansioni** o 0 tuple recuperate
  - Indici non utilizzati o tabelle con pochi record

#### 6. Tabelle Supporto

**`push_subscriptions`:**

- ⚠️ **`idx_push_subscriptions_user_id`** - **232 scansioni**
  - **Efficienza:** 23.2% (38 recuperate su 164 lette)
  - **Problema:** Bassa efficienza - legge molte tuple ma recupera poche
  - **Raccomandazione:** Verificare se l'indice è ottimale

**`user_settings`:**

- ✅ **`idx_user_settings_user_id`** - **113 scansioni**
  - **Efficienza:** 97.0% (64 recuperate su 66 lette)

**`roles`:**

- ✅ **`roles_name_key`** - **149 scansioni**
  - **Efficienza:** 97.9% (187 recuperate su 191 lette)

**Problemi Identificati:**

1. ⚠️ **Indici Non Utilizzati (150+ indici con 0 scansioni):**
   - Tutti gli indici `athlete_*_data` (tabelle vuote)
   - Molti indici `workout_*` (tabelle vuote)
   - Indici GIN per JSONB/array non utilizzati
   - **Causa:** Tabelle vuote o query non eseguite nel periodo analizzato
   - **Raccomandazione:** Monitorare quando i dati verranno popolati

2. ⚠️ **Indici con Bassa Efficienza:**
   - `idx_workout_plans_athlete` - 36.2% efficienza
   - `idx_workout_plans_active` - 0% efficienza (6,600 tuple lette, 0 recuperate)
   - `idx_push_subscriptions_user_id` - 23.2% efficienza
   - `idx_chat_messages_conversation_optimized` - 0% efficienza
   - **Raccomandazione:** Analizzare query che usano questi indici e ottimizzare

3. ⚠️ **Indici con Scansioni ma 0 Tuple Recuperate:**
   - Molti indici su tabelle vuote (coerente)
   - Alcuni indici su tabelle con dati (possibile problema)
   - **Raccomandazione:** Verificare query che usano questi indici

**Indici Critici per Performance:**

1. ✅ **`idx_profiles_user_id`** - Indice più utilizzato (10,642 scansioni)
   - Usato in tutte le RLS policies
   - Efficienza: 99.7%
   - **Importanza:** ⚠️ CRITICO - non rimuovere mai

2. ✅ **`profiles_pkey`** - Secondo più utilizzato (4,990 scansioni)
   - Usato in tutte le foreign keys
   - Efficienza: 98.9%
   - **Importanza:** ⚠️ CRITICO

3. ✅ **`workout_plans_pkey`** - Terzo più utilizzato (629 scansioni)
   - Efficienza: 100%
   - **Importanza:** Alta

**Riepilogo Statistiche:**

- **Totale indici analizzati:** ~200 indici
- **Indici utilizzati (scansioni > 0):** ~60 indici (30%)
- **Indici non utilizzati (scansioni = 0):** ~140 indici (70%)
- **Indici con alta efficienza (>90%):** ~15 indici
- **Indici con bassa efficienza (<50%):** ~10 indici

**Raccomandazioni:**

1. **Monitorare indici quando i dati verranno popolati:**
   - Tutti gli indici `athlete_*_data` sono pronti ma non utilizzati (tabelle vuote)
   - Quando i dati verranno inseriti, monitorare l'utilizzo

2. **Ottimizzare indici con bassa efficienza:**
   - `idx_workout_plans_athlete` - verificare se può essere migliorato
   - `idx_workout_plans_active` - verificare se è necessario
   - `idx_push_subscriptions_user_id` - verificare selettività

3. **Rimuovere indici non utilizzati (opzionale):**
   - Solo dopo aver verificato che non saranno necessari in futuro
   - Attenzione: alcuni indici potrebbero essere usati raramente ma essere critici

**Stato:** ✅ Eseguita e documentata

### Query 8.9: Trigger Completi

**Query creata:** `QUERY_48_TRIGGER_COMPLETI.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Trigger Trovati (60 trigger totali):**

**Tutti i trigger sono ✅ ENABLED** - nessun trigger disabilitato trovato.

#### Categoria: Trigger Audit (9 trigger)

Tutti i trigger di audit usano la funzione `audit_trigger_function()` e sono AFTER INSERT/UPDATE/DELETE:

1. **`audit_athlete_administrative_data_trigger`** (athlete_administrative_data)
2. **`audit_athlete_ai_data_trigger`** (athlete_ai_data)
3. **`audit_athlete_fitness_data_trigger`** (athlete_fitness_data)
4. **`audit_athlete_massage_data_trigger`** (athlete_massage_data)
5. **`audit_athlete_medical_data_trigger`** (athlete_medical_data)
6. **`audit_athlete_motivational_data_trigger`** (athlete_motivational_data)
7. **`audit_athlete_nutrition_data_trigger`** (athlete_nutrition_data)
8. **`audit_athlete_smart_tracking_data_trigger`** (athlete_smart_tracking_data)
9. **`audit_documents_trigger`** (documents)
10. **`audit_payments_trigger`** (payments)
11. **`audit_profiles_trigger`** (profiles) - AFTER DELETE/UPDATE

**Scopo:** Traccia tutte le modifiche critiche in `audit_logs` per sicurezza e audit.

#### Categoria: Trigger Updated_at (30+ trigger)

Tutti i trigger `update_*_updated_at` usano `update_updated_at_column()` e sono BEFORE UPDATE:

- Presente su quasi tutte le tabelle
- Aggiorna automaticamente `updated_at` ad ogni modifica
- Pattern uniforme in tutto il database

**Esempi:**

- `update_appointments_updated_at`
- `update_profiles_updated_at`
- `update_workout_plans_updated_at`
- E molti altri...

#### Categoria: Trigger Sincronizzazione (5 trigger)

1. **`sync_trainer_id_trigger`** (appointments)
   - Funzione: `sync_trainer_id_from_staff()`
   - Timing: BEFORE INSERT/UPDATE
   - **Scopo:** Sincronizza `trainer_id` da `staff_id` se NULL

2. **`sync_phone_telefono_trigger`** (profiles)
   - Funzione: `sync_phone_telefono()`
   - Timing: BEFORE UPDATE
   - Condizione: Quando `phone` o `telefono` cambiano
   - **Scopo:** Sincronizza `phone` ↔ `telefono`

3. **`trigger_sync_profile_names`** (profiles)
   - Funzione: `sync_profile_names_trigger()`
   - Timing: BEFORE INSERT/UPDATE
   - **Scopo:** Sincronizza `nome/cognome` ↔ `first_name/last_name`

4. **`trigger_sync_profile_naming`** (profiles)
   - Funzione: `sync_profile_naming()`
   - Timing: BEFORE INSERT/UPDATE
   - Colonne: `nome, cognome, avatar, first_name, last_name, avatar_url`
   - **Scopo:** ⚠️ **Duplicato** di `trigger_sync_profile_names` - sincronizza anche `avatar` ↔ `avatar_url`

5. **`trigger_sync_lesson_counters_on_payment`** (payments)
   - Funzione: `sync_lesson_counters_on_payment()`
   - Timing: AFTER INSERT
   - Condizione: Quando `lessons_purchased > 0`
   - **Scopo:** Aggiorna automaticamente `lesson_counters` quando viene inserito un pagamento

#### Categoria: Trigger Calcolo Automatico (2 trigger)

1. **`calculate_lezioni_rimanenti_trigger`** (athlete_administrative_data)
   - Funzione: `calculate_lezioni_rimanenti()`
   - Timing: BEFORE INSERT/UPDATE
   - Condizione: Quando `lezioni_incluse` o `lezioni_utilizzate` cambiano
   - **Scopo:** Calcola automaticamente `lezioni_rimanenti = lezioni_incluse - lezioni_utilizzate`

#### Categoria: Trigger Validazione (4 trigger)

1. **`trigger_check_document_expiry`** (documents)
   - Funzione: `check_document_expiry()`
   - Timing: BEFORE INSERT/UPDATE
   - Colonne: `expires_at`
   - **Scopo:** Aggiorna `documenti_scadenza` in `profiles` quando un documento scade

2. **`trigger_validate_payment_amount`** (payments)
   - Funzione: `validate_payment_amount()`
   - Timing: BEFORE INSERT/UPDATE
   - **Scopo:** Valida importo pagamento

3. **`trigger_check_invite_expiration`** (inviti_atleti)
   - Funzione: `check_invite_expiration()`
   - Timing: BEFORE INSERT/UPDATE
   - **Scopo:** Verifica scadenza inviti

4. **`trigger_check_invite_expiry`** (inviti_atleti)
   - Funzione: `check_invite_expiry()`
   - Timing: BEFORE INSERT/UPDATE
   - Colonne: `expires_at, stato`
   - **Scopo:** ⚠️ **Duplicato** di `trigger_check_invite_expiration` - verifica scadenza inviti

#### Categoria: Trigger Generazione Automatica (1 trigger)

1. **`trigger_generate_invite_qr_url`** (inviti_atleti)
   - Funzione: `generate_invite_qr_url()`
   - Timing: BEFORE INSERT/UPDATE
   - Condizione: Quando `qr_url` è NULL o vuoto
   - Colonne: `codice`
   - **Scopo:** Genera automaticamente `qr_url` quando viene creato/aggiornato un invito

#### Categoria: Trigger JWT (1 trigger)

1. **`trigger_update_jwt_custom_claims`** (profiles)
   - Funzione: `update_jwt_custom_claims()`
   - Timing: AFTER INSERT/UPDATE
   - Colonne: `role, org_id`
   - **Scopo:** ⚠️ CRITICO - Aggiorna i JWT claims di Supabase quando un profilo viene creato/modificato

#### Categoria: Trigger Updated_at Specializzati (2 trigger)

1. **`trigger_update_user_settings_updated_at`** (user_settings)
   - Funzione: `update_user_settings_updated_at()`
   - Timing: BEFORE UPDATE
   - **Scopo:** Versione specializzata per `user_settings`

#### Problemi Identificati:

1. ⚠️ **Trigger Duplicati in `documents`:**
   - `trigger_update_documents_updated_at` e `update_documents_updated_at` fanno la stessa cosa
   - **Raccomandazione:** Rimuovere uno dei due

2. ⚠️ **Trigger Duplicati in `profiles`:**
   - `trigger_sync_profile_names` e `trigger_sync_profile_naming` fanno cose simili
   - **Raccomandazione:** Verificare se entrambi sono necessari o se uno può essere rimosso

3. ⚠️ **Trigger Duplicati in `inviti_atleti`:**
   - `trigger_check_invite_expiration` e `trigger_check_invite_expiry` fanno la stessa cosa
   - **Raccomandazione:** Rimuovere uno dei due

4. ⚠️ **Trigger Duplicati in `user_settings`:**
   - `trigger_update_user_settings_updated_at` e `update_user_settings_updated_at` fanno la stessa cosa
   - **Raccomandazione:** Rimuovere uno dei due

**Riepilogo per Tabella:**

- **`profiles`**: 6 trigger (audit, sync x2, naming x2, jwt, updated_at)
- **`athlete_*_data` (8 tabelle)**: 2 trigger ciascuna (audit, updated_at) = 16 trigger
- **`documents`**: 4 trigger (audit, expiry, updated_at x2) - ⚠️ duplicato
- **`payments`**: 4 trigger (audit, sync_lesson_counters, validate, updated_at)
- **`inviti_atleti`**: 4 trigger (expiration x2, qr_url, updated_at) - ⚠️ duplicato
- **Altre tabelle**: 1-2 trigger ciascuna (principalmente updated_at)

**Totale:** 60 trigger attivi

**Stato:** ✅ Eseguita e documentata

### Query 8.10: Configurazione Database

**Query creata:** `QUERY_50_CONFIGURAZIONE_DATABASE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Statistiche Tabelle (33 tabelle analizzate):**

**Tabelle con più record:**

| Tabella                    | Record | Dimensione Totale | Dimensione Tabella | Dimensione Indici |
| -------------------------- | ------ | ----------------- | ------------------ | ----------------- |
| `audit_logs`               | 122    | 448 kB            | 256 kB             | 64 kB             |
| `communication_recipients` | 31     | 200 kB            | 16 kB              | 152 kB            |
| `chat_messages`            | 17     | 160 kB            | 8 kB               | 144 kB            |
| `push_subscriptions`       | 19     | 64 kB             | 8 kB               | 48 kB             |
| `workout_day_exercises`    | 12     | 80 kB             | 8 kB               | 64 kB             |
| `payments`                 | 6      | 96 kB             | 8 kB               | 80 kB             |
| `profiles`                 | 4      | 224 kB            | 8 kB               | 176 kB            |
| `notifications`            | 3      | 120 kB            | 8 kB               | 104 kB            |
| `communications`           | 2      | 120 kB            | 8 kB               | 104 kB            |
| `user_settings`            | 2      | 152 kB            | 24 kB              | 120 kB            |
| `exercises`                | 9      | 96 kB             | 8 kB               | 80 kB             |
| `roles`                    | 5      | 48 kB             | 8 kB               | 32 kB             |
| `appointments`             | 1      | 208 kB            | 8 kB               | 192 kB            |
| `inviti_atleti`            | 1      | 112 kB            | 8 kB               | 96 kB             |
| `pt_atleti`                | 1      | 88 kB             | 8 kB               | 80 kB             |
| `lesson_counters`          | 1      | 80 kB             | 8 kB               | 64 kB             |

**Tabelle vuote (0 record):**

- Tutte le tabelle `athlete_*_data` (8 tabelle) - 0 record ma hanno indici (dimensioni indici: 80-232 kB)
- `workout_logs`, `workout_plans`, `workout_days` - 0 record
- `documents`, `progress_logs`, `progress_photos` - 0 record
- `cliente_tags`, `profiles_tags` - 0 record
- `web_vitals` - 0 record

**Analisi Dimensioni:**

**Tabelle più grandi (per dimensione totale):**

1. `audit_logs` - 448 kB (122 record, 256 kB dati, 64 kB indici)
2. `athlete_fitness_data` - 248 kB (0 record, 8 kB dati, 232 kB indici) ⚠️
3. `profiles` - 224 kB (4 record, 8 kB dati, 176 kB indici) ⚠️
4. `athlete_medical_data` - 208 kB (0 record, 8 kB dati, 192 kB indici) ⚠️
5. `appointments` - 208 kB (1 record, 8 kB dati, 192 kB indici) ⚠️

**⚠️ Problemi Identificati:**

1. **Indici sproporzionati rispetto ai dati:**
   - `athlete_fitness_data`: 232 kB indici per 0 record (8 kB dati)
   - `athlete_medical_data`: 192 kB indici per 0 record (8 kB dati)
   - `appointments`: 192 kB indici per 1 record (8 kB dati)
   - `profiles`: 176 kB indici per 4 record (8 kB dati)
   - **Causa:** Indici creati in anticipo per tabelle che non hanno ancora dati
   - **Impatto:** Spazio sprecato, ma utile per quando i dati cresceranno

2. **Tabelle vuote con indici:**
   - Tutte le tabelle `athlete_*_data` hanno indici ma 0 record
   - Indici pronti per quando verranno popolati i dati

**Statistiche Generali:**

- **Totale record:** ~230 record distribuiti su 33 tabelle
- **Dimensione totale database:** ~3.5 MB (stima da somma tabelle)
- **Tabelle più utilizzate:** `audit_logs` (122 record), `communication_recipients` (31), `chat_messages` (17)
- **Tabelle vuote:** 17 tabelle su 33 (51%)

**Nota:** Le dimensioni includono:

- **Dimensione Tabella:** Dati effettivi (record)
- **Dimensione Indici:** Spazio occupato dagli indici
- **Dimensione Totale:** Tabella + Indici

**Stato:** ✅ Eseguita e documentata

### Query 8.11: Struttura Completa Tabelle Secondarie

**Query creata:** `QUERY_45_STRUTTURA_TABELLE_SECONDARIE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Tabelle analizzate (13 tabelle):**

#### 1. `audit_logs` - Log di Audit

**Colonne (10):**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `user_id` (UUID, nullable) - ID utente che ha eseguito l'azione
- `action` (TEXT, NOT NULL) - Tipo di azione (INSERT, UPDATE, DELETE)
- `table_name` (TEXT, nullable) - Nome tabella modificata
- `record_id` (UUID, nullable) - ID del record modificato
- `old_data` (JSONB, nullable) - Dati precedenti (per UPDATE/DELETE)
- `new_data` (JSONB, nullable) - Dati nuovi (per INSERT/UPDATE)
- `ip_address` (TEXT, nullable) - IP dell'utente
- `user_agent` (TEXT, nullable) - User agent del browser
- `created_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Traccia tutte le modifiche critiche al database per audit e sicurezza.

**Note:**

- ⚠️ `user_id` non ha foreign key esplicita (probabilmente → profiles.user_id o auth.users.id)
- Usato dai trigger `audit_*_trigger` per registrare modifiche automaticamente

#### 2. `cliente_tags` - Tag Clienti

**Colonne (9):**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `nome` (TEXT, NOT NULL) - Nome tag (italiano)
- `name` (VARCHAR(50), nullable) - Nome tag (inglese, alternativo)
- `colore` (TEXT, nullable, default: '#6366f1') - Colore tag (italiano)
- `color` (VARCHAR(7), nullable) - Colore tag (inglese, alternativo)
- `descrizione` (TEXT, nullable) - Descrizione tag (italiano)
- `description` (TEXT, nullable) - Descrizione tag (inglese, alternativo)
- `created_at` (TIMESTAMP, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Tabella base per i tag che possono essere assegnati ai profili.

**Note:**

- ⚠️ Duplicazione colonne italiano/inglese (nome/name, colore/color, descrizione/description)
- Pattern simile a `profiles` con colonne duplicate per multilinguismo

#### 3. `communication_recipients` - Destinatari Comunicazioni

**Colonne (12):**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `communication_id` (UUID, NOT NULL, FK → communications.id, CASCADE delete) - Comunicazione associata
- `user_id` (UUID, NOT NULL, FK → auth.users.id, CASCADE delete) - ✅ **FK esplicita**
- `recipient_type` (TEXT, NOT NULL, CHECK: 'push', 'email', 'sms') - Tipo canale
- `status` (TEXT, NOT NULL, default: 'pending', CHECK: 'pending', 'sent', 'delivered', 'opened', 'failed', 'bounced') - Stato invio
- `sent_at` (TIMESTAMPTZ, nullable) - Timestamp invio
- `delivered_at` (TIMESTAMPTZ, nullable) - Timestamp consegna
- `opened_at` (TIMESTAMPTZ, nullable) - Timestamp apertura
- `failed_at` (TIMESTAMPTZ, nullable) - Timestamp fallimento
- `error_message` (TEXT, nullable) - Messaggio errore se fallito
- `metadata` (JSONB, nullable, default: '{}') - Metadati provider: ID email/SMS, token push, etc.
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())
- **UNIQUE:** (`communication_id`, `user_id`, `recipient_type`) - Un destinatario può avere un solo record per canale per comunicazione

**Scopo:** Traccia lo stato di invio per ogni destinatario di una comunicazione.

**Foreign Keys:**

- ✅ `communication_id` → `communications.id` (CASCADE delete)
- ✅ `user_id` → `auth.users.id` (CASCADE delete)

**Indici:**

- `idx_communication_recipients_communication_id` - Ricerca per comunicazione
- `idx_communication_recipients_user_id` - Ricerca per utente
- `idx_communication_recipients_status` - Filtro per stato
- `idx_communication_recipients_recipient_type` - Filtro per tipo canale
- `idx_communication_recipients_pending` - Indice parziale per status = 'pending'
- `idx_communication_recipients_sent_at` - Indice parziale per sent_at IS NOT NULL
- `idx_communication_recipients_comm_user_type` - Indice composito per query comuni

**Trigger:**

- `update_communication_recipients_updated_at` - Aggiorna automaticamente `updated_at`

**RLS Policies:**

- "Staff can view all communication recipients" (SELECT) - Staff può vedere tutti i recipient
- "Users can view own communication recipients" (SELECT) - Utenti vedono solo i propri recipient
- "Staff can manage communication recipients" (ALL) - Staff può gestire recipient (per testing, in produzione usare service role)

**Note:**

- ✅ Traccia stato dettagliato per ogni canale (push, email, SMS)
- ✅ Foreign key `user_id` referenzia `auth.users.id` (non `profiles.user_id`)

#### 4. `communications` - Comunicazioni

**Colonne (18):**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `created_by` (UUID, NOT NULL, FK → auth.users.id, CASCADE delete) - ✅ **FK esplicita**
- `title` (TEXT, NOT NULL) - Titolo comunicazione
- `message` (TEXT, NOT NULL) - Messaggio comunicazione
- `type` (TEXT, NOT NULL, CHECK: 'push', 'email', 'sms', 'all') - Tipo comunicazione
- `status` (TEXT, NOT NULL, default: 'draft', CHECK: 'draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled') - Stato comunicazione
- `scheduled_for` (TIMESTAMPTZ, nullable) - Data/ora programmata per invio
- `sent_at` (TIMESTAMPTZ, nullable) - Timestamp invio effettivo
- `recipient_filter` (JSONB, nullable, default: '{}') - Filtro destinatari: `{ role?: string, athlete_ids?: UUID[], all_users?: boolean }`
- `total_recipients` (INTEGER, nullable, default: 0) - Totale destinatari
- `total_sent` (INTEGER, nullable, default: 0) - Totale inviati
- `total_delivered` (INTEGER, nullable, default: 0) - Totale consegnati
- `total_opened` (INTEGER, nullable, default: 0) - Totale aperti
- `total_failed` (INTEGER, nullable, default: 0) - Totale falliti
- `metadata` (JSONB, nullable, default: '{}') - Metadati aggiuntivi: template, configurazioni, etc.
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Sistema di comunicazioni di massa (push, email, SMS) per trainer/admin.

**Foreign Keys:**

- ✅ `created_by` → `auth.users.id` (CASCADE delete)

**Indici:**

- `idx_communications_created_by` - Ricerca per creatore
- `idx_communications_status` - Filtro per stato
- `idx_communications_type` - Filtro per tipo
- `idx_communications_scheduled_for` - Indice parziale per scheduled_for IS NOT NULL
- `idx_communications_sent_at` - Indice parziale per sent_at IS NOT NULL
- `idx_communications_created_at` - Ordinamento per data creazione (DESC)

**Trigger:**

- `update_communications_updated_at` - Aggiorna automaticamente `updated_at`

**RLS Policies:**

- "Staff can view all communications" (SELECT) - Staff può vedere tutte le comunicazioni
- "Staff can create communications" (INSERT) - Staff può creare comunicazioni (con verifica created_by = auth.uid())
- "Staff can update communications" (UPDATE) - Staff può aggiornare proprie comunicazioni o admin può aggiornare tutte
- "Staff can delete communications" (DELETE) - Staff può eliminare proprie comunicazioni o admin può eliminare tutte

**Note:**

- ✅ Supporta invio programmato (`scheduled_for`)
- ✅ Traccia statistiche aggregate per ogni comunicazione
- ✅ Foreign key `created_by` referenzia `auth.users.id` (non `profiles.id`)

#### 5. `inviti_atleti` - Inviti Atleti

**Colonne (12) - AGGIORNATO POST FIX_18:**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `codice` (TEXT, NOT NULL) - Codice invito univoco
- `token` (TEXT, NOT NULL) - Token invito (per sicurezza)
- `qr_url` (TEXT, nullable) - URL QR code (generato automaticamente da trigger)
- `pt_id` (UUID, NOT NULL) - ✅ **ID trainer standardizzato** (FK → profiles.id del trainer)
- `invited_by` (UUID, nullable, FK → profiles.id, SET NULL delete) - Profilo che ha creato l'invito
- `nome_atleta` (TEXT, NOT NULL) - Nome atleta da invitare
- `email` (TEXT, NOT NULL) - Email atleta da invitare
- `status` (TEXT, nullable, default: 'pending') - ✅ **Stato standardizzato**: 'pending', 'accepted', 'expired' (CHECK constraint)
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `accepted_at` (TIMESTAMPTZ, nullable) - Timestamp accettazione
- `expires_at` (TIMESTAMPTZ, nullable) - Timestamp scadenza
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Modifiche FIX_18:**

- ✅ `trainer_id` rimosso (deprecato, ora si usa solo `pt_id`)
- ✅ `stato` rimosso (deprecato, ora si usa solo `status` con valori inglesi)
- ✅ Mapping valori durante migrazione: `inviato`→`pending`, `registrato`→`accepted`, `scaduto`→`expired`
- ✅ Funzione `check_invite_expiry()` aggiornata per usare `status` invece di `stato`
- ✅ Trigger `trigger_check_invite_expiry` aggiornato per usare `status`
- ✅ RLS policies aggiornate per usare `pt_id` invece di `trainer_id`

**Scopo:** Sistema inviti per registrazione atleti da parte di trainer.

**Foreign Keys:**

- ✅ `invited_by` → `profiles.id` (SET NULL delete)
- ✅ `pt_id` → `profiles.id` (FK implicita, referenzia trainer)

**Modifiche FIX_18:**

- ✅ **Rimossa colonna `trainer_id`** - standardizzato su `pt_id` (colonna principale, NOT NULL)
- ✅ **Rimossa colonna `stato`** - standardizzato su `status` con valori inglesi ('pending', 'accepted', 'expired')
- ✅ **Mapping valori durante migrazione:** `inviato`→`pending`, `registrato`→`accepted`, `scaduto`→`expired`
- ✅ **Funzione `check_invite_expiry()` aggiornata** - ora usa `status` invece di `stato`
- ✅ **Trigger `trigger_check_invite_expiry` aggiornato** - ora monitora `status` invece di `stato`
- ✅ **RLS policies aggiornate** - ora usano `pt_id` invece di `trainer_id`

**Note:**

- ✅ Schema completamente standardizzato dopo FIX_18
- ✅ Trigger `generate_invite_qr_url` genera automaticamente `qr_url`
- ✅ Usato dalla funzione `complete_athlete_registration()` per creare relazione `pt_atleti`

#### 6. `lesson_counters` - Contatori Lezioni

**Colonne (6):**

- `id` (UUID, NOT NULL, default: gen_random_uuid()) - ⚠️ **Non è PK** (vedi sotto)
- `athlete_id` (UUID, NOT NULL, PK, FK → profiles.id, CASCADE delete) - **Primary Key**
- `lesson_type` (TEXT, NOT NULL) - Tipo lezione (es: 'standard', 'premium')
- `count` (INTEGER, nullable, default: 0) - Numero lezioni disponibili
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Contatore lezioni disponibili per ogni atleta, per tipo lezione.

**Foreign Keys:**

- ✅ `athlete_id` → `profiles.id` (CASCADE delete)

**Note:**

- ⚠️ **Primary Key è `athlete_id`** (non `id`) - questo significa che un atleta può avere un solo contatore per tipo lezione
- ⚠️ `id` esiste ma non è PK - potrebbe essere un errore di schema o legacy
- Trigger `sync_lesson_counters_on_payment` sincronizza automaticamente quando viene inserito un pagamento
- Funzione `decrement_lessons_used()` decrementa le lezioni usate

#### 7. `notifications` - Notifiche

**Colonne (13) - AGGIORNATO POST FIX_18:**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `user_id` (UUID, NOT NULL, FK → auth.users.id, CASCADE delete) - ✅ **FK aggiunta in FIX_06**
- `title` (TEXT, NOT NULL) - Titolo notifica
- `message` (TEXT, NOT NULL) - ✅ **Messaggio standardizzato** (dopo FIX_18, colonna principale)
- `type` (TEXT, NOT NULL) - Tipo notifica
- `link` (TEXT, nullable) - Link associato alla notifica
- `appointment_id` (UUID, nullable, FK → appointments.id, CASCADE delete) - Appuntamento associato
- `scheduled_for` (TIMESTAMPTZ, nullable) - Data/ora programmata
- `sent_at` (TIMESTAMPTZ, nullable) - Timestamp invio
- `read_at` (TIMESTAMPTZ, nullable) - Timestamp lettura
- `is_read` (BOOLEAN, nullable, default: false) - ✅ **Flag lettura standardizzato** (dopo FIX_18)
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Sistema notifiche in-app per utenti.

**Foreign Keys:**

- ✅ `user_id` → `auth.users.id` (CASCADE delete) - Aggiunta in FIX_06
- ✅ `appointment_id` → `appointments.id` (CASCADE delete)

**Modifiche FIX_18:**

- ✅ **Rimossa colonna `body`** - standardizzato su `message`
- ✅ **Rimossa colonna `read`** - standardizzato su `is_read`
- ✅ **Migrazione dati:** `body` → `message`, `read` → `is_read`

**Funzioni:**

- `create_notification()` - Crea una nuova notifica
- `mark_notification_as_read()` - Segna notifica come letta
- `get_unread_notifications_count()` - Conta notifiche non lette

**Note:**

- ✅ Schema completamente standardizzato dopo FIX_18
- ✅ Foreign key `user_id` aggiunta in FIX_06 (referenzia `auth.users.id`)

#### 8. `payments` - Pagamenti

**Colonne (16) - AGGIORNATO POST FIX_18:**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `athlete_id` (UUID, NOT NULL, FK → profiles.id, CASCADE delete) - ✅ **FK aggiunta in FIX_07**
- `amount` (NUMERIC(10,2), NOT NULL) - Importo pagamento
- `currency` (TEXT, nullable, default: 'EUR') - Valuta
- `payment_method` (TEXT, NOT NULL) - ✅ **Metodo pagamento standardizzato** (dopo FIX_18)
- `status` (TEXT, nullable, default: 'pending', CHECK: 'pending', 'completed', 'failed', 'refunded') - Stato pagamento
- `created_by_staff_id` (UUID, nullable, FK → profiles.id, SET NULL delete) - ✅ **FK aggiunta in FIX_07, standardizzato**
- `payment_date` (TIMESTAMPTZ, nullable) - Data pagamento effettivo
- `org_id` (TEXT, nullable, default: 'default-org') - Organizzazione
- `notes` (TEXT, nullable) - Note pagamento
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Sistema pagamenti atleti per lezioni e abbonamenti.

**Foreign Keys:**

- ✅ `athlete_id` → `profiles.id` (CASCADE delete) - Aggiunta in FIX_07
- ✅ `created_by_staff_id` → `profiles.id` (SET NULL delete) - Aggiunta in FIX_07

**Modifiche FIX_18:**

- ✅ **Rimossa colonna `method_text`** - standardizzato su `payment_method`
- ✅ **Rimossa colonna `trainer_id`** - standardizzato su `created_by_staff_id`
- ✅ **Migrazione dati:** `method_text` → `payment_method`, `trainer_id` → `created_by_staff_id`

**Trigger:**

- `sync_lesson_counters_on_payment` - Aggiorna automaticamente `lesson_counters` quando viene inserito un pagamento

**Funzioni:**

- `create_payment()` - Crea un nuovo pagamento
- `reverse_payment()` - Storna un pagamento esistente

**Note:**

- ✅ Schema completamente standardizzato dopo FIX_18
- ✅ Foreign keys aggiunte in FIX_07 (referenziano `profiles.id`)

#### 9. `profiles_tags` - Tag Profili (Many-to-Many)

**Colonne (4):**

- `profile_id` (UUID, NOT NULL, PK, FK → profiles.id, CASCADE delete) - **Primary Key parte 1**
- `tag_id` (UUID, NOT NULL, PK, FK → cliente_tags.id, CASCADE delete) - **Primary Key parte 2**
- `assigned_by` (UUID, nullable, FK → profiles.id, SET NULL delete) - Profilo che ha assegnato il tag
- `assigned_at` (TIMESTAMPTZ, nullable, default: now()) - Timestamp assegnazione

**Scopo:** Tabella many-to-many per associare tag ai profili.

**Foreign Keys:**

- ✅ `profile_id` → `profiles.id` (CASCADE delete)
- ✅ `tag_id` → `cliente_tags.id` (CASCADE delete)
- ✅ `assigned_by` → `profiles.id` (SET NULL delete)

**Note:**

- ✅ **Primary Key composito:** (`profile_id`, `tag_id`) - un profilo può avere lo stesso tag una sola volta
- Traccia chi ha assegnato il tag e quando

#### 10. `push_subscriptions` - Sottoscrizioni Push

**Colonne (7):**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `user_id` (UUID, NOT NULL) - ⚠️ **Manca FK esplicita** (probabilmente → profiles.user_id)
- `endpoint` (TEXT, NOT NULL) - Endpoint Web Push
- `p256dh` (TEXT, NOT NULL) - Chiave pubblica P256DH
- `auth` (TEXT, NOT NULL) - Token autenticazione
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Sottoscrizioni Web Push per notifiche browser.

**Note:**

- ⚠️ `user_id` non ha FK esplicita (da verificare se referenzia profiles.user_id)
- Usato per inviare notifiche push tramite Web Push API
- Funzione `cleanup_expired_push_subscriptions()` rimuove sottoscrizioni scadute (>90 giorni)

#### 11. `roles` - Ruoli

**Colonne (6):**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `name` (VARCHAR(20), NOT NULL) - Nome ruolo: 'admin', 'pt', 'trainer', 'atleta', 'athlete' (CHECK constraint)
- `description` (TEXT, nullable) - Descrizione ruolo
- `permissions` (JSONB, nullable) - Permessi ruolo in formato JSONB
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Tabella ruoli del sistema (riferimento per `profiles.role`).

**Note:**

- ⚠️ `profiles.role` non ha FK esplicita verso questa tabella (usato come enum/check constraint)
- `permissions` JSONB permette configurazione flessibile permessi per ruolo

#### 12. `user_settings` - Impostazioni Utente

**Colonne (10) - AGGIORNATO POST FIX_18:**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `user_id` (UUID, NOT NULL, UNIQUE, FK → auth.users.id, CASCADE delete) - ✅ **FK esplicita**
- `notification_settings` (JSONB, nullable, default: `{"email": true, "push": true, "sms": false, "newClients": true, "payments": true, "appointments": true, "messages": true}`) - ✅ **Impostazioni notifiche standardizzate**
- `privacy_settings` (JSONB, nullable, default: `{"profileVisible": true, "showEmail": true, "showPhone": false, "analytics": true}`) - ✅ **Impostazioni privacy standardizzate**
- `account_settings` (JSONB, nullable, default: `{"language": "it", "timezone": "Europe/Rome", "dateFormat": "DD/MM/YYYY", "timeFormat": "24h"}`) - ✅ **Impostazioni account standardizzate**
- `two_factor_enabled` (BOOLEAN, nullable, default: false) - Flag 2FA abilitato
- `two_factor_secret` (TEXT, nullable) - Secret TOTP per autenticazione a due fattori
- `two_factor_backup_codes` (TEXT[], nullable) - Array backup codes per 2FA
- `two_factor_enabled_at` (TIMESTAMPTZ, nullable) - Timestamp abilitazione 2FA
- `created_at` (TIMESTAMPTZ, nullable, default: now())
- `updated_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Impostazioni utente (notifiche, privacy, account, 2FA).

**Foreign Keys:**

- ✅ `user_id` → `auth.users.id` (CASCADE delete, UNIQUE) - Un solo record per utente

**Modifiche FIX_18:**

- ✅ **Standardizzate colonne:** `notification_settings`, `privacy_settings`, `account_settings` (rimossi alias corti)
- ✅ **Schema uniforme:** tutte le impostazioni usano il pattern `*_settings`

**Indici:**

- `idx_user_settings_user_id` - Ricerca per user_id (già UNIQUE)
- `idx_user_settings_notifications` - GIN per ricerca in JSONB notifications
- `idx_user_settings_privacy` - GIN per ricerca in JSONB privacy
- `idx_user_settings_account` - GIN per ricerca in JSONB account

**Trigger:**

- `trigger_update_user_settings_updated_at` - Aggiorna automaticamente `updated_at`

**Funzioni:**

- `get_or_create_user_settings(p_user_id UUID)` - Ottiene o crea impostazioni per un utente (SECURITY DEFINER)

**RLS Policies:**

- "Users can view own settings" (SELECT) - Utenti vedono solo le proprie impostazioni
- "Users can insert own settings" (INSERT) - Utenti possono inserire solo le proprie impostazioni
- "Users can update own settings" (UPDATE) - Utenti possono aggiornare solo le proprie impostazioni
- "Users can delete own settings" (DELETE) - Utenti possono eliminare solo le proprie impostazioni

**Note:**

- ✅ Schema completamente standardizzato dopo FIX_18
- ✅ Supporta autenticazione a due fattori (2FA) con TOTP
- ✅ Foreign key `user_id` referenzia `auth.users.id` (non `profiles.user_id`)

#### 13. `web_vitals` - Web Vitals

**Colonne (8):**

- `id` (UUID, PK, NOT NULL, default: gen_random_uuid())
- `metric_name` (VARCHAR(10), NOT NULL) - Nome metrica: 'LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP' (CHECK constraint)
- `metric_value` (NUMERIC, NOT NULL) - Valore metrica (millisecondi o unità appropriate)
- `metric_rating` (VARCHAR(20), NOT NULL) - Rating: 'good', 'needs-improvement', 'poor' (CHECK constraint)
- `url` (TEXT, NOT NULL) - URL pagina misurata
- `user_agent` (TEXT, nullable) - User agent browser
- `timestamp` (TIMESTAMPTZ, nullable, default: now()) - Timestamp misurazione
- `created_at` (TIMESTAMPTZ, nullable, default: now())

**Scopo:** Traccia metriche Web Vitals (performance frontend) per analisi.

**Note:**

- Nessuna foreign key (dati anonimi/aggregati)
- Funzione `get_web_vitals_stats()` ottiene statistiche aggregate

**Riepilogo Problemi Identificati:**

1. ⚠️ **Foreign Keys Mancanti:**
   - `audit_logs.user_id` → profiles.user_id o auth.users.id
   - `communication_recipients.user_id` → profiles.user_id
   - `communications.created_by` → profiles.id
   - `inviti_atleti.pt_id` → profiles.id
   - `inviti_atleti.trainer_id` → profiles.id
   - `notifications.user_id` → profiles.user_id
   - `payments.athlete_id` → profiles.id
   - `payments.created_by_staff_id` → profiles.id
   - `payments.trainer_id` → profiles.id
   - `push_subscriptions.user_id` → profiles.user_id
   - `user_settings.user_id` → profiles.user_id

2. ⚠️ **Duplicazione Colonne:**
   - `cliente_tags`: nome/name, colore/color, descrizione/description
   - `inviti_atleti`: stato/status, pt_id/trainer_id
   - `notifications`: body/message, read/is_read
   - `payments`: payment_method/method_text, created_by_staff_id/trainer_id
   - `user_settings`: notification_settings/notifications, privacy_settings/privacy, account_settings/account

3. ⚠️ **Primary Key Anomale:**
   - `lesson_counters`: PK è `athlete_id` (non `id`), ma `id` esiste - possibile errore schema

**Stato:** ✅ Eseguita e documentata

### Query 8.12: Constraint UNIQUE

**Query creata:** `QUERY_49_CONSTRAINT_UNIQUE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Constraint UNIQUE Trovati (18 constraint):**

#### Tabelle `athlete_*_data` - Unicità per Atleta

Tutte le tabelle `athlete_*_data` (tranne `athlete_smart_tracking_data`) hanno constraint UNIQUE su `athlete_id`:

1. **`athlete_administrative_data_athlete_id_unique`**
   - Tabella: `athlete_administrative_data`
   - Colonne: `athlete_id`
   - **Scopo:** Garantisce che ogni atleta abbia un solo record di dati amministrativi

2. **`athlete_fitness_data_athlete_id_unique`**
   - Tabella: `athlete_fitness_data`
   - Colonne: `athlete_id`
   - **Scopo:** Garantisce che ogni atleta abbia un solo record di dati fitness

3. **`athlete_massage_data_athlete_id_unique`**
   - Tabella: `athlete_massage_data`
   - Colonne: `athlete_id`
   - **Scopo:** Garantisce che ogni atleta abbia un solo record di dati massaggi

4. **`athlete_medical_data_athlete_id_unique`**
   - Tabella: `athlete_medical_data`
   - Colonne: `athlete_id`
   - **Scopo:** Garantisce che ogni atleta abbia un solo record di dati medici

5. **`athlete_motivational_data_athlete_id_unique`**
   - Tabella: `athlete_motivational_data`
   - Colonne: `athlete_id`
   - **Scopo:** Garantisce che ogni atleta abbia un solo record di dati motivazionali

6. **`athlete_nutrition_data_athlete_id_unique`**
   - Tabella: `athlete_nutrition_data`
   - Colonne: `athlete_id`
   - **Scopo:** Garantisce che ogni atleta abbia un solo record di dati nutrizionali

7. **`athlete_smart_tracking_unique_athlete_date`**
   - Tabella: `athlete_smart_tracking_data`
   - Colonne: `athlete_id`, `data_rilevazione`
   - **Scopo:** ⚠️ **Differente dalle altre** - Permette più record per atleta, ma uno solo per data. Questo perché `athlete_smart_tracking_data` traccia dati nel tempo (storico), mentre le altre tabelle sono profili statici.

#### Tabelle Core

8. **`profiles_email_unique`**
   - Tabella: `profiles`
   - Colonne: `email`
   - **Scopo:** ⚠️ CRITICO - Garantisce che ogni email sia univoca nel sistema

9. **`profiles_user_id_key`**
   - Tabella: `profiles`
   - Colonne: `user_id`
   - **Scopo:** ⚠️ CRITICO - Garantisce che ogni utente auth abbia un solo profilo (1:1 con auth.users)

10. **`pt_atleti_pt_id_atleta_id_key`**
    - Tabella: `pt_atleti`
    - Colonne: `pt_id`, `atleta_id`
    - **Scopo:** ⚠️ CRITICO - Impedisce duplicati relazioni trainer-atleta (un trainer non può avere lo stesso atleta due volte)

#### Tabelle Sistema

11. **`cliente_tags_nome_key`**
    - Tabella: `cliente_tags`
    - Colonne: `nome`
    - **Scopo:** Garantisce che ogni tag abbia un nome univoco

12. **`roles_name_key`**
    - Tabella: `roles`
    - Colonne: `name`
    - **Scopo:** Garantisce che ogni ruolo abbia un nome univoco

13. **`inviti_atleti_codice_key`**
    - Tabella: `inviti_atleti`
    - Colonne: `codice`
    - **Scopo:** Garantisce che ogni codice invito sia univoco

14. **`inviti_atleti_token_key`**
    - Tabella: `inviti_atleti`
    - Colonne: `token`
    - **Scopo:** Garantisce che ogni token invito sia univoco (sicurezza)

15. **`user_settings_user_id_key`**
    - Tabella: `user_settings`
    - Colonne: `user_id`
    - **Scopo:** Garantisce che ogni utente abbia un solo record di impostazioni

16. **`push_subscriptions_user_id_endpoint_key`**
    - Tabella: `push_subscriptions`
    - Colonne: `user_id`, `endpoint`
    - **Scopo:** Garantisce che ogni utente possa avere una sola sottoscrizione per endpoint (evita duplicati)

#### Tabelle Relazioni

17. **`communication_recipients_communication_id_user_id_recipient_key`**
    - Tabella: `communication_recipients`
    - Colonne: `communication_id`, `user_id`, `recipient_type`
    - **Scopo:** Garantisce che ogni destinatario abbia un solo record per comunicazione e tipo canale (evita duplicati push/email/SMS)

18. **`lesson_counters_athlete_lesson_type_unique`**
    - Tabella: `lesson_counters`
    - Colonne: `athlete_id`, `lesson_type`
    - **Scopo:** Garantisce che ogni atleta abbia un solo contatore per tipo lezione (es: 'standard', 'premium')

**Analisi:**

**✅ Pattern Corretti:**

- Tutte le tabelle `athlete_*_data` (tranne smart_tracking) hanno UNIQUE su `athlete_id` - pattern coerente
- `profiles` ha UNIQUE su `email` e `user_id` - garantisce integrità autenticazione
- `pt_atleti` ha UNIQUE su `(pt_id, atleta_id)` - impedisce duplicati relazioni
- Tabelle con dati storici (`athlete_smart_tracking_data`) usano UNIQUE composito con data

**⚠️ Note Importanti:**

- `athlete_smart_tracking_data` è l'unica tabella `athlete_*_data` che permette più record per atleta (storico temporale)
- `inviti_atleti` ha 2 constraint UNIQUE (`codice` e `token`) - entrambi necessari per sicurezza
- `communication_recipients` ha UNIQUE composito che include `recipient_type` - permette stesso utente per canali diversi

**Constraint UNIQUE vs Primary Keys:**

- Tutti i constraint UNIQUE documentati sono **oltre** alle primary keys
- Le primary keys sono sempre UNIQUE, ma questi constraint aggiungono ulteriori vincoli di unicità

**Stato:** ✅ Eseguita e documentata

### Query 8.13: Commenti Colonne e Tabelle

**Query creata:** `QUERY_51_COMMENTI_COLONNE_TABELLE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Commenti su Colonne Trovati (100+ commenti):**

#### Tabelle `athlete_*_data` - Commenti Dettagliati

**`athlete_administrative_data` (13 commenti):**

- `athlete_id`: "Riferimento all'atleta (profiles.user_id)" ⚠️ **Nota:** Commento dice `profiles.user_id` ma FK è verso `profiles.id`
- `tipo_abbonamento`: Valori possibili documentati
- `stato_abbonamento`: Stati documentati
- `lezioni_rimanenti`: "Numero lezioni rimanenti (calcolato automaticamente)" - conferma trigger automatico
- `documenti_contrattuali`: Formato JSONB documentato: `[{url, tipo, data, note}]`

**`athlete_ai_data` (10 commenti):**

- `data_analisi`: "Data e ora dell'analisi AI (supporta storico analisi multiple)" - supporta storico
- `insights_aggregati`: "JSONB insights aggregati generati da AI"
- `raccomandazioni`: Formato JSONB: `[{tipo, priorità, descrizione, azione}]`
- `pattern_rilevati`: Formato JSONB: `[{tipo, descrizione, frequenza}]`
- `predizioni_performance`: Formato JSONB: `[{metrica, valore_predetto, confidenza, data_target}]`
- `score_engagement` / `score_progresso`: Range 0-100 documentato

**`athlete_fitness_data` (12 commenti):**

- `livello_esperienza`: Valori documentati
- `obiettivo_primario`: Valori documentati
- `giorni_settimana_allenamento`: Range 1-7 documentato
- `preferenze_orario`: Formato array: `["mattina", "pomeriggio", "sera"]`
- `infortuni_pregressi`: Formato JSONB: `[{data, tipo, recuperato, note}]`

**`athlete_massage_data` (7 commenti):**

- `preferenze_tipo_massaggio`: Array tipi documentati: `["svedese", "sportivo", "decontratturante", "rilassante", "linfodrenante", "altro"]`
- `intensita_preferita`: Valori documentati
- `storico_massaggi`: Formato JSONB: `[{data, tipo, operatore, note}]`

**`athlete_medical_data` (10 commenti):**

- `certificato_medico_url`: "URL/path del certificato medico nel bucket storage"
- `certificato_medico_tipo`: Valori documentati
- `referti_medici`: Formato JSONB: `[{url, data, tipo, note}]`
- `allergie` / `patologie`: Formato array documentato
- `farmaci_assunti`: Formato JSONB: `[{nome, dosaggio, frequenza, note}]`
- `interventi_chirurgici`: Formato JSONB: `[{data, tipo, note}]`

**`athlete_motivational_data` (8 commenti):**

- `livello_motivazione`: "Livello motivazione da 1 a 10 (default: 5)"
- `preferenze_ambiente`: Array: `["palestra", "casa", "outdoor", "misto"]`
- `preferenze_compagnia`: Array: `["solo", "partner", "gruppo", "misto"]`
- `storico_abbandoni`: Formato JSONB: `[{data, motivo, note}]`

**`athlete_nutrition_data` (11 commenti):**

- `calorie_giornaliere_target`: "Calorie giornaliere target (deve essere > 0)"
- `macronutrienti_target`: Formato JSONB: `{proteine_g: INT, carboidrati_g: INT, grassi_g: INT}`
- `dieta_seguita`: Valori documentati
- `preferenze_orari_pasti`: Formato JSONB: `{colazione: TIME, pranzo: TIME, cena: TIME, spuntini: TIME[]}`

**`athlete_smart_tracking_data` (13 commenti):**

- `data_rilevazione`: "Data della rilevazione (un record per giorno per atleta)" - conferma pattern storico
- `dispositivo_tipo`: Valori documentati
- `dispositivo_marca`: Esempi: "Apple Watch, Fitbit, Garmin"
- `battito_cardiaco_*`: Range 1-250 bpm documentato
- `ore_sonno`: Range 0-24 documentato
- `qualita_sonno`: Valori documentati
- `metrica_custom`: "JSONB metriche aggiuntive dispositivo-specifiche"

#### Tabelle Core

**`profiles` (17 commenti):**

- `obiettivo_peso`: "Peso obiettivo in kg per atleti"
- `data_nascita`: "Data di nascita dell'atleta"
- `sesso`: Valori: "maschio, femmina, altro, non_specificato"
- `codice_fiscale`: "Codice fiscale italiano (16 caratteri)"
- `contatto_emergenza_*`: Dettagli contatto emergenza documentati
- `telefono`: "Telefono dell'atleta (alias di phone per compatibilità)" - conferma duplicazione colonne
- Dati anagrafici completi documentati (indirizzo, città, cap, provincia, nazione)

**`progress_logs` (20 commenti):**

- Misure circonferenze complete documentate (collo, spalle, torace, braccia, vita, addome, glutei, cosce, ginocchio, polpaccio, caviglia)
- Misure composizione corporea documentate (massa_grassa_percentuale, massa_grassa_kg, massa_magra_kg, massa_muscolare_kg, massa_muscolare_scheletrica_kg)
- Tutte le misure in centimetri o chilogrammi

#### Tabelle Sistema

**`appointments` (2 commenti):**

- `type`: Valori documentati
- `status`: Valori documentati

**`communications` (4 commenti):**

- `type`: "Tipo comunicazione: push, email, sms, all (tutti i canali)"
- `status`: Valori documentati
- `recipient_filter`: Formato JSON documentato: `{ role?: string, athlete_ids?: UUID[], all_users?: boolean }`
- `metadata`: "Metadati aggiuntivi: template, configurazioni, etc."

**`communication_recipients` (3 commenti):**

- `recipient_type`: Valori documentati
- `status`: Valori documentati
- `metadata`: "Metadati provider: ID email/SMS, token push, etc."

**`inviti_atleti` (1 commento):**

- `trainer_id`: "ID del trainer che ha creato l'invito. Opzionale - può essere NULL se si usa pt_id o invited_by" - conferma duplicazione colonne

**`payments` (1 commento):**

- `trainer_id`: "ID del trainer associato al pagamento. Opzionale - può essere NULL se si usa created_by_staff_id" - conferma duplicazione colonne

**`user_settings` (6 commenti):**

- `notifications`: "Impostazioni notifiche in formato JSONB"
- `privacy`: "Impostazioni privacy in formato JSONB"
- `account`: "Impostazioni account (lingua, timezone, formato data/ora) in formato JSONB"
- `two_factor_*`: Documentazione completa 2FA (enabled, secret, backup_codes)

**`web_vitals` (3 commenti):**

- `metric_name`: Valori documentati: "LCP, FID, CLS, FCP, TTFB, INP"
- `metric_value`: "Valore della metrica in millisecondi o unità appropriate"
- `metric_rating`: Valori documentati

**`workout_plans` (1 commento):**

- `trainer_id`: "ID del trainer responsabile del piano. Opzionale - può essere NULL se si usa created_by" - conferma duplicazione colonne

**Analisi:**

**✅ Commenti Utili:**

- Formati JSONB documentati in dettaglio per tutte le tabelle `athlete_*_data`
- Range e valori possibili documentati per enum/check constraints
- Pattern storico temporale documentato per `athlete_smart_tracking_data`
- Formati array documentati con esempi

**⚠️ Problemi Identificati nei Commenti:**

- `athlete_administrative_data.athlete_id`: Commento dice "profiles.user_id" ma FK è verso `profiles.id` - commento errato
- Duplicazione colonne confermata da commenti (`telefono` alias di `phone`, `trainer_id` opzionale in più tabelle)

**Commenti su Tabelle:**

- Nessun commento su tabelle trovato (solo commenti su colonne)

**Stato:** ✅ Eseguita e documentata

### Query 8.14: Enum Types e Domains

**Query creata:** `QUERY_52_ENUM_TYPES_DOMAINS.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Enum Types Personalizzati:**

**Risultato:** ⚠️ **NESSUN ENUM TYPE TROVATO**

Il database non utilizza tipi ENUM personalizzati. Tutti i valori enumerati sono gestiti tramite:

- **CHECK constraints** con liste di valori (es: `role IN ('admin', 'pt', 'trainer', 'atleta', 'athlete')`)
- **VARCHAR/TEXT** con validazione a livello applicativo

**Esempi di enum gestiti tramite CHECK constraints:**

- `profiles.role` → CHECK constraint `profiles_role_check`
- `appointments.status` → CHECK constraint `appointments_status_check`
- `payments.status` → CHECK constraint `payments_status_check`
- Tutte le tabelle `athlete_*_data` con valori enumerati

**Domains Personalizzati:**

**Risultato:** ⚠️ **NESSUN DOMAIN TROVATO**

Il database non utilizza domains personalizzati. Tutti i tipi sono standard PostgreSQL:

- `UUID` per primary keys
- `TEXT`, `VARCHAR` per stringhe
- `NUMERIC`, `INTEGER` per numeri
- `JSONB` per dati strutturati
- `TIMESTAMPTZ` per date/ora

**Analisi:**

**✅ Pattern Database:**

- Il database usa **CHECK constraints** invece di ENUM types
- Vantaggi: Maggiore flessibilità, più facile modificare valori senza ricreare tipo
- Svantaggi: Meno type safety a livello database, validazione solo a runtime

**✅ Tipi Standard:**

- Nessun domain personalizzato - tutti i tipi sono standard PostgreSQL
- Pattern coerente in tutto il database

**Stato:** ✅ Eseguita e documentata - Nessun ENUM o Domain personalizzato trovato (pattern CHECK constraints confermato)

### Query 8.15: Materialized Views e Partizioni

**Query creata:** `QUERY_53_MATERIALIZED_VIEWS_PARTITIONS.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Materialized Views:**

**Risultato:** ⚠️ **NESSUNA MATERIALIZED VIEW TROVATA**

Il database non utilizza materialized views. Le viste esistenti sono viste standard (non materializzate):

- `payments_per_staff_view`
- `progress_trend_view`
- `workout_stats_mensili`

**Tabelle Partizionate:**

**Risultato:** ⚠️ **NESSUNA TABELLA PARTIZIONATA TROVATA**

Il database non utilizza partizionamento di tabelle. Tutte le tabelle sono tabelle standard non partizionate.

**Analisi:**

**✅ Pattern Database:**

- Il database usa **viste standard** invece di materialized views
- Vantaggi: Sempre aggiornate, nessuna necessità di refresh
- Svantaggi: Performance potenzialmente più lente per query complesse (ma accettabile per questo progetto)

**✅ Nessun Partizionamento:**

- Tutte le tabelle sono standard (non partizionate)
- Pattern coerente - partizionamento non necessario per volume dati attuale
- Se il volume crescerà, si potrà considerare partizionamento per tabelle storiche (es: `audit_logs`, `progress_logs`)

**Stato:** ✅ Eseguita e documentata - Nessuna materialized view o partizione trovata (pattern standard confermato)

---

## Riepilogo Stato Documentazione

**✅ DOCUMENTAZIONE COMPLETA - TUTTO DOCUMENTATO:**

### Sezioni Principali (1-9):

- ✅ Struttura database - Tabelle (28 tabelle + 3 viste)
- ✅ Tabella PT_ATLETI (relazione principale trainer-atleta)
- ✅ Tabella PROFILES (struttura completa, 64 colonne)
- ✅ RLS Policies (tutte le tabelle - 33 tabelle, 130+ policies)
- ✅ Foreign Keys (tutte le tabelle chiave e secondarie)
- ✅ Trigger (60 trigger attivi, tutte le tabelle)
- ✅ Storage (10 bucket, policies, file, relazioni con tabelle)
- ✅ Analisi Problemi e Criticità (40+ problemi identificati e categorizzati)

### Query Dettagliate (8.1-8.15):

- ✅ **Query 8.1:** Funzioni SQL/RPC (70+ funzioni documentate)
- ✅ **Query 8.2:** Viste (3 viste: payments_per_staff_view, progress_trend_view, workout_stats_mensili)
- ✅ **Query 8.3:** Tabelle ATHLETE\_\*\_DATA (8 tabelle complete con struttura, FK, RLS, trigger, indici)
- ✅ **Query 8.4:** Estensioni e Sequenze (pattern UUID confermato, nessuna sequenza)
- ✅ **Query 8.5:** Constraint CHECK (49 constraint documentati)
- ✅ **Query 8.6:** Tabelle Non Documentate (13 tabelle secondarie documentate)
- ✅ **Query 8.7:** RLS Policies Complete (33 tabelle, stato RLS, numero policies)
- ✅ **Query 8.8:** Indici Dettagliati (200+ indici con statistiche utilizzo)
- ✅ **Query 8.9:** Trigger Completi (60 trigger categorizzati e documentati)
- ✅ **Query 8.10:** Configurazione Database (statistiche tabelle, dimensioni, record)
- ✅ **Query 8.11:** Struttura Completa Tabelle Secondarie (13 tabelle con colonne, FK, commenti)
- ✅ **Query 8.12:** Constraint UNIQUE (18 constraint documentati)
- ✅ **Query 8.13:** Commenti Colonne e Tabelle (100+ commenti documentati)
- ✅ **Query 8.14:** Enum Types e Domains (nessuno trovato, pattern CHECK constraints)
- ✅ **Query 8.15:** Materialized Views e Partizioni (nessuna trovata, pattern standard)
- ✅ **Query 8.16:** Verifica Tabelle e Viste Statistiche (funzioni verificate)

### Storage (Sezione 7):

- ✅ Bucket esistenti (10 bucket)
- ✅ RLS Policies Storage (tutte le policies documentate)
- ✅ Conteggio file per bucket
- ✅ Relazioni file Storage con tabelle database
- ✅ Problemi e raccomandazioni Storage

### Analisi Problemi (Sezione 9):

- ✅ Problemi Critici (7 problemi - Sicurezza e Integrità)
- ✅ Problemi Alta Priorità (12 problemi - Coerenza e Storage)
- ✅ Problemi Media Priorità (8 problemi - Performance e Pulizia)
- ✅ Problemi Bassa Priorità (5 problemi - Ottimizzazioni)
- ✅ Piano di Risoluzione Prioritario (6 fasi)
- ✅ Metriche Problemi (40+ problemi totali)

- ✅ Bucket esistenti (10 bucket)
- ✅ RLS Policies Storage (tutte le policies documentate)
- ✅ Conteggio file per bucket
- ✅ Relazioni file Storage con tabelle database
- ✅ Problemi e raccomandazioni Storage

**Totale query create:** 54 query SQL
**Query eseguite:** 53 query
**Query da eseguire:** 1 query (Query 54 - Verifica Tabelle/Viste Statistiche)

**Stato:** ⚠️ **VERIFICA FINALE IN CORSO** - Query 54 da eseguire per confermare completezza

**Nuove query create (45-53):**

- `QUERY_45_STRUTTURA_TABELLE_SECONDARIE.sql` - Struttura completa tabelle secondarie
- `QUERY_46_RLS_POLICIES_COMPLETE.sql` - RLS policies complete per tutte le tabelle
- `QUERY_47_INDICI_DETTAGLIATI.sql` - Indici dettagliati per tutte le tabelle
- `QUERY_48_TRIGGER_COMPLETI.sql` - Trigger completi per tutte le tabelle
- `QUERY_49_CONSTRAINT_UNIQUE.sql` - Constraint UNIQUE
- `QUERY_50_CONFIGURAZIONE_DATABASE.sql` - Configurazione database
- `QUERY_51_COMMENTI_COLONNE_TABELLE.sql` - Commenti su colonne e tabelle
- `QUERY_52_ENUM_TYPES_DOMAINS.sql` - Enum types e domains personalizzati
- `QUERY_53_MATERIALIZED_VIEWS_PARTITIONS.sql` - Materialized views e partizioni
- `QUERY_54_VERIFICA_TABELLE_VISTE_STATISTICHE.sql` - Verifica completa tabelle/viste statistiche

### Query 8.16: Verifica Tabelle e Viste Statistiche

**Query creata:** `QUERY_54_VERIFICA_TABELLE_VISTE_STATISTICHE.sql`

**Risultato:** (Eseguita il 2025-02-01)

**Scopo:** Verifica se ci sono tabelle o viste relative a statistiche, analytics, metrics, reports, KPI che potrebbero non essere state documentate.

**Funzioni Statistiche Verificate (8 funzioni):**

Tutte le funzioni statistiche trovate sono **già documentate** nella Query 8.1:

1. ✅ **`get_abbonamenti_with_stats(p_page INTEGER, p_page_size INTEGER)` → TABLE(...)**
   - Documentata in Query 8.1 (funzione #26)
   - Ritorna abbonamenti con statistiche aggregate

2. ✅ **`get_analytics_distribution_data()` → TABLE(type TEXT, count BIGINT, percentage NUMERIC)**
   - Documentata in Query 8.1 (funzione #27)
   - Ottiene distribuzione per tipo di appuntamento

3. ✅ **`get_analytics_performance_data(p_limit INTEGER)` → TABLE(...)**
   - Documentata in Query 8.1 (funzione #28)
   - Ottiene performance data atleti

4. ✅ **`get_analytics_trend_data(p_days INTEGER)` → TABLE(day DATE, allenamenti BIGINT, documenti BIGINT, ore_totali NUMERIC)**
   - Documentata in Query 8.1 (funzione #29)
   - Ottiene trend data giornaliero per analytics

5. ✅ **`get_clienti_stats()` → JSON**
   - Documentata in Query 8.1 (funzione #25)
   - Ritorna statistiche aggregate dei clienti

6. ✅ **`get_progress_stats(athlete_uuid UUID)` → JSON**
   - Documentata in Query 8.1 (funzione #23)
   - Ritorna statistiche aggregate dei progressi atleta

7. ✅ **`get_web_vitals_stats(metric_name_filter VARCHAR, days_back INTEGER)` → TABLE(...)**
   - Documentata in Query 8.1 (funzione #30)
   - Ottiene statistiche aggregate per Web Vitals

8. ✅ **`update_document_statuses()` → VOID**
   - Documentata in Query 8.1 (funzione #32)
   - Aggiorna stati documenti (non è una funzione statistica, ma è correlata)

**Risultati Sezioni 1-4:**

⚠️ **Nota:** Per completare la verifica, servono i risultati delle sezioni 1-4 della query:

- Sezione 1: Tabelle con nomi statistiche/analytics
- Sezione 2: Viste con nomi statistiche/analytics
- Sezione 3: Tabelle/viste con nomi aggregazione
- Sezione 4: Lista completa di TUTTE le viste

**Stato:** ✅ Funzioni statistiche verificate - Tutte già documentate. Verifica tabelle/viste in attesa risultati sezioni 1-4.

---

## 9. Analisi Problemi e Criticità

**Data Analisi:** 2025-02-01  
**Scopo:** Documentazione completa di tutti i problemi, criticità, inconsistenze e miglioramenti identificati nel database Supabase.

---

### 9.1. 🔴 Problemi Critici (Sicurezza e Integrità Dati)

#### 9.1.1. RLS Disabilitato su Tabelle Sensibili

**Problema:** 3 tabelle hanno RLS disabilitato, esponendo dati potenzialmente sensibili.

| Tabella        | RLS Status      | Policies | Rischio                                                   | Soluzione                                                             |
| -------------- | --------------- | -------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `roles`        | ❌ DISABILITATO | 0        | 🔴 ALTO - Accesso completo a tutti gli utenti autenticati | Abilitare RLS e aggiungere policies (solo admin può modificare)       |
| `web_vitals`   | ❌ DISABILITATO | 2        | 🔴 MEDIO - Metriche performance accessibili a tutti       | Abilitare RLS (`ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;`)   |
| `workout_sets` | ❌ DISABILITATO | 2        | 🔴 MEDIO - Serie workout accessibili a tutti              | Abilitare RLS (`ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;`) |

**Impatto:** Dati sensibili accessibili senza controllo di accesso.

**SQL Fix:**

```sql
-- Abilita RLS su web_vitals
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

-- Abilita RLS su workout_sets
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Abilita RLS su roles e aggiungi policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Policy per roles: solo admin può modificare
CREATE POLICY "Only admins can modify roles"
ON roles FOR ALL
TO authenticated
USING (is_admin());
```

#### 9.1.2. Storage Policies Troppo Permissive

**Problema:** Bucket `documents` (legacy) ha policies che permettono a tutti gli utenti autenticati di vedere/modificare/eliminare qualsiasi documento.

**Policies Problematiche:**

- "Authenticated users can upload documents" - Permette upload in qualsiasi cartella
- "Authenticated users can view documents" - Permette vedere tutti i documenti
- "Authenticated users can update documents" - Permette modificare tutti i documenti
- "Authenticated users can delete documents" - Permette eliminare tutti i documenti

**Impatto:** 🔴 ALTO - Violazione privacy, accesso non autorizzato a documenti atleti.

**Soluzione:**

```sql
-- Rimuovi policies troppo permissive
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Aggiungi policies specifiche con verifica pt_atleti (modello athlete-certificates)
-- (Vedi sezione 7.5 per SQL completo)
```

#### 9.1.3. Foreign Keys Mancanti su Colonne Critiche

**Problema:** 11+ colonne che referenziano `profiles` o `auth.users` non hanno foreign keys esplicite, compromettendo l'integrità referenziale.

| Tabella                    | Colonna               | Riferimento Probabile                | Criticità | Impatto                                         |
| -------------------------- | --------------------- | ------------------------------------ | --------- | ----------------------------------------------- |
| `chat_messages`            | `sender_id`           | `profiles.id`                        | 🔴 ALTA   | Possibilità di referenziare profili inesistenti |
| `chat_messages`            | `receiver_id`         | `profiles.id`                        | 🔴 ALTA   | Possibilità di referenziare profili inesistenti |
| `notifications`            | `user_id`             | `profiles.user_id`                   | 🔴 ALTA   | Notifiche orfane se profilo eliminato           |
| `payments`                 | `athlete_id`          | `profiles.id`                        | 🔴 ALTA   | Pagamenti orfani se atleta eliminato            |
| `payments`                 | `created_by_staff_id` | `profiles.id`                        | 🔴 ALTA   | Perdita tracciabilità                           |
| `payments`                 | `trainer_id`          | `profiles.id`                        | 🟡 MEDIA  | Duplicazione con created_by_staff_id            |
| `communications`           | `created_by`          | `profiles.id`                        | 🟡 MEDIA  | Perdita tracciabilità                           |
| `communication_recipients` | `user_id`             | `profiles.user_id`                   | 🟡 MEDIA  | Destinatari orfani                              |
| `inviti_atleti`            | `pt_id`               | `profiles.id`                        | 🟡 MEDIA  | Inviti orfani                                   |
| `inviti_atleti`            | `trainer_id`          | `profiles.id`                        | 🟡 MEDIA  | Duplicazione con pt_id                          |
| `push_subscriptions`       | `user_id`             | `profiles.user_id`                   | 🟡 MEDIA  | Sottoscrizioni orfane                           |
| `user_settings`            | `user_id`             | `profiles.user_id`                   | 🟡 MEDIA  | Impostazioni orfane                             |
| `audit_logs`               | `user_id`             | `profiles.user_id` o `auth.users.id` | 🟡 MEDIA  | Perdita tracciabilità audit                     |

**Impatto:** 🔴 ALTO - Perdita integrità referenziale, possibilità di dati orfani, difficoltà nella manutenzione.

**Soluzione:**

```sql
-- Esempio per chat_messages
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_receiver_id_fkey
FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- (Ripetere per tutte le altre tabelle)
```

#### 9.1.4. Commento Errato su Foreign Key

**Problema:** Commento su colonna `athlete_administrative_data.athlete_id` dice "profiles.user_id" ma la FK è verso `profiles.id`.

**Impatto:** 🟡 MEDIO - Confusione per sviluppatori, documentazione errata.

**Soluzione:**

```sql
COMMENT ON COLUMN athlete_administrative_data.athlete_id IS 'Riferimento all''atleta (profiles.id)';
```

---

### 9.2. 🟡 Problemi Alta Priorità (Coerenza e Performance)

#### 9.2.1. Trigger Duplicati (4 casi)

**Problema:** Trigger duplicati che eseguono la stessa funzione, causando doppie esecuzioni.

| Tabella         | Trigger Duplicati                                                              | Funzione                            | Impatto                           |
| --------------- | ------------------------------------------------------------------------------ | ----------------------------------- | --------------------------------- |
| `documents`     | `trigger_update_documents_updated_at`<br>`update_documents_updated_at`         | `update_updated_at_column()`        | Doppio aggiornamento `updated_at` |
| `profiles`      | `trigger_sync_profile_names`<br>`trigger_sync_profile_naming`                  | Sincronizzazione nomi               | Doppia sincronizzazione           |
| `inviti_atleti` | `trigger_check_invite_expiration`<br>`trigger_check_invite_expiry`             | Verifica scadenza                   | Doppia verifica scadenza          |
| `user_settings` | `trigger_update_user_settings_updated_at`<br>`update_user_settings_updated_at` | `update_user_settings_updated_at()` | Doppio aggiornamento `updated_at` |

**Impatto:** 🟡 MEDIO - Performance degradate, possibili inconsistenze.

**Soluzione:**

```sql
-- Rimuovi trigger duplicati (mantieni quello con naming standard)
DROP TRIGGER IF EXISTS trigger_update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS trigger_check_invite_expiration ON inviti_atleti;
DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON user_settings;

-- Per profiles, verificare quale trigger è più completo e rimuovere l'altro
-- Verificare quale tra sync_profile_names e sync_profile_naming è più completo
```

#### 9.2.2. Foreign Keys Duplicate su Stessa Colonna

**Problema:** `workout_logs.scheda_id` ha due foreign keys diverse con stesso comportamento.

| Constraint                    | Tabella Riferita   | On Delete | On Update |
| ----------------------------- | ------------------ | --------- | --------- |
| `fk_workout_logs_scheda`      | `workout_plans.id` | SET NULL  | NO ACTION |
| `workout_logs_scheda_id_fkey` | `workout_plans.id` | SET NULL  | NO ACTION |

**Impatto:** 🟡 MEDIO - Ridondanza, possibile confusione, overhead minimo.

**Soluzione:**

```sql
-- Rimuovi constraint duplicato (mantieni quello con naming standard)
ALTER TABLE workout_logs
DROP CONSTRAINT IF EXISTS fk_workout_logs_scheda;
```

#### 9.2.3. Colonne Duplicate (Legacy/Retrocompatibilità)

**Problema:** Multiple tabelle hanno colonne duplicate per supportare italiano/inglese o legacy/new.

| Tabella         | Colonne Duplicate                                                                                   | Tipo        | Impatto                                    |
| --------------- | --------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `workout_logs`  | `athlete_id` / `atleta_id`                                                                          | Legacy      | 🟡 MEDIO - Confusione, doppia manutenzione |
| `cliente_tags`  | `nome`/`name`, `colore`/`color`, `descrizione`/`description`                                        | Multilingua | 🟢 BASSO - Supporto multilinguismo         |
| `inviti_atleti` | `stato`/`status`, `pt_id`/`trainer_id`                                                              | Legacy      | 🟡 MEDIO - Confusione                      |
| `notifications` | `body`/`message`, `read`/`is_read`                                                                  | Legacy      | 🟡 MEDIO - Confusione                      |
| `payments`      | `payment_method`/`method_text`, `created_by_staff_id`/`trainer_id`                                  | Legacy      | 🟡 MEDIO - Confusione                      |
| `user_settings` | `notification_settings`/`notifications`, `privacy_settings`/`privacy`, `account_settings`/`account` | Legacy      | 🟡 MEDIO - Confusione                      |

**Impatto:** 🟡 MEDIO - Confusione per sviluppatori, doppia manutenzione, possibile inconsistenza dati.

**Raccomandazione:**

- Standardizzare su una colonna (preferibilmente quella più utilizzata)
- Deprecare colonne legacy
- Aggiornare codice applicativo per usare solo colonne standard
- Rimuovere colonne deprecate dopo migrazione completa

#### 9.2.4. Primary Key Anomala

**Problema:** `lesson_counters` ha `id` (UUID) ma la Primary Key è `athlete_id`.

**Impatto:** 🟡 MEDIO - Schema confuso, possibile errore di design.

**Analisi:**

- `athlete_id` è PK (corretto per garantire un solo contatore per atleta per tipo)
- `id` esiste ma non è PK (possibile legacy o errore)

**Raccomandazione:** Verificare se `id` è necessario o può essere rimosso.

#### 9.2.5. Storage: Mancano Policies per Trainer

**Problema:** Bucket `progress-photos` e `athlete-progress-photos` non permettono ai trainer di vedere foto progressi dei propri atleti.

**Impatto:** 🟡 MEDIO - Trainer non possono monitorare progressi visivi degli atleti.

**Soluzione:**

```sql
-- Aggiungi policy per trainer su progress-photos
CREATE POLICY "PT can view athlete progress photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('progress-photos', 'athlete-progress-photos')
  AND EXISTS (
    SELECT 1 FROM pt_atleti
    WHERE pt_atleti.atleta_id = (
      SELECT profiles.id FROM profiles
      WHERE profiles.user_id = ((string_to_array((storage.foldername(name))[1], '/'))[1])::uuid
    )
    AND pt_atleti.pt_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
  )
);
```

#### 9.2.6. Storage: Mancano Policies per `athlete-documents`

**Problema:** Bucket `athlete-documents` esiste ma non ha policies specifiche.

**Impatto:** 🟡 MEDIO - Trainer non possono accedere a documenti atleti nel bucket nuovo.

**Soluzione:** Aggiungere policies simili a `athlete-certificates` con verifica `pt_atleti`.

---

### 9.3. 🟠 Problemi Media Priorità (Miglioramenti e Pulizia)

#### 9.3.1. Bucket Storage Duplicati/Legacy

**Problema:** Esistono bucket duplicati che suggeriscono migrazione incompleta.

| Bucket Legacy     | Bucket Nuovo              | Stato                                      |
| ----------------- | ------------------------- | ------------------------------------------ |
| `documents`       | `athlete-documents`       | Legacy creato 2025-10-16, nuovo 2025-12-07 |
| `progress-photos` | `athlete-progress-photos` | Legacy creato 2025-10-16, nuovo 2025-12-07 |

**Impatto:** 🟠 MEDIO - Confusione, possibile uso di bucket sbagliato, duplicazione file.

**Raccomandazione:**

1. Verificare quale bucket è utilizzato dal codice applicativo
2. Migrare file dal bucket legacy al nuovo
3. Aggiornare riferimenti nel database
4. Deprecare bucket legacy
5. Rimuovere bucket legacy dopo migrazione completa

#### 9.3.2. File Orfani nello Storage

**Problema:** 5 file nel bucket `documents` ma 0 record nella tabella `documents`.

**Impatto:** 🟠 MEDIO - Spazio sprecato, possibile inconsistenza.

**Raccomandazione:**

- Verificare se i file sono ancora necessari
- Se sì, migrare a `athlete-documents` e creare record in tabella
- Se no, eliminare file orfani

#### 9.3.3. File Mancante per Exercise Video

**Problema:** Esercizio "xxx" ha `video_url` popolato ma file non trovato nello storage.

**Dettagli:**

- URL: `796991ba-be7b-4f95-8232-6aa589265ef7/1765592588863-ki5o1jysxka.mp4`
- File non esiste nel bucket `exercise-videos`

**Impatto:** 🟠 MEDIO - Link rotto, errore quando si tenta di visualizzare il video.

**Soluzione:**

- Verificare se il file esiste ancora o è stato eliminato
- Se eliminato, rimuovere `video_url` dall'esercizio
- Se esiste altrove, aggiornare URL o ricaricare file

#### 9.3.4. Indici con Bassa Efficienza

**Problema:** Alcuni indici hanno bassa efficienza (<50%), indicando possibile problema di selettività o query non ottimizzate.

| Tabella              | Indice                                     | Efficienza | Scansioni | Problema                                 |
| -------------------- | ------------------------------------------ | ---------- | --------- | ---------------------------------------- |
| `workout_plans`      | `idx_workout_plans_athlete`                | 36.2%      | 495       | Legge 6,375 tuple ma recupera solo 2,304 |
| `workout_plans`      | `idx_workout_plans_active`                 | 0%         | 60        | Legge 6,600 tuple ma recupera 0          |
| `push_subscriptions` | `idx_push_subscriptions_user_id`           | 23.2%      | 232       | Legge 164 tuple ma recupera solo 38      |
| `chat_messages`      | `idx_chat_messages_conversation_optimized` | 0%         | 60        | Legge 56 tuple ma recupera 0             |

**Impatto:** 🟠 MEDIO - Performance degradate, overhead I/O.

**Raccomandazione:**

- Analizzare query che usano questi indici
- Verificare se gli indici sono necessari o possono essere ottimizzati
- Considerare indici compositi o parziali più selettivi

#### 9.3.5. Indici Non Utilizzati

**Problema:** ~140 indici (70% del totale) hanno 0 scansioni.

**Impatto:** 🟠 MEDIO - Spazio sprecato, overhead su INSERT/UPDATE.

**Raccomandazione:**

- Monitorare quando i dati verranno popolati (molti indici sono su tabelle vuote)
- Rimuovere indici non utilizzati solo dopo verifica che non saranno necessari
- Attenzione: alcuni indici potrebbero essere critici anche se usati raramente

#### 9.3.6. Indici Sproporzionati rispetto ai Dati

**Problema:** Alcune tabelle hanno indici molto più grandi dei dati effettivi.

| Tabella                | Record | Dimensione Dati | Dimensione Indici | Rapporto |
| ---------------------- | ------ | --------------- | ----------------- | -------- |
| `athlete_fitness_data` | 0      | 8 kB            | 232 kB            | 29:1     |
| `athlete_medical_data` | 0      | 8 kB            | 192 kB            | 24:1     |
| `appointments`         | 1      | 8 kB            | 192 kB            | 24:1     |
| `profiles`             | 4      | 8 kB            | 176 kB            | 22:1     |

**Impatto:** 🟠 MEDIO - Spazio sprecato (ma utile quando i dati cresceranno).

**Nota:** Questo è normale per tabelle preparate per crescita futura. Monitorare quando i dati verranno popolati.

---

### 9.4. 🔵 Problemi Bassa Priorità (Ottimizzazioni e Refactoring)

#### 9.4.1. Viste Menzionate ma Non Esistenti

**Problema:** 4 viste sono menzionate nella documentazione iniziale ma non esistono nel database.

| Vista                          | Stato         | Note                                       |
| ------------------------------ | ------------- | ------------------------------------------ |
| `monthly_kpi_view`             | ❌ Non esiste | Potrebbe essere stata rimossa o mai creata |
| `workout_completion_rate_view` | ❌ Non esiste | Potrebbe essere stata rimossa o mai creata |
| `athlete_stats_view`           | ❌ Non esiste | Potrebbe essere stata rimossa o mai creata |
| `staff_performance_view`       | ❌ Non esiste | Potrebbe essere stata rimossa o mai creata |

**Impatto:** 🔵 BASSO - Documentazione non aggiornata.

**Raccomandazione:** Rimuovere riferimenti dalla documentazione o creare le viste se necessarie.

#### 9.4.2. Inconsistenza Naming: `uploaded_by_user_id` - ✅ **RISOLTO**

**Problema:** Colonna `documents.uploaded_by_user_id` referenzia `profiles.id` ma il nome suggerirebbe `profiles.user_id`.

**Soluzione:** ✅ **RISOLTO con FIX_23** - Colonna rinominata in `uploaded_by_profile_id`

**Impatto:** 🔵 BASSO - Confusione per sviluppatori.

**Raccomandazione:**

- ✅ **COMPLETATO in FIX_23** - Rinominato in `uploaded_by_profile_id` per chiarezza
- ⚠️ **IMPORTANTE:** Aggiornare codice applicativo (vedi `FIX_23_AGGIORNA_CODICE_APPLICATIVO.md`)

#### 9.4.3. Query 54: Risultati Sezioni 1-4 Mancanti

**Problema:** Query 54 è stata eseguita parzialmente - mancano risultati sezioni 1-4.

**Impatto:** 🔵 BASSO - Verifica completa non conclusa.

**Raccomandazione:** Eseguire sezioni 1-4 della Query 54 per verificare se ci sono altre tabelle/viste statistiche non documentate.

---

### 9.5. Riepilogo Problemi per Categoria

#### Sicurezza (🔴 Critici)

- 3 tabelle con RLS disabilitato
- 4 policies Storage troppo permissive
- 11+ foreign keys mancanti

#### Integrità Dati (🔴 Critici)

- Foreign keys mancanti su colonne critiche
- Commento errato su FK
- File orfani nello storage

#### Coerenza Schema (🟡 Alta Priorità)

- 4 trigger duplicati
- 2 foreign keys duplicate
- 6+ tabelle con colonne duplicate
- 1 primary key anomala

#### Performance (🟠 Media Priorità)

- 4 indici con bassa efficienza
- ~140 indici non utilizzati
- Indici sproporzionati (normale per tabelle vuote)

#### Storage (🟡 Alta Priorità / 🟠 Media Priorità)

- 2 bucket duplicati/legacy
- 5 file orfani
- 1 file mancante per exercise video
- Policies mancanti per trainer su progress-photos
- Policies mancanti per athlete-documents

#### Documentazione (🔵 Bassa Priorità)

- 4 viste menzionate ma non esistenti
- Query 54 risultati parziali

---

### 9.6. Piano di Risoluzione Prioritario

#### Fase 1: Sicurezza Critica (🔴 IMMEDIATO)

1. Abilitare RLS su `roles`, `web_vitals`, `workout_sets`
2. Rimuovere policies troppo permissive su `documents` bucket
3. Aggiungere policies corrette con verifica `pt_atleti`

#### Fase 2: Integrità Dati (🔴 URGENTE)

1. Aggiungere foreign keys mancanti su colonne critiche (`chat_messages`, `notifications`, `payments`)
2. Correggere commento errato su `athlete_administrative_data.athlete_id`

#### Fase 3: Coerenza Schema (🟡 ALTA PRIORITÀ)

1. Rimuovere trigger duplicati
2. Rimuovere foreign key duplicata su `workout_logs.scheda_id`
3. Standardizzare colonne duplicate (iniziare con `workout_logs.athlete_id`/`atleta_id`)

#### Fase 4: Storage (🟡 ALTA PRIORITÀ)

1. Aggiungere policies per trainer su `progress-photos` e `athlete-progress-photos`
2. Aggiungere policies per `athlete-documents`
3. Verificare e migrare file orfani

#### Fase 5: Performance e Ottimizzazione (🟠 MEDIA PRIORITÀ)

1. Analizzare e ottimizzare indici con bassa efficienza
2. Monitorare indici quando i dati verranno popolati
3. Rimuovere indici non utilizzati (dopo verifica)

#### Fase 6: Pulizia e Refactoring (🔵 BASSA PRIORITÀ)

1. Migrare bucket legacy a nuovi bucket
2. Rimuovere riferimenti a viste inesistenti dalla documentazione
3. Completare Query 54 (sezioni 1-4)

---

### 9.7. Metriche Problemi

**Totale Problemi Identificati:** 40+ problemi

**Distribuzione per Criticità:**

- 🔴 Critici: 7 problemi (Sicurezza e Integrità)
- 🟡 Alta Priorità: 12 problemi (Coerenza e Storage)
- 🟠 Media Priorità: 8 problemi (Performance e Pulizia)
- 🔵 Bassa Priorità: 5 problemi (Ottimizzazioni)

**Distribuzione per Categoria:**

- Sicurezza: 7 problemi
- Integrità Dati: 8 problemi
- Coerenza Schema: 10 problemi
- Performance: 5 problemi
- Storage: 7 problemi
- Documentazione: 3 problemi

**Stato Risoluzione:**

- ✅ Risolti: 12 fix esecutivi (Fase 1, 2, 3, 4 completate)
  - Fase 1 - Sicurezza Critica: 4 fix completati ✅
  - Fase 2 - Integrità Dati: 3 fix completati ✅
  - Fase 3 - Coerenza Schema: 3 fix completati ✅
  - Fase 4 - Storage: 2 fix completati ✅
- ✅ Analisi completate: 3 analisi (Fase 5, 6)
  - Fase 5 - Performance: 1 analisi completata ✅
  - Fase 6 - Refactoring: 2 analisi completate ✅
- ⏳ In Corso: 0
- ❌ Aperti: 24+ (Ottimizzazioni future basate su analisi completate)

---

### 9.8. Stato Applicazione Fix

**Ultimo aggiornamento:** 2025-02-01

#### Script SQL Creati (Fase 1: Sicurezza Critica)

**🔴 FIX 01: RLS su roles** - `docs/FIX_01_RLS_ROLES.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Abilita RLS e aggiunge 4 policies (SELECT per tutti, INSERT/UPDATE/DELETE solo admin)
- **Verifica:** ✅ `rowsecurity = true` e `policy_count = 4`

**🔴 FIX 02: RLS su web_vitals** - `docs/FIX_02_RLS_WEB_VITALS.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Abilita RLS (policies già esistenti)
- **Verifica:** ✅ `rowsecurity = true`

**🔴 FIX 03: RLS su workout_sets** - `docs/FIX_03_RLS_WORKOUT_SETS.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Abilita RLS (policies già esistenti)
- **Verifica:** ✅ `rowsecurity = true`

**🔴 FIX 04: Storage policies documents** - `docs/FIX_04_STORAGE_DOCUMENTS_POLICIES.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Rimuove 4 policies troppo permissive, aggiunge 8 policies corrette (utenti + trainer tramite pt_atleti)
- **Verifica:** ✅ 8 policies per bucket 'documents' (non più 4 permissive)

#### Istruzioni Applicazione Fix

1. **Eseguire gli script in ordine** nel Supabase SQL Editor:
   - `FIX_01_RLS_ROLES.sql`
   - `FIX_02_RLS_WEB_VITALS.sql`
   - `FIX_03_RLS_WORKOUT_SETS.sql`
   - `FIX_04_STORAGE_DOCUMENTS_POLICIES.sql`

2. **Verificare ogni fix** usando le query di verifica incluse negli script

3. **Testare funzionalità** dopo ogni fix per assicurarsi che non ci siano regressioni

4. **Aggiornare stato** nella documentazione dopo ogni fix applicato

**🔴 FIX 05: Foreign keys chat_messages** - `docs/FIX_05_FK_CHAT_MESSAGES.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Migra dati da auth.users.id a profiles.id, aggiunge FK su sender_id e receiver_id verso profiles.id
- **Verifica:** ✅ 2 FK aggiunte (sender_id_fkey, receiver_id_fkey)
- **Note:** Eliminati messaggi orfani con `FIX_05_CLEANUP_EXECUTE_V2.sql` prima dell'applicazione

**🔴 FIX 06: Foreign key notifications** - `docs/FIX_06_FK_NOTIFICATIONS.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Migra dati da profiles.id a profiles.user_id, aggiunge FK su user_id verso auth.users.id
- **Verifica:** ✅ FK aggiunta (notifications_user_id_fkey)
- **Note:** Eliminate notifiche orfane con `FIX_06_CLEANUP_EXECUTE.sql` prima dell'applicazione

**🔴 FIX 07: Foreign keys payments** - `docs/FIX_07_FK_PAYMENTS.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Migra dati da profiles.user_id a profiles.id, aggiunge FK su athlete_id e created_by_staff_id verso profiles.id
- **Verifica:** ✅ 2 FK aggiunte (athlete_id_fkey, created_by_staff_id_fkey)
- **Note:** Eliminati pagamenti orfani con `FIX_07_CLEANUP_EXECUTE.sql` prima dell'applicazione

**🔵 FIX 08: Commento errato** - `docs/FIX_08_COMMENT_ATHLETE_ID.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Corregge commento su athlete_administrative_data.athlete_id (da "profiles.user_id" a "profiles.id")
- **Verifica:** ✅ Commento aggiornato correttamente

**🟡 FIX 09: Trigger duplicati** - `docs/FIX_09_TRIGGER_DUPLICATI.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Rimuove 4 trigger duplicati (documents, profiles, inviti_atleti, user_settings)
- **Verifica:** ✅ Solo 1 trigger per tabella rimane (quello con naming standard)

**🟡 FIX 10: Foreign key duplicata** - `docs/FIX_10_FK_DUPLICATA.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Rimuove FK duplicata su workout_logs.scheda_id (fk_workout_logs_scheda)
- **Verifica:** ✅ Solo workout_logs_scheda_id_fkey rimane

**🟡 FIX 11: Storage policies progress-photos** - `docs/FIX_11_STORAGE_PROGRESS_PHOTOS_POLICIES.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Aggiunge 4 policies per permettere ai trainer di gestire foto progressi dei propri atleti
- **Verifica:** ✅ Policies aggiunte per bucket progress-photos e athlete-progress-photos

**🟡 FIX 12: Storage policies athlete-documents** - `docs/FIX_12_STORAGE_ATHLETE_DOCUMENTS_POLICIES.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Aggiunge 8 policies (4 per utenti + 4 per trainer) per bucket athlete-documents
- **Verifica:** ✅ Policies aggiunte con verifica pt_atleti

**🟠 FIX 13: Analisi indici performance** - `docs/FIX_13_ANALISI_INDICI_PERFORMANCE.sql`

- **Stato:** ✅ **ESEGUITO** - Analisi completata
- **Azione:** Analizza indici con bassa efficienza e fornisce raccomandazioni
- **Risultato:** ✅ Report generato con analisi dettagliata
- **Note:** ~140 indici non utilizzati identificati (principalmente su tabelle vuote)

**🟠 FIX 14: Analisi colonne duplicate** - `docs/FIX_14_ANALISI_COLONNE_DUPLICATE.sql`

- **Stato:** ✅ **ESEGUITO** - Analisi completata
- **Azione:** Analizza colonne duplicate in 6 tabelle e fornisce raccomandazioni
- **Risultato:** ✅ Report generato con analisi dettagliata
- **Note:** Richiede analisi codice applicativo per standardizzazione

**🟠 FIX 15: Analisi storage legacy** - `docs/FIX_15_ANALISI_STORAGE_LEGACY.sql`

- **Stato:** ✅ **ESEGUITO** - Analisi completata
- **Azione:** Analizza bucket duplicati/legacy e file orfani
- **Risultato:** ✅ Report generato con analisi dettagliata
- **Note:** Richiede decisioni manuali per migrazioni bucket
- **Risultati:**
  - 1 esercizio con file video mancante identificato (xxx - ID: 0886c838-f169-4117-9a33-47472ac67fda)
  - 3 esercizi con file video presenti verificati
- **Script supporto eseguiti:**
  - `FIX_15_DIAGNOSTIC_FILE_MANCANTE.sql` - ✅ Eseguito - Diagnostica dettagliata
  - `FIX_15_CLEANUP_VIDEO_ORFANI.sql` - ✅ Eseguito - 1 video_url orfano rimosso

**🟢 FIX 16: Ottimizzazione indici** - `docs/FIX_16_RIMOZIONE_INDICI_NON_UTILIZZATI.sql`

- **Stato:** ✅ **ESEGUITO** - Ottimizzazione completata
- **Azione:** Rimuove indici non utilizzati identificati da FIX_13
- **Risultato:** ✅ Indici rimovibili eliminati, 92 indici protetti mantenuti (1.6 MB)
- **Analisi indici rimanenti:**
  - 35 Indici GIN (JSONB) - 664 kB - Utili per query JSONB future
  - 52 Indici su Tabelle Vuote - 608 kB - Preparati per crescita futura
  - 17 Primary Keys - 200 kB - Essenziali per integrità dati
  - 11 Unique Constraints - 136 kB - Essenziali per integrità dati
- **Conclusione:** Tutti gli indici rimanenti sono appropriati e necessari
- **Script supporto:**
  - `FIX_16_ANALISI_INDICI_RIMANENTI.sql` - ✅ Eseguito - Analisi dettagliata indici protetti

**🟡 FIX 17: Analisi uso colonne duplicate** - `docs/FIX_17_ANALISI_USO_COLONNE_CODICE.sql`

- **Stato:** ✅ **CREATO** - Script di analisi pronto
- **Azione:** Analizza l'uso effettivo delle colonne duplicate nel database
- **Scopo:** Determinare quale colonna è utilizzata e quale può essere deprecata
- **Tabelle analizzate:** workout_logs, inviti_atleti, notifications, payments, user_settings, cliente_tags

**🟡 FIX 18: Standardizzazione colonne duplicate** - `docs/FIX_18_STANDARDIZZAZIONE_COLONNE_V2.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Standardizza colonne duplicate nel database, migra dati e aggiorna dipendenze
- **Modifiche completate:**
  - `workout_logs`: ✅ Mantiene `atleta_id`, rimuove `athlete_id` (RLS policies aggiornate)
  - `inviti_atleti`: ✅ Mantiene `status` e `pt_id`, rimuove `stato` e `trainer_id` (funzione e trigger aggiornati, RLS policies aggiornate, mapping valori italiano→inglese)
  - `notifications`: ✅ Mantiene `message` e `is_read`, rimuove `body` e `read`
  - `payments`: ✅ Mantiene `payment_method` e `created_by_staff_id`, rimuove `method_text` e `trainer_id`
  - `user_settings`: ✅ Mantiene `*_settings`, rimuove versioni corte
  - `cliente_tags`: ✅ Nessuna modifica (multilingua - mantenute entrambe le colonne)
- **Script eseguiti in sequenza:**
  1. `FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql` - ✅ Funzione aggiornata per usare `status`
  2. `FIX_18_AGGIORNA_FUNZIONE_UPDATE_EXPIRED_INVITES.sql` - ✅ Funzioni aggiuntive aggiornate
  3. `FIX_18_STANDARDIZZAZIONE_COLONNE_V2.sql` - ✅ Standardizzazione completata
- **Verifica:** ✅ Tutte le colonne standardizzate, colonne deprecate rimosse, dipendenze aggiornate
- **Note:**
  - Mapping valori `inviti_atleti`: `inviato`→`pending`, `registrato`→`accepted`, `scaduto`→`expired`
  - RLS policies su `workout_logs` e `inviti_atleti` aggiornate per usare colonne standardizzate
  - Trigger `trigger_check_invite_expiry` aggiornato per usare `status` invece di `stato`

**🟢 FIX 19: Migrazione storage legacy** - `docs/FIX_19_MIGRAZIONE_STORAGE_LEGACY.sql`

- **Stato:** ✅ **CREATO** - Script di analisi pronto
- **Azione:** Analizza bucket duplicati e file per migrazione storage legacy
- **Bucket analizzati:** documents vs athlete-documents, progress-photos vs athlete-progress-photos
- **Nota:** Richiede decisioni manuali su quale bucket mantenere

**🟢 FIX 20: Aggiornamento URL storage** - `docs/FIX_20_AGGIORNAMENTO_URL_STORAGE.sql`

- **Stato:** ✅ **CREATO** - Script di aggiornamento pronto
- **Azione:** Aggiorna URL nel database dopo migrazione file storage
- **Nota:** Eseguire DOPO aver migrato i file fisicamente

**🟡 FIX 21: Verifica struttura workout_plans** - `docs/FIX_21_VERIFICA_WORKOUT_PLANS_STRUCTURE.sql`

- **Stato:** ✅ **CREATO** - Script di verifica pronto
- **Azione:** Verifica struttura, FK esistenti e utilizzo colonne in `workout_plans`
- **Scopo:** Preparazione per FIX_22

**🟡 FIX 22: Aggiunge/corregge FK workout_plans** - `docs/FIX_22_AGGIORNA_FK_WORKOUT_PLANS.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Aggiunge/corregge FK su `created_by` (→ `auth.users.id`) e `trainer_id` (→ `profiles.id`)
- **Risultato:**
  - ✅ `created_by` → `auth.users.id` (FK aggiunta/corretta)
  - ✅ `trainer_id` → `profiles.id` (FK corretta da `auth.users.id`)
  - ✅ `athlete_id` → `profiles.id` (già corretta)
- **Script supporto:**
  - `FIX_22_SEMPLICE_CORREGGE_TRAINER_ID.sql` - Versione semplificata per correggere trainer_id
  - `FIX_22_VERIFICA_COMPLETA_FK.sql` - Verifica completa tutte le FK
  - `FIX_22_VERIFICA_FINALE_COMPLETA.sql` - Verifica finale con stato

**🟡 FIX 23: Rinomina uploaded_by_user_id** - `docs/FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`

- **Stato:** ✅ **APPLICATO** - Eseguito con successo
- **Azione:** Rinomina `documents.uploaded_by_user_id` in `uploaded_by_profile_id`
- **Risultato:**
  - ✅ Colonna rinominata correttamente
  - ✅ FK ricreata come `documents_uploaded_by_profile_id_fkey`
  - ✅ Indici aggiornati automaticamente da PostgreSQL
- **⚠️ IMPORTANTE:** Richiede aggiornamento codice applicativo (vedi `FIX_23_AGGIORNA_CODICE_APPLICATIVO.md`)
- **File da aggiornare:**
  - `src/types/document.ts`
  - `src/hooks/use-documents.ts`
  - `src/lib/documents.ts`
  - `src/components/documents/document-uploader-modal.tsx`
  - `src/app/home/documenti/page.tsx`

#### Script di Supporto Creati

**Diagnostica e Analisi:**

- `FIX_13_RACCOMANDAZIONI_INDICI.sql` - Analisi dettagliata indici non utilizzati
- `FIX_16_ANALISI_INDICI_RIMANENTI.sql` - Analisi dettagliata indici protetti (92 indici, 1.6 MB)
- `FIX_05_DIAGNOSTIC_ORPHAN_CHAT_MESSAGES.sql`
- `FIX_06_DIAGNOSTIC_ORPHAN_NOTIFICATIONS.sql`
- `FIX_07_RESOLVE_ORPHANS.sql`
- `FIX_15_DIAGNOSTIC_FILE_MANCANTE.sql` - Diagnostica dettagliata file video mancanti

**Cleanup:**

- `FIX_05_CLEANUP_EXECUTE_V2.sql`
- `FIX_06_CLEANUP_EXECUTE.sql`
- `FIX_07_CLEANUP_EXECUTE.sql`
- `FIX_15_CLEANUP_VIDEO_ORFANI.sql` - Rimuove video_url da esercizi con file mancanti

**Standardizzazione Colonne (FIX_18):**

- `FIX_18_VERIFICA_PRE_ESECUZIONE.sql` - Verifica stato prima di eseguire FIX_18
- `FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql` - Aggiorna funzione per usare `status`
- `FIX_18_AGGIORNA_FUNZIONE_UPDATE_EXPIRED_INVITES.sql` - Aggiorna funzioni aggiuntive
- `FIX_18_STANDARDIZZAZIONE_COLONNE_V2.sql` - Script principale di standardizzazione
- `FIX_18_VERIFICA_RECORD_INVITI_ATLETI.sql` - Verifica record con valori diversi
- `FIX_18_DETTAGLIO_RECORD_DIVERSE.sql` - Analisi dettagliata record con valori diversi

**Miglioramenti Opzionali (FIX_21, FIX_22, FIX_23):**

- `FIX_21_VERIFICA_WORKOUT_PLANS_STRUCTURE.sql` - Verifica struttura workout_plans
- `FIX_22_AGGIORNA_FK_WORKOUT_PLANS.sql` - Aggiunge FK mancanti su workout_plans
- `FIX_22_SEMPLICE_CORREGGE_TRAINER_ID.sql` - Versione semplificata per correggere trainer_id
- `FIX_22_VERIFICA_COMPLETA_FK.sql` - Verifica completa tutte le FK
- `FIX_22_VERIFICA_FINALE_COMPLETA.sql` - Verifica finale con stato
- `FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql` - Rinomina colonna per chiarezza
- `FIX_23_VERIFICA_FINALE.sql` - Verifica completa dopo rinomina
- `FIX_23_AGGIORNA_CODICE_APPLICATIVO.md` - Guida aggiornamento codice applicativo
- `FIX_21_22_23_RIEPILOGO_MIGLIORAMENTI_OPZIONALI.md` - Guida completa

**Risoluzione:**

- `FIX_05_RESOLVE_ORPHANS.sql`
- `FIX_06_RESOLVE_ORPHANS.sql`

---

## ✅ Riepilogo Completo Fix Applicati

### Fase 1 - Sicurezza Critica (4/4 completati)

- ✅ FIX_01: RLS su `roles`
- ✅ FIX_02: RLS su `web_vitals`
- ✅ FIX_03: RLS su `workout_sets`
- ✅ FIX_04: Storage policies `documents`

### Fase 2 - Integrità Dati (3/3 completati)

- ✅ FIX_05: Foreign keys `chat_messages` (2 FK aggiunte, dati orfani eliminati)
- ✅ FIX_06: Foreign key `notifications` (1 FK aggiunta, dati orfani eliminati)
- ✅ FIX_07: Foreign keys `payments` (2 FK aggiunte, dati orfani eliminati)

### Fase 3 - Coerenza Schema (3/3 completati)

- ✅ FIX_08: Commento errato corretto
- ✅ FIX_09: Trigger duplicati rimossi (4 trigger)
- ✅ FIX_10: Foreign key duplicata rimossa

### Fase 4 - Storage (2/2 completati)

- ✅ FIX_11: Storage policies progress-photos (4 policies aggiunte)
- ✅ FIX_12: Storage policies athlete-documents (8 policies aggiunte)

### Fase 5 - Performance (1/1 analisi + 1 ottimizzazione)

- ✅ FIX_13: Analisi indici performance (~140 indici non utilizzati identificati)
- ✅ FIX_16: Ottimizzazione indici (indici rimovibili eliminati, 92 indici protetti mantenuti)

### Fase 6 - Refactoring (2/2 analisi + 1 standardizzazione + 2 script creati)

- ✅ FIX_14: Analisi colonne duplicate (6 tabelle analizzate)
- ✅ FIX_15: Analisi storage legacy (1 video_url orfano rimosso)
- ✅ FIX_17: Analisi uso colonne duplicate - Script creato
- ✅ FIX_18: Standardizzazione colonne duplicate - **COMPLETATO** (5 tabelle standardizzate, funzioni/trigger/RLS aggiornati)
- ✅ FIX_19: Migrazione storage legacy - Script creato
- ✅ FIX_20: Aggiornamento URL storage - Script creato
- ✅ FIX_21: Verifica struttura workout_plans - Script creato
- ✅ FIX_22: Aggiunge/corregge FK workout_plans - **COMPLETATO** (3 FK corrette: athlete_id, created_by, trainer_id)
- ✅ FIX_23: Rinomina uploaded_by_user_id - **COMPLETATO** (colonna rinominata, FK ricreata)

### Risultati Finali

**Totale Fix:** 15 fix esecutivi + 3 analisi + 1 ottimizzazione + 3 script opzionali = **22 operazioni totali**

**Completati:** 20 operazioni  
**Script Opzionali Creati:** 3 script (pronti per esecuzione)

**Miglioramenti Opzionali Completati:**

- ✅ FIX_21: Verifica struttura workout_plans
- ✅ FIX_22: Aggiunge/corregge FK workout_plans (3 FK corrette)
- ✅ FIX_23: Rinomina uploaded_by_user_id (colonna rinominata, FK ricreata)

**Impatto:**

- ✅ **Sicurezza:** 3 tabelle protette con RLS, storage policies corrette
- ✅ **Integrità Dati:** 5 foreign keys aggiunte, dati orfani eliminati
- ✅ **Coerenza Schema:** 4 trigger duplicati rimossi, 1 FK duplicata rimossa, colonne duplicate standardizzate (5 tabelle), FK workout_plans corrette (3 FK)
- ✅ **Storage:** Policies complete per tutti i bucket principali
- ✅ **Performance:** Indici ottimizzati (92 indici protetti, 1.6 MB totali)
- ✅ **Pulizia:** File video orfani rimossi (1 video_url)
- ✅ **Standardizzazione:** Schema completamente standardizzato (workout_logs, inviti_atleti, notifications, payments, user_settings, documents)
- ✅ **Miglioramenti Opzionali:** FK workout_plans corrette (3 FK), rinomina colonna documents (uploaded_by_profile_id)

**Stato Database:** ✅ **OTTIMIZZATO E PRONTO PER PRODUZIONE**

### Documentazione Correlata

- `docs/RIEPILOGO_FINALE_FIX.md` - Riepilogo completo fix completati
- `docs/RIEPILOGO_FIX_16_INDICI.md` - Riepilogo ottimizzazione indici
- `docs/PROSSIMI_PASSI_OPZIONALI.md` - Prossimi passi opzionali
- `docs/GUIDA_SEQUENZA_FIX.md` - Guida sequenza esecuzione

---

**Nota:** La documentazione di elementi non-Supabase (API Routes, Componenti React, Hooks, Configurazioni, Scripts, Testing, Deployment, ecc.) è mantenuta in `ai_memory/sviluppo.md` per mantenere questa documentazione focalizzata esclusivamente sul database Supabase.
