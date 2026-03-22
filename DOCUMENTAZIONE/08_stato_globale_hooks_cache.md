# 🔄 08 - Stato Globale, Hooks e Cache

> **Analisi gestione stato e strategie di caching**

---

## 🌐 STATO GLOBALE

### AuthProvider (Context)

```typescript
// src/providers/auth-provider.tsx
interface AuthContextType {
  user: UserProfile | null
  role: UserRole | null
  org_id: string | null
  loading: boolean
}

// Stato React
const [user, setUser] = useState<UserProfile | null>(null)
const [role, setRole] = useState<UserRole | null>(null)
const [orgId, setOrgId] = useState<string | null>(null)
const [loading, setLoading] = useState(true)
```

### QueryProvider (TanStack Query)

```typescript
// src/providers/query-provider.tsx
// Wraps app con QueryClientProvider
// Configurazione default query client
```

### ThemeProvider

```typescript
// src/providers/theme-provider.tsx
// Gestione dark/light mode
```

---

## 🪝 HOOKS PRINCIPALI

### useAuth

```typescript
// src/providers/auth-provider.tsx:826-832
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

**Uso**: Accesso a user, role, org_id, loading

### useClienti

```typescript
// src/hooks/use-clienti.ts (1405 righe!)
interface UseClientiReturn {
  clienti: Cliente[]
  stats: ClienteStats
  total: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateCliente: (id: string, updates: Partial<Cliente>) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
}
```

**Pattern**: useState + useEffect (legacy, TODO migrate to React Query)

### useAppointments

```typescript
// src/hooks/use-appointments.ts
// Pattern: React Query (useQuery + useMutation)
// Include realtime subscription
```

### useSupabase

```typescript
// src/hooks/use-supabase.ts
// Accesso a supabase client, user, loading
```

### useRealtimeChannel

```typescript
// src/hooks/useRealtimeChannel.ts
// Subscription a postgres_changes
// Cleanup automatico
```

---

## 💾 STRATEGIE CACHE

### 1. Middleware Role Cache

```typescript
// src/middleware.ts:8-16
const roleCache = new Map<string, CachedRole>()
// TTL: 1 minuto
// Scope: In-memory, per worker
```

### 2. React Query Cache

```typescript
// Configurazione in query-provider.tsx
// Stale time, cache time configurabili
// Invalidazione automatica con mutations
```

### 3. Local Storage Cache

```typescript
// src/lib/cache/local-storage-cache.ts
export const localStorageCache = {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttl?: number): void
  delete(key: string): void
}
// TTL configurabile per chiave
```

### 4. Stats Cache

```typescript
// src/lib/cache/cache-strategies.ts
export const statsCache = {
  // TTL: 2 minuti
  // Per statistiche aggregate
}
```

### 5. Frequent Query Cache

```typescript
// src/lib/cache/cache-strategies.ts
export const frequentQueryCache = {
  // Per query ripetute
  // Lista clienti, appuntamenti
}
```

### 6. Next.js unstable_cache

```typescript
// src/lib/analytics.ts
unstable_cache(
  async () => {
    /* fetch data */
  },
  ['analytics-key'],
  { revalidate: 300, tags: ['analytics'] }, // 5 minuti
)
```

### 7. Profile ID Cache

```typescript
// src/hooks/use-appointments.ts:13
const profileIdCache = new Map<string, string>()
// Nessun TTL - persiste per sessione modulo
```

---

## 📊 MAPPA CACHE

```
┌─────────────────────────────────────────────────────────────────┐
│                         CACHE LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EDGE (Middleware)                                              │
│  └── roleCache (Map) ─── TTL: 60s ─── Per worker               │
│                                                                  │
│  SERVER (Next.js)                                               │
│  └── unstable_cache ─── TTL: 300s ─── Condiviso                │
│                                                                  │
│  CLIENT (Browser)                                               │
│  ├── React Query ─── Configurabile ─── Per sessione            │
│  ├── localStorage ─── TTL: 120s ─── Persistente                │
│  ├── statsCache ─── TTL: 120s ─── Per pagina                   │
│  ├── frequentQueryCache ─── Configurabile ─── Per pagina       │
│  └── profileIdCache ─── No TTL ─── Per modulo                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ PROBLEMI RILEVATI

### SEG-016: useClienti Troppo Grande

```
🧠 REFACTOR
File: src/hooks/use-clienti.ts
Area: State
Motivo: 1405 righe, logica complessa, difficile test
Impatto: ALTO
Urgenza: MEDIA
Azione: Spezzare in hook più piccoli
```

### SEG-007: Migrazione React Query

```
🧠 IMPROVE
File: src/hooks/use-clienti.ts
Area: State
Motivo: TODO riga 1 - useState/useEffect invece di React Query
Impatto: MEDIO - Inconsistenza pattern
Urgenza: MEDIA
```

### SEG-015: Profile ID Cache No TTL

```
🧠 RISK
File: src/hooks/use-appointments.ts
Area: Data
Motivo: Cache senza scadenza, memory leak potenziale
Impatto: BASSO
Urgenza: BASSA
```

---

## 📊 VALUTAZIONE

| Aspetto             | Rating    | Note                         |
| ------------------- | --------- | ---------------------------- |
| Chiarezza logica    | ★★★☆☆     | Troppe strategie cache       |
| Robustezza          | ★★★★☆     | Fallback presenti            |
| Debito tecnico      | **ALTO**  | Pattern misti                |
| Rischio regressioni | **MEDIO** | Cache invalidation complessa |

---

## 🔗 DIPENDENZE

```
Stato dipende da:
├── React Context (AuthProvider)
├── TanStack Query (QueryProvider)
├── Supabase (dati)
└── localStorage (persistenza)

Cache dipende da:
├── TTL configurati
├── Invalidazione manuale
├── Realtime triggers
└── Query refetch
```
