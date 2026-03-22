# Resoconto: Marketing → Analytics (PUNTO 11.2.5) – MVP

## File modificati/creati

| File                                             | Azione                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/app/api/marketing/analytics/route.ts`       | Creato: GET aggregati da leads, campaigns, events, marketing_athletes           |
| `src/app/dashboard/marketing/analytics/page.tsx` | Sostituito placeholder con dashboard (KPI, funnel, trend, atleti KPI, campagne) |
| `src/lib/supabase/types.ts`                      | Aggiunte tabelle `marketing_leads` e `marketing_events` (Row/Insert/Update)     |

Nav: voce "Analytics" già presente → `/dashboard/marketing/analytics`. Middleware: `/dashboard/marketing/analytics` già in allowlist. Nessuna modifica.

---

## Query / fonti usate (solo consentite)

Tutto in **server-side** (Route Handler) con `createClient()` (RLS attiva, nessun service role).

- **marketing_leads:**  
  `select('*', { count: 'exact', head: true })`  
  `select('id').gte('created_at', iso7)`  
  `select('status').gte('created_at', iso30)`  
  `select('created_at').gte('created_at', iso7)`  
  `select('created_at').gte('created_at', iso30)`
- **marketing_campaigns:**  
  `select('id, name, status, budget, start_at, end_at')`
- **marketing_events:**  
  `select('type, created_at, payload').gte('created_at', iso7)`
- **marketing_athletes (view):**  
  `select('workouts_coached_7d, workouts_solo_7d, workouts_coached_30d, workouts_solo_30d, last_workout_at')`

Nessun accesso a: workout*logs, workout_plans, athlete*\*\_data, chat, progress_photos.

---

## Endpoint GET /api/marketing/analytics

- **Auth:** sessione obbligatoria; ruolo `admin` o `marketing`, altrimenti 403.
- **Risposta:** JSON con:
  - **kpi:** leadsTotal, leadsNew7d, conversionRate30d, campaignsActive, budgetActive
  - **leadsFunnel30d:** conteggi per status (new, contacted, trial, converted, lost)
  - **trendLeads7d:** array `{ date, count }` per giorno (ultimi 7 giorni)
  - **trendLeads30d:** array `{ week, count }` per settimana (ultimi 30 giorni)
  - **atletiKpi:** somme coached/solo 7d e 30d, conteggio atleti inattivi (last_workout_at null o &gt;30d)
  - **campaigns:** campagne attive con budget, periodo, eventsCount7d (da payload.campaign_id se presente)
  - **eventsTotal7d:** totale eventi ultimi 7 giorni

---

## Pagina /dashboard/marketing/analytics

- **KPI cards:** Leads totali, Nuovi (7d), Conversion (30d), Campagne attive, Budget attive.
- **Leads funnel (30d):** card per status (new, contacted, trial, converted, lost).
- **Trend leads:** tabella 7d (per giorno), tabella 30d (per settimana).
- **Atleti activity (KPI):** Coached 7d, Solo 7d, Coached 30d, Solo 30d, Inattivi (&gt;30d).
- **Campagne attive:** lista con budget, periodo, eventi 7d (per campagna se `payload.campaign_id` presente).

Filtri 7d/30d: non esposti in UI (periodi fissi 7d e 30d nell’API). Opzionale MVP: filtri periodo in pagina (stesso endpoint, parametri query) — non implementato in questo ciclo.

---

## Checklist test

- [ ] Utente **marketing** (o admin) vede la dashboard senza errori; dati coerenti con l’org.
- [ ] KPI: leads totali, nuovi 7d, conversion 30d, campagne attive, budget attive corretti.
- [ ] Funnel 30d: conteggi per status coerenti con i lead creati negli ultimi 30 giorni.
- [ ] Trend 7d e 30d: date/conteggi coerenti con i lead.
- [ ] Atleti KPI: somme e inattivi coerenti con la view `marketing_athletes`.
- [ ] Campagne: solo attive; eventi 7d totali e per campagna (se payload contiene `campaign_id`).
- [ ] Utente non marketing/admin riceve 403 su GET /api/marketing/analytics e redirect dalla pagina.
- [ ] Nessuna chiamata client a tabelle raw; unica fonte dati della pagina: GET /api/marketing/analytics.
