# Fix Suite Login E2E (tests/e2e/login.spec.ts)

## Problemi rilevati
- Il global setup salva uno storageState (athlete/pt/admin) che causa redirect automatici a `/home` o `/dashboard` quando si visita `/login`, rendendo invisibili input e form.
- I test usavano il `page` del runner, quindi ereditavano lo storageState e andavano in timeout su `fill()` / `waitForURL`.
- Validazione HTML5 (`required`) bloccava il submit con campi vuoti, impedendo a `handleLogin` di mostrare gli errori custom.

## Soluzione applicata
1) Disabilitata la validazione HTML5 nativa:
   - `src/app/login/page.tsx`: `<form ... noValidate>`

2) Eseguiti i test in contesto anonimo senza storageState:
   - `tests/e2e/login.spec.ts`: helper `newAnonPage` crea un nuovo contesto con `storageState: { cookies: [], origins: [] }` e pulizia `localStorage/sessionStorage` via `addInitScript`; ogni test chiude il contesto.

## Cosa testare ora
Eseguire la suite completa login dopo il fix:
```bash
npm run test:e2e -- tests/e2e/login.spec.ts
```

## Atteso
- Nessun redirect automatico; il form è visibile in tutti i browser.
- I test di login PT/atleta/invalid credenziali completano senza timeout.
- La validazione “Email è richiesta” / “Password è richiesta” appare correttamente grazie alla validazione JS.

## Note
- Rimangono errori `ERR_CONNECTION_REFUSED` non bloccanti (agent logging); già mitigati con `isTestEnv`.
- I test login-roles restano da eseguire dopo questo step.
