# Migrazione app: pt_atleti → trainer_athletes

Dopo l’allineamento DB (trainer_athletes come source-of-truth con status/activated_at/deactivated_at), questo documento elenca le modifiche applicate nel codice Next.js/TS.

---

## Convenzione app-side

- **Atleti di un trainer:** query su `trainer_athletes` con `trainer_id = myProfileId` e `status = 'active'`.
- **Trainer attivo di un atleta:** query su `trainer_athletes` con `athlete_id = X` e `status = 'active'` (limit 1 o maybeSingle).
- **Nuova assegnazione:** disattivare eventuale riga active per lo stesso `athlete_id`, poi insert con `status = 'active'`.

---

## File modificati (batch 1 – core)

| # | File | Modifica |
|---|------|----------|
| 1 | `src/lib/supabase/types.ts` | Aggiunto tipo `trainer_athletes` (Row/Insert/Update con trainer_id, athlete_id, status, activated_at, deactivated_at). |
| 2 | `src/app/api/register/complete-profile/route.ts` | Invito accettato: update su trainer_athletes (disattiva precedente per athlete_id) + insert trainer_athletes(trainer_id, athlete_id, status='active'). Rimosso insert pt_atleti. |
| 3 | `src/app/api/athletes/create/route.ts` | Creazione atleta da trainer: insert su `trainer_athletes` (trainer_id, athlete_id, status='active') al posto di pt_atleti. |
| 4 | `src/app/api/athletes/[id]/route.ts` | GET/PUT: verifica relazione con `trainer_athletes` (trainer_id, athlete_id, status='active'). DELETE: safeDelete su `trainer_athletes` (trainer_id, athlete_id) al posto di pt_atleti. |
| 5 | `src/app/api/admin/users/route.ts` | Lista utenti: trainer da `trainer_athletes` (athlete_id, status='active') + join profiles. Delete utente: safeDelete su `trainer_athletes` al posto di pt_atleti. |

---

## File modificati (batch 2 – chat / UI)

| # | File | Modifica |
|---|------|----------|
| 6 | `src/app/home/chat/page.tsx` | Caricamento PT per atleta: da `trainer_athletes` (athlete_id, status='active'), select `trainer_id`; poi RPC get_my_trainer_profile invariato. |
| 7 | `src/hooks/chat/use-chat-conversations.ts` | Conversazioni atleta: da `trainer_athletes` (athlete_id, status='active') con join `profiles!trainer_athletes_trainer_id_fkey`; uso di `trainer_id` e `trainer` al posto di pt_id/pt. |

---

## File non modificati (nessun pt_atleti diretto)

- **get_my_trainer_profile / get_trainer_profile_full:** solo chiamate RPC; la logica è già su DB e legge da trainer_athletes. Nessuna modifica in app.
- **home/trainer/page.tsx, welcome, use-athlete-calendar-page, athlete-overview-tab:** usano solo l’RPC `get_my_trainer_profile()` → nessun cambio.
- **inviti_atleti.pt_id:** resta il profile id del trainer che invita; complete-profile scrive su trainer_athletes usando quel pt_id come trainer_id.
- **use-invitations, use-inviti-cliente, calendar:** pt_id/inviti non toccano la tabella trainer_athletes in lettura; eventuali riferimenti a “pt_id” sono su inviti_atleti, non su pt_atleti.

---

## Riepilogo

- **Prima:** letture/insert/delete su `pt_atleti` (pt_id, atleta_id) in API, chat e types.
- **Dopo:** stessa UX; tutte le letture/insert/delete che riguardano la relazione trainer↔atleta usano `trainer_athletes` con `status = 'active'` e, dove serve, disattivazione del precedente active prima di inserire il nuovo.
