# useWorkoutPlans Hook

## Descrizione

Hook completo per gestione workout plans (schede allenamento) con operazioni CRUD, filtri avanzati, ricerca e gestione stato locale. Fornisce anche dati per il wizard di creazione (atleti ed esercizi) e utilities per formattazione status e date.

## Percorso File

`src/hooks/workout-plans/use-workout-plans.ts`

## Return Values

### Interface

```typescript
{
  workouts: Workout[]                                    // Lista filtrata di workout plans
  loading: boolean                                       // Stato caricamento
  error: string | null                                   // Errore se presente
  athletes: Array<{ id: string; name: string; email: string }>  // Atleti per wizard
  exercises: Exercise[]                                  // Esercizi per wizard
  searchTerm: string                                     // Termine ricerca corrente
  setSearchTerm: (term: string) => void                  // Setter per search term
  statusFilter: string                                   // Filtro status corrente
  setStatusFilter: (filter: string) => void              // Setter per status filter
  handleCreateWorkout: (workoutData: WorkoutWizardData) => Promise<void>
  handleUpdateWorkout: (workoutId: string, workoutData: WorkoutWizardData) => Promise<void>
  handleDeleteWorkout: (workoutId: string) => Promise<void>
  getStatusColor: (status: string) => string            // Utility per colore status
  getStatusText: (status: string) => string             // Utility per testo status
  formatDate: (dateString: string) => string            // Utility per formattazione date
}
```

### Return Values Dettagliati

- `workouts`: `Workout[]` - **Lista filtrata** di workout plans (non la lista completa, ma quella filtrata in base a search term, status filter e query params)
- `loading`: `boolean` - Indica se i dati sono in caricamento
- `error`: `string | null` - Messaggio di errore se presente, null altrimenti
- `athletes`: `Array<{ id: string; name: string; email: string }>` - Lista atleti formattati per il wizard (nome completo formato "Nome Cognome")
- `exercises`: `Exercise[]` - Lista completa esercizi disponibili per il wizard
- `searchTerm`: `string` - Termine di ricerca corrente
- `setSearchTerm`: `(term: string) => void` - Funzione per aggiornare il termine di ricerca
- `statusFilter`: `string` - Filtro status corrente (es. 'attivo', 'completato')
- `setStatusFilter`: `(filter: string) => void` - Funzione per aggiornare il filtro status
- `handleCreateWorkout`: `(workoutData: WorkoutWizardData) => Promise<void>` - Crea un nuovo workout plan
- `handleUpdateWorkout`: `(workoutId: string, workoutData: WorkoutWizardData) => Promise<void>` - Aggiorna un workout plan esistente
- `handleDeleteWorkout`: `(workoutId: string) => Promise<void>` - Elimina un workout plan
- `getStatusColor`: `(status: string) => string` - Restituisce il colore corrispondente allo status
- `getStatusText`: `(status: string) => string` - Restituisce il testo italiano corrispondente allo status
- `formatDate`: `(dateString: string) => string` - Formatta una data in formato italiano

## Dipendenze

### React Hooks

- `useState` - Gestione stato locale
- `useEffect` - Side effects (fetch dati, filtri)
- `useCallback` - Memoizzazione funzioni
- `useMemo` - Importato ma non utilizzato nel codice attuale

### Next.js

- `next/navigation` - `useSearchParams` per gestione query params URL

### Supabase

- `@/lib/supabase/client` - `createClient` per accesso database

### Tipi

- `@/types/workout` - `Workout`, `WorkoutWizardData`, `Exercise`
- `@/types/supabase` - `Tables`, `TablesInsert`

## Funzionalità

### Funzionalità Principali

1. **Fetch Workout Plans**: Carica tutti i workout plans dal database con join manuale su profiles per ottenere nomi atleti e staff
2. **Fetch Dati Wizard**: Carica atleti (role 'athlete'/'atleta') ed esercizi per popolare il wizard di creazione
3. **Filtri e Ricerca**: Sistema di filtri combinato (search term + status) con supporto query params
4. **CRUD Completo**: Create, Update, Delete con gestione autenticazione e validazione
5. **Utilities**: Funzioni helper per formattazione status e date

### Funzionalità Avanzate

#### Gestione Query Params

L'hook supporta query params URL con priorità:

1. **`athlete_id`**: Se presente, filtra direttamente per ID atleta e ignora altri filtri
2. **`athlete`**: Se presente (senza `athlete_id`), imposta il search term con il nome atleta
3. **Filtri Locali**: Se non ci sono query params, applica filtri locali (search term + status)

#### Trasformazione Dati

- **Mapping Difficulty**: Conversione tra formato UI (bassa/media/alta) e DB (beginner/intermediate/advanced)
- **Formattazione Nomi**: Unione nome e cognome in formato "Nome Cognome" con fallback a "Sconosciuto"
- **Mapping Status**: Conversione `is_active` boolean → status string ('attivo'/'completato')

#### Cascading Delete in Update

Quando si aggiorna un workout plan:

1. Aggiorna la tabella `workout_plans`
2. Elimina tutti i giorni esistenti (`workout_days`) e relativi esercizi (`workout_day_exercises`)
3. Ricrea completamente la struttura giorni/esercizi con i nuovi dati

#### Aggiornamento Stato Locale

Dopo operazioni CRUD:

- **Create**: Aggiunge il nuovo workout all'inizio della lista `workouts`
- **Update**: Sostituisce il workout aggiornato nella lista
- **Delete**: Rimuove il workout dalla lista

### Funzioni Helper Interne

#### `difficultyUiToDbMap`

```typescript
const difficultyUiToDbMap: Record<
  WorkoutWizardData['difficulty'],
  'beginner' | 'intermediate' | 'advanced'
> = {
  bassa: 'beginner',
  media: 'intermediate',
  alta: 'advanced',
}
```

Mapping da formato UI a formato database (non utilizzato direttamente nel codice attuale, ma disponibile).

#### `difficultyDbToUi`

```typescript
const difficultyDbToUi = (value?: string | null): Workout['difficulty'] => {
  switch (value) {
    case 'beginner':
    case 'bassa':
      return 'bassa'
    case 'advanced':
    case 'alta':
      return 'alta'
    case 'media':
    case 'intermediate':
    default:
      return 'media'
  }
}
```

Mapping da formato database a formato UI con fallback a 'media' se il valore non è riconosciuto.

### Utilities

#### `getStatusColor`

Mappa uno status a un colore per UI:

- `'attivo'` / `'active'` → `'success'`
- `'completato'` / `'completed'` → `'info'`
- `'archiviato'` / `'archived'` → `'default'`
- `'expired'` → `'error'`
- Default → `'default'`

#### `getStatusText`

Mappa uno status a testo italiano:

- `'attivo'` / `'active'` → `'Attiva'`
- `'completato'` / `'completed'` → `'Completata'`
- `'archiviato'` / `'archived'` → `'Archiviata'`
- `'expired'` → `'Scaduta'`
- Default → status originale o `'Sconosciuto'`

#### `formatDate`

Formatta una data in formato italiano:

- Formato: `DD MMM YYYY` (es. "15 gen 2024")
- Utilizza `toLocaleDateString('it-IT')` con opzioni `{ day: 'numeric', month: 'short', year: 'numeric' }`

## Differenza da use-workout-plans-list.ts

### `use-workout-plans-list.ts`

- **Scopo**: Solo fetch read-only di workout plans
- **Filtri**: Basati su ruolo utente (atleta vede solo i suoi, PT/admin vede solo quelli creati da loro)
- **Join**: Utilizza join Supabase automatico con foreign keys
- **Return**: Solo `workouts`, `loading`, `error`, `fetchWorkouts`
- **Uso**: Per visualizzazione semplice lista workout plans

### `use-workout-plans.ts`

- **Scopo**: Gestione completa con CRUD e filtri avanzati
- **Filtri**: Search term, status, query params con priorità
- **Join**: Join manuale su profiles per maggiore controllo
- **Return**: Tutto necessario per gestione completa (CRUD, filtri, utilities, dati wizard)
- **Uso**: Per pagina di gestione completa schede (dashboard/schede)

## Esempi d'Uso

### Esempio Base

```tsx
import { useWorkoutPlans } from '@/hooks/workout-plans/use-workout-plans'

function SchedePage() {
  const {
    workouts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleDeleteWorkout,
    getStatusColor,
    getStatusText,
    formatDate,
  } = useWorkoutPlans()

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error}</div>

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca scheda..."
      />
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">Tutti</option>
        <option value="attivo">Attive</option>
        <option value="completato">Completate</option>
      </select>

      {workouts.map((workout) => (
        <div key={workout.id}>
          <h3>{workout.name}</h3>
          <p>Atleta: {workout.athlete_name}</p>
          <p>Status: {getStatusText(workout.status || '')}</p>
          <p>Data: {formatDate(workout.created_at)}</p>
          <button onClick={() => handleDeleteWorkout(workout.id)}>Elimina</button>
        </div>
      ))}
    </div>
  )
}
```

### Esempio con Creazione

```tsx
import { useWorkoutPlans } from '@/hooks/workout-plans/use-workout-plans'
import type { WorkoutWizardData } from '@/types/workout'

function CreateWorkoutForm() {
  const { athletes, exercises, handleCreateWorkout } = useWorkoutPlans()
  const [formData, setFormData] = useState<WorkoutWizardData>({
    title: '',
    difficulty: 'media',
    days: [],
  })

  const handleSubmit = async () => {
    try {
      await handleCreateWorkout(formData)
      // Successo - il workout è stato aggiunto alla lista
    } catch (error) {
      console.error('Errore creazione:', error)
    }
  }

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>
}
```

### Esempio con Query Params

L'hook gestisce automaticamente query params nell'URL:

```tsx
// URL: /dashboard/schede?athlete_id=123
// L'hook filtra automaticamente per quell'atleta

// URL: /dashboard/schede?athlete=Mario
// L'hook imposta automaticamente il search term a "Mario"
```

## Note Tecniche

### Gestione Autenticazione

Tutte le operazioni CRUD verificano l'autenticazione:

- `handleCreateWorkout`: Verifica utente autenticato e profilo staff
- `handleUpdateWorkout`: Verifica utente autenticato
- `handleDeleteWorkout`: Non verifica esplicitamente (dipende da RLS policies Supabase)

### Validazione

- **Create/Update**: Richiede `athlete_id` obbligatorio, lancia errore se mancante
- **Create**: Verifica che il profilo staff esista
- **Update**: Verifica che il workout esista prima di aggiornare

### Performance

- **Fetch Separati**: Atleti ed esercizi vengono caricati una sola volta al mount
- **Memoizzazione**: Funzioni utilities sono memoizzate con `useCallback`
- **Join Manuale**: Join su profiles fatto manualmente per evitare query complesse Supabase
- **Filtri Client-Side**: Filtri applicati lato client dopo fetch completo (potrebbe essere ottimizzato con server-side filtering per liste grandi)

### Limitazioni Note

- **Fetch Completo**: Carica tutti i workout plans senza paginazione (potrebbe essere lento con molti dati)
- **Filtri Client-Side**: Filtri applicati dopo fetch completo, non sul database
- **Cascading Delete**: Update elimina e ricrea tutto (non fa merge intelligente)
- **Org ID**: Utilizza sempre `'default-org'` hardcoded (non gestisce multi-tenant)
- **Difficulty**: Non viene salvata nel database durante create/update (sempre null nel DB)

### Pattern Utilizzati

- **Controlled Components**: Search term e status filter sono controllati dall'esterno tramite setters
- **Optimistic Updates**: Aggiornamento stato locale immediato dopo operazioni CRUD
- **Error Handling**: Errori catturati e esposti tramite `error` state e throw nelle funzioni async
- **Type Safety**: Utilizzo estensivo di TypeScript con tipi da Supabase e custom types

## Stato Hook

✅ **Completo** - Hook funzionante e utilizzato in produzione in `src/app/dashboard/schede/page.tsx`
