# Resoconto: Marketing automations MVP

## File modificati/creati

| File                                                           | Azione                                                                                                   |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260228235000_marketing_automations.sql` | Creato: tabella marketing_automations, RLS, trigger org_id + updated_at                                  |
| `src/app/api/marketing/automations/[id]/route.ts`              | Creato: GET dettaglio automation + segment                                                               |
| `src/app/api/marketing/automations/[id]/run/route.ts`          | Creato: POST run manuale (applySegmentRules, action create_campaign_suggestion / log_event, last_run_at) |
| `src/lib/supabase/types.ts`                                    | Aggiunta tabella marketing_automations (Row/Insert/Update)                                               |
| `src/app/dashboard/marketing/automations/page.tsx`             | Creato: lista, toggle attivo, link Nuova e Dettaglio                                                     |
| `src/app/dashboard/marketing/automations/new/page.tsx`         | Creato: form name, segment, action_type, action_payload (suggested_name/budget, event_type)              |
| `src/app/dashboard/marketing/automations/[id]/page.tsx`        | Creato: dettaglio + bottone "Esegui ora" → POST run                                                      |
| `src/components/shared/dashboard/sidebar.tsx`                  | Aggiunta voce Automazioni (Zap) → /dashboard/marketing/automations                                       |
| `src/components/shared/dashboard/dashboard-mobile-nav.tsx`     | Aggiunta voce Automazioni (Zap)                                                                          |
| `src/middleware.ts`                                            | Allowlist /dashboard/marketing/automations                                                               |

---

## Migration (20260228235000_marketing_automations.sql)

**Tabella marketing_automations**

- id, org_id, name, segment_id (FK marketing_segments ON DELETE CASCADE), action_type ('create_campaign_suggestion' | 'log_event' | 'tag_leads'), action_payload jsonb DEFAULT '{}', is_active DEFAULT true, last_run_at, created_at, updated_at
- Indici: org_id, segment_id, is_active

**RLS:** SELECT/INSERT/UPDATE/DELETE con get_org_id_for_current_user() e get_current_user_role() IN ('admin','marketing').

**Trigger:** marketing_automations_set_org_id (BEFORE INSERT), marketing_automations_updated_at (BEFORE UPDATE).

---

## API

- **GET /api/marketing/automations/:id** – Ritorna automation + segment (solo admin/marketing).
- **POST /api/marketing/automations/:id/run** – Carica automation e segment, fetch marketing_athletes, applica applySegmentRules; se action_type = create_campaign_suggestion inserisce marketing_events type='campaign_suggestion' con payload (segment_id, athletes_count, suggested_name, suggested_budget, automation_id); se log_event inserisce event con type da action_payload.event_type e payload (segment_id, athletes_count, automation_id); aggiorna last_run_at.

---

## UI

- **Lista:** nome, segmento, tipo azione, ultima esecuzione, toggle attivo, link Dettaglio.
- **Nuova:** nome, select segmento, select action_type, campi action_payload (suggested_name, suggested_budget per create_campaign_suggestion; event_type per log_event).
- **Dettaglio:** card con stato, segmento, azione, last_run_at, payload; bottone "Esegui ora" → POST run.

---

## Checklist test

- [ ] **Crea automazione** su un segmento (es. inattivi): nome, segmento, action_type = create_campaign_suggestion (opzionale suggested_name/budget).
- [ ] **Run manuale** da dettaglio: "Esegui ora" → evento marketing_events type='campaign_suggestion' creato con payload segment_id, athletes_count, suggested_name, suggested_budget; last_run_at aggiornato.
- [ ] **Toggle attivo** in lista: is_active aggiornato.
- [ ] **RLS:** utente marketing org A non vede automazioni di org B.
