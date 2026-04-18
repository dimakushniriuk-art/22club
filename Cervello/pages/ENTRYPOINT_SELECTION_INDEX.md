# ENTRYPOINT_SELECTION_INDEX

## goal

- scegliere il miglior punto di ingresso prima della scan
- evitare aperture troppo larghe troppo presto
- privilegiare cartelle con business logic reale
- alzare la qualità dell’estrazione automatica verso Cervello

## preferred_entrypoints

- `src/lib/<dominio>/` (cartella con nome dominio)
- `src/hooks/<dominio>/` o hook raggruppati per dominio
- `src/app/api/<dominio>/` (superficie API legata al dominio)
- `src/components/...` moduli **specifici** (form / modal / calendario legati al dominio)
- `supabase/migrations` — solo se serve logica DB / schema / policy
- `scripts/` — solo per analisi o manutenzione esplicita

## avoid_as_first_entrypoint

- `src/components/shared`
- `src/components/ui`
- `src/app` root senza hint di dominio nel path
- `src/lib/utils` o helper generici
- hook UI generici in `src/hooks`
- `docs/`
- `public/`
- `tests/` — salvo richiesta esplicita

## ranking_rules

- `src/lib/<dominio>` — massimo
- `src/hooks/<dominio>` — alto
- cartella API dominio in `app/api` — alto
- componente dominio (modal / form / calendario) — medio
- solo `page.tsx` route — medio **se** orchestra logica (altrimenti basso)
- cartelle `shared` generiche — basso

## folder_quality_signals

- presenza di query / data fetching strutturato
- presenza di mutation / side effects dati
- validazione (schema, regole business)
- ricorrenza, overlap, scheduling
- risoluzione org / ruolo / profile
- cache invalidation, realtime, sync stato
- import verso servizi o hook di dominio

## weak_signals

- solo stili / classi
- solo rendering statico
- solo wrapper senza stato o effetti
- solo icone / costanti senza comportamento
- solo helper generici riusabili ovunque

## recursion_decision

- cartella **dominio-specifica** → scendere in profondità
- cartella che **mescola** più concern → separare per sottocartella / file
- cartella **generica** → fermarsi; scegliere un figlio più stretto
- cartella che **solo lega** lib/hooks → preferire scan della sorgente logica collegata

## scan_scope_rule

- partire dalla **cartella utile più piccola**
- espandere solo dopo aver stabilizzato la distribuzione moduli
- evitare scan full-dominio se un solo sottofolder basta
- preferire scan incrementali e mirate

## output_expectation

- dichiarare **dominio** inferito
- elencare **moduli probabili** (query, mutation, overlap, ecc.)
- definire il **prossimo target** di scan
- poi estrarre nel Cervello (indice leggero + moduli + context se serve)
