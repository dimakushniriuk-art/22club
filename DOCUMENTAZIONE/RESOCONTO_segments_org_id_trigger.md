# Resoconto: org_id segmenti forzato da trigger DB

**Obiettivo:** Non inviare `org_id` dal client per `marketing_segments`; valore gestito da trigger/RLS lato DB.

---

## File toccati

| File                                                | Modifica                                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/dashboard/marketing/segments/new/page.tsx` | Rimosso `org_id` da `useAuth()`; validazione solo su `name.trim()`; rimosso `org_id` dal payload di INSERT.                          |
| `src/lib/supabase/types.ts`                         | In `marketing_segments.Insert`: `org_id` reso opzionale (`org_id?: string`) per consentire INSERT senza org_id (trigger lo imposta). |

**Verificato (nessuna modifica):**

- `segments/[id]/edit/page.tsx`: l’update invia solo `name`, `description`, `rules`, `updated_at` — nessun `org_id`.
- `segments/[id]/page.tsx`: update “Disattiva” invia solo `is_active` e `updated_at`.
- `segments/page.tsx`: nessun uso di `org_id` da `useAuth()`.

---

## RLS / trigger e org_id

- **RLS:** Le policy su `marketing_segments` continuano a filtrare per `org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid())`. L’utente vede e modifica solo i segmenti del proprio org; il client non deve più inviare `org_id`.
- **Trigger DB:** Per gli INSERT senza `org_id`, è necessario un trigger BEFORE INSERT su `marketing_segments` che imposti `NEW.org_id := (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)`. Se il trigger non è ancora presente, va aggiunto in migration; la logica client è già allineata (nessuna dipendenza da `useAuth().org_id` per i segmenti).
