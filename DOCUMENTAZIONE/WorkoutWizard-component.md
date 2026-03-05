# 📋 WorkoutWizard Component - Documentazione Tecnica

**File**: `src/components/workout/workout-wizard.tsx`  
**Classificazione**: React Component, Client Component, Wizard Component, Form Component  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:20:00Z

---

## 📋 Panoramica

Componente React wizard multi-step per creare schede allenamento complete. Gestisce 5 step sequenziali: informazioni generali, organizzazione giorni, selezione esercizi, impostazione target, e riepilogo finale. Supporta schede multi-giorno con esercizi multipli per giorno, target personalizzati (serie, ripetizioni, pesi, recupero), e validazione progressiva.

---

## 🔧 Parametri

### Props

```typescript
interface WorkoutWizardProps {
  isOpen: boolean // Stato apertura wizard
  onClose: () => void // Callback chiusura
  onSave: (workoutData: WorkoutWizardData) => Promise<void> // Callback salvataggio
  athletes: Array<{ id: string; name: string; email: string }> // Lista atleti
  exercises: Exercise[] // Catalogo esercizi
  className?: string // Classi CSS aggiuntive
  initialAthleteId?: string // ID atleta pre-selezionato
}
```

**Parametri**:

- `isOpen` (obbligatorio): Stato apertura/chiusura wizard
- `onClose` (obbligatorio): Funzione chiamata quando wizard viene chiuso
- `onSave` (obbligatorio): Funzione chiamata al salvataggio con dati completi (può essere async)
- `athletes` (obbligatorio): Array di atleti disponibili per selezione
- `exercises` (obbligatorio): Array completo di esercizi dal catalogo
- `className` (opzionale): Classi CSS aggiuntive
- `initialAthleteId` (opzionale): ID atleta da pre-selezionare nello step 1

---

## 📤 Output

**Tipo**: `JSX.Element`

**Rendering**:

- Dialog modal wizard con header fisso, contenuto scrollabile, footer fisso
- Progress bar e step indicators
- 5 step sequenziali con navigazione avanti/indietro
- Validazione progressiva (non si può procedere se step incompleto)

**Step del Wizard**:

1. **Info generali**: Nome scheda, atleta, note
2. **Giorni**: Organizza giorni allenamento (aggiungi/rimuovi/rinomina)
3. **Esercizi**: Seleziona esercizi per ogni giorno (usa `ExerciseCatalog`)
4. **Target**: Imposta serie, ripetizioni, pesi, recupero per ogni esercizio
5. **Riepilogo**: Verifica e conferma scheda completa

---

## 🔄 Flusso Logico

### 1. Inizializzazione Wizard

```typescript
useEffect(() => {
  if (isOpen) {
    setCurrentStep(1)
    setWizardData({
      title: '',
      notes: '',
      days: [],
      athlete_id: initialAthleteId || '',
      difficulty: 'media',
    })
  }
}, [isOpen, initialAthleteId])
```

**Comportamento**:

- Reset a step 1 quando wizard si apre
- Reset dati form (tranne `initialAthleteId` se fornito)
- Default difficoltà: `'media'`

### 2. Step 1: Info Generali

**Campi**:

- **Nome scheda** (obbligatorio): Input text
- **Atleta** (obbligatorio): Select dropdown con lista atleti
- **Note** (opzionale): Textarea

**Validazione**:

- `title` non vuoto
- `athlete_id` selezionato

**Funzionalità**:

- Pre-selezione atleta se `initialAthleteId` fornito
- Helper text per ogni campo

### 3. Step 2: Giorni

**Funzionalità**:

- Aggiungi giorno: Crea nuovo giorno con `day_number` incrementale
- Modifica titolo: Input per ogni giorno
- Rimuovi giorno: Pulsante X per eliminare giorno

**Struttura Dati**:

```typescript
{
  name: `Giorno ${index + 1}`,
  day_number: index + 1,
  title: `Giorno ${index + 1}`,
  exercises: []
}
```

**Validazione**:

- Almeno 1 giorno aggiunto

### 4. Step 3: Esercizi

**Funzionalità**:

- Per ogni giorno, mostra `ExerciseCatalog` component
- Selezione multipla esercizi
- Rimuovi esercizio: Pulsante X per ogni esercizio

**Integrazione**:

- Usa `ExerciseCatalog` per selezione
- `selectedExercises` = array ID esercizi già selezionati per quel giorno
- `onExerciseSelect` = aggiunge esercizio al giorno corrente

**Validazione**:

- Ogni giorno deve avere almeno 1 esercizio

### 5. Step 4: Target

**Campi per Esercizio**:

- **Serie** (default: 3): Input number (min: 1, max: 20)
- **Ripetizioni** (default: 10): Input number (min: 1, max: 100)
- **Peso (kg)** (default: 0): Input number (min: 0, step: 0.5)
- **Recupero (sec)** (default: 60): Input number (min: 10, max: 600)

**Validazione**:

- ⚠️ **Nessuna validazione esplicita** (vedi P4-009)
- Input hanno `min`/`max` ma non bloccano valori invalidi

**Funzionalità**:

- Grid 4 colonne per ogni esercizio
- Rimuovi esercizio: Pulsante X per rimuovere da giorno

### 6. Step 5: Riepilogo

**Informazioni Mostrate**:

- Nome scheda
- Atleta selezionato
- Numero giorni
- Numero esercizi totali
- Note (se presenti)
- Dettaglio giorni con esercizi (opzionale)

**Validazione**:

- Nessuna validazione aggiuntiva (tutti i dati già validati negli step precedenti)

### 7. Salvataggio

```typescript
const handleSave = async () => {
  try {
    setIsLoading(true)
    await onSave(wizardData)
    onClose()
  } catch (error) {
    console.error('Error saving workout:', error)
  } finally {
    setIsLoading(false)
  }
}
```

**Comportamento**:

- Chiama `onSave` con dati completi `WorkoutWizardData`
- Chiude wizard dopo salvataggio riuscito
- Gestisce errori (non blocca UI)

---

## ⚠️ Errori Possibili

### Errori Validazione

- **Step Incompleto**: Se utente tenta di procedere con step incompleto
  - Sintomo: Pulsante "Avanti" disabilitato
  - Fix: Validazione già implementata in `canProceed()`

- **Target Invalido**: Se valori target non validi (pesi negativi, serie 0)
  - Sintomo: Dati salvati con valori invalidi
  - Fix: Aggiungere validazione esplicita (vedi P4-009)

### Errori Salvataggio

- **Network Error**: Se `onSave` fallisce
  - Sintomo: Errore loggato in console, wizard non si chiude
  - Fix: Gestire errori in `onSave` del componente padre

### Errori Rendering

- **Missing Data**: Se `athletes` o `exercises` vuoti
  - Sintomo: Select vuoti o cataloghi vuoti
  - Fix: Verificare che dati siano caricati prima di aprire wizard

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **React Hooks** (`useState`, `useEffect`)
   - Gestione stato wizard e form data

2. **UI Components** (`@/components/ui`)
   - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
   - `Button`, `Input`, `Textarea`, `SimpleSelect`
   - `Card`, `CardContent`, `CardHeader`, `CardTitle`
   - `Badge`, `Progress`

3. **Icons** (`lucide-react`)
   - `List`, `Calendar`, `Dumbbell`, `Target`, `Check`
   - `ChevronLeft`, `ChevronRight`, `X`, `User`

### Dipendenze Interne

- **ExerciseCatalog**: Componente catalogo esercizi (step 3)
- **Types** (`@/types/workout`): `WorkoutWizardData`, `WorkoutDayData`, `WorkoutDayExerciseData`, `Exercise`

---

## 📝 Esempi d'Uso

### Esempio 1: Uso Base

```typescript
import { WorkoutWizard } from '@/components/workout/workout-wizard'
import { useWorkouts } from '@/hooks/use-workouts'

function SchedePage() {
  const [showWizard, setShowWizard] = useState(false)
  const { exercises } = useWorkouts({ userId, role: 'pt' })
  const [athletes, setAthletes] = useState([])

  const handleSave = async (workoutData: WorkoutWizardData) => {
    // Salva scheda (crea workout_plans, workout_days, workout_day_exercises)
    await saveWorkoutToDatabase(workoutData)
    // Ricarica lista schede
    fetchWorkouts()
  }

  return (
    <>
      <Button onClick={() => setShowWizard(true)}>Nuova Scheda</Button>
      <WorkoutWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={handleSave}
        athletes={athletes}
        exercises={exercises}
      />
    </>
  )
}
```

### Esempio 2: Con Pre-selezione Atleta

```typescript
<WorkoutWizard
  isOpen={showWizard}
  onClose={() => setShowWizard(false)}
  onSave={handleSave}
  athletes={athletes}
  exercises={exercises}
  initialAthleteId={selectedAthleteId}  // Pre-seleziona atleta
/>
```

### Esempio 3: Con Gestione Salvataggio Completa

```typescript
const handleSave = async (workoutData: WorkoutWizardData) => {
  try {
    // 1. Crea workout_plans
    const { data: workout } = await supabase
      .from('workout_plans')
      .insert({
        athlete_id: workoutData.athlete_id,
        name: workoutData.title,
        description: workoutData.notes,
        is_active: true,
      })
      .select()
      .single()

    // 2. Crea workout_days
    for (const day of workoutData.days) {
      const { data: workoutDay } = await supabase
        .from('workout_days')
        .insert({
          workout_id: workout.id,
          day_number: day.day_number,
          title: day.title,
        })
        .select()
        .single()

      // 3. Crea workout_day_exercises
      for (const exercise of day.exercises) {
        await supabase.from('workout_day_exercises').insert({
          workout_day_id: workoutDay.id,
          exercise_id: exercise.exercise_id,
          target_sets: exercise.target_sets,
          target_reps: exercise.target_reps,
          target_weight: exercise.target_weight,
          rest_timer_sec: exercise.rest_timer_sec,
          order_index: exercise.order_index,
        })
      }
    }

    toast.success('Scheda creata con successo!')
  } catch (err) {
    toast.error('Errore creazione scheda')
    throw err
  }
}
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **State Updates**: Aggiorna `currentStep`, `wizardData`, `isLoading`
2. **Form Management**: Gestisce stato form multi-step complesso
3. **Callback Invocation**: Chiama `onSave` con dati completi al salvataggio

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Componente Lungo**: 800+ righe (vedi P4-008 per suggerimento split)
- **Re-render**: Minimizzati con gestione stato locale
- **Memoization**: Potrebbe beneficiare di `useMemo` per dati derivati

### Limitazioni

- **Nessuna Validazione Target**: Non valida pesi negativi, serie 0 (vedi P4-009)
- **Nessun Undo**: Non supporta undo/redo operazioni
- **Nessun Auto-save**: Non salva progresso automaticamente

### Miglioramenti Futuri

- Split in sub-componenti per ogni step (vedi P4-008):
  - `WorkoutWizardStep1Info.tsx`
  - `WorkoutWizardStep2Days.tsx`
  - `WorkoutWizardStep3Exercises.tsx`
  - `WorkoutWizardStep4Target.tsx`
  - `WorkoutWizardStep5Summary.tsx`
- Estrarre logica form in custom hook `useWorkoutWizard`
- Aggiungere validazione target esplicita (vedi P4-009)
- Aggiungere auto-save progresso in localStorage

---

## 🎨 UI/UX

### Design

- **Wizard Style**: Dialog modal con header/footer fissi, contenuto scrollabile
- **Progress Bar**: Mostra progresso percentuale e step indicators
- **Step Indicators**: Icone con stato (attivo/completato/pending)
- **Gradient Background**: Teal/cyan gradient per coerenza design

### Accessibilità

- **Navigation**: Pulsanti avanti/indietro con stato disabilitato chiaro
- **Progress**: Progress bar e step indicators per orientamento
- **Validation**: Feedback visivo quando step incompleto

---

## 📚 Changelog

### 2025-01-29T17:20:00Z - Documentazione Iniziale

- ✅ Documentazione completa componente `WorkoutWizard`
- ✅ Descrizione 5 step wizard
- ✅ Esempi d'uso
- ✅ Note tecniche e miglioramenti futuri
- ⚠️ Identificato problema P4-008 (componente troppo lungo)
- ⚠️ Identificato problema P4-009 (validazione target mancante)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare database schema workouts
