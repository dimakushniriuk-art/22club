# Componente: WorkoutWizardStep1

## 📋 Descrizione

Primo step del wizard per la creazione di schede di allenamento. Gestisce le informazioni generali: nome della scheda, selezione atleta e note opzionali.

## 📁 Percorso File

`src/components/workout/wizard-steps/workout-wizard-step-1.tsx`

## 🔧 Props

```typescript
interface WorkoutWizardStep1Props {
  wizardData: WorkoutWizardData
  athletes: Array<{ id: string; name: string; email: string }>
  onWizardDataChange: (data: Partial<WorkoutWizardData>) => void
}
```

### Dettaglio Props

- **`wizardData`** (WorkoutWizardData, required): Dati correnti del wizard
- **`athletes`** (array, required): Lista degli atleti disponibili per la selezione
- **`onWizardDataChange`** (function, required): Callback per aggiornare i dati del wizard

## 📦 Dipendenze

### UI Components

- `Input` da `@/components/ui`
- `Textarea` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`
- `Card`, `CardContent` da `@/components/ui`

### Types

- `WorkoutWizardData` da `@/types/workout`

## ⚙️ Funzionalità

### Core

1. **Input Nome Scheda**: Campo obbligatorio per il nome della scheda
2. **Selezione Atleta**: Dropdown per selezionare l'atleta (obbligatorio)
3. **Note Opzionali**: Textarea per aggiungere note, obiettivi o istruzioni

### Validazione

- **Nome scheda**: Obbligatorio (validato dal parent tramite `canProceed`)
- **Atleta**: Obbligatorio (validato dal parent tramite `canProceed`)
- **Note**: Opzionale

### UI/UX

- Card con variante "trainer" per coerenza design
- Placeholder descrittivi per ogni campo
- Testi di aiuto sotto ogni campo
- Layout responsive con spacing ottimizzato

## 🎨 Struttura UI

```
Card (variant="trainer")
  └── CardContent
      ├── Header (titolo + descrizione)
      └── Form Fields
          ├── Input "Nome scheda *"
          ├── SimpleSelect "Atleta *"
          └── Textarea "Note (opzionali)"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutWizardStep1 } from '@/components/workout/wizard-steps/workout-wizard-step-1'

function WizardComponent() {
  const [wizardData, setWizardData] = useState<WorkoutWizardData>({
    title: '',
    notes: '',
    days: [],
    athlete_id: '',
    difficulty: 'media',
  })

  return (
    <WorkoutWizardStep1
      wizardData={wizardData}
      athletes={athletes}
      onWizardDataChange={(data) => setWizardData({ ...wizardData, ...data })}
    />
  )
}
```

## 🔍 Note Tecniche

### Data Flow

- Riceve `wizardData` come prop (controlled component)
- Aggiorna i dati tramite `onWizardDataChange` che merge i nuovi dati con quelli esistenti
- Il parent (`WorkoutWizardContent`) gestisce lo stato globale

### Formattazione Atleti

- Gli atleti nel dropdown sono formattati come: `Nome (email)` se email disponibile
- Prima opzione è sempre "Seleziona un atleta" con valore vuoto

### Limitazioni

- Non gestisce la validazione direttamente (delegata al parent)
- Non gestisce errori di validazione (mostrati dal parent)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
