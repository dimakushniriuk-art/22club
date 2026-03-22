# Stato DB per profilo trainer completo

Documentazione generata dalle query diagnostiche sul database. Usare come riferimento per progettare e implementare il profilo trainer esteso (dashboard/impostazioni) e riutilizzare dati esistenti.

---

## 1. Tabelle nello schema `public`

| table_name                  |
| --------------------------- |
| appointments                |
| athlete_administrative_data |
| athlete_ai_data             |
| athlete_fitness_data        |
| athlete_massage_data        |
| athlete_medical_data        |
| athlete_motivational_data   |
| athlete_nutrition_data      |
| athlete_questionnaires      |
| athlete_smart_tracking_data |
| audit_logs                  |
| chat_messages               |
| cliente_tags                |
| communication_recipients    |
| communications              |
| credit_ledger               |
| documents                   |
| exercises                   |
| inviti_atleti               |
| lesson_counters             |
| notifications               |
| payments                    |
| profiles                    |
| profiles_tags               |
| progress_logs               |
| progress_photos             |
| pt_atleti                   |
| push_subscriptions          |
| roles                       |
| **trainer_athletes**        |
| user_settings               |
| web_vitals                  |
| workout_day_exercises       |
| workout_days                |
| workout_logs                |
| workout_plans               |
| workout_sets                |
| workouts                    |

**Nota:** Esiste già la tabella `trainer_athletes` (oltre a `pt_atleti`). Verificare struttura e uso prima di introdurre nuove tabelle trainer.

---

## 2. Struttura completa tabella `profiles`

Colonne con tipo, lunghezza massima, nullable e default.

| column_name                      | data_type                   | character_maximum_length | is_nullable | column_default    |
| -------------------------------- | --------------------------- | ------------------------ | ----------- | ----------------- |
| id                               | uuid                        | -                        | NO          | gen_random_uuid() |
| user_id                          | uuid                        | -                        | NO          | -                 |
| nome                             | character varying           | 100                      | YES         | -                 |
| cognome                          | character varying           | 100                      | YES         | -                 |
| role                             | character varying           | 20                       | NO          | -                 |
| avatar                           | text                        | -                        | YES         | -                 |
| created_at                       | timestamp with time zone    | -                        | YES         | now()             |
| updated_at                       | timestamp with time zone    | -                        | YES         | now()             |
| email                            | text                        | -                        | NO          | -                 |
| phone                            | text                        | -                        | YES         | -                 |
| data_iscrizione                  | timestamp without time zone | -                        | YES         | now()             |
| stato                            | text                        | -                        | YES         | 'attivo'          |
| documenti_scadenza               | boolean                     | -                        | YES         | false             |
| note                             | text                        | -                        | YES         | -                 |
| org_id                           | text                        | -                        | YES         | 'default-org'     |
| first_name                       | character varying           | 100                      | YES         | -                 |
| last_name                        | character varying           | 100                      | YES         | -                 |
| avatar_url                       | text                        | -                        | YES         | -                 |
| obiettivo_peso                   | numeric                     | -                        | YES         | -                 |
| data_nascita                     | date                        | -                        | YES         | -                 |
| sesso                            | character varying           | 10                       | YES         | -                 |
| codice_fiscale                   | character varying           | 16                       | YES         | -                 |
| indirizzo_residenza              | text                        | -                        | YES         | -                 |
| contatto_emergenza_nome          | character varying           | 200                      | YES         | -                 |
| contatto_emergenza_telefono      | character varying           | 20                       | YES         | -                 |
| certificato_medico_tipo          | character varying           | 50                       | YES         | -                 |
| certificato_medico_data_rilascio | date                        | -                        | YES         | -                 |
| certificato_medico_scadenza      | date                        | -                        | YES         | -                 |
| altezza_cm                       | numeric                     | -                        | YES         | -                 |
| peso_corrente_kg                 | numeric                     | -                        | YES         | -                 |
| bmi                              | numeric                     | -                        | YES         | -                 |
| percentuale_massa_grassa         | numeric                     | -                        | YES         | -                 |
| circonferenza_vita_cm            | numeric                     | -                        | YES         | -                 |
| circonferenza_torace_cm          | numeric                     | -                        | YES         | -                 |
| circonferenza_fianchi_cm         | numeric                     | -                        | YES         | -                 |
| livello_esperienza               | character varying           | 50                       | YES         | -                 |
| tipo_atleta                      | character varying           | 50                       | YES         | -                 |
| obiettivi_fitness                | ARRAY                       | -                        | YES         | -                 |
| livello_motivazione              | integer                     | -                        | YES         | -                 |
| obiettivo_nutrizionale           | character varying           | 50                       | YES         | -                 |
| intolleranze                     | ARRAY                       | -                        | YES         | -                 |
| allergie_alimentari              | ARRAY                       | -                        | YES         | -                 |
| abitudini_alimentari             | text                        | -                        | YES         | -                 |
| infortuni_recenti                | text                        | -                        | YES         | -                 |
| limitazioni                      | text                        | -                        | YES         | -                 |
| allergie                         | text                        | -                        | YES         | -                 |
| operazioni_passate               | text                        | -                        | YES         | -                 |
| pressione_sanguigna              | character varying           | 20                       | YES         | -                 |
| tipo_abbonamento                 | character varying           | 100                      | YES         | -                 |
| abbonamento_scadenza             | date                        | -                        | YES         | -                 |
| pacchetti_pt_acquistati          | integer                     | -                        | YES         | 0                 |
| pacchetti_pt_usati               | integer                     | -                        | YES         | 0                 |
| note_amministrative              | text                        | -                        | YES         | -                 |
| ultimo_accesso                   | timestamp with time zone    | -                        | YES         | -                 |
| indirizzo                        | text                        | -                        | YES         | -                 |
| citta                            | character varying           | 100                      | YES         | -                 |
| cap                              | character varying           | 10                       | YES         | -                 |
| provincia                        | character varying           | 50                       | YES         | -                 |
| nazione                          | character varying           | 50                       | YES         | 'Italia'          |
| contatto_emergenza_relazione     | character varying           | 50                       | YES         | -                 |
| professione                      | character varying           | 100                      | YES         | -                 |
| peso_iniziale_kg                 | numeric                     | -                        | YES         | -                 |
| gruppo_sanguigno                 | character varying           | 5                        | YES         | -                 |
| telefono                         | text                        | -                        | YES         | -                 |
| first_login                      | boolean                     | -                        | YES         | true              |

---

## 3. Colonne `profiles` utili per il trainer (identità / contatti / luogo)

Da riutilizzare per il blocco identità e contatti del profilo trainer:

| column_name         | data_type                | max_length | is_nullable |
| ------------------- | ------------------------ | ---------- | ----------- |
| id                  | uuid                     | -          | NO          |
| user_id             | uuid                     | -          | NO          |
| nome                | character varying        | 100        | YES         |
| cognome             | character varying        | 100        | YES         |
| email               | text                     | -          | NO          |
| phone               | text                     | -          | YES         |
| telefono            | text                     | -          | YES         |
| avatar              | text                     | -          | YES         |
| avatar_url          | text                     | -          | YES         |
| citta               | character varying        | 100        | YES         |
| provincia           | character varying        | 50         | YES         |
| nazione             | character varying        | 50         | YES         |
| cap                 | character varying        | 10         | YES         |
| indirizzo           | text                     | -          | YES         |
| indirizzo_residenza | text                     | -          | YES         |
| data_nascita        | date                     | -          | YES         |
| professione         | character varying        | 100        | YES         |
| stato               | text                     | -          | YES         |
| codice_fiscale      | character varying        | 16         | YES         |
| note                | text                     | -          | YES         |
| created_at          | timestamp with time zone | -          | YES         |
| updated_at          | timestamp with time zone | -          | YES         |

**Uso:** Nome, cognome, email, avatar/avatar_url, telefono/phone, città, provincia, nazione, indirizzo, data_nascita, professione, stato, codice_fiscale restano in `profiles`. I blocchi “profilo professionale” (bio, formazione, certificazioni, specializzazioni, metodo, risultati, testimonianze, esperienze, etica, legale, statistiche, media) andranno in tabelle dedicate (es. `trainer_profiles` + tabelle 1:N).

---

## 4. Tabella `trainer_athletes`

Esiste già una tabella `trainer_athletes`. Da verificare se è sinonimo di `pt_atleti` o ha uno scopo diverso (es. vista/materialized view o storico).

**Da fare:** Query `information_schema.columns` su `trainer_athletes` per documentare struttura e relazione con `profiles.id` / `pt_atleti`.

---

## 5. Storage buckets

| id                      | name                    | public | file_size_limit | allowed_mime_types   |
| ----------------------- | ----------------------- | ------ | --------------- | -------------------- |
| avatars                 | avatars                 | true   | 2097152 (2MB)   | ["image/*"]          |
| athlete-certificates    | athlete-certificates    | false  | 10485760 (10MB) | PDF, jpeg, png, jpg  |
| athlete-documents       | athlete-documents       | false  | 10485760        | PDF, images, doc     |
| athlete-progress-photos | athlete-progress-photos | false  | 5242880 (5MB)   | jpeg, png, jpg, webp |
| athlete-referti         | athlete-referti         | false  | 10485760        | PDF, images          |
| documents               | documents               | false  | 10485760        | PDF, images          |
| exercise-thumbs         | exercise-thumbs         | true   | -               | -                    |
| exercise-videos         | exercise-videos         | true   | 52428800 (50MB) | video/\*             |
| general-files           | general-files           | false  | -               | _/_                  |
| progress-photos         | progress-photos         | false  | 5242880         | image/\*             |

**Per il profilo trainer:**

- **Avatar professionale:** bucket `avatars` (già pubblico, 2MB, image/\*). Path per trainer: es. `avatars/{profile_id}/avatar.png` (stesso schema atleti/trainer).
- **Certificati / documenti trainer:** usare `documents` (o creare bucket dedicato `trainer-certificates`) con policy per `profile_id` = trainer.
- **Galleria / video presentazione:** valutare `general-files` o nuovo bucket `trainer-media` con policy e limiti (es. max 10 immagini, 1 video 90 sec).

---

## 6. RLS su `profiles`

| policyname                            | cmd    | permissive | roles         | note                                                                                                                      |
| ------------------------------------- | ------ | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| profiles_select_own                   | SELECT | PERMISSIVE | authenticated | user_id = auth.uid()                                                                                                      |
| profiles_update_own                   | UPDATE | PERMISSIVE | authenticated | user_id = auth.uid()                                                                                                      |
| Admins can view all profiles          | SELECT | PERMISSIVE | authenticated | is_admin()                                                                                                                |
| Trainers can view assigned athletes   | SELECT | PERMISSIVE | authenticated | get_current_trainer_profile_id() IS NOT NULL AND role in (atleta, athlete) AND is_athlete_assigned_to_current_trainer(id) |
| Trainers can update assigned athletes | UPDATE | PERMISSIVE | authenticated | come sopra                                                                                                                |
| profiles_insert_admin_own_org         | INSERT | PERMISSIVE | authenticated | solo admin stessa org                                                                                                     |
| Service role can delete profiles      | DELETE | PERMISSIVE | service_role  | true                                                                                                                      |

**Implicazioni per profilo trainer:**

- Il trainer può leggere e aggiornare **solo il proprio** profilo tramite `profiles_update_own` (user_id = auth.uid()).
- Le nuove tabelle (es. `trainer_profiles`, `trainer_education`, …) dovranno avere policy tipo: SELECT/UPDATE/INSERT dove `profile_id = auth_profile_id()` e role trainer (o FK a profiles.id del trainer).

---

## 7. Funzioni RPC / helper trainer

| function_name                          | arguments               | result_type                                                                               |
| -------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| get_current_trainer_profile_id         | -                       | uuid                                                                                      |
| get_my_trainer_profile                 | -                       | TABLE(pt_nome text, pt_cognome text, pt_email text, pt_telefono text, pt_avatar_url text) |
| is_athlete_assigned_to_current_trainer | athlete_profile_id uuid | boolean                                                                                   |

- **get_current_trainer_profile_id:** restituisce `profiles.id` del trainer loggato (se role pt/trainer), altrimenti NULL. Usato dalle policy RLS.
- **get_my_trainer_profile:** per atleta loggato, restituisce nome, cognome, email, telefono, avatar_url del trainer assegnato (via pt_atleti). Usato in app (card “Il tuo trainer”, pagina profilo trainer atleta).
- **is_athlete_assigned_to_current_trainer:** usato nelle policy per limitare visibilità atleti al proprio trainer.

Per il **profilo trainer esteso** si potrà aggiungere una RPC tipo `get_trainer_public_profile(profile_id uuid)` che restituisce solo i campi “pubblici” del profilo completo (per card marketplace / atleti), con controllo che il chiamante sia atleta assegnato o admin.

---

## 8. Tabella `pt_atleti`

| column_name | data_type                | is_nullable |
| ----------- | ------------------------ | ----------- |
| id          | uuid                     | NO          |
| pt_id       | uuid                     | NO          |
| atleta_id   | uuid                     | NO          |
| assigned_at | timestamp with time zone | YES         |
| created_at  | timestamp with time zone | YES         |

Collegamento atleta ↔ trainer: `pt_id` → `profiles.id` (trainer), `atleta_id` → `profiles.id` (atleta). Usata da `get_my_trainer_profile` e dalle policy “trainer vede solo atleti assegnati”.

---

## 9. Conteggio profili per `role`

| role          | cnt |
| ------------- | --- |
| atleta        | 70  |
| athlete       | 4   |
| trainer       | 2   |
| admin         | 1   |
| massaggiatore | 1   |
| nutrizionista | 1   |

I profili con ruolo trainer da considerare per il profilo esteso sono quelli con `role IN ('trainer', 'pt', 'staff')` (qui solo `trainer` e admin; verificare se esistono `pt` / `staff`).

---

## 10. Campionario profili trainer (esistenti)

| id           | role    | nome       | cognome    | email                 | citta | phone          | telefono       | data_nascita | professione | stato  | has_avatar | has_avatar_url |
| ------------ | ------- | ---------- | ---------- | --------------------- | ----- | -------------- | -------------- | ------------ | ----------- | ------ | ---------- | -------------- |
| (admin)      | admin   | Dmytro     | Kushniriuk | admin@22club.it       | null  | +39 3519951554 | +39 3519951554 | null         | null        | attivo | false      | false          |
| f6fdd6cb-... | trainer | Francesco  | Bernotto   | b.francesco@22club.it | null  | null           | null           | null         | null        | attivo | true       | true           |
| 2c7934cf-... | trainer | Alessandro | null       | alessandro@22club.it  | null  | null           | null           | null         | null        | attivo | false      | false          |

**Conclusione:** Solo alcuni trainer hanno avatar_url valorizzato; citta, telefono, data_nascita, professione non sono ancora usati. Il profilo esteso può riempire questi campi in `profiles` (identità base) e il resto in tabelle dedicate.

---

## 11. Utilizzo colonne sui trainer (role pt/trainer/staff)

| total_trainers | has_nome | has_cognome | has_avatar_url | has_avatar | has_telefono | has_phone | has_citta | has_provincia | has_data_nascita | has_professione | has_codice_fiscale | has_indirizzo |
| -------------- | -------- | ----------- | -------------- | ---------- | ------------ | --------- | --------- | ------------- | ---------------- | --------------- | ------------------ | ------------- |
| 2              | 2        | 1           | 1              | 1          | 0            | 0         | 0         | 0             | 0                | 0               | 0                  | 0             |

**Da riutilizzare/subito utilizzabili:** nome, cognome, email, avatar_url (e avatar).  
**Da popolare con il profilo esteso:** telefono, phone, citta, provincia, data_nascita, professione (titolo professionale), codice_fiscale, indirizzo (e altri campi identità in `profiles` dove ha senso).

---

## 12. Valori distinti `profiles.role`

admin, athlete, atleta, massaggiatore, nutrizionista, trainer.

Non compare `pt` né `staff` nel campione; in codice spesso si usa `role IN ('pt', 'trainer', 'staff')`. Verificare in app se `pt`/`staff` vengono scritti o normalizzati a `trainer`.

---

## 13. Foreign key verso `profiles` (riferimenti al trainer)

| table_name       | column_name           | referenced_table | referenced_column |
| ---------------- | --------------------- | ---------------- | ----------------- |
| appointments     | staff_id              | profiles         | id                |
| appointments     | trainer_id            | profiles         | id                |
| credit_ledger    | created_by            | profiles         | id                |
| inviti_atleti    | pt_id                 | profiles         | id                |
| payments         | created_by_staff_id   | profiles         | id                |
| pt_atleti        | pt_id                 | profiles         | id                |
| trainer_athletes | trainer_id            | profiles         | id                |
| workout_plans    | trainer_id            | profiles         | id                |
| workouts         | created_by_trainer_id | profiles         | id                |

Il “trainer” è identificato da `profiles.id`. Qualsiasi tabella di profilo esteso (es. `trainer_profiles`) avrà una FK `profile_id` → `profiles.id` con UNIQUE su `profile_id` (1:1).

---

## 14. Piano di utilizzo per il profilo trainer completo

1. **Identità e contatti (blocco 1):**  
   Usare e completare `profiles`: nome, cognome, titolo (in `professione` o nuova colonna `titolo_professionale`), data_nascita, citta, provincia, nazione, cap, indirizzo, telefono, avatar_url. Upload foto professionale nel bucket `avatars` (stesso path per trainer). Nuovi campi se servono: es. `modalita_lavoro` (array o jsonb), `anni_esperienza` (integer), `stato_profilo` (testo/enum).

2. **Bio, metodo, etica, legale, statistiche (blocchi 2, 5, 6, 12, 13, 15):**  
   Nuova tabella `trainer_profiles` (1:1 con `profiles`, solo per role trainer/pt/staff): descrizione_breve, descrizione_estesa, filosofia, perche_lavoro, target_clienti, booleani metodo (valutazione_iniziale, test_funzionali, …), booleani etica (no_doping, …), partita_iva, assicurazione, consenso_immagini, kpi/testi statistiche, ecc.

3. **Formazione, certificazioni, corsi (blocco 3):**  
   Tabelle 1:N: `trainer_education` (tipo: laurea/diploma), `trainer_certifications` (nome, ente, anno, numero, stato, url_file), `trainer_courses` (nome, durata, anno).

4. **Specializzazioni (blocco 4):**  
   Tabella `trainer_specializations` (nome, livello, anni_esperienza).

5. **Risultati e trasformazioni (blocco 6):**  
   `trainer_transformations` (prima/dopo, durata, obiettivo, risultato, verificato, url_immagini, consenso).

6. **Testimonianze (blocco 7):**  
   `trainer_testimonials` (nome_cliente, eta, obiettivo, durata, risultato, feedback, valutazione 1-5).

7. **Esperienza lavorativa (blocco 8):**  
   `trainer_experience` (struttura, ruolo, periodo, collaborazioni, atleti_seguiti).

8. **Strumenti (blocco 11):**  
   In `trainer_profiles` o tabella dedicata: app_monitoraggio, software_programmazione, metodi_misurazione.

9. **Media (blocco 16):**  
   Galleria e video: storage (es. `trainer-media` o cartelle in `general-files`) + campi in `trainer_profiles` (url_video_presentazione, url_galleria o array di path).

10. **RLS e RPC:**  
    Su ogni tabella `trainer_*`: policy che consentono SELECT/INSERT/UPDATE/DELETE solo se `profile_id` corrisponde al trainer loggato (tramite `get_current_trainer_profile_id()` o equivalente). Per lettura “pubblica” da atleti assegnati: RPC `get_trainer_public_profile(profile_id)` con controllo su `pt_atleti`.

---

## 15. Prossimi passi tecnici

- [ ] Verificare struttura e utilizzo di `trainer_athletes` vs `pt_atleti`.
- [ ] Definire schema esatto di `trainer_profiles` e tabelle 1:N (migration).
- [ ] Decidere storage per certificati e media trainer (bucket/policy).
- [ ] Implementare migration, RLS e eventuali RPC.
- [ ] Estendere dashboard/impostazioni: tab o sezione “Profilo professionale” con form per ogni blocco e upload.
