# Componente: Select (UI Base)

## 📋 Descrizione

Componente select per selezioni dropdown. Supporta 3 varianti, 3 dimensioni, label, helper text, error message, onValueChange callback e sub-componenti compatibili con Radix UI API. Utilizzato per form e selezioni.

## 📁 Percorso File

`src/components/ui/select.tsx`

## 🔧 Props

### Select Props

```typescript
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  helperText?: string
  errorMessage?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onValueChange?: (value: string) => void
}
```

### Sub-components

- `SelectTrigger` - Trigger button per Radix UI compatibility
- `SelectValue` - Value display con placeholder
- `SelectContent` - Content container
- `SelectItem` - Option item

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **3 Varianti**: default, outline, ghost
2. **3 Dimensioni**: sm, md, lg
3. **Label**: Label opzionale sopra select
4. **Helper/Error Text**: Testo helper o errore sotto select
5. **onValueChange**: Callback per cambio valore
6. **Radix UI Compatibility**: Sub-componenti compatibili con Radix UI API

### Funzionalità Avanzate

- **Backdrop Blur**: Background con backdrop-blur-sm
- **Error State**: Border e focus ring rossi per errori
- **Focus States**: Focus ring colorato
- **Hover Effects**: Hover con shadow e colori
- **Disabled State**: Opacity e cursor not-allowed

### UI/UX

- Select con rounded-lg
- Background semi-trasparente
- Border colorato per variante
- Focus ring colorato
- Label con font-medium
- Helper/error text con text-xs
- Layout con spacing

## 🎨 Struttura UI

```
Container (se label/helper/error)
  ├── Label (se presente)
  ├── Select Element
  └── Helper/Error Text (se presente)
      └── P (text-xs, text-tertiary o text-error)
```

## 💡 Esempi d'Uso

```tsx
// Select base
<Select>
  <option value="1">Opzione 1</option>
  <option value="2">Opzione 2</option>
</Select>

// Select con label e helper
<Select
  label="Categoria"
  helperText="Seleziona una categoria"
  onValueChange={(value) => console.log(value)}
>
  <option value="">Seleziona...</option>
  <option value="cat1">Categoria 1</option>
  <option value="cat2">Categoria 2</option>
</Select>

// Select con errore
<Select
  label="Ruolo"
  errorMessage="Seleziona un ruolo"
>
  <option value="">Seleziona...</option>
  <option value="admin">Admin</option>
  <option value="user">User</option>
</Select>

// Select con variante
<Select variant="outline" size="lg">
  <option value="1">Opzione</option>
</Select>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- 3 varianti con background e border diversi
- Dimensioni: sm (h-8), md (h-10), lg (h-12)
- Backdrop blur per background semi-trasparente
- Error state: border-state-error e focus ring state-error
- Disabled state con opacity-50 e cursor-not-allowed
- Focus ring primary/30 per accessibilità
- Hover effects con shadow-xl
- Sub-componenti per compatibilità Radix UI
- Transizioni smooth (duration-200)
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
