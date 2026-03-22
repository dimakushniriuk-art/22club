# 🏗️ 01 - Architettura Generale

> **Progetto**: 22Club - Web App Gestionale Fitness
> **Stack**: Next.js 15 + Supabase + TypeScript

---

## 📐 DIAGRAMMA ARCHITETTURALE

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Browser                                                         │
│  ├── React Components (Client)                                   │
│  ├── TanStack Query (State Management)                          │
│  ├── Supabase Browser Client                                    │
│  └── Realtime Subscriptions                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Middleware (Edge Runtime)                              │
│  ├── Route Protection                                           │
│  ├── Role-based Access Control                                  │
│  ├── Session Validation (Supabase)                              │
│  └── In-memory Role Cache (1 min TTL)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router                                             │
│  ├── Server Components (RSC)                                    │
│  │   ├── Data Fetching (async)                                  │
│  │   ├── Supabase Server Client                                 │
│  │   └── unstable_cache (5 min TTL)                             │
│  ├── Client Components                                          │
│  │   ├── Interactivity                                          │
│  │   └── Hooks (useAuth, useClienti, etc.)                      │
│  └── API Routes (/api/*)                                        │
│      ├── RESTful endpoints                                      │
│      ├── Webhooks                                               │
│      └── Cron jobs                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase (Postgres)                                            │
│  ├── Tables (profiles, appointments, etc.)                      │
│  ├── RLS Policies (Row Level Security)                          │
│  ├── RPC Functions                                              │
│  ├── Views                                                      │
│  └── Triggers                                                   │
│                                                                  │
│  Supabase Auth                                                  │
│  ├── JWT Tokens                                                 │
│  ├── Session Management                                         │
│  └── OAuth (future)                                             │
│                                                                  │
│  Supabase Realtime                                              │
│  ├── Postgres Changes                                           │
│  └── Broadcast                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 STRUTTURA DIRECTORY

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (29 files)
│   ├── dashboard/         # Area Trainer/Admin
│   ├── home/              # Area Atleta
│   ├── login/             # Autenticazione
│   ├── post-login/        # Redirect handler
│   └── ...                # Altre pagine pubbliche
│
├── components/             # React Components
│   ├── ui/                # Componenti UI base (35 files)
│   ├── shared/            # Componenti condivisi
│   ├── dashboard/         # Componenti dashboard (120 files)
│   ├── athlete/           # Componenti atleta
│   └── ...
│
├── hooks/                  # Custom Hooks (89 files)
│   ├── use-clienti.ts
│   ├── use-appointments.ts
│   ├── use-auth.ts
│   └── ...
│
├── lib/                    # Utilities e Services
│   ├── supabase/          # Client Supabase
│   ├── cache/             # Strategie cache
│   ├── validations/       # Schemi validazione
│   └── ...
│
├── providers/              # Context Providers
│   ├── auth-provider.tsx
│   ├── query-provider.tsx
│   └── theme-provider.tsx
│
├── types/                  # TypeScript Types
│   ├── supabase.ts
│   ├── user.ts
│   └── ...
│
├── styles/                 # CSS Globali
└── middleware.ts           # Edge Middleware
```

---

## 🔀 PATTERN ARCHITETTURALI

### 1. Server vs Client Components

```
Server Components (Default):
├── Data fetching diretto
├── Accesso a cookies/headers
├── Nessun useState/useEffect
└── Streaming/Suspense

Client Components ('use client'):
├── Interattività
├── Hooks React
├── Event handlers
└── Browser APIs
```

### 2. Data Fetching Pattern

```
Server Component Flow:
┌─────────────────────────────────────┐
│ Page.tsx (Server)                   │
│ ├── createClient()                  │
│ ├── await supabase.from().select() │
│ └── Pass data to Client Component  │
└─────────────────────────────────────┘

Client Component Flow:
┌─────────────────────────────────────┐
│ ComponentClient.tsx                 │
│ ├── useQuery() from TanStack       │
│ ├── createClient() (browser)       │
│ └── Realtime subscription          │
└─────────────────────────────────────┘
```

### 3. Authentication Flow

```
┌──────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│Login │ -> │Supabase    │ -> │post-login  │ -> │Dashboard/│
│Page  │    │signIn()    │    │Role check  │    │Home      │
└──────┘    └────────────┘    └────────────┘    └──────────┘
                 │
                 ▼
           ┌────────────┐
           │Middleware  │
           │validates   │
           │on each req │
           └────────────┘
```

---

## 📊 VALUTAZIONE

| Aspetto             | Rating    | Note                                        |
| ------------------- | --------- | ------------------------------------------- |
| Chiarezza logica    | ★★★★☆     | Struttura chiara, alcuni file troppo grandi |
| Robustezza          | ★★★☆☆     | Debug code in prod, cache non distribuita   |
| Debito tecnico      | **MEDIO** | Migrazione React Query incompleta           |
| Rischio regressioni | **MEDIO** | Test E2E non coprono tutti i browser        |

---

## 🔗 DIPENDENZE CHIAVE

| Componente      | Dipende da                      |
| --------------- | ------------------------------- |
| Middleware      | Supabase SSR, profiles table    |
| AuthProvider    | Supabase browser client         |
| Dashboard       | AuthProvider, RLS policies      |
| Home            | AuthProvider, middleware        |
| useClienti      | Supabase, RLS, localStorage     |
| useAppointments | Supabase, React Query, Realtime |

---

## ⚠️ PUNTI CRITICI ARCHITETTURALI

1. **Cache ruoli in-memory**: Non condivisa tra worker/server
2. **Debug logging**: Presente in produzione
3. **Tipi duplicati**: supabase.ts vs lib/supabase/types.ts
4. **Hook monolitici**: use-clienti.ts con 1405 righe
5. **Test browser**: WebKit/Safari non affidabili
