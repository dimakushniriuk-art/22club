# Componente: AppointmentsCard (Athlete)

## 📋 Descrizione

Componente card per visualizzare gli appuntamenti della settimana per l'atleta. Mostra fino a 3 appuntamenti con countdown, badge di stato e gestione click.

## 📁 Percorso File

`src/components/athlete/appointments-card.tsx`

## 🔧 Props

```typescript
interface AppointmentsCardProps {
  appointments?: Appointment[]
  loading?: boolean
  onViewAll?: () => void
  onAppointmentClick?: (appointment: Appointment) => void
}

interface Appointment {
  id: string
  day: string
  time: string
  type: string
  ptName: string
  location?: string
  status?: 'in_corso' | 'programmato' | 'cancellato'
  dateTime?: string // ISO string per calcolo countdown
}
```

### Dettaglio Props

- **`appointments`** (array, optional): Array di appuntamenti da visualizzare
- **`loading`** (boolean, optional, default: false): Mostra stato di caricamento
- **`onViewAll`** (function, optional): Callback chiamato quando si clicca "Vedi tutto"
- **`onAppointmentClick`** (function, optional): Callback chiamato quando si clicca su un appuntamento

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Badge` da `@/components/ui`
- `CalendarIcon` da `@/components/ui/professional-icons`
- `XCircle`, `Clock`, `Dumbbell`, `ClipboardCheck`, `Calendar`, `MapPin`, `Sparkles` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Appuntamenti**: Mostra fino a 3 appuntamenti della settimana
2. **Countdown Real-time**: Calcola e mostra countdown per appuntamenti vicini (< 24h)
3. **Badge Stato**: Mostra badge per appuntamenti oggi, domani, cancellati
4. **Icone Tipo**: Icone diverse per tipo appuntamento (allenamento, valutazione, altro)
5. **Click Handler**: Gestisce click su appuntamento e link "Vedi tutto"

### Funzionalità Avanzate

- **Countdown Auto-update**: Aggiorna countdown ogni minuto
- **Priorità**: Determina priorità (oggi, domani, settimana)
- **Accessibilità**: Supporta keyboard navigation (Enter, Space)

### Stati

- **Loading**: Skeleton durante caricamento
- **Empty**: Messaggio quando non ci sono appuntamenti
- **With Data**: Lista appuntamenti con countdown e badge

### UI/UX

- Card trasparente con bordo teal
- Griglia 3 colonne per ogni appuntamento (tipo, PT, data/ora)
- Badge animati per appuntamenti urgenti
- Hover effect su appuntamenti
- Empty state con icona e pulsante

## 🎨 Struttura UI

```
Card
  ├── CardHeader
  │   ├── CardTitle "Appuntamenti della settimana"
  │   └── Button "Vedi tutto" (se onViewAll)
  └── CardContent
      ├── Empty State (se nessun appuntamento)
      │   ├── CalendarIcon con Sparkles
      │   ├── Messaggio
      │   └── Button "Vedi calendario completo"
      └── Lista Appuntamenti (max 3)
          └── div (per ogni appuntamento)
              ├── Tipo (sinistra)
              ├── PT (centro)
              └── Data/Ora + Badge (destra)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentsCard } from '@/components/athlete/appointments-card'

function MyComponent() {
  const handleAppointmentClick = (appointment: Appointment) => {
    // Mostra dettaglio appuntamento
  }

  return (
    <AppointmentsCard
      appointments={appointments}
      onAppointmentClick={handleAppointmentClick}
      onViewAll={() => router.push('/home/calendario')}
    />
  )
}
```

## 🔍 Note Tecniche

### Calcolo Countdown

- Aggiorna ogni minuto tramite `setInterval`
- Mostra solo se appuntamento è tra ora e 24h future
- Formato: "Xh Ym" o "Y min"

### Icone Tipo

- **Allenamento**: Dumbbell (teal-400)
- **Valutazione**: ClipboardCheck (cyan-400)
- **Altro**: Calendar (blue-400)

### Badge Stato

- **Cancellato**: Badge error con XCircle
- **Oggi con countdown**: Badge warning animato con countdown
- **Oggi**: Badge warning "Oggi"
- **Domani**: Nessun badge

### Limitazioni

- Mostra solo primi 3 appuntamenti
- Countdown si aggiorna solo ogni minuto (non real-time)
- Non gestisce ricorrenze

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
