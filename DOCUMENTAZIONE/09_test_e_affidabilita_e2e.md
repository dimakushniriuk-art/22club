# 🧪 09 - Test e Affidabilità E2E

> **Analisi suite Playwright e affidabilità test**

---

## 📊 PANORAMICA TEST

### Configurazione Playwright

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 20 * 1000, // 20s per test
  expect: { timeout: 3000 }, // 3s per assertion
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,

  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'Mobile Chrome', use: devices['Pixel 5'] },
    { name: 'Mobile Safari', use: devices['iPhone 12'] },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    timeout: 180 * 1000, // 3 minuti startup
  },
})
```

---

## 📁 STRUTTURA TEST

```
tests/
├── e2e/                    # Test End-to-End (38 file)
│   ├── .auth/             # Storage autenticazione
│   │   ├── admin-auth.json
│   │   ├── pt-auth.json
│   │   └── athlete-auth.json
│   │
│   ├── helpers/
│   │   └── auth.ts        # Credenziali e utilities
│   │
│   ├── login.spec.ts           # ⚠️ 18/25 pass
│   ├── login-roles.spec.ts     # ⚠️ 14/20 pass
│   ├── dashboard.spec.ts       # ✅ 15/15 pass
│   ├── smoke.spec.ts           # ✅ Pass
│   ├── simple.spec.ts          # ✅ Pass
│   ├── dynamic-routes.spec.ts  # ✅ Pass
│   ├── navigation-spa.spec.ts  # ✅ Pass
│   ├── accessibility.spec.ts
│   ├── allenamenti.spec.ts
│   ├── appointments.spec.ts
│   ├── athlete-home.spec.ts
│   ├── clienti.spec.ts
│   ├── documents.spec.ts
│   ├── integration.spec.ts
│   ├── invita-atleta.spec.ts
│   ├── performance.spec.ts
│   ├── security.spec.ts
│   └── ...
│
├── integration/           # Test integrazione (8 file)
│   ├── auth-provider.test.tsx
│   ├── supabase-client.test.ts
│   └── ...
│
├── unit/                  # Test unitari (28 file)
│   ├── middleware.test.ts
│   ├── analytics.test.ts
│   └── ...
│
├── security/              # Test sicurezza (2 file)
│   └── athlete-profile-security.test.ts
│
├── fixtures/              # Dati test
│   ├── mock-data.ts
│   └── sample-document.pdf
│
└── __mocks__/             # Mock per test
    ├── supabaseClient.ts
    └── next-navigation.ts
```

---

## 🎯 STATO TEST PER SUITE

### Login Suite (login.spec.ts)

| Test          | Chromium | Firefox | WebKit | Mobile Chr | Mobile Saf |
| ------------- | -------- | ------- | ------ | ---------- | ---------- |
| Display form  | ✅       | ✅      | ✅     | ✅         | ✅         |
| Login PT      | ✅       | ✅      | ❌     | ✅         | ❌         |
| Login athlete | ✅       | ✅      | ❌     | ✅         | ❌         |
| Invalid creds | ✅       | ✅      | ❌     | ✅         | ❌         |
| Validation    | ✅       | ✅      | ✅     | ✅         | ✅         |

**Problema WebKit/Safari**: Cookie secure su HTTP blocca sessione

### Login Roles Suite (login-roles.spec.ts)

| Test             | Chromium | Firefox | WebKit | Mobile Chr | Mobile Saf |
| ---------------- | -------- | ------- | ------ | ---------- | ---------- |
| Admin redirect   | ✅       | ✅      | ❌     | ✅         | ❌         |
| PT redirect      | ✅       | ✅      | ❌     | ✅         | ❌         |
| Athlete redirect | ✅       | ✅      | ❌     | ✅         | ❌         |
| Test role        | ✅       | ✅      | ✅     | ✅         | ✅         |

### Dashboard Suite (dashboard.spec.ts)

| Test           | Tutti Browser |
| -------------- | ------------- |
| Load dashboard | ✅            |
| Navigate stats | ✅            |
| Sidebar exists | ✅            |

---

## ⚠️ PROBLEMI NOTI

### 1. WebKit/Safari Cookie Issue - ✅ DECISIONE DEFINITIVA

```
Problema: Safari blocca cookie Secure su HTTP (localhost)
Impatto: Login via form non funziona in dev
Soluzione: SKIP PERMANENTE per test auth su Safari/WebKit

DECISIONE (2026-01-13):
├── Browser gate CI: Chromium + Firefox
├── WebKit/Mobile Safari: Skip test auth
├── Motivo: Cookie Secure non funziona su HTTP (limitazione tecnica)
├── Produzione: Safari funziona correttamente (HTTPS)
└── Riferimento: playwright.config.ts (commento dettagliato)

Status: ✅ RISOLTO - Skip documentato e applicato
```

### 2. Timeout su Redirect

```
Problema: waitForURL timeout dopo login
Browser: Principalmente WebKit/Mobile Safari
Causa: AuthProvider carica profilo async
Fix applicato: expect.poll con timeout 40s
Status: ✅ Mitigato
```

### 3. Debug Logging ERR_CONNECTION_REFUSED - ✅ RISOLTO

```
Problema: fetch a localhost:7242 fallisce
Impatto: Log rumorosi, non bloccante
Fix: RIMOSSO tutto il debug logging (2026-01-13)
Status: ✅ RISOLTO - Nessun fetch a localhost:7242 nel codice
```

---

## 📋 BEST PRACTICES IMPLEMENTATE

### Context Pulito per Test

```typescript
// Ogni test crea contesto anonimo
const context = await browser.newContext({
  storageState: { cookies: [], origins: [] },
})
await context.addInitScript(() => {
  localStorage.clear()
  sessionStorage.clear()
})
```

### Attesa Robusta

```typescript
// Invece di waitForURL semplice
await expect.poll(async () => page.url(), { timeout: 40000 }).toContain('/dashboard')
```

### Skip Browser Problematici

```typescript
test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP blocca cookie Secure')
```

---

## 📊 METRICHE AFFIDABILITÀ

| Browser       | Pass Rate | Note          |
| ------------- | --------- | ------------- |
| Chromium      | ~95%      | Affidabile    |
| Firefox       | ~95%      | Affidabile    |
| WebKit        | ~60%      | Cookie issues |
| Mobile Chrome | ~90%      | Buono         |
| Mobile Safari | ~60%      | Cookie issues |

### Test Flaky Identificati

| Test                       | Causa                  | Mitigazione       |
| -------------------------- | ---------------------- | ----------------- |
| Login PT/athlete su Safari | Cookie Secure          | Skip              |
| Dashboard load             | Timeout variabile      | Timeout aumentato |
| Invalid credentials        | Messaggio non visibile | Timeout aumentato |

---

## 📊 VALUTAZIONE

| Aspetto             | Rating    | Note                  |
| ------------------- | --------- | --------------------- |
| Chiarezza logica    | ★★★★☆     | Struttura organizzata |
| Robustezza          | ★★★☆☆     | Browser issues        |
| Debito tecnico      | **MEDIO** | Skip Safari necessari |
| Rischio regressioni | **MEDIO** | Alcuni test flaky     |

---

## 🎯 RACCOMANDAZIONI

### Priorità Alta

1. ✅ WebKit/Safari: Skip permanente documentato (2026-01-13)
2. Ridurre dipendenza da timeout lunghi
3. Centralizzare utilities test

### Priorità Media

1. Aggiungere test per aree non coperte
2. Implementare visual regression test
3. Migliorare coverage report

### Priorità Bassa

1. Test performance più robusti
2. Test accessibilità estesi
3. Test multi-lingua
