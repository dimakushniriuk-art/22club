# Componente: DateRangePicker (UI Base)

## 📋 Descrizione

Componente selettore range date per selezionare intervalli di date. Supporta date from/to, validazione (max/min), formattazione date e callback onChange. Utilizzato per filtri date, report e statistiche.

## 📁 Percorso File

`src/components/ui/date-range-picker.tsx`

## 🔧 Props

```typescript
interface DateRangePickerProps {
  from?: Date | null
  to?: Date | null
  onChange?: (from: Date | null, to: Date | null) => void
  className?: string
  placeholder?: string
}
```

### Dettaglio Props

- **`from`** (Date | null, optional): Data inizio range
- **`to`** (Date | null, optional): Data fine range
- **`onChange`** (function, optional): Callback per cambio date
- **`className`** (string, optional): Classi CSS aggiuntive
- **`placeholder`** (string, optional): Placeholder (default: 'Seleziona intervallo date')

## 📦 Dipendenze

### React

- `React.useState`, `React.useEffect` da `react`
- `Calendar` da `lucide-react`

### Components

- `Input` da `./input`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Date From/To**: Due input date per range
2. **Validation**: Max/min validation tra date
3. **Formatting**: Formattazione date YYYY-MM-DD
4. **State Sync**: Sincronizzazione stato interno con props
5. **Change Callback**: Callback onChange per entrambe le date

### Funzionalità Avanzate

- **Max/Min Validation**: Max su from (non può essere dopo to), min su to (non può essere prima di from)
- **Date Formatting**: Formattazione automatica per input date
- **State Management**: Gestione stato interno e sincronizzazione con props
- **Effect Sync**: useEffect per sincronizzare stato quando props cambiano

### UI/UX

- Layout flex column con gap
- Icone Calendar per ogni input
- Label "Da:" e "A:"
- Input date con validazione
- Layout responsive

## 🎨 Struttura UI

```
Container (flex flex-col gap-2)
  ├── From Section
  │   ├── Label (Calendar icon + "Da:")
  │   └── Input (type="date", max=toValue)
  └── To Section
      ├── Label (Calendar icon + "A:")
      └── Input (type="date", min=fromValue)
```

## 💡 Esempi d'Uso

```tsx
// DateRangePicker base
<DateRangePicker
  from={startDate}
  to={endDate}
  onChange={(from, to) => {
    setStartDate(from)
    setEndDate(to)
  }}
/>

// DateRangePicker controllato
<DateRangePicker
  from={filterFrom}
  to={filterTo}
  onChange={handleDateRangeChange}
  placeholder="Seleziona periodo"
/>
```

## 📝 Note Tecniche

- Gestione stato interno con useState per fromValue e toValue
- Formattazione date con formatDate helper (YYYY-MM-DD)
- Validazione: max su from input (non può essere dopo to), min su to input (non può essere prima di from)
- Sincronizzazione con props tramite useEffect
- Callback onChange chiamato per ogni cambio date
- Layout flex column con gap-2
- Icone Calendar per visualizzazione
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
