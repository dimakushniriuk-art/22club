# 📚 Documentazione Tecnica: ProgressCharts (Athlete)

**Percorso**: `src/components/athlete/progress-charts.tsx`  
**Tipo Modulo**: React Component (Charts Component, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Componente grafici progressi atleta. Mostra 3 grafici Recharts: Peso nel Tempo (LineChart), Forza Massimale (LineChart multi-linea), e Circonferenze Confronto (RadarChart).

---

## 🔧 Props e Export

### 1. `ProgressCharts`

**Classificazione**: React Component, Charts Component, Client Component, Presentational  
**Tipo**: `(props: ProgressChartsProps) => JSX.Element`

**Props**:

- `progressLogs`: `ProgressLog[]` - Array progress logs atleta
- `loading?`: `boolean` - Stato caricamento (default: false)

**Output**: JSX Element (grafici progressi)

**Descrizione**: Componente grafici progressi atleta con:

- **Preparazione Dati**:
  - `weightData`: Filtra logs con `weight_kg !== null`, ordina per data
  - `strengthData`: Filtra logs con forza (bench/squat/deadlift), ordina per data
  - `radarData`: Calcola ultime e precedenti misure (chest, waist, hips, biceps, thighs)
- **Grafici** (3 grafici):
  - **Peso nel Tempo** (LineChart): Linea peso, colore brand (#02B3BF)
  - **Forza Massimale** (LineChart): 3 linee (bench, squat, deadlift), colori diversi
  - **Circonferenze Confronto** (RadarChart): Confronto attuale vs precedente, 5 misure
- **Loading State**: Skeleton loaders durante caricamento
- **Empty State**: Card con messaggio se nessun dato disponibile
- **Rendering Condizionale**: Mostra grafico solo se dati disponibili

---

## 🔄 Flusso Logico

### Preparazione Dati

1. **Weight Data**:
   - Filtra: `progressLogs.filter(log => log.weight_kg !== null)`
   - Mappa: `{ date, weight, fullDate }`
   - Ordina: per `fullDate` ascending

2. **Strength Data**:
   - Filtra: logs con `max_bench_kg || max_squat_kg || max_deadlift_kg`
   - Mappa: `{ date, bench, squat, deadlift, fullDate }`
   - Ordina: per `fullDate` ascending

3. **Radar Data**:
   - Trova `latest`: log più recente con tutte le misure
   - Trova `previous`: log precedente con tutte le misure
   - Mappa: `[{ measurement, current, previous }, ...]` (5 misure)

### Rendering Grafici

1. **Loading State**:
   - Se `loading` → mostra 2 Skeleton cards

2. **Grafici Condizionali**:
   - Peso: mostra solo se `weightData.length > 0`
   - Forza: mostra solo se `strengthData.length > 0`
   - Circonferenze: mostra solo se `radarData.length > 0`

3. **Empty State Finale**:
   - Se tutti i dati vuoti → mostra card con icona e messaggio

---

## 📊 Dipendenze

**Dipende da**: React, UI Components (`Card`, `Skeleton`), Recharts (lazy loaded da `client-recharts`), `useIcon` (professional-icons), tipo `ProgressLog`

**Utilizzato da**: Pagina progressi atleta

---

## ⚠️ Note Tecniche

- **Lazy Load Recharts**: Import da `@/components/charts/client-recharts`
- **Multi-Line Chart**: Forza usa 3 linee separate (bench, squat, deadlift) con colori diversi
- **Radar Chart**: Confronto attuale (solid) vs precedente (dashed) per visualizzazione evoluzione
- **Format Date**: Usa `toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
