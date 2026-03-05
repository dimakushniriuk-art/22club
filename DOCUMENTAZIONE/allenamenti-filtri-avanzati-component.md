# Componente: AllenamentiFiltriAvanzati

## 📋 Descrizione

Modal dialog per filtri avanzati allenamenti. Permette di filtrare per periodo (tutti, oggi, settimana, mese) o intervallo date personalizzato. Utilizza DateRangePicker per selezione date.

## 📁 Percorso File

`src/components/dashboard/allenamenti-filtri-avanzati.tsx`

## 🔧 Props

```typescript
interface AllenamentiFiltriAvanzatiProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: AllenamentoFilters
  onApply: (filters: Partial<AllenamentoFilters>) => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`filters`** (AllenamentoFilters, required): Filtri correnti
- **`onApply`** (function, required): Callback applica filtri

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` da `@/components/ui/dialog`
- `Button` da `@/components/ui/button`
- `Label` da `@/components/ui/label`
- `Select`, `SelectItem` da `@/components/ui/select`
- `DateRangePicker` da `@/components/ui/date-range-picker`

### Icons

- `Filter`, `Calendar`, `Clock` da `lucide-react`

### Types

- `AllenamentoFilters` da `@/types/allenamento`

## ⚙️ Funzionalità

### Core

1. **Filtro Periodo**: Select per periodo predefinito (tutti, oggi, settimana, mese)
2. **Filtro Date Range**: DateRangePicker per intervallo personalizzato
3. **Applica/Reset**: Bottoni per applicare o resettare filtri
4. **Sincronizzazione**: Sincronizza stato interno con props filters

### Opzioni Periodo

- **Tutti gli allenamenti**: Nessun filtro data
- **Solo oggi**: Filtra solo oggi
- **Questa settimana**: Filtra settimana corrente
- **Questo mese**: Filtra mese corrente

### Funzionalità Avanzate

- **Date Range Personalizzato**: DateRangePicker per intervallo custom
- **Sincronizzazione State**: useEffect per sincronizzare con props
- **Reset Filtri**: Bottone per resettare a "tutti"
- **Validazione**: Gestione date null/undefined

### UI/UX

- Modal con header icona e descrizione
- Sezioni organizzate con icone
- DateRangePicker integrato
- Bottoni azione in footer
- Background blur e border teal

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader (con icona Filter)
      ├── div (grid gap-4)
      │   └── div (periodo section)
      │       ├── Label + Clock icon
      │       └── Select (periodo)
      │   └── div (date range section)
      │       ├── Label + Calendar icon
      │       └── DateRangePicker
      └── DialogFooter
          ├── Button (Reset)
          └── Button (Applica)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AllenamentiFiltriAvanzati } from '@/components/dashboard/allenamenti-filtri-avanzati'

function SchedePage() {
  const [filters, setFilters] = useState<AllenamentoFilters>({ periodo: 'tutti' })
  const [showFilters, setShowFilters] = useState(false)

  return (
    <AllenamentiFiltriAvanzati
      open={showFilters}
      onOpenChange={setShowFilters}
      filters={filters}
      onApply={(newFilters) => setFilters({ ...filters, ...newFilters })}
    />
  )
}
```

## 🔍 Note Tecniche

### Sincronizzazione State

- `useEffect` sincronizza stato interno quando `filters` o `open` cambiano
- Previene desincronizzazione tra props e state interno

### Formato Date

- Date convertite da ISO string a Date object per DateRangePicker
- DateRangePicker restituisce `{ from: Date | undefined, to: Date | undefined }`
- Conversione a ISO string per `onApply`

### Limitazioni

- Solo filtri periodo e date (non supporta altri filtri)
- DateRangePicker deve essere componente UI disponibile
- Reset sempre a "tutti" (non mantiene altri filtri)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
