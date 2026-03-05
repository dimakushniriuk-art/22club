# Componente: Checkbox (UI Base)

## 📋 Descrizione

Componente checkbox con label, helper text e error message. Supporta stati di errore, disabilitazione e integrazione con form. Utilizzato per selezioni multiple e form.

## 📁 Percorso File

`src/components/ui/checkbox.tsx`

## 🔧 Props

```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorMessage?: string
}
```

### Dettaglio Props

- **`label`** (string, optional): Label checkbox
- **`helperText`** (string, optional): Testo helper sotto checkbox
- **`errorMessage`** (string, optional): Messaggio errore (sovrascrive helperText)
- **`checked`** (boolean, optional): Stato checked
- **`disabled`** (boolean, optional): Disabilita checkbox
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per input checkbox

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Checkbox Input**: Input checkbox standard
2. **Label**: Label opzionale accanto checkbox
3. **Helper Text**: Testo helper sotto checkbox
4. **Error Message**: Messaggio errore con stile error
5. **Error State**: Stile error quando errorMessage presente

### Funzionalità Avanzate

- **Error Styling**: Border e focus ring rossi per errori
- **Disabled State**: Opacity e cursor not-allowed quando disabilitato
- **Focus Ring**: Focus ring cyan per accessibilità
- **Layout Spacing**: Spacing consistente tra elementi

### UI/UX

- Checkbox con dimensioni 4x4
- Label con font-medium
- Helper text con text-tertiary
- Error message con text-error
- Layout flex con spacing

## 🎨 Struttura UI

```
Container (space-y-2)
  ├── Checkbox Row (flex items-center space-x-2)
  │   ├── Input Checkbox
  │   └── Label (se presente)
  └── Helper/Error Text (se presente)
      └── P (text-xs, text-tertiary o text-error)
```

## 💡 Esempi d'Uso

```tsx
// Checkbox base
<Checkbox label="Accetta termini" />

// Checkbox con helper
<Checkbox
  label="Newsletter"
  helperText="Ricevi aggiornamenti via email"
/>

// Checkbox con errore
<Checkbox
  label="Privacy"
  errorMessage="Devi accettare la privacy"
/>

// Checkbox controllato
<Checkbox
  label="Opzione"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
/>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Checkbox con dimensioni h-4 w-4
- Border e focus ring dinamici in base a errorMessage
- Label opzionale con font-medium
- Helper text mostrato solo se non c'è errorMessage
- Error message sovrascrive helper text
- Disabled state con opacity-50 e cursor-not-allowed
- Focus ring cyan-500 per accessibilità
- Layout con spacing consistente
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
