# Componente: AppointmentValidation

## 📋 Descrizione

Componente per validare un appuntamento e mostrare errori, warning e informazioni sui permessi. Esegue validazioni su sovrapposizioni, date, durata e permessi.

## 📁 Percorso File

`src/components/appointments/appointment-validation.tsx`

## 🔧 Props

```typescript
interface AppointmentValidationProps {
  appointment: AppointmentUI
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}
```

### Dettaglio Props

- **`appointment`** (AppointmentUI, required): Appuntamento da validare
- **`onValidationChange`** (function, optional): Callback chiamato quando cambia lo stato di validazione

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Button` da `@/components/ui`
- `CheckCircle`, `XCircle`, `Clock`, `AlertTriangle` da `lucide-react`

### Utilities

- `canCancelAppointment`, `canModifyAppointment`, `getAppointmentStatus`, `formatAppointmentTime`, `formatAppointmentDate` da `@/lib/appointment-utils`

### Types

- `AppointmentUI` da `@/types/appointment`

## ⚙️ Funzionalità

### Core

1. **Validazione**: Valida appuntamento su vari criteri
2. **Errori**: Mostra errori bloccanti
3. **Warning**: Mostra warning informativi
4. **Permessi**: Mostra informazioni sui permessi (modifica/cancellazione)

### Validazioni

- **Sovrapposizioni**: Verifica conflitti con altri appuntamenti
- **Date**: Verifica che data fine > data inizio
- **Passato**: Warning se appuntamento nel passato
- **Durata**: Warning se durata < 15 min o > 3 ore
- **Permessi**: Verifica se si può modificare/cancellare

### UI/UX

- Card con sezioni organizzate
- Icone per ogni tipo di messaggio
- Badge per stato validazione
- Lista errori e warning
- Informazioni permessi
- Layout responsive

## 🎨 Struttura UI

```
Card
  └── CardContent
      ├── Header Validazione
      │   ├── Icona stato (CheckCircle/XCircle)
      │   └── Badge "Valido" / "Errori"
      ├── Sezione Errori (se presenti)
      │   └── Lista errori con icona XCircle
      ├── Sezione Warning (se presenti)
      │   └── Lista warning con icona AlertTriangle
      └── Sezione Permessi
          ├── Info "Puoi modificare"
          └── Info "Puoi cancellare"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentValidation } from '@/components/appointments/appointment-validation'

function MyComponent() {
  const appointment = {
    id: 'apt-1',
    starts_at: '2025-02-05T10:00:00Z',
    ends_at: '2025-02-05T11:00:00Z',
    // ... altri campi
  }

  const handleValidationChange = (isValid: boolean, errors: string[]) => {
    console.log('Validation changed:', { isValid, errors })
  }

  return (
    <AppointmentValidation appointment={appointment} onValidationChange={handleValidationChange} />
  )
}
```

## 🔍 Note Tecniche

### Validazione Async

La validazione viene eseguita in modo asincrono quando cambia l'appuntamento.

### Calcolo Durata

La durata viene calcolata in minuti:

```typescript
const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
```

### Permessi

I permessi vengono calcolati usando utility functions:

- `canCancelAppointment`: Verifica se si può cancellare
- `canModifyAppointment`: Verifica se si può modificare
- `getAppointmentStatus`: Ottiene lo stato corrente

### Limitazioni

- Non verifica sovrapposizioni in tempo reale (richiede staffId)
- Non mostra suggerimenti per risolvere errori
- Non supporta validazione custom

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
