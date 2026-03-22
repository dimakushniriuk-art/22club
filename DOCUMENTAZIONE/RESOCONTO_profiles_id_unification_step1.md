# Resoconto: profiles.id unificazione – Step 1

## 1) File modificati/creati

| File                                                                   | Azione                                                                                                                                                                     |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ANALISI_profiles_id_unification.md`                              | Creato – analisi FASE A                                                                                                                                                    |
| `supabase/migrations/20260228200000_profiles_id_unification_step1.sql` | Creato – migration Step 1                                                                                                                                                  |
| `src/lib/supabase/get-current-profile.ts`                              | Creato – utility server `getCurrentProfile()` / `getCurrentProfileId()`                                                                                                    |
| `src/components/dashboard/assign-workout-modal.tsx`                    | Modificato – insert `workout_plans` con `created_by_profile_id` + legacy `created_by`                                                                                      |
| `src/app/api/exercises/route.ts`                                       | Modificato – POST insert con `created_by_profile_id` e `created_by` = auth uid                                                                                             |
| `src/hooks/use-communications.ts`                                      | Modificato – create communication con `created_by_profile_id`                                                                                                              |
| `src/lib/supabase/types.ts`                                            | Modificato – aggiunte colonne `created_by_profile_id` / `recipient_profile_id` in Row/Insert/Update per workout_plans, exercises, communications, communication_recipients |
| `docs/RESOCONTO_profiles_id_unification_step1.md`                      | Creato – questo resoconto                                                                                                                                                  |

## 2) Migration creata – contenuto

**File:** `supabase/migrations/20260228200000_profiles_id_unification_step1.sql`

- **workout_plans:** aggiunta `created_by_profile_id` (uuid NULL), backfill da `profiles.id` dove `profiles.user_id = workout_plans.created_by`, indice, FK a `profiles(id)` ON DELETE SET NULL. RLS: policy SELECT/UPDATE/DELETE “assigned_staff” estese con `OR (created_by_profile_id = get_profile_id_from_user_id(auth.uid()))`.
- **exercises:** aggiunta `created_by_profile_id`, backfill da `profiles.user_id = exercises.created_by`, indice, FK.
- **communications:** aggiunta `created_by_profile_id`, backfill, indice, FK.
- **communication_recipients:** aggiunta `recipient_profile_id`, backfill da `user_id`, indice, FK.
- **credit_ledger:** se esistono tabella e colonna `created_by`, aggiunta `created_by_profile_id`, backfill, indice, FK.

Le colonne legacy (`created_by`, `user_id`) **non** sono state rimosse (Step 2).

## 3) Impatti su API e UI

- **API:**
  - `POST /api/exercises`: scrive `created_by_profile_id` (profile corrente) e `created_by` (session.user.id) per compatibilità RLS.
  - Altre API che creano workout_plans/communications usano client-side (assign-workout-modal, use-communications): già aggiornate per inviare `created_by_profile_id` dove possibile.
- **UI:**
  - Assign workout modal: legge `id` e `user_id` da profilo e invia `created_by_profile_id` + `created_by`.
  - Comunicazioni (hook): dopo auth recupera profilo e aggiunge `created_by_profile_id` all’insert.
- **Utility:** `getCurrentProfile()` e `getCurrentProfileId()` in `src/lib/supabase/get-current-profile.ts` per uso nelle API route (server-only).

## 4) Step 2 (cleanup futuro)

- Rimuovere colonne legacy: `workout_plans.created_by`, `exercises.created_by`, `communications.created_by`, `communication_recipients.user_id` (e opzionale `credit_ledger.created_by`) dopo aver aggiornato tutte le policy RLS e il codice a usare solo `*_profile_id`.
- RLS: sostituire le condizioni `created_by = auth.uid()` con `created_by_profile_id = get_profile_id_from_user_id(auth.uid())` e poi eliminare il fallback su `created_by`.
- Admin delete utente: considerare cancellazione comunicazioni anche per `created_by_profile_id = profile_id` (oltre a `created_by = user_id`).

## 5) Checklist test manuali rapidi

- [ ] **Admin:** crea scheda workout da “Assegna scheda” → verifica che la scheda sia visibile e che in DB `workout_plans` abbia `created_by_profile_id` valorizzato.
- [ ] **Trainer:** crea esercizio da dashboard esercizi (o API POST /api/exercises) → verifica che in DB `exercises` abbia `created_by_profile_id` valorizzato.
- [ ] **Staff:** crea una comunicazione (draft) da UI comunicazioni → verifica che in DB `communications` abbia `created_by_profile_id` valorizzato.
- [ ] **Admin/Trainer:** visualizza lista schede (workout_plans) create da sé → le schede restano visibili (RLS con `created_by_profile_id` o `created_by`).
- [ ] **Marketing:** login e accesso a `/dashboard/marketing` invariato (nessun uso diretto delle colonne modificate).
