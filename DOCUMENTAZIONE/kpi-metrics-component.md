# Componente: KPIMetrics

## 📋 Descrizione

Componente per visualizzare metriche KPI (Key Performance Indicators) principali. Mostra 4 metriche (allenamenti totali, documenti, ore, atleti attivi) con icone, valori, trend di crescita e animazioni.

## 📁 Percorso File

`src/components/shared/analytics/kpi-metrics.tsx`

## 🔧 Props

```typescript
interface KPIMetricsProps {
  summary: {
    total_workouts: number
    total_documents: number
    total_hours: number
    active_athletes: number
  }
  growth?: {
    workouts_growth: number
    documents_growth: number
    hours_growth: number
  }
}
```

### Dettaglio Props

- **`summary`** (object, required): Dati riepilogativi (workouts, documents, hours, athletes)
- **`growth`** (object, optional): Percentuali di crescita per workouts, documents, hours

## 📦 Dipendenze

### React

- `React` (FC)

### Animation

- `motion` da `framer-motion`

### Icons

- `TrendingUp`, `TrendingDown`, `Minus`, `Users`, `FileText`, `Clock`, `Activity` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Metriche**: Mostra 4 metriche principali in griglia responsive
2. **Trend Indicators**: Mostra icona e percentuale crescita per ogni metrica (se disponibile)
3. **Animazioni**: Animazioni fade-in e slide-up con delay progressivo
4. **Performance Metrics**: Componente interno `PerformanceMetrics` per top performers

### Metriche

- **Allenamenti Totali**: Numero totale allenamenti (icona Activity, colore primary)
- **Documenti Caricati**: Numero totale documenti (icona FileText, colore accent-gold)
- **Ore Totali**: Ore totali con 1 decimale (icona Clock, colore success)
- **Atleti Attivi**: Numero atleti attivi (icona Users, colore warning)

### Funzionalità Avanzate

- **Trend Icons**: TrendingUp (verde) se positivo, TrendingDown (rosso) se negativo, Minus se neutro
- **Animazioni Stagger**: Delay progressivo (0.1s per ogni card)
- **Hover Effects**: Bordo teal più intenso su hover
- **PerformanceMetrics**: Componente interno per top 5 performers con completion rate

### UI/UX

- Grid responsive (1 colonna mobile, 2 tablet, 4 desktop)
- Card con background colorato per ogni metrica
- Icone grandi con background colorato
- Valori grandi e prominenti
- Trend con icona e percentuale

## 🎨 Struttura UI

```
div (grid 1/2/4 colonne)
  └── motion.div (per ogni metrica)
      ├── Header (flex justify-between)
      │   ├── Icona (con background colorato)
      │   └── Trend (se growth presente)
      │       ├── Icona trend
      │       └── Percentuale crescita
      └── Contenuto
          ├── Valore (text-2xl, bold)
          └── Titolo (text-sm)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { KPIMetrics } from '@/components/shared/analytics/kpi-metrics'

function DashboardPage() {
  return (
    <KPIMetrics
      summary={{
        total_workouts: 156,
        total_documents: 42,
        total_hours: 1240.5,
        active_athletes: 28,
      }}
      growth={{
        workouts_growth: 12.5,
        documents_growth: 8.3,
        hours_growth: 15.2,
      }}
    />
  )
}
```

### Esempio con PerformanceMetrics

```tsx
import { PerformanceMetrics } from '@/components/shared/analytics/kpi-metrics'

function DashboardPage() {
  return (
    <PerformanceMetrics
      performance={[
        {
          athlete_id: '1',
          athlete_name: 'Mario Rossi',
          total_workouts: 45,
          avg_duration: 60,
          completion_rate: 92,
        },
        // ...
      ]}
    />
  )
}
```

## 🔍 Note Tecniche

### Animazioni

- Utilizza `framer-motion` per animazioni
- `initial={{ opacity: 0, y: 20 }}`
- `animate={{ opacity: 1, y: 0 }}`
- `transition={{ delay: index * 0.1 }}` (stagger effect)

### Trend Calculation

- **Positivo**: `growth > 0` → TrendingUp verde
- **Negativo**: `growth < 0` → TrendingDown rosso
- **Neutro**: `growth === 0` o undefined → Minus grigio

### Formattazione Valori

- **Ore**: `total_hours.toFixed(1)` (1 decimale)
- **Altri**: Valori interi diretti
- **Trend**: `growth.toFixed(1)%` con segno + se positivo

### PerformanceMetrics

- Ordina per `completion_rate` decrescente
- Mostra top 5 performers
- Mostra numero allenamenti, durata media e completion rate

### Limitazioni

- Growth non disponibile per "Atleti Attivi"
- PerformanceMetrics è componente separato (non sempre usato)
- Animazioni potrebbero essere costose su dispositivi meno potenti

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
