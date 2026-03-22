# Auth/RBAC — gap analysis (solo lettura)

**Fonti incrociate:** `audit/auth_roles_map_clean.txt`, `docs/indexes/07_AUTH_RBAC_INDEX.md`, `audit/PROJECT_DOMAINS.md`, `audit/HIGH_RISK_AREAS.md`, `src/middleware.ts`, `src/lib/supabase/middleware.ts` (factory cookie), route sotto `src/app/api/admin/**`, `src/app/api/auth/**`.

---

## 1. Mismatch rilevanti

| # | Descrizione |
|---|-------------|
| M1 | **`matcher` esclude `api`** → il middleware **non gira** sulle route `/api/*`. Il blocco `PROTECTED_ROUTES` con `/api` nel sorgente è **inefficace** per quelle path. Le API sono raggiungibili senza passare da redirect/login edge: solo handler (401/403/200). Granularità ruolo **solo** nei handler. |
| M2 | **Middleware usa `getUser()`** (validazione server); **molte API usano `getSession()`** (cookie/JWT locale). Stato revoca/scadenza può differire: middleware nega pagina mentre API accetta ancora sessione finché il cookie è considerato valido (e viceversa in edge case). |
| M3 | **`GET /api/auth/context`** senza login restituisce 200 con payload “anonimo”. Per design client; non è un bug di sicurezza di per sé, ma **non è allineato** al modello “401 se non autenticato” usato altrove. |
| M4 | **`POST /api/auth/context`** accetta `x-user-role` e `x-org-id` e aggiorna `profiles` per `user_id` sessione. Non verifica che il ruolo sia quello “vero” lato server (solo enum). Rischio **escalation** se RLS su `profiles` permette UPDATE al proprio `role` (da confermare lato DB, fuori scope). |
| M5 | **`/api/clienti/sync-pt-atleti`:** utente non autorizzato riceve `200` + `synced: 0` invece di `403` — semantica diversa da altre API (information disclosure minima ma comportamento incoerente). |
| M6 | **Dashboard admin in middleware:** non esiste blocco esplicito “solo `admin`” su `/dashboard/admin`; atleta è bloccato su `/dashboard` generico, ma **trainer/marketing/nutrizionista/massaggiatore** potrebbero teoricamente richiedere path sotto `/dashboard/admin` fino a guard client. |

---

## 2. Aree senza controllo ruolo esplicito (handler)

| Area | Dettaglio |
|------|-----------|
| **POST `/api/athletes/create`** | Sessione + profilo qualsiasi; poi `createAdminClient` crea utente auth + profilo atleta. **Manca** verifica `role in (admin, trainer, …)`. Rischio elevato se chiamabile da account non staff. |
| **POST/PUT `/api/exercises`** | Sessione + profilo; nessun `role === 'trainer'` (o simile). Affidamento su RLS per insert/update. |
| **`GET /api/document-preview`** | Nessun `getSession` esplicito; firma storage con client utente. Affidamento su policy storage. |
| **`GET /api/debug-trainer-visibility`** | Solo gate `development`; chiunque con sessione valida in dev può chiamare la RPC. |

---

## 3. Dove middleware e API divergono

| Scenario | Middleware | API |
|----------|------------|-----|
| Chiamata API senza cookie | Middleware **non eseguito** su `/api` | Solo handler (401/403 o pubblico) |
| Chiamata API con cookie | **Non eseguito** (api esclusa) | Solo logica route |
| Ruolo su pagina | Cache 1′ + `getUser` | Lettura `profiles` o RPC per ogni richiesta (nessuna cache condivisa) |
| Impersonation cookie | Solo admin mantiene cookie; altri → clear | Start/stop solo admin |
| Capacitor `CAPACITOR=true` | Middleware disabilitato | API invariate — **protezione solo client + RLS** |

---

## 4. Allineamento con documentazione audit

- **07_AUTH_RBAC_INDEX:** coerente su ruoli API admin e path impersonation.
- **HIGH_RISK_AREAS:** admin users, impersonation, cron KPI, debug API — confermati; middleware segnalato come sensibile (qui: api fuori middleware).
- **PROJECT_DOMAINS P0:** clienti/atleti/admin — gap principale su **`/api/athletes/create`** rispetto al modello “solo staff”.

---

## 5. Note `src/lib/supabase/middleware.ts`

File = **factory `createClient(request)`** per Edge/middleware (anon key, no refresh). **Non** contiene logica RBAC; la RBAC pagine è in `src/middleware.ts`.
