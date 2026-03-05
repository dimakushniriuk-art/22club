# ⚡ Guida Performance - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Metriche Performance](#metriche-performance)
3. [Ottimizzazioni Next.js](#ottimizzazioni-nextjs)
4. [Ottimizzazioni Database](#ottimizzazioni-database)
5. [Ottimizzazioni Bundle](#ottimizzazioni-bundle)
6. [Caching Strategy](#caching-strategy)
7. [Monitoring Performance](#monitoring-performance)
8. [Best Practices](#best-practices)

---

## Panoramica

22Club è ottimizzato per performance con focus su:

- **Lighthouse Score**: >90
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Time to Interactive (TTI)**: <3.5s

### Stack Ottimizzazioni

- **Next.js 15**: App Router, ISR, Image Optimization
- **Code Splitting**: Dynamic imports, lazy loading
- **Caching**: React Query, Supabase caching
- **Bundle Optimization**: Tree shaking, minification

---

## Metriche Performance

### Core Web Vitals

**LCP (Largest Contentful Paint)**:

- Target: <2.5s
- Ottimizzazioni: Image optimization, font preloading

**FID (First Input Delay)**:

- Target: <100ms
- Ottimizzazioni: Code splitting, lazy loading

**CLS (Cumulative Layout Shift)**:

- Target: <0.1
- Ottimizzazioni: Skeleton loaders, fixed dimensions

### Lighthouse Score

```bash
# Analizza performance
npm run lighthouse

# CI mode
npm run lighthouse:ci
```

Target: >90 in tutte le categorie

---

## Ottimizzazioni Next.js

### App Router

**File-based Routing**:

- Automatic code splitting per route
- Prefetching intelligente

**Server Components**:

```typescript
// ✅ CORRETTO - Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ❌ SBAGLIATO - Client Component non necessario
'use client'
export default function Page() {
  const [data, setData] = useState()
  // ...
}
```

### Image Optimization

```typescript
// ✅ CORRETTO - Next.js Image
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  width={200}
  height={200}
  alt="Avatar"
  priority // Per above-the-fold images
/>
```

### Dynamic Imports

```typescript
// ✅ CORRETTO - Lazy load componenti pesanti
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./chart'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

---

## Ottimizzazioni Database

### Query Optimization

**RPC con Fallback**:

```typescript
// Usa RPC per query complesse
const { data, error } = await supabase.rpc('get_clienti_stats')

// Fallback a query semplice se RPC fallisce
if (error) {
  // Query alternativa
}
```

**Pagination**:

```typescript
// ✅ CORRETTO - Pagination server-side
const { data } = await supabase.from('profiles').select('*').range(0, 19) // 20 per pagina
```

**Select Specifico**:

```typescript
// ✅ CORRETTO - Seleziona solo campi necessari
.select('id, nome, email')

// ❌ SBAGLIATO - Select tutti i campi
.select('*')
```

### Indexing

Verifica indici su colonne usate frequentemente:

- `profiles.user_id`
- `profiles.role`
- `appointments.starts_at`
- `payments.created_at`

---

## Ottimizzazioni Bundle

### Code Splitting

**Route-based**:

- Automatico con App Router

**Component-based**:

```typescript
// Lazy load modali
const Modal = dynamic(() => import('./modal'), {
  ssr: false,
})
```

**Library-based**:

```typescript
// Lazy load Recharts
import { LineChart } from '@/components/charts/client-recharts'
```

### Tree Shaking

**Import Specifici**:

```typescript
// ✅ CORRETTO
import { Button } from '@/components/ui/button'

// ❌ SBAGLIATO
import * as UI from '@/components/ui'
```

### Bundle Analysis

```bash
# Analizza bundle size
npm run build:analyze

# Ottimizza build
npm run build:optimize
```

---

## Caching Strategy

### React Query

**Cache Configuration**:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minuti
      cacheTime: 10 * 60 * 1000, // 10 minuti
    },
  },
})
```

**Cache Invalidation**:

```typescript
queryClient.invalidateQueries(['clients'])
```

### Supabase Caching

**Local Storage Cache**:

```typescript
// Cache frequenti query
const cache = localStorageCache.get('clients')
if (cache) return cache
```

### Next.js Caching

**ISR (Incremental Static Regeneration)**:

```typescript
export const revalidate = 60 // 60 secondi
```

**API Route Caching**:

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60',
  },
})
```

---

## Monitoring Performance

### Web Vitals

**Automatic Tracking**:

```typescript
// next.config.ts
export default {
  experimental: {
    instrumentationHook: true,
  },
}
```

**Custom Tracking**:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getLCP(console.log)
```

### Sentry Performance

```typescript
// Automatico con @sentry/nextjs
Sentry.init({
  tracesSampleRate: 1.0,
})
```

---

## Best Practices

1. **Lazy Load**: Componenti pesanti, modali, grafici
2. **Image Optimization**: Usa sempre `next/image`
3. **Code Splitting**: Dynamic imports per route/componenti
4. **Caching**: React Query + Supabase caching
5. **Bundle Size**: Monitora con `build:analyze`
6. **Database**: Query ottimizzate, pagination, indici

---

**Ultimo aggiornamento**: 2025-02-02
