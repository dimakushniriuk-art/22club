# 📅 CalendarView Component - Documentazione Tecnica

**File**: `src/components/calendar/calendar-view.tsx`  
**Classificazione**: React Component, Client Component, UI Component  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T16:50:00Z

---

## 📋 Panoramica

Componente React che visualizza appuntamenti in un calendario interattivo usando FullCalendar. Supporta tre viste (mese, settimana, giorno) con lazy loading dinamico della libreria FullCalendar per ottimizzare il bundle size. Gestisce click su eventi e date, con colori differenziati per tipo di appuntamento.

---

## 🔧 Parametri

### Props

```typescript
interface CalendarViewProps {
  appointments: AppointmentUI[] // Array di appuntamenti da visualizzare
  onEventClick?: (appointment: AppointmentUI) => void // Callback click evento
  onDateClick?: (date: string) => void // Callback click data
  onNewAppointment?: () => void // Callback nuovo appuntamento
}
```

**Parametri**:

- `appointments` (obbligatorio): Array di appuntamenti nel formato `AppointmentUI`
- `onEventClick` (opzionale): Funzione chiamata quando l'utente clicca su un evento
- `onDateClick` (opzionale): Funzione chiamata quando l'utente clicca su una data
- `onNewAppointment` (opzionale): Funzione chiamata quando l'utente clicca "Nuovo"

---

## 📤 Output

**Tipo**: `JSX.Element`

**Rendering**:

- Durante caricamento: Spinner con messaggio "Caricamento calendario..."
- Dopo caricamento: Calendario FullCalendar con header, tabs vista, e pulsante "Nuovo"

**Viste Supportate**:

- `dayGridMonth`: Vista mensile (default)
- `timeGridWeek`: Vista settimanale
- `timeGridDay`: Vista giornaliera

---

## 🔄 Flusso Logico

### 1. Lazy Loading FullCalendar

```typescript
useEffect(() => {
  const loadCalendar = async () => {
    const [
      { default: FullCalendar },
      { default: dayGridPlugin },
      { default: timeGridPlugin },
      { default: interactionPlugin },
    ] = await Promise.all([
      import('@fullcalendar/react'),
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/timegrid'),
      import('@fullcalendar/interaction'),
    ])
    setCalendarComponents({ FullCalendar, dayGridPlugin, timeGridPlugin, interactionPlugin })
    setIsLoaded(true)
  }
  loadCalendar()
}, [])
```

- Carica dinamicamente FullCalendar e i suoi plugin
- Riduce il bundle size iniziale (code splitting)
- Mostra spinner durante il caricamento

### 2. Trasformazione Appuntamenti in Eventi

```typescript
const events: EventInput[] = appointments.map((appointment) => {
  let eventClass = 'fc-event-type-allenamento' // default
  if (appointment.type === 'cardio') {
    eventClass = 'fc-event-type-cardio'
  } else if (appointment.type === 'consulenza') {
    eventClass = 'fc-event-type-consulenza'
  } else if (appointment.type === 'check') {
    eventClass = 'fc-event-type-check'
  }

  return {
    id: appointment.id,
    title: appointment.title,
    start: appointment.start,
    end: appointment.end,
    classNames: appointment.cancelled_at ? [eventClass, 'fc-event-cancelled'] : [eventClass],
    extendedProps: {
      athlete: appointment.athlete,
      type: appointment.type,
      location: appointment.location,
      notes: appointment.notes,
      cancelled_at: appointment.cancelled_at,
    },
  }
})
```

**Mappatura Tipi**:

- `'allenamento'` → `fc-event-type-allenamento` (default)
- `'cardio'` → `fc-event-type-cardio`
- `'consulenza'` → `fc-event-type-consulenza`
- `'check'` → `fc-event-type-check`

**Stato Cancellato**: Se `cancelled_at` è presente, aggiunge classe `fc-event-cancelled`

### 3. Gestione Click Evento

```typescript
const handleEventClick = (clickInfo: EventClickArg) => {
  const baseAppointment = appointments.find(
    (appointment) => appointment.id === clickInfo.event.id
  )
  if (!baseAppointment) return

  const appointment: AppointmentUI = {
    ...baseAppointment,
    title: clickInfo.event.title || baseAppointment.title || ...,
    start: clickInfo.event.start.toISOString(),
    end: clickInfo.event.end?.toISOString() ?? ...,
    // ... merge dati da extendedProps
  }

  onEventClick?.(appointment)
}
```

- Trova l'appuntamento originale dall'array `appointments`
- Merge dati da FullCalendar event con dati originali
- Chiama `onEventClick` con l'appuntamento completo

### 4. Gestione Click Data

```typescript
const handleDateClick = (arg: DateClickArg) => {
  if (view === 'dayGridMonth') {
    // Cambia vista a giornaliera
    setView('timeGridDay')
    setTimeout(() => {
      calendarApi?.changeView('timeGridDay', arg.date)
    }, 0)
  } else {
    // Se già in vista giornaliera/settimanale, apri form
    onDateClick?.(arg.dateStr)
  }
}
```

**Comportamento**:

- **Vista Mensile**: Click su data → cambia a vista giornaliera su quella data
- **Vista Settimanale/Giornaliera**: Click su data → chiama `onDateClick` per aprire form

### 5. Cambio Vista

```typescript
const changeView = (newView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
  setView(newView)
  const calendarApi = calendarRef.current?.getApi()
  calendarApi?.changeView(newView)
}
```

- Sincronizza stato React con FullCalendar API
- Aggiorna tabs UI

### 6. Sincronizzazione Vista

```typescript
useEffect(() => {
  const calendarApi = calendarRef.current?.getApi?.()
  if (!calendarApi) return

  const handleViewChange = () => {
    const currentView = calendarApi.view.type as ...
    if (currentView !== view) {
      setView(currentView)
    }
  }

  calendarApi.on('datesSet', handleViewChange)
  return () => calendarApi.off('datesSet', handleViewChange)
}, [isLoaded, view, calendarComponents])
```

- Ascolta eventi FullCalendar per sincronizzare stato
- Cleanup listener al unmount

---

## ⚠️ Errori Possibili

### Errori Lazy Loading

- **Import Error**: Se FullCalendar non è installato
  - Sintomo: `Cannot find module '@fullcalendar/react'`
  - Fix: `npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction`

- **Network Error**: Se il chunk non può essere caricato
  - Sintomo: `Failed to fetch dynamically imported module`
  - Fix: Verificare connessione, bundle build corretto

### Errori Rendering

- **Missing Data**: Se `appointments` è `undefined` o `null`
  - Sintomo: `Cannot read property 'map' of undefined`
  - Fix: Passare array vuoto `[]` come fallback

- **Invalid Date Format**: Se `appointment.start` o `appointment.end` non sono ISO strings
  - Sintomo: FullCalendar non visualizza eventi
  - Fix: Assicurarsi che date siano in formato ISO 8601

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **FullCalendar** (`@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`)
   - Libreria calendario (lazy loaded)
   - Richiede installazione: `npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction`

2. **React Hooks** (`useState`, `useEffect`, `useRef`)
   - Gestione stato e side-effects

3. **UI Components** (`@/components/ui`)
   - `Button`, `Tabs`, `TabsList`, `TabsTrigger`

### Dipendenze Interne

- **Types** (`@/types/appointment`): Tipo `AppointmentUI`
- **CSS Classes**: Richiede classi CSS per colori eventi:
  - `.fc-event-type-allenamento`
  - `.fc-event-type-cardio`
  - `.fc-event-type-consulenza`
  - `.fc-event-type-check`
  - `.fc-event-cancelled`

---

## 📝 Esempi d'Uso

### Esempio 1: Uso Base

```typescript
import { CalendarView } from '@/components/calendar'
import { useAppointments } from '@/hooks/use-appointments'

function CalendarioPage() {
  const { appointments, loading } = useAppointments({
    userId: trainerId,
    role: 'pt'
  })

  const handleEventClick = (appointment: AppointmentUI) => {
    console.log('Appuntamento cliccato:', appointment)
    // Apri modal dettaglio
  }

  const handleDateClick = (date: string) => {
    console.log('Data cliccata:', date)
    // Apri form nuovo appuntamento
  }

  const handleNewAppointment = () => {
    console.log('Nuovo appuntamento')
    // Apri form nuovo appuntamento
  }

  if (loading) return <div>Caricamento...</div>

  return (
    <CalendarView
      appointments={appointments}
      onEventClick={handleEventClick}
      onDateClick={handleDateClick}
      onNewAppointment={handleNewAppointment}
    />
  )
}
```

### Esempio 2: Solo Visualizzazione (Senza Callback)

```typescript
<CalendarView
  appointments={appointments}
/>
```

### Esempio 3: Con Gestione Form

```typescript
const [showForm, setShowForm] = useState(false)
const [selectedDate, setSelectedDate] = useState<string | null>(null)

<CalendarView
  appointments={appointments}
  onEventClick={(apt) => {
    setSelectedAppointment(apt)
    setShowForm(true)
  }}
  onDateClick={(date) => {
    setSelectedDate(date)
    setShowForm(true)
  }}
  onNewAppointment={() => {
    setSelectedDate(null)
    setShowForm(true)
  }}
/>
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **Lazy Loading**: Carica FullCalendar solo quando necessario (code splitting)
2. **State Updates**: Aggiorna `view`, `isLoaded`, `calendarComponents`
3. **Event Listeners**: Registra listener FullCalendar per sincronizzazione vista
4. **Console Logging**: Log errori caricamento FullCalendar

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Lazy Loading**: FullCalendar caricato solo quando componente montato
- **Memoizzazione Eventi**: Eventi trasformati ad ogni render (potrebbe essere ottimizzato con `useMemo`)
- **Bundle Size**: FullCalendar è grande (~200KB), lazy loading essenziale

### Limitazioni

- **Nessuna Paginazione**: Carica tutti gli appuntamenti in una volta
- **Nessun Real-time**: Non si aggiorna automaticamente se appuntamenti cambiano
- **Nessuna Ricerca**: Non supporta ricerca/filtri avanzati

### Miglioramenti Futuri

- Memoizzare trasformazione eventi con `useMemo`
- Aggiungere real-time subscriptions per aggiornamenti automatici
- Implementare ricerca/filtri avanzati
- Aggiungere drag & drop per spostare appuntamenti

---

## 🎨 Styling

### Classi CSS Richieste

```css
.fc-event-type-allenamento {
  background-color: #10b981; /* teal-500 */
}

.fc-event-type-cardio {
  background-color: #f59e0b; /* amber-500 */
}

.fc-event-type-consulenza {
  background-color: #8b5cf6; /* violet-500 */
}

.fc-event-type-check {
  background-color: #3b82f6; /* blue-500 */
}

.fc-event-cancelled {
  opacity: 0.5;
  text-decoration: line-through;
}
```

### Configurazione FullCalendar

- **Locale**: `it` (italiano)
- **Slot Min/Max**: `06:00:00` - `22:00:00`
- **First Day**: `1` (lunedì)
- **All Day Slot**: `false`
- **Weekends**: `true`
- **Now Indicator**: `true`

---

## 📚 Changelog

### 2025-01-29T16:50:00Z - Documentazione Iniziale

- ✅ Documentazione completa componente `CalendarView`
- ✅ Descrizione lazy loading FullCalendar
- ✅ Gestione eventi e date click
- ✅ Esempi d'uso
- ✅ Note tecniche e styling

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare `AppointmentForm` component
