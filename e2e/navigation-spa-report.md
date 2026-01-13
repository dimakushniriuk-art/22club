# Report esecuzione `tests/e2e/navigation-spa.spec.ts` (2026-01-11)

## Esito
- Comando: `npm run test:e2e -- tests/e2e/navigation-spa.spec.ts`
- Risultato: ✅ 40 test passati (Chromium/Firefox/WebKit + Mobile) in ~2.7m.

## Segnali/avvisi emersi
- `net::ERR_CONNECTION_REFUSED` ripetuti su risorse/API durante login e navigazioni: indica servizi esterni/host non raggiungibili; non ha bloccato il run ma va verificato.
- Supabase warning in middleware: uso di `supabase.auth.getSession()` / `onAuthStateChange()` considerato non autenticato; raccomandato `supabase.auth.getUser()`.
- Flusso PT e Admin: login fallito (`AuthApiError: missing email or phone` e `login failed - still on login page`), quindi i percorsi protetti per altri ruoli non sono stati coperti/validati in questo run.
- Messaggi “Link not visible, skipping” su alcune navigazioni: possibile UI nascosta (es. menu mobile/role-based) o selector non presente; i test hanno comunque completato.
- Next.js Fast Refresh ha forzato reload completo in alcune navigazioni (non bloccante).

## Note operative
- La navigazione SPA per il ruolo atleta sembra funzionare (tutti i test passati), ma la copertura per PT/Admin è assente per failure di login → richiede verifica credenziali/seed e form data.
- Indagare gli `ERR_CONNECTION_REFUSED` per evitare flakiness futura (controllare servizi esterni/mock).
