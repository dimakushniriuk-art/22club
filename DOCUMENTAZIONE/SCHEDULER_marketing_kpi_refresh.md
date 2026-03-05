# Scheduler: Marketing KPI Refresh

Refresh automatico dei KPI marketing senza `pg_cron`. Edge Function invocata su schedule (es. ogni 2 ore). Protetta da header `x-cron-secret`.

---

## Cosa fa

- **Edge Function:** `marketing-kpi-refresh`
- **Azione:** Verifica header `x-cron-secret`; crea client Supabase con **service role**; chiama RPC `run_marketing_kpi_refresh()` che esegue `refresh_athlete_marketing_kpis()`.
- **Scopo:** Aggiornare la tabella `public.athlete_marketing_kpis` (RLS-enabled); il job usa service role per bypassare RLS.
- **Risposta:** JSON `{ ok: true, duration_ms }` in successo; `{ ok: false, error }` in errore; `{ ok: false, error: "unauthorized" }` con 401 se il secret non è valido.

---

## Frequenza

- **Schedule consigliato:** ogni 2 ore (cron: `0 */2 * * *`).
- **Nome job (Dashboard):** `marketing-kpi-refresh`.

---

## Variabile d'ambiente

- **`MARKETING_KPI_REFRESH_SECRET`** (obbligatoria): valore condiviso tra Edge Function e scheduler. Lo scheduler deve inviare lo stesso valore nell'header **`x-cron-secret`**. Se assente o diverso → 401.

Impostazione in Supabase Dashboard: **Project Settings** → **Edge Functions** → **marketing-kpi-refresh** → **Secrets** → aggiungi `MARKETING_KPI_REFRESH_SECRET`.

---

## Deploy

### 1. Deploy della Edge Function

```bash
supabase functions deploy marketing-kpi-refresh
```

### 2. Impostare il secret

In **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets** (o nella scheda della function): aggiungi `MARKETING_KPI_REFRESH_SECRET` con un valore casuale sicuro (es. generato con `openssl rand -hex 32`). Lo stesso valore va usato nell'header `x-cron-secret` quando configuri lo schedule.

### 3. Configurare lo schedule in Dashboard

1. **Supabase Dashboard** → **Edge Functions** → **marketing-kpi-refresh**.
2. Apri la sezione **Scheduled Invocations** (o **Cron** / **Triggers**, a seconda dell’UI).
3. **Create schedule** (o **Add cron**):
   - **Name:** `marketing-kpi-refresh`
   - **Schedule (cron):** `0 */2 * * *` (ogni 2 ore)
   - **URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/marketing-kpi-refresh`
   - **Method:** POST
   - **Headers:** aggiungi un header:
     - **Name:** `x-cron-secret`
     - **Value:** il valore di `MARKETING_KPI_REFRESH_SECRET` (stesso impostato nei Secrets della function)

Non usare `Authorization: Bearer` con service role per lo schedule: l’unica autenticazione richiesta è `x-cron-secret`.

---

## Prerequisiti DB (già presenti)

- Tabella **`public.athlete_marketing_kpis`** (RLS abilitato).
- Funzione **`public.refresh_athlete_marketing_kpis()`** (popola/aggiorna la tabella).
- Funzione **`public.run_marketing_kpi_refresh()`** (chiama `refresh_athlete_marketing_kpis()`).
- View **`public.marketing_athletes`** (esposta al ruolo marketing con RLS).

---

## Test manuale

### Esecuzione locale

```bash
supabase functions serve marketing-kpi-refresh
```

Imposta il secret in locale (es. tramite `.env` o `supabase functions serve --env-file .env.local`) con `MARKETING_KPI_REFRESH_SECRET=<tuo_secret>`.

In un altro terminale:

```bash
# Usa x-cron-secret (NON Bearer / service role)
curl -X POST "http://localhost:54321/functions/v1/marketing-kpi-refresh" \
  -H "x-cron-secret: TUO_SECRET" \
  -H "Content-Type: application/json"
```

Sostituire `TUO_SECRET` con il valore di `MARKETING_KPI_REFRESH_SECRET`.

### Chiamata in produzione

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/marketing-kpi-refresh" \
  -H "x-cron-secret: TUO_SECRET" \
  -H "Content-Type: application/json"
```

Risposta attesa in successo: `{"ok":true,"data":...,"duration_ms":...}`.  
Se secret errato: `{"ok":false,"error":"unauthorized"}` con status 401.

---

## Verifica dopo il refresh

In SQL Editor (o client DB):

```sql
SELECT updated_at
FROM public.athlete_marketing_kpis
ORDER BY updated_at DESC
LIMIT 5;
```

Dopo una run corretta, i `updated_at` più recenti devono riflettere l’orario del job.

---

## Resoconto

### File toccati

| File | Modifica |
|------|----------|
| `supabase/functions/marketing-kpi-refresh/index.ts` | Aggiunto controllo header `x-cron-secret` vs env `MARKETING_KPI_REFRESH_SECRET`; 401 con `{ ok: false, error: "unauthorized" }` se assente o diverso. Service role invariato. |
| `docs/SCHEDULER_marketing_kpi_refresh.md` | Rimossa nota su tabelle/funzioni mancanti. Prerequisiti DB dichiarati presenti. Test manuale con `x-cron-secret` (no Bearer). Aggiunta query di verifica `updated_at`. Istruzioni schedule in Dashboard con header `x-cron-secret`. |

### Come impostare lo schedule in Dashboard

1. **Dashboard** → **Edge Functions** → **marketing-kpi-refresh**.
2. **Secrets:** imposta `MARKETING_KPI_REFRESH_SECRET` (valore sicuro).
3. **Scheduled Invocations** (o **Cron**): **Create**.
4. **Name:** `marketing-kpi-refresh`.
5. **Cron:** `0 */2 * * *`.
6. **URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/marketing-kpi-refresh`, **Method:** POST.
7. **Headers:** `x-cron-secret` = stesso valore di `MARKETING_KPI_REFRESH_SECRET`.
8. Salva.

### Checklist test

- [ ] **a) Esecuzione manuale** – curl con `x-cron-secret` corretto → `{ ok: true }`; senza secret o con valore sbagliato → 401.
- [ ] **b) Verifica `updated_at`** – Eseguire la query sopra su `athlete_marketing_kpis` dopo una run e controllare che i timestamp siano aggiornati.
- [ ] **c) Utente marketing** – Verificare che il ruolo marketing possa leggere la view `marketing_athletes` e i KPI (RLS invariato).
