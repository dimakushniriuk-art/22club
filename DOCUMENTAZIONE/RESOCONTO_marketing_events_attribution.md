# Resoconto: Marketing events attribution MVP

## File modificati/creati

| File                                                                  | Azione                                                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260228234000_marketing_events_attribution.sql` | Creato: ALTER marketing_events, backfill, indici                                                                                          |
| `src/app/api/marketing/leads/route.ts`                                | Dopo creazione lead: insert marketing_events (type=lead_created, lead_id, campaign_id opzionale, source/medium/utm_campaign, payload raw) |
| `src/app/api/marketing/events/route.ts`                               | Creato: POST body type, campaign_id?, lead_id?, source?, medium?, utm_campaign?, payload?; org_id e occurred_at=now() dal profilo         |
| `src/app/api/marketing/analytics/route.ts`                            | Eventi 7d: select solo campaign_id, occurred_at; filtro .gte('occurred_at', iso7); conteggio per campagna da campaign_id (non payload)    |
| `src/lib/supabase/types.ts`                                           | marketing_events: Row/Insert/Update con campaign_id, lead_id, actor_profile_id, occurred_at, source, medium, utm_campaign                 |

---

## Migration (20260228234000_marketing_events_attribution.sql)

**A) ALTER marketing_events**

- campaign_id uuid NULL FK marketing_campaigns(id) ON DELETE SET NULL
- lead_id uuid NULL FK marketing_leads(id) ON DELETE SET NULL
- actor_profile_id uuid NULL FK profiles(id) ON DELETE SET NULL
- occurred_at timestamptz (poi NOT NULL DEFAULT now())
- source text NULL, medium text NULL, utm_campaign text NULL

**B) Backfill**

- occurred_at = created_at dove NULL
- campaign_id da payload->>'campaign_id' se formato UUID valido
- lead_id da payload->>'lead_id' se formato UUID valido
- source, medium, utm_campaign da payload ove presenti
- ALTER occurred_at SET NOT NULL, SET DEFAULT now()

**C) Indici**

- idx_marketing_events_org_occurred_at (org_id, occurred_at DESC)
- idx_marketing_events_org_campaign_occurred (org_id, campaign_id, occurred_at DESC) WHERE campaign_id IS NOT NULL
- idx_marketing_events_org_lead_occurred (org_id, lead_id, occurred_at DESC) WHERE lead_id IS NOT NULL

RLS non modificata (admin/marketing, org_id isolation).

---

## API

- **POST /api/marketing/leads:** dopo insert lead, insert in marketing_events con type='lead_created', lead_id=<nuovo lead>, campaign_id dal body se inviato (opzionale), source/medium/utm_campaign dal body, payload = body raw, actor_profile_id = profilo corrente.
- **POST /api/marketing/events:** body type (obbligatorio), campaign_id?, lead_id?, source?, medium?, utm_campaign?, payload?; insert con org_id e actor_profile_id dal profilo, occurred_at=now().

---

## Analytics

- Query eventi ultimi 7d: `.select('campaign_id', 'occurred_at').gte('occurred_at', iso7)` — nessun payload.
- Conteggio eventi per campagna: da colonna campaign_id (non da payload).

---

## Checklist test

- [ ] **Crea lead** (POST /api/marketing/leads): verificare che esista un evento marketing_events con type='lead_created', lead_id=<id lead creato>, e opzionalmente campaign_id se passato nel body.
- [ ] **Analytics:** dashboard analytics mostra eventi per campagna; i conteggi usano marketing_events.campaign_id (nessuna lettura di payload per il conteggio).
