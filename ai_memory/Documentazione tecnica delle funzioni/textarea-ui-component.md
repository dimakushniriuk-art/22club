# Componente: Textarea (UI Base)

## 📋 Descrizione

Componente textarea per input testi lunghi. Supporta 3 varianti, 3 dimensioni, label, helper text, error message e auto-resize. Utilizzato per commenti, note, descrizioni e input testi estesi.

## 📁 Percorso File

`src/components/ui/textarea.tsx`

## 🔧 Props

```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  errorMessage?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}
```

### Dettaglio Props

- **`label`** (string, optional): Label sopra textarea
- **`helperText`** (string, optional): Testo helper sotto textarea
- **`errorMessage`** (string, optional): Messaggio errore (sovrascrive helperText)
- **`variant`** (string, optional): Variante stile (default: 'default')
- **`size`** ('sm' | 'md' | 'lg', optional): Dimensione textarea (default: 'md')
- **`rows`** (number, optional): Numero righe iniziali
- **`disabled`** (boolean, optional): Disabilita textarea
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per textarea

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **3 Varianti**: default, outline, ghost
2. **3 Dimensioni**: sm, md, lg
3. **Label**: Label opzionale sopra textarea
4. **Helper/Error Text**: Testo helper o errore sotto textarea
5. **Error State**: Stile error quando errorMessage presente

### Funzionalità Avanzate

- **Min Height**: Min-height dinamico per dimensione
- **Error Styling**: Border e focus ring rossi per errori
- **Focus Ring**: Focus ring cyan per accessibilità
- **Resize**: Resize-none per controllo dimensioni
- **Placeholder**: Placeholder con text-tertiary

### UI/UX

- Textarea con rounded-md
- Background variabile per variante
- Border colorato
- Focus ring colorato
- Label con font-medium
- Helper/error text con text-xs
- Layout con spacing

## 🎨 Struttura UI

```
Container (space-y-2)
  ├── Label (se presente)
  ├── Textarea Element
  └── Helper/Error Text (se presente)
      └── P (text-xs, text-tertiary o text-error)
```

## 💡 Esempi d'Uso

```tsx
// Textarea base
<Textarea placeholder="Scrivi qui..." />

// Textarea con label e helper
<Textarea
  label="Note"
  helperText="Aggiungi note aggiuntive"
  rows={4}
/>

// Textarea con errore
<Textarea
  label="Descrizione"
  errorMessage="Descrizione troppo corta"
/>

// Textarea con variante
<Textarea
  variant="outline"
  placeholder="Commento"
/>

// Textarea con dimensione
<Textarea
  size="lg"
  rows={6}
/>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- 3 varianti: default (bg-background-secondary), outline (bg-transparent), ghost (bg-transparent, border-transparent)
- Dimensioni: sm (min-h-60px), md (min-h-80px), lg (min-h-100px)
- Padding dinamico: sm (px-2 py-1), md (px-3 py-2), lg (px-4 py-3)
- Error state: border-state-error e focus ring state-error
- Disabled state con opacity-50 e cursor-not-allowed
- Focus ring cyan-500 per accessibilità
- Resize-none per controllo dimensioni
- Placeholder con text-tertiary
- Layout con spacing consistente
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
