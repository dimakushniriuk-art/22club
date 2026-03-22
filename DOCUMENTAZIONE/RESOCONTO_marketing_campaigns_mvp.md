# Resoconto: Marketing → Campaigns (PUNTO 11.2.3) – CRUD MVP

## File modificati/creati

| File                                                                   | Azione                                                                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260228232000_marketing_campaigns_hardening.sql` | Creato: trigger org_id, updated_at, RLS con funzioni DEFINER, policy DELETE                  |
| `src/lib/supabase/types.ts`                                            | Aggiunta tabella `marketing_campaigns` (Row, Insert con org_id opzionale, Update)            |
| `src/app/dashboard/marketing/campaigns/page.tsx`                       | Sostituito stub: lista, filtri status/channel, search, KPI, pulsante Nuova campagna          |
| `src/app/dashboard/marketing/campaigns/new/page.tsx`                   | Creato: form name/channel/budget/start_at/end_at/status, INSERT senza org_id                 |
| `src/app/dashboard/marketing/campaigns/[id]/page.tsx`                  | Creato: dettaglio, azioni rapide Attiva/Pausa/Termina, pulsante Modifica                     |
| `src/app/dashboard/marketing/campaigns/[id]/edit/page.tsx`             | Creato: form modifica (name, channel, budget, start_at, end_at, status), UPDATE senza org_id |

Nav e middleware: voce "Campagne" già presente in sidebar/mobile; allowlist `/dashboard/marketing/campaigns` già presente (subpath consentiti con `pathname.startsWith`). Nessuna modifica.

---

## Query usate (solo `marketing_campaigns`)

- **Lista:** `supabase.from('marketing_campaigns').select('*').order('updated_at', { ascending: false })`
- **Dettaglio:** `supabase.from('marketing_campaigns').select('*').eq('id', id).single()`
- **Insert (new):** `supabase.from('marketing_campaigns').insert({ name, channel, budget, start_at, end_at, status })` — senza `org_id`
- **Update (edit):** `supabase.from('marketing_campaigns').update({ name, channel, budget, start_at, end_at, status }).eq('id', id)`
- **Update status (dettaglio):** `supabase.from('marketing_campaigns').update({ status }).eq('id', id)`

Nessun accesso a tabelle raw; nessun service role lato client.

---

## Migration hardening (20260228232000)

- **Trigger INSERT:** `marketing_campaigns_set_org_id` — se `org_id` NULL/vuoto imposta `get_org_id_for_current_user()` (richiede migration 20260228231000).
- **Trigger UPDATE:** `marketing_campaigns_updated_at` — imposta `updated_at = now()`.
- **RLS:** SELECT, INSERT, UPDATE, DELETE con `get_org_id_for_current_user()` e `get_current_user_role() IN ('admin','marketing')` (nessuna subquery diretta su `profiles`).

---

## Checklist test

- [ ] **Crea campagna:** da `/campaigns/new` compilare nome (obbligatorio), canale, budget, date, stato → Salva → redirect a lista; campagna visibile senza inviare `org_id`.
- [ ] **Cambia status:** da dettaglio campagna usare Attiva / Pausa / Termina; stato aggiornato in lista e in dettaglio.
- [ ] **Filtri e search:** in lista filtrare per stato (all/draft/active/paused/ended) e canale (all/email/social/web/other); cercare per nome → risultati coerenti.
- [ ] **Modifica:** da dettaglio → Modifica → cambiare nome/budget/date → Salva → dati aggiornati.
- [ ] **RLS per org:** utente marketing di org A non vede campagne di org B; creazione senza `org_id` assegna org corretta tramite trigger.

---

## Dipendenze migration

La migration `20260228232000_marketing_campaigns_hardening.sql` dipende da:

- `get_org_id_for_current_user()` (es. da `20260228231000_marketing_segments_trigger_org_id.sql`)
- `get_current_user_role()` (stessa migration o precedente)

Eseguire prima le migration che definiscono queste funzioni.
