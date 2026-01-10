# 💪 ExerciseCatalog Component - Documentazione Tecnica

**File**: `src/components/workout/exercise-catalog.tsx`  
**Classificazione**: React Component, Client Component, UI Component, Catalog Component  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:05:00Z

---

## 📋 Panoramica

Componente React catalogo esercizi per selezione multipla. Supporta filtri avanzati (ricerca testuale, gruppo muscolare, attrezzatura, difficoltà), visualizzazione griglia con preview video, e gestione selezione esercizi. Utilizzato principalmente nel `WorkoutWizard` per selezionare esercizi da aggiungere alle schede allenamento.

---

## 🔧 Parametri

### Props

```typescript
interface ExerciseCatalogProps {
  exercises: Exercise[] // Array di esercizi disponibili
  onExerciseSelect: (exercise: Exercise) => void // Callback selezione esercizio
  selectedExercises: string[] // Array ID esercizi già selezionati
  className?: string // Classi CSS aggiuntive
}
```

**Parametri**:

- `exercises` (obbligatorio): Array completo di esercizi disponibili
- `onExerciseSelect` (obbligatorio): Funzione chiamata quando utente seleziona un esercizio
- `selectedExercises` (obbligatorio): Array di ID esercizi già selezionati (per evidenziare)
- `className` (opzionale): Classi CSS aggiuntive per styling personalizzato

---

## 📤 Output

**Tipo**: `JSX.Element`

**Rendering**:

- Header con titolo e badge contatore esercizi filtrati
- Card filtri con ricerca e dropdown (gruppo muscolare, attrezzatura, difficoltà)
- Griglia esercizi (1-3 colonne responsive) con card per ogni esercizio
- Empty state se nessun esercizio trovato

**Elementi Card Esercizio**:

- Preview video (se disponibile) o icona placeholder
- Nome esercizio
- Badge gruppo muscolare, attrezzatura, difficoltà
- Descrizione (troncata a 2 righe)
- Badge "Selezionato" se già in `selectedExercises`

---

## 🔄 Flusso Logico

### 1. Filtri Esercizi

```typescript
const [filters, setFilters] = useState<ExerciseFilter>({
  search: '',
  muscle_group: 'all',
  equipment: 'all',
  difficulty: 'all',
})

const filteredExercises = useMemo(() => {
  return exercises.filter((exercise: Exercise) => {
    const matchesSearch =
      !filters.search ||
      exercise.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(filters.search.toLowerCase())

    const matchesMuscleGroup =
      filters.muscle_group === 'all' || !filters.muscle_group
        ? true
        : exercise.muscle_group === filters.muscle_group

    const matchesEquipment =
      filters.equipment === 'all' || !filters.equipment
        ? true
        : exercise.equipment === filters.equipment

    const matchesDifficulty =
      filters.difficulty === 'all' || !filters.difficulty
        ? true
        : exercise.difficulty === filters.difficulty

    return matchesSearch && matchesMuscleGroup && matchesEquipment && matchesDifficulty
  })
}, [exercises, filters])
```

**Filtri Applicati**:

1. **Ricerca Testuale**: Cerca in `name` e `description` (case-insensitive)
2. **Gruppo Muscolare**: Match esatto con `muscle_group`
3. **Attrezzatura**: Match esatto con `equipment`
4. **Difficoltà**: Match esatto con `difficulty`

**Performance**: Filtri memoizzati con `useMemo` per evitare re-calcolo ad ogni render

### 2. Gestione Selezione

```typescript
const isSelected = selectedExercises.includes(exercise.id)

<Card
  onClick={() => onExerciseSelect(exercise)}
  className={isSelected ? 'ring-brand bg-brand/5 ring-2' : 'hover:bg-background-tertiary'}
>
```

**Comportamento**:

- Click su card esercizio → chiama `onExerciseSelect(exercise)`
- Card evidenziata se `exercise.id` è in `selectedExercises`
- Stile hover per feedback visivo

### 3. Reset Filtri

```typescript
const clearFilters = () => {
  setFilters({
    search: '',
    muscle_group: 'all',
    equipment: 'all',
    difficulty: 'all',
  })
}
```

**Comportamento**:

- Reset tutti i filtri a valori default
- Mostra pulsante "Cancella filtri" solo se almeno un filtro attivo

### 4. Icone Gruppi Muscolari e Attrezzature

```typescript
const getMuscleGroupIcon = (muscleGroup: string) => {
  const group = muscleGroups.find((g: MuscleGroup) => g.id === muscleGroup)
  return group?.icon
    ? muscleGroupIcons[group.icon as keyof typeof muscleGroupIcons] || defaultMuscleIcon
    : defaultMuscleIcon
}
```

**Comportamento**:

- Cerca icona nel mapping `muscleGroups` o `equipment`
- Fallback a icona default se non trovata
- Icone renderizzate con `useIcon` hook

---

## ⚠️ Errori Possibili

### Errori Rendering

- **Missing Data**: Se `exercises` è `undefined` o `null`
  - Sintomo: `Cannot read property 'filter' of undefined`
  - Fix: Passare array vuoto `[]` come fallback

- **Invalid Exercise Data**: Se esercizio non ha `id` o `name`
  - Sintomo: Key duplicata o rendering errato
  - Fix: Validare dati esercizi prima di passare al componente

### Errori Video Preview

- **Invalid Video URL**: Se `video_url` non è valido
  - Sintomo: Video non carica, placeholder mostrato
  - Fix: Validare URL video prima di renderizzare

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **React Hooks** (`useState`, `useMemo`)
   - Gestione stato filtri e memoizzazione

2. **UI Components** (`@/components/ui`)
   - `Card`, `CardContent`, `CardHeader`, `CardTitle`
   - `Input`, `Button`, `Badge`
   - `SimpleSelect`

3. **Icons** (`@/components/ui/professional-icons`)
   - `useIcon` hook per rendering icone

### Dipendenze Interne

- **Types** (`@/types/workout`): `Exercise`, `ExerciseFilter`, `MuscleGroup`, `Equipment`
- **Data Mock**: `muscleGroups`, `equipment`, `difficulties` (hardcoded nel componente)

---

## 📝 Esempi d'Uso

### Esempio 1: Uso Base in WorkoutWizard

```typescript
import { ExerciseCatalog } from '@/components/workout/exercise-catalog'
import { useWorkouts } from '@/hooks/use-workouts'

function WorkoutWizardStep3() {
  const { exercises } = useWorkouts({ userId, role: 'pt' })
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])

  const handleExerciseSelect = (exercise: Exercise) => {
    if (selectedExercises.includes(exercise.id)) {
      // Deseleziona se già selezionato
      setSelectedExercises(prev => prev.filter(id => id !== exercise.id))
    } else {
      // Aggiungi se non selezionato
      setSelectedExercises(prev => [...prev, exercise.id])
      // Aggiungi esercizio al giorno corrente
      addExerciseToDay(dayIndex, exercise)
    }
  }

  return (
    <ExerciseCatalog
      exercises={exercises}
      onExerciseSelect={handleExerciseSelect}
      selectedExercises={selectedExercises}
    />
  )
}
```

### Esempio 2: Con Filtri Predefiniti

```typescript
// Filtra solo esercizi per gambe
const legExercises = exercises.filter(ex => ex.muscle_group === 'legs')

<ExerciseCatalog
  exercises={legExercises}
  onExerciseSelect={handleSelect}
  selectedExercises={selectedIds}
/>
```

### Esempio 3: Con Gestione Multi-Selezione

```typescript
const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])

const handleExerciseSelect = (exercise: Exercise) => {
  const isSelected = selectedExercises.some(e => e.id === exercise.id)

  if (isSelected) {
    setSelectedExercises(prev => prev.filter(e => e.id !== exercise.id))
  } else {
    setSelectedExercises(prev => [...prev, exercise])
  }
}

// Usa array di oggetti invece di ID
const selectedIds = selectedExercises.map(e => e.id)

<ExerciseCatalog
  exercises={exercises}
  onExerciseSelect={handleExerciseSelect}
  selectedExercises={selectedIds}
/>
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **State Updates**: Aggiorna `filters` quando utente modifica filtri
2. **Memoization**: Calcola `filteredExercises` solo quando `exercises` o `filters` cambiano
3. **Callback Invocation**: Chiama `onExerciseSelect` quando utente clicca esercizio

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Memoization**: `filteredExercises` memoizzato con `useMemo` per evitare re-calcolo
- **Lazy Rendering**: Video preview solo se `video_url` presente
- **Responsive Grid**: 1 colonna mobile, 2 tablet, 3 desktop

### Limitazioni

- **Dati Mock**: `muscleGroups` e `equipment` sono hardcoded (non da database)
- **Nessuna Paginazione**: Mostra tutti gli esercizi filtrati (potrebbe essere lento con molti esercizi)
- **Nessun Ordinamento**: Esercizi mostrati nell'ordine dell'array `exercises`

### Miglioramenti Futuri

- Caricare `muscleGroups` e `equipment` da database invece di hardcoded
- Aggiungere paginazione per grandi cataloghi
- Aggiungere ordinamento (nome, difficoltà, data creazione)
- Aggiungere infinite scroll per performance migliori

---

## 🎨 UI/UX

### Design

- **Card Style**: Card con hover effect e ring quando selezionato
- **Badge Colors**: Colori differenziati per difficoltà (success/warning/error)
- **Empty State**: Messaggio e pulsante reset filtri quando nessun risultato
- **Responsive**: Grid adattivo 1-3 colonne

### Accessibilità

- **Clickable Cards**: Intera card è cliccabile (non solo pulsante)
- **Visual Feedback**: Ring e background colorato per selezione
- **Empty State**: Messaggio chiaro quando nessun risultato

---

## 📚 Changelog

### 2025-01-29T17:05:00Z - Documentazione Iniziale

- ✅ Documentazione completa componente `ExerciseCatalog`
- ✅ Descrizione filtri e selezione
- ✅ Esempi d'uso
- ✅ Note tecniche e miglioramenti futuri

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare `POST /api/exercises` route
