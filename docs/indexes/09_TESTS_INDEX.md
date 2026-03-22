# Indice test

- **Lista:** `audit/tests_clean.txt`
- **E2E Playwright:** `tests/e2e/*.spec.ts` (login, dashboard, documents, marketing, chat, mobile, …)
- **Integration:** `tests/integration/*` (auth-provider, supabase client, realtime cleanup, …)
- **Unit:** `tests/unit/*`, `src/hooks/**/__tests__/*`
- **Security:** `tests/security/athlete-profile-security.test.ts`
- **Config:** `playwright.config.ts`, `vitest.config.ts`

Dopo fix build: eseguire almeno `documents.spec.ts` per batch documenti.
