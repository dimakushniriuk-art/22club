# Audit tecnico: GET /api/marketing/analytics

**Oggetto:** `src/app/api/marketing/analytics/route.ts`  
**Data audit:** analisi statica su codice e migration.

---

## Sezione 1 – Performance (aggregazioni)

### marketing_leads

- **leadsTotal:** aggregazione **in DB** (`.select('*', { count: 'exact', head: true })`); nessun fetch di righe.
- **leadsNew7d:** fetch di tutte le righe con `created_at >= iso7` (solo colonna `id`), conteggio **in JS** con `data.length`. Rischio: **medio** con 10k righe (fetch 10k id), **alto** con 50k (payload e tempo di risposta).
- **leadsFunnel30d / conversionRate30d:** fetch di tutte le righe con `created_at >= iso30` (solo colonna `status`), raggruppamento e conteggio **in JS**. Stesso rischio: **medio** a 10k, **alto** a 50k.
- **trendLeads7d:** fetch di tutte le righe con `created_at >= iso7` (solo `created_at`), raggruppamento per giorno **in JS**. Rischio: **medio/alto** come sopra (stesse righe della query 7d).
- **trendLeads30d:** fetch di tutte le righe con `created_at >= iso30` (solo `created_at`), raggruppamento per settimana **in JS**. Query **potenzialmente problematica** con 10k/50k righe (finestra 30d tipicamente più grande della 7d).

**Riepilogo:** 1 aggregazione in DB (count totale); 4 query che restituiscono righe con aggregazioni **in JS**. Indice su `created_at` (migration) limita il lavoro del DB ma non il volume di righe restituite all’app.

---

### marketing_campaigns

- Fetch completo di `id, name, status, budget, start_at, end_at` (RLS limita al solo org). Filtro `status === 'active'`, conteggio e somma budget **in JS**.
- **Aggregazioni in JS.** Rischio: **basso** (tabella tipicamente piccola, ordine decine/centinaia di campagne per org).

---

### marketing_events

- Fetch di tutte le righe con `created_at >= iso7` (colonne `type, created_at, payload`). Conteggio totale e conteggio per `payload.campaign_id` **in JS**.
- **Aggregazioni in JS.** Rischio: **medio** con ~10k eventi in 7 giorni, **alto** con 50k (payload jsonb incluso in ogni riga).

---

### marketing_athletes (view)

- Fetch completo di tutte le righe della view (colonne workouts_* e last_workout_at). Somme (coached/solo 7d e 30d) e conteggio inattivi **in JS**.
- **Aggregazioni in JS.** Rischio: **medio** con 10k atleti, **alto** con 50k (fetch completo della view per org).

---

### athlete_marketing_kpis

- **Non usata** in questo endpoint. L’API usa solo la view `marketing_athletes`.

---

## Sezione 2 – marketing_events.payload

- **Metodo:** Il campo `payload` (jsonb) non è filtrato in DB. L’API esegue:
  - `.select('type, created_at, payload').gte('created_at', iso7)`
  quindi nessun filtro su `payload` (né `.contains()`, né `.eq('payload->>campaign_id', ...)`, né RPC). Tutte le righe eventi degli ultimi 7 giorni (rispettando RLS) vengono recuperate; in JS si legge `e.payload?.campaign_id` e si aggrega per campagna.
- **Indice:** Nelle migration non risulta alcun indice su `marketing_events.payload` (es. GIN per jsonb o espressione su `(payload->>'campaign_id')`). Esistono indici su `org_id`, `type`, `created_at`.
- **Full table scan:** No su tutta la tabella: il filtro `.gte('created_at', iso7)` usa l’indice su `created_at`. Resta però uno scan su tutte le righe che soddisfano la data (ultimi 7 giorni) e caricamento del jsonb `payload` per ognuna.
- **Performance risk:** **Medio** (pochi eventi in 7d) a **Alto** (molti eventi in 7d e payload grandi). Il collo di bottiglia è il volume di dati trasferiti e l’elaborazione in JS, non un full table scan completo.
- **Nota tecnica:** Per ridurre trasferimento e lavoro in JS si potrebbero usare aggregazioni in DB (es. RPC o query con filtro/raggruppamento su `payload->>'campaign_id'` e count); un indice espressione su `(created_at, (payload->>'campaign_id'))` potrebbe essere valutato se si filtra/aggrega spesso per campaign_id in DB.

---

## Sezione 3 – RLS

- **marketing_leads:** RLS attiva (migration `20260228100000_marketing_leads_campaigns.sql`). Policy SELECT con filtro su `org_id` (subquery su `profiles`) e ruolo `admin`/`marketing`. **Coperta.**
- **marketing_campaigns:** RLS attiva (stessa migration + hardening `20260228232000`). Policy SELECT (e INSERT/UPDATE/DELETE) con `get_org_id_for_current_user()` e `get_current_user_role() IN ('admin','marketing')`. **Coperta.**
- **marketing_events:** RLS attiva (migration `20260228100000`). Policy SELECT con `org_id` e ruolo `admin`/`marketing`. **Coperta.**
- **marketing_athletes (view):** La view è usata dall’API; non risulta una sua definizione nelle migration analizzate. In PostgreSQL le view non hanno RLS propria; l’accesso dipende dalle tabelle sottostanti (e da eventuale `SECURITY INVOKER`/`DEFINER`). **Da verificare:** che la view sia costruita su tabelle già protette per org e che l’utente non possa vedere dati di altri org (es. filtro org nella definizione della view o nelle tabelle base).
- **athlete_marketing_kpis:** Non usata in questo endpoint. Se esistesse come tabella/view, andrebbe verificata a parte per RLS.

**Stato:** Le tre tabelle **marketing_leads**, **marketing_campaigns**, **marketing_events** hanno RLS attiva e policy che filtrano per org e ruoli admin/marketing.  
**Eventuali problemi:** Copertura RLS sulla view **marketing_athletes** da verificare (definizione view e tabelle sottostanti) per confermare isolamento per org.
