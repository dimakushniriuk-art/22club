# Runbook operativo 22Club

Riferimento rapido per deploy, ambiente, osservabilità e comportamenti noti. Dettaglio upload: `PUBLISH_PLAN.md` e regole progetto (comando `npm run upload`).

## Deploy e Git

- **Produzione Vercel:** `npm run upload -- "messaggio commit"` dalla root (commit se ci sono modifiche, push, `vercel --prod`).
- **Solo Git:** `npm run upload -- "msg" --no-vercel`.
- **Commit locale senza push:** `--no-push`.

## Variabili d’ambiente (estratto tipico)

- **Supabase:** URL e chiavi anon/service role come da dashboard progetto; allineare locale `.env.local` e Vercel.
- **Sentry:** DSN client (e server se usato); release legata al deploy Vercel quando configurata.
- Non committare segreti; verificare che i preview deploy abbiano env minime per smoke.

## Sentry (client)

- Inizializzazione in `src/instrumentation-client.ts`.
- **Consenso cookie** (`22club-cookie-preferences`, v1): replay, transaction trace e log strutturati solo se `analytics === true`.
- In **produzione** i sample rate sono più bassi che in dev (riduce volume e costi).
- Dopo cambio consenso analitica può essere necessario un reload (gestito dal banner).

## Cookie e privacy

- Storage: `src/lib/cookie-consent-storage.ts` (`COOKIE_PREFS_STORAGE_KEY`).
- UI globale: `CookieConsent` in root layout; modale con focus trap e Esc.
- **Aprire preferenze da altre pagine:** `requestOpenCookiePreferences()` o componente `CookiePreferencesSettingRow`.
- Policy: `/privacy#cookie-policy`.

## Autenticazione e rate limit

- Errori **429** da Supabase Auth: backoff lato client dove implementato; in caso di loop, verificare IP/proxy e quote progetto.
- Sessione scaduta: redirect verso `/login` con query `reason` (vedi `LoginCard` / middleware).

## Rete e UX

- `use-user-settings`: salvataggi con `withNetworkRetry` (`src/lib/network-retry.ts`) su errori transitori.
- **Mobile nav staff:** Link verso `/dashboard/comunicazioni` e `/dashboard/database` con `prefetch={false}` per ridurre prefetch pesanti.

## Capacitor (app native)

- Build web aggiornata prima di sync: `npm run build` (o flusso documentato nel repo Capacitor).
- Verificare `origin` / deep link e che env puntino all’API/Supabase corretti per l’ambiente (staging vs prod).

## Test E2E

- Playwright: `tests/e2e/` (es. `cookie-consent.spec.ts` per banner e chiusura).
- Auth state: `tests/e2e/.auth/*` dopo global setup dove previsto.

## Controlli prima del rilascio

- `npm run check` (o typecheck + lint + build come da `package.json`).
- Smoke manuale: login, una route staff, consenso cookie se ambiente pulito.
