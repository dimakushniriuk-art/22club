# Piano intervento E2E – Smoke Tests (2026-01-11)

## Sintesi esito

- Comando: `npm run test:e2e -- tests/e2e/smoke.spec.ts`
- Risultato: 45 test falliti, 5 passati.
- Pattern: timeouts su `input[name="email"]` in login per tutte le piattaforme; assert 404 assente; redirect protected routes bloccato in attesa di URL.

## Problemi principali (priorità)

1. **Login form non individuabile (critico)**
   - Timeout su `page.fill('input[name="email"]')` e password in ogni browser/device.
   - Probabili cause: attributi `name` diversi/assenti, form non renderizzato (runtime error/redirect), feature flag auth.
2. **Credenziali/seed/ambiente (critico)**
   - Utenti test: `pt@example.com`, `atleta@example.com`, password `123456`.
   - Verificare esistenza/seed su DB di test, chiavi Supabase, porta app (`http://localhost:3001`), eventuali redirect.
3. **Protected routes (alta)**
   - Redirect a `/login?redirectedFrom=%2Fdashboard` avviene ma `waitForURL` va in timeout; forse serve attesa su `**/login*` con stato `networkidle` o assert testo “Accedi”.
4. **Pagina 404 (media)**
   - Expect `getByText('404')` fallisce: aggiungere headline/aria-label “404” o aggiornare l’assert al contenuto reale.

## Azioni raccomandate (ordine)

1. Ispezionare `/login`: confermare markup e aggiungere `name="email"` / `name="password"` coerenti con i test (o allineare i test). Controllare errori console/Network.
2. Verificare seed credenziali e configurazione ambiente di test (Supabase URL/key, dati utenti). Garantire che la pagina mostri il form non autenticato.
3. Correggere pagina 404 con testo visibile “404” (o modificare expectation nei test).
4. Sistemare attesa redirect per protected routes dopo il fix login (uso `waitForURL('**/login**')` + assert sul form).

## Note su timeout

- I 20s di timeout sono sintomo di selector mancante/non render: evitare di aumentare finché i problemi di base non sono risolti.
