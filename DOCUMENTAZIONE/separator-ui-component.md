# Componente: Separator (UI Base)

## 📋 Descrizione

Componente separator per separatori visivi. Supporta orientamento orizzontale/verticale, decorative option e accessibilità. Utilizzato per separare sezioni, contenuti e layout.

## 📁 Percorso File

`src/components/ui/separator.tsx`

## 🔧 Props

```typescript
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}
```

### Dettaglio Props

- **`orientation`** ('horizontal' | 'vertical', optional): Orientamento separatore (default: 'horizontal')
- **`decorative`** (boolean, optional): Separatore decorativo (default: true)
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per div

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **2 Orientamenti**: horizontal, vertical
2. **Decorative Option**: Separatore decorativo o funzionale
3. **Accessibility**: ARIA attributes appropriati
4. **Flexible Sizing**: Dimensioni flessibili

### Funzionalità Avanzate

- **Role Management**: role="none" (decorative) o role="separator" (funzionale)
- **Aria Orientation**: aria-orientation per accessibilità
- **Size Variants**: h-[1px] (horizontal) o w-[1px] (vertical)
- **Shrink Prevention**: shrink-0 per mantenere dimensione

### UI/UX

- Separatore sottile
- Colore border
- Orientamento flessibile
- Layout responsive

## 🎨 Struttura UI

```
Div (separator)
  └── Dimensioni dinamiche per orientamento
```

## 💡 Esempi d'Uso

```tsx
// Separatore orizzontale
<Separator />

// Separatore verticale
<Separator orientation="vertical" />

// Separatore funzionale
<Separator decorative={false} />

// Separatore in layout
<div className="flex items-center gap-2">
  <span>Testo</span>
  <Separator orientation="vertical" />
  <span>Altro testo</span>
</div>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- 2 orientamenti: horizontal (h-[1px] w-full), vertical (h-full w-[1px])
- Decorative: role="none" (default), funzionale: role="separator"
- Aria-orientation per accessibilità
- Shrink-0 per prevenire ridimensionamento
- Background: bg-border
- Layout flessibile
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
