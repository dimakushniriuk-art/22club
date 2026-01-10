# Componente: PaymentsFilters

## 📋 Descrizione

Componente card per filtri pagamenti. Include ricerca, filtro metodo pagamento, filtro stato e bottone reset. Layout grid responsive.

## 📁 Percorso File

`src/components/dashboard/pagamenti/payments-filters.tsx`

## 🔧 Props

```typescript
interface PaymentsFiltersProps {
  searchTerm: string
  methodFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onMethodFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onReset: () => void
}
```

### Dettaglio Props

- **`searchTerm`** (string, required): Termine ricerca corrente
- **`methodFilter`** (string, required): Filtro metodo corrente
- **`statusFilter`** (string, required): Filtro stato corrente
- **`onSearchChange`** (function, required): Callback cambio ricerca
- **`onMethodFilterChange`** (function, required): Callback cambio filtro metodo
- **`onStatusFilterChange`** (function, required): Callback cambio filtro stato
- **`onReset`** (function, required): Callback reset filtri

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Button`, `Input` da `@/components/ui`
- `SimpleSelect` da `@/components/ui`

### Icons

- `Search`, `X` da `lucide-react`

### Data

- `PAYMENT_METHODS`, `PAYMENT_FILTERS` da `@/data/mock-payments-data`

## ⚙️ Funzionalità

### Core

1. **Ricerca**: Input ricerca con icona
2. **Filtro Metodo**: Select per metodo pagamento
3. **Filtro Stato**: Select per stato pagamento
4. **Reset**: Bottone per resettare tutti i filtri

### Funzionalità Avanzate

- **Grid Layout**: Grid responsive (1 colonna mobile, 4 desktop)
- **Card Styling**: Card con gradiente background e border blue
- **Icona Ricerca**: Icona Search nell'input
- **Bottone Reset**: Icona X per reset

### UI/UX

- Card con gradiente e border
- Layout grid responsive
- Input ricerca prominente
- Select per filtri
- Bottone reset visibile

## 🎨 Struttura UI

```
Card (variant trainer, gradient background)
  └── CardContent (p-4)
      └── div (grid 1/4 colonne, gap-4)
          ├── Input Search (con icona)
          ├── SimpleSelect Metodo
          ├── SimpleSelect Stato
          └── Button Reset (con icona X)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { PaymentsFilters } from '@/components/dashboard/pagamenti/payments-filters'

function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  return (
    <PaymentsFilters
      searchTerm={searchTerm}
      methodFilter={methodFilter}
      statusFilter={statusFilter}
      onSearchChange={setSearchTerm}
      onMethodFilterChange={setMethodFilter}
      onStatusFilterChange={setStatusFilter}
      onReset={() => {
        setSearchTerm('')
        setMethodFilter('')
        setStatusFilter('')
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Data Mock

- Utilizza `PAYMENT_METHODS` e `PAYMENT_FILTERS` da `@/data/mock-payments-data`
- Opzioni hardcoded (non caricate dinamicamente)

### Limitazioni

- Opzioni filtri da mock data (non configurabili)
- Solo 3 filtri (ricerca, metodo, stato)
- Reset resetta tutti i filtri (non selettivo)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
