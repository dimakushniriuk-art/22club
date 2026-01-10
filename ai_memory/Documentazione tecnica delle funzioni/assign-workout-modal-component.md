# Componente: AssignWorkoutModal

## 📋 Descrizione

Modal per assegnare nuove schede allenamento (workout plans) agli atleti. Crea record in tabella `workout_plans` con date inizio/fine e stato attivo.

## 📁 Percorso File

`src/components/dashboard/assign-workout-modal.tsx`

## 🔧 Props

```typescript
interface AssignWorkoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`onSuccess`** (function, optional): Callback dopo successo

## 📦 Dipendenze

### React Hooks

- `useState` da `react`

### Supabase

- `createClient` da `@/lib/supabase`

### Hooks

- `useClienti` da `@/hooks/use-clienti`
- `useToast` da `@/components/ui/toast`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` da `@/components/ui/dialog`
- `Button`, `Input`, `Label` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`

### Icons

- `Dumbbell`, `User`, `Calendar`, `FileText`, `X`, `Loader2` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Assegnazione Scheda**: Crea workout plan in tabella `workout_plans`
2. **Selezione Atleta**: Dropdown con lista clienti
3. **Date Range**: Date inizio e fine scheda
4. **Validazione Date**: Verifica che start_date < end_date

### Campi Form

- **Atleta**: Select obbligatorio (da useClienti)
- **Nome Scheda**: Input obbligatorio
- **Descrizione**: Textarea opzionale
- **Data Inizio**: Date picker obbligatorio
- **Data Fine**: Date picker obbligatorio

### Funzionalità Avanzate

- **Validazione Date**: `start_date < end_date`
- **Profilo Trainer**: Recupera `user_id` dal profilo corrente per `created_by`
- **Stato Attivo**: Imposta automaticamente `is_active: true`
- **Toast Notifications**: Success/error toast
- **Reset Form**: Reset automatico dopo successo

### Validazioni

- Atleta obbligatorio
- Nome scheda obbligatorio
- Date inizio/fine obbligatorie
- `start_date < end_date`
- Utente autenticato
- Profilo trainer valido

### UI/UX

- Modal responsive (max-w-2xl)
- Form organizzato
- Loading state durante submit
- Error messages inline
- Toast notifications

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   └── DialogTitle (con icona Dumbbell)
      ├── form
      │   ├── Error message (se presente)
      │   ├── Select Atleta
      │   ├── Input Nome Scheda
      │   ├── Textarea Descrizione
      │   ├── Date picker Data Inizio
      │   ├── Date picker Data Fine
      │   └── DialogFooter
      │       ├── Button Cancel
      │       └── Button Submit
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AssignWorkoutModal } from '@/components/dashboard/assign-workout-modal'

function WorkoutsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <AssignWorkoutModal
      open={showModal}
      onOpenChange={setShowModal}
      onSuccess={() => router.refresh()}
    />
  )
}
```

## 🔍 Note Tecniche

### Creazione Workout Plan

```typescript
await supabase.from('workout_plans').insert([
  {
    athlete_id: formData.athlete_id,
    name: formData.name,
    description: formData.description || null,
    start_date: formData.start_date,
    end_date: formData.end_date,
    is_active: true,
    created_by: profile.user_id, // user_id del trainer
  },
])
```

### Limitazioni

- Crea solo workout plan base (non esercizi)
- Non gestisce duplicati (stesso atleta, stesso nome)
- `is_active` sempre true (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
