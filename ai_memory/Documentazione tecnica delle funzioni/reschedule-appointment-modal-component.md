# Componente: RescheduleAppointmentModal

## 📋 Descrizione

Modal per riprogrammare appuntamenti esistenti. Permette di modificare data e ora di inizio/fine di un appuntamento con validazione date e prevenzione spostamenti nel passato.

## 📁 Percorso File

`src/components/dashboard/reschedule-appointment-modal.tsx`

## 🔧 Props

```typescript
interface RescheduleAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string | null
  currentStart?: string
  currentEnd?: string
  athleteName?: string
  onSuccess?: () => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`appointmentId`** (string | null, required): ID appuntamento da riprogrammare
- **`currentStart`** (string, optional): Data/ora inizio corrente (ISO string)
- **`currentEnd`** (string, optional): Data/ora fine corrente (ISO string)
- **`athleteName`** (string, optional): Nome atleta (solo visualizzazione)
- **`onSuccess`** (function, optional): Callback dopo successo

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### Supabase

- `createClient` da `@/lib/supabase/client`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` da `@/components/ui`
- `Button`, `Input`, `Label` da `@/components/ui`

### Icons

- `Calendar`, `Clock`, `Loader2`, `X` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Riprogrammazione**: Aggiorna `starts_at` e `ends_at` in tabella `appointments`
2. **Formato Date**: Converte ISO string a formato datetime-local per input
3. **Validazione Date**: Verifica start < end e non nel passato
4. **Sincronizzazione**: Sincronizza form con props quando cambiano

### Campi Form

- **Data e Ora Inizio**: Input datetime-local obbligatorio
- **Data e Ora Fine**: Input datetime-local obbligatorio

### Funzionalità Avanzate

- **Formato Date**: Funzione `formatForInput` converte ISO a "YYYY-MM-DDTHH:mm"
- **Sincronizzazione Props**: `useEffect` aggiorna form quando `currentStart/End` cambiano
- **Validazione Passato**: Previene spostamenti nel passato
- **Info Atleta**: Mostra nome atleta se fornito

### Validazioni

- `appointmentId` valido
- Date inizio/fine obbligatorie
- `start < end`
- `start >= now` (non nel passato)

### UI/UX

- Modal responsive (max-w-lg)
- Form semplice (solo date)
- Info atleta evidenziata
- Error messages inline
- Loading state durante submit

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   └── DialogTitle (con icona Calendar)
      ├── form
      │   ├── Error message (se presente)
      │   ├── Info Atleta (se fornito)
      │   ├── Input Data/Ora Inizio
      │   ├── Input Data/Ora Fine
      │   └── DialogFooter
      │       ├── Button Cancel
      │       └── Button Submit
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { RescheduleAppointmentModal } from '@/components/dashboard/reschedule-appointment-modal'

function CalendarPage() {
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  return (
    <RescheduleAppointmentModal
      open={selectedAppointment !== null}
      onOpenChange={(open) => !open && setSelectedAppointment(null)}
      appointmentId={selectedAppointment?.id || null}
      currentStart={selectedAppointment?.starts_at}
      currentEnd={selectedAppointment?.ends_at}
      athleteName={selectedAppointment?.athlete}
      onSuccess={() => router.refresh()}
    />
  )
}
```

## 🔍 Note Tecniche

### Formato Date

```typescript
function formatForInput(isoString?: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
```

### Update Appointment

```typescript
await supabase
  .from('appointments')
  .update({
    starts_at: startDate.toISOString(),
    ends_at: endDate.toISOString(),
  })
  .eq('id', appointmentId)
```

### Limitazioni

- Aggiorna solo date (non altri campi)
- Non verifica sovrapposizioni con altri appuntamenti
- Non gestisce ricorrenze (solo appuntamento singolo)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
