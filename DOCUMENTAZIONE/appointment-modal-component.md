# Componente: AppointmentModal

## 📋 Descrizione

Modal per creare nuovi appuntamenti. Supporta appuntamenti singoli e ricorrenti, validazione sovrapposizioni, selezione atleta, tipo appuntamento (allenamento, cardio, check, consulenza) e gestione ricorrenze.

## 📁 Percorso File

`src/components/dashboard/appointment-modal.tsx`

## 🔧 Props

```typescript
interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`onSuccess`** (function, optional): Callback dopo successo creazione

## 📦 Dipendenze

### React Hooks

- `useState` da `react`

### Supabase

- `createClient` da `@/lib/supabase/client`

### Hooks

- `useClienti` da `@/hooks/use-clienti`
- `useToast` da `@/components/ui/toast`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` da `@/components/ui/dialog`
- `Button`, `Input`, `Label` da `@/components/ui`
- `RecurrenceSelector` da `@/components/appointments/recurrence-selector`

### Types

- `CreateAppointmentData` da `@/types/appointment`
- `RecurrenceConfig` da `@/lib/recurrence-utils`

### Utils

- `serializeRecurrence`, `generateRecurringAppointments` da `@/lib/recurrence-utils`
- `checkAppointmentOverlap` da `@/lib/appointment-utils`

### Icons

- `Calendar`, `Clock`, `User`, `FileText`, `X`, `Loader2` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Creazione Appuntamento**: Form completo per creare appuntamento
2. **Ricorrenze**: Supporto appuntamenti ricorrenti (giornaliero, settimanale, mensile)
3. **Validazione Sovrapposizioni**: Verifica conflitti con appuntamenti esistenti
4. **Selezione Atleta**: Dropdown con lista clienti

### Campi Form

- **Atleta**: Select obbligatorio
- **Data**: Date picker obbligatorio
- **Ora Inizio/Fine**: Time picker obbligatori
- **Tipo**: Select (allenamento, cardio, check, consulenza)
- **Note**: Textarea opzionale
- **Location**: Input opzionale
- **Ricorrenza**: Configurazione ricorrenza opzionale

### Funzionalità Avanzate

- **Validazione Client-Side**: Verifica sovrapposizioni prima di salvare
- **Ricorrenze Multiple**: Genera appuntamenti ricorrenti automaticamente
- **Error Handling**: Messaggi errore dettagliati per conflitti
- **Auto-Refresh**: Refresh pagina dopo successo (o callback)

### Validazioni

- Campi obbligatori: atleta, data, ora inizio, ora fine
- `start_time < end_time`
- Verifica sovrapposizioni (solo per appuntamenti singoli)
- Autenticazione utente
- Profilo staff valido

### UI/UX

- Modal responsive
- Form organizzato in sezioni
- Loading state durante submit
- Error messages inline
- RecurrenceSelector integrato

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   └── DialogTitle
      ├── form
      │   ├── Error message (se presente)
      │   ├── Select Atleta
      │   ├── Date picker
      │   ├── Time picker (inizio/fine)
      │   ├── Select Tipo
      │   ├── Input Location
      │   ├── Textarea Note
      │   ├── RecurrenceSelector
      │   └── DialogFooter
      │       ├── Button Cancel
      │       └── Button Submit
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentModal } from '@/components/dashboard/appointment-modal'

function CalendarPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <AppointmentModal
      open={showModal}
      onOpenChange={setShowModal}
      onSuccess={() => {
        router.refresh()
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Ricorrenze

- Utilizza `RecurrenceSelector` per configurazione
- `generateRecurringAppointments` genera array appuntamenti
- `serializeRecurrence` salva configurazione nel DB

### Validazione Sovrapposizioni

- Solo per appuntamenti singoli (non ricorrenti)
- `checkAppointmentOverlap` verifica conflitti
- Mostra dettagli conflitti se presenti

### Limitazioni

- Refresh full page dopo successo (non ottimale)
- Ricorrenze generate tutte in una volta (potrebbe essere lento per molte ricorrenze)
- Validazione sovrapposizioni solo client-side (non server-side)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
