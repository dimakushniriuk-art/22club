# 📋 00 - Indice Dati Progetto 22Club

> **Data analisi**: 2026-01-13
> **Versione**: 1.0
> **Metodo**: Analisi statica completa del codice sorgente

---

## 📁 FILE ANALIZZATI

### Middleware e Routing
| File | Path | Stato |
|------|------|-------|
| Middleware principale | `src/middleware.ts` | ✅ Analizzato |
| Supabase middleware | `src/lib/supabase/middleware.ts` | ✅ Analizzato |

### Autenticazione e Provider
| File | Path | Stato |
|------|------|-------|
| Auth Provider | `src/providers/auth-provider.tsx` | ✅ Analizzato |
| Supabase client | `src/lib/supabase/client.ts` | ✅ Analizzato |
| Supabase server | `src/lib/supabase/server.ts` | ✅ Analizzato |

### Pagine Principali
| Route | File | Ruolo Target | Stato |
|-------|------|--------------|-------|
| `/login` | `src/app/login/page.tsx` | Pubblico | ✅ Analizzato |
| `/post-login` | `src/app/post-login/page.tsx` | Auth redirect | ✅ Analizzato |
| `/dashboard` | `src/app/dashboard/page.tsx` | trainer/admin | ✅ Analizzato |
| `/dashboard/layout` | `src/app/dashboard/layout.tsx` | trainer/admin | ✅ Analizzato |
| `/home` | `src/app/home/page.tsx` | athlete | ✅ Analizzato |
| `/home/layout` | `src/app/home/_components/home-layout-auth.tsx` | athlete | ✅ Analizzato |

### Hooks Critici
| Hook | Path | Stato |
|------|------|-------|
| useClienti | `src/hooks/use-clienti.ts` | ✅ Analizzato (1405 righe) |
| useAppointments | `src/hooks/use-appointments.ts` | ✅ Analizzato |
| useAuth | `src/hooks/use-auth.ts` | ⚠️ Da verificare |
| useRealtimeChannel | `src/hooks/useRealtimeChannel.ts` | ⚠️ Riferimento presente |

### API Routes
| Endpoint | Path | Stato |
|----------|------|-------|
| `/api/health` | `src/app/api/health/route.ts` | ✅ Analizzato |
| `/api/auth/context` | `src/app/api/auth/context/route.ts` | ⚠️ Riferimento |
| `/api/dashboard/appointments` | `src/app/api/dashboard/appointments/route.ts` | ⚠️ Riferimento |
| `/api/admin/*` | `src/app/api/admin/` | ⚠️ 6 endpoint |
| `/api/communications/*` | `src/app/api/communications/` | ⚠️ 6 endpoint |

### Tipi e Schema
| File | Path | Stato |
|------|------|-------|
| User types | `src/types/user.ts` | ✅ Analizzato |
| Supabase types | `src/types/supabase.ts` | ✅ Analizzato (863 righe) |
| Cliente types | `src/types/cliente.ts` | ⚠️ Riferimento |
| Appointment types | `src/types/appointment.ts` | ⚠️ Riferimento |

---

## 🗄️ TABELLE SUPABASE

| Tabella | Uso principale | RLS |
|---------|---------------|-----|
| `profiles` | Dati utente, ruoli, anagrafica | ✅ Attive |
| `appointments` | Appuntamenti trainer-atleta | ✅ Attive |
| `documents` | Documenti atleti | ✅ Attive |
| `workout_logs` | Log allenamenti | ✅ Attive |
| `workout_plans` | Schede allenamento | ⚠️ Da verificare |
| `exercises` | Catalogo esercizi | ⚠️ Da verificare |
| `payments` | Pagamenti atleti | ⚠️ Da verificare |
| `communications` | Sistema notifiche | ⚠️ Da verificare |
| `chat_messages` | Messaggi chat | ⚠️ Da verificare |
| `notifications` | Notifiche push | ⚠️ Da verificare |
| `lesson_counters` | Contatori lezioni | ⚠️ Da verificare |
| `inviti_atleti` | Inviti registrazione | ⚠️ Da verificare |

---

## 🧪 TEST E2E

### Suite Playwright Analizzate
| File | Test | Stato |
|------|------|-------|
| `login.spec.ts` | 5 test × 5 browser | ⚠️ 18/25 pass |
| `login-roles.spec.ts` | 4 test × 5 browser | ⚠️ 14/20 pass |
| `dashboard.spec.ts` | 3 test × 5 browser | ✅ 15/15 pass |
| `smoke.spec.ts` | Suite smoke | ✅ Pass |
| `simple.spec.ts` | Suite semplice | ✅ Pass |
| `dynamic-routes.spec.ts` | Route dinamiche | ✅ Pass |
| `navigation-spa.spec.ts` | Navigazione SPA | ✅ Pass |

### Problemi Noti E2E
- **WebKit/Safari**: Cookie secure su HTTP blocca login
- **Mobile Safari**: Timeout su redirect post-login
- **Flakiness**: Login PT/atleta su alcuni browser

---

## 📊 STATISTICHE PROGETTO

| Metrica | Valore |
|---------|--------|
| File `.tsx` in `src/` | 318 |
| File `.ts` in `src/` | 255 |
| File `.css` in `src/` | 7 |
| Hook totali | 89 |
| Componenti UI | 35 |
| API routes | 29 |
| Test E2E | 38 spec files |
| Documentazione MD | 394 in `ai_memory/` |

---

## 🔗 DIPENDENZE CRITICHE

### Runtime
- Next.js 15 (App Router)
- React 18/19
- Supabase SSR
- TanStack Query (React Query)
- Tailwind CSS
- Radix UI

### Dev/Test
- Playwright
- Vitest
- ESLint (flat config)
- Prettier
- TypeScript strict

---

## ⚠️ AREE NON ANCORA ANALIZZATE

1. `src/components/dashboard/` - 120 file
2. `src/components/athlete/` - 12 file
3. `src/app/api/admin/` - API admin complete
4. `supabase/migrations/` - Migrazioni DB
5. `scripts/` - 64 script di build/deploy
