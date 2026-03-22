# Resoconto: profiles.id unificazione – Step 2 (completamento)

## 1) File modificati

| File                                                                   | Modifica                                                                                                        |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/components/dashboard/assign-workout-modal.tsx`                    | Insert solo `created_by_profile_id`; rimosso `created_by` e select `user_id`                                    |
| `src/app/api/exercises/route.ts`                                       | Insert solo `created_by_profile_id`; rimosso `created_by`                                                       |
| `src/hooks/use-communications.ts`                                      | Insert solo `created_by_profile_id`; rimosso `created_by`; obbligo profilo                                      |
| `src/lib/communications/service.ts`                                    | `createCommunication(profileId, ...)`; `getCommunications` con `created_by_profile_id`                          |
| `src/app/api/admin/users/route.ts`                                     | Delete comunicazioni/recipients per `created_by_profile_id` / `recipient_profile_id` (userId = profile id)      |
| `src/hooks/workouts/use-workout-plans-list.ts`                         | Filtro e select `created_by_profile_id`; lookup profili per `id`                                                |
| `src/hooks/workout-plans/use-workout-plans.ts`                         | Select/insert/update solo `created_by_profile_id`; fetch profilo per id; tipo `WorkoutRowSelected` aggiornato   |
| `src/hooks/workout/use-workout-detail.ts`                              | Select e tipo `created_by_profile_id`; staff lookup per `id`                                                    |
| `src/hooks/use-allenamenti.ts`                                         | `scheda.created_by_profile_id` e lookup profili per `id`                                                        |
| `src/lib/credits/ledger.ts`                                            | Insert `credit_ledger` con `created_by_profile_id`                                                              |
| `src/lib/supabase/types.ts`                                            | Rimosso `created_by` da workout_plans, exercises, communications; rimosso `user_id` da communication_recipients |
| `supabase/migrations/20260228210000_profiles_id_unification_step2.sql` | **Nuovo**: RLS solo \*\_profile_id, indici, drop colonne legacy                                                 |
| `docs/RESOCONTO_profiles_id_unification_step2.md`                      | **Nuovo**: questo resoconto                                                                                     |

## 2) SQL Step 2 – contenuto

**File:** `supabase/migrations/20260228210000_profiles_id_unification_step2.sql`

- **workout_plans (RLS):** policy SELECT/UPDATE/DELETE senza più `created_by = auth.uid()`, solo `created_by_profile_id = get_profile_id_from_user_id(auth.uid())`.
- **communications (RLS):** policy INSERT/UPDATE/DELETE riscritte con `created_by_profile_id = get_profile_id_from_user_id(auth.uid())` al posto di `created_by = auth.uid()`.
- **Indici:** `idx_workout_plans_org_created_by_profile` (se esiste `org_id`), `idx_exercises_org_created_by_profile` (se esiste `org_id`).
- **Drop colonne legacy:**
  - `workout_plans.created_by`
  - `exercises.created_by`
  - `communications.created_by`
  - `communication_recipients.user_id`
  - `credit_ledger.created_by` (se presente)

## 3) Verifica assenza uso colonne legacy in app

- **workout_plans:** nessun riferimento a `created_by`; solo `created_by_profile_id` in assign-workout-modal, use-workout-plans-list, use-workout-plans, use-workout-detail, use-allenamenti.
- **exercises:** solo `created_by_profile_id` in POST /api/exercises.
- **communications:** solo `created_by_profile_id` in use-communications e service (createCommunication/getCommunications).
- **communication_recipients:** nessun insert da app modificato (gestiti da backend comunicazioni); admin delete usa `recipient_profile_id`.
- **credit_ledger:** solo `created_by_profile_id` in ledger.ts.

## 4) Checklist test multi-ruolo

- [ ] **Admin:** Assegna scheda a un atleta → la scheda è visibile; in DB `workout_plans` ha solo `created_by_profile_id`.
- [ ] **Admin:** Elimina un utente (profilo) → le comunicazioni con `created_by_profile_id` = quel profilo e i recipient con `recipient_profile_id` vengono rimossi.
- [ ] **Trainer:** Crea scheda da wizard → visibile in lista; crea esercizio da API/dashboard → presente in DB con `created_by_profile_id`.
- [ ] **Trainer:** Lista schede “mie” (created_by_profile_id = proprio profilo) → tutte le schede create da lui sono visibili.
- [ ] **Atleta:** Lista allenamenti e dettaglio scheda → nome staff/trainer risolto da `created_by_profile_id`; nessun errore.
- [ ] **Staff (comunicazioni):** Crea comunicazione draft → in DB solo `created_by_profile_id`; filtra per “mie” con `created_by_profile_id`.
- [ ] **Marketing:** Login e `/dashboard/marketing` → nessun uso delle tabelle modificate; comportamento invariato.
- [ ] **Dopo migration:** Eseguire `supabase db push` o applicare la migration; verificare che non ci siano query su `created_by` / `user_id` (grep in codice già allineato).

## 5) Ordine di deploy consigliato

1. Applicare **Step 2** sulla DB (migration `20260228210000_profiles_id_unification_step2.sql`).
2. Verificare che il backfill Step 1 abbia valorizzato `created_by_profile_id` / `recipient_profile_id` dove necessario (query di coverage in checklist Step 1).
3. Deploy del codice Step 2 (già allineato a sole `*_profile_id`).

Se la migration viene applicata **dopo** il deploy del codice, le insert su `communications` falliranno finché la colonna `created_by` (NOT NULL) non viene rimossa. Quindi: **prima migration, poi deploy**.
