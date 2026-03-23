# Audit architetturale – Stato attuale 22Club

Documento tecnico che descrive la struttura attuale del progetto 22Club basandosi esclusivamente sul codice esistente. Solo analisi, nessuna modifica né proposta di refactor.

---

## 1. DATABASE STRUCTURE

### 1.1 Elenco tabelle

Dalle migrations e da `src/lib/supabase/types.ts` risultano le seguenti tabelle pubbliche:

| Tabella                                                                                                                                                                            | Descrizione sintetica                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **roles**                                                                                                                                                                          | Ruoli nominali (admin, pt, trainer, atleta, athlete). Non include nutrizionista/massaggiatore.                      |
| **profiles**                                                                                                                                                                       | Utenti: id, user_id (FK auth.users), org_id, nome/cognome, email, **role**, avatar, stato, first_login, ecc.        |
| **appointments**                                                                                                                                                                   | Appuntamenti: staff_id, athlete_id, trainer_id, org_id, starts_at, ends_at, type, status, is_open_booking_day, ecc. |
| **pt_atleti**                                                                                                                                                                      | Assegnazione trainer ↔ atleta (pt_id, atleta_id). UNIQUE(pt_id, atleta_id).                                         |
| **staff_atleti**                                                                                                                                                                   | Assegnazione staff (nutrizionista/massaggiatore) ↔ atleta (staff_id, atleta_id).                                    |
| **inviti_atleti**                                                                                                                                                                  | Inviti trainer → atleta (email, stato, pt_id, ecc.).                                                                |
| **inviti_cliente**                                                                                                                                                                 | Inviti staff (nutrizionista/massaggiatore) → atleta: staff_id, atleta_id, stato, expires_at, responded_at.          |
| **exercises**                                                                                                                                                                      | Esercizi: org_id, created_by, nome, descrizione, ecc.                                                               |
| **workouts**                                                                                                                                                                       | Template workout: org_id, created_by, nome.                                                                         |
| **workout_days**                                                                                                                                                                   | Giorni di un workout.                                                                                               |
| **workout_day_exercises**                                                                                                                                                          | Esercizi per giorno.                                                                                                |
| **workout_sets**                                                                                                                                                                   | Set per esercizio.                                                                                                  |
| **workout_plans**                                                                                                                                                                  | Schede assegnate: athlete_id, created_by, nome, ecc.                                                                |
| **workout_logs**                                                                                                                                                                   | Log allenamenti: athlete_id/atleta_id, workout_plan_id, ecc.                                                        |
| **documents**                                                                                                                                                                      | Documenti: org_id, profile_id, tipo, storage path.                                                                  |
| **payments**                                                                                                                                                                       | Pagamenti: org_id, athlete_id, amount, created_by, ecc.                                                             |
| **lesson_counters**                                                                                                                                                                | Contatori lezioni per athlete_id.                                                                                   |
| **notifications**                                                                                                                                                                  | Notifiche: user_id, title, message, type, is_read.                                                                  |
| **chat_messages**                                                                                                                                                                  | Messaggi chat: sender_id, receiver_id (profile id), content, read_at.                                               |
| **cliente_tags**                                                                                                                                                                   | Tag per clienti.                                                                                                    |
| **profiles_tags**                                                                                                                                                                  | Associazione profile_id ↔ tag_id.                                                                                   |
| **progress_logs**                                                                                                                                                                  | Log progressi (athlete_id come user_id o profile id a seconda di contesto).                                         |
| **progress_photos**                                                                                                                                                                | Foto progressi.                                                                                                     |
| **audit_logs**                                                                                                                                                                     | Log audit.                                                                                                          |
| **push_subscriptions**                                                                                                                                                             | Sottoscrizioni push.                                                                                                |
| **user_settings**                                                                                                                                                                  | Impostazioni utente (user_id).                                                                                      |
| **credit_ledger**                                                                                                                                                                  | Movimenti credito.                                                                                                  |
| **communications**                                                                                                                                                                 | Comunicazioni.                                                                                                      |
| **communication_recipients**                                                                                                                                                       | Destinatari comunicazioni.                                                                                          |
| **athlete_questionnaires**                                                                                                                                                         | Questionari atleta.                                                                                                 |
| **athlete_medical_data**                                                                                                                                                           | Dati medici atleta (athlete_id).                                                                                    |
| **athlete_fitness_data**                                                                                                                                                           | Dati fitness.                                                                                                       |
| **athlete_nutrition_data**                                                                                                                                                         | Dati nutrizione.                                                                                                    |
| **athlete_massage_data**                                                                                                                                                           | Dati massaggio.                                                                                                     |
| **athlete_motivational_data**                                                                                                                                                      | Dati motivazionali.                                                                                                 |
| **athlete_administrative_data**                                                                                                                                                    | Dati amministrativi.                                                                                                |
| **athlete_smart_tracking_data**                                                                                                                                                    | Dati tracking.                                                                                                      |
| **athlete_ai_data**                                                                                                                                                                | Dati AI.                                                                                                            |
| **trainer_profiles**                                                                                                                                                               | Estensione profilo trainer (profile_id FK profiles).                                                                |
| **trainer_education**, **trainer_certifications**, **trainer_courses**, **trainer_specializations**, **trainer_experience**, **trainer_testimonials**, **trainer_transformations** | Dati aggiuntivi trainer.                                                                                            |

View: **payments_per_staff_view**, **progress_trend_view**, **workout_stats_mensili**.

### 1.2 Colonne principali e foreign key

- **profiles**: `id` (PK), `user_id` (UNIQUE → auth.users), `org_id` (TEXT, default `'default-org'`), `role` (VARCHAR, CHECK: admin, pt, trainer, atleta, athlete, nutrizionista, massaggiatore). Nessuna FK su `roles` in stato attuale (rimossa per consentire delete profile).
- **appointments**: `staff_id`, `athlete_id`, `trainer_id` → profiles(id); `org_id`.
- **pt_atleti**: `pt_id`, `atleta_id` → profiles(id); UNIQUE(pt_id, atleta_id).
- **staff_atleti**: `staff_id`, `atleta_id` → profiles(id). Tabella referenziata da RLS e types; CREATE TABLE non individuata nelle migrations analizzate (presenza da types e policy).
- **inviti_cliente**: `staff_id`, `atleta_id` → profiles(id); `stato`, `expires_at`, `responded_at`. Usata da RPC `get_inviti_cliente_pendenti_staff`. CREATE TABLE non individuata nelle migrations analizzate (presenza da types e RPC).
- **roles**: `name` UNIQUE CHECK (admin, pt, trainer, atleta, athlete). Colonna `permissions` JSONB presente; i ruoli nutrizionista/massaggiatore non sono in questa tabella ma solo in `profiles.role` (CHECK aggiunto in migration `20260109_add_nutrizionista_massaggiatore_roles.sql`).

### 1.3 Presenza org_id

Tabelle con **org_id** (tipicamente DEFAULT `'default-org'`):

- profiles
- appointments
- exercises
- workouts
- documents
- payments

Altre tabelle (es. pt*atleti, staff_atleti, workout_plans, chat_messages, inviti*\_, athlete\_\_, notifications, …) non hanno colonna org_id; l’isolamento è per relazione (pt_atleti, staff_atleti) o per created_by/athlete_id.

### 1.4 Relazioni trainer ↔ atleta

- **pt_atleti**: legame esplicito PT–atleta. Un atleta può avere più PT (più righe con stesso atleta_id e pt_id diversi).
- **inviti_atleti**: invito da trainer ad atleta (email, pt_id, stato); accettazione tipicamente crea riga in pt_atleti (logica in app/RPC).

### 1.5 Ruoli e assegnazioni staff–atleta

- **Ruoli in DB**: `profiles.role` con CHECK che include admin, pt, trainer, atleta, athlete, nutrizionista, massaggiatore. Tabella `roles` contiene solo admin, pt, trainer, atleta, athlete.
- **Staff (nutrizionista/massaggiatore) ↔ atleta**:
  - **inviti_cliente**: invito da staff ad atleta (stato in_attesa/accettato/rifiutato); scadenza e responded_at.
  - **staff_atleti**: legame confermato staff*id–atleta_id; usato da RLS per visibilità dati (profiles, workout_plans, workout_logs, appointments, athlete*\*\_data, storage, chat). Nutrizionista e massaggiatore esistono a livello DB (profiles.role) e nella relazione staff_atleti; non solo UI.

### 1.6 RLS (Row Level Security)

- **Funzioni helper (SECURITY DEFINER)** usate nelle policy:
  - `get_current_user_role()`: ruolo dell’utente corrente da profiles (con disabilitazione RLS per evitare ricorsione).
  - `get_profile_id_from_user_id(uuid)`: da user_id a profile id.
  - `get_current_trainer_profile_id()`: profile id del trainer/staff corrente (ruolo in pt, trainer, nutrizionista, massaggiatore); NULL se non in quel set.
  - `is_athlete_assigned_to_trainer(athlete_id)`: atleta in pt_atleti per il trainer corrente.
  - `is_admin()`: ruolo admin.

- **Modello di accesso**:
  - **Role-based**: policy distinte per admin, trainer (pt/trainer), nutrizionista, massaggiatore, atleta.
  - **Org-based**: dove presente, filtro su `org_id` (es. appointments, chat: stesso org_id; RPC `get_conversation_participants` filtra per org_id; slot “libera prenotazione” per org_id).
  - **Owner/trainer-based**: visibilità dati atleta tramite pt_atleti (trainer vede solo atleti assegnati).
  - **Staff-based**: nutrizionista/massaggiatore vedono solo atleti in staff*atleti (profiles, workout_plans, workout_logs, appointments, athlete*\*\_data, storage certificati/referti, chat).
  - **Owner-based (propria riga)**: “Users can view own profile”, “Users can update own profile”; policy staff escludono esplicitamente la riga del proprio profilo (id IS DISTINCT FROM get_profile_id_from_user_id(auth.uid())) per evitare problemi al login.

- **Sintesi**: il sistema è **ibrido** (role-based + org-based + owner/trainer/staff). Non esiste una tabella `permissions`; i permessi sono espressi da policy RLS e da ruolo in `profiles.role`.

- **staff_atleti**: in una migration successiva (rollback) RLS su `staff_atleti` è stato disabilitato; le policy che _usano_ staff_atleti (su altre tabelle) restano attive e leggono dalla tabella senza RLS su staff_atleti stessa.

- Policy per tabella (sintesi): ogni tabella business ha multiple policy (SELECT/INSERT/UPDATE/DELETE) che combinano ruolo, org_id dove presente, pt_atleti per trainer, staff_atleti per nutrizionista/massaggiatore, e “own row” per l’utente.

### 1.7 Modello di ownership e accesso dati

- **Ownership**: profilo “possiede” la propria riga in profiles; trainer “possiede” visibilità su atleti in pt_atleti; staff “possiede” visibilità su atleti in staff_atleti; admin ha visibilità ampia (policy permissive dove previsto).
- **Accesso dati**: filtrato da RLS in base a ruolo + org_id (se presente) + pt_atleti/staff_atleti. Chat e conversazioni filtrate per org_id e per relazione (pt o staff_atleti). Upload/storage (documenti, certificati, referti, avatar) con policy per ruolo e relazione atleta–trainer/staff.

---

## 2. ROUTING STRUCTURE

### 2.1 Struttura route (App Router)

- **Pubbliche (no auth)**: `/`, `/login`, `/auth/*`, `/registrati`, `/forgot-password`, `/reset-password`, `/reset`, `/privacy`, `/termini`, `/design-system`.
- **Root**: `/` → redirect a `/login`.
- **Post-login (middleware)**:
  - **admin** → `/dashboard/admin`
  - **trainer** (pt/trainer) → `/dashboard`
  - **athlete** (atleta/athlete) → `/welcome` se `first_login === true`, altrimenti `/home`
  - **nutrizionista** → `/dashboard/nutrizionista`
  - **massaggiatore** → `/dashboard/massaggiatore`
- **Area atleta** (`/home`): solo ruolo athlete; sotto-route: `/home`, `/home/allenamenti`, `/home/allenamenti/oggi`, `/home/allenamenti/[id]`, `/home/allenamenti/esercizio/[exerciseId]`, `/home/allenamenti/riepilogo`, `/home/appuntamenti`, `/home/chat`, `/home/documenti`, `/home/pagamenti`, `/home/progressi`, `/home/profilo`, `/home/foto-risultati`, `/home/nutrizionista`, `/home/massaggiatore`, `/home/trainer`.
- **Area staff** (`/dashboard`): atleti non possono accedere (redirect a `/home`). Sotto-route: `/dashboard`, `/dashboard/admin`, `/dashboard/admin/utenti`, `/dashboard/admin/ruoli`, `/dashboard/admin/organizzazioni`, `/dashboard/admin/statistiche`, `/dashboard/calendario`, `/dashboard/clienti`, `/dashboard/atleti`, `/dashboard/atleti/[id]`, `/dashboard/chat`, `/dashboard/profilo`, `/dashboard/impostazioni`, `/dashboard/nutrizionista`, `/dashboard/massaggiatore`, `/dashboard/schede`, `/dashboard/schede/nuova`, `/dashboard/schede/[id]/modifica`, `/dashboard/esercizi`, `/dashboard/allenamenti`, `/dashboard/appuntamenti`, `/dashboard/documenti`, `/dashboard/pagamenti`, `/dashboard/abbonamenti`, `/dashboard/statistiche`, `/dashboard/comunicazioni`, `/dashboard/invita-atleta`.
- **Nutrizionista / massaggiatore**: middleware limita a path esplicitamente consentiti: `/dashboard/nutrizionista`, `/dashboard/massaggiatore`, `/dashboard/calendario`, `/dashboard/clienti`, `/dashboard/atleti`, `/dashboard/chat`, `/dashboard/profilo`, `/dashboard/impostazioni` (e sotto-path). Accesso ad altre sotto-route dashboard non in lista → redirect alla rispettiva home (`/dashboard/nutrizionista` o `/dashboard/massaggiatore`).
- **Solo atleti**: `/welcome` accessibile solo con ruolo athlete.

### 2.2 Separazione per ruolo

- **Route**: netta separazione `/home` (atleta) vs `/dashboard` (staff: admin, trainer, nutrizionista, massaggiatore). Admin e trainer hanno accesso completo a `/dashboard`; nutrizionista e massaggiatore solo a un sottoinsieme di path.
- **Layout**: layout root condiviso; layout specifici per `dashboard` e per `home` (sidebar e navigazione diverse).

### 2.3 Flusso login → redirect

- Utente non autenticato su route protetta → redirect a `/login` con `redirectedFrom` opzionale.
- Dopo login, middleware legge `profiles.role` e `first_login` (con cache 1 minuto); redirect in base a ruolo e first_login come sopra. Normalizzazione ruoli: pt → trainer, atleta → athlete, owner → admin, staff → trainer.

### 2.4 Autorizzazione

- **Middleware**: protegge route; non esegue chiamate DB per route pubbliche/statiche; per route protette verifica sessione e ruolo e applica redirect. Con `CAPACITOR=true` il middleware è bypassato (protezione demandata a client).
- **Client**: componenti/layout possono usare contesto ruolo (es. RoleLayout) per mostrare/nascondere UI; la sicurezza effettiva resta su RLS.
- **Server**: API route sotto `/api` non risultano protette dal middleware (matcher esclude `api`); eventuale controllo auth/ruolo è nei singoli handler.

### 2.5 Duplicazioni

- **/home vs /dashboard**: non duplicazione funzionale: `/home` è area atleta, `/dashboard` area staff; percorsi e layout distinti.
- **Pagine “doppie” per ruolo**: esistono sia `/dashboard/nutrizionista` e `/dashboard/massaggiatore` sia `/home/nutrizionista` e `/home/massaggiatore` (vista atleta verso nutrizionista/massaggiatore).

---

## 3. ACCESS CONTROL MODEL (RBAC)

### 3.1 Tabella roles e permissions

- **roles**: esiste; colonne id, name, description, permissions (JSONB), created_at, updated_at. Constraint su `name`: admin, pt, trainer, atleta, athlete. **Nutrizionista e massaggiatore non sono in `roles`**; sono solo valori ammessi in `profiles.role` (CHECK).
- **permissions**: non esiste una tabella `permissions` separata; il campo `roles.permissions` è JSONB (uso non analizzato nel dettaglio). I permessi effettivi sono definiti da:
  - RLS (policy per tabella),
  - middleware (path per ruolo),
  - logica client (cosa mostrare per ruolo).

### 3.2 Ruoli hardcoded

- Ruoli usati nel codice (middleware, RLS, app) sono stringhe fisse: admin, pt, trainer, atleta, athlete, nutrizionista, massaggiatore. Normalizzazione pt→trainer, atleta→athlete, owner→admin nel middleware.
- Nessun sistema dinamico “ruoli da DB che definiscono permessi”; il comportamento è legato a questi ruoli e alle policy RLS scritte per essi.

### 3.3 Punti in cui si controlla l’accesso

- **Campo role nel profilo**: usato da middleware (redirect), da RLS tramite `get_current_user_role()` e da client per UI.
- **Client**: layout e componenti che nascondono/mostrano in base al ruolo (es. dashboard vs home).
- **RLS**: principale meccanismo di autorizzazione sui dati; ogni tabella ha policy che usano ruolo, pt_atleti, staff_atleti, org_id.
- **Middleware**: solo controllo route (chi può andare su /home vs /dashboard e sotto-path); non sostituisce RLS.

### 3.4 Tipo di modello

- **Modello attuale**: RBAC “a ruoli fissi” con isolamento dati per relazione (pt_atleti, staff_atleti) e per org (org_id dove presente). Nessun ABAC fine-grained né tabella permessi per azione.

### 3.5 Punti di forza

- Ruoli chiari; separazione netta atleta vs staff e path dedicati.
- RLS garantisce che anche client compromesso non veda dati oltre quanto consentito da ruolo e relazioni.
- Funzioni SECURITY DEFINER evitano ricorsione RLS su profiles e centralizzano “chi è l’utente” e “a chi è assegnato”.

### 3.6 Limitazioni

- Aggiungere un nuovo ruolo richiede modifiche a middleware, RLS e possibilmente CHECK su profiles/roles.
- Tabella `roles` non allineata ai ruoli effettivi (mancano nutrizionista, massaggiatore).
- Permessi non configurabili da back-office; tutto dipende da codice e migrations.

### 3.7 Scalabilità futura

- Estendere a molti ruoli o permessi granulari richiederebbe un modello di permessi (es. tabella permissions + role_permissions) e policy RLS che lo usino, più gestione nel middleware/app. Oggi il modello è adeguato a un set piccolo e stabile di ruoli.

---

## 4. STAFF–ATHLETE RELATIONSHIP MODEL

### 4.1 Collegamento trainer ↔ atleta

- **Tabella pt_atleti**: colonne pt_id, atleta_id (entrambe FK profiles.id), UNIQUE(pt_id, atleta_id). Un atleta può avere più trainer; un trainer molti atleti.
- **inviti_atleti**: invito da trainer (pt_id/invited_by) ad atleta (email/stato); flusso di accettazione gestito in app; l’accettazione crea la riga in pt_atleti (logica non verificata nelle migrations ma coerente con uso).

### 4.2 Collegamento staff (nutrizionista/massaggiatore) ↔ atleta

- **Tabella staff_atleti**: staff_id, atleta_id (FK profiles.id). Rappresenta il legame “confermato” tra staff e atleta.
- **Tabella inviti_cliente**: staff_id, atleta_id, stato (es. in_attesa), expires_at, responded_at. Flusso: staff invita atleta; atleta accetta/rifiuta; in caso di accettazione viene creata (o già presente) la riga in staff_atleti. RPC `get_inviti_cliente_pendenti_staff` legge inviti in attesa per lo staff corrente.
- Non esiste un unico “trainer_id” sull’atleta: il legame è solo tramite tabelle pivot pt_atleti e staff_atleti.

### 4.3 Più trainer

- Sì: più righe in pt_atleti con stesso atleta_id e pt_id diversi. Più staff: più righe in staff_atleti con stesso atleta_id e staff_id diversi.

### 4.4 Nutrizionista e massaggiatore a livello DB

- **Sì**: profili con role = nutrizionista o massaggiatore; tabella staff_atleti e inviti_cliente; RLS e RPC che distinguono esplicitamente nutrizionista e massaggiatore. Non solo UI: dati e visibilità sono modellati in DB e RLS.

### 4.5 Limiti e dipendenze

- RLS e funzioni helper (get_current_trainer_profile_id, get_current_user_role) sono usate ovunque; modifiche al modello staff/atleta richiedono aggiornare molte policy.
- staff_atleti ha RLS disabilitata (rollback); l’accesso in lettura/scrittura alla tabella non è filtrato da RLS; le altre tabelle che “guardano” staff_atleti per decidere la visibilità restano corrette.
- Inviti e accettazioni (inviti_atleti, inviti_cliente → pt_atleti/staff_atleti) dipendono da logica in app o RPC; non tutte le transizioni potrebbero essere garantite solo da DB/trigger.

---

## 5. MULTI-TENANCY ANALYSIS

### 5.1 Presenza di organizations / org_members

- **organizations**: non risulta una migration che crei la tabella `organizations`. In `2025_security_policies.sql` esiste un blocco condizionale `IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations')` che aggiunge RLS su organizations; quindi il codice è pronto solo nel caso la tabella esista altrove o sia creata a mano.
- **org_members**: non risulta in migrations né in types; non c’è modello “membro di organizzazione” esplicito.

### 5.2 Uso di org_id

- **Con org_id**: profiles, appointments, exercises, workouts, documents, payments (default `'default-org'`). Altre tabelle (pt*atleti, staff_atleti, inviti*_, workout*plans, chat_messages, athlete*_, ecc.) non hanno org_id.
- **RLS**: dove usato, il filtro è sul proprio org (es. `org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid())`); chat e slot “libera prenotazione” usano org_id; appointments e exercises filtrati per org.

### 5.3 Single-org vs multi-org

- **Stato attuale**: di fatto **single-org**: valore tipico `'default-org'`; nessuna tabella organizzazioni né org_members; un solo org_id per profilo. Il codice è predisposto (colonna org_id e policy condizionali) per un eventuale multi-org, ma il modello dati non è multi-tenant completo.

### 5.4 Rischi

- Introduzione futura di multi-org senza tabella organizations/org_members e senza vincoli su org_id potrebbe portare a dati inconsistenti (org_id arbitrari, nessuna lista “organizzazioni”).
- Tabelle senza org_id (es. workout_plans, chat_messages) andrebbero eventualmente estese e tutte le policy allineate se si volesse isolamento rigoroso per organizzazione.

---

## 6. ARCHITECTURAL SUMMARY

### 6.1 Cosa è già corretto

- Separazione chiara atleta (/home) vs staff (/dashboard) e redirect post-login coerenti con ruolo e first_login.
- RLS esteso e uso di funzioni SECURITY DEFINER per evitare ricorsione e centralizzare ruolo/profile_id.
- Modello relazionale trainer–atleta (pt_atleti) e staff–atleta (staff_atleti, inviti_cliente) esplicito e usato in modo coerente nelle policy.
- Presenza di org_id su tabelle principali e filtri RLS dove necessario per un eventuale uso multi-org.
- Tipizzazione TypeScript (types.ts) allineata allo schema (tabelle, view, RPC).

### 6.2 Cosa è fragile

- Tabella `roles` non allineata ai ruoli effettivi (mancano nutrizionista, massaggiatore); profili.role con CHECK più ampio.
- staff_atleti con RLS disabilitata: la tabella è leggibile/modificabile senza filtro RLS; l’isolamento dipende solo dalle altre tabelle che la usano in USING/WITH CHECK.
- Molte policy RLS e funzioni helper: cambi al modello ruolo/relazioni richiedono revisione estesa.
- Ruoli e path consentiti hardcoded in middleware e in policy; aggiunta di un nuovo ruolo richiede toccare più punti.

### 6.3 Cosa bloccherebbe la scalabilità

- Assenza di un modello organizzazioni (organizations + org_members) e di isolamento completo per org su tutte le tabelle rilevanti: scaling a molti tenant sarebbe incompleto.
- Mancanza di un sistema di permessi configurabile (tabella permissions / role_permissions): scaling a molti ruoli o permessi granulari sarebbe difficile senza refactor.
- Dipendenza da ruoli fissi in middleware e RLS: ogni nuovo ruolo moltiplica le eccezioni e i branch.

### 6.4 Cosa è facilmente estendibile

- Aggiungere colonne o tabelle “athlete*\*” o “trainer*\*” seguendo lo schema esistente.
- Replicare il pattern di policy “staff vede solo atleti in staff_atleti” per nuove tabelle dati atleta.
- Estendere i path consentiti a nutrizionista/massaggiatore nel middleware (lista allowedPaths).
- Aggiungere RPC e view senza cambiare il modello di accesso.

### 6.5 Livello di maturità architetturale

- **Stima: 6–7/10.** Modello dati e RLS solidi per single-org e ruoli attuali; routing e ruoli chiari; estensione a multi-tenant e a RBAC configurabile non è coperta; coerenza roles vs profiles.role e RLS disabilitata su staff_atleti riducono leggermente il punteggio.

---

_Documento generato da analisi del codice (migrations, types.ts, middleware, app). Nessuna modifica applicata._
