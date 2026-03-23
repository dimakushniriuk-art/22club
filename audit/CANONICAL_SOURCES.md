# Canonical Sources

Documento di **decisione architetturale** (solo audit). Obiettivo: **una sola fonte di verità** per area; niente ambiguità su cosa è riferimento ufficiale e cosa è eccezione da eliminare.

Riferimenti incrociati: `audit/RULE_CONFLICTS.md`, `audit/FEATURE_STATUS.md`, `audit/PROJECT_DOMAINS.md`.

---

## Priorità assoluta — AUTH / RBAC

- **Source of truth (permessi “ufficiali”):**
  1. **Database:** policy RLS e vincoli su tabelle (`supabase/migrations/**` applicate all’ambiente). È l’unica autorità che non può essere aggirata dal client.
  2. **Applicazione (routing e UX ruolo):** il significato operativo del ruolo per navigazione e confronti nel codice deve derivare da **un solo modulo di normalizzazione** e da **una sola tabella di redirect**.

- **File canonici (permessi/ruolo lato app):**
  - `src/lib/utils/role-normalizer.ts` — mappatura ruoli stringa → ruolo canonico usato nell’app (definizione unica del “contratto” ruolo lato TS).
  - `src/middleware.ts` — enforcement route **web** (matcher, liste consentite); deve restare allineato ai path prodotti da `role-redirect-paths`.
  - `src/app/api/auth/context/route.ts` — contesto auth server/client coerente con sessione e profilo (profilo “vero” esposto all’UI).
  - `src/providers/auth-provider.tsx` — stato auth e profilo lato client; deve riflettere le stesse regole di normalizzazione della route context (niente fallback divergenti).
  - Amministrazione permessi granulari (se presenti): `src/components/dashboard/admin/role-permissions-editor.tsx` + API sotto `src/app/api/admin/roles/**` — **solo** per ciò che è persistito come permessi extra; non duplicare la mappa ruolo→area senza passare da `role-redirect-paths` / normalizer.

- **Dove deve vivere il redirect (post-login / home ruolo):**
  - **Unica fonte:** `src/lib/utils/role-redirect-paths.ts` (`ROLE_DEFAULT_APP_PATH`, `getDefaultAppPathForRole` o equivalente esposto da quel modulo).
  - **File duplicati / sospetti:** qualsiasi `REDIRECT_PATH_BY_ROLE` locale (es. in `src/hooks/use-staff-dashboard-guard.ts`) che **non** importi o delegahi a `role-redirect-paths.ts` → **duplicato da eliminare** a favore del modulo canonico.
  - **Middleware:** può applicare redirect e whitelist, ma i **path di destinazione** devono coincidere con quelli di `role-redirect-paths.ts` (nessuna seconda tabella mentale).

- **File duplicati / sospetti:**
  - `src/hooks/use-auth.ts` vs `src/hooks/useAuth.ts` — **canonico:** `src/hooks/useAuth.ts` (e/o re-export unico); `use-auth.ts` trattato come **percorso legacy da unificare** (solo import).
  - `src/lib/utils/role-normalizer-client.tsx` — se contiene regole divergenti da `role-normalizer.ts`, **sospetto duplicato**; verità unica: **server normalizer** con eventuale thin wrapper client che delega alla stessa mappa.

- **Azione:** **unificare** redirect e normalizzazione ruolo su `role-redirect-paths.ts` + `role-normalizer.ts`; **unificare** hook auth su un solo entrypoint; allineare `auth/context` e `auth-provider` su **stesso fallback ruolo** (vedi risoluzione conflitto “default athlete” sotto).

- **Note:** Con `CAPACITOR=true`, `middleware.ts` non applica le stesse regole; la **verità dichiarata** resta: web = middleware + guard; nativo = **parità obbligatoria** via guard client (`src/components/shared/dashboard/role-layout.tsx` e guard per pagina) fino a strategia nativa equivalente. Finché non esiste parità, lo stato è **architetturalmente parziale** (non una seconda “verità”, un **debito** da chiudere).

---

## Priorità assoluta — CALENDARIO / APPUNTAMENTI

- **Source of truth:**
  - **Persistenza e chi può fare cosa:** DB (`appointments`, `appointment_cancellations`, impostazioni staff, policy in migrazioni). `audit/rls/**` descrive piani e conflitti noti finché lo schema deployato non è consolidato.
  - **Regole di business condivise (overlap, ricorrenze, ecc.):** un solo modulo libreria lato app.

- **File canonici:**
  - **Validazione / sovrapposizione slot (logica “vera” da riusare ovunque):** `src/lib/appointment-utils.ts` (`checkStaffCalendarSlotOverlap`, `checkAppointmentOverlap`, ecc.).
  - **Ricorrenze:** `src/lib/recurrence-utils.ts`.
  - **Calendario staff (griglia, create/update che devono rispettare le stesse regole):** `src/hooks/calendar/use-calendar-page.ts` — **riferimento comportamentale** per insert/update con overlap (allineato a `appointment-utils`).
  - **Impostazioni slot/griglia:** `src/hooks/calendar/use-staff-calendar-settings.ts`, defaults `src/lib/calendar-defaults.ts`.
  - **Selezione query staff riusabile:** `src/lib/appointments/staff-appointments-select.ts` (e query “oggi” dedicate se presenti, es. `staff-today-appointments-query.ts`).
  - **Lista/tabellare staff:** `src/hooks/appointments/useStaffAppointmentsTable.ts` — oggi **non** è canonico per la regola overlap (conflitto con calendario); va **portato** alla stessa semantica di `appointment-utils` + RLS, non il contrario.
  - **Componenti UI condivisi:** `src/components/calendar/appointment-form.tsx`, `appointment-detail.tsx`, `calendar-view.tsx`; modale dashboard `src/components/dashboard/appointment-modal.tsx` non deve contenere una regola overlap “alternativa” (solo disabilitare import / bypass è **tecnico debit**, non seconda verità).

- **File duplicati / sospetti:**
  - Comportamento overlap **assente** in tabella staff ma **presente** in calendario → **stessa feature, due regole** → il calendario + `appointment-utils` vincono come **specifica** da replicare (o sostituire con vincolo DB esplicito decidendo il prodotto).

- **Azione:** **unificare** tutti i percorsi UI (calendario, pagina appuntamenti, modali) su **una** policy: o tutti chiamano `appointment-utils` (stessi parametri), o il divieto/consenso overlap è **solo** in DB; **vietato** lasciare un percorso senza controllo e l’altro con controllo.

- **Note:** Creazione/modifica devono produrre payload coerente con colonne che RLS valuta (`staff_id`, `athlete_id`, `org_id`, stati, cancellazioni). La “verità” RLS resta nel SQL; l’app non deve inventare varianti per schermata.

---

## Priorità assoluta — ORG_ID / ORG_ID_TEXT

- **Source of truth:** **`profiles.org_id`** della riga profilo legata all’utente autenticato (e/o org effettiva restituita da `api/auth/context` come parte del contesto stabilizzato). **Non** parametri URL o valori silenti inventati nel client.

- **File canonici:**
  - Risoluzione contesto: `src/app/api/auth/context/route.ts` + dati profilo da `src/lib/supabase/get-user-profile.ts` / `get-current-profile.ts` (dopo unificazione sessione, vedi sotto) — **una sola catena** “user → profile → org_id”.
  - Scrittura appuntamenti: payload deve ricevere `org_id` da quel contesto (hook calendario che passa org da auth è **il modello corretto**); **vietato** fallback `default-org` salvo tabella/contratto DB che definisca esplicitamente quel literal come org di sistema.

- **File duplicati / sospetti:**
  - `org_id: undefined` in submit form con compensazione hook tabella (`profiles.org_id` o `'default-org'`) → **due fonti**; **canonico:** sempre org dal profilo/contesto auth al submit, mai silently diverso tra form e hook.
  - `org_id_text`: trattare come **duplicato semantico** rispetto a `org_id` finché RLS/schema non impone entrambi. **Obiettivo finale:** **eliminare** `org_id_text` dopo migrazione SQL che sposta tutte le policy su `org_id` (come da direzione in `audit/rls/RLS_DUPLICATES.md`). Finché il DB richiede entrambi, **canonico** resta `org_id`; `org_id_text` solo **eco** derivata da join/lookup controllato, non terza fonte libera.

- **Azione:** **unificare** passaggio `org_id` su contesto profilo; **riscrivere** punti con `default-org` implicito; **eliminare** `org_id_text` a livello applicativo (stop scrittura diretta) → poi **eliminare colonna** solo via SQL approvato.

---

## Priorità assoluta — DATA ACCESS (QUERY)

- **Source of truth:** Per dominio, **moduli `src/lib/<dominio>/`** con funzioni di select/builder riusabili; le **API Route** (`src/app/api/**/route.ts`) eseguono query server usando client Supabase server e profilo risolto con **`getUser`** dove serve integrità auth.

- **File canonici:**
  - Appuntamenti staff (shape select): `src/lib/appointments/staff-appointments-select.ts`, eventuali `src/lib/appointments/*-query.ts`.
  - Utilità appuntamenti: `src/lib/appointment-utils.ts`.
  - Profilo corrente server: **direzione canonica** — `src/lib/supabase/get-user-profile.ts` (`getUser`) per handler/API; `get-current-profile.ts` (`getSession`) va **allineato** o deprecato per le route sensibili (una sola scelta progetto).

- **File duplicati / sospetti:**
  - Filtri incoerenti in `src/hooks/useAthleteAppointments.ts` (solo athlete/trainer/admin) → hook **non** è fonte di verità per permessi; va **riscrivere** ramo ruoli o delegare a helper query condiviso + RLS.
  - `src/app/api/dashboard/appointments/route.ts` criteri “oggi” vs calendario → **sospetto duplicato definizione “lista giorno”**; **canonico futuro:** helper unico (estratto da lib appointments) usato da API e widget.

- **Azione:** **unificare** query “ufficiali” sotto `src/lib/**`; **ridurre** duplicazione nei hook (hook = orchestrazione, non seconda definizione SQL).

---

## Risoluzione conflitti (da RULE_CONFLICTS) — decisione unica

| Conflitto                                                | Versione corretta (canonica)                                                                                                                                                | Azione                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Overlap slot (calendario vs tabella)                     | Regole in `appointment-utils.ts`, applicate ovunque **oppure** solo vincolo DB; stesso comportamento su tutte le UI                                                         | **unificare**                                              |
| Popolamento `org_id`                                     | Sempre da profilo / auth context; no `default-org` implicito                                                                                                                | **unificare**                                              |
| Redirect staff (guard vs `role-redirect-paths`)          | Solo `role-redirect-paths.ts` come mappa path                                                                                                                               | **unificare** (rimuovere mappe parallele nei guard)        |
| Middleware web vs Capacitor                              | Un solo **modello di minaccia**: parità guard; oggi gap documentato = **non** seconda verità, ma debito                                                                     | **riscrivere** strategia nativa (pianificato)              |
| Fallback ruolo `athlete` (provider vs API vs middleware) | Stessa regola ovunque: o ruolo sconosciuto **bloccato**, o stesso fallback; allineare `middleware` e `auth/context` e `auth-provider`                                       | **unificare**                                              |
| `getSession` vs `getUser`                                | API/server: **`getUser`** come ingresso canonico per profilo; client può usare sessione ma server critico no                                                                | **unificare**                                              |
| Filtri `useAthleteAppointments` per ruoli staff          | Matrice esplicita per ruoli supportati **o** guard “non supportato”; mai dipendere solo da RLS “per caso”                                                                   | **riscrivere**                                             |
| “Oggi” dashboard vs calendario                           | Un helper definizione condivisa in `src/lib/appointments/` (o `lib/dashboard/`)                                                                                             | **unificare**                                              |
| `staff_id` vs `trainer_id`                               | Verità DB: trigger/invariante; **lato app** filtro operativo = `staff_id`; join su `trainer_id` solo se schema impone                                                       | **verificare** DB + **unificare** uso in codice            |
| RLS/policy duplicate                                     | SQL consolidato in migrazioni + helper DB unici; `audit/rls/*` = piano, non runtime                                                                                         | **unificare** (DB)                                         |
| Hook auth doppio path import                             | Un solo modulo esposto                                                                                                                                                      | **unificare**                                              |
| Comunicazioni vs notifiche                               | **Comunicazioni** = invii massivi/liste (`src/lib/communications/`); **Notifiche** = push/reminder/scheduler (`src/lib/notifications/`); confine: transazionale vs campagna | **verificare** poi **unificare** entrypoints se accoppiati |

---

## Autenticazione e flussi ingresso

- **Source of truth:** Supabase Auth + profilo app; redirect post-login derivato da `role-redirect-paths.ts`.
- **File canonici:** `src/app/login/page.tsx`, `src/components/auth/login-form.tsx`, `src/app/post-login/page.tsx`, `src/app/api/auth/context/route.ts`, `src/lib/supabase/middleware.ts`, `src/providers/auth-provider.tsx`.
- **File duplicati:** `src/hooks/use-auth.ts` (legacy import).
- **Azione:** **unificare** su `useAuth.ts` / provider.
- **Note:** Recupero password / registrazione: route sotto `src/app/api/auth/**` e pagine dedicate; nessuna seconda “auth API” parallela non documentata.

---

## RBAC, amministrazione e impersonazione

- **Source of truth:** Ruolo e flags in `profiles` + RLS; redirect da `role-redirect-paths.ts`; admin operazioni da `src/app/api/admin/**` con stesse convenzioni ruolo.
- **File canonici:** `src/middleware.ts`, `src/lib/utils/role-normalizer.ts`, `src/lib/utils/role-redirect-paths.ts`, `src/components/shared/dashboard/role-layout.tsx`, `src/app/dashboard/admin/**`, `src/app/api/admin/**`.
- **File duplicati:** Mappe redirect/GUARD duplicate nei singoli `use-*-page-guard.ts` se reimplementano path (devono **delegare**).
- **Azione:** **unificare** guard su redirect canonico + whitelist centralizzata dove possibile.
- **Note:** Impersonazione: `src/app/api/admin/impersonation/**` + `impersonation-banner.tsx` — un solo flusso.

---

## Shell dashboard staff e layout condiviso

- **Source of truth:** Layout staff unico.
- **File canonici:** `src/app/dashboard/layout.tsx`, `src/components/shared/dashboard/staff-dashboard-layout.tsx`, `src/components/shared/dashboard/staff-content-layout.tsx`, `src/components/dashboard/sidebar.tsx`.
- **File duplicati:** Assenti come “secondo layout” ufficiale; eventuali copie strutturali vanno trattate come debito.
- **Azione:** **mantenere** struttura attuale; nuove shell solo se sostituiscono questa.

---

## Home atleta (portale)

- **Source of truth:** Stesso auth context; area `/home/**` per atleta.
- **File canonici:** `src/app/home/layout.tsx`, `src/app/home/_components/home-layout-auth.tsx`, `src/app/home/_components/home-layout-client.tsx`.
- **File duplicati:** Commenti che asseriscono “middleware gestisce tutto” su Capacitor — **fuorviante**; non secondo codice, da correggere in doc/README interno quando si tocca il file (fuori scope codice qui).
- **Azione:** **unificare** messaggistica con realtà Capacitor (processo).
- **Note:** Guard per sottopagine: canonicamente `use-*-guard*` allineati a RBAC.

---

## Clienti (staff) e anagrafica atleti

- **Source of truth:** API `src/app/api/athletes/**`, `src/app/api/clienti/**` + tabelle relazione (nomi legacy da migrare lato SQL).
- **File canonici:** `src/app/dashboard/clienti/page.tsx`, `src/app/dashboard/atleti/[id]/page.tsx`, `src/app/api/clienti/sync-pt-atleti/route.ts`, `src/app/api/athletes/create/route.ts`, `src/lib/validations/cliente.ts`.
- **File duplicati:** Lessico `pt_atleti` / `trainer_athletes` / ecc. nel DB — **non** molteplici modelli in app; una vista API unificata.
- **Azione:** **unificare** dopo inventario schema (SQL).

---

## Profilo atleta (dettaglio staff)

- **Source of truth:** Salvataggio centralizzato + tabs.
- **File canonici:** `src/lib/athlete-profile/handle-athlete-profile-save.ts`, `src/components/dashboard/athlete-profile/athlete-profile-tabs.tsx`.
- **File duplicati:** Save scatterato per tab senza passare dal handle → **sospetto**; canonical save è il modulo sopra.
- **Azione:** **unificare** verso handle condiviso.

---

## Profilo home atleta e impostazioni account

- **Source of truth:** Due **entry UX** legittime (`/home/profilo` vs `/dashboard/profilo`) ma **una** riga `profiles` e stesse API di update.
- **File canonici:** Pagine sotto `src/app/home/profilo/`, `src/app/dashboard/profilo/`, componenti `src/components/settings/**`.
- **File duplicati:** Logica di aggiornamento duplicata tra alberi → da consolidare su hook o API unica.
- **Azione:** **unificare** persistence path.

---

## Calendario, appuntamenti e promemoria

- **Source of truth:** Vedere sezioni **CALENDARIO** e **DATA ACCESS** sopra.
- **File canonici:** Oltre a quelli già elencati: `src/app/api/calendar/notify-appointment-change/route.ts`, `src/app/api/calendar/send-appointment-reminder/route.ts`, `src/lib/calendar/appointment-reminder-email.ts`.
- **File duplicati:** Seconda pipeline notifiche che duplica scheduling senza chiamare `src/lib/notifications/*` — **sospetto**.
- **Azione:** **verificare** confine con dominio Notifiche.

---

## Comunicazioni di massa e invio email

- **Source of truth:** `src/lib/communications/service.ts`, `email.ts`, API `src/app/api/communications/**`.
- **File canonici:** `use-communications-page.tsx` come orchestrazione UI; batch in `src/lib/communications/`.
- **File duplicati:** Incrocio con `src/lib/notifications/**` per lo stesso tipo di messaggio — **delimitare** responsabilità (vedi tabella conflitti).
- **Azione:** **unificare** perimetro dominio.

---

## Chat

- **Source of truth:** `src/lib/realtimeClient.ts` + schema messaggi; guard `use-chat-page-guard.ts`.
- **File canonici:** `src/components/chat/message-list.tsx`, `conversation-list.tsx`, pagine `src/app/dashboard/chat/`, `src/app/home/chat/`.
- **File duplicati:** Nessuno dichiarato; evitare secondo client realtime.
- **Azione:** **mantenere**; nuova logica solo nel modulo realtime.

---

## Documenti e anteprima

- **Source of truth:** `src/lib/documents.ts`, `src/lib/all-athlete-documents.ts`, API `src/app/api/document-preview/route.ts`, storage Supabase.
- **File canonici:** `src/components/documents/document-uploader.tsx`.
- **File duplicati:** Fetch documenti duplicati fuori dai lib sopra.
- **Azione:** **unificare** accessi tramite lib.

---

## Pagamenti e abbonamenti

- **Source of truth:** Ledger e tipi in `src/lib/credits/ledger.ts`, `src/lib/abbonamenti-service-type.ts`, UI `src/components/dashboard/pagamenti/payments-table.tsx`; **una** definizione export `src/lib/export-payments.ts`.
- **File duplicati:** Pagine parallele per ruolo che reimplementano regole contabili diversamente.
- **Azione:** **unificare** regole in lib condivise; pagine solo layout/scope.
- **Note:** Priorità alta per dati finanziari — niente “versioni” di calcolo.

---

## Esercizi, allenamenti, schede e piani workout

- **Source of truth:** `src/lib/workouts/**`, `src/app/api/athlete/workout-plans/route.ts`, `src/app/api/exercises/route.ts`, trasformazioni `workout-transformers`.
- **File canonici:** `src/components/workout/workout-wizard.tsx`.
- **File duplicati:** Duplicazione dati esercizi tra `exercises-data` e API senza single fetch.
- **Azione:** **verificare** poi **unificare**.

---

## Progressi, misurazioni e foto atleta

- **Source of truth:** Componenti sotto `src/app/home/progressi/**`, costanti `src/lib/constants/progress-ranges.ts`, analytics `src/lib/analytics.ts`.
- **File duplicati:** `src/lib/mock-data-progress.ts` se ancora usato in produzione — **sospetto**; canonical = dati reali DB.
- **Azione:** **eliminare** mock da path produzione o **isolare** solo storybook/test.

---

## Inviti atleti

- **Source of truth:** `src/lib/invitations/**`, API `src/app/api/invitations/**`, `src/lib/validations/invito.ts`.
- **File canonici:** `send-invitation-email` unico percorso invio.
- **File duplicati:** seconda implementazione invito fuori da `lib/invitations`.
- **Azione:** **unificare**.

---

## Onboarding, questionari e completamento profilo

- **Source of truth:** API `src/app/api/onboarding/**`, `src/app/api/register/complete-profile/route.ts`.
- **File canonici:** Le route sopra.
- **File duplicati:** Save step sparsi fuori da queste API.
- **Azione:** **unificare** verso API.

---

## Marketing (lead, campagne, segmenti)

- **Source of truth:** `src/lib/marketing/segment-rules.ts`, API `src/app/api/marketing/**`, cron `src/app/api/admin/cron/refresh-marketing-kpis/route.ts`.
- **File canonici:** Pagine sotto `src/app/dashboard/marketing/**`.
- **File duplicati:** Regole segmentazione duplicate in componenti.
- **Azione:** **unificare** in `segment-rules` / servizi lib.

---

## Area nutrizionista / massaggiatore

- **Source of truth:** Stessi domini sottostanti (appuntamenti, abbonamenti, progressi) con scope ruolo; **nessuna** seconda implementazione overlap/org; redirect da `role-redirect-paths.ts`.
- **File canonici:** Layout dedicati `src/app/dashboard/nutrizionista/layout.tsx`, `src/app/dashboard/massaggiatore/layout.tsx`.
- **File duplicati:** Copy-paste query appuntamenti che divergono da `src/lib/appointments/**`.
- **Azione:** **unificare** query con lib condivisa.

---

## Notifiche e push

- **Source of truth:** `src/lib/notifications/push.ts`, `scheduler.ts`, `src/lib/notifications/types.ts`, API `src/app/api/push/**`.
- **File canonici:** `use-notifications.ts`, `use-progress-reminders.ts`.
- **File duplicati:** `src/lib/notifications.ts` se sovrappone a cartella `notifications/` senza chiaro split — **deprecare** o fondere documentando.
- **Azione:** **unificare** superficie modulo.

---

## Impostazioni per area

- **Source of truth:** `src/components/settings/**` + guard `use-impostazioni-page-guard.ts`; stessa persistenza `profiles`/preferenze.
- **File canonici:** Tab in `settings-*`.
- **File duplicati:** Molte route “impostazioni” — accettabile per UX se la **persistenza** è unica.
- **Azione:** **unificare** salvataggi su API/hook condivisi.

---

## Statistiche e reporting staff

- **Source of truth:** `src/lib/analytics.ts`, `analytics-export.ts`, `src/app/api/admin/statistics/route.ts`, componenti `statistiche-content.tsx`.
- **File duplicati:** Query KPI duplicate fuori da analytics lib.
- **Azione:** **unificare**.

---

## Pagine pubbliche e legal

- **Source of truth:** Pagine statiche `src/app/privacy/`, `src/app/termini/`.
- **File canonici:** Sudette.
- **File duplicati:** Nessuno.
- **Azione:** **mantenere**.

---

## Design system e kit UI

- **Source of truth:** `src/app/design-system/GUIDA_DESIGN_SYSTEM.md` + `src/app/design-system/**`; token `src/lib/design-tokens/**`.
- **File canonici:** `src/components/ui/**` vs `src/components/shared/ui/**` — **obiettivo:** un solo albero “primitivi” long term; finché coesistono, **canonici per nuovo codice:** primitivi in `src/components/ui/**`, pattern staff in `shared/ui` secondo guida design system.
- **File duplicati:** Due alberi sovrapposti — **unificare** gradualmente (processo).
- **Azione:** **unificare** (organizzativo).

---

## Infrastruttura client/server e API trasversali

- **Source of truth:** `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts` (integrazione Supabase), `src/providers/**`.
- **File canonici:** Sudetti.
- **File duplicati:** Helper “mini supabase” sparsi.
- **Azione:** **mantenere** entrypoint; estendere solo tramite lib.

---

## Database Supabase (migrazioni, RLS, edge)

- **Source of truth:** `supabase/migrations/**` applicate all’ambiente; **non** il solo testo in `audit/rls/` (quello è supporto decisionale).
- **File canonici:** Migrazioni + `supabase/config.toml` + functions in `supabase/functions/**`.
- **File duplicati:** Policy duplicate sul DB reale — **eliminare** via SQL pianificato.
- **Azione:** **unificare** (operazione DBA).

---

## Modelli TypeScript di dominio

- **Source of truth:** `src/types/**` allineati a tipi Supabase rigenerati (`src/types/supabase.ts` o path definito nel progetto).
- **File canonici:** Tipi dominio `appointment`, `athlete-profile`, ecc. sotto `src/types/`.
- **File duplicati:** Interfacce duplicate nei componenti che rispecchiano le stesse tabelle.
- **Azione:** **unificare** import verso `src/types`.

---

## Audit applicativo (codice app)

- **Source of truth:** `src/lib/audit.ts`, `src/lib/audit-middleware.ts`.
- **File canonici:** Sudetti + UI `src/components/shared/audit/**` se usata.
- **File duplicati:** Logging audit ad-hoc senza passare dal modulo.
- **Azione:** **unificare**.

---

## Diagnostica e operatività

- **Source of truth:** Route dedicate sotto `src/app/api/debug-*/`, `check-stuck`.
- **File canonici:** Sudette route.
- **File duplicati:** Strumenti debug non autorizzati in produzione — da **eliminare** o proteggere.
- **Azione:** **verificare** sicurezza.

---

## App nativa Capacitor

- **Source of truth:** `capacitor.config.ts` + build web; **sicurezza** non deroga: parità con guard client documentata.
- **File canonici:** Config + cartelle `android/`, `ios/`.
- **File duplicati:** Nessuna “seconda app”; un bundle.
- **Azione:** **riscrivere** gap middleware (pianificato).

---

## Test automatizzati

- **Source of truth:** Spec in `tests/e2e/**` come definizione comportamento accettato regressione; config `playwright.config*.ts`.
- **File canonici:** Spec “stabilized” per flussi critici auth/calendario.
- **File duplicati:** Due spec che testano lo stesso invariante con asserzioni divergenti.
- **Azione:** **unificare** asserzioni su behaviour canonico sopra.

---

## Regola finale

Ogni nuova modifica che introduca una seconda mappa ruoli, una seconda regola overlap, una seconda fonte `org_id` o una seconda catena `getSession`/`getUser` per la stessa decisione **violano** questo documento e vanno respinte in review a favore delle fonti elencate.
