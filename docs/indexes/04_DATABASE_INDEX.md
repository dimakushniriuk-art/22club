# Indice database

- **Migrazioni canoniche:** `supabase/migrations/*.sql`
- **Script root vari:** `supabase_*.sql`, `backup_supabase.sql` — operativi/storici, non sostitutivi delle migrations
- **Tipi generati:** `src/lib/supabase/types.ts`
- **Doc:** `DOCUMENTAZIONE/07_database_supabase_e_rls.md`, `SCHEMA-SOURCE-OF-TRUTH.md`

Path correlati (grep accessi): `audit/data_access_map_clean.txt` (migliaia di righe — usare per ricerca per tabella).

Tabelle ad alto traffico da indizi audit: `profiles`, `appointments`, `documents`, `payments`, `communications`, `athlete_trainer_assignments`, `trainer_athletes`, tabelle marketing (leads, segments, …).
