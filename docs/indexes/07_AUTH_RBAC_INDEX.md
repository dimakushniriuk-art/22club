# Auth & RBAC Index

Guida operativa: permessi, ruoli, redirect, guard e dove intervenire.  
Fonti: `audit/CANONICAL_SOURCES.md`, `audit/RULE_CONFLICTS.md`. `audit/auth_roles_map.txt` è **vuoto** — ruoli dedotti da questi audit.

---

## 1. Ruoli del sistema

Ruoli **citati negli audit** come stringhe / ambiti operativi:

| Ruolo             | Note sintetiche                                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **admin**         | Staff amministrativo; area dashboard admin, API `api/admin/**` dove applicabile.                                                                                                       |
| **trainer**       | Staff trainer; scope dashboard staff, filtri espliciti in alcuni hook (es. appuntamenti).                                                                                              |
| **nutrizionista** | Staff; path dedicati in middleware e in mappe parziali dei guard (`RULE_CONFLICTS`).                                                                                                   |
| **massaggiatore** | Come sopra.                                                                                                                                                                            |
| **marketing**     | Presente in `role-redirect-paths` e liste middleware; **incoerenza nota**: guard staff con mappa parziale può mandare a `/dashboard` invece che all’area marketing (`RULE_CONFLICTS`). |
| **athlete**       | Portale atleta (`/home/**` negli audit).                                                                                                                                               |

**Legacy / non mappati (da verificare su DB):** riferimenti a `pt`, `staff`, `atleta` e varianti — allineamento a normalizzazione e inventario profili **da verificare** (`RULE_CONFLICTS`).

**Staff generico:** negli audit compare anche il lessico “staff” senza enumerazione completa; non è un ruolo canonico aggiuntivo finché non è in tabella profili / normalizer.

---

## 2. Fonte canonica AUTH

**Ordine di verità (da `CANONICAL_SOURCES`):**

1. **Database:** policy **RLS** e vincoli sulle tabelle — autorità finale, non aggirabile dal client.
2. **App (significato operativo del ruolo):** un solo modulo di **normalizzazione** ruolo + una sola tabella di **redirect** (path UX).

**File canonici lato app (permessi / ruolo):**

| Cosa                          | Dove                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Contratto ruolo TypeScript    | `src/lib/utils/role-normalizer.ts`                                                                                                               |
| Wrapper client                | `src/lib/utils/role-normalizer-client.tsx` — **sospetto duplicato** se diverge dal server; verità: server normalizer (`CANONICAL_SOURCES`)       |
| Contesto server → UI          | `src/app/api/auth/context/route.ts`                                                                                                              |
| Stato client                  | `src/providers/auth-provider.tsx` — deve allinearsi al context (stessi fallback)                                                                 |
| Permessi granulari persistiti | `role-permissions-editor.tsx` + `src/app/api/admin/roles/**` — solo extra persistiti; **non** duplicare mappa ruolo→area fuori da redirect-paths |

**Come viene determinato il ruolo:** normalizzazione stringa profilo → ruolo canonico TS (`role-normalizer.ts`); confronti e navigazione devono usare quel contratto.

**Recupero utente / sessione:**

- Per API e handler sensibili, direzione canonica documentata: **`getUser`** (`src/lib/supabase/get-user-profile.ts`) — `RULE_CONFLICTS` / tabella risoluzione in `CANONICAL_SOURCES`.
- `get-current-profile.ts` usa **`getSession`** — **possibile incoerenza** con `getUser`; **unificare** dopo verifica (`RULE_CONFLICTS`).

**Hook auth:** canonico `src/hooks/useAuth.ts`; `src/hooks/use-auth.ts` = percorso legacy / import da unificare.

---

## 3. Fonte canonica REDIRECT

| Elemento                 | Regola                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **File canonico**        | `src/lib/utils/role-redirect-paths.ts` (`ROLE_DEFAULT_APP_PATH`, `getDefaultAppPathForRole` o equivalente esposto da quel modulo)          |
| **Duplicati da evitare** | Qualsiasi `REDIRECT_PATH_BY_ROLE` locale (es. in `use-staff-dashboard-guard.ts`) che non importi / non delegahi a `role-redirect-paths.ts` |

**Regole:**

- **Dopo login / home per ruolo:** path di destinazione **solo** da `role-redirect-paths.ts`. Middleware può fare whitelist e redirect, ma i **path** devono coincidere con quella tabella (`CANONICAL_SOURCES`).
- **First login / flussi ingresso:** pagine e API citate negli audit — `src/app/login/page.tsx`, `src/components/auth/login-form.tsx`, `src/app/post-login/page.tsx`, `src/app/api/auth/context/route.ts`, integrazione `src/lib/supabase/middleware.ts` (elenco `CANONICAL_SOURCES`). Dettaglio “first login” vs completamento profilo: **da verificare** nei file route onboarding se serve precisione assoluta.
- **Fallback ruolo:** conflitto documentato — provider e `api/auth/context` possono usare **`athlete`** se normalizzazione fallisce; middleware comportamento diverso (mantiene stringa DB se non mappata). **Unificare** (blocco esplicito o stesso fallback ovunque) — `RULE_CONFLICTS`.

---

## 4. Guard e Middleware

**Dove vivono:**

| Layer                    | File / pattern                                                                                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Middleware web**       | `src/middleware.ts` — matcher, whitelist, redirect; con `CAPACITOR=true` → **pass-through** senza stessi controlli (`RULE_CONFLICTS`)                                                                                         |
| **Guard / layout ruolo** | Esempi: `use-staff-dashboard-guard`, `use-chat-page-guard`, `use-clienti-page-guard`, `use-impostazioni-page-guard`, `use-profilo-page-guard`; layout `src/components/shared/dashboard/role-layout.tsx` (`CANONICAL_SOURCES`) |
| **Protezione route**     | Middleware (web) + guard client + eventuali controlli in pagina                                                                                                                                                               |

**Web vs Capacitor:**

- **Web:** middleware + guard client (modello documentato).
- **Capacitor:** middleware **non** applica le stesse regole; commenti in codice che attribuiscono tutto al middleware possono essere **fuorvianti** (es. `home-layout-auth.tsx` citato in `RULE_CONFLICTS`). Protezione affidata a client (`useEffect`, `useAuth`, guard).

**Problemi attuali (da `RULE_CONFLICTS`):**

- RBAC a **strati** (middleware, guard, assenza parità su nativo) → più superfici da allineare.
- Redirect staff: **guard parziale** vs tabella completa in `role-redirect-paths` (es. **marketing** → `/dashboard` dal guard vs path marketing atteso).
- Default **`athlete`** e **`getSession` vs `getUser`** incoerenti tra layer.
- Hook **`useAthleteAppointments`**: filtri espliciti solo per athlete/trainer/admin; altri ruoli staff dipendono da RLS senza filtro client — rischio se policy permissive.
- Hook auth: **doppio path** import (`use-auth` vs `useAuth`).

---

## 5. Matrice permessi (semplificata)

Orientativa — **non** sostituisce RLS né permessi granulari in DB. Celle “implicito RLS” = esito dipendente dalle policy, non da filtri espliciti in hook.

| Feature                           | Admin            | Trainer          | Athlete       | Marketing         | Note                                                                          |
| --------------------------------- | ---------------- | ---------------- | ------------- | ----------------- | ----------------------------------------------------------------------------- |
| Dashboard staff generica          | Sì               | Sì               | No            | Sì                | Path per marketing: allineare guard a `role-redirect-paths`.                  |
| Portale `/home`                   | No               | No               | Sì            | No                | Atleta.                                                                       |
| Appuntamenti (liste/query client) | Filtro esplicito | Filtro esplicito | Filtro atleta | **Implicito RLS** | `useAthleteAppointments`: altri staff senza ramo dedicato (`RULE_CONFLICTS`). |
| Admin / impersonazione            | Sì (ruolo)       | —                | —             | —                 | API `api/admin/impersonation/**`, UI banner (`CANONICAL_SOURCES`).            |
| Marketing (area dedicata)         | —                | —                | —             | Sì                | Coerenza redirect: **da correggere** se guard non delega.                     |

---

## 6. Conflitti principali

Sintesi da `RULE_CONFLICTS` (solo ambito auth/RBAC e incroci citati):

- **Duplicazioni RBAC:** mappe redirect nei guard vs `role-redirect-paths`; normalizer server vs client; doppio hook auth (import).
- **Mismatch web vs mobile:** middleware disattivato su Capacitor; stessa minaccia non coperta allo stesso modo lato edge.
- **Ruoli non gestiti ovunque allo stesso modo:** es. **marketing** nel guard staff; ruoli legacy (`pt`, `staff`, …) **da verificare**.
- **Redirect incoerenti:** guard con `REDIRECT_PATH_BY_ROLE` parziale + fallback `/dashboard` vs middleware con liste per ruolo.
- **Client vs RLS:** hook senza filtri per tutti i ruoli staff; autorizzazione “per caso” via RLS — fragile se policy cambiano.
- **Sessione:** `getSession` vs `getUser` per profilo — decisioni diverse tra API e altri layer.
- **Fallback ruolo:** atleta di default in provider/context vs middleware — comportamenti diversi su stringa non mappata.

---

## 7. Regole operative (IMPORTANTISSIMO)

- I **permessi non si definiscono** sparsi nei componenti come seconda verità: UI e hook orchestrano; **RLS** + moduli canonici definiscono il confine.
- I **guard** devono **delegare** path di destinazione a **`role-redirect-paths.ts`** (nessuna seconda tabella mentale).
- Il **redirect post-login / home ruolo** deve essere **unico** (`role-redirect-paths.ts`); middleware allineato agli stessi path.
- **RLS** è la **verità finale** per cosa è leggibile/scrivibile; il client non può assumere un solo contratto se il SQL ha policy sovrapposte — vedi piani `audit/rls/`.
- **Capacitor** non deve avere **logiche divergenti** rispetto al modello di minaccia concordato: finché manca parità con il web, è **debito architetturale** documentato, non una seconda “verità” accettabile (`CANONICAL_SOURCES`).
- **Permessi granulari** admin (se persistiti): solo tramite editor/API admin; non duplicare mappa ruolo→area senza passare dai moduli canonici.
- **Un solo entrypoint** hook auth da usare nei nuovi file (verso `useAuth` / policy progetto dopo cleanup import).

---

## 8. Stato attuale

| Valutazione                        | Motivo (sintesi audit)                                                                                                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fragile / parzialmente critico** | RBAC distribuito su più layer; redirect e fallback non sempre allineati; gap **Capacitor** vs middleware; RLS/schema descritti con policy duplicate in audit interno — rischio bug per ruolo o ambiente. |
| Non “stabile end-to-end”           | Finché guard non delegano tutti a `role-redirect-paths`, `getUser`/`getSession` non sono unificati, e nativo non ha parità con web, il sistema resta **sensibile a regressioni** sui percorsi auth.      |

---

## 9. Prossimi interventi

Checklist concreta (allineata a `CANONICAL_SOURCES` / `RULE_CONFLICTS`):

- [ ] **Unificazione guard:** importare / delegare a `getDefaultAppPathForRole` (o stesso Record) ovunque ci sia `REDIRECT_PATH_BY_ROLE` parziale.
- [ ] **Allineamento Capacitor:** strategia unica (guard obbligatori equivalenti, o auth nativa) — oggi **da pianificare**, non solo documentazione.
- [ ] **Rimozione duplicati:** mappe redirect nei guard; import unico `useAuth` vs `use-auth`.
- [ ] **Normalizzazione ruoli:** inventario DB + allineamento `role-normalizer` e fallback (atleta vs blocco) tra middleware, `auth/context`, `auth-provider`.
- [ ] **Sessione server:** una policy progetto — **`getUser`** per route sensibili; allineare o deprecare `get-current-profile` dove applicabile.
- [ ] **Hook appuntamenti / ruoli staff:** filtri espliciti per ruoli supportati **oppure** guard “non supportato”; non affidarsi solo a RLS senza matrice chiara (`RULE_CONFLICTS`).
