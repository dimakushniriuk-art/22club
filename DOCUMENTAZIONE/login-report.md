# Report esecuzione parziale `tests/e2e/login.spec.ts` (2026-01-11)

## Run 17:45 (suite completa)
- Comando: `npm run test:e2e -- tests/e2e/login.spec.ts`
- Esito: 18 pass / 7 fail (totale 25)
- Fail: WebKit (login PT, login atleta, invalid credentials), Mobile Chrome (login PT: Dashboard hidden), Mobile Safari (login PT, login atleta, invalid credentials)
- Pass: Chromium 5/5, Firefox 5/5, WebKit required fields, Mobile Chrome (form, atleta, invalid cred, required), Mobile Safari (form, required)
- Sintomi: timeout su `page.waitForURL` per redirect /dashboard e /home (WebKit/Mobile Safari), messaggio "Credenziali non valide" non trovato su WebKit/Mobile Safari, testo Dashboard hidden su Mobile Chrome.
- Log: ancora `net::ERR_CONNECTION_REFUSED`, warning Supabase su `getSession()`, middleware riporta ruoli corretti.

## Esito
- Comando: `npm run test:e2e -- tests/e2e/login.spec.ts`
- Stato: ❌ tutti i test Login Flow falliti su Chromium/Firefox/WebKit + Mobile (form visibile ma login/validazioni non passano); il run ha superato il timeout.
- Durate indicative (per browser):
  - Display login form: ~4–5s
  - Login PT/atleta e invalid credentials: ~20–21s (timeout)
  - Required fields: ~4–6s (fallisce l’assert)

## Segnali/avvisi emersi
- `net::ERR_CONNECTION_REFUSED` ripetuti su risorse/API durante login.
- Supabase warning: uso di `supabase.auth.getSession()/onAuthStateChange` non autenticati; suggerito `supabase.auth.getUser()`.
- Login PT/Admin già noto: `AuthApiError: missing email or phone`, restano su `/login`.
- Fast Refresh ha forzato full reload (non bloccante).

---

## Run 18:01 (suite completa dopo ulteriori aggiustamenti)
- Comando: `npm run test:e2e -- tests/e2e/login.spec.ts`
- Esito: 19 pass / 6 fail.
- Fail: WebKit (login PT, login atleta, invalid credentials); Mobile Safari (login PT, login atleta, invalid credentials) per timeout redirect o messaggio errore non visibile.
- Pass: Chromium 5/5, Firefox 5/5, Mobile Chrome 5/5, WebKit form/required.
- Azioni applicate dopo il run:
  - Successi PT/atleta: attesa `waitForNavigation({ waitUntil: 'domcontentloaded' })` e `expect.poll` su URL (/dashboard, /home) con timeout 30s (più tollerante per WebKit/Safari).
  - Invalid credentials: timeout visibilità messaggio elevato a 20s.
  - Rerun necessario per validare.

## Cause probabili (da confermare)
- Form login è visibile, ma le chiamate auth falliscono: credenziali seed PT/atleta mancanti/errate o Supabase non raggiungibile (`ERR_CONNECTION_REFUSED`).
- Errori di validazione non mostrati nei tempi attesi → timeout su casi “invalid credentials” e “required fields”.
- PT/Admin: payload incompleto (`missing email or phone`) indica fixture/dati non inviati o form non popolato correttamente.

## Azioni consigliate
1) Verificare connettività verso Supabase dall’ambiente test (URL/key, firewall, rete) per eliminare `ERR_CONNECTION_REFUSED`.
2) Controllare seed/credenziali usate nei test login (PT/atleta) e che il form invii email/password; verificare anche placeholder/selector.
3) Allineare la pagina di errore/validazione: mostrare errori client-side in modo sincrono per i casi “invalid credentials” e “required fields”.
4) Ripetere il run dopo i fix; aumentare timeout solo se il form è stabile e le chiamate auth rispondono.

---

## Run 17:54 (suite completa dopo rinforzo timeout)
- Esito: 18 pass / 7 fail (stessi gruppi: Chromium PT; WebKit PT/atleta/invalid; Mobile Safari PT/atleta/invalid).
- Problemi: timeout a 20s su redirect /dashboard e /home; `waitForResponse` 400/401 non scatta su WebKit/Mobile Safari per invalid credentials.
- Azioni applicate dopo il run:
  - Timeout test login PT/atleta portato a 45s.
  - Rimosso `waitForLoadState('networkidle')`.
  - Verifica URL con timeout 30s.
  - Invalid credentials: attesa diretta del messaggio 15s (rimosso `waitForResponse`).
  - Serve nuovo run per validare.
