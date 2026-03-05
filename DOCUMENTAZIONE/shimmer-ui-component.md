# Componente: Shimmer (UI Base)

## 📋 Descrizione

Componente shimmer per loading states avanzati. Include Shimmer base, ShimmerList, ShimmerCard, ShimmerChart, ShimmerTable, ShimmerKPI con animazioni Framer Motion. Utilizzato per placeholder durante caricamento, skeleton avanzati e loading states complessi.

## 📁 Percorso File

`src/components/shared/ui/shimmer.tsx`

## 🔧 Props

### Shimmer Props

```typescript
interface ShimmerProps {
  height?: number | string
  width?: number | string
  className?: string
  rounded?: boolean
}
```

### ShimmerList Props

```typescript
{
  count?: number
  itemHeight?: number
  itemWidth?: string
  className?: string
  gap?: number
}
```

### ShimmerCard Props

```typescript
{
  className?: string
  showAvatar?: boolean
  lines?: number
}
```

### ShimmerChart Props

```typescript
{
  className?: string
  height?: number
  type?: 'line' | 'bar' | 'pie'
}
```

### ShimmerTable Props

```typescript
{
  rows?: number
  columns?: number
  className?: string
}
```

### ShimmerKPI Props

```typescript
{
  count?: number
  className?: string
}
```

## 📦 Dipendenze

### React

- `React` da `react`
- `motion` da `framer-motion`

## ⚙️ Funzionalità

### Core

1. **Shimmer Base**: Shimmer singolo con animazione gradient
2. **ShimmerList**: Lista shimmer con gap configurabile
3. **ShimmerCard**: Card shimmer con avatar opzionale
4. **ShimmerChart**: Chart shimmer (line, bar, pie)
5. **ShimmerTable**: Tabella shimmer con righe/colonne
6. **ShimmerKPI**: KPI cards shimmer

### Funzionalità Avanzate

- **Gradient Animation**: Animazione gradient con Framer Motion
- **Framer Motion**: Animazione x da -100% a 100%
- **Multiple Variants**: Varianti per diversi use case
- **Configurable**: Dimensioni e stili configurabili
- **Responsive**: Layout responsive per ogni variante

### UI/UX

- Shimmer con animazione gradient
- Varianti per diversi layout
- Animazioni smooth
- Dimensioni configurabili
- Layout responsive

## 🎨 Struttura UI

```
Shimmer (relative overflow-hidden)
  └── Gradient Overlay (absolute, animate x)
      └── Gradient from-transparent via-white/10 to-transparent
```

## 💡 Esempi d'Uso

```tsx
// Shimmer base
<Shimmer height={20} width="100%" />

// ShimmerList
<ShimmerList count={5} itemHeight={16} gap={8} />

// ShimmerCard
<ShimmerCard showAvatar lines={3} />

// ShimmerChart
<ShimmerChart type="bar" height={200} />

// ShimmerTable
<ShimmerTable rows={5} columns={4} />

// ShimmerKPI
<ShimmerKPI count={4} />
```

## 📝 Note Tecniche

- Integrazione con Framer Motion per animazioni
- Gradient animation: x da -100% a 100% con repeat Infinity
- Duration 1.5s per animazione smooth
- Gradient: from-transparent via-white/10 to-transparent
- ShimmerList: array di Shimmer con gap configurabile
- ShimmerCard: layout card con avatar opzionale e linee
- ShimmerChart: varianti per line, bar, pie
- ShimmerTable: header + rows con colonne
- ShimmerKPI: grid di KPI cards
- Dimensioni configurabili per ogni variante
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
