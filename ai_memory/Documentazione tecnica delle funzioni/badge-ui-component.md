# Componente: Badge (UI Base)

## 📋 Descrizione

Componente badge per etichette, tag e indicatori di stato. Supporta 10 varianti di colore, 3 dimensioni e opzione rounded. Utilizzato per stati, categorie, contatori e indicatori visivi.

## 📁 Percorso File

`src/components/ui/badge.tsx`

## 🔧 Props

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'neutral'
    | 'outline'
    | 'secondary'
    | 'error'
    | 'info'
    | 'default'
    | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
}
```

### Dettaglio Props

- **`variant`** (string, optional): Variante colore badge (default: 'primary')
- **`size`** ('sm' | 'md' | 'lg', optional): Dimensione badge (default: 'md')
- **`rounded`** (boolean, optional): Badge completamente arrotondato (default: false)
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per div

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **10 Varianti**: primary, success, warning, neutral, outline, secondary, error, info, default, destructive
2. **3 Dimensioni**: sm, md, lg
3. **Rounded Option**: Badge completamente arrotondato
4. **Focus States**: Focus visible con ring
5. **Transitions**: Transizioni smooth per hover/focus

### Funzionalità Avanzate

- **Gradient Variants**: Alcune varianti usano gradient (primary, neutral, secondary, default)
- **Border Colors**: Bordi coordinati con varianti
- **Shadow Effects**: Shadow per profondità
- **Accessibility**: Focus visible ring per accessibilità

### UI/UX

- Badge inline-flex con items-center
- Padding e font-size dinamici per dimensione
- Border radius condizionale (rounded-lg o rounded-full)
- Colori coordinati per ogni variante
- Transizioni smooth

## 🎨 Struttura UI

```
Div (inline-flex items-center)
  ├── Variant Classes (colori, background, border)
  ├── Size Classes (padding, font-size)
  ├── Rounded Classes (rounded-lg o rounded-full)
  └── Children (contenuto badge)
```

## 💡 Esempi d'Uso

```tsx
// Badge base
<Badge variant="primary">Nuovo</Badge>

// Badge con dimensione e rounded
<Badge variant="success" size="sm" rounded>
  Attivo
</Badge>

// Badge outline
<Badge variant="outline">In attesa</Badge>

// Badge con contatore
<Badge variant="error" size="lg">
  5
</Badge>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- 10 varianti con colori e stili predefiniti
- Dimensioni: sm (px-2 py-1 text-xs), md (px-3 py-1.5 text-sm), lg (px-4 py-2 text-base)
- Rounded: `rounded-full` se true, altrimenti `rounded-lg`
- Gradient per varianti primary, neutral, secondary, default
- Border coordinato con variante colore
- Shadow per profondità visiva
- Focus visible ring per accessibilità
- Transizioni smooth per interazioni
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
