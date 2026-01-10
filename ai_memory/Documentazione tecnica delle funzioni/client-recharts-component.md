# 📚 Documentazione Tecnica: ClientRecharts

**Percorso**: `src/components/charts/client-recharts.tsx`  
**Tipo Modulo**: React Component (Charts Wrapper, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Wrapper component per Recharts con lazy loading e no-SSR. Esporta tutti i componenti Recharts come dynamic imports per ridurre bundle size iniziale.

---

## 🔧 Exports

### Componenti Recharts Esportati

Tutti i componenti sono esportati come dynamic imports con `ssr: false`:

- `LineChart`, `Line`
- `BarChart`, `Bar`
- `XAxis`, `YAxis`
- `CartesianGrid`
- `Tooltip`
- `Legend`
- `ResponsiveContainer`
- `Area`, `AreaChart`
- `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Radar`

**Classificazione**: React Component Wrapper, Client Component, Lazy Loading  
**Tipo**: Dynamic imports con `dynamic()` da Next.js

**Descrizione**: Wrapper Recharts con:

- **Lazy Loading**: Tutti i componenti caricati dinamicamente (non nel bundle iniziale)
- **No SSR**: `ssr: false` per tutti i componenti (Recharts richiede browser APIs)
- **Helper Function**: `withNoSSR` wrapper per dynamic import
- **Type Safety**: Type-safe con `ComponentType<unknown>`

---

## 🔄 Flusso Logico

### Dynamic Import

1. **Helper `withNoSSR`**:
   - Wrapper che usa `dynamic()` con `ssr: false`
   - Importa componente da loader function

2. **Helper `load`**:
   - Importa modulo 'recharts'
   - Estrae componente specifico per key
   - Ritorna come `ComponentType<unknown>`

3. **Export Componenti**:
   - Ogni componente esportato come `withNoSSR(() => load('ComponentName'))`

---

## 📊 Dipendenze

**Dipende da**: React, Next.js (`dynamic`), Recharts (peer dependency)

**Utilizzato da**: Tutti i componenti che usano grafici (ProgressCharts, StatsCharts, etc.)

---

## ⚠️ Note Tecniche

- **Bundle Size**: Lazy loading riduce bundle size iniziale (Recharts è pesante)
- **No SSR**: Tutti i componenti disabilitano SSR (necessario per Recharts)
- **Type Safety**: Usa `ComponentType<unknown>` per type safety

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
