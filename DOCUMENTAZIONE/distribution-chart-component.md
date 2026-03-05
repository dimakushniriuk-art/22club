# 📚 Documentazione Tecnica: DistributionChart

**Percorso**: `src/components/shared/analytics/distribution-chart.tsx`  
**Tipo Modulo**: React Component (Chart Component, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Componente grafico distribuzione. Fornisce 3 varianti: PieChart (donut), HorizontalBarChart (barre orizzontali), e VerticalBarChart (barre verticali).

---

## 🔧 Props e Export

### 1. `DistributionChart`

**Classificazione**: React Component, Chart Component, Client Component, Presentational  
**Tipo**: `(props: DistributionChartProps) => JSX.Element`

**Props**:

- `data`: `DistributionData[]` - Array dati distribuzione
  - `type`: `string` - Tipo/categoria
  - `count`: `number` - Count
  - `percentage`: `number` - Percentuale
- `title?`: `string` - Titolo grafico (default: 'Distribuzione per tipo')
- `height?`: `number` - Altezza grafico (default: 280)

**Output**: JSX Element (PieChart donut)

**Descrizione**: Componente grafico distribuzione PieChart con:

- **Donut Chart**: PieChart con `innerRadius={40}` (donut style)
- **Labels**: Label con `{type}: {percentage}%`
- **Colors**: Array `COLORS` (6 colori predefiniti)
- **Empty State**: Messaggio "Dati non disponibili" se `data.length === 0`
- **Tooltip**: Formattato con count e percentuale

### 2. `HorizontalBarChart`

**Classificazione**: React Component, Chart Component, Client Component, Presentational  
**Tipo**: `(props: HorizontalBarChartProps) => JSX.Element`

**Props**: Stesso di `DistributionChart`

**Output**: JSX Element (barre orizzontali custom)

**Descrizione**: Variante barre orizzontali con:

- **Custom Bars**: Barre orizzontali custom (non Recharts)
- **Layout**: Lista item con barra progresso, count e percentuale
- **Colors**: Stesso array `COLORS`

### 3. `VerticalBarChart`

**Classificazione**: React Component, Chart Component, Client Component, Presentational  
**Tipo**: `(props: VerticalBarChartProps) => JSX.Element`

**Props**: Stesso di `DistributionChart`

**Output**: JSX Element (barre verticali custom)

**Descrizione**: Variante barre verticali con:

- **Custom Bars**: Barre verticali custom (non Recharts)
- **Layout**: Flex items-end con barre proporzionali
- **Max Count**: Calcola `maxCount` per proporzioni
- **Labels**: Count e tipo sotto ogni barra

---

## 🔄 Flusso Logico

### DistributionChart (PieChart)

1. **Empty Check**: Se `data.length === 0` → mostra empty state

2. **PieChart**:
   - `dataKey="count"`, `nameKey="type"`
   - `outerRadius={80}`, `innerRadius={40}` (donut)
   - Label: `{type}: {percentage}%`
   - Colors: `COLORS[index % COLORS.length]`

### HorizontalBarChart

1. **Empty Check**: Se `data.length === 0` → mostra empty state

2. **Lista Barre**:
   - Mappa `data` → item con:
     - Colore indicator
     - Nome tipo + count (percentage)
     - Barra progresso (width: `percentage%`)

### VerticalBarChart

1. **Empty Check**: Se `data.length === 0 || maxCount <= 0` → mostra empty state

2. **Calcolo Max**:
   - `maxCount = Math.max(...data.map(d => d.count))`

3. **Barre Verticali**:
   - Mappa `data` → barra con:
     - Height: `(count / maxCount) * 100%`
     - Colore da `COLORS`
     - Label: count e tipo sotto

---

## 📊 Dipendenze

**Dipende da**: React (`useMemo`), Recharts (lazy loaded da `client-recharts` per PieChart), tipo `DistributionData` (da `@/lib/analytics`)

**Utilizzato da**: Dashboard analytics, componenti statistiche

---

## ⚠️ Note Tecniche

- **3 Varianti**: PieChart (Recharts), HorizontalBarChart (custom), VerticalBarChart (custom)
- **Memoization**: `processedData` memoizzato con `useMemo`
- **Colors Array**: 6 colori predefiniti per consistenza

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
