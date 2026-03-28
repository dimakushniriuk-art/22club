# Indice progetto 22Club

Mappa operativa del **codice vivo** per orientarsi su route, API, librerie e hook. Non sostituisce la ricerca semantica dell’IDE; va aggiornato quando si aggiungono aree grandi o si spostano entry point.

- **Ultimo aggiornamento:** 2026-03-29
- **Obbligo di manutenzione:** criteri completi in `.cursor/rules/22club-project-rules.mdc` (sezione **NAVIGAZIONE CODICE**): allineare l’indice e questa data quando cambiano route, API o puntatori documentati; ogni modifica a questo file aggiorna la data in meta.
- **Come aggiornare:** rigenerare elenchi route/API (vedi sotto) e allineare i puntatori per dominio; stack e divieti DB restano in `.cursor/rules/22club-project-rules.mdc`.

## Rigenerazione rapida (PowerShell, dalla root repo)

```powershell
# Route UI (path dopo src/app)
Get-ChildItem -Path ".\src\app" -Recurse -Filter "page.tsx" | ForEach-Object {
  $r = $_.FullName -replace [regex]::Escape((Resolve-Path ".\src\app").Path), "" -replace "\\page.tsx$","" -replace "\\","/"
  if ($r -eq "") { "/" } else { $r }
} | Sort-Object

# API
Get-ChildItem -Path ".\src\app\api" -Recurse -Filter "route.ts" | ForEach-Object {
  ($_.FullName -replace [regex]::Escape((Resolve-Path ".\src\app").Path), "" -replace "\\route.ts$","" -replace "\\","/") -replace "^/api","/api"
} | Sort-Object
```

## Nota sulla struttura

Nelle regole di progetto compaiono percorsi generici (`app/`, `components/`, `lib/`). Nel repository il codice applicativo è sotto **`src/`** (es. `src/app`, `src/lib`, `src/components`).

---

## Cartelle top-level (codice vivo)

| Percorso          | Contenuto                                                       |
| ----------------- | --------------------------------------------------------------- |
| `src/app/`        | App Router: `page.tsx`, `layout.tsx`, `api/`                    |
| `src/components/` | UI per dominio (dashboard, chat, workout, …)                    |
| `src/hooks/`      | Hook React (root + sottocartelle per dominio)                   |
| `src/lib/`        | Logica condivisa, Supabase client/server, validazioni, email, … |
| `src/types/`      | Tipi TypeScript                                                 |
| `supabase/`       | `migrations/`, `functions/` (Edge), `config.toml`               |
| `e2e/`            | Playwright                                                      |
| `tests/`          | Test unitari / integrazione                                     |

**Componenti (cartelle principali in `src/components/`):** `appointments`, `athlete`, `auth`, `calendar`, `charts`, `chat`, `communications`, `dashboard`, `documents`, `home`, `home-profile`, `invitations`, `layout`, `settings`, `shared`, `ui`, `workout`, `workout-plans`, …

---

## Flusso ad alto livello

```mermaid
flowchart LR
  browser[Browser]
  app[src/app_pages]
  api[src/app/api]
  supa[Supabase_client_server]
  pg[(Postgres_RLS)]
  browser --> app
  browser --> api
  app --> supa
  api --> supa
  supa --> pg
```

---

## Route UI (`src/app/**/page.tsx`)

### `/` e pubblici / legali

| Route                  |
| ---------------------- |
| `/`                    |
| `/login`               |
| `/registrati`          |
| `/forgot-password`     |
| `/reset-password`      |
| `/post-login`          |
| `/welcome`             |
| `/privacy`             |
| `/termini`             |
| `/sentry-example-page` |

### Design system

| Route            |
| ---------------- |
| `/design-system` |

### Dashboard (staff) — generale

| Route                                |
| ------------------------------------ |
| `/dashboard`                         |
| `/dashboard/clienti`                 |
| `/dashboard/appuntamenti`            |
| `/dashboard/calendario`              |
| `/dashboard/calendario/impostazioni` |
| `/dashboard/chat`                    |
| `/dashboard/comunicazioni`           |
| `/dashboard/comunicazioni/template`  |
| `/dashboard/documenti`               |
| `/dashboard/esercizi`                |
| `/dashboard/allenamenti`             |
| `/dashboard/schede`                  |
| `/dashboard/schede/nuova`            |
| `/dashboard/schede/[id]/modifica`    |
| `/dashboard/abbonamenti`             |
| `/dashboard/pagamenti`               |
| `/dashboard/statistiche`             |
| `/dashboard/impostazioni`            |
| `/dashboard/profilo`                 |
| `/dashboard/invita-atleta`           |
| `/dashboard/atleti/[id]`             |
| `/dashboard/atleti/[id]/progressi`   |

### Dashboard — marketing

| Route                                      |
| ------------------------------------------ |
| `/dashboard/marketing`                     |
| `/dashboard/marketing/analytics`           |
| `/dashboard/marketing/athletes`            |
| `/dashboard/marketing/impostazioni`        |
| `/dashboard/marketing/report`              |
| `/dashboard/marketing/leads`               |
| `/dashboard/marketing/leads/[id]`          |
| `/dashboard/marketing/campaigns`           |
| `/dashboard/marketing/campaigns/new`       |
| `/dashboard/marketing/campaigns/[id]`      |
| `/dashboard/marketing/campaigns/[id]/edit` |
| `/dashboard/marketing/segments`            |
| `/dashboard/marketing/segments/new`        |
| `/dashboard/marketing/segments/[id]`       |
| `/dashboard/marketing/segments/[id]/edit`  |
| `/dashboard/marketing/automations`         |
| `/dashboard/marketing/automations/new`     |
| `/dashboard/marketing/automations/[id]`    |

### Dashboard — nutrizionista

| Route                                   |
| --------------------------------------- |
| `/dashboard/nutrizionista`              |
| `/dashboard/nutrizionista/atleti`       |
| `/dashboard/nutrizionista/atleti/[id]`  |
| `/dashboard/nutrizionista/calendario`   |
| `/dashboard/nutrizionista/chat`         |
| `/dashboard/nutrizionista/checkin`      |
| `/dashboard/nutrizionista/checkin/[id]` |
| `/dashboard/nutrizionista/documenti`    |
| `/dashboard/nutrizionista/piani`        |
| `/dashboard/nutrizionista/piani/nuovo`  |
| `/dashboard/nutrizionista/progressi`    |
| `/dashboard/nutrizionista/analisi`      |
| `/dashboard/nutrizionista/abbonamenti`  |
| `/dashboard/nutrizionista/impostazioni` |

### Dashboard — massaggiatore

| Route                                   |
| --------------------------------------- |
| `/dashboard/massaggiatore`              |
| `/dashboard/massaggiatore/appuntamenti` |
| `/dashboard/massaggiatore/calendario`   |
| `/dashboard/massaggiatore/chat`         |
| `/dashboard/massaggiatore/abbonamenti`  |
| `/dashboard/massaggiatore/statistiche`  |
| `/dashboard/massaggiatore/profilo`      |
| `/dashboard/massaggiatore/impostazioni` |

### Dashboard — admin

| Route                               |
| ----------------------------------- |
| `/dashboard/admin`                  |
| `/dashboard/admin/utenti`           |
| `/dashboard/admin/utenti/marketing` |
| `/dashboard/admin/ruoli`            |
| `/dashboard/admin/organizzazioni`   |
| `/dashboard/admin/statistiche`      |

### Home atleta / area personale (`/home`)

| Route                                      |
| ------------------------------------------ |
| `/home`                                    |
| `/home/profilo`                            |
| `/home/chat`                               |
| `/home/appuntamenti`                       |
| `/home/documenti`                          |
| `/home/pagamenti`                          |
| `/home/trainer`                            |
| `/home/nutrizionista`                      |
| `/home/massaggiatore`                      |
| `/home/allenamenti`                        |
| `/home/allenamenti/oggi`                   |
| `/home/allenamenti/riepilogo`              |
| `/home/allenamenti/[id]`                   |
| `/home/allenamenti/[id]/giorno/[dayId]`    |
| `/home/allenamenti/esercizio/[exerciseId]` |
| `/home/progressi`                          |
| `/home/progressi/nuovo`                    |
| `/home/progressi/allenamenti`              |
| `/home/progressi/misurazioni`              |
| `/home/progressi/storico`                  |
| `/home/progressi/foto`                     |
| `/home/foto-risultati`                     |
| `/home/foto-risultati/aggiungi`            |

---

## API Route Handlers (`src/app/api/**/route.ts`)

Prefisso HTTP: ogni file corrisponde a `GET/POST/...` su `https://<host><path>`.

### `/api/admin/*`

| Path                                     |
| ---------------------------------------- |
| `/api/admin/athletes/assign-trainer`     |
| `/api/admin/cron/refresh-marketing-kpis` |
| `/api/admin/impersonation/start`         |
| `/api/admin/impersonation/stop`          |
| `/api/admin/roles`                       |
| `/api/admin/statistics`                  |
| `/api/admin/users`                       |
| `/api/admin/users/assignments`           |
| `/api/admin/users/marketing`             |
| `/api/admin/users/trainer`               |

### `/api/athletes/*` e atleta

| Path                                 |
| ------------------------------------ |
| `/api/athletes/create`               |
| `/api/athletes/[id]`                 |
| `/api/athlete/workout-plans`         |
| `/api/athlete/progress-logs`         |
| `/api/athlete/coached-session-debit` |

### `/api/auth/*`

| Path                        |
| --------------------------- |
| `/api/auth/context`         |
| `/api/auth/forgot-password` |

### `/api/calendar/*`

| Path                                      |
| ----------------------------------------- |
| `/api/calendar/notify-appointment-change` |
| `/api/calendar/send-appointment-reminder` |

### `/api/clienti/*`

| Path                          |
| ----------------------------- |
| `/api/clienti/sync-pt-atleti` |

### `/api/communications/*`

| Path                                        |
| ------------------------------------------- |
| `/api/communications/check-stuck`           |
| `/api/communications/list`                  |
| `/api/communications/list-athletes`         |
| `/api/communications/recipients`            |
| `/api/communications/recipients/count`      |
| `/api/communications/send`                  |
| `/api/communications/send-email-to-athlete` |

### `/api/dashboard/*`

| Path                          |
| ----------------------------- |
| `/api/dashboard/appointments` |

### Altri singoli

| Path                                     |
| ---------------------------------------- |
| `/api/debug-trainer-visibility`          |
| `/api/document-preview`                  |
| `/api/exercises`                         |
| `/api/health`                            |
| `/api/nutritionist/extract-progress-pdf` |
| `/api/register/complete-profile`         |
| `/api/sentry-example-api`                |

### `/api/invitations/*`

| Path                            |
| ------------------------------- |
| `/api/invitations`              |
| `/api/invitations/create`       |
| `/api/invitations/email-status` |
| `/api/invitations/send-email`   |

### `/api/marketing/*`

| Path                                   |
| -------------------------------------- |
| `/api/marketing/analytics`             |
| `/api/marketing/athletes`              |
| `/api/marketing/automations/[id]`      |
| `/api/marketing/automations/[id]/run`  |
| `/api/marketing/events`                |
| `/api/marketing/kpi`                   |
| `/api/marketing/leads`                 |
| `/api/marketing/leads/[id]`            |
| `/api/marketing/leads/[id]/convert`    |
| `/api/marketing/leads/athletes-search` |
| `/api/marketing/leads/convert`         |

### `/api/onboarding/*`

| Path                                 |
| ------------------------------------ |
| `/api/onboarding/finish`             |
| `/api/onboarding/save-questionnaire` |
| `/api/onboarding/save-step`          |

### `/api/push/*`

| Path                    |
| ----------------------- |
| `/api/push/subscribe`   |
| `/api/push/unsubscribe` |
| `/api/push/vapid-key`   |

---

## `src/lib/` — macro-aree

Cartelle principali (oltre a file nella root di `lib/`):

| Cartella             | Indicativo                                              |
| -------------------- | ------------------------------------------------------- |
| `supabase/`          | Client, server, admin, middleware, tipi, helper profilo |
| `auth/`              | Permessi, redirect, guard                               |
| `validations/`       | Schemi Zod / validazione per dominio                    |
| `communications/`    | Email Resend, template, batch, destinatari              |
| `appointments/`      | Query e select staff/atleta                             |
| `calendar/`          | Promemoria email calendario                             |
| `notifications/`     | Push, scheduler                                         |
| `cache/`             | Strategie cache e hook lato client                      |
| `design-tokens/`     | Token UI (colori, spacing, …)                           |
| `marketing/`         | Regole segmenti, ecc.                                   |
| `workouts/`          | Trasformazioni piani allenamento                        |
| `organizations/`     | Org corrente                                            |
| `credits/`           | Ledger crediti                                          |
| `logger/`, `sentry/` | Logging e Sentry                                        |

File spesso usati globalmente: `src/lib/utils.ts`, `src/lib/format.ts`, `src/lib/query-keys.ts`, `src/lib/audit.ts`, `src/lib/appointment-utils.ts`. **Storage documenti (preview proxy):** `src/lib/documents.ts`; guida riuso e bucket: `src/lib/DOCUMENTI_STORAGE_PREVIEW.md`.

---

## `src/hooks/` — macro-aree

| Area                                      | Percorsi tipici                                                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Root                                      | `use-auth.ts`, `useAuth.ts`, `use-user-settings.ts`, `use-clienti.ts`, `use-payments.ts`, `use-supabase-client.ts`, … |
| `athlete-profile/`                        | Form e dati scheda atleta (dashboard)                                                                                 |
| `calendar/`                               | Calendario staff, impostazioni, shortcuts                                                                             |
| `chat/`                                   | Conversazioni, realtime, profilo                                                                                      |
| `communications/`                         | Pagina comunicazioni                                                                                                  |
| `workout/`, `workouts/`, `workout-plans/` | Sessioni e piani                                                                                                      |
| `home-profile/`                           | Statistiche home atleta                                                                                               |
| `appointments/`                           | Tabelle appuntamenti staff                                                                                            |

---

## Puntatori per dominio (entry point tipici)

| Dominio                   | Pagine / API                                                                                     | Lib / hook                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clienti                   | `src/app/dashboard/clienti/page.tsx`                                                             | `src/hooks/use-clienti.ts`, `src/hooks/use-clienti-permissions.ts`, `src/hooks/use-lesson-usage-by-athlete-ids.ts`                                                                                                                            |
| Appuntamenti / calendario | `dashboard/appuntamenti`, `dashboard/calendario`, `api/dashboard/appointments`, `api/calendar/*` | `src/lib/appointment-utils.ts`, `src/hooks/use-transformed-appointments.ts`, `src/hooks/use-lesson-usage-by-athlete-ids.ts`, `src/lib/appointments/`                                                                                          |
| Chat                      | `dashboard/chat`, `home/chat`                                                                    | `src/hooks/use-chat.ts`, `src/hooks/chat/`, `src/components/chat/`                                                                                                                                                                            |
| Comunicazioni             | `dashboard/comunicazioni`, `api/communications/*`                                                | `src/hooks/use-communications.ts`, `src/lib/communications/`                                                                                                                                                                                  |
| Pagamenti                 | `dashboard/pagamenti`, `home/pagamenti`                                                          | `src/hooks/use-payments.ts`, `src/lib/export-payments.ts`                                                                                                                                                                                     |
| Abbonamenti               | `dashboard/abbonamenti`, aree ruolo                                                              | `src/lib/abbonamenti-service-type.ts`, `src/lib/credits/athlete-training-lessons-display.ts` (PT: **lezioni usate = somma DEBIT `credit_ledger` training**), `src/hooks/use-lesson-stats-bulk.ts`, `src/lib/documents.ts` (fatture / preview) |
| Documenti (file privati)  | `home/documenti`, `dashboard/documenti`, `api/document-preview`, nutrizione piani/atleti         | `src/lib/documents.ts`                                                                                                                                                                                                                        |
| Schede / allenamenti      | `dashboard/schede`, `dashboard/allenamenti`, `home/allenamenti/*`                                | `src/lib/workouts/`, `src/hooks/use-workouts.ts`, `src/hooks/workout-plans/`                                                                                                                                                                  |
| Marketing                 | `dashboard/marketing/**`, `api/marketing/*`                                                      | `src/lib/marketing/`                                                                                                                                                                                                                          |
| Impostazioni / profilo    | `dashboard/impostazioni`, `dashboard/profilo`                                                    | `src/hooks/use-user-settings.ts`, `src/hooks/use-settings-profile.ts`                                                                                                                                                                         |
| Auth                      | `login`, `registrati`, `api/auth/*`                                                              | `src/lib/auth/`, `src/hooks/use-auth.ts`                                                                                                                                                                                                      |
| Inviti                    | `dashboard/invita-atleta`, `api/invitations/*`                                                   | `src/lib/invitations/`                                                                                                                                                                                                                        |
| Design system             | `/design-system`                                                                                 | `src/lib/design-tokens/`, `src/app/design-system/GUIDA_DESIGN_SYSTEM.md`                                                                                                                                                                      |

---

## Database

- Schema e policy (riferimento analisi): `backup_supabase.sql` nella root del repo (dump `public` secondo workflow in `.cursor/rules/22club-project-rules.mdc`).
- Migrazioni versionate: `supabase/migrations/` (es. fix RPC `get_abbonamenti_with_stats` / contatori `training`: `20260329103000_fix_get_abbonamenti_lesson_counters_training.sql` — applicazione manuale su Supabase).
- Lezioni PT (inventario trigger/RPC, riconciliazione SQL): `supabase/LEZIONI_PT_INVENTARIO.md`, `supabase/reconcile_lessons_pt_queries.sql`.
- Esercizi / RLS UPDATE (nota + verifica policy, applicazione manuale): `supabase/manual_exercises_update_rls.sql`.

---

## Test

- E2E: cartella `e2e/`.
- Unit / hook: `src/**/__tests__/`, `tests/`.
