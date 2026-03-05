# Componente: Input (UI Base)

## 📋 Descrizione

Componente input principale del design system. Supporta 4 varianti, 3 dimensioni, icone left/right, label, helper text, error message e tutti i tipi input HTML. Utilizzato in form e input fields.

## 📁 Percorso File

`src/components/ui/input.tsx`

## 🔧 Props

```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  errorMessage?: string
}
```

### Dettaglio Props

- **`variant`** (string, optional): Variante stile input (default: 'default')
- **`size`** ('sm' | 'md' | 'lg', optional): Dimensione input (default: 'md')
- **`leftIcon`** (ReactNode, optional): Icona sinistra
- **`rightIcon`** (ReactNode, optional): Icona destra
- **`label`** (string, optional): Label sopra input
- **`helperText`** (string, optional): Testo helper sotto input
- **`errorMessage`** (string, optional): Messaggio errore (sovrascrive helperText)
- **`type`** (string, optional): Tipo input (default: 'text')
- **`disabled`** (boolean, optional): Disabilita input
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per input

## 📦 Dipendenze

### React

- `React.forwardRef`, `React.useId` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **4 Varianti**: default, error, success, warning
2. **3 Dimensioni**: sm, md, lg
3. **Icone**: Left icon e right icon opzionali
4. **Label**: Label opzionale sopra input
5. **Helper/Error Text**: Testo helper o errore sotto input
6. **Auto ID**: Generazione automatica ID se non fornito

### Funzionalità Avanzate

- **Icon Positioning**: Icone posizionate assolutamente left/right
- **Padding Dynamic**: Padding dinamico in base a icone
- **Error State**: Border e focus ring rossi per errori
- **Success/Warning States**: Stati success e warning con colori
- **Focus States**: Focus ring colorato per variante
- **Disabled State**: Opacity e cursor not-allowed

### UI/UX

- Input con rounded-xl
- Background semi-trasparente
- Border colorato per variante
- Focus ring colorato
- Icone posizionate assolutamente
- Label con font-medium
- Helper/error text con text-xs
- Layout con spacing

## 🎨 Struttura UI

```
Container (se label/helper/error)
  ├── Label (se presente)
  ├── Input Container (relative)
  │   ├── Left Icon (se presente, absolute left-3)
  │   ├── Input Element
  │   └── Right Icon (se presente, absolute right-3)
  └── Helper/Error Text (se presente)
      └── P (text-xs, text-tertiary o text-error)
```

## 💡 Esempi d'Uso

```tsx
// Input base
<Input placeholder="Nome" />

// Input con label e helper
<Input
  label="Email"
  type="email"
  helperText="Inserisci la tua email"
/>

// Input con icona
<Input
  leftIcon={<MailIcon />}
  placeholder="Email"
/>

// Input con errore
<Input
  label="Password"
  type="password"
  errorMessage="Password troppo corta"
/>

// Input con variante success
<Input
  variant="success"
  value="Valido"
  readOnly
/>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Utilizza `React.useId` per generazione ID automatica
- 4 varianti con colori border e focus ring
- Dimensioni: sm (h-9), md (h-11), lg (h-12)
- Icone posizionate con absolute e translate-y-1/2
- Padding dinamico: pl-10 se leftIcon, pr-10 se rightIcon
- Error state: border-red-500 e focus ring red
- Success state: border-green-500 e focus ring green
- Warning state: border-yellow-500 e focus ring yellow
- Disabled state con opacity-50 e cursor-not-allowed
- Background semi-trasparente (bg-background-secondary/50)
- Placeholder con text-gray-400
- Layout con spacing consistente
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
