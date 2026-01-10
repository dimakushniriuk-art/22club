# Componente: AppointmentsList

## 📋 Descrizione

Componente per visualizzare la lista di appuntamenti con gestione di loading state, empty state e filtri. Mostra gli appuntamenti usando `AppointmentItem`.

## 📁 Percorso File

`src/components/appointments/appointments-list.tsx`

## 🔧 Props

```typescript
interface AppointmentsListProps {
  appointments: AppointmentTable[]
  appointmentsLoading: boolean
  searchTerm: string
  statusFilter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato'
  onNewAppointment: () => void
  onSearchClear: () => void
  onView: (appointment: AppointmentTable) => void
  onEdit: (appointment: AppointmentTable) => void
  onDelete: (appointment: AppointmentTable) => void
  formatDateTime: (isoString: string) => { time: string; dateStr: string }
  getStatusColorClasses: (status: string) => string
  getAppointmentType: (apt: AppointmentTable) => string
}
```

### Dettaglio Props

- **`appointments`** (array, required): Array di appuntamenti da visualizzare
- **`appointmentsLoading`** (boolean, required): Stato di caricamento
- **`searchTerm`** (string, required): Termine di ricerca corrente
- **`statusFilter`** (string, required): Filtro status corrente
- **`onNewAppointment`** (function, required): Callback per nuovo appuntamento
- **`onSearchClear`** (function, required): Callback per rimuovere filtri
- **`onView`**, **`onEdit`**, **`onDelete`** (functions, required): Callback per azioni
- **`formatDateTime`**, **`getStatusColorClasses`**, **`getAppointmentType`** (functions, required): Funzioni helper

## 📦 Dipendenze

### UI Components

- `Button` da `@/components/ui`
- `Calendar` da `lucide-react`

### Components

- `AppointmentItem` da `./appointment-item`

### Types

- `AppointmentTable` da `@/types/appointment`

## ⚙️ Funzionalità

### Core

1. **Lista Appuntamenti**: Visualizza tutti gli appuntamenti filtrati
2. **Loading State**: Mostra spinner durante caricamento
3. **Empty State**: Mostra messaggio se nessun appuntamento
4. **Gestione Filtri**: Mostra messaggio diverso se filtri attivi

### Stati

- **Loading**: Spinner con messaggio "Caricamento appuntamenti..."
- **Empty (no filtri)**: Messaggio con pulsante "Crea primo appuntamento"
- **Empty (con filtri)**: Messaggio con pulsante "Rimuovi filtri"

### UI/UX

- Layout verticale con spacing
- Icona calendario per empty state
- Gradiente testo per titoli
- Pulsanti call-to-action
- Layout responsive

## 🎨 Struttura UI

```
Container
  ├── Loading State
  │   ├── Spinner
  │   └── Messaggio "Caricamento..."
  ├── Empty State (no filtri)
  │   ├── Icona Calendar
  │   ├── Titolo "Nessun appuntamento trovato"
  │   ├── Descrizione
  │   └── Button "Crea primo appuntamento"
  ├── Empty State (con filtri)
  │   ├── Icona Calendar
  │   ├── Titolo "Nessun appuntamento trovato"
  │   ├── Descrizione "I filtri attuali..."
  │   └── Button "Rimuovi filtri"
  └── Lista Appuntamenti
      └── AppointmentItem (per ogni appuntamento)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentsList } from '@/components/appointments/appointments-list'

function MyComponent() {
  const appointments = [...]
  const formatDateTime = (isoString: string) => {
    // Formattazione date
  }

  return (
    <AppointmentsList
      appointments={appointments}
      appointmentsLoading={false}
      searchTerm=""
      statusFilter="tutti"
      onNewAppointment={() => {}}
      onSearchClear={() => {}}
      onView={(apt) => {}}
      onEdit={(apt) => {}}
      onDelete={(apt) => {}}
      formatDateTime={formatDateTime}
      getStatusColorClasses={(status) => ''}
      getAppointmentType={(apt) => ''}
    />
  )
}
```

## 🔍 Note Tecniche

### Messaggi Empty State

Il messaggio cambia in base ai filtri:

- **Senza filtri**: "Inizia aggiungendo il tuo primo appuntamento..."
- **Con filtri**: "I filtri attuali non corrispondono..."

### Funzioni Helper

Le funzioni `formatDateTime`, `getStatusColorClasses` e `getAppointmentType` devono essere fornite dal parent per coerenza.

### Limitazioni

- Non supporta paginazione
- Non supporta ordinamento
- Non mostra statistiche lista

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
