# Testing — indice

Fonti: `audit/tests.txt` (estratti `tests/e2e`, `tests/unit`, `tests/integration`, `tests/security`), `audit/PROJECT_DOMAINS.md`, `audit/FEATURE_STATUS.md`.

## Playwright E2E (`tests/e2e/`)

Spec `.spec.ts` elencati in `audit/tests.txt` (non esaustivo se il tree cresce):

- `accessibility.spec.ts`, `allenamenti.spec.ts`, `appointments.spec.ts`, `athlete-home.spec.ts`, `athlete-registration-flow.spec.ts`, `chat-flow.spec.ts`, `clienti.spec.ts`, `complete.spec.ts`, `dashboard.spec.ts`, `documents.spec.ts`, `dynamic-routes.spec.ts`, `end-to-end.spec.ts`, `error-handling.spec.ts`, `final.spec.ts`, `integration.spec.ts`, `invita-atleta.spec.ts`, `login.spec.ts`, `login-roles.spec.ts`, `marketing-athletes-kpis.spec.ts`, `marketing-lead-convert.spec.ts`, `marketing-security-no-raw.spec.ts`, `mobile.spec.ts`, `navigation-spa.spec.ts`, `payment-lesson-counter-flow.spec.ts`, `performance.spec.ts`, `profile.spec.ts`, `realtime-memory-leak.spec.ts`, `regression.spec.ts`, `security.spec.ts`, `simple.spec.ts`, `smoke.spec.ts`, `stabilized-core-flows.spec.ts`, `statistics.spec.ts`, `user-journey.spec.ts`, `visual.spec.ts`

Setup / auth:

- `global-setup.ts`, `global-setup-auth.ts`, `helpers/auth.ts`, stati `.auth/*.json` (admin, athlete, pt)

Workflow CI: `.github/workflows/e2e-tests.yml` (citato in `tests.txt`).

## Vitest — unit (`tests/unit/`)

Esempi da `audit/tests.txt`: `analytics.test.ts`, `api.test.ts`, `api-routes.test.ts`, `cache-strategy.test.ts`, `components.test.tsx`, `dashboard-components.test.tsx`, `design-system.test.ts`, `middleware.test.ts`, `hooks.test.tsx`, `notifications.test.ts`, `realtime.test.ts`, `types.test.ts`, `utils.test.ts`, `zod-schema-validation.test.ts`, …

## Vitest — integration (`tests/integration/`)

- `auth-provider.test.tsx`, `chat-error-fallback.test.tsx`, `hooks.test.tsx`, `nested-routes-loading.test.tsx`, `realtime-cleanup.test.tsx`, `supabase-client.test.ts`, `supabase-client-lifecycle.test.tsx`

## Security

- `tests/security/athlete-profile-security.test.ts`

## Test accanto al codice

- `src/components/dashboard/__tests__/appointment-modal.test.tsx`
- `src/components/workout/__tests__/trainer-session-modal.test.tsx` (citati in `PROJECT_DOMAINS`)

## Aree coperte (da collegamento FEATURE_STATUS)

- Flussi core stabilizzati: `stabilized-core-flows.spec.ts` (login, redirect, ciclo appuntamenti trainer citato)
- Domini con spec dedicati: login, clienti, documenti, chat, marketing (sottoinsiemi), pagamenti (flusso contatore), allenamenti, profilo, statistiche, athlete-home, inviti

## Aree scoperte o deboli

- **Admin:** accesso smoke a `/dashboard/admin`; gran parte endpoint **non** coperta E2E (`FEATURE_STATUS`)
- **Onboarding:** poche page object dedicate
- **Nutrizionista:** sottopagine non tutte elencate con E2E dedicato
- **Reset/registrazione:** **da verificare** copertura completa
- **WebKit/mobile:** riserva citata per login (`FEATURE_STATUS`)

## Criticità test

- Dipendenza da ambiente Supabase / RLS / dati seed per E2E realistici
- Snapshot visual: directory `visual.spec.ts-snapshots/` (piattaforma win32 in nomi file)

## Priorità future (da `FEATURE_STATUS` / domini)

- Alta: appuntamenti/calendario (allineamento overlap), pagamenti, RBAC Capacitor
- Media: comunicazioni, chat, notifiche push, marketing ampliato
- Bassa: progressi (mock), impostazioni duplicate
