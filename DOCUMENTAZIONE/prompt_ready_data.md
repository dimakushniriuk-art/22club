# 🎯 Prompt Ready Data - 22Club

> **Scopo**: Dati strutturati pronti per prompt futuri
> **Data**: 2026-01-13

---

## 🔴 FILE CRITICI (Modifica con cautela)

```
src/middleware.ts
├── Routing principale
├── Cache ruoli in-memory
├── Logica redirect role-based
└── RISCHIO: Modifica errata blocca tutta l'app

src/providers/auth-provider.tsx
├── Stato autenticazione globale
├── Mapping ruoli (pt→trainer, atleta→athlete)
├── Session management
└── RISCHIO: 833 righe, debug code invasivo

src/hooks/use-clienti.ts
├── Logica complessa fetch clienti
├── Cache multi-livello
├── RLS dependencies
└── RISCHIO: 1405 righe, molti edge case

src/lib/supabase/server.ts
├── Client Supabase server-side
├── Cookie handling Next 15
└── RISCHIO: Modifica rompe SSR

src/lib/supabase/client.ts
├── Client Supabase browser
├── Mock per sviluppo
└── RISCHIO: Singleton, modifica globale
```

---

## 🟡 AREE FRAGILI (Test prima di modificare)

```
Auth Flow
├── Login → Post-login → Dashboard/Home
├── Dipendenze: Supabase session, middleware, AuthProvider
├── Test: login.spec.ts, login-roles.spec.ts
└── FRAGILE: WebKit/Safari non affidabili

Dashboard Data Loading
├── Server Component → Client Component handoff
├── Dipendenze: Supabase queries, serializzazione
├── Test: dashboard.spec.ts
└── FRAGILE: Errori serializzazione silenti

Realtime Subscriptions
├── useRealtimeChannel, useAppointmentsRealtime
├── Dipendenze: Supabase realtime, cleanup
├── Test: realtime-memory-leak.spec.ts
└── FRAGILE: Memory leak se cleanup mancante

RLS Policies
├── profiles, appointments, documents
├── Dipendenze: user_id, org_id, ruolo
├── Test: security tests
└── FRAGILE: Query vuote se policy errata
```

---

## 🟢 REFACTOR SICURI

```
Debug Logging Removal
├── File: auth-provider.tsx, use-clienti.ts, dashboard/page.tsx
├── Pattern: #region agent log ... #endregion
├── Azione: Rimuovere blocchi fetch a localhost:7242
└── SICURO: Nessun impatto funzionale

Type Consolidation
├── File: src/types/supabase.ts, src/lib/supabase/types.ts
├── Azione: Unificare in singola fonte
└── SICURO: Breaking change solo per import

Mock Data Cleanup
├── File: src/lib/analytics.ts
├── Azione: Rimuovere mock data se RPC funzionanti
└── SICURO: Fallback comunque presente

Test Helpers
├── File: tests/e2e/helpers/auth.ts
├── Azione: Centralizzare credenziali test
└── SICURO: Solo ambiente test
```

---

## 🔴 REFACTOR RISCHIOSI

```
useClienti to React Query Migration
├── File: src/hooks/use-clienti.ts
├── Complessità: 1405 righe di logica
├── Dipendenze: Cache locale, RLS, filtri
└── RISCHIOSO: Richiede test estensivi

Middleware Cache Distribution
├── File: src/middleware.ts
├── Complessità: Map in-memory non condivisa
├── Alternativa: Redis/Memcached
└── RISCHIOSO: Modifica architettura

Auth Provider Simplification
├── File: src/providers/auth-provider.tsx
├── Complessità: Mapping ruoli legacy
├── Dipendenze: Tutti i componenti autenticati
└── RISCHIOSO: Breaking change potenziale

Database Schema Changes
├── File: supabase/migrations/*
├── Complessità: RLS policies intrecciate
└── RISCHIOSO: Richiede rollback plan
```

---

## 📋 QUERY PRONTE

### Trova tutti i debug log

```bash
rg "#region agent log" src/
```

### Trova TODO in hooks

```bash
rg "TODO" src/hooks/
```

### Verifica import Supabase

```bash
rg "from '@/lib/supabase" src/
```

### Trova componenti senza test

```bash
# Confronta file in src/components con tests/
```

---

## 🗂️ CONTESTO PER PROMPT

### Stack Tecnico

```
Frontend: Next.js 15 App Router, React 18, TypeScript strict
Styling: Tailwind CSS, Radix UI, dark mode
Backend: Supabase (Postgres, Auth, Realtime, Storage)
State: TanStack Query, Context API
Test: Playwright E2E, Vitest unit
Deploy: Vercel, GitHub Actions
```

### Ruoli Utente

```
admin    → /dashboard/admin (gestione globale)
trainer  → /dashboard (gestione clienti, schede)
athlete  → /home (fruizione contenuti)
```

### Convenzioni Codice

```
semi = false (no semicolon)
File components: kebab-case.tsx
Hooks: use-nome-hook.ts
Types: nome-tipo.ts
API routes: route.ts
```

### Pattern Comuni

```
Client Component: 'use client' + hooks
Server Component: async function + createClient()
API Route: NextResponse.json()
Middleware: NextResponse.next() / redirect()
Hook con query: useQuery + queryKeys
```

---

## 📊 METRICHE QUICK REFERENCE

| Metrica          | Valore  | Note                  |
| ---------------- | ------- | --------------------- |
| LOC totali src/  | ~25,000 | Stima                 |
| Componenti React | ~200    | tsx files             |
| Hooks custom     | 89      | in src/hooks          |
| API endpoints    | 29      | route.ts files        |
| Tabelle DB       | ~15     | In types/supabase     |
| Test E2E         | 38      | spec files            |
| Test pass rate   | ~85%    | Variabile per browser |

---

## ⚠️ ANTI-PATTERN DA EVITARE

1. **Non modificare middleware senza test E2E**
2. **Non rimuovere mapping ruoli legacy senza migration**
3. **Non cambiare cache TTL senza benchmark**
4. **Non toccare RLS policies senza backup**
5. **Non fare push senza CI green**
