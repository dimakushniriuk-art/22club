# Componente: AppointmentsHeader

## 📋 Descrizione

Componente header per la pagina appuntamenti. Include barra di ricerca e filtri per status (tutti, attivi, completati, annullati, programmati).

## 📁 Percorso File

`src/components/appointments/appointments-header.tsx`

## 🔧 Props

```typescript
interface AppointmentsHeaderProps {
  searchTerm: string
  statusFilter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato'
  onSearchChange: (value: string) => void
  onStatusFilterChange: (
    filter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato',
  ) => void
  onNewAppointment: () => void
}
```

### Dettaglio Props

- **`searchTerm`** (string, required): Termine di ricerca corrente
- **`statusFilter`** (string, required): Filtro status corrente
- **`onSearchChange`** (function, required): Callback quando cambia la ricerca
- **`onStatusFilterChange`** (function, required): Callback quando cambia il filtro
- **`onNewAppointment`** (function, required): Callback per creare nuovo appuntamento

## 📦 Dipendenze

### UI Components

- `Input` da `@/components/ui`
- `Button` da `@/components/ui`
- `Search`, `Calendar` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Ricerca**: Barra di ricerca per filtrare appuntamenti
2. **Filtri Status**: Pulsanti per filtrare per status
3. **Nuovo Appuntamento**: Pulsante per creare nuovo appuntamento

### Filtri Disponibili

- **Tutti**: Mostra tutti gli appuntamenti
- **Attivi**: Solo appuntamenti attivi
- **Completati**: Solo appuntamenti completati
- **Annullati**: Solo appuntamenti annullati
- **Programmati**: Solo appuntamenti programmati

### UI/UX

- Layout flex con ricerca a sinistra e filtri a destra
- Input con icona search
- Pulsanti filtri con stato attivo evidenziato
- Design responsive

## 🎨 Struttura UI

```
Container (flex justify-between)
  ├── Sezione Ricerca
  │   └── Input (con icona Search)
  └── Sezione Filtri
      ├── Button "Tutti"
      ├── Button "Attivi"
      ├── Button "Completati"
      └── Button "Annullati"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentsHeader } from '@/components/appointments/appointments-header'

function MyComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato'
  >('tutti')

  return (
    <AppointmentsHeader
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      onSearchChange={setSearchTerm}
      onStatusFilterChange={setStatusFilter}
      onNewAppointment={() => console.log('New appointment')}
    />
  )
}
```

## 🔍 Note Tecniche

### Stile Input

L'input ha uno stile personalizzato:

- Background semi-trasparente
- Bordo teal con focus state
- Icona search a sinistra

### Pulsanti Filtri

I pulsanti filtri cambiano variante in base allo stato:

- **Attivo**: Variante `primary`
- **Inattivo**: Variante `outline`

### Limitazioni

- Non supporta filtri avanzati (data range, atleta, etc.)
- Non mostra conteggio risultati
- Non supporta salvataggio preferenze filtri

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
