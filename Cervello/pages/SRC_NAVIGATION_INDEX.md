# SRC_NAVIGATION_INDEX

## goal

- mappare `src/` in modo ricorsivo (non full-scan monolitico)
- dare priorità alla logica di business
- separare UI da core logic
- supportare estrazione incrementale verso Cervello (moduli + contesto dominio)

## src_roots

- `src/app` — route, page, layout, server actions, wiring API
- `src/components` — UI e interazione
- `src/hooks` — stato client, query, form, orchestrazione
- `src/lib` — logica core, servizi, query helper, utils di dominio
- `src/providers` — wiring globale / context
- `src/actions` — server actions o azioni di dominio
- `src/types` — contratti e modelli condivisi

## priority_order

- `lib` — massima
- `hooks` — alta
- `actions` — alta
- `app` — alta se contiene binding route/API o logica non solo presentazionale
- `components` — media
- `providers` — media
- `types` — riferimento (lettura mirata)

## recursive_rules

- entrare prima in `lib/`
- poi `hooks/`
- poi `app/` per binding route/API
- `components/` solo se non è solo presentazionale
- fermarsi se la cartella è generica o solo visuale
- preferire cartelle con nome di dominio rispetto a `shared` generici

## route_rules

- `app/**/page.tsx` — entrypoint feature
- `app/api/**` — superficie endpoint
- `layout.tsx` / provider in tree — wiring runtime condiviso
- il file route da solo non basta: seguire import verso `lib` / `hooks` quando servono decisioni o dati

## component_rules

- estrarre solo se: form, mutazioni, validazione, orchestrazione calendario, condizioni di business
- ignorare wrapper puramente presentazionali
- modali / form / tabelle / calendari — spesso rilevanti

## hook_rules

- spesso: fetch, orchestrazione, query keys, realtime, stato derivato
- hook di dominio — scansione profonda
- hook UI generici — di solito ignorare

## lib_rules

- fonte primaria della business logic
- cercare: query, mutation, validatori, ricorrenza, overlap, mapping, cache invalidation
- sottocartelle con nome dominio — ricorsione approfondita

## domain_path_hints

- appointments — calendario, booking slot, ricorrenza, overlap
- workouts — scheda, esercizio, sessione allenamento
- athletes — atleta, profilo, progressi, clienti
- payments — pagamenti, billing, abbonamenti, subscription
- communications — email, template, notifiche, chat
- analytics — statistiche, metriche, dashboard, report
- auth — login, invite, sessione, profilo, ruolo
- system — middleware, provider, config, query-keys, infra condivisa

## extraction_path_strategy

- dedurre dominio da nome cartella/file
- dedurre modulo da tipo di logica (query, mutation, overlap, ecc.)
- aggiornare Cervello per modulo, in passaggi
- evitare scansione completa di `src` in un solo passaggio

## brain_write_rule

- indice di dominio leggero
- dettagli nei file modulo dedicati
- contesto trasversale in `*_context` / `domain_context` (nomenclatura esistente nel Cervello)
