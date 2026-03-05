# Componente: AppointmentItem

## 📋 Descrizione

Componente per visualizzare un singolo appuntamento nella lista. Mostra informazioni atleta, data/ora, tipo e azioni (visualizza, modifica, elimina).

## 📁 Percorso File

`src/components/appointments/appointment-item.tsx`

## 🔧 Props

```typescript
interface AppointmentItemProps {
  appointment: AppointmentTable
  index: number
  onView: (appointment: AppointmentTable) => void
  onEdit: (appointment: AppointmentTable) => void
  onDelete: (appointment: AppointmentTable) => void
  formatDateTime: (isoString: string) => { time: string; dateStr: string }
  getStatusColorClasses: (status: string) => string
  getAppointmentType: (apt: AppointmentTable) => string
}
```

### Dettaglio Props

- **`appointment`** (AppointmentTable, required): Oggetto appuntamento
- **`index`** (number, required): Indice per animazione staggered
- **`onView`** (function, required): Callback per visualizzare dettagli
- **`onEdit`** (function, required): Callback per modificare
- **`onDelete`** (function, required): Callback per eliminare
- **`formatDateTime`** (function, required): Funzione per formattare date/ora
- **`getStatusColorClasses`** (function, required): Funzione per ottenere classi colore status
- **`getAppointmentType`** (function, required): Funzione per ottenere tipo appuntamento

## 📦 Dipendenze

### UI Components

- `Button` da `@/components/ui`
- `Avatar` da `@/components/ui/avatar`
- `User`, `Dumbbell`, `Edit`, `Trash2` da `lucide-react`

### Types

- `AppointmentTable` da `@/types/appointment`

### Hooks

- `useRouter` da `next/navigation`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Appuntamento**: Mostra tutte le informazioni principali
2. **Azioni**: Permette visualizzazione, modifica ed eliminazione
3. **Navigazione**: Permette navigazione al profilo atleta
4. **Animazioni**: Animazione fade-in con delay basato su index

### UI/UX

- Card con hover effect (scale e shadow)
- Avatar atleta con gradiente glow
- Badge tipo appuntamento
- Pulsanti azioni con icona
- Layout responsive
- Animazione staggered per lista

## 🎨 Struttura UI

```
Container (card con border e hover)
  ├── Sezione Tempo
  │   ├── Data formattata
  │   └── Orario (inizio - fine)
  ├── Separatore verticale
  ├── Sezione Contenuto
  │   ├── Avatar atleta (con glow)
  │   ├── Nome atleta
  │   ├── Badge tipo appuntamento
  │   └── Note (se presenti)
  └── Sezione Azioni
      ├── Button "Visualizza"
      ├── Button "Modifica"
      └── Button "Elimina"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentItem } from '@/components/appointments/appointment-item'

function MyComponent() {
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return {
      time: date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      dateStr: date.toLocaleDateString('it-IT'),
    }
  }

  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'attivo':
        return 'border-teal-500/50'
      default:
        return 'border-gray-500/50'
    }
  }

  const getAppointmentType = (apt: AppointmentTable) => {
    return apt.type || 'Allenamento'
  }

  return (
    <AppointmentItem
      appointment={appointment}
      index={0}
      onView={(apt) => console.log('View', apt)}
      onEdit={(apt) => console.log('Edit', apt)}
      onDelete={(apt) => console.log('Delete', apt)}
      formatDateTime={formatDateTime}
      getStatusColorClasses={getStatusColorClasses}
      getAppointmentType={getAppointmentType}
    />
  )
}
```

## 🔍 Note Tecniche

### Animazione Staggered

Ogni item ha un delay basato su `index * 100ms` per creare un effetto cascata.

### Avatar Glow

L'avatar ha un effetto glow con gradiente:

- `from-blue-500/60 via-purple-500/60 to-cyan-500/60`
- Blur effect per profondità

### Formattazione Date

Le funzioni `formatDateTime`, `getStatusColorClasses` e `getAppointmentType` devono essere fornite dal parent per:

- Coerenza formattazione
- Supporto multi-lingua
- Personalizzazione per contesto

### Limitazioni

- Non gestisce drag & drop
- Non mostra preview note complete
- Non supporta selezione multipla

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
