# Supabase — pattern, rischi, problemi strutturali

## Pattern osservati

### Uso coerente

- **Route API staff/admin:** `await createClient()` per identità utente + controlli su `profiles` / ruolo; **poi** `createAdminClient()` solo dove RLS/operazioni lo richiedono (inviti, assegnazioni, statistiche globali, onboarding, ecc.).
- **Cron admin:** `refresh-marketing-kpis` usa solo service role + **segreto** (`CRON_SECRET`) + rate limit in-memory.
- **Client UI:** singleton `supabase` o `createClient()` da `client.ts` per query sotto RLS dell’utente loggato.

### Duplicazioni

- **Factory service_role in più moduli:** oltre a `createAdminClient()`, esistono implementazioni parallele con `createClient` da `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY` in: `communications/recipients.ts`, `scheduler.ts`, `email.ts`, `service.ts`, `email-batch-processor.ts`, `notifications/push.ts`, **`notifications/scheduler.ts`** (anche istanza top-level non lazy). Stesso potere, più punti di manutenzione.
- **Import admin:** quasi tutto da `@/lib/supabase/server`; eccezione `marketing/leads/convert` che importa `createAdminClient` da `@/lib/supabase/admin` (funzionalmente equivalente).
- **Barrel vs client:** `@/lib/supabase` (deprecated) vs `@/lib/supabase/client` per lo stesso browser client.

### Uso potenzialmente pericoloso

- **Admin client:** sempre **dopo** check sessione/ruolo nelle route verificate; rischio residuo = bug futuro (dimenticanza check) o **DELETE admin/users** con catena `safeDelete` su molte tabelle (impatto alto se ID sbagliato).
- **`notifications/scheduler.ts`:** service role a livello modulo — se importato in contesto inatteso, espone sempre client privilegiato in quel processo.
- **`debug-trainer-visibility`:** route API con server client — superficie debug in produzione se non disabilitata da env/feature flag (da verificare fuori scope mappa).
- **Doppia istanza admin nella stessa handler:** es. `register/complete-profile` chiama `createAdminClient()` più volte (non è leak, ma rumore).

### Incoerenze

- **`lib/audit.ts`:** mescola client browser (`supabase` da `client`) e server (`await createClient()`): comportamento dipende dal ramo eseguito; facile errore se si assume sempre server.
- **Hook:** maggioranza usa singleton `supabase` da barrel; alcuni ricreano `createClient()` a ogni effetto/callback — stesso RLS, diverso lifecycle (testabilità vs istanze multiple).
- **`athlete-registration.ts`:** `const supabase = createClient()` a livello modulo da barrel client — stesso tema scheduler se mai importato server-side.

---

## Top 5 problemi strutturali

1. **Molteplici “admin client” concettuali**  
   Logica service_role duplicata (singleton lazy vs modulo eager in `notifications/scheduler.ts`). Rischio: chiavi/env gestite in punti diversi; difficoltà audit unico del bypass RLS.

2. **Bypass RLS concentrato ma non tracciato da un solo modulo**  
   Comunicazioni, push, notifiche schedulate, cron, route admin: tutti legittimi ma **non** passano tutti da `createAdminClient()` — inventario sicurezza più laborioso.

3. **Accesso dati lato client molto esteso**  
   Decine di hook con `supabase.from(...)` diretto: corretto sotto RLS, ma **logica business e query duplicate** rispetto ad API (stesso dominio in hook + route). Superficie per inconsistenze e difficoltà di caching centralizzato.

4. **Barrel `@/lib/supabase` ancora usato massicciamente**  
   File marcato `@deprecated` ma ancora entry principale per hook; confonde “solo client” e nasconde la distinzione server/browser per chi legge il codice.

5. **Misto client/server in singole lib**  
   `audit.ts` e possibili import trasversali di moduli che assumono browser (es. `appointment-utils`, `all-athlete-documents`) se mai chiamati da server actions senza adattamento — rischio runtime o sessione assente.

---

_Solo analisi — nessuna patch proposta._
