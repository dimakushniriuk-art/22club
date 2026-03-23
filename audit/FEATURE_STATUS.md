# Feature Status

Inventario basato su `audit/PROJECT_DOMAINS.md`, `audit/routes_files.txt`, `src/**`, `supabase/migrations/**`, E2E in `tests/e2e/*.spec.ts`.  
**Stato** = giudizio da struttura codice + presenza test/criticità note; **non** è esito di run manuale su produzione.

**Legenda stato:** `funziona` = percorsi e integrazioni coerenti nel codice e/o coperti da E2E mirato; `parziale` = implementato ma con duplicazioni, dipendenza RLS/env, o superfici multiple; `rotto` = non applicabile senza evidenza runtime; `da verificare` = non deducibile con sicurezza dal solo codice.

---

## Autenticazione e flussi ingresso

### Login e sessione (email/password, redirect post-login)

- **File:** `src/app/login/page.tsx`, `src/components/auth/login-form.tsx`, `src/app/post-login/page.tsx`, `src/app/api/auth/context/route.ts`, `src/lib/supabase/middleware.ts`, `src/providers/auth-provider.tsx`
- **Componenti:** `src/components/auth/login-form.tsx`, `src/components/auth/LoginCard.tsx`
- **Hooks/Services:** `src/hooks/useAuth.ts`; **anche** `src/hooks/use-auth.ts` (due entry coesistono → da allineare o documentare)
- **Tabelle DB:** `auth.users` (Supabase); profili in schema app (`profiles` tipico da migrazioni onboarding)
- **Ruoli:** tutti (pre-RBAC)
- **Expected:** autenticazione, refresh sessione, redirect verso area di competenza
- **Actual:** flusso SSR/middleware + client provider; E2E `stabilized-core-flows.spec.ts` verifica anonimo→login e redirect per ruolo
- **Stato:** funziona _(per browser; con riserva WebKit/mobile come da skip test)_
- **Priorità:** media _(solo per duplicazione hook e skip browser)_

### Recupero / reset password, registrazione, welcome

- **File:** `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/registrati/page.tsx`, `src/app/welcome/page.tsx`, `src/app/api/auth/forgot-password/route.ts`
- **Componenti:** pagine dedicate
- **Hooks/Services:** Supabase Auth via client/server
- **Tabelle DB:** `auth.users`, eventuali tabelle invito/onboarding collegate
- **Ruoli:** candidato atleta / utente non ancora profilato
- **Expected:** invio link, completamento password, prima entrata
- **Actual:** route presenti; copertura E2E parziale (`athlete-registration-flow.spec.ts`, `login.spec.ts`) — non tutti i rami letti nel dettaglio
- **Stato:** da verificare
- **Priorità:** media

---

## RBAC, amministrazione e impersonazione

### Protezione route e redirect per ruolo

- **File:** `src/middleware.ts`, `src/lib/utils/role-normalizer.ts`, `src/lib/utils/role-redirect-paths.ts`, `src/components/shared/dashboard/role-layout.tsx`
- **Componenti:** layout ruolo condiviso
- **Hooks/Services:** guard vari (`use-staff-dashboard-guard`, `use-chat-page-guard`, …)
- **Tabelle DB:** `profiles` (ruolo, flags)
- **Ruoli:** admin, trainer/staff, atleta, sotto-ruoli (nutrizionista, massaggiatore)
- **Expected:** atleta su `/home`, staff su `/dashboard`, admin su `/dashboard/admin` dove previsto
- **Actual:** middleware disattivato se `CAPACITOR=true` (protezione affidata a client `RoleLayout`); E2E stabilized copre redirect atleta/trainer/admin
- **Stato:** parziale _(web ok; build nativa senza middleware server-side)_
- **Priorità:** alta _(se si distribuisce Capacitor in produzione)_

### Area admin (utenti, ruoli, KPI marketing, impersonazione)

- **File:** `src/app/dashboard/admin/**`, `src/app/api/admin/**` (users, roles, statistics, impersonation start/stop, cron marketing-kpis, assign-trainer)
- **Componenti:** `src/components/dashboard/admin/**`, `src/components/shared/impersonation-banner.tsx`
- **Hooks/Services:** API route con service client admin
- **Tabelle DB:** `profiles`, relazioni trainer-atleta, tabelle marketing se toccate dai KPI
- **Ruoli:** admin (e operazioni sensibili)
- **Expected:** gestione utenti/ruoli, impersonazione auditabile, cron KPI opzionale
- **Actual:** superficie ampia; E2E `stabilized-core-flows` verifica solo accesso admin a `/dashboard/admin`
- **Stato:** da verificare _(per numero endpoint e mancanza copertura E2E granulare)_
- **Priorità:** media

---

## Shell dashboard staff e layout condiviso

### Navigazione dashboard, sidebar, contenuto staff

- **File:** `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/components/dashboard/sidebar.tsx`, `src/components/shared/dashboard/staff-dashboard-layout.tsx`, `src/components/shared/dashboard/staff-content-layout.tsx`
- **Componenti:** sopra + widget home dashboard
- **Hooks/Services:** guard staff, fetch aggregati dashboard
- **Tabelle DB:** dipendenti dalla home (es. appuntamenti imminenti)
- **Ruoli:** staff (trainer, admin, ecc.)
- **Expected:** shell coerente e accesso alle sezioni permesse
- **Actual:** layout centrale usato da molte route; `dashboard.spec.ts` / smoke possibili
- **Stato:** funziona _(struttura)_
- **Priorità:** bassa

---

## Home atleta (portale)

### Home, navigazione atleta

- **File:** `src/app/home/layout.tsx`, `src/app/home/page.tsx`, `src/app/home/_components/home-layout-auth.tsx`, `src/app/home/_components/home-layout-client.tsx`
- **Componenti:** layout home
- **Hooks/Services:** `useAuth`, dati profilo
- **Tabelle DB:** `profiles`, contenuti per card home
- **Ruoli:** atleta
- **Expected:** entry point allenamenti, appuntamenti, documenti, chat, progressi
- **Actual:** sottoroute numerose; E2E `athlete-home.spec.ts`
- **Stato:** parziale _(dipende da ogni sottofeature)_
- **Priorità:** media

---

## Clienti (staff) e anagrafica atleti

### Lista clienti / sync PT–atleti

- **File:** `src/app/dashboard/clienti/page.tsx`, `src/app/api/clienti/sync-pt-atleti/route.ts`, `src/lib/validations/cliente.ts`
- **Componenti:** `src/components/dashboard/clienti/**`
- **Hooks/Services:** fetch clienti, sync
- **Tabelle DB:** relazione trainer–atleta (nomi legacy possibili: `pt_atleti` / varianti da migrazioni)
- **Ruoli:** trainer, admin
- **Expected:** elenco clienti assegnati, sincronizzazione relazioni
- **Actual:** lessico "clienti"/"atleti" misto (nota dominio); E2E `clienti.spec.ts`
- **Stato:** parziale _(incoerenza nominale aumenta rischio bug integrazione)_
- **Priorità:** media

### Creazione / dettaglio atleta (staff)

- **File:** `src/app/dashboard/atleti/[id]/page.tsx`, `src/app/api/athletes/create/route.ts`, `src/app/api/athletes/[id]/route.ts`, `src/components/dashboard/crea-atleta-modal.tsx`
- **Componenti:** modale creazione, pagina dettaglio
- **Hooks/Services:** API athletes
- **Tabelle DB:** `profiles` / record atleta
- **Ruoli:** staff
- **Expected:** CRUD atleta lato staff dove permesso
- **Actual:** route CRUD presenti; RLS non verificata file-per-file qui
- **Stato:** da verificare
- **Priorità:** media

---

## Profilo atleta (dettaglio staff)

### Tabs fitness, nutrizione, smart-tracking, AI, salvataggi

- **File:** `src/components/dashboard/athlete-profile/**`, `src/lib/athlete-profile/handle-athlete-profile-save.ts`
- **Componenti:** molte sottocartelle (`fitness/`, `nutrition/`, …)
- **Hooks/Services:** save centralizzato + chiamate Supabase sparse per tab
- **Tabelle DB:** multiple (progressi, schede, documenti collegati — tipo dipende dalla tab)
- **Ruoli:** trainer, nutrizionista (sezione pertinente), admin
- **Expected:** modifica e persistenza dati profilo atleta per area
- **Actual:** alto accoppiamento (nota dominio); E2E `profile.spec.ts` può coprire solo parte
- **Stato:** parziale
- **Priorità:** media

---

## Profilo home atleta e impostazioni account

### Profilo atleta vs profilo staff

- **File:** `src/app/home/profilo/page.tsx`, `src/app/dashboard/profilo/page.tsx`, `src/components/home-profile/**`, `src/components/profile/**`, `src/components/settings/**`
- **Componenti:** `settings-profile-tab.tsx`, `pt-profile-tab.tsx`, `athlete-overview-tab.tsx`
- **Hooks/Services:** `use-profilo-page-guard.ts` e affini
- **Tabelle DB:** `profiles`, preferenze account
- **Ruoli:** atleta; staff in `/dashboard/profilo`
- **Expected:** due entry profilo coerenti senza drift dati
- **Actual:** due alberi route distinti → rischio logica duplicata
- **Stato:** parziale
- **Priorità:** bassa

---

## Calendario, appuntamenti e promemoria

### Vista calendario staff (griglia, impostazioni slot)

- **File:** `src/app/dashboard/calendario/page.tsx`, `src/app/dashboard/calendario/impostazioni/page.tsx`, `src/app/dashboard/massaggiatore/calendario/page.tsx`, `src/app/dashboard/nutrizionista/calendario/page.tsx`, `src/components/calendar/calendar-view.tsx`, `src/lib/calendar-defaults.ts`, `src/hooks/calendar/use-calendar-page.ts`, `src/hooks/calendar/use-staff-calendar-settings.ts`
- **Componenti:** `appointment-form.tsx`, `appointment-detail.tsx`, `appointment-popover.tsx`
- **Hooks/Services:** hooks calendario; settings staff
- **Tabelle DB:** `appointments`, `staff_calendar_settings` (da migrazioni `20250310_*`, `20250312_*`), eventuali `custom_appointment_types`
- **Ruoli:** trainer, massaggiatore, nutrizionista, admin
- **Expected:** visualizzazione e configurazione griglia/orari
- **Actual:** migrazioni recenti su RLS/overlap/open booking (`20260318*`) indicano evoluzione attiva lato DB
- **Stato:** parziale _(UI solida; policy DB in churn documentato in `audit/rls/_`)\*
- **Priorità:** alta

### Lista / CRUD appuntamenti (pagina dedicata)

- **File:** `src/app/dashboard/appuntamenti/page.tsx`, `src/app/dashboard/_components/new-appointment-button.tsx`, `src/components/dashboard/appointment-modal.tsx`, `src/hooks/appointments/useStaffAppointmentsTable.ts`, `src/lib/appointments/staff-appointments-select.ts`, `src/lib/appointment-utils.ts`, `src/app/api/dashboard/appointments/route.ts`
- **Componenti:** `src/components/calendar/appointment-form.tsx`, `src/components/appointments/appointment-item.tsx`, tabella appuntamenti
- **Hooks/Services:** hook tabella staff; utility overlap/ricorrenze (`src/lib/recurrence-utils.ts`)
- **Tabelle DB:** `appointments`, `appointment_cancellations` (RLS in audit)
- **Ruoli:** staff; operazioni atleta su prenotazione slot dove previsto da policy
- **Expected:** creazione, modifica, cancellazione, coerenza dati e notifiche
- **Actual:** E2E `stabilized-core-flows.spec.ts` — ciclo crea/modifica/annulla trainer; `appointments.spec.ts` — flussi con admin; duplicazione percorsi UI calendario vs pagina appuntamenti
- **Stato:** parziale
- **Priorità:** alta

### Appuntamenti atleta (home)

- **File:** `src/app/home/appuntamenti/page.tsx`, `AppointmentListCard.tsx`, `AppuntamentiListView.tsx`, `src/hooks/useAthleteAppointments.ts`, `src/hooks/calendar/use-athlete-calendar-page.ts`
- **Componenti:** liste card
- **Hooks/Services:** `useAthleteAppointments`
- **Tabelle DB:** `appointments` (scope RLS atleta)
- **Ruoli:** atleta
- **Expected:** vedere/prenotare/cancellare secondo regole open booking
- **Actual:** logica “open booking” presente in migrazioni RLS; comportamento effettivo dipende da deployment SQL
- **Stato:** da verificare
- **Priorità:** alta

### Promemoria email e notifica cambio appuntamento

- **File:** `src/app/api/calendar/send-appointment-reminder/route.ts`, `src/lib/calendar/appointment-reminder-email.ts`, `src/app/api/calendar/notify-appointment-change/route.ts`
- **Componenti:** n/d (API)
- **Hooks/Services:** invio email; integrazione con `src/lib/notifications/*`
- **Tabelle DB:** dipendenze config email; record appuntamenti
- **Ruoli:** sistema (trigger/cron o chiamate applicative)
- **Expected:** reminder e notifiche su cambio stato
- **Actual:** route dedicate; scheduling non analizzato integralmente (cron/edge?)
- **Stato:** da verificare
- **Priorità:** media

---

## Comunicazioni di massa e invio email

### Invio list-based, batch, destinatari

- **File:** `src/app/dashboard/comunicazioni/page.tsx`, `src/app/api/communications/send/route.ts`, `src/app/api/communications/recipients/route.ts`, `src/app/api/communications/recipients/count/route.ts`, `src/app/api/communications/list-athletes/route.ts`, `src/lib/communications/service.ts`, `src/lib/communications/email.ts`, `src/components/communications/**`
- **Componenti:** `communications-list.tsx`, `new-communication-modal.tsx`
- **Hooks/Services:** `src/hooks/communications/use-communications-page.tsx`, batch in `src/lib/communications/`
- **Tabelle DB:** comunicazioni/coda (tipicamente custom tables; ref. `audit` comunicazioni se presente)
- **Ruoli:** staff con permesso invio
- **Expected:** selezione destinatari, invio, anti-stallo batch
- **Actual:** route `check-stuck` indica consapevolezza edge operativi; sovrapposizione tematica con `notifications` (nota dominio)
- **Stato:** parziale
- **Priorità:** media

---

## Chat

### Messaggistica staff / atleta

- **File:** `src/app/dashboard/chat/page.tsx`, `src/app/home/chat/page.tsx`, `src/components/chat/message-list.tsx`, `src/components/chat/conversation-list.tsx`
- **Componenti:** chat UI
- **Hooks/Services:** `src/lib/realtimeClient.ts`, `use-chat-page-guard.ts`
- **Tabelle DB:** messaggi/conversazioni (schema da tipi Supabase / doc CHAT nel repo DOCUMENTAZIONE)
- **Ruoli:** atleta, staff (a seconda conversazione)
- **Expected:** realtime, storico, permessi per ruolo
- **Actual:** E2E `chat-flow.spec.ts`; documentazione storica su fix chat in `DOCUMENTAZIONE/` — non riletta integralmente
- **Stato:** da verificare
- **Priorità:** media

---

## Documenti e anteprima

### Upload, storage, anteprima

- **File:** `src/app/dashboard/documenti/page.tsx`, `src/app/home/documenti/page.tsx`, `src/app/api/document-preview/route.ts`, `src/components/documents/document-uploader.tsx`, `src/lib/documents.ts`, `src/lib/all-athlete-documents.ts`
- **Componenti:** documenti dashboard + uploader
- **Hooks/Services:** API preview
- **Tabelle DB:** metadati documenti + Supabase Storage
- **Ruoli:** atleta (propri), staff (gestione)
- **Expected:** upload sicuro, preview, RLS storage
- **Actual:** E2E `documents.spec.ts`
- **Stato:** parziale _(storage+RLS sensibile all’ambiente)_
- **Priorità:** media

---

## Pagamenti e abbonamenti

### Tabelle pagamenti, crediti, abbonamenti per ruolo

- **File:** `src/app/dashboard/pagamenti/page.tsx`, `src/app/dashboard/abbonamenti/page.tsx`, `src/app/home/pagamenti/page.tsx`, `src/app/dashboard/nutrizionista/abbonamenti/page.tsx`, `src/app/dashboard/massaggiatore/abbonamenti/page.tsx`, `src/components/dashboard/pagamenti/payments-table.tsx`, `src/lib/export-payments.ts`, `src/lib/credits/ledger.ts`, `src/lib/abbonamenti-service-type.ts`
- **Componenti:** tabelle e form pagamenti
- **Hooks/Services:** servizi export e ledger
- **Tabelle DB:** pagamenti, abbonamenti, ledger crediti (nomi esatti in `src/types` / migrazioni `*_payments_*`)
- **Ruoli:** staff, atleta (visualizzazione propria), varianti nutrizionista/massaggiatore
- **Expected:** coerenza contabile e permessi
- **Actual:** superficie duplicata per ruolo; E2E `payment-lesson-counter-flow.spec.ts`
- **Stato:** parziale
- **Priorità:** alta _(dati finanziari)_

---

## Esercizi, allenamenti, schede e piani workout

### Catalogo esercizi, wizard allenamenti, piani atleta

- **File:** `src/app/dashboard/allenamenti/**`, `src/app/dashboard/esercizi/**`, `src/app/dashboard/schede/**`, `src/app/home/allenamenti/**`, `src/app/api/exercises/route.ts`, `src/app/api/athlete/workout-plans/route.ts`, `src/components/workout/workout-wizard.tsx`, `src/lib/workouts/**`, `src/lib/exercises-data.ts`
- **Componenti:** workout, workout-plans
- **Hooks/Services:** transformer piani, upload esercizi (`src/lib/exercise-upload-utils.ts`)
- **Tabelle DB:** esercizi, workout*plans, log (migrazioni `\*\_workout*\*`)
- **Ruoli:** trainer, atleta
- **Expected:** creazione schede, assegnazione piano, esecuzione atleta
- **Actual:** E2E `allenamenti.spec.ts`, `workout-creation-flow.spec.ts`, `workout-complete-modal.spec.ts`; RLS workout in migrazioni dedicate
- **Stato:** parziale
- **Priorità:** media

---

## Progressi, misurazioni e foto atleta

### Misurazioni, storico, foto risultati

- **File:** `src/app/home/progressi/**`, `src/app/home/foto-risultati/**`, `src/components/athlete/progress-*.tsx`, `src/components/dashboard/progress-*.tsx`, `src/lib/constants/progress-ranges.ts`
- **Componenti:** varie viste progresso
- **Hooks/Services:** analytics condiviso `src/lib/analytics.ts`
- **Tabelle DB:** log progressi (migrazioni progress logs in DOCUMENTAZIONE)
- **Ruoli:** atleta; export PDF nutrizionista collegato
- **Expected:** inserimento e storico misure/foto
- **Actual:** presenza `mock-data-progress` in dominio — verificare se ancora usato in produzione
- **Stato:** da verificare
- **Priorità:** bassa

---

## Inviti atleti

### Creazione invito, email, stato

- **File:** `src/app/dashboard/invita-atleta/page.tsx`, `src/app/api/invitations/**`, `src/lib/invitations/**`, `src/components/invitations/**`, `src/components/home/invito-cliente-wizard.tsx`
- **Componenti:** wizard invito
- **Hooks/Services:** `send-invitation-email`, validazioni `src/lib/validations/invito.ts`
- **Tabelle DB:** invitations (tipico)
- **Ruoli:** staff
- **Expected:** invio mail, tracking, completamento registrazione
- **Actual:** E2E `invita-atleta.spec.ts`
- **Stato:** parziale
- **Priorità:** media

---

## Onboarding, questionari e completamento profilo

### Step onboarding e questionari

- **File:** `src/app/api/onboarding/save-step/route.ts`, `save-questionnaire`, `finish`, `src/app/api/register/complete-profile/route.ts`
- **Componenti:** UI onboarding principalmente altrove (route sparse)
- **Hooks/Services:** API-only surface dominio
- **Tabelle DB:** risposte questionario, profilo esteso
- **Ruoli:** nuovo utente
- **Expected:** persistenza step e chiusura onboarding
- **Actual:** pochi page object dedicati rispetto ad altri domini (nota PROJECT_DOMAINS)
- **Stato:** da verificare
- **Priorità:** media

---

## Marketing (analytics, lead, automazioni, campagne, segmenti)

### Lead, conversioni, automazioni, campagne, KPI

- **File:** `src/app/dashboard/marketing/**`, `src/app/api/marketing/**`, `src/lib/marketing/**`, `src/app/api/admin/cron/refresh-marketing-kpis/route.ts`, `src/components/shared/analytics/**`
- **Componenti:** molte pagine (leads, campaigns, segments, automations, report)
- **Hooks/Services:** segment-rules, KPI refresh
- **Tabelle DB:** lead, eventi marketing, segmenti (specifiche in route marketing)
- **Ruoli:** marketing staff, admin
- **Expected:** funnel lead → atleta, campagne, automazioni
- **Actual:** E2E `marketing-lead-convert.spec.ts`, `marketing-athletes-kpis.spec.ts`, `marketing-security-no-raw.spec.ts`; superficie molto ampia → copertura E2E limitata a sottoinsiemi
- **Stato:** parziale
- **Priorità:** media

---

## Area nutrizionista

### Layout e moduli nutrizionista (atleti, piani, check-in, progressi, PDF)

- **File:** `src/app/dashboard/nutrizionista/**`, `src/app/api/nutritionist/extract-progress-pdf/route.ts`, `src/lib/nutrition-tables.ts`, `src/lib/dossier-pdf.ts`
- **Componenti:** pagine parallele dashboard generica
- **Hooks/Services:** export PDF
- **Tabelle DB:** piani nutrizionali, check-in, progressi
- **Ruoli:** nutrizionista, atleta (lettura propria dove previsto)
- **Expected:** gestione atleti assegnati e export
- **Actual:** albero route completo; E2E non elencati file-specific per ogni sottopagina in questo inventario
- **Stato:** da verificare
- **Priorità:** media

---

## Area massaggiatore

### Dashboard massaggiatore, calendario, abbonamenti, chat

- **File:** `src/app/dashboard/massaggiatore/**`, `src/app/home/massaggiatore/page.tsx`
- **Componenti:** layout dedicato
- **Hooks/Services:** riuso calendario/appuntamenti
- **Tabelle DB:** `appointments`, impostazioni come staff
- **Ruoli:** massaggiatore, atleta (home massaggiatore)
- **Expected:** stesse capability calendario con scope ruolo
- **Actual:** route dedicate; logica condivisa con dominio calendario → eredita criticità RLS
- **Stato:** parziale
- **Priorità:** media

---

## Notifiche e push

### Subscribe/unsubscribe Web Push, scheduler, notifiche atleta

- **File:** `src/app/api/push/subscribe/route.ts`, `unsubscribe`, `vapid-key`, `src/lib/notifications/push.ts`, `scheduler.ts`, `src/lib/notifications.ts`, `src/components/sw-register.tsx`, `src/components/athlete/notifications-section.tsx`
- **Componenti:** sezione notifiche, service worker register
- **Hooks/Services:** `use-notifications.ts`, `use-progress-reminders.ts`
- **Tabelle DB:** subscription push (tipico), preferenze
- **Ruoli:** atleta principalmente; notifiche sistema
- **Expected:** opt-in/out, consegna push, reminder collegati a dominio calendario
- **Actual:** dipendenza VAPID/env e permesso browser; integrazione con cambio appuntamento via API calendar
- **Stato:** da verificare _(fortemente legato a deploy e browser)_
- **Priorità:** media

---

## Impostazioni per area

### Account, 2FA, notifiche, impostazioni calendario/marketing/nutrizionista/massaggiatore

- **File:** `src/app/dashboard/impostazioni/**`, `src/app/dashboard/calendario/impostazioni/page.tsx`, `src/app/dashboard/marketing/impostazioni/page.tsx`, `src/app/dashboard/nutrizionista/impostazioni/page.tsx`, `src/app/dashboard/massaggiatore/impostazioni/page.tsx`, `src/components/settings/**`
- **Componenti:** `settings-account-tab.tsx`, `two-factor-setup.tsx`, `settings-notifications-tab.tsx`, `src/components/dashboard/impostazioni-page-header.tsx`
- **Hooks/Services:** `use-impostazioni-page-guard.ts`
- **Tabelle DB:** `profiles`, preferenze notifiche
- **Ruoli:** tutti gli utenti autenticati (per area)
- **Expected:** un solo modello mentale per “impostazioni” nonostante route multiple
- **Actual:** molte entry “impostazioni” per contesto → rischio duplicazione logica
- **Stato:** parziale
- **Priorità:** bassa

---

## Statistiche e reporting staff

### KPI staff e admin

- **File:** `src/app/dashboard/statistiche/page.tsx`, `src/app/dashboard/admin/statistiche/page.tsx`, `src/app/dashboard/massaggiatore/statistiche/page.tsx`, `src/components/dashboard/statistiche-content.tsx`, `src/app/api/admin/statistics/route.ts`, `src/lib/analytics.ts`, `src/lib/analytics-export.ts`, `src/components/charts/**`
- **Componenti:** grafici e tabelle stat
- **Hooks/Services:** fetch KPI
- **Tabelle DB:** aggregazioni su appuntamenti, pagamenti, utenti
- **Ruoli:** staff, admin
- **Expected:** numeri coerenti con RLS (non leaky)
- **Actual:** E2E `statistics.spec.ts`; rischio leak = policy DB
- **Stato:** da verificare
- **Priorità:** media

---

## Pagine pubbliche e legal

### Privacy, termini, landing

- **File:** `src/app/privacy/page.tsx`, `src/app/termini/page.tsx`, `src/app/page.tsx` (redirect `/`→`/login` in middleware)
- **Componenti:** accordion legal
- **Hooks/Services:** nessuno critico
- **Tabelle DB:** —
- **Ruoli:** pubblico
- **Expected:** contenuti legali statici
- **Actual:** pagine presenti
- **Stato:** funziona _(contenuto legale non revisionato qui)_
- **Priorità:** bassa

---

## Design system e kit UI

### Reference UI interna e primitivi

- **File:** `src/app/design-system/**`, `src/components/ui/**`, `src/components/shared/ui/**`, `GUIDA_DESIGN_SYSTEM.md`
- **Componenti:** libreria componenti
- **Hooks/Services:** token `src/lib/design-tokens/*`
- **Tabelle DB:** —
- **Ruoli:** dev interno
- **Expected:** coerenza visiva progetto
- **Actual:** due alberi `ui/` vs `shared/ui/` (nota dominio: possibile duplicazione ruoli componente)
- **Stato:** parziale _(organizzazione)_
- **Priorità:** bassa

---

## Infrastruttura client/server e API trasversali

### Client Supabase, cache, health, provider

- **File:** `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `src/app/api/health/route.ts`, `src/providers/**`, `src/lib/cache/**`, `src/lib/api-client.ts`
- **Componenti:** provider React
- **Hooks/Services:** `use-supabase.ts`, `use-supabase-client.ts`
- **Tabelle DB:** —
- **Ruoli:** —
- **Expected:** sessione coerente server/client, healthcheck deploy
- **Actual:** health route presente; pattern SSR documentato in repo
- **Stato:** funziona _(struttura)_
- **Priorità:** bassa

---

## Database Supabase (migrazioni, RLS, edge functions)

### Schema, policy, funzioni edge documentate

- **File:** `supabase/migrations/**`, `supabase/functions/document-reminders/index.ts`, `marketing-kpi-refresh/index.ts`, `supabase/config.toml`
- **Componenti:** n/d
- **Hooks/Services:** n/d
- **Tabelle DB:** intero schema
- **Ruoli:** tutti (tramite policy)
- **Expected:** RLS allineata all’app; migrazioni applicate in ordine
- **Actual:** cartella `audit/rls/` + migrazioni `20260318*` su appointments/overlap/open booking → **area ad alta attenzione**; `DOCUMENTAZIONE/TEST_RLS_DISABLED.md` nel repo (se ancora valido) aumenta incertezza
- **Stato:** parziale
- **Priorità:** alta

---

## Audit applicativo e middleware

### Log audit azioni sensibili

- **File:** `src/lib/audit.ts`, `src/lib/audit-middleware.ts`, `src/components/shared/audit/audit-logs.tsx`
- **Componenti:** UI log (se esposta)
- **Hooks/Services:** contesto audit in middleware
- **Tabelle DB:** tabella audit se persistita
- **Ruoli:** admin / compliance
- **Expected:** tracciamento azioni critiche
- **Actual:** integrazione con middleware per contesto
- **Stato:** da verificare
- **Priorità:** bassa

---

## Diagnostica e operatività

### Route debug (trainer visibility, comunicazioni stuck)

- **File:** `src/app/api/debug-trainer-visibility/route.ts`, `src/app/api/communications/check-stuck/route.ts`
- **Componenti:** n/d
- **Hooks/Services:** diagnostica
- **Tabelle DB:** dipendente
- **Ruoli:** operazioni interne / staff con accesso
- **Expected:** strumenti supporto non esposti indebitamente
- **Actual:** presenza route suggerisce problemi storici risolti via diagnostica
- **Stato:** da verificare _(sicurezza accesso route)_
- **Priorità:** media

---

## App nativa Capacitor

### Build Android/iOS

- **File:** `capacitor.config.ts`, `android/`, `ios/`
- **Componenti:** webview app
- **Hooks/Services:** middleware skip quando `CAPACITOR=true`
- **Tabelle DB:** —
- **Ruoli:** —
- **Expected:** parità sicurezza e auth con web
- **Actual:** **nessun middleware server-side auth** in build Capacitor → affidamento a guard client
- **Stato:** parziale
- **Priorità:** alta _(se rilascio store previsto)_

---

## Test automatizzati

### E2E Playwright e unit/integration

- **File:** `tests/e2e/*.spec.ts` (38 spec elencati), `playwright.config.ts`, `playwright.config.ci.ts`, Vitest sotto `src/**/__tests__`
- **Componenti:** n/d
- **Hooks/Services:** n/d
- **Tabelle DB:** ambienti di test / seed
- **Ruoli:** —
- **Expected:** regressione su flussi critici
- **Actual:** suite ampia; **affidabilità dichiarata** in parte solo su Chromium (skip WebKit/mobile per auth in `stabilized-core-flows`)
- **Stato:** parziale
- **Priorità:** media

---

## Sintesi: intervento prioritario (da questo file)

| Priorità | Dove                                                    | Perché                                                              |
| -------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| Alta     | Calendario/appuntamenti + migrazioni RLS `appointments` | Churn policy documentato; E2E copre solo sottoinsieme; più entry UI |
| Alta     | Pagamenti/abbonamenti                                   | Dati sensibili; più superfici per ruolo                             |
| Alta     | Build Capacitor                                         | Middleware auth disattivato                                         |
| Media    | Comunicazioni vs notifiche                              | Sovrapposizione e batch complessi                                   |
| Media    | Clienti/atleti naming e sync                            | Rischio integrazione tra lessico e tabelle legacy                   |

**Affidabile (struttura):** shell dashboard, legal statiche, health/infrastruttura Supabase client, flusso redirect ruoli su web con E2E stabilized.

**Fragile:** policy DB non allineate all’ultimo codice; WebKit/mobile auth in test; duplicazioni (`useAuth` vs `use-auth`, doppio profilo, `ui` vs `shared/ui`).
