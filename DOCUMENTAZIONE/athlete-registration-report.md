# Report esecuzione parziale `tests/e2e/athlete-registration-flow.spec.ts` (2026-01-11)

## Esito
- Comando: `npm run test:e2e -- tests/e2e/athlete-registration-flow.spec.ts`
- Stato: ❌ run terminato per timeout; tutti i casi falliti (Chromium/Firefox/WebKit + Mobile) con durate ~20–21s.
- Dettagli tempi (15:40):
  - Chromium: invito 20.8s, registrazione 20.8s, profilo 21.0s, lista clienti 20.9s
  - Firefox: ~20.2s tutti i casi
  - WebKit: ~20.4–20.5s tutti i casi
  - Mobile Chrome: ~20.3s tutti i casi
  - Mobile Safari: ~20.5–20.7s tutti i casi

## Segnali/avvisi emersi
- `net::ERR_CONNECTION_REFUSED` ricorrenti durante login e navigazione.
- Supabase warning: uso `supabase.auth.getSession()/onAuthStateChange` non autenticati; raccomandato `supabase.auth.getUser()`.
- Login PT/Admin continua a fallire con `AuthApiError: missing email or phone` (dati non inviati/seed mancanti).
- Fast Refresh reload sporadico (non bloccante).

## Cause probabili
- Autenticazione fallita → l’intero flusso (invito, registrazione, profilo) non parte.
- Credenziali seed PT/atleta non disponibili o non passate dal test; backend auth non raggiungibile (`ERR_CONNECTION_REFUSED`).
- Eventuali dati di invito/codice non presenti nel DB di test a causa del fallimento login PT.

## Azioni consigliate
1) Stabilizzare login: connettività Supabase e chiavi corrette; seed utenti PT/atleta/admin; assicurare che il test invii email/password (evitare `missing email or phone`).
2) Verificare la presenza di codici invito/fixture nel DB prima del test; se necessario, creare setup (seed) nel test o con script di precondizione.
3) Ripetere il run dopo aver risolto login/seed; solo dopo valutare estensioni di timeout.
