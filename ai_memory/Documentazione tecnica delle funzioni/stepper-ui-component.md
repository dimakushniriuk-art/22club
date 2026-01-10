# Componente: Stepper (UI Base)

## 📋 Descrizione

Componente stepper per processi multi-step. Supporta 2 orientamenti (horizontal, vertical), 3 varianti (default, pills, minimal), stati (completed, active, pending), label e descrizioni. Utilizzato per wizard, form multi-step e processi guidati.

## 📁 Percorso File

`src/components/ui/stepper.tsx`

## 🔧 Props

```typescript
interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Array<{
    id: string
    label: string
    description?: string
    completed?: boolean
    active?: boolean
  }>
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'minimal'
}
```

### Dettaglio Props

- **`steps`** (array, required): Array di step con id, label, description, completed, active
- **`orientation`** ('horizontal' | 'vertical', optional): Orientamento stepper (default: 'horizontal')
- **`variant`** ('default' | 'pills' | 'minimal', optional): Variante stile (default: 'default')
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per div

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`
- `Check` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **2 Orientamenti**: horizontal, vertical
2. **3 Varianti**: default, pills, minimal
3. **3 Stati**: completed, active, pending
4. **Labels/Descriptions**: Label e descrizione per ogni step
5. **Connectors**: Linee connessione tra step
6. **Icons**: Check icon per step completati, numero per altri

### Funzionalità Avanzate

- **State Indicators**: Indicatori visivi per ogni stato
- **Variant Styling**: Stili diversi per ogni variante
- **Connector Lines**: Linee tra step (orizzontale/verticale)
- **Number Display**: Numero step per non completati
- **Check Icon**: Check icon per step completati

### UI/UX

- Stepper con layout flex
- Indicatori circolari per step
- Linee connessione tra step
- Label e descrizione
- Stati visivi chiari
- Layout responsive

## 🎨 Struttura UI

```
Stepper (flex, orientation-based)
  └── Step[] (per ogni step)
      ├── Indicator (circolare)
      │   ├── Check Icon (se completed)
      │   └── Number (se !completed)
      ├── Content (se vertical)
      │   ├── Label
      │   └── Description (opzionale)
      └── Connector Line (se !last)
```

## 💡 Esempi d'Uso

```tsx
// Stepper base
<Stepper
  steps={[
    { id: '1', label: 'Step 1', completed: true },
    { id: '2', label: 'Step 2', active: true },
    { id: '3', label: 'Step 3' }
  ]}
/>

// Stepper verticale
<Stepper
  orientation="vertical"
  steps={steps}
/>

// Stepper pills
<Stepper
  variant="pills"
  steps={steps}
/>

// Stepper con descrizioni
<Stepper
  steps={[
    {
      id: '1',
      label: 'Informazioni',
      description: 'Inserisci i tuoi dati',
      completed: true
    }
  ]}
/>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- 2 orientamenti: horizontal (flex row), vertical (flex column)
- 3 varianti: default (w-8 h-8), pills (w-6 h-6), minimal (w-4 h-4)
- 3 stati: completed (bg-brand, Check icon), active (bg-brand, numero), pending (bg-tertiary, numero)
- Connector lines: h-0.5 (horizontal), w-0.5 h-6 (vertical)
- Check icon da lucide-react per step completati
- Numero step per step non completati
- Label e description opzionali
- Transizioni smooth
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
