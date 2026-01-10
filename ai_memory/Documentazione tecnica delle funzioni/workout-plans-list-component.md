# Componente: WorkoutPlansList

## 📋 Descrizione

Componente che renderizza la lista delle schede di allenamento in una griglia responsive. Gestisce la visualizzazione delle card workout e mostra lo stato vuoto quando non ci sono schede disponibili.

## 📁 Percorso File

`src/components/workout-plans/workout-plans-list.tsx`

## 🔧 Props

```typescript
interface WorkoutPlansListProps {
  workouts: Workout[]
  searchTerm: string
  statusFilter: string
  onWorkoutClick: (workout: Workout) => void
  onViewClick: (workout: Workout) => void
  onDeleteClick?: (workout: Workout) => void
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (dateString: string) => string
}
```

### Dettaglio Props

- **`workouts`** (Workout[], required): Array delle schede di allenamento da visualizzare
- **`searchTerm`** (string, required): Termine di ricerca attivo
- **`statusFilter`** (string, required): Filtro per stato delle schede
- **`onWorkoutClick`** (function, required): Callback chiamato quando si clicca su una scheda
- **`onViewClick`** (function, required): Callback chiamato quando si clicca su "Visualizza"
- **`onDeleteClick`** (function, optional): Callback chiamato quando si elimina una scheda
- **`getStatusColor`** (function, required): Funzione per ottenere il colore dello stato
- **`getStatusText`** (function, required): Funzione per ottenere il testo dello stato
- **`formatDate`** (function, required): Funzione per formattare le date

## 📦 Dipendenze

### UI Components

- `WorkoutCard` da `./workout-card`
- `WorkoutPlansEmptyState` da `./workout-plans-empty-state`

### Types

- `Workout` da `@/types/workout`

## ⚙️ Funzionalità

### Core

1. **Rendering Lista**: Visualizza le schede in una griglia responsive
2. **Empty State**: Mostra lo stato vuoto quando non ci sono schede
3. **Grid Layout**: Layout responsive (1 colonna mobile, 2 tablet, 3 desktop)

### Funzionalità Avanzate

- **Responsive Grid**: Adatta il numero di colonne in base alla viewport
- **Empty State Handling**: Gestisce automaticamente lo stato vuoto
- **Event Propagation**: Passa gli eventi alle card individuali

### UI/UX

- Grid layout responsive
- Gap consistente tra le card
- Integrazione con empty state

## 🎨 Struttura UI

```
Container (grid)
  ├── Se workouts.length === 0
  │   └── WorkoutPlansEmptyState
  └── Se workouts.length > 0
      └── Grid
          └── WorkoutCard[] (per ogni workout)
```

## 💡 Esempi d'Uso

```tsx
<WorkoutPlansList
  workouts={workouts}
  searchTerm={searchTerm}
  statusFilter={statusFilter}
  onWorkoutClick={handleWorkoutClick}
  onViewClick={handleViewClick}
  onDeleteClick={handleDeleteClick}
  getStatusColor={getStatusColor}
  getStatusText={getStatusText}
  formatDate={formatDate}
/>
```

## 📝 Note Tecniche

- Componente estratto da `schede/page.tsx` per migliorare manutenibilità (FASE C - Split File Lunghi)
- Utilizza `WorkoutPlansEmptyState` per gestire lo stato vuoto
- Grid layout con Tailwind CSS responsive classes
- Tutti i callback sono passati alle `WorkoutCard` individuali

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
