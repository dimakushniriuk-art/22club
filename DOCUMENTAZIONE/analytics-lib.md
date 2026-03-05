# analytics.ts Library - Documentazione Tecnica

**File**: `src/lib/analytics.ts`  
**Tipo**: Utility Library  
**Righe**: 215  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Statistiche / Analytics
- **Tipo**: Utility Library (non hook)
- **Dipendenze**: Nessuna (usa mock data)
- **Utilizzato da**: `src/app/dashboard/statistiche/page.tsx`, componenti statistiche

---

## 🎯 Obiettivo

Fornire funzioni per analytics e statistiche:

- Dati trend (allenamenti, documenti, ore totali per giorno)
- Distribuzione per tipo attività
- Performance atleti
- Calcolo metriche crescita
- Filtri per periodo

**Nota**: Attualmente usa mock data. In futuro integrerà DuckDB per analytics avanzati.

---

## 📥 Parametri

### `getAnalyticsData(orgId?: string)`

- `orgId` (string, optional): ID organizzazione (non usato attualmente)

### `getTrendData(orgId?: string, days?: number)`

- `orgId` (string, optional): ID organizzazione
- `days` (number, default: 14): Numero giorni da restituire

### `getDistributionData(orgId?: string)`

- `orgId` (string, optional): ID organizzazione

### `getPerformanceData(orgId?: string)`

- `orgId` (string, optional): ID organizzazione

### `calculateGrowthMetrics(trend: TrendData[])`

- `trend` (TrendData[]): Array dati trend

### `filterByPeriod(data: TrendData[], period: 'week' | 'month' | 'quarter' | 'year')`

- `data` (TrendData[]): Array dati trend
- `period` (string): Periodo filtro

---

## 📤 Output / Return Value

### `getAnalyticsData()`

```typescript
Promise<AnalyticsData> {
  trend: TrendData[]
  distribution: DistributionData[]
  performance: PerformanceData[]
  summary: {
    total_workouts: number
    total_documents: number
    total_hours: number
    active_athletes: number
  }
}
```

### `getTrendData()`

```typescript
Promise<TrendData[]>
```

### `getDistributionData()`

```typescript
Promise<DistributionData[]>
```

### `getPerformanceData()`

```typescript
Promise<PerformanceData[]>
```

### `calculateGrowthMetrics()`

```typescript
{
  workouts_growth: number // percentuale
  documents_growth: number // percentuale
  hours_growth: number // percentuale
}
```

### `filterByPeriod()`

```typescript
TrendData[]
```

**Tipi**:

```typescript
interface TrendData {
  day: string // ISO date string
  allenamenti: number
  documenti: number
  ore_totali: number
}

interface DistributionData {
  type: string
  count: number
  percentage: number
}

interface PerformanceData {
  athlete_id: string
  athlete_name: string
  total_workouts: number
  avg_duration: number
  completion_rate: number
}
```

---

## 🔄 Flusso Logico

### 1. getAnalyticsData

- Usa mock data (14 giorni trend, 4 tipi distribuzione, 5 atleti performance)
- Calcola summary aggregando trend data
- Restituisce oggetto completo

### 2. getTrendData

- Chiama `getAnalyticsData()`
- Restituisce slice di trend (primi `days` elementi)

### 3. getDistributionData

- Chiama `getAnalyticsData()`
- Restituisce `distribution`

### 4. getPerformanceData

- Chiama `getAnalyticsData()`
- Restituisce `performance`

### 5. calculateGrowthMetrics

- Confronta primo e secondo elemento di trend
- Calcola percentuale crescita per allenamenti, documenti, ore
- Ritorna metriche arrotondate a 2 decimali

### 6. filterByPeriod

- Filtra trend data per periodo (week, month, quarter, year)
- Usa `Date` per confronti

---

## 🗄️ Database

**Nessuna dipendenza database attuale**

**Futuro**: Integrazione con DuckDB per analytics avanzati su Parquet files

**RPC Functions (da implementare)**:

- `get_clienti_stats()` - già esistente, usata in `useClienti`
- `get_payments_stats()` - da verificare esistenza
- Altre RPC per analytics (da implementare)

---

## ⚠️ Errori Possibili

1. **Errore calcolo**: Errori nel calcolo metriche (gestiti con try/catch, fallback a dati vuoti)

---

## 🔗 Dipendenze Critiche

- **Nessuna dipendenza esterna attuale**
- **Futuro**: DuckDB per analytics avanzati

---

## 📝 Esempio Utilizzo

```typescript
import { getAnalyticsData, calculateGrowthMetrics, filterByPeriod } from '@/lib/analytics'

async function StatistichePage() {
  const data = await getAnalyticsData()

  const growth = calculateGrowthMetrics(data.trend)
  const monthlyTrend = filterByPeriod(data.trend, 'month')

  return (
    <div>
      <TrendChart data={data.trend} />
      <DistributionChart data={data.distribution} />
      <PerformanceTable data={data.performance} />
      <GrowthMetrics metrics={growth} />
    </div>
  )
}
```

---

## 🐛 Problemi Identificati

1. **⚠️ Mock data**: Non usa DuckDB ancora (funzionalità futura)
2. **⚠️ Performance query statistiche**: RPC functions non documentate/implementate
3. **⚠️ Export report**: Funzionalità export non implementata
4. **⚠️ Real-time analytics**: Dati non aggiornati in real-time (usa mock statici)

---

## 📊 Metriche

- **Complessità Ciclomatica**: Bassa (~5-7)
- **Dipendenze Esterne**: 0
- **Side Effects**: No (funzioni pure)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi mock data e integrazione DuckDB
- ✅ Mappate funzionalità future

---

**Stato**: ✅ DOCUMENTATO (100%)
