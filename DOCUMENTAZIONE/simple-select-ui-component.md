# Componente: SimpleSelect (UI Base)

## 📋 Descrizione

Componente select semplice con dropdown custom. Supporta options array, value controllato, placeholder, disabled state, portal rendering, posizionamento dinamico e click outside. Utilizzato per selezioni semplici senza dipendenze esterne.

## 📁 Percorso File

`src/components/ui/simple-select.tsx`

## 🔧 Props

```typescript
interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: Array<{ value: string; label: string }>
  className?: string
  disabled?: boolean
}
```

### Dettaglio Props

- **`value`** (string, optional): Valore selezionato
- **`onValueChange`** (function, optional): Callback per cambio valore
- **`placeholder`** (string, optional): Placeholder (default: 'Seleziona...')
- **`options`** (array, required): Array di opzioni {value, label}
- **`className`** (string, optional): Classi CSS aggiuntive
- **`disabled`** (boolean, optional): Disabilita select (default: false)

## 📦 Dipendenze

### React

- `React.useState`, `React.useEffect`, `React.useRef`, `React.useCallback`, `createPortal` da `react`
- `ChevronDown` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Options Array**: Array di opzioni {value, label}
2. **Value Control**: Valore controllato
3. **Placeholder**: Placeholder quando nessuna selezione
4. **Dropdown**: Dropdown custom con portal
5. **Position Tracking**: Posizionamento dinamico con getBoundingClientRect
6. **Click Outside**: Chiusura con click fuori

### Funzionalità Avanzate

- **Portal Rendering**: Rendering dropdown in portal
- **Dynamic Positioning**: Posizionamento dinamico con requestAnimationFrame
- **Scroll Tracking**: Aggiornamento posizione durante scroll
- **Resize Tracking**: Aggiornamento posizione durante resize
- **Backdrop**: Backdrop per chiudere dropdown
- **Selected Highlight**: Evidenziazione opzione selezionata

### UI/UX

- Button trigger con chevron
- Dropdown con backdrop blur
- Opzioni cliccabili
- Hover effects
- Selected state
- Animazioni smooth

## 🎨 Struttura UI

```
Container (relative)
  ├── Button Trigger
  │   ├── Selected Label / Placeholder
  │   └── ChevronDown Icon
  ├── Dropdown (portal, fixed)
  │   └── Options List
  │       └── Option Button[]
  └── Backdrop (portal, se open)
```

## 💡 Esempi d'Uso

```tsx
// SimpleSelect base
<SimpleSelect
  options={[
    { value: '1', label: 'Opzione 1' },
    { value: '2', label: 'Opzione 2' }
  ]}
  onValueChange={(value) => console.log(value)}
/>

// SimpleSelect controllato
<SimpleSelect
  value={selectedValue}
  onValueChange={setSelectedValue}
  options={options}
  placeholder="Seleziona..."
/>

// SimpleSelect disabilitato
<SimpleSelect
  options={options}
  disabled
/>
```

## 📝 Note Tecniche

- Portal rendering con createPortal in document.body
- Posizionamento dinamico con getBoundingClientRect
- RequestAnimationFrame loop per tracking continuo
- Scroll e resize listeners per aggiornamento posizione
- Click outside detection con event listeners
- Backdrop con z-index z-[9998]
- Dropdown con z-index z-[9999]
- Fixed positioning per evitare overflow issues
- Selected state con bg-teal-500/30
- Hover effects con bg-teal-500/20
- ChevronDown rotation quando aperto
- Backdrop blur per dropdown
- Transizioni smooth
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
