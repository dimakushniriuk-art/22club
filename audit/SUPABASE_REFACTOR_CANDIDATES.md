# Candidati refactor Supabase (max 10)

Ordine indicativo per impatto/chiarezza architetturale.

1. **Unificare service_role** — Far passare tutte le operazioni “bypass RLS” da `createAdminClient()` (o wrapper unico), eliminando duplicati in `communications/*`, `notifications/push.ts`, e allineando `notifications/scheduler.ts` (oggi istanza top-level separata).

2. **Migrare hook da `@/lib/supabase` a `@/lib/supabase/client`** — Rimuovere dipendenza dal barrel deprecato; chiarezza “solo browser”.

3. **Documentare / separare `lib/audit.ts`** — Esplicitare se ogni entrypoint è solo server o solo client; evitare doppio import client+server nello stesso file senza guardie.

4. **Standardizzare hook su singleton vs `createClient()`** — Regola di progetto: es. sempre `useSupabaseClient()` o sempre `supabase` singleton, per test e Realtime coerenti.

5. **Ridurre query duplicate dominio** — Estrarre repository o API interne per entità ad alto traffico (appointments, profiles, communications) usate sia da hook che da route.

6. **Allineare import admin** — Usare un solo path (`@/lib/supabase/server` o solo `@/lib/supabase/admin`) per `createAdminClient`.

7. **`notifications/scheduler.ts` + `athlete-registration.ts`** — Lazy init del client come negli altri moduli service; evitare side effect a import se possibile.

8. **Gate su route debug** — `debug-trainer-visibility` (e simili) dietro env `NODE_ENV` / feature flag documentato.

9. **`fetchWithCache.ts`** — Valutare uso del singleton `supabase` invece di tre `createClient()` per allineamento al resto del client.

10. **Tipizzazione tabelle “any” in service** — `communications/service.ts`, `scheduler.ts`, `push.ts` usano cast `as any` su `.from()`; refactor tipi generati riduce errori silenziosi (qualità, non solo Supabase).

---

*Lista descrittiva — nessuna implementazione richiesta in questa fase.*
