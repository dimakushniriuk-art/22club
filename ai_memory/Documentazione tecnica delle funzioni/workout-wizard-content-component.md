# Componente: WorkoutWizardContent

## 📋 Descrizione

Componente principale che gestisce la logica e l'interfaccia del wizard per la creazione di schede di allenamento. Coordina i 5 step del wizard e gestisce lo stato globale.

## 📁 Percorso File

`src/components/workout/workout-wizard-content.tsx`

## 🔧 Props

```typescript
interface WorkoutWizardContentProps {
  onSave: (workoutData: WorkoutWizardData) => Promise<void>
  athletes: Array<{ id: string; name: string; email: string }>
  exercises: Exercise[]
  initialAthleteId?: string
  initialData?: WorkoutWizardData
  onCancel?: () => void
}
```

### Dettaglio Props

- **`onSave`** (function, required): Callback chiamato quando la scheda viene salvata
- **`athletes`** (array, required): Lista degli atleti disponibili
- **`exercises`** (array, required): Lista degli esercizi disponibili
- **`initialAthleteId`** (string, optional): ID atleta pre-selezionato
- **`initialData`** (WorkoutWizardData, optional): Dati iniziali per modifica
- **`onCancel`** (function, optional): Callback chiamato quando si annulla

## 📦 Dipendenze

### Hooks

- `useWorkoutWizard` da `@/hooks/workout/use-workout-wizard`

### UI Components

- `Progress` da `@/components/ui`
- `Button` da `@/components/ui`
- `ChevronLeft`, `ChevronRight`, `Check`, `ArrowLeft` da `lucide-react`

### Components

- `WorkoutWizardStep1` - `WorkoutWizardStep5` da `./wizard-steps`

### Types

- `WorkoutWizardData` da `@/types/workout`
- `Exercise` da `@/types/workout`

## ⚙️ Funzionalità

### Core

1. **Gestione Step**: Navigazione tra i 5 step del wizard
2. **Gestione Stato**: Mantiene lo stato globale del wizard
3. **Validazione**: Valida i dati prima di procedere
4. **Salvataggio**: Gestisce il salvataggio della scheda

### Steps

1. **Step 1**: Info generali (nome, atleta, note)
2. **Step 2**: Giorni allenamento
3. **Step 3**: Esercizi per giorno
4. **Step 4**: Target (serie, ripetizioni, pesi)
5. **Step 5**: Riepilogo e conferma

### Funzionalità Avanzate

- **Progress Bar**: Mostra il progresso del wizard
- **Validazione Step**: Blocca avanzamento se step non valido
- **Gestione Giorni**: Aggiunta, modifica, rimozione giorni
- **Gestione Esercizi**: Aggiunta, modifica, rimozione esercizi per giorno

### UI/UX

- Header con progress bar visuale
- Navigation buttons (prev/next/save/cancel)
- Step indicator con icone
- Layout responsive

## 🎨 Struttura UI

```
Container
  ├── Header
  │   ├── Progress Bar
  │   └── Step Indicator
  ├── Step Content (dinamico)
  │   ├── Step 1: Info generali
  │   ├── Step 2: Giorni
  │   ├── Step 3: Esercizi
  │   ├── Step 4: Target
  │   └── Step 5: Riepilogo
  └── Navigation
      ├── Button "Indietro"
      ├── Button "Avanti"
      └── Button "Salva" (solo step 5)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutWizardContent } from '@/components/workout/workout-wizard-content'

function MyComponent() {
  const handleSave = async (workoutData: WorkoutWizardData) => {
    await saveWorkout(workoutData)
  }

  return (
    <WorkoutWizardContent
      onSave={handleSave}
      athletes={athletes}
      exercises={exercises}
      initialAthleteId={selectedAthleteId}
      onCancel={() => setIsOpen(false)}
    />
  )
}
```

## 🔍 Note Tecniche

### Hook useWorkoutWizard

Il componente utilizza `useWorkoutWizard` che gestisce:

- Stato corrente step
- Dati wizard (wizardData)
- Funzioni navigazione (handleNext, handlePrevious)
- Funzioni gestione giorni/esercizi
- Validazione (canProceed)
- Salvataggio (handleSave)

### Gestione Giorni

- `addDay`: Aggiunge un nuovo giorno
- `updateDay`: Aggiorna un giorno esistente
- `removeDay`: Rimuove un giorno (gestito localmente)

### Validazione

- Ogni step ha la sua validazione
- `canProceed` controlla se si può procedere
- Il bottone "Avanti" è disabilitato se `!canProceed`

### Limitazioni

- Non gestisce errori di salvataggio (delegati al parent)
- Non gestisce loading state durante salvataggio
- Non supporta modifica scheda esistente (solo creazione)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
