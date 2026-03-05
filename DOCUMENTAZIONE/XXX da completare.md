# XXX da completare — Stato progetto

**Data:** 2025-01-31  
**Repo:** 22club-setup V1 online  
**Ambiente:** Windows 10 (win32 10.0.26100)  
**Node/Pnpm/Npm:** Node 20 (da package.json engines), npm (package-lock.json presente)  
**Note:** Analisi completa repository - Senior Full-Stack + QA + DevOps

---

## 0) Executive Summary (max 15 righe)

**Stato attuale:** Progetto Next.js 15.5.9 con TypeScript strict, Supabase (PostgreSQL + Auth + Storage), Tailwind CSS 4, App Router. Struttura modulare: dashboard trainer/admin (`/dashboard/*`), home atleti (`/home/*`), auth middleware con redirect basato su ruolo. Test suite presente (Vitest unit + Playwright E2E). 146 migrazioni DB SQL. Stack: React 19, TanStack Query, Radix UI, FullCalendar, Recharts. **STEP 2 completato:** Dipendenze installate (1487 packages), `.env.local` creato, typecheck OK, lint OK, dev server avviato (verifica risposta in corso).  
**Bloccanti (P0):** Nessuno al momento. Dev server in verifica.  
**Rischi:** 16 vulnerabilità npm (14 moderate, 2 high), Node version mismatch (25.1.0 vs richiesto 20), configurazione env Supabase da completare, migrazioni DB da applicare (146 file), RLS policies da verificare (problemi noti da docs).  
**Next milestone consigliata:** STEP 3 completato (lint/typecheck OK). Prossimo: STEP 4 - Tests, STEP 5 - Build & Run Prod, STEP 6 - Controlli da gestionale/web app.

---

## 1) Come avviare il progetto (verified)

**Prerequisiti:** Node 20, npm, Supabase CLI (opzionale per local dev)  
**Install:** `npm install`  
**Env:** Copiare `env.example` → `.env.local` e configurare variabili Supabase  
**Run dev:** `npm run dev` (porta 3001)  
**Build:** `npm run build`  
**Test:** `npm run test:run` (unit), `npm run test:e2e` (E2E)  
**Problemi noti:** Da verificare durante esecuzione

---

## 2) Mappa del progetto

**Albero cartelle (high level):**

```
22club-setup/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard trainer/admin
│   │   ├── home/         # Home atleti
│   │   ├── login/        # Auth pages
│   │   └── ...
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── ui/           # UI primitives (Radix)
│   │   └── ...
│   ├── lib/              # Utilities, Supabase clients
│   ├── hooks/            # React hooks
│   ├── types/            # TypeScript types
│   └── middleware.ts     # Next.js middleware (auth/routing)
├── supabase/
│   ├── migrations/       # DB migrations (146 files SQL)
│   ├── functions/        # Edge functions
│   └── policies/         # RLS policies
├── tests/
│   ├── unit/             # Unit tests (Vitest)
│   ├── e2e/              # E2E tests (Playwright)
│   └── integration/      # Integration tests
├── scripts/              # Utility scripts (DB, setup, etc.)
└── docs/                 # Documentazione (311 files)
```

**Moduli principali:**

- **Auth:** Login, registrazione, reset password, middleware protezione route
- **Dashboard:** Clienti, allenamenti, appuntamenti, documenti, inviti, statistiche
- **Home (Atleti):** Profilo, workout plans, chat, comunicazioni
- **API:** Routes server-side per CRUD operazioni
- **DB:** Supabase (PostgreSQL) con RLS policies

**Entry point:**

- Web: `src/app/page.tsx` → redirect basato su ruolo
- API: `src/app/api/*`
- Auth: `src/middleware.ts` (protezione route + redirect ruolo)

**DB / storage / servizi esterni:**

- Supabase (PostgreSQL + Storage + Auth)
- Sentry (error tracking)
- Resend (email)
- Twilio (SMS)

**Routing:**

- `/` → Home pubblica o redirect ruolo
- `/login` → Login
- `/dashboard/*` → Dashboard trainer/admin (protetta)
- `/home/*` → Home atleti (protetta)
- `/api/*` → API routes

---

## 3) Checklist salute (con esito)

- [x] **Install dipendenze** - ✅ Completato: `npm install` eseguito con successo (1487 packages, 16 vulnerabilità moderate/high da verificare)
- [x] **Lint** - ✅ Completato: `npm run lint` eseguito senza errori bloccanti (solo warning, ESLint flat config OK)
- [x] **Typecheck** - ✅ Completato: `npm run typecheck` eseguito senza errori (TypeScript strict mode OK)
- [ ] Unit test
- [ ] Integration test
- [ ] E2E test
- [ ] Build production
- [ ] Run production
- [ ] Env validation
- [ ] DB migrations/seed
- [ ] API health
- [ ] Auth/session
- [ ] Permissions/roles
- [ ] Error handling/logging
- [ ] Security baseline
- [ ] Performance baseline
- [ ] Accessibility baseline

---

## 4) Lista Task (prioritizzata)

### [P1] STEP2-001: Verificare risposta dev server

- **Sintomo:** Dev server avviato in background, verifica risposta HTTP necessaria
- **Come riprodurre:** `npm run dev` → attendere 20s → `curl http://localhost:3001`
- **Root cause:** Da verificare (potrebbe essere solo tempo di compilazione)
- **File coinvolti:** `package.json` (script dev), `.env.local` (config)
- **Fix proposto:** Verificare se server risponde dopo compilazione completa
- **Verifica:** `Invoke-WebRequest http://localhost:3001` o aprire browser
- **Stato:** IN PROGRESS

### [P2] STEP2-002: Vulnerabilità npm (16 totali: 14 moderate, 2 high)

- **Sintomo:** `npm audit` riporta 16 vulnerabilità
- **Come riprodurre:** `npm audit`
- **Root cause:** Dipendenze con vulnerabilità note
- **File coinvolti:** `package.json`, `package-lock.json`
- **Fix proposto:** `npm audit fix` (non breaking) o `npm audit fix --force` (breaking)
- **Verifica:** `npm audit` dopo fix
- **Stato:** TODO

### [P2] STEP2-003: Node version mismatch (richiesto 20, installato 25.1.0)

- **Sintomo:** Warning `EBADENGINE` durante `npm install`
- **Come riprodurre:** `npm install` con Node 25.1.0
- **Root cause:** package.json richiede Node 20, sistema ha Node 25.1.0
- **File coinvolti:** `package.json` (engines.node)
- **Fix proposto:** Aggiornare `engines.node` a ">=20" o verificare compatibilità Node 25
- **Verifica:** `npm install` senza warning
- **Stato:** TODO

---

## 5) Log comandi e risultati

### STEP 2 - SETUP & RUN DEV (2025-01-31)

**Comando:** `npm install`

- **Esito:** ✅ Successo
- **Output:** 1487 packages installati, 16 vulnerabilità (14 moderate, 2 high), warning EBADENGINE (Node 25.1.0 vs richiesto 20)
- **Note:** Husky non trova .git (normale se non è repo git)

**Comando:** `Copy-Item env.example .env.local`

- **Esito:** ✅ Successo
- **Output:** File `.env.local` creato con placeholder
- **Note:** Variabili Supabase da configurare manualmente

**Comando:** `npm run typecheck`

- **Esito:** ✅ Successo
- **Output:** Nessun errore TypeScript
- **Note:** TypeScript strict mode OK

**Comando:** `npm run lint`

- **Esito:** ✅ Successo
- **Output:** Nessun errore bloccante (solo warning configurati)
- **Note:** ESLint flat config OK

**Comando:** `npm run dev` (background)

- **Esito:** ⚠️ In corso
- **Output:** Processo avviato in background
- **Note:** Verifica risposta HTTP necessaria dopo compilazione

---
