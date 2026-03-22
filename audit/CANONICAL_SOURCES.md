# Fonti canoniche (codice e indici)

## Codice vivo (modificabile)
- `src/app/` — App Router (pagine, layout, API `src/app/api/**/route.ts`)
- `src/components/`
- `src/hooks/`
- `src/lib/` (supabase: `client.ts`, `server.ts`, `middleware.ts`, `types.ts`)
- `src/types/` + `src/types/supabase.ts` (tipi dominio; DB generato: `src/lib/supabase/types.ts`)
- `e2e/` → reale path progetto: `tests/e2e/`
- `tests/unit`, `tests/integration`, `tests/security`
- `supabase/migrations/` — schema/RLS (verità DB lato repo)

## Indici macchina (rigenerabili)
- `audit/*_clean.txt` — liste filtrate (componenti, hook, API, route page, tipi, test, auth map, data access, todo)
- `audit/tree.txt`, `audit/files.txt` — snapshot albero (può includere `.next`: non usare come elenco codice)

## Documentazione umana canonica
- `DOCUMENTAZIONE/00_indice_dati_progetto.md` — indice dati
- `DOCUMENTAZIONE/01_architettura_generale.md` … `12_suggerimenti_prioritizzati.md`
- `DOCUMENTAZIONE/SCHEMA-SOURCE-OF-TRUTH.md` o `DATABASE_SCHEMA_REFERENCE.md` (incrociare con migrations)
- `src/app/design-system/GUIDA_DESIGN_SYSTEM.md` — obbligo per `/design-system`

## Secondario / storico (non cancellare; non assumere verità unica)
- Centinaia di file in `DOCUMENTAZIONE/` (PAGE_AUDIT, RESOCONTO, ISTRUZIONI, FIX puntuali)
- `project_memory/`, `project_tracker/`, `__project_logic_docs__/` — **vietato modificare**

## Duplicazioni logiche note
- Tipi DB: `src/lib/supabase/types.ts` vs re-export `src/types/supabase.ts` — usare uno come entry (preferenza: tipi generati in `lib/supabase/types.ts`)
- Accesso dati: client diretto in pagine/hook + API route + `data_access_map_clean` — stessa tabella da N entrypoint
- Relazioni atleta-trainer: `athlete_trainer_assignments`, `trainer_athletes`, sync API `clienti/sync-pt-atleti` — documentato in migrazioni e audit admin
