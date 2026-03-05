# Report esecuzione `tests/e2e/dynamic-routes.spec.ts` (2026-01-11)

## Esito
- Comando: `npm run test:e2e -- tests/e2e/dynamic-routes.spec.ts`
- Risultato: ✅ 40 test passati (Chromium/Firefox/WebKit + Mobile) in ~2.5m.

## Segnali/avvisi emersi
- `net::ERR_CONNECTION_REFUSED` ricorrenti durante login/navigazione (risorse/API esterne non raggiungibili); non ha bloccato i test ma è fonte di flakiness.
- Supabase warning: uso di `supabase.auth.getSession()` / `onAuthStateChange()` non autenticati; raccomandato `supabase.auth.getUser()` per dati autenticati.
- Login PT/Admin fallito (`AuthApiError: missing email or phone`, rimasti su `/login`) → i flussi di ruolo PT/Admin non sono coperti da questo run.
- Fast Refresh ha forzato full reload in almeno un punto (non bloccante).

## Note operative
- Copertura atleta OK per rotte dinamiche (prefetch, cache, error boundary, parametri).
- Serve abilitare/seedare credenziali PT/Admin e sistemare i dati form per validare anche quei ruoli.
- Indagare e mitigare gli `ERR_CONNECTION_REFUSED` per ridurre flakiness futura.
