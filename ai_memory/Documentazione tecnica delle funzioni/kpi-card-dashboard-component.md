# Componente: KPICard (Dashboard)

## 📋 Descrizione

Componente card per visualizzare una singola metrica KPI con animazione count-up, status badge, icona e supporto per click/href. Include stato di loading e animazioni smooth.

## 📁 Percorso File

`src/components/dashboard/kpi-card.tsx`

## 🔧 Props

```typescript
interface KPICardProps {
  title: string
  value: string | number
  icon: string
  status: 'success' | 'warning' | 'error' | 'info'
  statusText: string
  onClick?: () => void
  href?: string
  loading?: boolean
}
```

### Dettaglio Props

- **`title`** (string, required): Titolo della metrica
- **`value`** (string | number, required): Valore della metrica
- **`icon`** (string, required): Icona emoji o carattere
- **`status`** ('success' | 'warning' | 'error' | 'info', required): Stato semantico
- **`statusText`** (string, required): Testo del badge status
- **`onClick`** (function, optional): Callback click
- **`href`** (string, optional): Link href (alternativo a onClick)
- **`loading`** (boolean, optional): Stato loading

## 📦 Dipendenze

### React

- `React` (memo)

### Next.js

- `Link` da `next/link`

### Utils

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Metrica**: Mostra titolo, valore, icona e status badge
2. **Count-up Animation**: Animazione numerica per valori numerici (easeOutCubic, 800ms)
3. **Status Badge**: Badge colorato in base allo status
4. **Click/Link Support**: Supporta onClick o href per navigazione

### Funzionalità Avanzate

- **Count-up Animation**: Animazione smooth da 0 al valore target (solo numeri)
- **Loading State**: Skeleton loading con pulse animation
- **Hover Effects**: Scale 1.05, shadow enhancement, border glow
- **Keyboard Support**: Enter/Space per attivare onClick
- **Memoization**: Componente memoizzato per performance

### UI/UX

- Card con gradiente background
- Icona con gradiente basato su status
- Status badge con colori semantici
- Valore grande e prominente
- Hover effects con scale e shadow

## 🎨 Struttura UI

```
div/Link (card container)
  └── div (card content)
      ├── Header
      │   ├── Icona (gradiente basato su status)
      │   └── Status Badge
      └── Contenuto
          ├── Valore (text-3xl, bold)
          └── Titolo (text-sm)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { KPICard } from '@/components/dashboard/kpi-card'

function DashboardPage() {
  return (
    <KPICard
      title="Allenamenti Totali"
      value={156}
      icon="💪"
      status="success"
      statusText="In aumento"
      onClick={() => router.push('/dashboard/schede')}
    />
  )
}
```

### Esempio con Link

```tsx
<KPICard
  title="Clienti Attivi"
  value={28}
  icon="👥"
  status="info"
  statusText="Stabile"
  href="/dashboard/clienti"
/>
```

## 🔍 Note Tecniche

### Count-up Animation

- Utilizza `requestAnimationFrame` per animazione smooth
- Easing: `1 - Math.pow(1 - t, 3)` (easeOutCubic)
- Durata: 800ms
- Solo per valori numerici

### Status Colors

- **success**: Verde (bg-green-500/20, text-green-400, border-green-500/30)
- **warning**: Giallo (bg-yellow-500/20, text-yellow-400, border-yellow-500/30)
- **error**: Rosso (bg-red-500/20, text-red-400, border-red-500/30)
- **info**: Blu (bg-blue-500/20, text-blue-400, border-blue-500/30)

### Icon Gradients

- Gradienti basati su status (from-{color}-500 to-{color}-500)
- Background colorato per icona

### Limitazioni

- Icona solo stringa (emoji/carattere), non ReactNode
- Count-up solo per numeri, stringhe mostrate direttamente
- Loading state generico (non personalizzabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
