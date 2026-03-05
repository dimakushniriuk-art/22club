# Componente: WorkoutWizardStep2

## 📋 Descrizione

Secondo step del wizard per la creazione di schede di allenamento. Gestisce l'organizzazione dei giorni di allenamento, permettendo di aggiungere, modificare e rimuovere giorni.

## 📁 Percorso File

`src/components/workout/wizard-steps/workout-wizard-step-2.tsx`

## 🔧 Props

```typescript
interface WorkoutWizardStep2Props {
  wizardData: WorkoutWizardData
  onAddDay: () => void
  onUpdateDay: (index: number, data: Partial<WorkoutWizardData['days'][0]>) => void
  onRemoveDay: (index: number) => void
}
```

### Dettaglio Props

- **`wizardData`** (WorkoutWizardData, required): Dati correnti del wizard (contiene array `days`)
- **`onAddDay`** (function, required): Callback per aggiungere un nuovo giorno
- **`onUpdateDay`** (function, required): Callback per aggiornare un giorno esistente (index, dati parziali)
- **`onRemoveDay`** (function, required): Callback per rimuovere un giorno (index)

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Button` da `@/components/ui`
- `Input` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Calendar`, `X` da `lucide-react`

### Types

- `WorkoutWizardData` da `@/types/workout`

## ⚙️ Funzionalità

### Core

1. **Aggiunta Giorni**: Permette di aggiungere nuovi giorni di allenamento
2. **Modifica Giorni**: Permette di modificare il titolo di ogni giorno
3. **Rimozione Giorni**: Permette di rimuovere giorni non più necessari
4. **Visualizzazione Giorni**: Mostra tutti i giorni configurati con badge numerati

### Validazione

- Richiede almeno un giorno per procedere (validato dal parent tramite `canProceed`)

### UI/UX

- Empty state quando non ci sono giorni
- Card per ogni giorno con badge numerato
- Pulsante "Aggiungi giorno" sempre visibile
- Pulsante rimozione con icona X per ogni giorno
- Layout responsive con spacing ottimizzato

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header (titolo + descrizione + pulsante "Aggiungi giorno")
  └── Lista Giorni
      ├── Card (per ogni giorno)
      │   ├── Badge "Giorno N"
      │   ├── Input (titolo giorno)
      │   └── Button (rimuovi)
      └── Empty State (se nessun giorno)
          ├── Icona Calendar
          ├── Messaggio
          └── Pulsante "Aggiungi primo giorno"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutWizardStep2 } from '@/components/workout/wizard-steps/workout-wizard-step-2'

function WizardComponent() {
  const addDay = () => {
    setWizardData((prev) => ({
      ...prev,
      days: [...prev.days, { day_number: prev.days.length + 1, title: '', exercises: [] }],
    }))
  }

  const updateDay = (index: number, data: Partial<WorkoutDayData>) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) => (i === index ? { ...day, ...data } : day)),
    }))
  }

  const removeDay = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index),
    }))
  }

  return (
    <WorkoutWizardStep2
      wizardData={wizardData}
      onAddDay={addDay}
      onUpdateDay={updateDay}
      onRemoveDay={removeDay}
    />
  )
}
```

## 🔍 Note Tecniche

### Gestione Indici

- I giorni sono identificati per indice nell'array
- Il `day_number` viene auto-generato dal parent (lunghezza array + 1)
- La rimozione di un giorno non ri-numera automaticamente i giorni rimanenti

### Data Flow

- Le modifiche vengono propagate al parent tramite callbacks
- Il componente è completamente controllato (non gestisce stato interno)

### Limitazioni

- Non gestisce la riordinazione dei giorni (drag & drop)
- Non gestisce la duplicazione di giorni
- La validazione è delegata al parent

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
