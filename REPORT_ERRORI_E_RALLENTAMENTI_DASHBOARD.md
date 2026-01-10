# 🔍 Report Errori e Rallentamenti - Dashboard Trainer

**Data Analisi**: 2026-01-09  
**Pagine Analizzate**: 10 pagine principali e secondarie

---

## ⚠️ PROBLEMI CRITICI (Alta Priorità)

### 1. Query Waterfall - `/dashboard/abbonamenti`

**Problema**: Query sequenziali invece di Promise.all  
**Righe**: 196-493 (`loadAbbonamenti`)

```typescript
// ❌ ERRORE: Query sequenziali
const { data: paymentsData } = await supabase.from('payments').select(...)
// ... attende completamento prima di continuare
const { data: profilesData } = await supabase.from('profiles').select(...)
// ... attende completamento prima di continuare
const { data: appointmentsData } = await supabase.from('appointments').select(...)
```

**Impatto**: +300-500ms per caricamento iniziale  
**Soluzione**: Usare `Promise.all()` per query parallele

---

### 2. Componente Ricreato Ogni Render - `/dashboard/esercizi`

**Problema**: `ExerciseMedia` definito dentro `.map()` crea nuovo componente ogni render  
**Righe**: 534-663

```typescript
// ❌ ERRORE: Componente creato dentro map
{filtered.map((e) => {
  const ExerciseMedia = () => {
    const [videoError, setVideoError] = useState(false)
    // ...
  }
  return <ExerciseMedia />
})}
```

**Impatto**: Rallentamenti rendering, perdita stato video  
**Soluzione**: Estrarre componente fuori da map, usare `useMemo` o `memo()`

---

### 3. useEffect Dipendenze Incomplete - Multiple Pagine

**Problema**: Dipendenze mancanti causano re-render infiniti o dati stantii

#### `/dashboard/clienti` (righe 69-75, 85-91)
```typescript
// ❌ ERRORE: searchParams.get() in dependency array
useEffect(() => {
  const urlViewMode = searchParams.get('viewMode')
  // ...
}, [searchParams.get('viewMode')]) // searchParams oggetto cambia sempre
```

#### `/dashboard/abbonamenti` (righe 500-502)
```typescript
// ❌ ERRORE: loadAbbonamenti in deps senza useCallback stabile
useEffect(() => {
  void loadAbbonamenti()
}, [loadAbbonamenti, currentPage]) // loadAbbonamenti ricrea sempre
```

#### `/dashboard/esercizi` (righe 313-316)
```typescript
// ❌ ERRORE: load non in deps
useEffect(() => {
  void load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // load non incluso
```

**Impatto**: Re-render non necessari, query multiple  
**Soluzione**: Correggere dipendenze, usare `useCallback` per funzioni

---

### 4. Modali Non Lazy Loaded

**Pagine affette**:
- `/dashboard/esercizi`: `ExerciseFormModal` (riga 899)
- `/dashboard/allenamenti`: `AllenamentoDettaglioModal`, `AllenamentiFiltriAvanzati` (righe 383-398)
- `/dashboard/abbonamenti`: `InvoiceViewModal` (righe 35-149), `NuovoPagamentoModal`
- `/dashboard/pagamenti`: `NewPaymentModal` (riga 291)
- `/dashboard/comunicazioni`: `NewCommunicationModal`, `RecipientsDetailModal` (righe 151-205)
- `/dashboard/documenti`: `DocumentInvalidModal`, `DocumentDetailDrawer` (righe 141-162)

**Impatto**: Bundle size iniziale aumentato, caricamento lento  
**Soluzione**: Convertire a lazy loading con `React.lazy()` o `dynamic()`

---

### 5. Query Multiple Sequenziali - `/dashboard/impostazioni`

**Problema**: Query profilo eseguite sequenzialmente invece che in parallelo  
**Righe**: 99-210

```typescript
// ❌ ERRORE: Query sequenziali
if (authUser) {
  const baseProfile = { /* ... */ }
  // Query 1: phone
  const { data: profileData } = await supabase.from('profiles').select('phone').eq('id', authUser.id).single()
  // ...
}
// Query 2: fallback completo
const { data: profileData } = await supabase.from('profiles').select('id, nome, ...').eq('user_id', ...).single()
```

**Impatto**: +200-300ms per caricamento profilo  
**Soluzione**: Unificare query o usare Promise.all

---

## ⚠️ PROBLEMI PERFORMANCE (Media Priorità)

### 6. Filtri Client-Side Pesanti - `/dashboard/abbonamenti`

**Problema**: Filtri applicati client-side su array grande (righe 708-760)

```typescript
// ❌ ERRORE: Filtri multipli su array grande
const filteredAbbonamenti = useMemo(() => {
  return abbonamenti
    .filter((abb) => abb.athlete_name.toLowerCase().includes(search))
    .filter((abb) => /* lessonsFilter */)
    .filter((abb) => /* amountFilter */)
    .filter((abb) => /* dateFilter */)
}, [abbonamenti, searchTerm, ...])
```

**Impatto**: Rallentamenti con 100+ record  
**Soluzione**: Spostare filtri lato server o ottimizzare con indici

---

### 7. Query Senza Caching - `/dashboard/statistiche`

**Problema**: Query analytics eseguite ogni render senza cache  
**File**: `src/lib/analytics.ts` (righe 109-155)

```typescript
// ❌ ERRORE: Nessuna cache per analytics
export async function getAnalyticsData() {
  const trend = await getTrendDataFromDB(supabase, 14)
  const distribution = await getDistributionDataFromDB(supabase)
  const performance = await getPerformanceDataFromDB(supabase)
  // Nessuna cache
}
```

**Impatto**: Query pesanti ad ogni accesso pagina  
**Soluzione**: Implementare `unstable_cache` o React Query cache

---

### 8. Mock Data in Produzione - `/dashboard/documenti`

**Problema**: Pagina usa mock data invece di query reale (righe 20, 40-45)

```typescript
// ❌ ERRORE: Mock data hardcoded
const [documents, setDocuments] = useState<Document[]>(mockDocuments)

useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false) // Simula caricamento
  }, 1000)
}, [])
```

**Impatto**: Dati non reali, funzionalità incompleta  
**Soluzione**: Implementare query Supabase reale

---

### 9. InvoiceViewModal useEffect Problema - `/dashboard/abbonamenti`

**Problema**: `supabase` in dependency array causa re-esecuzione (righe 49-107)

```typescript
// ❌ ERRORE: supabase client ricrea sempre
useEffect(() => {
  loadSignedUrl()
}, [url, supabase]) // supabase cambia ogni render
```

**Impatto**: Signed URL rigenerato inutilmente  
**Soluzione**: Rimuovere `supabase` da deps o usare `useRef`

---

### 10. Componenti Non Memoizzati - Multiple Pagine

**Problema**: Funzioni helper ricreate ogni render

#### `/dashboard/allenamenti` (righe 57-118)
```typescript
// ❌ ERRORE: Funzioni ricreate ogni render
const getStatoBadge = (stato: string) => { /* ... */ }
const formatData = (dataString: string) => { /* ... */ }
```

**Impatto**: Rallentamenti rendering  
**Soluzione**: `useCallback` o estrarre fuori componente

---

## 🔧 PROBLEMI ARCHITETTURALI (Bassa Priorità)

### 11. Tabs Non Lazy Loaded - `/dashboard/impostazioni`

**Pagine**: Tutti i tab caricati insieme (righe 471-538)

**Soluzione**: Lazy load tab content (già fatto per `/dashboard/profilo`)

---

### 12. Query Multiple senza Parallelismo - `/dashboard/statistiche`

**Problema**: Analytics queries sequenziali (righe 116-123)

```typescript
// ❌ ERRORE: Query sequenziali
const trend = await getTrendDataFromDB(supabase, 14)
const distribution = await getDistributionDataFromDB(supabase)
const performance = await getPerformanceDataFromDB(supabase)
```

**Soluzione**: `Promise.all()` per parallelismo

---

## 📊 RIEPILOGO IMPATTO

| Categoria | Pagine Affette | Impatto Stimato | Priorità |
|-----------|----------------|-----------------|----------|
| Query Waterfall | 2 | +500ms | Alta |
| useEffect Errati | 3 | Re-render infiniti | Alta |
| Modali Non Lazy | 6 | +200KB bundle | Alta |
| Filtri Client-Side | 1 | +300ms (100+ items) | Media |
| Componenti Ricreati | 1 | Rallentamenti UI | Media |
| Query Senza Cache | 1 | Query ripetute | Media |
| Mock Data | 1 | Funzionalità mancante | Media |

---

## ✅ SOLUZIONI RAPIDE (Quick Wins)

1. **Convertire modali a lazy loading** → -200KB bundle size
2. **Promise.all per query waterfall** → -500ms caricamento
3. **Correggere useEffect deps** → Elimina re-render infiniti
4. **Estrarre ExerciseMedia fuori map** → Performance rendering
5. **Implementare cache analytics** → Query ridotte del 90%

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### Sprint 1 (Critico - 2h)
1. Fix useEffect dipendenze (`/dashboard/clienti`, `/dashboard/abbonamenti`, `/dashboard/esercizi`)
2. Promise.all query waterfall (`/dashboard/abbonamenti`)
3. Estrarre ExerciseMedia componente

### Sprint 2 (Alto - 4h)
1. Lazy load modali (6 pagine)
2. Cache analytics (`/dashboard/statistiche`)
3. Query parallele impostazioni

### Sprint 3 (Medio - 3h)
1. Ottimizzare filtri client-side
2. Memoizzare funzioni helper
3. Fix InvoiceViewModal useEffect

### Sprint 4 (Basso - 2h)
1. Implementare query reale documenti
2. Lazy load tabs impostazioni
3. Refactor query multiple

---

**Tempo Totale Stimato**: ~11h  
**Miglioramento Performance Stimato**: -60% tempo caricamento, -200KB bundle size