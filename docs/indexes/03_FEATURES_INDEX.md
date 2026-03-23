# Feature — indice operativo per dominio

Fonti incrociate: `audit/PROJECT_DOMAINS.md`, `audit/FEATURE_STATUS.md`, `audit/CANONICAL_SOURCES.md`, `audit/RULE_CONFLICTS.md`, `audit/routes_files.txt`, `audit/components.txt`, `audit/hooks.txt`, `audit/lib_utils_services.txt`, `audit/tests.txt`.  
Stato e priorità riflettono l’inventario (non esito runtime singolo).

---

# Come usare questo index

1. **Una feature alla volta** — apri solo la sezione della feature su cui stai lavorando; evita ricerche a tappeto nel repo.
2. **Apri prima i file elencati** in _File chiave_ e _Fonte canonica_; non duplicare logica fuori da quelle fonti senza decisione esplicita (`audit/CANONICAL_SOURCES.md`).
3. **Canonical first** — se esiste un modulo canonico per l’area (es. `role-redirect-paths.ts`, `appointment-utils.ts`), non introdurre una seconda regola in componenti o hook paralleli.
4. **Prima della patch** — leggi _Rischi / conflitti noti_ (e `audit/RULE_CONFLICTS.md` per dettaglio) e _Test presenti_; dopo la patch esegui almeno i test indicati o quelli della feature adiacente se condividono codice.
5. **DB / RLS** — il comportamento autorizzativo reale è sul database deployato; `audit/rls/*` è supporto decisionale. Modifiche SQL solo con SQL esplicito e conferma (`regole progetto`).
6. **Incertezza** — dove l’audit dice "da verificare", non assumere comportamento in produzione senza prova.

---

## Autenticazione e flussi ingresso

- **Scopo sintetico:** login, sessione, post-login, API auth, pagine forgot/reset/registrati/welcome.
- **Stato dominio:** fragile (due path hook auth coesistenti).
- **Priorità operativa:** media.

### Login e sessione (email/password, redirect post-login)

| Campo                               | Valore                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Autenticazione, refresh sessione, redirect verso area di competenza.                                                                                               |
| **Route principali**                | `/login`, `/post-login`; API `src/app/api/auth/context/route.ts` (contesto).                                                                                       |
| **File chiave**                     | `src/app/login/page.tsx`, `src/components/auth/login-form.tsx`, `src/app/post-login/page.tsx`, `src/lib/supabase/middleware.ts`, `src/providers/auth-provider.tsx` |
| **Componenti principali**           | `src/components/auth/login-form.tsx`, `src/components/auth/LoginCard.tsx`                                                                                          |
| **Hooks / Services / Utils**        | `src/hooks/useAuth.ts`; coesiste `src/hooks/use-auth.ts` (legacy — vedi canonica)                                                                                  |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md` (Auth): `login-form`, `post-login`, `api/auth/context`, `middleware`, `auth-provider`; unificare import su `useAuth.ts`.              |
| **Tabelle / RLS / note DB**         | `auth.users` (Supabase); profili app (`profiles` — da migrazioni).                                                                                                 |
| **Ruoli coinvolti**                 | Tutti (pre-RBAC).                                                                                                                                                  |
| **Stato**                           | funziona (riserva test WebKit/mobile come da inventario test).                                                                                                     |
| **Rischi / conflitti noti**         | Hook duplicato (`use-auth` vs `useAuth`) — `audit/RULE_CONFLICTS.md`; fallback ruolo `athlete` se normalizzazione fallisce (provider vs API) — stesso doc.         |
| **Test presenti**                   | E2E `tests/e2e/stabilized-core-flows.spec.ts` (anonimo→login, redirect per ruolo — da `FEATURE_STATUS`).                                                           |
| **Test mancanti**                   | Copertura WebKit/mobile dove skippata in inventario — da verificare.                                                                                               |
| **Prossimo intervento consigliato** | Unificare entrypoint hook auth; allineare fallback ruolo tra `auth-provider`, `auth/context`, `middleware` (`CANONICAL_SOURCES` + `RULE_CONFLICTS`).               |

### Recupero / reset password, registrazione, welcome

| Campo                               | Valore                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Invio link, completamento password, prima entrata.                                                                                                                            |
| **Route principali**                | `/forgot-password`, `/reset-password`, `/registrati`, `/welcome`; `src/app/api/auth/forgot-password/route.ts`                                                                 |
| **File chiave**                     | `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/registrati/page.tsx`, `src/app/welcome/page.tsx`, `src/app/api/auth/forgot-password/route.ts` |
| **Componenti principali**           | Pagine dedicate (da `FEATURE_STATUS`).                                                                                                                                        |
| **Hooks / Services / Utils**        | Supabase Auth via client/server.                                                                                                                                              |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md`: route sotto `src/app/api/auth/**` e pagine dedicate; nessuna seconda API auth parallela non documentata.                                        |
| **Tabelle / RLS / note DB**         | `auth.users`; eventuali tabelle invito/onboarding collegate.                                                                                                                  |
| **Ruoli coinvolti**                 | Candidato atleta / utente non ancora profilato.                                                                                                                               |
| **Stato**                           | da verificare.                                                                                                                                                                |
| **Rischi / conflitti noti**         | Copertura E2E parziale sui rami (`FEATURE_STATUS`).                                                                                                                           |
| **Test presenti**                   | `athlete-registration-flow.spec.ts`, `login.spec.ts` (citati in `FEATURE_STATUS` — non tutti i rami dettagliati).                                                             |
| **Test mancanti**                   | E2E granulari su ogni ramo forgot/reset/registrazione — da verificare.                                                                                                        |
| **Prossimo intervento consigliato** | Mappare test E2E su tutti i flussi o checklist manuale documentata.                                                                                                           |

---

## RBAC, amministrazione e impersonazione

- **Scopo sintetico:** middleware, normalizzazione ruoli, redirect, area admin, API admin, impersonazione.
- **Stato dominio:** fragile (middleware vs Capacitor; guard vs `role-redirect-paths`; superficie admin ampia).
- **Priorità operativa:** alta se si distribuisce Capacitor in produzione; altrimenti media–alta per allineamento guard.

### Protezione route e redirect per ruolo

| Campo                               | Valore                                                                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Atleta su `/home`, staff su `/dashboard`, admin dove previsto; coerenza con matcher.                                                                                    |
| **Route principali**                | Pattern in `src/middleware.ts`; layout `role-layout`.                                                                                                                   |
| **File chiave**                     | `src/middleware.ts`, `src/lib/utils/role-normalizer.ts`, `src/lib/utils/role-redirect-paths.ts`, `src/components/shared/dashboard/role-layout.tsx`                      |
| **Componenti principali**           | `role-layout.tsx`                                                                                                                                                       |
| **Hooks / Services / Utils**        | Guard: `use-staff-dashboard-guard`, `use-chat-page-guard`, altri `use-*-page-guard` (elenchi in `audit/hooks.txt`).                                                     |
| **Fonte canonica**                  | `role-normalizer.ts`, `role-redirect-paths.ts` (`ROLE_DEFAULT_APP_PATH`, `getDefaultAppPathForRole`); `middleware` allineato ai path prodotti da `role-redirect-paths`. |
| **Tabelle / RLS / note DB**         | `profiles` (ruolo, flags).                                                                                                                                              |
| **Ruoli coinvolti**                 | admin, trainer/staff, atleta, sotto-ruoli (nutrizionista, massaggiatore, marketing, …).                                                                                 |
| **Stato**                           | parziale (web ok; con `CAPACITOR=true` niente enforcement middleware server-side).                                                                                      |
| **Rischi / conflitti noti**         | `use-staff-dashboard-guard` vs `role-redirect-paths` (mappa ruoli incompleta vs middleware) — `RULE_CONFLICTS.md`; middleware assente su Capacitor — stesso doc.        |
| **Test presenti**                   | E2E `stabilized-core-flows.spec.ts` (redirect atleta/trainer/admin — `FEATURE_STATUS`).                                                                                 |
| **Test mancanti**                   | Parità guard per tutti i ruoli in `role-redirect-paths` — da verificare.                                                                                                |
| **Prossimo intervento consigliato** | Delegare guard a `getDefaultAppPathForRole` / stesso Record di `role-redirect-paths`; strategia minaccia nativa documentata.                                            |

### Area admin (utenti, ruoli, KPI marketing, impersonazione)

| Campo                               | Valore                                                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Gestione utenti/ruoli, impersonazione, cron KPI, assegnazioni trainer.                                                                                                |
| **Route principali**                | `/dashboard/admin/**`; `src/app/api/admin/**`                                                                                                                         |
| **File chiave**                     | `src/app/dashboard/admin/**`, `src/app/api/admin/**` (users, roles, statistics, impersonation start/stop, cron marketing-kpis, assign-trainer — da `PROJECT_DOMAINS`) |
| **Componenti principali**           | `src/components/dashboard/admin/**`, `src/components/shared/impersonation-banner.tsx`, `role-permissions-editor.tsx`                                                  |
| **Hooks / Services / Utils**        | API route + client admin.                                                                                                                                             |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md`: admin `src/app/api/admin/**`; impersonazione `api/admin/impersonation/**` + banner.                                                     |
| **Tabelle / RLS / note DB**         | `profiles`; relazioni trainer–atleta; tabelle marketing se toccate dai KPI.                                                                                           |
| **Ruoli coinvolti**                 | admin.                                                                                                                                                                |
| **Stato**                           | da verificare (endpoint numerosi; E2E granulare limitata).                                                                                                            |
| **Rischi / conflitti noti**         | Copertura E2E: `stabilized-core-flows` verifica solo accesso a `/dashboard/admin` (`FEATURE_STATUS`).                                                                 |
| **Test presenti**                   | `stabilized-core-flows.spec.ts` (accesso admin).                                                                                                                      |
| **Test mancanti**                   | E2E su ruoli, impersonazione, KPI — da verificare.                                                                                                                    |
| **Prossimo intervento consigliato** | Inventario endpoint critici + test mirati o checklist; allineare permessi granulari a `role-permissions-editor` + API senza duplicare mappa ruolo→area.               |

---

## Shell dashboard staff e layout condiviso

- **Scopo sintetico:** layout staff, sidebar, contenuto, home dashboard staff.
- **Stato dominio:** stabile (struttura).
- **Priorità operativa:** bassa.

### Navigazione dashboard, sidebar, contenuto staff

| Campo                               | Valore                                                                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Shell coerente e accesso alle sezioni permesse.                                                                                                                                                                                |
| **Route principali**                | `/dashboard`, `/dashboard/*` (layout).                                                                                                                                                                                         |
| **File chiave**                     | `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/components/dashboard/sidebar.tsx`, `src/components/shared/dashboard/staff-dashboard-layout.tsx`, `src/components/shared/dashboard/staff-content-layout.tsx` |
| **Componenti principali**           | Sopra + widget home dashboard (`FEATURE_STATUS`).                                                                                                                                                                              |
| **Hooks / Services / Utils**        | Guard staff; fetch aggregati dashboard.                                                                                                                                                                                        |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md`: `layout.tsx`, `staff-dashboard-layout`, `staff-content-layout`, `sidebar.tsx`.                                                                                                                   |
| **Tabelle / RLS / note DB**         | Dipendenti dalla home (es. appuntamenti imminenti).                                                                                                                                                                            |
| **Ruoli coinvolti**                 | staff (trainer, admin, ecc.).                                                                                                                                                                                                  |
| **Stato**                           | funziona (struttura).                                                                                                                                                                                                          |
| **Rischi / conflitti noti**         | `src/components/dashboard/` include anche feature grandi (es. profilo atleta) — accoppiamento (`PROJECT_DOMAINS`).                                                                                                             |
| **Test presenti**                   | `dashboard.spec.ts` / smoke possibili (`FEATURE_STATUS`); da verificare elenco aggiornato in `audit/tests.txt`.                                                                                                                |
| **Test mancanti**                   | da verificare per copertura widget home.                                                                                                                                                                                       |
| **Prossimo intervento consigliato** | Mantenere una sola shell; nuove voci sidebar solo con permessi allineati a RBAC.                                                                                                                                               |

---

## Home atleta (portale)

- **Scopo sintetico:** entry point atleta (`/home/**`).
- **Stato dominio:** fragile (dipende dalle sottofeature).
- **Priorità operativa:** media.

### Home, navigazione atleta

| Campo                               | Valore                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Card e link verso allenamenti, appuntamenti, documenti, chat, progressi.                                                                               |
| **Route principali**                | `/home`, `/home/*`                                                                                                                                     |
| **File chiave**                     | `src/app/home/layout.tsx`, `src/app/home/page.tsx`, `src/app/home/_components/home-layout-auth.tsx`, `src/app/home/_components/home-layout-client.tsx` |
| **Componenti principali**           | Layout home.                                                                                                                                           |
| **Hooks / Services / Utils**        | `useAuth`, dati profilo.                                                                                                                               |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md`: `home-layout-auth`, `home-layout-client`.                                                                                |
| **Tabelle / RLS / note DB**         | `profiles`; contenuti per card home.                                                                                                                   |
| **Ruoli coinvolti**                 | atleta.                                                                                                                                                |
| **Stato**                           | parziale.                                                                                                                                              |
| **Rischi / conflitti noti**         | Commento in `home-layout-auth` vs realtà Capacitor (middleware) — `RULE_CONFLICTS.md` / `CANONICAL_SOURCES`.                                           |
| **Test presenti**                   | `tests/e2e/athlete-home.spec.ts` (`FEATURE_STATUS`).                                                                                                   |
| **Test mancanti**                   | Copertura per ogni sottorotta — da verificare.                                                                                                         |
| **Prossimo intervento consigliato** | Allineare messaggistica doc al modello minaccia Capacitor; guard sottopagine coerenti con RBAC.                                                        |

---

## Clienti (staff) e anagrafica atleti

- **Scopo sintetico:** lista clienti, sync PT–atleti, CRUD atleta.
- **Stato dominio:** fragile (lessico clienti/atleti; tabelle relazione legacy).
- **Priorità operativa:** media.

### Lista clienti / sync PT–atleti

| Campo                               | Valore                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Elenco clienti assegnati, sincronizzazione relazioni.                                                                 |
| **Route principali**                | `/dashboard/clienti`; API `src/app/api/clienti/sync-pt-atleti/route.ts`                                               |
| **File chiave**                     | `src/app/dashboard/clienti/page.tsx`, `src/app/api/clienti/sync-pt-atleti/route.ts`, `src/lib/validations/cliente.ts` |
| **Componenti principali**           | `src/components/dashboard/clienti/**`                                                                                 |
| **Hooks / Services / Utils**        | Fetch clienti, sync.                                                                                                  |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md`: `clienti/page`, API `clienti`, `validations/cliente.ts`.                                |
| **Tabelle / RLS / note DB**         | Relazione trainer–atleta (nomi legacy: `pt_atleti` / varianti — `FEATURE_STATUS`).                                    |
| **Ruoli coinvolti**                 | trainer, admin.                                                                                                       |
| **Stato**                           | parziale.                                                                                                             |
| **Rischi / conflitti noti**         | Lessico misto clienti/atleti; triade tabelle in `RULE_CONFLICTS` / `audit/rls/RLS_DUPLICATES.md` (solo audit).        |
| **Test presenti**                   | `tests/e2e/clienti.spec.ts` (`FEATURE_STATUS`).                                                                       |
| **Test mancanti**                   | Test integrazione naming/DB — da verificare.                                                                          |
| **Prossimo intervento consigliato** | Vista API unificata dopo inventario schema SQL (`CANONICAL_SOURCES`).                                                 |

### Creazione / dettaglio atleta (staff)

| Campo                               | Valore                                                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | CRUD atleta lato staff dove permesso.                                                                                                                                    |
| **Route principali**                | `/dashboard/atleti/[id]`; `src/app/api/athletes/create/route.ts`, `src/app/api/athletes/[id]/route.ts`                                                                   |
| **File chiave**                     | `src/app/dashboard/atleti/[id]/page.tsx`, `src/app/api/athletes/create/route.ts`, `src/app/api/athletes/[id]/route.ts`, `src/components/dashboard/crea-atleta-modal.tsx` |
| **Componenti principali**           | Modale creazione, pagina dettaglio.                                                                                                                                      |
| **Hooks / Services / Utils**        | API athletes.                                                                                                                                                            |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md`: API `athletes/**`.                                                                                                                         |
| **Tabelle / RLS / note DB**         | `profiles` / record atleta; RLS non verificata file-per-file in inventario.                                                                                              |
| **Ruoli coinvolti**                 | staff.                                                                                                                                                                   |
| **Stato**                           | da verificare.                                                                                                                                                           |
| **Rischi / conflitti noti**         | Policy SELECT/INSERT da confermare su ambiente.                                                                                                                          |
| **Test presenti**                   | da verificare in `audit/tests.txt` / spec dedicati.                                                                                                                      |
| **Test mancanti**                   | E2E CRUD completo — da verificare.                                                                                                                                       |
| **Prossimo intervento consigliato** | Allineare test a permessi RLS reali dopo verifica SQL.                                                                                                                   |

---

## Profilo atleta (dettaglio staff)

- **Scopo sintetico:** tabs profilo atleta (fitness, nutrizione, smart-tracking, AI, …).
- **Stato dominio:** fragile (accoppiamento alto).
- **Priorità operativa:** media.

### Tabs fitness, nutrizione, smart-tracking, AI, salvataggi

| Campo                               | Valore                                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Modifica e persistenza dati profilo atleta per area.                                                                                                    |
| **Route principali**                | Componenti montati da route atleti/dashboard (non una sola page in inventario).                                                                         |
| **File chiave**                     | `src/components/dashboard/athlete-profile/**`, `src/lib/athlete-profile/handle-athlete-profile-save.ts`; `athlete-profile-tabs.tsx` (`PROJECT_DOMAINS`) |
| **Componenti principali**           | Sottocartelle `fitness/`, `nutrition/`, …                                                                                                               |
| **Hooks / Services / Utils**        | Save centralizzato + chiamate Supabase per tab.                                                                                                         |
| **Fonte canonica**                  | `handle-athlete-profile-save.ts`, `athlete-profile-tabs.tsx` (`CANONICAL_SOURCES`).                                                                     |
| **Tabelle / RLS / note DB**         | Multiple (progressi, schede, documenti — dipende da tab).                                                                                               |
| **Ruoli coinvolti**                 | trainer, nutrizionista (sezioni pertinenti), admin.                                                                                                     |
| **Stato**                           | parziale.                                                                                                                                               |
| **Rischi / conflitti noti**         | Save scatterato senza passare dall’handle — sospetto duplicazione (`CANONICAL_SOURCES`).                                                                |
| **Test presenti**                   | `tests/e2e/profile.spec.ts` (copertura parziale — `FEATURE_STATUS`).                                                                                    |
| **Test mancanti**                   | E2E per tutte le tab — da verificare.                                                                                                                   |
| **Prossimo intervento consigliato** | Unificare salvataggi verso `handle-athlete-profile-save`.                                                                                               |

---

## Profilo home atleta e impostazioni account

- **Scopo sintetico:** profilo `/home/profilo` vs `/dashboard/profilo`, impostazioni account.
- **Stato dominio:** fragile (due entry UX, stessa riga `profiles`).
- **Priorità operativa:** bassa.

### Profilo atleta vs profilo staff (impostazioni)

| Campo                               | Valore                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Due entry profilo coerenti senza drift dati.                                                                                                                       |
| **Route principali**                | `/home/profilo`, `/dashboard/profilo`                                                                                                                              |
| **File chiave**                     | `src/app/home/profilo/page.tsx`, `src/app/dashboard/profilo/page.tsx`, `src/components/home-profile/**`, `src/components/profile/**`, `src/components/settings/**` |
| **Componenti principali**           | `settings-profile-tab.tsx`, `pt-profile-tab.tsx`, `athlete-overview-tab.tsx`                                                                                       |
| **Hooks / Services / Utils**        | `use-profilo-page-guard.ts` e affini (`FEATURE_STATUS`).                                                                                                           |
| **Fonte canonica**                  | `audit/CANONICAL_SOURCES.md`: pagine home/dashboard + `components/settings/**`; persistenza unica su `profiles`.                                                   |
| **Tabelle / RLS / note DB**         | `profiles`, preferenze account.                                                                                                                                    |
| **Ruoli coinvolti**                 | atleta; staff in `/dashboard/profilo`.                                                                                                                             |
| **Stato**                           | parziale.                                                                                                                                                          |
| **Rischi / conflitti noti**         | Due alberi route → logica duplicata (`FEATURE_STATUS`).                                                                                                            |
| **Test presenti**                   | da verificare in spec profilo/impostazioni.                                                                                                                        |
| **Test mancanti**                   | Test drift tra le due entry — da verificare.                                                                                                                       |
| **Prossimo intervento consigliato** | Unificare persistence path (hook o API unica).                                                                                                                     |

---

## Calendario, appuntamenti e promemoria

- **Scopo sintetico:** calendario staff, lista/tabellare, appuntamenti atleta, reminder e notify.
- **Stato dominio:** critico (overlap UI vs tabella; `org_id`; RLS in evoluzione in audit).
- **Priorità operativa:** alta.

### Vista calendario staff (griglia, impostazioni slot)

| Campo                               | Valore                                                                                                                                                                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Visualizzazione e configurazione griglia/orari.                                                                                                                                                                                                                            |
| **Route principali**                | `/dashboard/calendario`, `/dashboard/calendario/impostazioni`; varianti `nutrizionista/calendario`, `massaggiatore/calendario` (`FEATURE_STATUS`).                                                                                                                         |
| **File chiave**                     | `src/app/dashboard/calendario/page.tsx`, `src/app/dashboard/calendario/impostazioni/page.tsx`, `src/components/calendar/calendar-view.tsx`, `src/lib/calendar-defaults.ts`, `src/hooks/calendar/use-calendar-page.ts`, `src/hooks/calendar/use-staff-calendar-settings.ts` |
| **Componenti principali**           | `appointment-form.tsx`, `appointment-detail.tsx`, `appointment-popover.tsx`                                                                                                                                                                                                |
| **Hooks / Services / Utils**        | `use-calendar-page.ts`, `use-staff-calendar-settings.ts`; `appointment-utils.ts`, `recurrence-utils.ts`                                                                                                                                                                    |
| **Fonte canonica**                  | Overlap: `src/lib/appointment-utils.ts`; ricorrenze: `recurrence-utils.ts`; griglia: `use-calendar-page.ts` (comportamento insert/update); settings: `use-staff-calendar-settings.ts`, `calendar-defaults.ts` (`CANONICAL_SOURCES`).                                       |
| **Tabelle / RLS / note DB**         | `appointments`, `staff_calendar_settings` (migrazioni citate in `FEATURE_STATUS`); policy in churn — `audit/rls/*`.                                                                                                                                                        |
| **Ruoli coinvolti**                 | trainer, massaggiatore, nutrizionista, admin.                                                                                                                                                                                                                              |
| **Stato**                           | parziale (UI; policy DB in churn).                                                                                                                                                                                                                                         |
| **Rischi / conflitti noti**         | Overlap: calendario applica `checkStaffCalendarSlotOverlap`; tabella staff no — `RULE_CONFLICTS`; `org_id` / `org_id_text` — stesso doc.                                                                                                                                   |
| **Test presenti**                   | E2E ciclo appuntamenti in `stabilized-core-flows.spec.ts`, `appointments.spec.ts` (riferimenti incrociati `FEATURE_STATUS`).                                                                                                                                               |
| **Test mancanti**                   | Allineamento comportamento overlap su tutte le UI — da coprire dopo unificazione.                                                                                                                                                                                          |
| **Prossimo intervento consigliato** | Una sola policy prodotto + allineamento a `appointment-utils` ovunque; payload coerente con colonne RLS (`CANONICAL_SOURCES`).                                                                                                                                             |

### Lista / CRUD appuntamenti (pagina dedicata)

| Campo                               | Valore                                                                                                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Creazione, modifica, cancellazione da lista/tabellare staff.                                                                                                                                                                            |
| **Route principali**                | `/dashboard/appuntamenti`; API `src/app/api/dashboard/appointments/route.ts`                                                                                                                                                            |
| **File chiave**                     | `src/app/dashboard/appuntamenti/page.tsx`, `src/components/dashboard/appointment-modal.tsx`, `src/hooks/appointments/useStaffAppointmentsTable.ts`, `src/lib/appointments/staff-appointments-select.ts`, `src/lib/appointment-utils.ts` |
| **Componenti principali**           | `appointment-form.tsx`, `appointment-item.tsx`, tabella appuntamenti                                                                                                                                                                    |
| **Hooks / Services / Utils**        | `useStaffAppointmentsTable.ts`; `staff-appointments-select.ts`; `recurrence-utils.ts`                                                                                                                                                   |
| **Fonte canonica**                  | Select riusabile: `staff-appointments-select.ts`; overlap da allineare a `appointment-utils` (tabella oggi non canonica per overlap — `CANONICAL_SOURCES`).                                                                             |
| **Tabelle / RLS / note DB**         | `appointments`, `appointment_cancellations`.                                                                                                                                                                                            |
| **Ruoli coinvolti**                 | staff.                                                                                                                                                                                                                                  |
| **Stato**                           | parziale.                                                                                                                                                                                                                               |
| **Rischi / conflitti noti**         | Validazione overlap rimossa in tabella per “più atleti stesso orario” — critico (`RULE_CONFLICTS`); `org_id` fallback `default-org` in hook tabella.                                                                                    |
| **Test presenti**                   | `stabilized-core-flows.spec.ts`, `appointments.spec.ts` (`FEATURE_STATUS`).                                                                                                                                                             |
| **Test mancanti**                   | Test che asseriscono stessa regola overlap calendario vs tabella — assenti finché non unificato.                                                                                                                                        |
| **Prossimo intervento consigliato** | Portare `useStaffAppointmentsTable` alla semantica di `appointment-utils` + RLS; unificare “oggi” con helper condiviso (`RULE_CONFLICTS` lista vs API dashboard).                                                                       |

### Appuntamenti atleta (home)

| Campo                               | Valore                                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Vedere/prenotare/cancellare secondo open booking e RLS.                                                                                                                               |
| **Route principali**                | `/home/appuntamenti`                                                                                                                                                                  |
| **File chiave**                     | `src/app/home/appuntamenti/page.tsx`, `AppointmentListCard.tsx`, `AppuntamentiListView.tsx`, `src/hooks/useAthleteAppointments.ts`, `src/hooks/calendar/use-athlete-calendar-page.ts` |
| **Componenti principali**           | Liste card (`FEATURE_STATUS`).                                                                                                                                                        |
| **Hooks / Services / Utils**        | `useAthleteAppointments.ts`                                                                                                                                                           |
| **Fonte canonica**                  | Query/filtri: hook **non** fonte di verità permessi — da delegare a helper + RLS (`CANONICAL_SOURCES` / `RULE_CONFLICTS`).                                                            |
| **Tabelle / RLS / note DB**         | `appointments` (scope atleta); open booking in migrazioni RLS.                                                                                                                        |
| **Ruoli coinvolti**                 | atleta.                                                                                                                                                                               |
| **Stato**                           | da verificare (comportamento dipende da deployment SQL).                                                                                                                              |
| **Rischi / conflitti noti**         | Filtri staff per ruoli non trainer/admin assenti nel ramo else — `RULE_CONFLICTS`.                                                                                                    |
| **Test presenti**                   | da verificare in `audit/tests.txt` per spec dedicata.                                                                                                                                 |
| **Test mancanti**                   | Matrice ruoli esplicita + test — da verificare.                                                                                                                                       |
| **Prossimo intervento consigliato** | Riscrivere filtri ruoli o guard “non supportato”; allineare a middleware.                                                                                                             |

### Promemoria email e notifica cambio appuntamento

| Campo                               | Valore                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Reminder e notifiche su cambio stato.                                                                                                    |
| **Route principali**                | API `src/app/api/calendar/send-appointment-reminder/route.ts`, `src/app/api/calendar/notify-appointment-change/route.ts`                 |
| **File chiave**                     | `src/lib/calendar/appointment-reminder-email.ts`; route sopra                                                                            |
| **Componenti principali**           | n/d (API).                                                                                                                               |
| **Hooks / Services / Utils**        | Invio email; integrazione `src/lib/notifications/*`                                                                                      |
| **Fonte canonica**                  | Route calendar + `appointment-reminder-email`; confine con `lib/notifications` — `CANONICAL_SOURCES` (verificare duplicazione pipeline). |
| **Tabelle / RLS / note DB**         | Config email; record appuntamenti.                                                                                                       |
| **Ruoli coinvolti**                 | sistema / automazioni.                                                                                                                   |
| **Stato**                           | da verificare (scheduling/cron non analizzato integralmente in inventario).                                                              |
| **Rischi / conflitti noti**         | Possibile seconda pipeline senza passare da `notifications` — `CANONICAL_SOURCES`.                                                       |
| **Test presenti**                   | da verificare.                                                                                                                           |
| **Test mancanti**                   | da verificare.                                                                                                                           |
| **Prossimo intervento consigliato** | Documentare trigger (cron/edge) e unificare con scheduler notifiche se duplicato.                                                        |

---

## Comunicazioni di massa e invio email

- **Scopo sintetico:** invii massivi, destinatari, batch, email.
- **Stato dominio:** fragile (sovrapposizione con `lib/notifications`).
- **Priorità operativa:** media.

### Invio list-based, batch, destinatari

| Campo                               | Valore                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Selezione destinatari, invio, anti-stallo batch.                                                                                                                                                                                                                                                                              |
| **Route principali**                | `/dashboard/comunicazioni`; `src/app/api/communications/**`                                                                                                                                                                                                                                                                   |
| **File chiave**                     | `src/app/dashboard/comunicazioni/page.tsx`, `src/app/api/communications/send/route.ts`, `src/app/api/communications/recipients/route.ts`, `src/app/api/communications/recipients/count/route.ts`, `src/app/api/communications/list-athletes/route.ts`, `src/lib/communications/service.ts`, `src/lib/communications/email.ts` |
| **Componenti principali**           | `communications-list.tsx`, `new-communication-modal.tsx`                                                                                                                                                                                                                                                                      |
| **Hooks / Services / Utils**        | `src/hooks/communications/use-communications-page.tsx`, batch in `src/lib/communications/`                                                                                                                                                                                                                                    |
| **Fonte canonica**                  | `service.ts`, `email.ts`, API `communications/**` (`CANONICAL_SOURCES`).                                                                                                                                                                                                                                                      |
| **Tabelle / RLS / note DB**         | Code/coda comunicazioni (dettaglio tabella — da tipi/migrazioni).                                                                                                                                                                                                                                                             |
| **Ruoli coinvolti**                 | staff con permesso invio.                                                                                                                                                                                                                                                                                                     |
| **Stato**                           | parziale.                                                                                                                                                                                                                                                                                                                     |
| **Rischi / conflitti noti**         | Sovrapposizione tematica con `lib/notifications` — `RULE_CONFLICTS`; route `check-stuck` indica edge operativi.                                                                                                                                                                                                               |
| **Test presenti**                   | da verificare in `audit/tests.txt` / `DOCUMENTAZIONE` citata in repo (non riletta qui).                                                                                                                                                                                                                                       |
| **Test mancanti**                   | da verificare.                                                                                                                                                                                                                                                                                                                |
| **Prossimo intervento consigliato** | Delimitare comunicazioni massiva vs notifiche transazionali; unificare entrypoint se accoppiati.                                                                                                                                                                                                                              |

---

## Chat

- **Scopo sintetico:** messaggistica staff/atleta realtime.
- **Stato dominio:** da verificare.
- **Priorità operativa:** media.

### Messaggistica staff / atleta

| Campo                               | Valore                                                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Realtime, storico, permessi per ruolo.                                                                                                               |
| **Route principali**                | `/dashboard/chat`, `/home/chat`                                                                                                                      |
| **File chiave**                     | `src/app/dashboard/chat/page.tsx`, `src/app/home/chat/page.tsx`, `src/components/chat/message-list.tsx`, `src/components/chat/conversation-list.tsx` |
| **Componenti principali**           | Chat UI.                                                                                                                                             |
| **Hooks / Services / Utils**        | `src/lib/realtimeClient.ts`, `use-chat-page-guard.ts`                                                                                                |
| **Fonte canonica**                  | `realtimeClient.ts` + pagine chat; un solo client realtime (`CANONICAL_SOURCES`).                                                                    |
| **Tabelle / RLS / note DB**         | Messaggi/conversazioni (schema da tipi Supabase — `FEATURE_STATUS`).                                                                                 |
| **Ruoli coinvolti**                 | atleta, staff.                                                                                                                                       |
| **Stato**                           | da verificare.                                                                                                                                       |
| **Rischi / conflitti noti**         | Documentazione storica in `DOCUMENTAZIONE/` — non riletta in inventario.                                                                             |
| **Test presenti**                   | `tests/e2e/chat-flow.spec.ts` (`FEATURE_STATUS`).                                                                                                    |
| **Test mancanti**                   | Copertura permessi per ruolo — da verificare.                                                                                                        |
| **Prossimo intervento consigliato** | Verificare RLS/schema messaggi su ambiente; mantenere logica in `realtimeClient`.                                                                    |

---

## Documenti e anteprima

- **Scopo sintetico:** upload, storage, anteprima documenti.
- **Stato dominio:** fragile (storage + RLS sensibile all’ambiente).
- **Priorità operativa:** media.

### Upload, storage, anteprima

| Campo                               | Valore                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Upload sicuro, preview, permessi.                                                                            |
| **Route principali**                | `/dashboard/documenti`, `/home/documenti`; API `src/app/api/document-preview/route.ts`                       |
| **File chiave**                     | `src/components/documents/document-uploader.tsx`, `src/lib/documents.ts`, `src/lib/all-athlete-documents.ts` |
| **Componenti principali**           | Documenti dashboard + uploader.                                                                              |
| **Hooks / Services / Utils**        | API preview.                                                                                                 |
| **Fonte canonica**                  | `documents.ts`, `all-athlete-documents.ts`, `document-preview` (`CANONICAL_SOURCES`).                        |
| **Tabelle / RLS / note DB**         | Metadati + Supabase Storage.                                                                                 |
| **Ruoli coinvolti**                 | atleta (propri); staff.                                                                                      |
| **Stato**                           | parziale.                                                                                                    |
| **Rischi / conflitti noti**         | Fetch duplicati fuori dai lib — sospetto (`CANONICAL_SOURCES`).                                              |
| **Test presenti**                   | `tests/e2e/documents.spec.ts` (`FEATURE_STATUS`).                                                            |
| **Test mancanti**                   | Storage edge cases — da verificare.                                                                          |
| **Prossimo intervento consigliato** | Unificare accessi tramite `lib/documents`.                                                                   |

---

## Pagamenti e abbonamenti

- **Scopo sintetico:** pagamenti, crediti, abbonamenti per ruolo.
- **Stato dominio:** fragile (dati finanziari; più superfici per ruolo; write path ledger allineato — residui UX/legacy).
- **Priorità operativa:** alta.

### Tabelle pagamenti, crediti, abbonamenti per ruolo

| Campo                               | Valore                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Coerenza contabile e permessi.                                                                                                                                                                                                                                                                                               |
| **Route principali**                | `/dashboard/pagamenti`, `/dashboard/abbonamenti`, `/home/pagamenti`, varianti `nutrizionista/abbonamenti`, `massaggiatore/abbonamenti` (`PROJECT_DOMAINS`).                                                                                                                                                                  |
| **File chiave**                     | `src/components/dashboard/pagamenti/payments-table.tsx`, `src/lib/export-payments.ts`, `src/lib/credits/ledger.ts`, `src/lib/abbonamenti-service-type.ts`, `src/components/dashboard/nuovo-pagamento-modal.tsx`, `src/components/dashboard/payment-form-modal.tsx`                                                           |
| **Componenti principali**           | Tabelle e form pagamenti (`nuovo-pagamento-modal` flusso principale; `payment-form-modal` entry legacy/semplificata).                                                                                                                                                                                                        |
| **Hooks / Services / Utils**        | Export, ledger.                                                                                                                                                                                                                                                                                                              |
| **Fonte canonica**                  | **Write path pagamenti:** `insert` su `payments` poi `addCreditFromPayment` in `ledger.ts` (riga `credit_ledger`); **`lesson_counters` non aggiornato dal client** nei form allineati (coerente con trigger DB sul ledger). `abbonamenti-service-type.ts`, `export-payments.ts`, `payments-table.tsx` (`CANONICAL_SOURCES`). |
| **Tabelle / RLS / note DB**         | `payments`, `credit_ledger`, `lesson_counters` (lettura/sync lato DB), abbonamenti (nomi in `src/types` / migrazioni — `FEATURE_STATUS`).                                                                                                                                                                                    |
| **Ruoli coinvolti**                 | staff, atleta (vista propria), varianti ruolo.                                                                                                                                                                                                                                                                               |
| **Stato**                           | parziale.                                                                                                                                                                                                                                                                                                                    |
| **Rischi / conflitti noti**         | Pagine parallele per ruolo — rischio divergenza UX/regole; `payment-form-modal` ancora **parzialmente legacy** (`defaultServiceForRole`, form ridotto vs `nuovo-pagamento-modal`).                                                                                                                                           |
| **Test presenti**                   | `tests/e2e/payment-lesson-counter-flow.spec.ts` (`FEATURE_STATUS`).                                                                                                                                                                                                                                                          |
| **Test mancanti**                   | Test per ogni superficie ruolo — da verificare.                                                                                                                                                                                                                                                                              |
| **Prossimo intervento consigliato** | Mantenere un solo pattern write (`payments` + `addCreditFromPayment`); convergere o documentare entry legacy; regole contabili solo in lib condivise.                                                                                                                                                                        |

---

## Esercizi, allenamenti, schede e piani workout

- **Scopo sintetico:** catalogo esercizi, wizard, piani atleta.
- **Stato dominio:** fragile (nomenclatura mista; RLS workout in migrazioni).
- **Priorità operativa:** media.

### Catalogo esercizi, wizard allenamenti, piani atleta

| Campo                               | Valore                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Creazione schede, assegnazione piano, esecuzione atleta.                                                                                                           |
| **Route principali**                | `/dashboard/allenamenti`, `/dashboard/esercizi`, `/dashboard/schede`, `/home/allenamenti`; API `src/app/api/exercises/`, `src/app/api/athlete/workout-plans/`      |
| **File chiave**                     | `src/components/workout/workout-wizard.tsx`, `src/lib/workouts/workout-transformers.ts`, `src/app/api/athlete/workout-plans/route.ts`, `src/lib/exercises-data.ts` |
| **Componenti principali**           | `workout/`, `workout-plans/`                                                                                                                                       |
| **Hooks / Services / Utils**        | Trasformazioni piani; `src/lib/exercise-upload-utils.ts`                                                                                                           |
| **Fonte canonica**                  | `src/lib/workouts/**`, API exercises/workout-plans, `workout-wizard.tsx` (`CANONICAL_SOURCES`).                                                                    |
| **Tabelle / RLS / note DB**         | Esercizi, `workout_plans`, log (migrazioni `*_workout_*` — `FEATURE_STATUS`).                                                                                      |
| **Ruoli coinvolti**                 | trainer, atleta.                                                                                                                                                   |
| **Stato**                           | parziale.                                                                                                                                                          |
| **Rischi / conflitti noti**         | Duplicazione dati esercizi API vs `exercises-data` — da verificare (`CANONICAL_SOURCES`).                                                                          |
| **Test presenti**                   | `allenamenti.spec.ts`, `workout-creation-flow.spec.ts`, `workout-complete-modal.spec.ts` (`FEATURE_STATUS`).                                                       |
| **Test mancanti**                   | da verificare per RLS edge.                                                                                                                                        |
| **Prossimo intervento consigliato** | Single fetch / unificazione catalogo; allineare a tipi `src/types`.                                                                                                |

---

## Progressi, misurazioni e foto atleta

- **Scopo sintetico:** misure, storico, foto risultati.
- **Stato dominio:** da verificare (mock citati in inventario).
- **Priorità operativa:** bassa.

### Misurazioni, storico, foto risultati

| Campo                               | Valore                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Inserimento e storico misure/foto.                                                                                            |
| **Route principali**                | `/home/progressi`, `/home/foto-risultati`                                                                                     |
| **File chiave**                     | `src/app/home/progressi/**`, `src/app/home/foto-risultati/**`, `src/lib/constants/progress-ranges.ts`, `src/lib/analytics.ts` |
| **Componenti principali**           | `athlete/progress-*.tsx`, `dashboard/progress-*.tsx`                                                                          |
| **Hooks / Services / Utils**        | `analytics.ts` (condiviso con statistiche).                                                                                   |
| **Fonte canonica**                  | Costanti `progress-ranges`; dati reali DB — `mock-data-progress.ts` sospetto se usato in prod (`CANONICAL_SOURCES`).          |
| **Tabelle / RLS / note DB**         | Log progressi; policy `progress_logs` citate in `RULE_CONFLICTS` (audit RLS).                                                 |
| **Ruoli coinvolti**                 | atleta; export PDF nutrizionista collegato.                                                                                   |
| **Stato**                           | da verificare.                                                                                                                |
| **Rischi / conflitti noti**         | Presenza `mock-data-progress` in dominio — verificare uso (`FEATURE_STATUS`).                                                 |
| **Test presenti**                   | da verificare.                                                                                                                |
| **Test mancanti**                   | da verificare.                                                                                                                |
| **Prossimo intervento consigliato** | Eliminare mock da path produzione o isolare test/storybook.                                                                   |

---

## Inviti atleti

- **Scopo sintetico:** creazione invito, email, completamento registrazione.
- **Stato dominio:** parziale.
- **Priorità operativa:** media.

### Creazione invito, email, stato

| Campo                               | Valore                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Invio mail, tracking, completamento registrazione.                                                       |
| **Route principali**                | `/dashboard/invita-atleta`; `src/app/api/invitations/**`                                                 |
| **File chiave**                     | `src/lib/invitations/**`, `src/lib/validations/invito.ts`, `src/app/api/invitations/send-email/route.ts` |
| **Componenti principali**           | `src/components/invitations/**`, `src/components/home/invito-cliente-wizard.tsx`                         |
| **Hooks / Services / Utils**        | `send-invitation-email`, validazioni.                                                                    |
| **Fonte canonica**                  | `lib/invitations/**`, API `invitations/**` (`CANONICAL_SOURCES`).                                        |
| **Tabelle / RLS / note DB**         | invitations (tipico).                                                                                    |
| **Ruoli coinvolti**                 | staff.                                                                                                   |
| **Stato**                           | parziale.                                                                                                |
| **Rischi / conflitti noti**         | Seconda implementazione invito fuori da `lib/invitations` — sospetto (`CANONICAL_SOURCES`).              |
| **Test presenti**                   | `tests/e2e/invita-atleta.spec.ts` (`FEATURE_STATUS`).                                                    |
| **Test mancanti**                   | da verificare.                                                                                           |
| **Prossimo intervento consigliato** | Unificare percorso invio email.                                                                          |

---

## Onboarding, questionari e completamento profilo

- **Scopo sintetico:** step onboarding, questionari, complete profile.
- **Stato dominio:** da verificare (superficie soprattutto API).
- **Priorità operativa:** media.

### Step onboarding e questionari

| Campo                               | Valore                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Persistenza step e chiusura onboarding.                                                                                       |
| **Route principali**                | `src/app/api/onboarding/save-step/route.ts`, `save-questionnaire`, `finish`; `src/app/api/register/complete-profile/route.ts` |
| **File chiave**                     | Route sopra (`PROJECT_DOMAINS`, `FEATURE_STATUS`).                                                                            |
| **Componenti principali**           | UI onboarding principalmente altrove.                                                                                         |
| **Hooks / Services / Utils**        | API-only surface in inventario.                                                                                               |
| **Fonte canonica**                  | API `onboarding/**`, `register/complete-profile` (`CANONICAL_SOURCES`).                                                       |
| **Tabelle / RLS / note DB**         | Risposte questionario, profilo esteso.                                                                                        |
| **Ruoli coinvolti**                 | nuovo utente.                                                                                                                 |
| **Stato**                           | da verificare.                                                                                                                |
| **Rischi / conflitti noti**         | Save step sparsi fuori da queste API — sospetto (`CANONICAL_SOURCES`).                                                        |
| **Test presenti**                   | pochi page object dedicati (`FEATURE_STATUS`).                                                                                |
| **Test mancanti**                   | E2E onboarding end-to-end — da verificare.                                                                                    |
| **Prossimo intervento consigliato** | Unificare verso le API canoniche.                                                                                             |

---

## Marketing (analytics, lead, automazioni, campagne, segmenti)

- **Scopo sintetico:** lead, campagne, segmenti, KPI, automazioni.
- **Stato dominio:** fragile (superficie ampia; E2E su sottoinsiemi).
- **Priorità operativa:** media.

### Lead, conversioni, automazioni, campagne, KPI

| Campo                               | Valore                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Funnel lead → atleta, campagne, automazioni.                                                                                                                 |
| **Route principali**                | `/dashboard/marketing/**`, `/dashboard/admin/utenti/marketing/**`; `src/app/api/marketing/**`; cron `src/app/api/admin/cron/refresh-marketing-kpis/route.ts` |
| **File chiave**                     | `src/lib/marketing/segment-rules.ts`, `src/app/dashboard/marketing/leads/page.tsx`, `src/app/api/marketing/leads/route.ts`                                   |
| **Componenti principali**           | `src/components/shared/analytics/**`; molte pagine marketing.                                                                                                |
| **Hooks / Services / Utils**        | segment-rules; KPI refresh.                                                                                                                                  |
| **Fonte canonica**                  | `segment-rules.ts`, API `marketing/**`, cron refresh KPI (`CANONICAL_SOURCES`).                                                                              |
| **Tabelle / RLS / note DB**         | Lead, eventi marketing, segmenti (specifiche nelle route).                                                                                                   |
| **Ruoli coinvolti**                 | marketing staff, admin.                                                                                                                                      |
| **Stato**                           | parziale.                                                                                                                                                    |
| **Rischi / conflitti noti**         | Regole segmentazione duplicate in componenti — sospetto (`CANONICAL_SOURCES`).                                                                               |
| **Test presenti**                   | `marketing-lead-convert.spec.ts`, `marketing-athletes-kpis.spec.ts`, `marketing-security-no-raw.spec.ts` (`FEATURE_STATUS`).                                 |
| **Test mancanti**                   | Copertura su tutte le sottoroute — da verificare.                                                                                                            |
| **Prossimo intervento consigliato** | Centralizzare regole in `segment-rules` / servizi lib.                                                                                                       |

---

## Area nutrizionista

- **Scopo sintetico:** moduli nutrizionista (atleti, piani, check-in, progressi, PDF).
- **Stato dominio:** da verificare (E2E non mappati per ogni sottopagina in inventario).
- **Priorità operativa:** media.

### Layout e moduli nutrizionista

| Campo                               | Valore                                                                                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Gestione atleti assegnati e export.                                                                                                                             |
| **Route principali**                | `/dashboard/nutrizionista/**`                                                                                                                                   |
| **File chiave**                     | `src/app/dashboard/nutrizionista/layout.tsx`, `src/app/api/nutritionist/extract-progress-pdf/route.ts`, `src/lib/nutrition-tables.ts`, `src/lib/dossier-pdf.ts` |
| **Componenti principali**           | Pagine parallele alla dashboard generica.                                                                                                                       |
| **Hooks / Services / Utils**        | Export PDF.                                                                                                                                                     |
| **Fonte canonica**                  | Layout nutrizionista; nessuna seconda implementazione overlap/org — riuso `lib/appointments/**` (`CANONICAL_SOURCES`).                                          |
| **Tabelle / RLS / note DB**         | Piani nutrizionali, check-in, progressi.                                                                                                                        |
| **Ruoli coinvolti**                 | nutrizionista, atleta (dove previsto).                                                                                                                          |
| **Stato**                           | da verificare.                                                                                                                                                  |
| **Rischi / conflitti noti**         | Copy-paste query appuntamenti divergente da lib — sospetto (`CANONICAL_SOURCES`).                                                                               |
| **Test presenti**                   | da verificare per sottopagine.                                                                                                                                  |
| **Test mancanti**                   | E2E per moduli principali — da verificare.                                                                                                                      |
| **Prossimo intervento consigliato** | Unificare query con `src/lib/appointments/**`.                                                                                                                  |

---

## Area massaggiatore

- **Scopo sintetico:** dashboard massaggiatore, calendario, abbonamenti, home massaggiatore.
- **Stato dominio:** fragile (eredita criticità calendario/RLS).
- **Priorità operativa:** media.

### Dashboard massaggiatore, calendario, abbonamenti, chat

| Campo                               | Valore                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Stesse capability calendario con scope ruolo.                                                                                   |
| **Route principali**                | `/dashboard/massaggiatore/**`, `/home/massaggiatore`                                                                            |
| **File chiave**                     | `src/app/dashboard/massaggiatore/layout.tsx`, `src/app/dashboard/massaggiatore/page.tsx`, `src/app/home/massaggiatore/page.tsx` |
| **Componenti principali**           | Layout dedicato.                                                                                                                |
| **Hooks / Services / Utils**        | Riuso calendario/appuntamenti.                                                                                                  |
| **Fonte canonica**                  | Layout massaggiatore; query allineate a `lib/appointments/**` (`CANONICAL_SOURCES`).                                            |
| **Tabelle / RLS / note DB**         | `appointments`, impostazioni staff.                                                                                             |
| **Ruoli coinvolti**                 | massaggiatore, atleta.                                                                                                          |
| **Stato**                           | parziale.                                                                                                                       |
| **Rischi / conflitti noti**         | Criticità condivise con dominio calendario (`FEATURE_STATUS`).                                                                  |
| **Test presenti**                   | da verificare.                                                                                                                  |
| **Test mancanti**                   | da verificare.                                                                                                                  |
| **Prossimo intervento consigliato** | Dopo fix calendario/RLS, verificare route dedicate massaggiatore.                                                               |

---

## Notifiche e push

- **Scopo sintetico:** Web Push, scheduler, notifiche atleta, integrazione calendario.
- **Stato dominio:** fragile (env/browser/deploy; sovrapposizione con `lib/notifications.ts` vs cartella).
- **Priorità operativa:** media.

### Subscribe/unsubscribe Web Push, scheduler, notifiche atleta

| Campo                               | Valore                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scopo**                           | Opt-in/out, consegna push, reminder collegati al calendario.                                                                                                                   |
| **Route principali**                | `src/app/api/push/subscribe/route.ts`, `unsubscribe`, `vapid-key`                                                                                                              |
| **File chiave**                     | `src/lib/notifications/push.ts`, `scheduler.ts`, `src/lib/notifications/types.ts`, `src/components/sw-register.tsx`, `src/app/api/calendar/notify-appointment-change/route.ts` |
| **Componenti principali**           | `athlete/notifications-section.tsx`                                                                                                                                            |
| **Hooks / Services / Utils**        | `use-notifications.ts`, `use-progress-reminders.ts`                                                                                                                            |
| **Fonte canonica**                  | `push.ts`, `scheduler.ts`, `types.ts`, API `push/**` (`CANONICAL_SOURCES`); unificare con `src/lib/notifications.ts` se overlap.                                               |
| **Tabelle / RLS / note DB**         | Subscription push, preferenze.                                                                                                                                                 |
| **Ruoli coinvolti**                 | atleta principalmente; sistema.                                                                                                                                                |
| **Stato**                           | da verificare (VAPID/env/browser).                                                                                                                                             |
| **Rischi / conflitti noti**         | `src/lib/notifications.ts` vs cartella `notifications/` — deprecare o fondere (`CANONICAL_SOURCES`).                                                                           |
| **Test presenti**                   | da verificare.                                                                                                                                                                 |
| **Test mancanti**                   | Push in CI spesso limitato — da verificare.                                                                                                                                    |
| **Prossimo intervento consigliato** | Unificare superficie modulo; confine chiaro con comunicazioni di massa.                                                                                                        |

---

## Impostazioni per area

- **Scopo sintetico:** account, 2FA, notifiche, impostazioni per contesto (calendario, marketing, …).
- **Stato dominio:** fragile (molte entry “impostazioni”).
- **Priorità operativa:** bassa.

### Account, 2FA, notifiche, impostazioni multi-entry

| Campo                               | Valore                                                                                                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Un modello mentale per impostazioni nonostante route multiple.                                                                                                                         |
| **Route principali**                | `/dashboard/impostazioni`, `/dashboard/calendario/impostazioni`, `/dashboard/marketing/impostazioni`, `/dashboard/nutrizionista/impostazioni`, `/dashboard/massaggiatore/impostazioni` |
| **File chiave**                     | `src/components/settings/settings-account-tab.tsx`, `two-factor-setup.tsx`, `settings-notifications-tab.tsx`, `src/components/dashboard/impostazioni-page-header.tsx`                  |
| **Componenti principali**           | Tab settings.                                                                                                                                                                          |
| **Hooks / Services / Utils**        | `use-impostazioni-page-guard.ts`                                                                                                                                                       |
| **Fonte canonica**                  | `components/settings/**` + guard; persistenza unica `profiles`/preferenze (`CANONICAL_SOURCES`).                                                                                       |
| **Tabelle / RLS / note DB**         | `profiles`, preferenze notifiche.                                                                                                                                                      |
| **Ruoli coinvolti**                 | utenti autenticati (per area).                                                                                                                                                         |
| **Stato**                           | parziale.                                                                                                                                                                              |
| **Rischi / conflitti noti**         | Duplicazione logica salvataggi tra route — `FEATURE_STATUS`.                                                                                                                           |
| **Test presenti**                   | da verificare.                                                                                                                                                                         |
| **Test mancanti**                   | da verificare.                                                                                                                                                                         |
| **Prossimo intervento consigliato** | Unificare salvataggi su API/hook condivisi.                                                                                                                                            |

---

## Statistiche e reporting staff

- **Scopo sintetico:** KPI staff, admin, massaggiatore; grafici.
- **Stato dominio:** da verificare (rischio leak = policy DB).
- **Priorità operativa:** media.

### KPI staff e admin

| Campo                               | Valore                                                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Numeri coerenti con RLS (non leaky).                                                                                                               |
| **Route principali**                | `/dashboard/statistiche`, `/dashboard/admin/statistiche`, `/dashboard/massaggiatore/statistiche`                                                   |
| **File chiave**                     | `src/components/dashboard/statistiche-content.tsx`, `src/app/api/admin/statistics/route.ts`, `src/lib/analytics.ts`, `src/lib/analytics-export.ts` |
| **Componenti principali**           | `src/components/charts/**`, componenti `statistiche*.tsx`                                                                                          |
| **Hooks / Services / Utils**        | Fetch KPI.                                                                                                                                         |
| **Fonte canonica**                  | `analytics.ts`, `analytics-export.ts`, `api/admin/statistics` (`CANONICAL_SOURCES`).                                                               |
| **Tabelle / RLS / note DB**         | Aggregazioni su appuntamenti, pagamenti, utenti.                                                                                                   |
| **Ruoli coinvolti**                 | staff, admin.                                                                                                                                      |
| **Stato**                           | da verificare.                                                                                                                                     |
| **Rischi / conflitti noti**         | Query KPI duplicate fuori da analytics lib — sospetto (`CANONICAL_SOURCES`).                                                                       |
| **Test presenti**                   | `tests/e2e/statistics.spec.ts` (`FEATURE_STATUS`).                                                                                                 |
| **Test mancanti**                   | Test leak cross-org — da verificare (richiede ambiente).                                                                                           |
| **Prossimo intervento consigliato** | Unificare query in lib analytics; validare policy DB.                                                                                              |

---

## Pagine pubbliche e legal

- **Scopo sintetico:** privacy, termini, landing.
- **Stato dominio:** stabile.
- **Priorità operativa:** bassa.

### Privacy, termini, landing

| Campo                               | Valore                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------- |
| **Scopo**                           | Contenuti legali statici.                                                  |
| **Route principali**                | `/privacy`, `/termini`, `/` (redirect — `FEATURE_STATUS`)                  |
| **File chiave**                     | `src/app/privacy/page.tsx`, `src/app/termini/page.tsx`, `src/app/page.tsx` |
| **Componenti principali**           | Accordion legal (`FEATURE_STATUS`).                                        |
| **Hooks / Services / Utils**        | nessuno critico.                                                           |
| **Fonte canonica**                  | Pagine statiche (`CANONICAL_SOURCES`).                                     |
| **Tabelle / RLS / note DB**         | —                                                                          |
| **Ruoli coinvolti**                 | pubblico.                                                                  |
| **Stato**                           | funziona (contenuto legale non revisionato in inventario).                 |
| **Rischi / conflitti noti**         | Revisione legale contenuti — fuori scope inventario.                       |
| **Test presenti**                   | da verificare.                                                             |
| **Test mancanti**                   | da verificare.                                                             |
| **Prossimo intervento consigliato** | Mantenere; aggiornare testi solo con revisione legale.                     |

---

## Design system (UI reference) e kit UI primitivo

- **Scopo sintetico:** reference interna `/design-system`, primitivi `ui/` e `shared/ui/`, token.
- **Stato dominio:** parziale (due alberi UI).
- **Priorità operativa:** bassa.

### Reference UI interna e primitivi

| Campo                               | Valore                                                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Coerenza visiva; primitivi riusabili.                                                                                                                                                                                                       |
| **Route principali**                | `/design-system`                                                                                                                                                                                                                            |
| **File chiave**                     | `src/app/design-system/page.tsx`, `src/app/design-system/GUIDA_DESIGN_SYSTEM.md`, `src/lib/design-tokens/*`, `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, `src/components/shared/ui/empty-state.tsx` (`PROJECT_DOMAINS`) |
| **Componenti principali**           | `src/components/ui/**`, `src/components/shared/ui/**`                                                                                                                                                                                       |
| **Hooks / Services / Utils**        | Token design.                                                                                                                                                                                                                               |
| **Fonte canonica**                  | `GUIDA_DESIGN_SYSTEM.md` + `design-system/**`; per nuovo codice primitivi `components/ui/**`, pattern staff in `shared/ui` (`CANONICAL_SOURCES`).                                                                                           |
| **Tabelle / RLS / note DB**         | —                                                                                                                                                                                                                                           |
| **Ruoli coinvolti**                 | dev interno.                                                                                                                                                                                                                                |
| **Stato**                           | parziale (organizzazione due alberi).                                                                                                                                                                                                       |
| **Rischi / conflitti noti**         | Duplicazione ruoli tra `ui/` e `shared/ui/` — `PROJECT_DOMAINS`.                                                                                                                                                                            |
| **Test presenti**                   | da verificare.                                                                                                                                                                                                                              |
| **Test mancanti**                   | da verificare.                                                                                                                                                                                                                              |
| **Prossimo intervento consigliato** | Unificazione graduale secondo guida design system.                                                                                                                                                                                          |

---

## Infrastruttura client/server e API trasversali

- **Scopo sintetico:** client Supabase, cache, health, provider.
- **Stato dominio:** stabile (struttura); **fragile** sul punto sessione getSession/getUser.
- **Priorità operativa:** bassa (alta se si tocca catena auth lato API).

### Client Supabase, cache, health, provider

| Campo                               | Valore                                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Sessione coerente server/client; healthcheck.                                                                                                   |
| **Route principali**                | `src/app/api/health/route.ts`                                                                                                                   |
| **File chiave**                     | `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `src/providers/**`, `src/lib/cache/**`, `src/lib/api-client.ts` (`PROJECT_DOMAINS`) |
| **Componenti principali**           | Provider React.                                                                                                                                 |
| **Hooks / Services / Utils**        | `use-supabase.ts`, `use-supabase-client.ts` (elenchi in audit).                                                                                 |
| **Fonte canonica**                  | Entrypoint Supabase e provider (`CANONICAL_SOURCES`); API server: preferenza `getUser` vs `getSession` — vedere conflitto.                      |
| **Tabelle / RLS / note DB**         | —                                                                                                                                               |
| **Ruoli coinvolti**                 | —                                                                                                                                               |
| **Stato**                           | funziona (struttura); catena profilo **parziale** per `getSession` vs `getUser`.                                                                |
| **Rischi / conflitti noti**         | `get-current-profile.ts` vs `get-user-profile.ts` — `RULE_CONFLICTS.md`.                                                                        |
| **Test presenti**                   | da verificare.                                                                                                                                  |
| **Test mancanti**                   | da verificare.                                                                                                                                  |
| **Prossimo intervento consigliato** | Policy unica `getUser`/`getSession` per route handler sensibili.                                                                                |

---

## Database Supabase (migrazioni, RLS, edge functions)

- **Scopo sintetico:** schema, policy, funzioni edge, config.
- **Stato dominio:** critico (area ad alta attenzione in inventario).
- **Priorità operativa:** alta.

### Schema, policy, funzioni edge

| Campo                               | Valore                                                                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | RLS allineata all’app; migrazioni ordinate.                                                                                                                                 |
| **Route principali**                | n/d (artefatti `supabase/`).                                                                                                                                                |
| **File chiave**                     | `supabase/migrations/**`, `supabase/config.toml`, `supabase/functions/document-reminders/index.ts`, `supabase/functions/marketing-kpi-refresh/index.ts` (`PROJECT_DOMAINS`) |
| **Componenti principali**           | n/d.                                                                                                                                                                        |
| **Hooks / Services / Utils**        | n/d.                                                                                                                                                                        |
| **Fonte canonica**                  | Migrazioni applicate all’ambiente; `audit/rls/*` = piano, non runtime (`CANONICAL_SOURCES`).                                                                                |
| **Tabelle / RLS / note DB**         | Intero schema; focus inventario: `appointments`, duplicati policy, `org_id`/`org_id_text` — `audit/rls/RLS_DUPLICATES.md` e affini.                                         |
| **Ruoli coinvolti**                 | tutti (tramite policy).                                                                                                                                                     |
| **Stato**                           | parziale (`FEATURE_STATUS`; `DOCUMENTAZIONE/TEST_RLS_DISABLED.md` citato come incertezza).                                                                                  |
| **Rischi / conflitti noti**         | Policy duplicate/mismatch — `RULE_CONFLICTS.md`; nota `RULE_CONFLICTS` su tracciamento `.sql` in repo — da verificare nel working tree attuale.                             |
| **Test presenti**                   | verifica SQL/ambiente — fuori scope inventario puro.                                                                                                                        |
| **Test mancanti**                   | Test RLS integrazione su ambiente staging — da verificare.                                                                                                                  |
| **Prossimo intervento consigliato** | Consolidamento SQL secondo `audit/rls/*`; nessuna modifica senza SQL esplicito approvato.                                                                                   |

---

## Modelli TypeScript di dominio

- **Scopo sintetico:** tipi condivisi (`src/types/**`) allineati a Supabase.
- **Stato dominio:** da verificare (allineamento rigenerazione tipi).
- **Priorità operativa:** media (quando si tocca schema).

### Tipi dominio e supabase

| Campo                               | Valore                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Contratti TS per feature e DB.                                                                                                |
| **Route principali**                | n/d.                                                                                                                          |
| **File chiave**                     | `src/types/index.ts`, `src/types/supabase.ts`, `src/types/athlete-profile.ts`, `src/types/appointment.ts` (`PROJECT_DOMAINS`) |
| **Componenti principali**           | n/d.                                                                                                                          |
| **Hooks / Services / Utils**        | n/d.                                                                                                                          |
| **Fonte canonica**                  | `src/types/**` allineati a tipi rigenerati (`CANONICAL_SOURCES`).                                                             |
| **Tabelle / RLS / note DB**         | Riflesso schema DB.                                                                                                           |
| **Ruoli coinvolti**                 | —                                                                                                                             |
| **Stato**                           | da verificare (duplicati interfacce nei componenti — sospetto).                                                               |
| **Rischi / conflitti noti**         | Interfacce duplicate vs `src/types` — `CANONICAL_SOURCES`.                                                                    |
| **Test presenti**                   | da verificare.                                                                                                                |
| **Test mancanti**                   | da verificare.                                                                                                                |
| **Prossimo intervento consigliato** | Import unificati verso `src/types`.                                                                                           |

---

## Audit applicativo e middleware (codice app)

- **Scopo sintetico:** log azioni sensibili, middleware audit.
- **Stato dominio:** da verificare.
- **Priorità operativa:** bassa.

### Log audit azioni sensibili

| Campo                               | Valore                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Scopo**                           | Tracciamento azioni critiche.                                                                   |
| **Route principali**                | n/d (lib + componenti).                                                                         |
| **File chiave**                     | `src/lib/audit.ts`, `src/lib/audit-middleware.ts`, `src/components/shared/audit/audit-logs.tsx` |
| **Componenti principali**           | UI log se esposta.                                                                              |
| **Hooks / Services / Utils**        | Contesto audit in middleware.                                                                   |
| **Fonte canonica**                  | `audit.ts`, `audit-middleware.ts` (`CANONICAL_SOURCES`).                                        |
| **Tabelle / RLS / note DB**         | Tabella audit se persistita — da verificare.                                                    |
| **Ruoli coinvolti**                 | admin / compliance.                                                                             |
| **Stato**                           | da verificare.                                                                                  |
| **Rischi / conflitti noti**         | Logging ad-hoc senza modulo — sospetto (`CANONICAL_SOURCES`).                                   |
| **Test presenti**                   | da verificare.                                                                                  |
| **Test mancanti**                   | da verificare.                                                                                  |
| **Prossimo intervento consigliato** | Unificare logging verso `lib/audit`.                                                            |

---

## Diagnostica e operatività

- **Scopo sintetico:** route supporto (visibility trainer, comunicazioni stuck).
- **Stato dominio:** da verificare (sicurezza accesso route).
- **Priorità operativa:** media.

### Route debug (trainer visibility, comunicazioni stuck)

| Campo                               | Valore                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Strumenti operativi non esposti indebitamente.                                                     |
| **Route principali**                | API `src/app/api/debug-trainer-visibility/`, `src/app/api/communications/check-stuck/`             |
| **File chiave**                     | `src/app/api/debug-trainer-visibility/route.ts`, `src/app/api/communications/check-stuck/route.ts` |
| **Componenti principali**           | n/d.                                                                                               |
| **Hooks / Services / Utils**        | Diagnostica.                                                                                       |
| **Fonte canonica**                  | Route dedicate (`CANONICAL_SOURCES`); strumenti non autorizzati in prod da eliminare o proteggere. |
| **Tabelle / RLS / note DB**         | Dipendente dai domini sottostanti.                                                                 |
| **Ruoli coinvolti**                 | operazioni interne / staff con accesso — da verificare.                                            |
| **Stato**                           | da verificare.                                                                                     |
| **Rischi / conflitti noti**         | Esposizione non controllata in produzione — `CANONICAL_SOURCES`.                                   |
| **Test presenti**                   | da verificare.                                                                                     |
| **Test mancanti**                   | Test autorizzazione route — da verificare.                                                         |
| **Prossimo intervento consigliato** | Verificare authz su queste API in ogni ambiente.                                                   |

---

## App nativa Capacitor

- **Scopo sintetico:** build Android/iOS; webview.
- **Stato dominio:** fragile (middleware auth disattivato con `CAPACITOR=true`).
- **Priorità operativa:** alta se rilascio store previsto.

### Build Android/iOS

| Campo                               | Valore                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| **Scopo**                           | Parità sicurezza e auth con web.                                                            |
| **Route principali**                | n/d (build).                                                                                |
| **File chiave**                     | `capacitor.config.ts`, `android/`, `ios/` (`PROJECT_DOMAINS`)                               |
| **Componenti principali**           | WebView.                                                                                    |
| **Hooks / Services / Utils**        | Skip middleware quando `CAPACITOR=true`.                                                    |
| **Fonte canonica**                  | Config + bundle unico (`CANONICAL_SOURCES`); sicurezza = parità guard client.               |
| **Tabelle / RLS / note DB**         | —                                                                                           |
| **Ruoli coinvolti**                 | —                                                                                           |
| **Stato**                           | parziale.                                                                                   |
| **Rischi / conflitti noti**         | Nessun middleware server-side auth in build Capacitor — `RULE_CONFLICTS`, `FEATURE_STATUS`. |
| **Test presenti**                   | Test nativi elencati in `audit/tests.txt` (es. Android example) — non E2E app completa.     |
| **Test mancanti**                   | Strategia test parità auth nativo/web — da verificare.                                      |
| **Prossimo intervento consigliato** | Strategia guard equivalenti o auth nativa documentata in `CANONICAL_SOURCES`.               |

---

## Test automatizzati

- **Scopo sintetico:** E2E Playwright, unit/integration/Vitest.
- **Stato dominio:** parziale (affidabilità Chromium; skip WebKit/mobile su alcuni flussi).
- **Priorità operativa:** media.

### E2E Playwright e unit/integration

| Campo                               | Valore                                                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scopo**                           | Regressione su flussi critici.                                                                                                                     |
| **Route principali**                | n/d (`tests/`).                                                                                                                                    |
| **File chiave**                     | `playwright.config.ts`, `playwright.config.ci.ts`, `tests/e2e/global-setup.ts` (e varianti in `PROJECT_DOMAINS`); spec sotto `tests/e2e/*.spec.ts` |
| **Componenti principali**           | n/d.                                                                                                                                               |
| **Hooks / Services / Utils**        | n/d.                                                                                                                                               |
| **Fonte canonica**                  | Spec E2E come comportamento accettato; `stabilized-core-flows` per flussi critici auth/calendario (`CANONICAL_SOURCES`).                           |
| **Tabelle / RLS / note DB**         | Ambienti test / seed.                                                                                                                              |
| **Ruoli coinvolti**                 | —                                                                                                                                                  |
| **Stato**                           | parziale (38 spec citati in `FEATURE_STATUS`; skip WebKit/mobile per auth in stabilized).                                                          |
| **Rischi / conflitti noti**         | Due spec con asserzioni divergenti sullo stesso invariante — da evitare (`CANONICAL_SOURCES`).                                                     |
| **Test presenti**                   | Suite in `tests/e2e/`; Vitest in `src/**/__tests__` (es. `appointment-modal.test.tsx`, `trainer-session-modal.test.tsx` — `PROJECT_DOMAINS`).      |
| **Test mancanti**                   | Copertura WebKit/mobile dove skippata — `FEATURE_STATUS`.                                                                                          |
| **Prossimo intervento consigliato** | Unificare asserzioni su behaviour canonico; estendere browser dove policy progetto lo richiede.                                                    |

---

# Priorità operative globali

Sintesi da `audit/FEATURE_STATUS.md` (sezione sintesi) e conflitti in `audit/RULE_CONFLICTS.md`.

| Tema                        | Dettaglio operativo                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Feature più fragili**     | Calendario/appuntamenti (overlap UI vs tabella; `org_id`); RBAC (guard vs `role-redirect-paths`; Capacitor); comunicazioni vs notifiche; clienti/atleti (naming); doppio profilo home/dashboard; doppio albero UI; pagamenti/ledger (multisurface, residui `payment-form-modal`).                                                          |
| **Feature più critiche**    | Appuntamenti + RLS/policy DB; schema/RLS globale (`supabase/migrations`, `audit/rls/*`). Pagamenti/abbonamenti: dati finanziari sensibili ma write path ledger **consolidato** — vedi dominio **fragile** in sezione Pagamenti.                                                                                                            |
| **Dipendenze bloccanti**    | Allineamento SQL deployato vs codice; unica fonte `org_id` / chiusura `org_id_text` (piano in audit RLS); decisione prodotto su overlap slot prima di fix UI definitivi.                                                                                                                                                                   |
| **Top prossimi interventi** | 1) Unificare overlap (`appointment-utils` ovunque o solo DB). 2) Unificare `org_id` da profilo/context (no `default-org` implicito). 3) Allineare guard a `role-redirect-paths`. 4) Consolidare RLS `appointments` / cancellazioni per audit. 5) Verificare Capacitor: modello minaccia e guard. 6) Delimitare comunicazioni vs notifiche. |

---

_Ultimo allineamento struttura: inventario audit elencato in testa. Per correzioni puntuali, aggiornare prima gli audit di riferimento poi questo file._
