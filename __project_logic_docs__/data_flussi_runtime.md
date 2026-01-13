# 🔄 Data Flussi Runtime - 22Club

> **Data analisi**: 2026-01-13
> **Tipo**: Schede flusso basate su codice reale

---

## 🔐 FLUSSO: LOGIN

### Entry Point
`/login` → `src/app/login/page.tsx`

### Componenti Coinvolti
```
LoginPage (Client Component)
├── createClient() → Supabase browser client
├── supabase.auth.signInWithPassword()
├── router.replace('/post-login')
└── UI: Card, Input, Button, Animations
```

### Backend/API
- **Supabase Auth API**: `signInWithPassword(email, password)`
- **Nessuna API route custom** per login base

### Middleware
```
middleware.ts
├── Skip static files (.svg, .png, etc.)
├── createClient(request) → Supabase SSR
├── getSession() → Verifica sessione
├── Se autenticato + su /login → redirect role-based
└── Se non autenticato → permetti accesso
```

### Cookie/Session
| Cookie | Tipo | Scopo |
|--------|------|-------|
| `sb-*-auth-token` | HttpOnly | Access token Supabase |
| `sb-*-auth-token-code-verifier` | HttpOnly | PKCE verifier |

### Cache
- **Nessuna cache** per operazioni auth
- Session gestita interamente da Supabase

### Test Collegati
- `tests/e2e/login.spec.ts` - 5 test
- `tests/e2e/login-roles.spec.ts` - 4 test

### Punti Critici
1. ⚠️ Debug logging a localhost:7242 (performance)
2. ⚠️ `isTestEnvironment()` check inline
3. ⚠️ Validazione client-side duplica quella HTML5

---

## 🔀 FLUSSO: POST-LOGIN REDIRECT

### Entry Point
`/post-login` → `src/app/post-login/page.tsx`

### Componenti Coinvolti
```
PostLoginPage (Client Component)
├── useAuth() → { loading, user, role }
├── useEffect → Attende loading = false
└── router.replace() → Redirect role-based
```

### Logica Redirect
```javascript
if (!user || !role) → /login
if (role === 'admin') → /dashboard/admin
if (role === 'trainer') → /dashboard
if (role === 'athlete') → /home
else → /login
```

### Backend
- **Nessun backend** - logica client-side
- Dipende da `AuthProvider` per stato

### Test Collegati
- Parte di `login.spec.ts` (verifica redirect finale)

### Punti Critici
1. ⚠️ Race condition potenziale se AuthProvider lento
2. ⚠️ Pagina bianca durante loading (spinner visibile)

---

## 📊 FLUSSO: DASHBOARD TRAINER

### Entry Point
`/dashboard` → `src/app/dashboard/page.tsx` (Server Component)

### Componenti Coinvolti
```
DashboardPage (Server Component)
├── createClient() → Supabase server
├── getUser() → Utente autenticato
├── Query profiles → profilo staff
├── Query appointments → agenda oggi
└── AgendaClient (Client Component)
    ├── Rendering eventi
    └── Interazioni UI

DashboardLayout (Client Component)
├── useAuth() → { org_id }
├── useAppointmentsRealtime()
├── useDocumentsRealtime()
├── useRealtimeChannel('notifications')
├── RoleLayout → Sidebar/Header
├── ErrorBoundary
└── ModalsWrapper
```

### Backend/API
```
Supabase Direct Queries:
├── profiles.select().eq('user_id', user.id)
├── appointments.select().eq('staff_id', profileId)
└── JOIN con profiles per athlete data
```

### Middleware
```
middleware.ts
├── Verifica sessione
├── Query profiles → ruolo
├── Cache ruolo (1 min TTL)
└── Se role !== 'admin'|'trainer' → /login
```

### Cache
| Livello | TTL | Scopo |
|---------|-----|-------|
| Middleware roleCache | 1 min | Evita query DB ripetute |
| React Query | Configurabile | Cache client-side |
| Realtime | N/A | Aggiornamenti live |

### Test Collegati
- `tests/e2e/dashboard.spec.ts` - 3 test ✅

### Punti Critici
1. ⚠️ Server Component con fetch a localhost:7242
2. ⚠️ Query N+1 potenziale per athlete profiles
3. ⚠️ Serializzazione agendaData per client component

---

## 🏠 FLUSSO: HOME ATLETA

### Entry Point
`/home` → `src/app/home/_components/home-layout-auth.tsx` (Layout)
`/home` → `src/app/home/page.tsx` (Content)

### Componenti Coinvolti
```
HomeLayoutAuth (Client Component)
├── useAuth() → { user, role, loading }
├── useEffect → Verifica role === 'athlete'
└── HomeLayoutClient → Layout UI

HomePage (Client Component)
├── useAuth() → { user }
├── isValidProfile(user)
├── blocchiItems → Grid di navigazione
└── Link prefetch per performance
```

### Backend
- **Nessuna query diretta** nella home page
- Dati utente da `AuthProvider` (già caricati)

### Middleware
```
middleware.ts
├── Verifica sessione
├── Query profiles → ruolo
└── Se role !== 'athlete' → /login?error=accesso_negato
```

### Test Collegati
- `tests/e2e/athlete-home.spec.ts`
- Parte di `login-roles.spec.ts`

### Punti Critici
1. ⚠️ Double-check ruolo (middleware + layout)
2. ⚠️ Skeleton durante loading può essere lungo

---

## 📈 FLUSSO: STATISTICHE

### Entry Point
`/dashboard/statistiche` → `src/app/dashboard/statistiche/page.tsx`

### Componenti Coinvolti
```
StatistichePage (presumibilmente Server Component)
├── getAnalyticsData(orgId)
│   ├── cookies() → Cookie store
│   ├── createClient(cookieStore)
│   └── unstable_cache() → Cache 5 min
└── Rendering grafici
```

### Backend
```
src/lib/analytics.ts
├── getTrendDataFromDB() → workout_logs + documents
├── getDistributionDataFromDB() → RPC o mock
├── getPerformanceDataFromDB() → RPC o view
└── Fallback a mock data se RPC fallisce
```

### Cache
| Livello | TTL | Tag |
|---------|-----|-----|
| unstable_cache | 300s (5 min) | 'analytics' |

### Punti Critici
1. ⚠️ RPC functions potrebbero non esistere → fallback mock
2. ⚠️ `cookies()` chiamata fuori da cache (fix applicato)
3. ⚠️ Vista `workout_completion_rate_view` richiesta

---

## 👥 FLUSSO: LISTA CLIENTI

### Entry Point
`/dashboard/clienti` → usa `useClienti()` hook

### Componenti Coinvolti
```
ClientiPage (presumibilmente Client Component)
├── useClienti(options)
│   ├── useSupabase() → { supabase, user, loading }
│   ├── fetchClienti() → Query con filtri
│   ├── fetchStats() → Statistiche aggregate
│   └── Cache localStorage + frequentQueryCache
└── UI: Tabella, Filtri, Paginazione
```

### Backend
```
src/hooks/use-clienti.ts
├── Query profiles WHERE role IN ('atleta', 'athlete')
├── Filtri client-side (search, stato, date)
├── Paginazione client-side
├── RPC get_clienti_stats (con fallback)
└── Realtime subscription opzionale
```

### Cache
| Livello | TTL | Scopo |
|---------|-----|-------|
| statsCache | 2 min | Statistiche |
| frequentQueryCache | Configurabile | Lista clienti |
| localStorage | 2 min | Persistenza |

### Punti Critici
1. ⚠️ File 1405 righe - troppo complesso
2. ⚠️ Timeout 30s su query → UX degradata
3. ⚠️ Molti ref per prevenire chiamate multiple
4. ⚠️ Debug logging invasivo

---

## 📅 FLUSSO: APPUNTAMENTI

### Entry Point
`/dashboard/appuntamenti` (o calendario) → `useAppointments()` hook

### Componenti Coinvolti
```
CalendarPage / AppointmentsPage
├── useAppointments({ userId, role })
│   ├── useQuery() → React Query
│   ├── getProfileId() → Cache + lookup
│   └── Mutations (create, update, cancel, delete)
└── UI: FullCalendar, Modali
```

### Backend
```
src/hooks/use-appointments.ts
├── Query appointments con JOIN profiles
├── Filtro per role (athlete_id o staff_id)
├── RPC check_appointment_overlap
└── Realtime invalidation
```

### Cache
| Livello | Scopo |
|---------|-------|
| profileIdCache (Map) | Evita lookup multipli |
| React Query | Cache client |
| Realtime | Invalidazione automatica |

### Punti Critici
1. ⚠️ Cache profileId non ha TTL
2. ⚠️ JOIN multipli per nomi atleta/trainer

---

## 🔑 LEGENDA

| Simbolo | Significato |
|---------|-------------|
| ⚠️ | Punto critico da monitorare |
| ✅ | Funzionante correttamente |
| 🔄 | Aggiornamento in tempo reale |
| 💾 | Cache attiva |
