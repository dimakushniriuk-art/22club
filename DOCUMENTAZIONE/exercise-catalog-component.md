# Componente: ExerciseCatalog

## 📋 Descrizione

Componente catalogo per visualizzare e selezionare esercizi da aggiungere a una scheda di allenamento. Include filtri avanzati (ricerca, gruppo muscolare, attrezzatura, difficoltà) e visualizzazione a griglia con immagini/video.

## 📁 Percorso File

`src/components/workout/exercise-catalog.tsx`

## 🔧 Props

```typescript
interface ExerciseCatalogProps {
  exercises: Exercise[]
  onExerciseSelect: (exercise: Exercise) => void
  selectedExercises: string[]
  className?: string
}
```

### Dettaglio Props

- **`exercises`** (array, required): Lista completa degli esercizi disponibili
- **`onExerciseSelect`** (function, required): Callback chiamato quando un esercizio viene selezionato
- **`selectedExercises`** (array, required): Array di ID esercizi già selezionati (per evidenziarli)
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React Hooks

- `useState`, `useMemo` da `react`

### Next.js

- `Image` da `next/image`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Input` da `@/components/ui`
- `Button` da `@/components/ui`
- `Badge` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`

### Custom Hooks

- `useIcon` da `@/components/ui/professional-icons`

### Types

- `Exercise`, `ExerciseFilter`, `MuscleGroup`, `Equipment` da `@/types/workout`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Esercizi**: Griglia responsive di card esercizi
2. **Filtri Avanzati**: Ricerca testuale, gruppo muscolare, attrezzatura, difficoltà
3. **Selezione Esercizi**: Click su card per selezionare/deselezionare
4. **Evidenziazione**: Mostra badge "Selezionato" per esercizi già scelti
5. **Media Support**: Mostra video, thumbnail o immagini degli esercizi

### Filtri

- **Ricerca**: Cerca nel nome e descrizione dell'esercizio
- **Gruppo Muscolare**: Filtra per gruppo muscolare (petto, schiena, gambe, etc.)
- **Attrezzatura**: Filtra per tipo attrezzatura (bilanciere, manubri, corpo libero, etc.)
- **Difficoltà**: Filtra per difficoltà (bassa, media, alta)
- **Reset Filtri**: Pulsante per cancellare tutti i filtri

### UI/UX

- Griglia responsive (1 colonna mobile, 2 tablet, 3 desktop)
- Card con hover effect e bordo evidenziato se selezionato
- Media preview (video/immagine) o placeholder con icona
- Badge per gruppo muscolare, attrezzatura e difficoltà
- Empty state quando nessun esercizio corrisponde ai filtri

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header
  │   ├── Titolo "Catalogo Esercizi"
  │   └── Badge contatore esercizi filtrati
  ├── Card Filtri
  │   ├── Input ricerca
  │   ├── Grid filtri (3 colonne)
  │   │   ├── SimpleSelect "Gruppo muscolare"
  │   │   ├── SimpleSelect "Attrezzatura"
  │   │   └── SimpleSelect "Difficoltà"
  │   └── Button "Cancella filtri" (se filtri attivi)
  ├── Griglia Esercizi (grid 1/2/3 colonne)
  │   └── Card (per ogni esercizio)
  │       ├── Media (video/immagine/placeholder)
  │       ├── Nome esercizio
  │       ├── Badge (gruppo, attrezzatura, difficoltà)
  │       ├── Descrizione (line-clamp-2)
  │       └── Badge "Selezionato" (se selezionato)
  └── Empty State (se nessun esercizio)
      └── Card con messaggio e pulsante reset
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ExerciseCatalog } from '@/components/workout/exercise-catalog'

function MyComponent() {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])

  const handleExerciseSelect = (exercise: Exercise) => {
    if (selectedExercises.includes(exercise.id)) {
      setSelectedExercises((prev) => prev.filter((id) => id !== exercise.id))
    } else {
      setSelectedExercises((prev) => [...prev, exercise.id])
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

## 🔍 Note Tecniche

### Filtraggio Esercizi

Utilizza `useMemo` per filtrare gli esercizi in base ai filtri:

```typescript
const filteredExercises = useMemo(() => {
  return exercises.filter((exercise: Exercise) => {
    const matchesSearch = !filters.search || ...
    const matchesMuscleGroup = filters.muscle_group === 'all' || ...
    const matchesEquipment = filters.equipment === 'all' || ...
    const matchesDifficulty = filters.difficulty === 'all' || ...
    return matchesSearch && matchesMuscleGroup && matchesEquipment && matchesDifficulty
  })
}, [exercises, filters])
```

### Media Priority

1. **Video**: Se `video_url` presente, mostra video con poster
2. **Thumbnail**: Se `thumb_url` presente, mostra thumbnail
3. **Immagine**: Se `image_url` presente, mostra immagine
4. **Placeholder**: Altrimenti mostra icona gruppo muscolare

### Gestione Errori Immagini

- Utilizza `onError` per nascondere immagini che non caricano
- Fallback automatico a placeholder

### Dati Mock

- `muscleGroups`: Lista gruppi muscolari con icone
- `equipment`: Lista attrezzature con icone
- `difficulties`: Lista difficoltà con colori

### Limitazioni

- I dati mock per gruppi muscolari e attrezzature sono hardcoded (dovrebbero venire dal backend)
- Non supporta ordinamento personalizzato
- Non supporta paginazione (mostra tutti gli esercizi filtrati)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
