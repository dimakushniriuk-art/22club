# Schede di allenamento — audit e backlog lavoro

Documento di riferimento per `/dashboard/schede`, `/dashboard/schede/nuova`, `/dashboard/schede/[id]/modifica`.  
**Ultimo aggiornamento:** 2026-03-27 (implementazione batch fix)

---

## Implementazione completata (codice)

- [x] **Admin delete:** `workout_plans` usa `created_by_profile_id` in [`src/app/api/admin/users/route.ts`](src/app/api/admin/users/route.ts).
- [x] **Tipi `workout_plans`:** in [`src/lib/supabase/types.ts`](src/lib/supabase/types.ts) aggiunti `is_draft`, `difficulty`, `athlete_id` nullable su Row/Insert/Update.
- [x] **Valori persistiti:** difficoltà su `workout_plans`, `trainer_id` = creatore su insert/update/duplica; `org_id` lista/creazione da `profiles.org_id` (non più `default-org` sulle schede).
- [x] **Dettaglio modifica:** [`use-workout-detail.ts`](src/hooks/workout/use-workout-detail.ts) — `is_draft` + stato bozza, `difficulty`, `workout_sets` con `execution_time_sec` / `rest_timer_sec`; fetch `workout_plans` + `workout_days` in parallelo; profili atleta/staff in parallelo al batch esercizi.
- [x] **Wizard mapping:** [`modifica/page.tsx`](src/app/dashboard/schede/[id]/modifica/page.tsx) legge `difficulty` dal dettaglio.
- [x] **Performance apertura modifica:** [`useWorkoutPlans({ skipWorkoutList: true })`](src/hooks/workout-plans/use-workout-plans.ts) + `wizardDataLoading`; pagina modifica non attende il fetch della lista schede.
- [x] **Performance salvataggio:** create/update con insert batch di tutti i `workout_days`, poi un batch `workout_day_exercises`, poi un batch `workout_sets`.
- [x] **Exercise catalog `org_id`:** fallback da `default-org` a stringa vuota se mancante.
- [x] **Modal dettaglio:** badge stato “Bozza” in [`workout-detail-modal.tsx`](src/components/workout/workout-detail-modal.tsx).

### Migration `workout_plans.difficulty`

- File locale: [`supabase/migrations/20260327120000_workout_plans_difficulty.sql`](supabase/migrations/20260327120000_workout_plans_difficulty.sql)
- **Applicata su Supabase** (progetto `22Club-NEW`): migration `workout_plans_difficulty` — colonna `difficulty` (`text`, nullable, check `bassa` | `media` | `alta`).

---

## Contesto stack

- Hook: [`src/hooks/workout-plans/use-workout-plans.ts`](src/hooks/workout-plans/use-workout-plans.ts) — opzioni `UseWorkoutPlansOptions.skipWorkoutList`, export `wizardDataLoading`.
- Dettaglio: [`src/hooks/workout/use-workout-detail.ts`](src/hooks/workout/use-workout-detail.ts)
- DB: `workout_plans`, `workout_days`, `workout_day_exercises`, `workout_sets`

---

## Backlog opzionale

- Rigenerare tipi Supabase completi (MCP/script) quando lo schema si stabilizza.
- RPC transazionale `save_workout_plan_full` se servono ancora meno round-trip o atomicità forte.
- Duplicazione scheda: oggi ancora insert giorno-per-giorno (solo create/update sono batch).
