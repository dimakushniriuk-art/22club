# Componente: Skeleton (UI Base)

## 📋 Descrizione

Componente skeleton per loading states. Supporta 3 varianti di forma, 3 animazioni e dimensioni personalizzabili. Utilizzato per placeholder durante caricamento contenuti.

## 📁 Percorso File

`src/components/ui/skeleton.tsx`

## 🔧 Props

```typescript
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
}
```

### Dettaglio Props

- **`variant`** (string, optional): Variante forma (default: 'default')
- **`animation`** ('pulse' | 'wave' | 'none', optional): Tipo animazione (default: 'pulse')
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per div

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **3 Varianti Forma**: default (rounded-md), circular (rounded-full), rectangular (rounded-none)
2. **3 Animazioni**: pulse, wave, none
3. **Background**: Background secondary per contrasto
4. **Dimensioni Personalizzabili**: Dimensioni tramite className

### Funzionalità Avanzate

- **Pulse Animation**: Animazione pulse standard
- **Wave Animation**: Animazione wave con gradient
- **No Animation**: Nessuna animazione
- **Flexible Sizing**: Dimensioni tramite className o style

### UI/UX

- Skeleton con background secondary
- Border radius variabile per variante
- Animazioni smooth
- Layout flessibile

## 🎨 Struttura UI

```
Div (background-secondary)
  ├── Variant Classes (border-radius)
  └── Animation Classes (pulse/wave/none)
```

## 💡 Esempi d'Uso

```tsx
// Skeleton base
<Skeleton className="h-4 w-full" />

// Skeleton circolare (avatar)
<Skeleton variant="circular" className="h-12 w-12" />

// Skeleton rettangolare
<Skeleton variant="rectangular" className="h-20 w-full" />

// Skeleton con wave animation
<Skeleton animation="wave" className="h-6 w-3/4" />

// Skeleton senza animazione
<Skeleton animation="none" className="h-8 w-full" />

// Skeleton card
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
  <Skeleton className="h-4 w-4/6" />
</div>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- 3 varianti: default (rounded-md), circular (rounded-full), rectangular (rounded-none)
- 3 animazioni: pulse (animate-pulse), wave (gradient animato), none (nessuna)
- Background: bg-background-secondary
- Wave animation: gradient con bg-[length:200%_100%]
- Dimensioni tramite className o style props
- Layout flessibile per qualsiasi forma
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
