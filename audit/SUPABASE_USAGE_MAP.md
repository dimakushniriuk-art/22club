# Mappa uso Supabase — 22Club

**Fonti:** `src/lib/**`, `src/app/api/**`, `src/hooks/**`, `audit/data_access_map_clean.txt`, `audit/lib_utils_services_clean.txt`  
**Nota:** `src/services/**` — nessun file `.ts`/`.tsx` presente (cartella assente o vuota per servizi).

**Legenda client**

| Simbolo                  | Implementazione reale                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| **Browser**              | `createBrowserClient` in `client.ts` → `createClient()` + singleton `supabase`                    |
| **Server (SSR/cookie)**  | `createServerClient` in `server.ts` → `await createClient()`                                      |
| **Middleware**           | `createServerClient` in `middleware.ts` → funzione locale `createClient(request)`                 |
| **Admin / service_role** | `createClient(URL, SERVICE_ROLE_KEY)` in `admin.ts` → `createAdminClient()`                       |
| **Service inline**       | `createClient` da `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY` (duplicato pattern admin) |

---

## 1. Entry point e factory (`src/lib/supabase/*`)

| File                     | Client                          | Scopo                                                                                                           |
| ------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `client.ts`              | Browser (`createBrowserClient`) | Singleton `supabase`, `createClient()`, auth helper, mock se URL assente                                        |
| `server.ts`              | Server (`createServerClient`)   | `createClient(cookieStore?)` per Route Handlers / Server Components / server lib; re-export `createAdminClient` |
| `admin.ts`               | Service role                    | `createAdminClient()` singleton                                                                                 |
| `middleware.ts`          | Server (`createServerClient`)   | Session refresh + cookie su richieste Next                                                                      |
| `get-current-profile.ts` | `await createClient()` (server) | Profilo da sessione server                                                                                      |
| `get-user-profile.ts`    | —                               | Solo tipi/util su `SupabaseClient` passato dall’esterno                                                         |
| `verify-connection.ts`   | `supabase` da `./client`        | Health/check connessione (lato dove viene eseguito il bundle)                                                   |
| `lib/supabase.ts`        | Re-export da `client`           | Barrel `@deprecated` (`'use client'`)                                                                           |

---

## 2. `src/app/api/**` — Route API

### Solo server user-scoped (`await createClient()`)

Tutte usano sessione/cookie utente salvo dove indicato.

- `admin/impersonation/start`, `admin/impersonation/stop`
- `admin/roles` (anche admin per CRUD ruoli dopo check profilo)
- `admin/statistics` (+ admin per aggregati)
- `admin/users` (+ admin per liste/insert/delete sensibili)
- `admin/users/assignments`, `admin/users/marketing`, `admin/users/trainer`
- `admin/athletes/assign-trainer`
- `athletes/[id]`, `athletes/create`
- `athlete/workout-plans` (+ admin)
- `auth/context`
- `calendar/notify-appointment-change`, `calendar/send-appointment-reminder`
- `clienti/sync-pt-atleti` (+ admin)
- `communications/*` (check-stuck, list-athletes, recipients, recipients/count, send, send-email-to-athlete)
- `dashboard/appointments`
- `debug-trainer-visibility`
- `document-preview`
- `exercises`
- `health`
- `invitations` (+ create con admin), `invitations/email-status`, `invitations/send-email`
- `marketing/*` (analytics, athletes, automations, events, kpi, leads, leads/[id], leads/[id]/convert, leads/athletes-search)
- `marketing/leads/convert` — **anche** `createAdminClient` da `@/lib/supabase/admin` (stesso effetto di server re-export)
- `nutritionist/extract-progress-pdf`
- `onboarding/save-step`, `save-questionnaire`, `finish` (tutti + admin dove serve)
- `push/subscribe`, `push/unsubscribe`
- `register/complete-profile` (+ admin / auth.admin)

### Solo admin / service_role (senza user client iniziale)

| Route                               | Client                | Scopo                              |
| ----------------------------------- | --------------------- | ---------------------------------- |
| `admin/cron/refresh-marketing-kpis` | `createAdminClient()` | RPC KPI; protetto da `CRON_SECRET` |

---

## 3. `src/hooks/**`

| Pattern                                                           | File (principali)                                                                                      | Client effettivo                                             | Scopo                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------- |
| `import { supabase } from '@/lib/supabase'`                       | ~35+ hook (athlete-profile, calendar, chat, appointments, payments, progress, workouts, …)             | Browser singleton                                            | Query/mutation da componenti client            |
| `import { supabase } from '@/lib/supabase/client'`                | `use-trainer-profile`, `use-supabase-client`                                                           | Browser singleton                                            | Stesso client, import diretto                  |
| `import { createClient } from '@/lib/supabase/client'` + chiamata | `use-settings-profile` (useMemo), `use-inviti-cliente`, `use-lesson-counters`, `use-lesson-stats-bulk` | Browser (nuova istanza o singleton interno a `createClient`) | Varianti per lifecycle/isolamento per callback |
| `useSupabase` → `supabase` da client                              | `use-workout-exercise-stats`, `use-clienti` (parziale)                                                 | Browser                                                      | Auth-aware wrapper                             |

Test `__tests__`: mock di `@/lib/supabase` e/o `@/lib/supabase/client`.

---

## 4. `src/lib/**` (non supabase folder)

| File                                          | Client                                                                 | Scopo                                       |
| --------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `analytics.ts`                                | `await createClient(cookieStore)`                                      | Metriche server-side                        |
| `appointment-utils.ts`                        | `createClient()` da `@/lib/supabase`                                   | Query appuntamenti (browser context atteso) |
| `all-athlete-documents.ts`                    | `createClient()` da `@/lib/supabase`                                   | Documenti atleta                            |
| `athlete-registration.ts` (notifications)     | `createClient()` da `@/lib/supabase`                                   | Insert notifiche (modulo-level client)      |
| `audit.ts`                                    | **misto**: `supabase` da `client` + `await createClient()` da `server` | Audit log (percorsi diversi nel file)       |
| `credits/ledger.ts`                           | `supabase` da `@/lib/supabase`                                         | Ledger crediti                              |
| `fetchWithCache.ts`                           | `createClient()` ×3 da client                                          | Cache appuntamenti/profili/documenti        |
| `recurrence-management.ts`                    | `createClient()` da client                                             | Serie appuntamenti                          |
| `trainer-storage.ts`                          | `supabase` da client                                                   | Upload storage certificati/media            |
| `realtimeClient.ts`                           | `supabase` da client                                                   | Canali Realtime                             |
| `utils/profile-id-utils.ts`                   | `createClient()` da client                                             | Risoluzione profile id                      |
| `communications/recipients.ts`                | `@supabase/supabase-js` + service key                                  | Destinatari bulk (bypass RLS)               |
| `communications/scheduler.ts`                 | idem                                                                   | Scheduling comunicazioni                    |
| `communications/email.ts`                     | idem                                                                   | Email da DB                                 |
| `communications/service.ts`                   | idem                                                                   | CRUD communications service-side            |
| `communications/email-batch-processor.ts`     | idem                                                                   | Batch email                                 |
| `communications/send-reset-password-email.ts` | `createAdminClient()` da server                                        | `auth.admin.generateLink`                   |
| `notifications/scheduler.ts`                  | `createClient(URL, SERVICE_ROLE)` modulo                               | RPC notifiche + insert notifications        |
| `notifications/push.ts`                       | service client lazy                                                    | Push tokens / notifiche                     |
| `supabase/admin.ts`                           | vedi sopra                                                             | Factory admin centralizzata                 |

---

## 5. Altri `src/**` (componenti / app pages)

- **Componenti** con `createClient()` o `@/lib/supabase`: modali dashboard, admin, athlete tabs, login/reset, sidebar, ecc. → tutti **Browser**.
- **`middleware.ts`**: `createClient` da `./lib/supabase/middleware` → **ServerClient su request**.
- **Pagine** (`dashboard/page`, `login`, …): `createClient()` client o `useSupabaseClient`.

---

## 6. Allineamento con audit testuali

- `data_access_map_clean.txt`: elenco line-by-line di `.from()` / RPC sulle route API; coerente con uso prevalente **server `createClient` + admin dove serve**.
- `lib_utils_services_clean.txt`: inventario lib; i punti Supabase effettivi sono il sottoinsieme elencato in §4 + `supabase/*`.

---

_Generato per analisi architetturale — nessuna modifica al codice._
