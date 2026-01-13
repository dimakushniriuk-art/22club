# Fix Applicati - Problemi E2E (2026-01-11)

## Riepilogo Fix

### ✅ Fase 1: Attributi form login (COMPLETATO)
- **File modificato**: `src/app/login/page.tsx`
- **Modifiche**:
  - Aggiunto `name="email"` all'input email (linea ~201)
  - Aggiunto `name="password"` all'input password (linea ~217)
- **Test target**: `smoke.spec.ts`, `login.spec.ts`, `login-roles.spec.ts`, `athlete-registration-flow.spec.ts`
- **Status**: ✅ Completato

### ✅ Fase 2: Allineamento credenziali (COMPLETATO)
- **File modificati**:
  - `tests/e2e/smoke.spec.ts` - Aggiornato con credenziali corrette
  - `tests/e2e/login.spec.ts` - Aggiornato con credenziali corrette
  - `tests/e2e/login-roles.spec.ts` - Aggiornato con credenziali corrette
  - `tests/e2e/athlete-registration-flow.spec.ts` - Aggiornato con credenziali corrette
- **Credenziali usate**:
  - Admin: `admin@22club.it` / `adminadmin` → redirect `/dashboard`
  - Trainer: `alessandro@22club.it` / `Alessandro` → redirect `/dashboard`
  - Trainer alternativo: `b.francesco@22club.it` / `FrancescoB` → redirect `/dashboard`
  - Atleta: `dima.kushniriuk@gmail.com` / `Ivan123` → redirect `/home`
- **Status**: ✅ Completato

### ✅ Fase 3: Pagina 404 (COMPLETATO)
- **File creato**: `src/app/not-found.tsx`
- **Contenuto**: Pagina 404 custom con testo "404" visibile e link per tornare alla home
- **Test target**: `smoke.spec.ts:88`
- **Status**: ✅ Completato

### ✅ Fase 4: Protected routes timeout (COMPLETATO)
- **File modificato**: `tests/e2e/smoke.spec.ts:93`
- **Modifica**: Cambiato `waitForURL('**/login')` in `waitForURL('**/login*')` per gestire query params
- **Status**: ✅ Completato

### ✅ Fase 5: Validazione form errori (COMPLETATO)
- **File modificato**: `src/app/login/page.tsx`
- **Modifiche**:
  - Aggiunto stato `validationErrors` per gestire errori client-side
  - Aggiunta validazione esplicita in `handleLogin` che controlla email e password vuoti
  - Aggiunti messaggi di errore visibili sotto gli input: "Email è richiesta" e "Password è richiesta"
- **Test target**: `login.spec.ts:42`
- **Status**: ✅ Completato

### ✅ Fase 6: ERR_CONNECTION_REFUSED (COMPLETATO)
- **File modificato**: `src/app/login/page.tsx`
- **Modifiche**:
  - Aggiunto check `isTestEnv` per disabilitare agent logging durante test E2E
  - Tutti i fetch a `http://127.0.0.1:7242/ingest/...` sono ora condizionati da `!isTestEnv`
  - Check basato su hostname localhost + user agent Playwright/HeadlessChrome
- **Status**: ✅ Completato

## Prossimi Passi

1. **Eseguire test mirati** per verificare che i fix funzionino:
   - `npm run test:e2e -- tests/e2e/smoke.spec.ts:9` (login form)
   - `npm run test:e2e -- tests/e2e/smoke.spec.ts:88` (404 page)
   - `npm run test:e2e -- tests/e2e/smoke.spec.ts:93` (protected routes)
   - `npm run test:e2e -- tests/e2e/login.spec.ts:42` (validazione)
   - `npm run test:e2e -- tests/e2e/login.spec.ts` (tutti i test login)
   - `npm run test:e2e -- tests/e2e/login-roles.spec.ts` (redirect per ruoli)

2. **Documentare risultati** dopo ogni test eseguito

3. **Eseguire suite completa** dopo verifica fix individuali
