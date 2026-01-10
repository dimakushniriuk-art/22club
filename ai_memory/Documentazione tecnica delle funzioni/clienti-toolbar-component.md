# Componente: ClientiToolbar

## 📋 Descrizione

Componente toolbar per pagina clienti. Include ricerca, filtri stato, toggle vista (grid/table), filtri avanzati e menu export. Organizza tutti i controlli principali della pagina clienti.

## 📁 Percorso File

`src/components/dashboard/clienti/clienti-toolbar.tsx`

## 🔧 Props

```typescript
interface ClientiToolbarProps {
  searchTerm: string
  statoFilter: 'tutti' | 'attivo' | 'inattivo' | 'sospeso'
  viewMode: 'table' | 'grid'
  onSearchChange: (value: string) => void
  onStatoFilterChange: (value: 'tutti' | 'attivo' | 'inattivo' | 'sospeso') => void
  onViewModeChange: (mode: 'table' | 'grid') => void
  onShowFiltriAvanzati: () => void
  onExportCSV: () => void
  onExportPDF: () => void
  hasClienti: boolean
}
```

### Dettaglio Props

- **`searchTerm`** (string, required): Termine ricerca corrente
- **`statoFilter`** ('tutti' | 'attivo' | 'inattivo' | 'sospeso', required): Filtro stato corrente
- **`viewMode`** ('table' | 'grid', required): Modalità vista corrente
- **`onSearchChange`** (function, required): Callback cambio ricerca
- **`onStatoFilterChange`** (function, required): Callback cambio filtro stato
- **`onViewModeChange`** (function, required): Callback cambio vista
- **`onShowFiltriAvanzati`** (function, required): Callback mostra filtri avanzati
- **`onExportCSV`** (function, required): Callback export CSV
- **`onExportPDF`** (function, required): Callback export PDF
- **`hasClienti`** (boolean, required): Flag se ci sono clienti (per disabilitare export)

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Button`, `Input` da `@/components/ui`

### Icons

- `Search`, `Filter`, `Grid3x3`, `TableIcon` da `lucide-react`

### Componenti Interni

- `ClientiExportMenu` da `@/components/dashboard/clienti-export-menu`

## ⚙️ Funzionalità

### Core

1. **Ricerca**: Input ricerca con icona
2. **Filtri Stato**: 4 bottoni per filtrare per stato
3. **Toggle Vista**: Bottoni per switchare tra grid e table
4. **Filtri Avanzati**: Bottone per aprire modal filtri avanzati
5. **Export Menu**: Menu dropdown per export CSV/PDF

### Sezioni Toolbar

1. **Filtri e Ricerca** (prima sezione):
   - Input ricerca (flex-1)
   - Bottoni filtro stato (Tutti, Attivi, Inattivi)
   - Bottone filtri avanzati

2. **Toolbar** (seconda sezione):
   - Bottoni vista (Griglia, Tabella)
   - Export menu

### Funzionalità Avanzate

- **Stili Dinamici**: Bottoni filtro con stile attivo/inattivo
- **Gradient Buttons**: Bottoni attivi con gradiente e shadow
- **Responsive Layout**: Flex column su mobile, row su desktop
- **Export Disabled**: Export disabilitato se `!hasClienti`

### UI/UX

- Layout responsive
- Input ricerca prominente
- Bottoni filtro con colori semantici
- Toggle vista con icona
- Export menu integrato

## 🎨 Struttura UI

```
div (2 sezioni)
  ├── Sezione Filtri (p-4)
  │   └── div (flex flex-col md:flex-row)
  │       ├── Input Search (flex-1)
  │       └── div (flex gap-2)
  │           ├── Button Tutti
  │           ├── Button Attivi
  │           ├── Button Inattivi
  │           └── Button Filtri Avanzati
  └── Sezione Toolbar
      └── div (flex justify-between)
          ├── div (flex gap-2)
          │   ├── Button Griglia
          │   └── Button Tabella
          └── ClientiExportMenu
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClientiToolbar } from '@/components/dashboard/clienti/clienti-toolbar'

function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statoFilter, setStatoFilter] = useState<'tutti' | 'attivo' | 'inattivo' | 'sospeso'>(
    'tutti',
  )
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  return (
    <ClientiToolbar
      searchTerm={searchTerm}
      statoFilter={statoFilter}
      viewMode={viewMode}
      onSearchChange={setSearchTerm}
      onStatoFilterChange={setStatoFilter}
      onViewModeChange={setViewMode}
      onShowFiltriAvanzati={() => setShowFilters(true)}
      onExportCSV={() => exportCSV()}
      onExportPDF={() => exportPDF()}
      hasClienti={clienti.length > 0}
    />
  )
}
```

## 🔍 Note Tecniche

### Stili Bottoni Filtro

- **Attivo**: Gradiente colorato, shadow, text-white
- **Inattivo**: Outline, border colorato, hover bg colorato

### Colori Filtri

- **Tutti**: Teal-cyan gradient
- **Attivi**: Green-emerald gradient
- **Inattivi**: Gray-slate gradient

### Limitazioni

- Solo 4 stati filtro (non estendibile facilmente)
- Export callbacks devono essere implementati nel parent
- Layout fisso (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
