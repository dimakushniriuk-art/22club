# Componente: Label (UI Base)

## 📋 Descrizione

Componente label semplice per form. Supporta peer-disabled states e integrazione con componenti form. Utilizzato per etichette input, checkbox, select e altri form controls.

## 📁 Percorso File

`src/components/ui/label.tsx`

## 🔧 Props

```typescript
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>
```

### Dettaglio Props

- **`htmlFor`** (string, optional): ID elemento associato
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per label

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Label Standard**: Label HTML standard
2. **Peer Disabled**: Stili per peer-disabled (quando elemento associato è disabilitato)
3. **Text Styling**: Font-medium e text-primary
4. **Leading None**: Leading-none per allineamento

### Funzionalità Avanzate

- **Peer States**: Supporto per peer-disabled con cursor e opacity
- **Accessibility**: Integrazione con htmlFor per accessibilità
- **Consistent Styling**: Stili consistenti con design system

### UI/UX

- Label con text-sm e font-medium
- Text color primary
- Leading-none per allineamento
- Peer-disabled states
- Layout flessibile

## 🎨 Struttura UI

```
Label (label element)
  └── Children (testo label)
```

## 💡 Esempi d'Uso

```tsx
// Label base
<Label htmlFor="email">Email</Label>
<Input id="email" />

// Label con componente
<Label>
  <Checkbox /> Accetta termini
</Label>

// Label con peer disabled
<Label htmlFor="disabled-input">
  Input Disabilitato
</Label>
<Input id="disabled-input" disabled />
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Stili: text-sm, font-medium, text-primary, leading-none
- Peer-disabled: cursor-not-allowed, opacity-70
- Integrazione con htmlFor per accessibilità
- Stili consistenti con design system
- Layout flessibile

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
