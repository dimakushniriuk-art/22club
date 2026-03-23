# SQL proposti RLS — **NON ESEGUIRE IN PRODUZIONE SENZA REVIEW**

Questi file **non** sono in `supabase/migrations`: non vengono applicati da CLI/CI automaticamente.

Copiare il contenuto in una migration numerata solo dopo approvazione e test su staging.

| File                                    | Scopo                                            |
| --------------------------------------- | ------------------------------------------------ |
| `appointment_cancellations_rls.sql`     | Chiude leak `true` su storico cancellazioni      |
| `appointments_delete_row_owner_rls.sql` | DELETE per owner `staff_id` / `trainer_id`       |
| `appointments_insert_athlete_rls.sql`   | Bozza INSERT atleta (da completare vincoli slot) |
