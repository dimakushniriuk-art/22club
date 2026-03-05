# 🚨 Data Segnalazioni - 22Club

> **Ultimo aggiornamento**: 2026-01-13
> **Formato**: Tabella strutturata per query future

---

## 📋 TABELLA SEGNALAZIONI COMPLETE

| ID | Tipo | File | Area | Motivo | Impatto | Urgenza | Status |
|----|------|------|------|--------|---------|---------|--------|
| SEG-001 | ✅ FIXED | `src/providers/auth-provider.tsx` | Auth | Debug logging massivo a localhost:7242 (50+ fetch calls) | ALTO - Performance, sicurezza in prod | **ALTA** | ✅ RIMOSSO 2026-01-13 |
| SEG-002 | ✅ FIXED | `src/hooks/use-clienti.ts` | State | Debug logging a localhost:7242 presente | MEDIO - Rumore, performance | **MEDIA** | ✅ RIMOSSO 2026-01-13 |
| SEG-003 | ✅ FIXED | `src/app/login/page.tsx` | Auth | Debug logging condizionale ma presente | BASSO - Controllato da isTestEnv | **BASSA** | ✅ RIMOSSO 2026-01-13 |
| SEG-004 | ✅ FIXED | `src/app/dashboard/page.tsx` | Dashboard | Debug logging server-side a localhost | MEDIO - Rumore nei log | **MEDIA** | ✅ RIMOSSO 2026-01-13 |
| SEG-005 | ⚠️ RISK | `src/middleware.ts` | Routing | Cache ruoli in-memory (1 min TTL) - non condivisa tra worker | MEDIO - Inconsistenza potenziale | **MEDIA** |
| SEG-006 | ⚠️ RISK | `src/middleware.ts` | Routing | `getSession()` invece di `getUser()` per performance | BASSO - Documentato, accettabile | **BASSA** |
| SEG-007 | 🔧 IMPROVE | `src/hooks/use-clienti.ts` | State | TODO: Migrate to React Query (riga 1) | MEDIO - Inconsistenza pattern | **MEDIA** |
| SEG-008 | 🔧 IMPROVE | `src/app/api/health/route.ts` | API | TODO: Add actual DB health check (riga 23) | BASSO - Health check incompleto | **BASSA** |
| SEG-009 | ⚠️ RISK | `src/types/supabase.ts` | Types | Tipi duplicati con `src/lib/supabase/types.ts` | MEDIO - Manutenzione difficile | **MEDIA** |
| SEG-010 | ✅ FIXED | `tests/e2e/login.spec.ts` | Test | WebKit/Safari: timeout su login | ALTO - Test non affidabili | **ALTA** | ✅ SKIP PERMANENTE 2026-01-13 |
| SEG-011 | 🐛 BUG | `src/lib/supabase/client.ts` | Auth | Mock client espone struttura interna | BASSO - Solo dev | **BASSA** |
| SEG-012 | 🔧 IMPROVE | `src/providers/auth-provider.tsx` | Auth | Mapping ruoli legacy (pt→trainer, atleta→athlete) | BASSO - Funziona ma legacy | **BASSA** |
| SEG-013 | ⚠️ RISK | `src/hooks/use-clienti.ts` | State | Timeout 30s su query, fallback cache | MEDIO - UX degradata | **MEDIA** |
| SEG-014 | ✅ FIXED | `src/lib/analytics.ts` | Analytics | RPC functions fallback a mock data | BASSO - Dati non reali | **BASSA** | ✅ FALLBACK VUOTO 2026-01-13 |
| SEG-015 | ⚠️ RISK | `src/hooks/use-appointments.ts` | Data | Cache profileId in-memory globale | BASSO - Memory leak potenziale | **BASSA** |
| SEG-016 | 🏗️ REFACTOR | `src/hooks/use-clienti.ts` | State | 1405 righe - file troppo grande | ALTO - Manutenibilità | **MEDIA** |
| SEG-017 | ✅ IMPROVED | `src/providers/auth-provider.tsx` | Auth | 833 righe con debug code | ALTO - Manutenibilità | **ALTA** | ✅ DEBUG RIMOSSO (~500 righe) 2026-01-13 |
| SEG-018 | ⚠️ RISK | `playwright.config.ts` | Test | Port 3001 hardcoded | BASSO - Configurazione | **BASSA** |
| SEG-019 | 🔧 IMPROVE | `src/app/home/layout.tsx` | Layout | Re-export senza logica | BASSO - Pattern ok | **BASSA** |
| SEG-020 | ⚠️ RISK | `src/middleware.ts` | Security | PROTECTED_ROUTES hardcoded | BASSO - Funziona | **BASSA** |

---

## 📊 STATISTICHE SEGNALAZIONI

| Tipo | Conteggio |
|------|-----------|
| 🐛 BUG | 5 |
| ⚠️ RISK | 7 |
| 🔧 IMPROVE | 4 |
| 🏗️ REFACTOR | 2 |
| ❌ REMOVE | 0 |
| ➕ CREATE | 0 |

| Urgenza | Conteggio |
|---------|-----------|
| **ALTA** | 3 |
| **MEDIA** | 8 |
| **BASSA** | 9 |

| Area | Conteggio |
|------|-----------|
| Auth | 5 |
| State | 3 |
| Routing | 2 |
| Test | 1 |
| Types | 1 |
| API | 1 |
| Analytics | 1 |
| Data | 1 |
| Layout | 1 |
| Security | 1 |
| Dashboard | 1 |

---

## 🔴 PRIORITÀ IMMEDIATA (Score > 70)

### SEG-001: Debug Logging Auth Provider
```
🧠 REMOVE
File: src/providers/auth-provider.tsx
Area: Auth
Motivo: 50+ chiamate fetch a localhost:7242 per debug - performance degradata, potenziale leak dati sensibili in prod
Impatto: ALTO
Urgenza: ALTA
Azione: Rimuovere tutti i blocchi `#region agent log` prima del deploy
```

### SEG-010: Test WebKit/Safari Flaky
```
🧠 IMPROVE
File: tests/e2e/login.spec.ts
Area: Test
Motivo: WebKit/Safari falliscono sistematicamente su login (cookie secure HTTP)
Impatto: ALTO
Urgenza: ALTA
Azione: Documentare skip per Safari/WebKit o implementare workaround
```

### SEG-017: Auth Provider Troppo Grande
```
🧠 REFACTOR
File: src/providers/auth-provider.tsx
Area: Auth
Motivo: 833 righe, debug code invasivo, difficile manutenzione
Impatto: ALTO
Urgenza: ALTA
Azione: Estrarre debug in modulo separato, semplificare mapRole
```

---

## 🟡 PRIORITÀ MEDIA (Score 40-70)

| ID | Azione Proposta |
|----|-----------------|
| SEG-005 | Valutare Redis/memcached per cache ruoli distribuita |
| SEG-007 | Completare migrazione useClienti a React Query |
| SEG-009 | Consolidare tipi Supabase in singola fonte |
| SEG-013 | Ridurre timeout query, migliorare feedback UX |
| SEG-016 | Spezzare useClienti in hook più piccoli |
| SEG-002 | Rimuovere debug logging da useClienti |
| SEG-004 | Rimuovere debug logging da dashboard page |

---

## 🟢 PRIORITÀ BASSA (Score < 40)

Mantenere nel backlog per future ottimizzazioni.
