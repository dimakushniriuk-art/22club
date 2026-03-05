# Componente: KpiCard

## 📋 Descrizione

Componente card riusabile per visualizzare una singola metrica KPI. Supporta icona, valore, trend e click handler con animazioni e haptic feedback.

## 📁 Percorso File

`src/components/shared/dashboard/kpi-card.tsx`

## 🔧 Props

```typescript
interface KpiCardProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  onClick?: () => void
}
```

### Dettaglio Props

- **`label`** (string, required): Etichetta della metrica
- **`value`** (string, required): Valore della metrica (formattato come stringa)
- **`trend`** ('up' | 'down' | 'neutral', optional): Trend della metrica
- **`icon`** (ReactNode, optional): Icona da mostrare sopra il valore
- **`onClick`** (function, optional): Callback chiamato quando si clicca sulla card

## 📦 Dipendenze

### React

- `React` (FC, memo)

### Animation

- `motion` da `framer-motion`

### Utils

- `triggerHaptic` da `@/lib/haptics`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Metrica**: Mostra label, valore e icona opzionale
2. **Trend Indicator**: Mostra freccia trend (↗, ↘, →) con colore semantico
3. **Click Handler**: Supporta click con haptic feedback
4. **Animazioni**: Hover scale e tap scale

### Funzionalità Avanzate

- **Haptic Feedback**: Vibrazione leggera al click (se supportato)
- **Hover Effect**: Scale 1.05 su hover
- **Tap Effect**: Scale 0.96 su tap
- **Memoization**: Componente memoizzato per performance

### UI/UX

- Card centrata con padding
- Layout verticale (icona, label, valore, trend)
- Background surface con shadow
- Cursor pointer se onClick presente
- Hover background change

## 🎨 Struttura UI

```
motion.div (flex flex-col, centered)
  ├── Icona (se presente)
  ├── Label (text-sm, text-secondary)
  ├── Valore (text-2xl, font-semibold, text-primary)
  └── Trend (se presente)
      └── Freccia (↗, ↘, →) con colore semantico
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { KpiCard } from '@/components/shared/dashboard/kpi-card'

function DashboardPage() {
  return (
    <KpiCard
      label="Allenamenti Totali"
      value="156"
      trend="up"
      icon={<Activity className="h-6 w-6" />}
      onClick={() => router.push('/dashboard/schede')}
    />
  )
}
```

## 🔍 Note Tecniche

### Animazioni

- **Hover**: `whileHover={{ scale: 1.05 }}`
- **Tap**: `whileTap={{ scale: 0.96 }}`
- Transizioni smooth (duration-200)

### Trend Colors

- **up**: `text-success` (verde)
- **down**: `text-error` (rosso)
- **neutral**: `text-text-muted` (grigio)

### Haptic Feedback

- Chiama `triggerHaptic('light')` al click
- Solo se `onClick` presente

### Memoization

- Componente memoizzato con `React.memo`
- Utile quando usato in liste o dashboard con molti KPI

### Limitazioni

- Valore sempre stringa (formattazione deve essere fatta dal parent)
- Trend solo 3 stati (non supporta valori numerici)
- Layout fisso verticale (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
