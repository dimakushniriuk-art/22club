# Componente: DocumentsFilters

## 📋 Descrizione

Componente card per filtri documenti. Include ricerca, filtro stato, filtro categoria e bottone reset. Layout grid responsive. Utilizza mock data per opzioni.

## 📁 Percorso File

`src/components/dashboard/documenti/documents-filters.tsx`

## 🔧 Props

```typescript
interface DocumentsFiltersProps {
  searchTerm: string
  statusFilter: string
  categoryFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onReset: () => void
}
```

### Dettaglio Props

- **`searchTerm`** (string, required): Termine ricerca corrente
- **`statusFilter`** (string, required): Filtro stato corrente
- **`categoryFilter`** (string, required): Filtro categoria corrente
- **`onSearchChange`** (function, required): Callback cambio ricerca
- **`onStatusFilterChange`** (function, required): Callback cambio filtro stato
- **`onCategoryFilterChange`** (function, required): Callback cambio filtro categoria
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

- `DOCUMENT_CATEGORIES`, `DOCUMENT_STATUSES` da `@/data/mock-documents-data`

## ⚙️ Funzionalità

### Core

1. **Ricerca**: Input ricerca con icona
2. **Filtro Stato**: Select per stato documento
3. **Filtro Categoria**: Select per categoria documento
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
          ├── SimpleSelect Stato
          ├── SimpleSelect Categoria
          └── Button Reset (con icona X)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { DocumentsFilters } from '@/components/dashboard/documenti/documents-filters'

function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  return (
    <DocumentsFilters
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      categoryFilter={categoryFilter}
      onSearchChange={setSearchTerm}
      onStatusFilterChange={setStatusFilter}
      onCategoryFilterChange={setCategoryFilter}
      onReset={() => {
        setSearchTerm('')
        setStatusFilter('')
        setCategoryFilter('')
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Data Mock

- Utilizza `DOCUMENT_CATEGORIES` e `DOCUMENT_STATUSES` da `@/data/mock-documents-data`
- Opzioni hardcoded (non caricate dinamicamente)

### Limitazioni

- Opzioni filtri da mock data (non configurabili)
- Solo 3 filtri (ricerca, stato, categoria)
- Reset resetta tutti i filtri (non selettivo)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
