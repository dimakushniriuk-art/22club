# Report esecuzione parziale `tests/e2e/login-roles.spec.ts` (2026-01-11)

## Esito
- Comando: `npm run test:e2e -- tests/e2e/login-roles.spec.ts`
- Stato: ❌ run abortito; tutti i casi ruolo (ADMIN/PT/ATLETA/TEST) falliscono sui redirect attesi su Chromium/Firefox/WebKit + Mobile.
- Durate indicative (riportate dal run delle 15:34):
  - Chromium: ADMIN/PT/ATLETA/TEST ~20.1s (timeout)
  - Firefox: ADMIN 8.3s, PT 9.2s, ATLETA 3.2s, TEST 8.7s (falliti)
  - WebKit: ADMIN/PT ~3.9s, ATLETA 4.0s, TEST 5.1s (falliti)
  - Mobile Chrome: ADMIN/PT/ATLETA ~5.5–5.6s, TEST 6.6s (falliti)
  - Mobile Safari: ADMIN/PT/ATLETA ~3.9–4.1s, TEST 4.9s (falliti)

## Segnali/avvisi emersi
- `net::ERR_CONNECTION_REFUSED` ricorrenti durante login/navigazione.
- Supabase warning: uso `supabase.auth.getSession()/onAuthStateChange` non autenticati; raccomandato `supabase.auth.getUser()`.
- Login PT/Admin: `AuthApiError: missing email or phone` → payload incompleto o credenziali non passate dal test/fixture.
- Redirect non avvengono: gli utenti non risultano autenticati/redirectati; timeout a 20s.
- Fast Refresh reload sporadico (non bloccante).

## Cause probabili
- Credenziali seed mancanti/errate per ADMIN/PT/ATLETA o variabili Supabase non raggiungibili (`ERR_CONNECTION_REFUSED`).
- Fixture di login che non invia email/password corretti (errore “missing email or phone”).
- Possibile mismatch selectors? (il form è “loaded and ready”, quindi più probabile problema di backend/auth).

## Azioni consigliate
1) Verificare connettività Supabase e chiavi in ambiente test per eliminare `ERR_CONNECTION_REFUSED`.
2) Controllare e (se serve) seedare le credenziali degli utenti ADMIN/PT/ATLETA usate dal test; assicurarsi che il test compili il payload corretto.
3) Dopo i fix, ripetere il run; solo dopo rendere più permissivi i timeout se necessario.
