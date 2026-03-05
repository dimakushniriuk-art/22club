# 📚 Documentazione Tecnica: TrendChart

**Percorso**: `src/components/shared/analytics/trend-chart.tsx`  
**Tipo Modulo**: React Component (Chart Component, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Componente grafico trend. Fornisce 2 varianti: TrendChart (linea singola) e MultiTrendChart (linee multiple).

---

## 🔧 Props e Export

### 1. `TrendChart`

**Classificazione**: React Component, Chart Component, Client Component, Presentational  
**Tipo**: `(props: TrendChartProps) => JSX.Element`

**Props**:

- `data`: `TrendData[]` - Array dati trend
  - `day`: `string` - Data (ISO string)
  - `allenamenti`: `number` - Count allenamenti
  - `documenti?`: `number` - Count documenti (opzionale)
  - `ore_totali?`: `number` - Ore totali (opzionale)
- `title?`: `string` - Titolo grafico (default: 'Andamento Allenamenti (ultimi 14 giorni)')
- `height?`: `number` - Altezza grafico (default: 280)

**Output**: JSX Element (LineChart singola linea)

**Descrizione**: Componente grafico trend singola linea con:

- **LineChart**: Linea `allenamenti` con colore brand (#02B3BF)
- **Format Date**: X-axis formattato come "DD/MM" (it-IT)
- **Tooltip**: Formattato con data completa (weekday, day, month) e label "Allenamenti"

### 2. `MultiTrendChart`

**Classificazione**: React Component, Chart Component, Client Component, Presentational  
**Tipo**: `(props: MultiTrendChartProps) => JSX.Element`

**Props**: Stesso di `TrendChart`

**Output**: JSX Element (LineChart multi-linea)

**Descrizione**: Variante multi-linea con:

- **3 Linee**:
  - `allenamenti`: Colore brand (#02B3BF)
  - `documenti`: Colore warning (#C9A227)
  - `ore_totali`: Colore success (#00C781)
- **Tooltip**: Formattato con data completa e tutte le linee

---

## 🔄 Flusso Logico

### TrendChart

1. **LineChart**:
   - Data: `data` array
   - Linea: `dataKey="allenamenti"`, colore brand
   - X-axis: `day` formattato "DD/MM"
   - Tooltip: Data completa + valore

### MultiTrendChart

1. **LineChart Multi-Linea**:
   - 3 Linee: `allenamenti`, `documenti`, `ore_totali`
   - Colori diversi per ogni linea
   - Tooltip mostra tutte le linee

---

## 📊 Dipendenze

**Dipende da**: React, Recharts (lazy loaded da `client-recharts`), tipo `TrendData` (da `@/lib/analytics`)

**Utilizzato da**: Dashboard analytics, componenti statistiche

---

## ⚠️ Note Tecniche

- **Format Date**: X-axis e tooltip usano `toLocaleDateString('it-IT')` con formati diversi
- **2 Varianti**: Singola linea (TrendChart) e multi-linea (MultiTrendChart)
- **Optional Fields**: `documenti` e `ore_totali` opzionali in `TrendData`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
