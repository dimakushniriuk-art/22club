# Componente: AgendaTimeline

## 📋 Descrizione

Componente timeline per visualizzare agenda giornaliera con appuntamenti e sessioni. Include statistiche, azioni per ogni evento, gestione stato temporale (overdue, late, starting, upcoming) e integrazione con modali.

## 📁 Percorso File

`src/components/dashboard/agenda-timeline.tsx`

## 🔧 Props

```typescript
interface AgendaTimelineProps {
  events: AgendaEvent[]
  loading?: boolean
  onAddAppointment?: () => void
  onStartWorkout?: (eventId: string) => void
  onDeleteAppointment?: (eventId: string) => void
  onCompleteAppointment?: (eventId: string) => void
  onViewProfile?: (athleteId: string, athleteName: string) => void
  onEditAppointment?: (event: AgendaEvent) => void
}

interface AgendaEvent {
  id: string
  time: string
  athlete: string
  athlete_id?: string
  athlete_avatar?: string | null
  type: 'allenamento' | 'appuntamento' | 'consulenza'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'annullato'
  description?: string
  starts_at?: string
  ends_at?: string
}
```

### Dettaglio Props

- **`events`** (AgendaEvent[], required): Array eventi agenda
- **`loading`** (boolean, optional): Stato loading
- **`onAddAppointment`** (function, optional): Callback aggiungi appuntamento
- **`onStartWorkout`** (function, optional): Callback inizia workout
- **`onDeleteAppointment`** (function, optional): Callback elimina appuntamento
- **`onCompleteAppointment`** (function, optional): Callback completa appuntamento
- **`onViewProfile`** (function, optional): Callback visualizza profilo
- **`onEditAppointment`** (function, optional): Callback modifica appuntamento

## 📦 Dipendenze

### React Hooks

- `useState`, `useMemo` da `react`

### Next.js

- `useRouter` da `next/navigation`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Avatar` da `@/components/ui/avatar`

### Icons

- `Trash2`, `Dumbbell`, `Calendar`, `CalendarDays`, `CheckCircle`, `Clock`, `XCircle`, `User`, `Edit`, `Play` da `lucide-react`

### Hooks

- `useModalActions` da `./modals-wrapper`

### Componenti Interni

- `RescheduleAppointmentModal` da `./reschedule-appointment-modal`

### Styles

- `@/styles/agenda-animations.css`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Eventi**: Lista eventi con time, atleta, tipo, status
2. **Statistiche**: Card statistiche (totali, completati, in corso, programmati, cancellati)
3. **Azioni Eventi**: Bottoni per profilo, schede, inizia workout, completa, modifica, elimina
4. **Stato Temporale**: Rileva overdue, late, starting, upcoming

### Funzionalità Avanzate

- **Time Status Detection**: Calcola stato temporale (overdue >30min, late <0min, starting <15min, upcoming)
- **Time Remaining**: Mostra tempo rimanente ("Tra 2h 30m", "Tra 15m", "30m fa")
- **Color Coding**: Colori dinamici basati su stato temporale e status
- **Empty State**: Messaggio e bottone per aggiungere primo appuntamento
- **Loading State**: Skeleton loading con pulse
- **Reschedule Modal**: Integrazione con modal riprogramma appuntamento
- **Modal Context Integration**: Usa useModalActions se disponibile

### Azioni Eventi

- **Visualizza Profilo**: Naviga a profilo atleta
- **Visualizza Schede**: Naviga a schede filtrate per atleta
- **Inizia Allenamento**: Solo per eventi scheduled
- **Completa**: Solo per eventi in-progress
- **Modifica/Riprogramma**: Per eventi scheduled/in-progress
- **Elimina**: Sempre disponibile

### UI/UX

- Header con statistiche orizzontali
- Eventi con animazioni fadeInUp
- Avatar atleta con bordo gradiente
- Badge status colorati
- Pulsante indicator per eventi attivi
- Hover effects con scale

## 🎨 Struttura UI

```
div (container)
  └── Header
      ├── Titolo e descrizione
      ├── Bottone "Nuovo Appuntamento"
      └── Statistiche (card orizzontali)
  └── Events List
      └── div (per ogni evento)
          ├── Time section (mono, bold)
          ├── Separator verticale
          ├── Content section
          │   ├── Avatar atleta
          │   ├── Nome atleta
          │   └── Descrizione/tipo
          └── Action Buttons
              ├── Profilo
              ├── Schede
              ├── Inizia (se scheduled)
              ├── Completa (se in-progress)
              ├── Modifica
              └── Elimina
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AgendaTimeline } from '@/components/dashboard/agenda-timeline'

function DashboardPage() {
  const events = [
    {
      id: '1',
      time: '10:00',
      athlete: 'Mario Rossi',
      athlete_id: 'athlete-1',
      type: 'allenamento',
      status: 'scheduled',
    },
    // ...
  ]

  return (
    <AgendaTimeline
      events={events}
      onAddAppointment={() => setShowModal(true)}
      onViewProfile={(id, name) => router.push(`/dashboard/clienti/${id}`)}
    />
  )
}
```

## 🔍 Note Tecniche

### Time Status Calculation

- **overdue**: diff < -30 minuti
- **late**: diff < 0 minuti
- **starting**: diff < 15 minuti
- **upcoming**: diff >= 15 minuti

### Color Coding

- **overdue**: text-red-400
- **late**: text-orange-400
- **starting**: text-yellow-400 (con animate-pulse)
- **upcoming**: text-blue-400

### Status Colors

- **completed**: bg-green-500/10, border-green-500/30
- **in-progress**: bg-blue-500/10, border-blue-500/30
- **scheduled**: bg-background-tertiary/50, border-white/40
- **cancelled/annullato**: bg-red-500/10, border-red-500/30

### Modal Integration

- Usa `useModalActions` se disponibile
- Fallback a prop `onAddAppointment`
- Fallback a navigazione `/dashboard/calendario?new=true`

### Animations

- CSS animations da `agenda-animations.css`
- fadeInUp animation con delay progressivo
- Pulsing indicator per eventi attivi

### Limitazioni

- Time format: "HH:MM" (stringa)
- Statistiche calcolate client-side (potrebbe essere costoso per molti eventi)
- Reschedule modal richiede `starts_at` e `ends_at` negli eventi

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
