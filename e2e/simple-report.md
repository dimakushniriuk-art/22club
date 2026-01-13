# Report esecuzione `tests/e2e/simple.spec.ts` (2026-01-11)

## Esito

- Comando: `npm run test:e2e -- tests/e2e/simple.spec.ts`
- Risultato: ✅ 10 test passati (Chromium/Firefox/WebKit + Mobile Chrome/Safari) in ~1.8m.

## Segnali/avvisi emersi in console

- `Failed to load resource: net::ERR_CONNECTION_REFUSED` (ripetuto) durante la fase di login/API: possibile configurazione host/servizi esterni non raggiungibili.
- Messaggi Supabase middleware: warning sull'uso di `supabase.auth.getSession()` / `onAuthStateChange()` non autenticati → suggerito uso di `supabase.auth.getUser()` per dati autenticati.
- Admin flow (log paralleli): `AuthApiError validation_failed: missing email or phone`, e `Admin login failed - still on login page after 8 seconds` → il ramo admin nello script/fixture non riesce a loggarsi (dati mancanti o URL non raggiungibile).
- Next.js Fast Refresh full reload durante navigazione `/home` (non blocca il test ma indica HMR non incrementale).

## Considerazioni

- I test semplici passano: routing di base e interazioni minime funzionano.
- Gli errori di connessione e l'admin login fallito indicano che il backend/auth potrebbe non essere configurato (o servizi bloccati in test). Da verificare prima di rifare gli smoke login/navigazione.
