# Componente: AppointmentConflictAlert

## 📋 Descrizione

Componente alert per visualizzare e gestire conflitti di appuntamenti (sovrapposizioni o doppie prenotazioni). Mostra dettagli del conflitto e permette di risolverlo o ignorarlo.

## 📁 Percorso File

`src/components/appointments/appointment-conflict-alert.tsx`

## 🔧 Props

```typescript
interface AppointmentConflictAlertProps {
  conflicts: AppointmentConflict[]
  onResolve?: (conflictId: string) => void
  onIgnore?: (conflictId: string) => void
}
```

### Dettaglio Props

- **`conflicts`** (array, required): Array di conflitti da visualizzare
- **`onResolve`** (function, optional): Callback chiamato quando si risolve un conflitto
- **`onIgnore`** (function, optional): Callback chiamato quando si ignora un conflitto

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Button` da `@/components/ui`
- `AlertTriangle`, `Clock`, `User` da `lucide-react`

### Types

- `AppointmentConflict` da `@/types/appointment`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Conflitti**: Mostra tutti i conflitti rilevati
2. **Tipi Conflitto**: Distingue tra sovrapposizione e doppia prenotazione
3. **Azioni**: Permette risoluzione o ignoramento
4. **Auto-hide**: Non renderizza se non ci sono conflitti

### Tipi Conflitto

- **Overlap**: Sovrapposizione temporale
- **Double Booking**: Doppia prenotazione stesso trainer

### UI/UX

- Card con bordo rosso e background semi-trasparente
- Icona alert triangolare
- Badge colorato per tipo conflitto
- Dettagli conflitto (data, trainer)
- Pulsanti azione (risolvi/ignora)
- Layout responsive

## 🎨 Struttura UI

```
Card (bordo rosso, bg rosso/5)
  └── CardContent
      ├── Icona AlertTriangle
      └── Contenuto
          ├── Titolo "Conflitti rilevati"
          └── Lista Conflitti
              └── Card Conflitto
                  ├── Badge tipo (warning/error)
                  ├── Pulsanti azione
                  ├── Messaggio conflitto
                  └── Info (data, trainer)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentConflictAlert } from '@/components/appointments/appointment-conflict-alert'

function MyComponent() {
  const conflicts = [
    {
      conflictType: 'overlap',
      message: 'Sovrapposizione con appuntamento esistente',
      appointment: {
        id: 'apt-1',
        starts_at: '2025-02-05T10:00:00Z',
        trainer_id: 'trainer-1',
      },
    },
  ]

  const handleResolve = (conflictId: string) => {
    // Risolvi conflitto
  }

  const handleIgnore = (conflictId: string) => {
    // Ignora conflitto
  }

  return (
    <AppointmentConflictAlert
      conflicts={conflicts}
      onResolve={handleResolve}
      onIgnore={handleIgnore}
    />
  )
}
```

## 🔍 Note Tecniche

### Auto-hide

Se `conflicts.length === 0`, il componente ritorna `null` e non renderizza nulla.

### Badge Colori

- **Overlap**: Badge warning (giallo)
- **Double Booking**: Badge error (rosso)

### Formattazione Date

Le date vengono formattate in italiano con `toLocaleString('it-IT')`.

### Limitazioni

- Non gestisce risoluzione automatica
- Non mostra suggerimenti di risoluzione
- Non supporta batch resolve

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
