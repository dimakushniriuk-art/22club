# Rule Conflicts

Analisi **solo lettura** del codice in `src/` e degli audit RLS già presenti.  
**Nota:** nel repository non risultano file `.sql` o `supabase/migrations` tracciati; le policy PostgreSQL sono descritte indirettamente in `audit/rls/RLS_DUPLICATES.md` e documenti collegati, non confrontabili qui riga-per-riga con il DB deployato.

**Perché il sistema può risultare instabile (sintesi):**

1. ~~**Sovraposizione slot** calendario vs tabella staff~~ — **mitigato (lato app, consolidato):** `use-calendar-page.ts` e `useStaffAppointmentsTable.ts` condividono `appointmentSlotOverlapsAnyCalendarBlock` + `checkStaffCalendarSlotOverlap` da `appointment-utils.ts` (open booking day escluso come in calendario); drag/resize staff usa la stessa pre-validazione del salvataggio form. Resta **da verificare** un eventuale vincolo DB univoco oltre ai check client.
2. **Modello dati `org_id` / `org_id_text` / placeholder legacy** — **mitigato in scrittura appointments:** `resolveOrgIdForAppointmentWrite` + `requireCurrentOrgId` (`src/lib/organizations/current-org.ts`) usati sia da `use-calendar-page.ts` sia da `useStaffAppointmentsTable.ts` (niente `default-org` implicito nel percorso tabella). Permangono **aperti** coesistenza colonne `org_id_text`, altri moduli non allineati e form che può ancora inviare `org_id` assente lasciando la risoluzione agli hook.
3. **RBAC a strati** (middleware web, guard client, assenza middleware su build Capacitor, matcher che non passa da molte route `/api`) → più superfici da allineare.
4. **RLS e schema** (da audit interno): policy sovrapposte, helper diversi, possibili mismatch `auth.uid()` vs `profiles.id`, colonne org duplicate — il client può “funzionare” in un flusso e fallire in un altro per policy diversa.

---

## Validazione sovrapposizione appuntamenti (staff)

- **Stato:** **risolto** per divergenza calendario vs tabella staff (stessa pipeline UI); **mitigato** nel complesso finché manca enforcement esclusivamente DB.
- **Dove:**
  - `src/hooks/calendar/use-calendar-page.ts` — `checkStaffCalendarSlotOverlap` su insert/update; drag/resize allineati al form (stessi blocchi calendario + overlap sullo staff del record).
  - `src/hooks/appointments/useStaffAppointmentsTable.ts` — stessa sequenza: blocchi calendario poi `checkStaffCalendarSlotOverlap` (escluso `is_open_booking_day === true`, come calendario).
  - `src/lib/appointment-utils.ts` — implementazione condivisa.
  - `src/components/dashboard/appointment-modal.tsx` — import overlap ancora commentato (**da verificare** se quel modal è ancora entrypoint senza i check degli hook staff).
- **Residuo:** eventuale **vincolo SQL** / trigger overlap lato server — **da verificare** su schema deployato; `appointment-modal` fuori dagli hook consolidati.

---

## Popolamento `org_id` (appuntamenti — scrittura staff)

- **Stato:** **mitigato** sul percorso staff principale; **aperto** per `org_id_text`, letture legacy e altri moduli.
- **Dove:**
  - `src/lib/organizations/current-org.ts` — `resolveOrgIdForAppointmentWrite` + `requireCurrentOrgId` (profilo vince; form con placeholder/assente non forza `default-org`).
  - `src/hooks/calendar/use-calendar-page.ts` e `src/hooks/appointments/useStaffAppointmentsTable.ts` — entrambi risolvono `org_id` prima di insert/update; calendario staff imposta ancora `org_id_text` uguale all’`org_id` risolto per compatibilità colonne.
  - `src/components/calendar/appointment-form.tsx` — payload può ancora avere `org_id: undefined`; la verità effettiva in submit è negli hook sopra.
- **Residuo:** duplicato semantico **`org_id` / `org_id_text`**, policy RLS e report — **aperto** (vedi `audit/rls/RLS_DUPLICATES.md`); open booking / viste atleta possono avere percorsi dedicati oltre questo blocco.
- **Azione (SQL/RLS):** migrazione e policy — **da verificare** / pianificare fuori da questo file.

---

## Redirect / home staff: guard parziale vs tabella canonica ruoli

- **Dove:**
  - `src/lib/utils/role-redirect-paths.ts` — `ROLE_DEFAULT_APP_PATH` include `marketing`, `admin`, `trainer`, ecc.
  - `src/hooks/use-staff-dashboard-guard.ts` — `REDIRECT_PATH_BY_ROLE` con **solo** `admin`, `trainer`, `nutrizionista`, `massaggiatore`, `athlete`; fallback `DEFAULT_REDIRECT = '/dashboard'`.
- **Differenze:** per un ruolo non mappato (es. `marketing`), il guard redirige a `/dashboard` invece che a `/dashboard/marketing` come da `role-redirect-paths`. Il middleware (`src/middleware.ts`) ha liste dedicate per nutrizionista, massaggiatore, marketing.
- **Impatto:** **medio** (flash di route sbagliata, o dipendenza dal middleware per correggere il path).
- **Versione corretta:** riusare `getDefaultAppPathForRole` / stesso Record di `role-redirect-paths` dentro i guard.
- **Azione:** **unificare**.

---

## Middleware web vs assenza middleware (Capacitor)

- **Dove:** `src/middleware.ts` — se `process.env.CAPACITOR === 'true'` → `NextResponse.next()` senza controlli; commento: protezione affidata al client. `audit/FEATURE_STATUS.md` segnala già il rischio.  
  **`src/app/home/_components/home-layout-auth.tsx`** commenta che le verifiche sono “già gestite dal middleware” — su Capacitor ciò **non** è vero; restano solo `useEffect` + `useAuth`.
- **Differenze:** su web, redirect ruolo e whitelist path; su build nativa, stesse regole **non** applicate a livello edge.
- **Impatto:** **alto** per distribuzione Capacitor in produzione; **basso** solo web.
- **Versione corretta:** definita dal modello di minaccia (es. deep link + guard obbligatori ovunque).
- **Azione:** **unificare** la strategia (guard equivalenti, o auth nativa) — analisi solo: da pianificare, non refactored qui.

---

## Default ruolo `athlete` se normalizzazione fallisce

- **Dove:**
  - `src/providers/auth-provider.tsx` — `mapProfileToUser`: `(mappedRole ?? 'athlete')`.
  - `src/app/api/auth/context/route.ts` — `toAuthProfile`: `(normalizeRole(p.role) ?? 'athlete')`.
- **Differenze:** ruolo raw non canonico o `null` viene presentato come atleta a livello API/client, mentre middleware usa `normalizeRole(role) ?? role` (mantiene stringa DB se non mappata).
- **Impatto:** **medio** — **possibile conflitto** per profili con ruoli legacy/non mappati (UX e autorizzazione client vs server).
- **Versione corretta:** allineare: o blocco esplicito “ruolo non riconosciuto”, o stesso fallback ovunque.
- **Azione:** **unificare** dopo inventario ruoli legacy (`pt`, `staff`, `atleta`, ecc. come da audit RLS).

---

## Sessione: `getSession` vs `getUser` per profilo

- **Dove:**
  - `src/lib/supabase/get-current-profile.ts` — `getCurrentProfile` usa `supabase.auth.getSession()`.
  - `src/lib/supabase/get-user-profile.ts` — `getUserProfile` usa `supabase.auth.getUser()`.
- **Differenze:** due API Supabase con garanzie diverse sulla “freschezza” della sessione; stesso `fetchCurrentProfileForAuthUserId` ma ingresso auth diverso.
- **Impatto:** **medio** — **possibile conflitto** (401/404 sporadici o profilo null in API vs middleware).
- **Versione corretta:** policy unica del progetto (preferenza documentata Supabase per route handler: spesso `getUser`).
- **Azione:** **unificare** dopo verifica comportamento reale.

---

## Filtri query appuntamenti: lista (`useAthleteAppointments`) vs calendario atleta

- **Nota di perimetro:** non confondere la **vista calendario atleta** con l’hook lista.
- **Calendario atleta:** `src/hooks/calendar/use-athlete-calendar-page.ts` — carica eventi per griglia, trainer da `get_my_trainer_profile`, logica open booking / slot; CRUD condizionata (`created_by_role`, ecc.).
- **Lista (React Query):** `src/hooks/useAthleteAppointments.ts` + `src/lib/appointments/athlete-query-params.ts` — listing per home/“le mie prenotazioni”: ruolo `athlete` → `eq('athlete_id', profileId)` + parametri temporali/cancellati; `trainer`/`admin` → `eq('staff_id', profileId)`. Open booking: visibilità **autoritativa lato RLS** (commento TODO nel hook).
- **Problema staff ruoli “altri”:** per `nutrizionista`, `massaggiatore`, `marketing`, ecc. la query in `useAthleteAppointments` non aggiunge filtri dedicati (`role: unknown`); l’esito dipende **solo** da RLS — **aperto** (stesso impatto di prima se policy permissive).
- **Azione:** filtri espliciti o guard “non supportato” sul ramo lista staff non coperto; **da verificare** allineamento con matrix E2E per ruoli collegati.

---

## Liste “oggi” dashboard vs calendario (criteri esclusione)

- **Dove:** `src/app/api/dashboard/appointments/route.ts` — esclude per `status` (completato, cancelled, annullato) e per tempo (“passato da > 1 ora” salvo in corso).  
  Calendario e altre query usano criteri diversi (`cancelled_at`, overlap, ricorrenze).
- **Differenze:** stesso dominio “appuntamenti del giorno” ma definizione diversa di cosa mostrare.
- **Impatto:** **basso** (principalmente incoerenza UX / “perché non lo vedo?”).
- **Versione corretta:** una definizione condivisa (helper) + riuso in API e widget.
- **Azione:** **unificare** (estrazione helper).

---

## Chiave operativa `staff_id` vs `trainer_id`

- **Dove:** `src/hooks/useAthleteAppointments.ts` — commento in mutation: `trainer_id` e `staff_id` sincronizzati da trigger; select unisce `trainer` e `staff` su FK diverse; filtro staff usa solo `staff_id`.
- **Differenze:** dipendenza da invariante DB (trigger); se mai disallineato, join `trainer_id` mostra dati stale o null anche con `staff_id` valorizzato.
- **Impatto:** **medio** — **possibile conflitto** dati se trigger/insert non allineati.
- **Azione:** **verificare** sullo schema reale; **unificare** su un solo campo operativo lato app se il DB lo consente.

---

## RLS / schema PostgreSQL (solo da audit interno, non da file SQL nel repo)

- **Dove:** `audit/rls/RLS_DUPLICATES.md` (policy duplicate o sovrapposte su `appointments` SELECT/UPDATE/DELETE; `get_profile_id_from_user_id` vs `get_current_staff_profile_id()`; `org_id` vs `org_id_text`; `athlete_id = auth.uid()` su `progress_logs`; policy permissive su `appointment_cancellations`; triade `pt_atleti` / `trainer_athletes` / `athlete_trainer_assignments`).
- **Differenze:** più modelli di autorizzazione convivono; il frontend non può assumere un unico “contratto” senza allineamento SQL.
- **Impatto:** **critico** / **alto** per bug “solo in produzione” o per ruolo.
- **Versione corretta:** consolidamento SQL + allineamento hook/API (fuori scope di questo file).
- **Azione:** **unificare** (DB) + **riscrivere** policy/helper ridondanti — come da piani in `audit/rls/`.

---

## Hook auth duplicato (solo percorso import)

- **Dove:** `src/hooks/use-auth.ts` (wrapper deprecato), `src/hooks/useAuth.ts` (re-export), molti file importano ancora `@/hooks/use-auth`.
- **Differenze:** nessuna logica diversa se tutti usano lo stesso provider; rischio solo di manutenzione e confusione.
- **Impatto:** **basso**.
- **Versione corretta:** import unico da `@/providers/auth-provider` o da un solo barrel.
- **Azione:** **unificare** import (cleanup).

---

## Server Actions

- **Dove:** ricerca `'use server'` in `src/`: **nessun risultato**.
- **Differenze:** la logica scrive su DB soprattutto da client Supabase, API route e hook; non c’è un singolo layer “actions” da confrontare.
- **Impatto:** **n/a** (architettura distribuita su più tipi di entrypoint).
- **Azione:** nessuna; tenere presente per future introduction di actions (nuova superficie duplicabile).

---

## Comunicazioni vs notifiche (sovrapposizione tematica)

- **Dove:** `audit/FEATURE_STATUS.md` / `audit/PROJECT_DOMAINS.md` — menzione sovrapposizione `src/lib/communications/*` e `src/lib/notifications/*`.
- **Differenze:** **possibile conflitto** di responsabilità (chi invia cosa, scheduler duplicati); non analizzato file-per-file in questo step.
- **Impatto:** **medio** (da confermare con lettura mirata).
- **Versione corretta:** da definire perimetro “messaggistica transazionale” vs “campagne”.
- **Azione:** **verificare** in step successivo; eventuale **unificare** servizio.

---

## Pagamenti

- **Dove:** più entry per ruolo (`audit/PROJECT_DOMAINS.md`: dashboard/home/nutrizionista/massaggiatore).
- **Differenze:** non mappate in dettaglio qui; rischio duplicazione regole export/ledger come per altri domini.
- **Impatto:** **medio** — segnalato come area a priorità ma **non** evidenza puntuale in questo audit.
- **Azione:** **verificare** in focus dedicato.

---

_Documento generato per tracciare conflitti reali tra implementazioni. Voci marcate **possibile conflitto** richiedono conferma runtime o ispezione SQL su ambiente Supabase._
