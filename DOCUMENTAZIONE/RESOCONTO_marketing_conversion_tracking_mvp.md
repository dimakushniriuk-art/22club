# Resoconto: Conversion Tracking MVP (Lead → Athlete)

## File modificati/creati

| File                                                           | Azione                                                                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260228233000_marketing_conversions.sql` | Creato: colonne conversion su marketing_leads, tabella history, trigger, RLS                                                |
| `src/app/api/marketing/leads/[id]/route.ts`                    | Aggiunto GET (lead + note)                                                                                                  |
| `src/app/api/marketing/leads/[id]/convert/route.ts`            | Creato: POST convert (body athlete_profile_id)                                                                              |
| `src/app/api/marketing/leads/athletes-search/route.ts`         | Creato: GET ?q= per ricerca atleti (org, role=athlete)                                                                      |
| `src/lib/supabase/types.ts`                                    | marketing_leads: converted_athlete_profile_id, converted_at, converted_by_profile_id; tabella marketing_lead_status_history |
| `src/app/dashboard/marketing/leads/[id]/page.tsx`              | Creato: dettaglio lead, note, blocco “Converti in atleta” (cerca per email, select, bottone Converti)                       |
| `src/app/dashboard/marketing/leads/page.tsx`                   | Aggiunto link “Dettaglio” → `/dashboard/marketing/leads/[id]`                                                               |

---

## Migration (20260228233000_marketing_conversions.sql)

**A) marketing_leads – nuove colonne**

- `converted_athlete_profile_id` uuid NULL FK profiles(id) ON DELETE RESTRICT
- `converted_at` timestamptz NULL
- `converted_by_profile_id` uuid NULL FK profiles(id) ON DELETE RESTRICT

**B) marketing_lead_status_history**

- id, org_id, lead_id (FK marketing_leads ON DELETE CASCADE), from_status, to_status, changed_by_profile_id (FK profiles ON DELETE RESTRICT), created_at
- Indici: lead_id, org_id
- RLS: SELECT/INSERT/UPDATE/DELETE con `get_org_id_for_current_user()` e `get_current_user_role() IN ('admin','marketing')`

**Trigger su marketing_leads (BEFORE UPDATE)**

- `marketing_leads_status_history_and_converted_at()` (SECURITY DEFINER):
  - Se `OLD.status IS DISTINCT FROM NEW.status` → INSERT in marketing_lead_status_history (org_id, lead_id, from_status, to_status, changed_by_profile_id = get_profile_id_from_user_id(auth.uid()))
  - Se `NEW.status = 'converted'` e `NEW.converted_at IS NULL` → `NEW.converted_at := now()`

**Dipendenze:** get_org_id_for_current_user(), get_current_user_role(), get_profile_id_from_user_id(uuid) (migration 20260228231000 e precedenti).

---

## API

- **GET /api/marketing/leads/:id** – Lead + note (solo admin/marketing, RLS).
- **POST /api/marketing/leads/:id/convert** – Body: `{ athlete_profile_id: uuid }`. Update lead: status=converted, converted_athlete_profile_id, converted_by_profile_id (profile corrente), converted_at, updated_at. Ritorna lead aggiornato.
- **GET /api/marketing/leads/athletes-search?q=** – Profili role=athlete stesso org, filtro opzionale su email (ilike), limit 50. Solo admin/marketing.

---

## UI

- **Lista lead:** colonna “Dettaglio” con link a `/dashboard/marketing/leads/[id]`.
- **Dettaglio lead:** card Lead (stato, fonte, telefono, date; se converted: converted_at e converted_athlete_profile_id), card Note, se status ≠ converted blocco “Converti in atleta” (input ricerca email → Cerca → select atleta → bottone Converti → POST convert).

---

## Checklist test

- [ ] **Marketing crea lead** (flusso esistente).
- [ ] **Cambio status più volte** (es. da PATCH o da altra UI): verificare che in `marketing_lead_status_history` compaiano righe (from_status, to_status, changed_by_profile_id, created_at).
- [ ] **Converti lead:** da dettaglio, cerca atleta per email, seleziona, “Converti” → status=converted, converted_at valorizzato, converted_athlete_profile_id e converted_by_profile_id salvati; in history c’è la transizione allo status converted.
- [ ] **RLS:** utente marketing/admin org A non vede lead/note/history di org B; athletes-search restituisce solo atleti dello stesso org.
