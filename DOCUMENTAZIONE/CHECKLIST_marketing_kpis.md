# Checklist Marketing KPIs – Secure Layer

## Come lanciare il cron manualmente

1. Imposta `CRON_SECRET` in `.env.local` (es. stringa casuale lunga).
2. Da terminale:
   ```bash
   curl -X POST "http://localhost:3000/api/admin/cron/refresh-marketing-kpis" \
     -H "Authorization: Bearer TUO_CRON_SECRET"
   ```
   Oppure con header alternativo:
   ```bash
   curl -X POST "http://localhost:3000/api/admin/cron/refresh-marketing-kpis" \
     -H "x-cron-secret: TUO_CRON_SECRET"
   ```
3. Risposta attesa: `{"ok":true}` (200). In caso di secret errato: 401.

## Come verificare la tabella KPI

1. Da Supabase SQL Editor (o client con service_role):
   ```sql
   SELECT athlete_profile_id, org_id, workouts_coached_30d, workouts_solo_30d, last_workout_at, updated_at
   FROM public.athlete_marketing_kpis
   ORDER BY updated_at DESC
   LIMIT 20;
   ```
2. Dopo il primo run del cron, le righe vengono popolate/aggiornate. Se la tabella è vuota, verificare che esistano profili con `role IN ('atleta','athlete')` e `org_id` non null, e che il cron sia stato eseguito con successo.

## Come verificare che il marketing non vede dati raw

1. **Marketing NON può SELECT su profiles:** Con sessione utente ruolo `marketing`, da client Supabase (authenticated): `select * from profiles` deve restituire 0 righe (RLS: policy "Marketing and admin can view org profiles" è stata rimossa). Verifica: in SQL Editor con ruolo authenticated simulato, o da app che usa solo anon key + JWT marketing.
2. **Marketing NON può SELECT su workout_logs:** Con sessione marketing, `select * from workout_logs` deve restituire 0 righe. Le policy SELECT su workout_logs escludono esplicitamente il ruolo `marketing`.
3. **GET /api/marketing/athletes funziona con user marketing:** La route usa solo la RPC `marketing_list_athletes` (gateway SECURITY DEFINER). Con utente admin o marketing (stesso org degli atleti), la chiamata ritorna 200 e l’array `data` con campi safe (athlete_id, first_name, last_name, email, stato, KPI 7/30/90d, last_workout_at). Nessun SELECT diretto su `profiles` o `workout_logs` dal client.

## Env richieste

- `CRON_SECRET`: segreto per autorizzare le chiamate al cron (obbligatorio in produzione).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: già usate.
- Opzionale: `KPI_REFRESH_BATCH_SIZE` (via `app.kpi_refresh_batch_size` in session/DB, o in futuro via env per la RPC).

## Frequenza cron (Vercel)

In `vercel.json` il job è schedulato con `0 */6 * * *` (ogni 6 ore). Per cambiare frequenza, modificare il campo `schedule` nella configurazione `crons`.

---

## Verifiche sicurezza (Marketing Safe Gateway)

### 1. Con user marketing: SELECT su profiles fallisce

Da client con JWT di un utente con `profiles.role = 'marketing'` (es. da app dopo login come marketing):

```sql
-- In Supabase SQL Editor con "Run as user" non disponibile, simulare con:
-- Verifica che la policy "Marketing and admin can view org profiles for marketing" non esista
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles' AND schemaname = 'public';
-- Non deve comparire alcuna policy che includa 'marketing' per SELECT.
```

Da app: con utente marketing, qualsiasi lettura diretta da `profiles` (es. da codice client che faccia `.from('profiles').select('*')`) deve restituire 0 righe a causa RLS.

### 2. Con user marketing: SELECT su workout_logs fallisce

Le policy SELECT su `workout_logs` includono la condizione `(get_current_user_role() IS NULL OR get_current_user_role() <> 'marketing')`. Con ruolo marketing nessuna policy restituisce true, quindi 0 righe.

```sql
-- Verifica che le policy workout_logs escludano marketing
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'workout_logs' AND cmd = 'SELECT';
-- Ogni qual deve contenere la condizione su get_current_user_role() <> 'marketing'.
```

### 3. GET /api/marketing/athletes con user marketing funziona

Con sessione admin o marketing (e `org_id` valorizzato):

```bash
# Dopo login da browser, dalla stessa origin (o con cookie di sessione):
curl -s "https://TUO_DOMAIN/api/marketing/athletes" -H "Cookie: sb-..." | jq '.data | length'
# Atteso: 200 e .data array di atleti (campi safe: athlete_id, first_name, last_name, email, stato, KPI, last_workout_at).
```

---

## Security regression tests

Test automatici (Playwright) che verificano: marketing non legge raw (profiles, workout_logs); marketing può leggere solo `/api/marketing/athletes`; admin può aprire la UI atleti marketing.

### Comando

```bash
npx playwright test tests/e2e/marketing-security-no-raw.spec.ts
```

Per eseguire tutti i test E2E (incluso global setup):

```bash
npx playwright test
```

### Env richieste per i test marketing

- **Obbligatorie (già usate):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `PLAYWRIGHT_ATHLETE_EMAIL`, `PLAYWRIGHT_ATHLETE_PASSWORD`, `PLAYWRIGHT_TRAINER_EMAIL`, `PLAYWRIGHT_TRAINER_PASSWORD`, `PLAYWRIGHT_ADMIN_EMAIL`, `PLAYWRIGHT_ADMIN_PASSWORD`
- **Opzionali (per test marketing sicurezza):** `MARKETING_TEST_EMAIL`, `MARKETING_TEST_PASSWORD`  
  (oppure `PLAYWRIGHT_MARKETING_EMAIL`, `PLAYWRIGHT_MARKETING_PASSWORD`)

Se le credenziali marketing non sono impostate, i test che richiedono l’utente marketing vengono skippati con messaggio: *Missing marketing test account*.

### Come creare l’account marketing di test

1. In Supabase (Dashboard → Authentication) crea un utente (email/password) o usane uno esistente.
2. Nella tabella `public.profiles` assicurati che il profilo collegato abbia `role = 'marketing'` e `org_id` valorizzato (stesso org degli atleti che vuoi vedere).
3. Imposta in `.env.local`: `MARKETING_TEST_EMAIL=...` e `MARKETING_TEST_PASSWORD=...`.
4. Rilancia il global setup (o `npx playwright test tests/e2e/marketing-security-no-raw.spec.ts`) per generare `tests/e2e/.auth/marketing-auth.json`.
