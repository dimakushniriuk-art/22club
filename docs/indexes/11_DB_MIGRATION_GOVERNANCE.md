# DB Migration Governance

## Scopo

- Rendere il repository la fonte tracciata di ogni modifica database.
- Evitare modifiche manuali su Supabase non replicate nel repo.

## Fonte canonica

- **Cartella migration ufficiale:** `supabase/migrations/`.
- **Canonico:** solo SQL versionato in `supabase/migrations/` (ordine per nome file).
- **Riferimento/non canonico operativo:** dump, export, audit e SQL root (es. `supabase-backups/*.sql`, `backup_supabase.sql`, `supabase_rls_*.sql`, `audit/rls/sql_proposto/*`, `DOCUMENTAZIONE/*`).

## Stato reale del repo

- **Presenze DB principali:** `supabase/config.toml`, `supabase/migrations/*`, `supabase/functions/*`, SQL root `supabase_*.sql`, backup in `supabase-backups/*.sql`.
- **Naming migration osservato:** prevale `YYYYMMDDHHMMSS_slug.sql`; presenti anche file con data corta (`YYYYMMDD_slug.sql`).
- **Materiale legacy/sospetto (non fonte runtime):** script SQL root non in migrations, dump completi, piani audit RLS, note operative storiche.

## Regole operative

- Ogni modifica DB (schema, RLS, funzioni, trigger, indici) passa da una migration in `supabase/migrations/`.
- Flusso unico: **analisi -> migration -> verifica -> deploy**.
- Vietate modifiche dirette permanenti in produzione senza file di migration nel repo.
- Se serve hotfix urgente su dashboard/SQL editor: aprire subito migration equivalente e allineare repo prima della chiusura attività.
- Nessuna modifica DB fuori da convenzione cartelle/naming.

## Convenzione naming migration

- Convenzione adottata da ora: `YYYYMMDDHHMMSS_<descrizione_snake_case>.sql`.
- Regole:
  - timestamp UTC a 14 cifre;
  - descrizione breve orientata all’intento;
  - un’unica responsabilità per file.
- Esempi reali presenti:
  - `20260318143000_appointments_rls_cleanup_v1.sql`
  - `20260318144500_check_open_slot_capacity_from_settings.sql`
  - `20250308000000_calendario_full.sql`

## Checklist pre-migration

- Problema DB definito in modo esplicito.
- Impatto su tabelle/policy/funzioni noto.
- Verifica assenza duplicati (policy/helper/funzioni già esistenti).
- Allineamento con fonti canoniche (`supabase/migrations/`, `audit/CANONICAL_SOURCES.md`).
- Rischio e rollback ragionati prima della scrittura SQL.

## Checklist post-migration

- Review SQL completata (sintassi + impatto).
- Verifica locale/staging se disponibile.
- Conferma comportamento atteso su query/permessi coinvolti.
- Aggiornamento index/documentazione minima se cambia governance o perimetro DB.

## Regole speciali RLS

- Non introdurre policy duplicate o semanticamente sovrapposte.
- Naming policy chiaro e coerente con tabella/azione.
- Helper SQL riusabili ammessi solo se centrali e non ridondanti.
- Allineare sempre comportamento frontend con regole DB effettive.
- Non usare policy/funzioni DB per coprire bug applicativi che vanno risolti nel codice.

## Cosa NON fare

- Patch manuali permanenti solo da dashboard Supabase.
- Duplicare funzioni helper con stesso scopo.
- Lasciare file SQL orfani fuori da `supabase/migrations/` per cambi runtime.
- Introdurre fallback dati per mascherare problemi di modello.
- Modificare schema senza tracciamento versionato.

## Gap aperti apposta

- Consolidare nel tempo i file SQL root legacy (`supabase_*.sql`) in migrazioni tracciate dove realmente attivi.
- Verificare allineamento completo tra DB remoto attuale e cronologia `supabase/migrations/`.
- Normalizzare definitivamente il naming storico non uniforme (solo da questo punto in avanti).
- Pulizia documentazione audit/legacy fuori scope di questo step.
