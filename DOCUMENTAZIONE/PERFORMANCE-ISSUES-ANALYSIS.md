# 🐌 Analisi Performance - Pagine Lente

**Data analisi**: 17 Gennaio 2026  
**Problema**: Pagine impiegano 3-12 secondi a caricarsi, non reattive

## 📊 Tempi Attuali (Dal Terminale)

- `/login`: **11.9 secondi** 🔴
- `/home`: **4.0 secondi** 🟡
- `/home/allenamenti`: **3.1 secondi** 🟡
- `/home/allenamenti/[id]`: **4.2 secondi** 🟡

**Target**: < 1 secondo per pagine semplici, < 2 secondi per pagine complesse

---

## 🔴 Problemi Critici Identificati

### 1. Compilazione Lenta in Dev Mode

**Problema**: Next.js compila ogni pagina al primo accesso (2-10 secondi)

**Causa**:
- Next.js 15 in dev mode compila on-demand
- 2400+ moduli da compilare per `/login`
- 3200+ moduli per `/home`
- Nessun pre-compilazione

**Impatto**: +2-10 secondi al primo accesso

**Soluzione Immediata**:
```bash
# Pre-compila le route principali
npm run build
# Poi usa il server di produzione in locale
npm run start:prod
```

**Soluzione a Lungo Termine**:
- Usa Turbopack (già configurato ma non attivo)
- Considera ISR (Incremental Static Regeneration) per pagine statiche

---

### 2. Query Database Multiple e Sequenziali

**Problema**: Multiple query al database in sequenza invece che in parallelo

**Esempi trovati**:
- `post-login` fa query multiple sequenziali
- Middleware fa query ad ogni richiesta (anche se c'è cache)
- Alcuni hook fanno waterfall di query

**Impatto**: +500-2000ms per pagina

**Soluzione**:
```typescript
// ❌ SBAGLIATO - Sequenziale
const data1 = await query1()
const data2 = await query2(data1)
const data3 = await query3(data2)

// ✅ CORRETTO - Parallelo
const [data1, data2] = await Promise.all([query1(), query2()])
const data3 = await query3(data1, data2)
```

---

### 3. getSession() vs getUser() Warning

**Problema**: Uso di `getSession()` che è più veloce ma meno sicuro

**Warning nel terminale**:
```
Using the user object as returned from supabase.auth.getSession() 
could be insecure! Use supabase.auth.getUser() instead
```

**Impatto**: 
- `getSession()`: ~50ms (da cookie)
- `getUser()`: ~200ms (verifica server)

**Soluzione**:
- Middleware: OK usare `getSession()` (già fatto)
- API Routes: Usare `getUser()` per sicurezza
- Client Components: Usare `getUser()` quando necessario

---

### 4. React Query Config Non Ottimale

**Problema**: Alcuni hook non hanno cache configurata correttamente

**Trovato**:
- Alcuni hook hanno `staleTime: 0` (refetch sempre)
- Alcuni hook non hanno `refetchOnMount: false`
- Cache non sfruttata al massimo

**Soluzione**:
```typescript
// ✅ Config ottimale
useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 minuti
  gcTime: 10 * 60 * 1000, // 10 minuti
  refetchOnMount: false,
  refetchOnWindowFocus: false,
})
```

---

### 5. Nessun Prefetching delle Route

**Problema**: Link non prefetchano le route prima del click

**Impatto**: +300-500ms navigazione

**Soluzione**:
```tsx
// ✅ Prefetch automatico
<Link href="/home/allenamenti" prefetch={true}>
  Allenamenti
</Link>

// ✅ Prefetch manuale
router.prefetch('/home/allenamenti')
```

---

### 6. Bundle Size Elevato

**Problema**: Bundle JavaScript grande causa download lento

**Trovato**:
- 2400+ moduli per `/login`
- 3200+ moduli per `/home`
- Recharts, FullCalendar, Lucide non sempre lazy loaded

**Soluzione**:
```tsx
// ✅ Lazy load componenti pesanti
const ProgressCharts = dynamic(() => import('./ProgressCharts'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

---

## ✅ Soluzioni Immediate (Quick Wins)

### 1. Abilita Turbopack (Next.js 15)

```bash
# Modifica package.json
"dev": "next dev --turbo"
```

**Beneficio**: -50% tempo compilazione

---

### 2. Ottimizza React Query Config Globale

**File**: `src/providers/query-provider.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minuti
      gcTime: 10 * 60 * 1000, // 10 minuti
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1, // Riduci retry
    },
  },
})
```

**Beneficio**: -30% query duplicate

---

### 3. Aggiungi Prefetching alle Route Principali

**File**: `src/app/home/page.tsx`

```tsx
useEffect(() => {
  // Prefetch route principali
  router.prefetch('/home/allenamenti')
  router.prefetch('/home/progressi')
  router.prefetch('/home/profilo')
}, [router])
```

**Beneficio**: -300-500ms navigazione

---

### 4. Lazy Load Componenti Pesanti

**File**: Pagine con grafici/tabelle grandi

```tsx
const ProgressCharts = dynamic(() => import('./ProgressCharts'), {
  loading: () => <div>Caricamento...</div>,
  ssr: false
})
```

**Beneficio**: -200-500ms first render

---

### 5. Ottimizza Query Database

**Cerca e sostituisci**:
```typescript
// ❌ select('*')
.select('*')

// ✅ select esplicito
.select('id, nome, cognome, email')
```

**Beneficio**: -40% payload, -30% query time

---

## 🎯 Soluzioni a Lungo Termine

### 1. Migra a Server Components (Next.js 15)

**Beneficio**: 
- Fetch dati sul server (più veloce)
- Meno JavaScript al client
- Miglior SEO

**Sforzo**: 2-3 settimane

---

### 2. Implementa ISR per Pagine Statiche

**Beneficio**: 
- Pagine pre-generate
- Aggiornamento incrementale
- Caricamento istantaneo

**Sforzo**: 1 settimana

---

### 3. Ottimizza Database

**Azioni**:
- Verifica indici mancanti
- Ottimizza query lente
- Aggiungi materialized views per analytics

**Sforzo**: 1 settimana

---

## 📋 Checklist Ottimizzazione

### Immediate (Oggi)
- [ ] Abilita Turbopack
- [ ] Ottimizza React Query config globale
- [ ] Aggiungi prefetching route principali
- [ ] Lazy load componenti pesanti (Recharts, FullCalendar)

### Questa Settimana
- [ ] Sostituisci `select('*')` con select esplicito
- [ ] Parallelizza query sequenziali
- [ ] Aggiungi loading states migliori
- [ ] Ottimizza immagini (Next.js Image)

### Questo Mese
- [ ] Migra pagine statiche a Server Components
- [ ] Implementa ISR
- [ ] Ottimizza database (indici, query)
- [ ] Aggiungi monitoring performance (Web Vitals)

---

## 🔧 Comandi Utili

```bash
# Analizza bundle size
npm run build:analyze

# Build produzione (più veloce)
npm run build:prod

# Avvia produzione locale
npm run start:prod

# Verifica performance
npm run build && npm run start:prod
```

---

## 📊 Metriche Target

**Dopo Ottimizzazioni**:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 300ms

**Attuali** (stimati):
- First Contentful Paint: ~4-12s 🔴
- Time to Interactive: ~5-15s 🔴
- Largest Contentful Paint: ~4-12s 🔴

---

## ✅ Conclusione

**Problemi principali**:
1. Compilazione lenta in dev (normale, ma migliorabile)
2. Query database non ottimizzate
3. Nessun prefetching
4. Bundle size elevato

**Soluzioni immediate disponibili**: ✅ Sì, tutte implementabili oggi

**Tempo stimato per fix critici**: 2-4 ore

**Miglioramento atteso**: 50-70% più veloce
