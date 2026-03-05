# Componente: AppointmentsTable

## 📋 Descrizione

Componente tabella per visualizzare una lista di appuntamenti in formato tabellare. Supporta azioni multiple (visualizza, modifica, duplica, elimina) e mostra informazioni complete per ogni appuntamento.

## 📁 Percorso File

`src/components/calendar/appointments-table.tsx`

## 🔧 Props

```typescript
interface AppointmentsTableProps {
  appointments: AppointmentTable[]
  onEdit?: (appointment: AppointmentTable) => void
  onDelete?: (appointment: AppointmentTable) => void
  onDuplicate?: (appointment: AppointmentTable) => void
  onView?: (appointment: AppointmentTable) => void
}
```

### Dettaglio Props

- **`appointments`** (array, required): Array di appuntamenti da visualizzare
- **`onEdit`** (function, optional): Callback chiamato quando si clicca "Modifica" (riceve appointment)
- **`onDelete`** (function, optional): Callback chiamato quando si clicca "Elimina" (riceve appointment)
- **`onDuplicate`** (function, optional): Callback chiamato quando si clicca "Duplica" (riceve appointment)
- **`onView`** (function, optional): Callback chiamato quando si clicca "Visualizza" o sulla riga (riceve appointment)

## 📦 Dipendenze

### UI Components

- `Button` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` da `@/components/ui`
- `Calendar`, `Clock`, `User`, `Edit`, `Trash2`, `Copy`, `Eye`, `CheckCircle2`, `XCircle`, `Circle` da `lucide-react`

### Types

- `AppointmentTable` da `@/types/appointment`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Tabella**: Mostra appuntamenti in formato tabellare
2. **Colonne**: Data, Ora, Atleta, Tipo, Stato, Azioni
3. **Azioni Multiple**: Visualizza, Modifica, Duplica, Elimina
4. **Empty State**: Mostra messaggio quando non ci sono appuntamenti

### Funzionalità Avanzate

- **Rilevamento Tipo**: Estrae tipo appuntamento dalle note o campo `type`
- **Stati Visivi**: Icone colorate per ogni stato (attivo, annullato, completato)
- **Click Riga**: Click su riga intera apre dettaglio (se `onView` presente)
- **Stop Propagation**: Azioni pulsanti non triggerano click riga

### UI/UX

- Tabella responsive con overflow-x-auto
- Header con icona e contatore appuntamenti
- Hover effect sulle righe
- Icone colorate per stati
- Pulsanti azioni con colori semantici
- Empty state con icona e messaggio

## 🎨 Struttura UI

```
div (card con gradiente)
  ├── Header
  │   ├── Icona Calendar
  │   └── Titolo "Lista Appuntamenti (N)"
  └── Tabella
      ├── TableHeader
      │   └── TableRow
      │       ├── TableHead "Data"
      │       ├── TableHead "Ora"
      │       ├── TableHead "Atleta"
      │       ├── TableHead "Tipo"
      │       ├── TableHead "Stato"
      │       └── TableHead "Azioni"
      └── TableBody
          ├── TableRow (per ogni appuntamento)
          │   ├── TableCell (Data con icona)
          │   ├── TableCell (Ora con icona)
          │   ├── TableCell (Atleta con icona)
          │   ├── TableCell (Tipo con Badge)
          │   ├── TableCell (Stato con icona)
          │   └── TableCell (Azioni con pulsanti)
          └── Empty State (se nessun appuntamento)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentsTable } from '@/components/calendar/appointments-table'

function MyComponent() {
  const handleEdit = (appointment: AppointmentTable) => {
    // Apri modal modifica
  }

  const handleView = (appointment: AppointmentTable) => {
    // Mostra dettaglio
  }

  return (
    <AppointmentsTable
      appointments={appointments}
      onEdit={handleEdit}
      onView={handleView}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
    />
  )
}
```

## 🔍 Note Tecniche

### Rilevamento Tipo Appuntamento

Stessa logica di `AppointmentDetail`:

1. Dalle note: "Prima Visita", "Massaggio", "Nutrizionista"
2. Dal campo `type`: "check" → "Riunione", "cardio" → "Cardio", "consulenza" → "Consulenza"
3. Default: "Allenamento"

### Formattazione Date

- **Data**: Formato breve italiano (es: "3 feb 2025")
- **Orario**: Formato 24h (es: "14:30 - 15:30")

### Stati e Icone

- **Attivo**: CheckCircle2 verde (bg-green-500/20, text-green-400)
- **Annullato**: XCircle rosso (bg-red-500/20, text-red-400)
- **Completato**: CheckCircle2 blu (bg-blue-500/20, text-blue-400)
- **Sconosciuto**: Circle grigio (bg-gray-500/20, text-gray-400)

### Gestione Click

- Click su riga: Chiama `onView` se presente
- Click su pulsante azione: Chiama callback specifico e previene propagazione (`e.stopPropagation()`)

### Limitazioni

- Gli appuntamenti vengono già filtrati dalla pagina principale (non gestisce filtri interni)
- Non supporta ordinamento colonne
- Non supporta selezione multipla

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
