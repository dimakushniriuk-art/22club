# Componente: ClientiFiltriAvanzati

## 📋 Descrizione

Modal dialog per filtri avanzati clienti. Permette di filtrare per data iscrizione (range), allenamenti minimi (slider) e documenti in scadenza (switch). Utilizza DateRangePicker e Slider.

## 📁 Percorso File

`src/components/dashboard/clienti-filtri-avanzati.tsx`

## 🔧 Props

```typescript
interface ClientiFiltriAvanzatiProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ClienteFilters
  onApply: (filters: Partial<ClienteFilters>) => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`filters`** (ClienteFilters, required): Filtri correnti
- **`onApply`** (function, required): Callback applica filtri

## 📦 Dipendenze

### React Hooks

- `useState` da `react`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` da `@/components/ui`
- `Button`, `DateRangePicker`, `Slider`, `Switch` da `@/components/ui`

### Icons

- `Filter`, `Calendar`, `Target`, `FileWarning` da `lucide-react`

### Types

- `ClienteFilters` da `@/types/cliente`

## ⚙️ Funzionalità

### Core

1. **Filtro Data Iscrizione**: DateRangePicker per intervallo date
2. **Filtro Allenamenti Minimi**: Slider per numero minimo allenamenti (0-30)
3. **Filtro Documenti Scadenza**: Switch per solo documenti in scadenza
4. **Applica/Reset**: Bottoni per applicare o resettare filtri

### Filtri Disponibili

1. **Data Iscrizione**: Range date (da/a) con DateRangePicker
2. **Allenamenti Minimi**: Slider 0-30 con valore visualizzato
3. **Solo Documenti Scadenza**: Switch on/off

### Funzionalità Avanzate

- **Sincronizzazione State**: Inizializza state da props filters
- **Reset Filtri**: Bottone per resettare tutti i filtri
- **Validazione**: Gestione valori null/undefined
- **Sezioni Organizzate**: Ogni filtro in sezione separata con icona

### UI/UX

- Modal con header icona e descrizione
- Sezioni organizzate con icone
- DateRangePicker integrato
- Slider con valore visualizzato
- Switch con label e descrizione
- Bottoni azione in footer

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader (con icona Filter)
      ├── div (space-y-6)
      │   ├── Sezione Data Iscrizione
      │   │   ├── Label + Calendar icon
      │   │   └── DateRangePicker
      │   ├── Sezione Allenamenti Minimi
      │   │   ├── Label + Target icon + Valore
      │   │   ├── Slider
      │   │   └── Descrizione
      │   └── Sezione Documenti Scadenza
      │       ├── Label + FileWarning icon + Descrizione
      │       └── Switch
      └── DialogFooter
          ├── Button Reset
          └── Button Applica
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClientiFiltriAvanzati } from '@/components/dashboard/clienti-filtri-avanzati'

function ClientsPage() {
  const [filters, setFilters] = useState<ClienteFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  return (
    <ClientiFiltriAvanzati
      open={showFilters}
      onOpenChange={setShowFilters}
      filters={filters}
      onApply={(newFilters) => setFilters({ ...filters, ...newFilters })}
    />
  )
}
```

## 🔍 Note Tecniche

### Formato Date

- Date convertite da ISO string a Date object per DateRangePicker
- DateRangePicker restituisce `{ from: Date | null, to: Date | null }`
- Conversione a ISO string per `onApply`

### Slider

- Range: 0-30
- Step: 1
- Valore visualizzato in label: "Allenamenti Minimi: X"
- Se valore 0, non applica filtro (null)

### Limitazioni

- Solo 3 filtri (non estendibile facilmente)
- DateRangePicker deve essere componente UI disponibile
- Slider range fisso (0-30, non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
