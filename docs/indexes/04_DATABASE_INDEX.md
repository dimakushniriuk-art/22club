# Database Index

Indice operativo per dati, RLS e multi-tenant.  
**Fonti verificate per questo file:** `audit/database_files.txt`, `audit/CANONICAL_SOURCES.md`, `audit/RULE_CONFLICTS.md`.  
Altri riferimenti (es. `audit/FEATURE_STATUS.md`, `audit/rls/*`) solo dove esplicitamente citati sotto.
Governance operativa migrazioni: `docs/indexes/11_DB_MIGRATION_GOVERNANCE.md`.

---

## 1. Panoramica DB

- **Tipo:** PostgreSQL ospitato su **Supabase** (Auth + API + RLS).
- **Ruolo RLS:** vincoli **server-side** su righe/colonne; il client non può aggirare policy corrette senza privilegi elevati (service role) o bug di configurazione.
- **Frontend e API:** accesso tramite client Supabase (browser/server) e **API Route** Next.js; le query passano comunque dal ruolo JWT → **RLS filtra** ciò che è permesso. L’app aggiunge filtri e regole di business; dove divergono da RLS o da altre query nascono **incoerenze visibili solo in alcuni flussi**.

---

## 2. Fonte canonica dati

| Cosa                  | Dove sta la verità (audit)                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`org_id` (tenant)** | Riga **`profiles.org_id`** legata all’utente autenticato; contesto stabilizzato anche via `src/app/api/auth/context/route.ts` (`audit/CANONICAL_SOURCES.md`).                                                                                    |
| **Recupero utente**   | Supabase Auth (`auth.users`); profilo applicativo in **`profiles`**. Catena attesa: **user → profile → `org_id`**. Helper: `src/lib/supabase/get-user-profile.ts`, `get-current-profile.ts` (vedi conflitto `getSession` / `getUser` in sez. 5). |
| **Auth vs dati**      | Permessi “duro” = **RLS + vincoli DB**. Routing/UX ruolo = app (`role-normalizer`, middleware, guard). **Non** assumere che il solo client coincida con RLS se query o payload sono diversi tra schermate.                                       |

---

## 3. Struttura dati (alto livello)

Solo elementi **citati negli audit** o in `database_files.txt` (nomi tabelle / file RLS / migrazioni). Nulla di sotto è uno schema SQL completo.

### Appointments (calendario)

- **Scopo:** prenotazioni staff/atleta, cancellazioni, impostazioni griglia/slot.
- **Tabelle principali (deducibili):** `appointments`, `appointment_cancellations`, `staff_calendar_settings` (migrazioni elencate in `database_files.txt`, es. `20250310_staff_calendar_settings.sql`, `20260318143000_appointments_rls_cleanup_v1.sql`, ecc.).
- **Domini collegati:** notifiche/reminder (`src/app/api/calendar/*`, `src/lib/notifications/*` — confine con comunicazioni **da verificare**), overlap (`update_check_overlap` in migrazioni citate).
- **Allineamento UI (post-consolidamento staff):** percorso **calendario staff**, **tabella staff** e **drag/resize** condividono blocchi calendario + `checkStaffCalendarSlotOverlap` in `appointment-utils` (**risolto** il divario precedente tra schermate; enforcement solo-DB **da verificare**).
- **Vista atleta:** **calendario** (`use-athlete-calendar-page`) e **lista prenotazioni** (`useAthleteAppointments` + `athlete-query-params`) sono entrypoint diversi; stessi vincoli RLS, filtri client complementari (vedi `RULE_CONFLICTS`).

### Profiles e anagrafica

- **Scopo:** utenti applicativi, ruolo, **`org_id`**, legame con Auth.
- **Tabelle principali:** `profiles`; identità Auth **`auth.users`**.
- **Domini collegati:** RBAC, redirect ruolo, relazioni trainer–atleta (vedi sotto).

### Relazioni trainer–atleta

- **Scopo:** collegamento staff ↔ atleta.
- **Nomenclatura (audit):** triade possibile / legacy — `pt_atleti`, `trainer_athletes`, `athlete_trainer_assignments` (`RULE_CONFLICTS`, `audit/rls/RLS_DUPLICATES.md` citato in indice precedente). **Unificazione schema:** da verificare lato SQL deployato.

### Pagamenti / ledger / abbonamenti

- **Scopo:** crediti, abbonamenti, export pagamenti.
- **Riferimenti file:** `supabase_rls_payments_abbonamenti.sql` (root, in `database_files.txt`); codice `src/lib/credits/ledger.ts`, `abbonamenti-service-type.ts` (`CANONICAL_SOURCES`). **Elenco tabelle preciso:** da tipi/schema Supabase rigenerati o DB — **da verificare** in questo indice.
- **Allineamento write path (post-consolidamento UI):** registrazione incasso staff → **`insert` su `payments`** poi **`addCreditFromPayment`** (`credit_ledger`, entry CREDIT). `addCreditFromPayment` **non** scrive su `lesson_counters` (aggiornamento atteso lato trigger DB coerente col ledger). I form `nuovo-pagamento-modal` e `payment-form-modal` seguono questo flusso; **`payment-form-modal` non aggiorna più `lesson_counters` dal client** (restano residui legacy su scelta `service_type` / UX rispetto al modale principale).

### Comunicazioni

- **Scopo:** invii massivi / liste destinatari.
- **Riferimenti file:** `supabase_rls_communications.sql`; lib `src/lib/communications/*`. **Tabelle esatte:** **da verificare** (non inventate qui).

### Esercizi / workout / piani

- **Scopo:** esercizi, piani allenamento, log.
- **Riferimenti:** `src/lib/workouts/**`, API athlete workout; migrazione `20250314_workout_plans_rls.sql`. **Tabelle nominative:** deducibili da tipi/migrazioni — **da verificare** elenco completo.

### Documenti

- **Scopo:** upload, storage, reminder documenti.
- **Riferimenti:** `supabase/functions/document-reminders/index.ts`; lib documenti in `CANONICAL_SOURCES`. Storage Supabase — policy **da verificare** su bucket/tabelle.

### Marketing

- **Scopo:** KPI, segmenti, refresh KPI.
- **Riferimenti:** `supabase/functions/marketing-kpi-refresh/index.ts`; API `src/app/api/marketing/**`.

### Chat e realtime

- **Scopo:** messaggistica; client `src/lib/realtimeClient.ts` (`CANONICAL_SOURCES`). **Schema tabelle messaggi:** **da verificare** (non elencato negli audit letti per questo file).

### Progressi / misurazioni

- **Scopo:** log progressi atleta.
- **Nota RLS (audit interno):** menzione `progress_logs` e policy `athlete_id = auth.uid()` in `RULE_CONFLICTS` (via `RLS_DUPLICATES`). **Allineamento:** da verificare su DB.

### Altre aree emerse (`database_files.txt`)

- Script root e backup: `backup_supabase.sql`, `supabase-backups/schema.sql`, `supabase-backups/data.sql` — **non** fonte runtime; uso diagnostico/backup.
- **`DOCUMENTAZIONE/*`:** storico analisi Supabase; incrocio con stato attuale **da verificare**.

---

## 4. RLS (Row Level Security)

- **Come funziona nel progetto:** policy PostgreSQL su tabelle esposte a PostgREST; valutazione per richiesta autenticata (JWT). Più policy **permissive** si combinano con OR; duplicati o helper diversi → comportamento opaco (`RULE_CONFLICTS`, `audit/rls/*`).
- **Dove si applica:** **database deployato**; il testo “ufficiale” nel repo include **`supabase/migrations/*.sql`** e script root elencati in `database_files.txt`. **Nota:** `RULE_CONFLICTS` conteneva la frase che in passato non risultavano migrazioni tracciate — oggi `database_files.txt` elenca `supabase/migrations/`; **allineamento git ↔ ambiente Supabase = da verificare**.
- **Dipendenza da `org_id`:** molte policy e report presumono tenant coerente; **`org_id` vs `org_id_text`** e fallback applicativi generano righe o esiti diversi tra schermate (vedi sez. 5).
- **Ruolo come verità finale:** per **cosa il DB permette**, conta **RLS + vincoli**. Il ruolo in `profiles` guida l’app ma **non** sostituisce una policy permissiva/errata sul DB.

---

## 5. Problemi critici (da `RULE_CONFLICTS`)

| Problema                                     | Sintesi                                                                                                                                                                                                                                                                                | Impatto tipico                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **`org_id` incoerente tra moduli**           | Scrittura staff tabella/calendario: **`resolveOrgIdForAppointmentWrite`** + **`requireCurrentOrgId`** (profilo prima del form; niente fallback implicito `default-org` nel hook tabella). Form può ancora inviare `org_id` assente. Residui: **`org_id_text`**, altri moduli, letture. | **Mitigato** sul write staff; **alto** finché restano colonne/policy duplicate e percorsi non migrati. |
| **`org_id_text` duplicato**                  | Due colonne semantiche per tenant; audit RLS (`RLS_DUPLICATES`) e `CANONICAL_SOURCES` trattano `org_id_text` come da eliminare dopo migrazione.                                                                                                                                        | Alto se policy o app usano criteri diversi.                                                            |
| **Query frontend vs RLS**                    | Esempio `useAthleteAppointments`: filtri solo per alcuni ruoli; altri ruoli staff dipendono solo da RLS.                                                                                                                                                                               | Alto se policy SELECT permissive; medio altrimenti.                                                    |
| **Stessa regola business, percorsi diversi** | Overlap slot staff: **allineati** calendario, tabella e drag/resize su `appointment-utils`.                                                                                                                                                                                            | **Risolto** (UI staff); **da verificare** vincolo DB e modal/dashboard fuori dagli hook consolidati.   |
| **Policy RLS duplicate / helper multipli**   | `get_profile_id_from_user_id` vs `get_current_staff_profile_id()`; policy sovrapposte su `appointments` / `appointment_cancellations` (riassunto in `RULE_CONFLICTS` da audit RLS).                                                                                                    | Critico/alto: bug “solo in produzione” o per ruolo.                                                    |
| **`auth.uid()` vs `profiles.id`**            | Possibile mismatch nelle condizioni policy (audit interno).                                                                                                                                                                                                                            | Alto: accessi inattesi o negazioni sporadiche.                                                         |
| **`getSession` vs `getUser`**                | Due ingressi per caricare profilo (`get-current-profile` vs `get-user-profile`).                                                                                                                                                                                                       | Medio: profilo null/401 sporadici tra API e middleware.                                                |
| **Liste “oggi”**                             | Criteri diversi tra `api/dashboard/appointments` e calendario.                                                                                                                                                                                                                         | Basso (UX / “perché non lo vedo?”).                                                                    |
| **`staff_id` vs `trainer_id`**               | Commenti su trigger che sincronizzano; filtro su `staff_id`.                                                                                                                                                                                                                           | Medio se invariante DB violata.                                                                        |

---

## 6. Regole canoniche

Definizioni da rispettare in review e nuove feature (allineate a `CANONICAL_SOURCES.md`):

1. **`org_id` viene sempre dalla riga profilo / contesto auth stabile** — flusso **user → profile → `org_id`**; niente org “inventata” per schermata.
2. **Niente `default-org` implicito** salvo contratto esplicito a DB che definisca quel literal come org di sistema.
3. **`org_id_text`:** considerato **deprecato / duplicato semantico**; obiettivo eliminazione dopo migrazione SQL; in transizione non scrivere valori arbitrari — solo eco controllata da `org_id` se il DB lo richiede ancora.
4. **Il frontend non deve “bypassare” RLS** (niente pattern che assumono dati senza passare dalle stesse regole DB); **service role** solo dove previsto e documentato.
5. **Query e shape select riusabili** sotto `src/lib/<dominio>/` (es. `src/lib/appointments/staff-appointments-select.ts`); hook = orchestrazione, non seconda definizione permessi/filtri.
6. **Payload insert/update** coerenti con colonne che RLS valuta (`staff_id`, `athlete_id`, `org_id`, stati, cancellazioni).

---

## 7. Stato attuale

- **Giudizio:** **fragile / critico** resta su **RLS/policy** e coerenza **`org_id` / `org_id_text`** a livello DB e moduli trasversali; su **appuntamenti staff** la regola overlap e la risoluzione **`org_id` in scrittura** sono **mitigate/risolte in app** rispetto alla situazione precedente.
- **Motivazione:** duplicazioni policy e colonne tenant; possibile divario tra migrazioni in repo e quanto è applicato su Supabase (**da verificare**); liste atleta vs calendario atleta e ruoli staff “non mappati” in `useAthleteAppointments` richiedono ancora attenzione RLS.

---

## 8. Rischi

- **Bug invisibili (RLS vs UI):** schermata A ok, schermata B fallisce o mostra altro; permessi “a caso” se SELECT permissive.
- **Accessi non corretti:** policy duplicate o condizioni su `auth.uid()` / `profiles.id` incoerenti.
- **Dati inconsistenti:** stesso slot doppio; org miste su `appointments`.
- **Multi-tenant rotto:** filtri per org errati o colonne duplicate (`org_id_text`).
- **Operatività:** assenza di uno schema SQL unico nel flusso “audit esterno” vs file in repo — debugging richiede **confronto con DB reale**.

---

## 9. Prossimi interventi

Checklist (nessun SQL eseguito da questo documento):

- [ ] **Completare `org_id`:** uniformare tutti i moduli al resolver (staff già su `current-org`); ridurre dipendenze da payload form `undefined`; audit percorsi atleta/open booking.
- [ ] **Eliminare uso applicativo di `org_id_text`** (poi colonna solo dopo migrazione approvata).
- [ ] **Eliminare `default-org` implicito** o sostituirlo con regola esplicita a prodotto/DB (residui fuori dagli hook staff).
- [ ] **Overlap:** confermare **vincolo DB** oltre ai check client; verificare entrypoint legacy (es. modal) non passati dagli hook staff.
- [ ] **Allineare query atleta/staff** (`useAthleteAppointments` e simili): filtri espliciti per ruolo o guard “non supportato”.
- [ ] **Verificare policy duplicate** e helper SQL su ambiente deployato (`audit/rls/*` come piano).
- [ ] **Definire access layer unico:** lib sotto `src/lib/**` + convenzione API; **unificare `getSession` vs `getUser`** per handler sensibili (direzione preferita: `getUser` per API server, da `CANONICAL_SOURCES`).
- [ ] **Confermare** che le migrazioni in `supabase/migrations/` corrispondano al DB attivo.

---

## Riferimenti file (mappa rapida da `database_files.txt`)

| Area                 | Path indicativi                                                                      |
| -------------------- | ------------------------------------------------------------------------------------ |
| Migrazioni           | `supabase/migrations/*.sql`                                                          |
| RLS proposto / piani | `audit/rls/sql_proposto/`, `audit/rls/*.md`                                          |
| Client / tipi app    | `src/lib/supabase/*`, `src/types/supabase.ts`                                        |
| Script root SQL      | `supabase_rls_*.sql`, `supabase_fix_*.sql` (elenco completo in `database_files.txt`) |
| Edge                 | `supabase/functions/document-reminders/`, `marketing-kpi-refresh/`                   |

_Fine documento — aggiornare questo file quando cambiano fonti audit o stato deploy._
