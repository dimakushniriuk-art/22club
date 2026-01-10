# Componente: AppointmentsStats

## 📋 Descrizione

Componente per visualizzare statistiche rapide degli appuntamenti: totale, completati, programmati, annullati. Mostra badge colorati con conteggi.

## 📁 Percorso File

`src/components/appointments/appointments-stats.tsx`

## 🔧 Props

```typescript
interface AppointmentsStatsProps {
  stats: {
    total: number
    attivi: number
    completati: number
    annullati: number
    programmati: number
  }
}
```

### Dettaglio Props

- **`stats`** (object, required): Oggetto con tutte le statistiche

## 📦 Dipendenze

### UI Components

Nessuna dipendenza UI esterna (solo HTML/CSS nativo)

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Statistiche**: Mostra tutte le statistiche disponibili
2. **Badge Colorati**: Ogni statistica ha un colore distintivo
3. **Condizionale**: Mostra solo statistiche > 0

### Statistiche

- **Totali**: Badge teal (sempre visibile)
- **Completati**: Badge verde (solo se > 0)
- **Programmati**: Badge bianco (solo se > 0)
- **Annullati**: Badge arancione (solo se > 0)

### UI/UX

- Layout flex con wrap
- Badge con bordo e background semi-trasparente
- Indicatore circolare colorato
- Layout responsive

## 🎨 Struttura UI

```
Container (flex gap-3 flex-wrap)
  ├── Badge Totali
  │   ├── Indicatore teal
  │   ├── Numero (bold)
  │   └── Label "totali"
  ├── Badge Completati (se > 0)
  │   ├── Indicatore verde
  │   ├── Numero (bold, verde)
  │   └── Label "completati"
  ├── Badge Programmati (se > 0)
  │   ├── Indicatore bianco
  │   ├── Numero (bold)
  │   └── Label "programmati"
  └── Badge Annullati (se > 0)
      ├── Indicatore arancione
      ├── Numero (bold, arancione)
      └── Label "annullati"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentsStats } from '@/components/appointments/appointments-stats'

function MyComponent() {
  const stats = {
    total: 25,
    attivi: 10,
    completati: 12,
    annullati: 3,
    programmati: 8,
  }

  return <AppointmentsStats stats={stats} />
}
```

## 🔍 Note Tecniche

### Colori Badge

- **Totali**: `bg-background-tertiary/50`, `border-teal-500/20`, indicatore `bg-teal-400`
- **Completati**: `bg-green-500/10`, `border-green-500/30`, indicatore `bg-green-400`
- **Programmati**: `bg-background-tertiary/50`, `border-white/40`, indicatore `bg-white/60`
- **Annullati**: `bg-orange-500/10`, `border-orange-500/30`, indicatore `bg-orange-400`

### Visibilità Condizionale

Solo "totali" è sempre visibile. Le altre statistiche sono mostrate solo se `> 0`.

### Limitazioni

- Non supporta click per filtrare
- Non mostra percentuali
- Non supporta animazioni conteggio

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
