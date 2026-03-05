# 📚 Documentazione Tecnica: ProgressCharts (Dashboard)

**Percorso**: `src/components/dashboard/progress-charts.tsx`  
**Tipo Modulo**: React Component (Charts Component, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Componente grafici progressi dashboard. Mostra 3 grafici Recharts: Andamento Peso (LineChart), Forza Massima (BarChart), e Completamento Schede (LineChart).

---

## 🔧 Props e Export

### 1. `ProgressCharts`

**Classificazione**: React Component, Charts Component, Client Component, Presentational  
**Tipo**: `(props: ProgressChartsProps) => JSX.Element`

**Props**:

- `data`: `ProgressKPI | undefined` - Dati KPI progressi (da `useProgressAnalytics`)
- `loading`: `boolean` - Stato caricamento

**Output**: JSX Element (grid grafici)

**Descrizione**: Componente grafici progressi dashboard con:

- **Loading State**: Skeleton loaders per 2 card durante caricamento
- **Empty State**: Card con messaggio "Nessun dato per i grafici" se `!data`
- **Grafici** (3 grafici):
  - **Peso Chart** (LineChart): `datasetPeso` (ultimi 60 giorni), colore brand, tooltip custom
  - **Forza Chart** (BarChart): `datasetForza` (ultimi 60 giorni), colore brand, tooltip custom
  - **Completamento Chart** (LineChart, span 2 colonne): `datasetCompletamento` (ultime 4 settimane), colore state-valid
- **Empty States Individuali**: Ogni grafico mostra empty state se dati mancanti
- **Custom Tooltip**: Tooltip formattato con data italiana e unità

---

## 🔄 Flusso Logico

### Rendering Grafici

1. **Loading State**:
   - Se `loading` → mostra 2 Skeleton cards

2. **Empty State**:
   - Se `!data` → mostra 2 card con messaggio "Nessun dato per i grafici"

3. **Grid Grafici** (2 colonne, terzo span 2):
   - **Card 1 - Peso**:
     - Se `data.datasetPeso.length > 0` → LineChart
     - Altrimenti → empty state con emoji ⚖️
   - **Card 2 - Forza**:
     - Se `data.datasetForza.length > 0` → BarChart
     - Altrimenti → empty state con emoji 💪
   - **Card 3 - Completamento** (span 2):
     - Se `data.datasetCompletamento.length > 0` → LineChart
     - Altrimenti → empty state con emoji 📋

---

## 📊 Dipendenze

**Dipende da**: React, UI Components (`Card`, `Skeleton`), Recharts (lazy loaded da `client-recharts`), tipo `ProgressKPI`

**Utilizzato da**: Dashboard progressi

---

## ⚠️ Note Tecniche

- **Lazy Load Recharts**: Import da `@/components/charts/client-recharts` (lazy load per bundle size)
- **Custom Tooltip**: Tooltip custom con formattazione data italiana
- **Format Date**: Usa `toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })`
- **Domain Y-Axis**: Peso: `['dataMin - 2', 'dataMax + 2']`, Forza: `[0, 'dataMax + 10']`, Completamento: `[0, 100]`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
