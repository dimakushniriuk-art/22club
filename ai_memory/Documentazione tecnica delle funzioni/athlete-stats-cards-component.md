# Componente: AthleteStatsCards

## 📋 Descrizione

Componente per visualizzare statistiche rapide dell'atleta in formato card. Mostra 3 metriche principali: allenamenti del mese, progress score, allenamenti totali.

## 📁 Percorso File

`src/components/home-profile/athlete-stats-cards.tsx`

## 🔧 Props

```typescript
interface AthleteStatsCardsProps {
  stats: {
    allenamenti_mese: number
    progress_score: number
    allenamenti_totali: number
  }
}
```

### Dettaglio Props

- **`stats`** (object, required): Statistiche atleta

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`

## ⚙️ Funzionalità

### Core

1. **Statistiche Rapide**: Mostra 3 metriche in card separate
2. **Layout Grid**: Grid 3 colonne per distribuzione uniforme
3. **Colori Semantici**: Colori diversi per ogni card (teal, green, cyan)

### Metriche

- **Allenamenti Mese**: Numero allenamenti del mese corrente
- **Progress Score**: Punteggio progresso generale
- **Allenamenti Totali**: Numero totale sessioni completate

### UI/UX

- Grid 3 colonne responsive
- Card con bordi colorati diversi
- Valori grandi e prominenti
- Etichette piccole sotto valori
- Hover effect (group)

## 🎨 Struttura UI

```
div (grid 3 colonne)
  ├── Card 1 "Allenamenti mese" (bordo teal)
  │   └── CardContent
  │       ├── Valore (text-2xl, text-brand)
  │       └── Etichetta "Allenamenti mese"
  ├── Card 2 "Progress Score" (bordo green)
  │   └── CardContent
  │       ├── Valore (text-2xl, text-state-valid)
  │       └── Etichetta "Progress Score"
  └── Card 3 "Totale sessioni" (bordo cyan)
      └── CardContent
          ├── Valore (text-2xl, text-brand)
          └── Etichetta "Totale sessioni"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteStatsCards } from '@/components/home-profile/athlete-stats-cards'

function ProfilePage() {
  return (
    <AthleteStatsCards
      stats={{
        allenamenti_mese: 12,
        progress_score: 85,
        allenamenti_totali: 156,
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Colori Bordi

- **Card 1**: `border-teal-500/30` (allenamenti mese)
- **Card 2**: `border-green-500/30` (progress score)
- **Card 3**: `border-cyan-500/30` (totale sessioni)

### Colori Valori

- **Card 1 e 3**: `text-brand` (teal)
- **Card 2**: `text-state-valid` (green)

### Limitazioni

- Layout fisso 3 colonne (non responsive)
- Non permette modifiche (solo visualizzazione)
- Non mostra trend o variazioni

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
