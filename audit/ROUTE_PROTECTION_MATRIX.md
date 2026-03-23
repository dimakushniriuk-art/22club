# Matrice protezione route sensibili (Auth/RBAC)

**Scope:** lettura codice a marzo 2026. **Middleware:** `src/middleware.ts` esclude `api` dal `matcher` → **nessun controllo sessione/ruolo in edge** sulle API; il ramo `PROTECTED_ROUTES` che cita `/api` non si applica a path reali `/api/...`.

Legenda tipo protezione:

- **nessuna** — endpoint pubblico o senza verifica sessione esplicita lato route
- **sessione** — richiede cookie/sessione (tipicamente `getSession` / client Supabase)
- **sessione + ruolo** — sessione + check ruolo (o RPC tipo `get_current_user_role`)
- **service role** — dopo auth appropriata, dati via `createAdminClient()`
- **segreto / cron** — non sessione utente; header segreto
- **dev only** — bloccato fuori `NODE_ENV === 'development'`

---

## `/api/admin/*`

| Route                                    | Metodi                     | Protezione attuale                                                            |
| ---------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `/api/admin/users`                       | GET, POST, PATCH, DELETE   | sessione + ruolo `admin` → poi **service role**                               |
| `/api/admin/roles`                       | GET, PUT, POST, DELETE     | sessione + ruolo `admin` → **service role**                                   |
| `/api/admin/statistics`                  | GET                        | sessione + ruolo `admin` → **service role**                                   |
| `/api/admin/users/trainer`               | (lettura trainer per form) | sessione + ruolo `admin` → **service role**                                   |
| `/api/admin/users/assignments`           | —                          | sessione + ruolo `admin` → **service role**                                   |
| `/api/admin/users/marketing`             | POST                       | sessione + ruolo `admin` → **service role**                                   |
| `/api/admin/athletes/assign-trainer`     | POST                       | sessione + ruolo `admin` → **service role**                                   |
| `/api/admin/impersonation/start`         | POST                       | sessione + ruolo `admin` + re-auth password → RPC                             |
| `/api/admin/impersonation/stop`          | POST                       | sessione + ruolo `admin` → RPC                                                |
| `/api/admin/cron/refresh-marketing-kpis` | POST (presunto)            | **segreto CRON** (`CRON_SECRET`) → **service role** (nessuna sessione utente) |

---

## `/api/auth/*`

| Route                       | Metodi | Protezione attuale                                                                 |
| --------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `/api/auth/context`         | GET    | **nessuna obbligatoria** — senza sessione risponde 200 con `role: null`            |
| `/api/auth/context`         | POST   | **sessione** — aggiorna `profiles` da header `x-user-role` / `x-org-id`            |
| `/api/auth/forgot-password` | POST   | **nessuna** — corpo pubblico; uso **service role** dentro `sendResetPasswordEmail` |

---

## Audit HIGH_RISK + domini P0/P1

| Route                                    | Protezione attuale                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/api/debug-trainer-visibility`          | **dev only** + sessione implicita (RPC con client utente); **nessun check ruolo** esplicito       |
| `/api/clienti/sync-pt-atleti`            | sessione + ruolo in allowlist `admin`/`pt`/`trainer`; altri ruoli → 200 con `synced: 0` (non 403) |
| `/api/athletes/create`                   | **sessione** — **nessun check ruolo staff** prima di `createAdminClient`                          |
| `/api/invitations/create`                | sessione + ruolo `admin` \| `trainer`                                                             |
| `/api/marketing/kpi`                     | sessione + ruolo via RPC `get_current_user_role` (`admin` \| `marketing`)                         |
| `/api/communications/send`               | sessione + ruolo in lista (`admin`, `trainer`, `nutrizionista`, `massaggiatore`, `marketing`)     |
| `/api/document-preview`                  | **sessione implicita** (solo `createClient` + storage); **nessun check ruolo** in route           |
| `/api/exercises` GET                     | sessione                                                                                          |
| `/api/exercises` POST/PUT                | sessione — commento “staff”; **nessun check ruolo** in handler (dipende da RLS)                   |
| `/api/nutritionist/extract-progress-pdf` | sessione + ruolo `nutrizionista` + vincolo `staff_atleti` se `athleteProfileId`                   |
| `/api/register/complete-profile`         | flusso token / admin client — non classificabile come semplice “sessione+ruolo”                   |

---

## Riepilogo middleware (solo pagine, non API)

| Area UI            | Middleware                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `/dashboard/*`     | sessione + ruolo actor; atleta reindirizzato a `/home`                                                                   |
| `/home/*`          | sessione + ruolo atleta; altri ruoli redirect                                                                            |
| `/dashboard/admin` | nessun path dedicato “solo admin” nel middleware: **trainer può aprire URL** finché non intervengono layout client / API |
| `/api`             | **non coperto** dal matcher                                                                                              |
