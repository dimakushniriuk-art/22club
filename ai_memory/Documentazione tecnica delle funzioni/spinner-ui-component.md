# Componente: Spinner (UI Base)

## 📋 Descrizione

Componente spinner per loading states. Supporta 4 dimensioni, animazione spin e accessibilità. Utilizzato per indicare caricamento, operazioni in corso e stati di attesa.

## 📁 Percorso File

`src/components/ui/spinner.tsx`

## 🔧 Props

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}
```

### Dettaglio Props

- **`size`** ('sm' | 'md' | 'lg' | 'xl', optional): Dimensione spinner (default: 'md')
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **4 Dimensioni**: sm, md, lg, xl
2. **Spin Animation**: Animazione rotate continua
3. **Border Style**: Border con trasparenza per effetto
4. **Accessibility**: ARIA attributes per screen readers

### Funzionalità Avanzate

- **Animate Spin**: Animazione CSS rotate infinita
- **Border Gradient**: Border brand con border-t-transparent
- **Size Variants**: Dimensioni e border width dinamici
- **Screen Reader**: Text nascosto per accessibilità

### UI/UX

- Spinner circolare
- Animazione smooth
- Colore brand
- Dimensioni multiple
- Layout flessibile

## 🎨 Struttura UI

```
Div (rounded-full, animate-spin)
  └── Border con trasparenza
  └── Span (sr-only) per accessibilità
```

## 💡 Esempi d'Uso

```tsx
// Spinner base
<Spinner />

// Spinner con dimensione
<Spinner size="lg" />

// Spinner piccolo
<Spinner size="sm" />

// Spinner in button
<Button disabled>
  <Spinner size="sm" className="mr-2" />
  Caricamento...
</Button>

// Spinner full page
<div className="flex items-center justify-center h-screen">
  <Spinner size="xl" />
</div>
```

## 📝 Note Tecniche

- 4 dimensioni: sm (h-4 w-4 border-2), md (h-8 w-8 border-2), lg (h-12 w-12 border-3), xl (h-16 w-16 border-4)
- Animazione: animate-spin (rotate 360deg infinito)
- Border: border-brand con border-t-transparent per effetto
- Rounded-full per forma circolare
- ARIA: role="status", aria-label="Caricamento in corso"
- Screen reader: span con sr-only per testo nascosto
- Layout flessibile
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
