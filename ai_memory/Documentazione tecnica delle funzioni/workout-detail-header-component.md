# Componente: WorkoutDetailHeader

## 📋 Descrizione

Componente header per visualizzare le informazioni principali di una scheda di allenamento: nome, descrizione, stato, atleta, PT e data creazione.

## 📁 Percorso File

`src/components/workout/workout-detail-header.tsx`

## 🔧 Props

```typescript
interface WorkoutDetailHeaderProps {
  workout: {
    name: string
    description: string | null
    status: string
    difficulty: string | null
    created_at: string
    athlete_name: string
    staff_name: string
  }
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (dateString: string) => string
}
```

### Dettaglio Props

- **`workout`** (object, required): Oggetto workout con tutte le informazioni
- **`getStatusColor`** (function, required): Funzione per ottenere il colore dello status
- **`getStatusText`** (function, required): Funzione per ottenere il testo dello status
- **`formatDate`** (function, required): Funzione per formattare le date

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Badge` da `@/components/ui`
- `User`, `Target`, `Calendar`, `Dumbbell` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Info**: Mostra nome, descrizione, stato della scheda
2. **Badge Status**: Mostra badge colorato con stato (attiva, completata, etc.)
3. **Info Atleta/PT**: Mostra nome atleta e personal trainer
4. **Data Creazione**: Mostra quando è stata creata la scheda
5. **Difficoltà**: Mostra livello di difficoltà (se disponibile)

### UI/UX

- Card con padding ottimizzato
- Layout a griglia 2 colonne per info
- Icone per ogni sezione
- Badge status colorato
- Layout responsive

## 🎨 Struttura UI

```
Card
  └── CardContent
      ├── Header
      │   ├── Nome scheda (h3, bold)
      │   ├── Descrizione (se presente)
      │   └── Badge status
      └── Grid Info (2 colonne)
          ├── Atleta
          │   ├── Icona User
          │   ├── Label "Atleta"
          │   └── Nome atleta
          ├── PT
          │   ├── Icona Target
          │   ├── Label "PT"
          │   └── Nome PT
          ├── Data Creazione
          │   ├── Icona Calendar
          │   ├── Label "Creata il"
          │   └── Data formattata
          └── Difficoltà (se presente)
              ├── Icona Dumbbell
              ├── Label "Difficoltà"
              └── Livello difficoltà
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutDetailHeader } from '@/components/workout/workout-detail-header'

function MyComponent() {
  const workout = {
    name: 'Scheda Inizio',
    description: 'Scheda per principianti',
    status: 'active',
    difficulty: 'facile',
    created_at: '2025-02-01T10:00:00Z',
    athlete_name: 'Mario Rossi',
    staff_name: 'Giuseppe Verdi',
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Attiva'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT')
  }

  return (
    <WorkoutDetailHeader
      workout={workout}
      getStatusColor={getStatusColor}
      getStatusText={getStatusText}
      formatDate={formatDate}
    />
  )
}
```

## 🔍 Note Tecniche

### Formattazione Status

Le funzioni `getStatusColor` e `getStatusText` devono essere fornite dal parent perché:

- Gestiscono la logica di mapping status → colore/testo
- Supportano più lingue (italiano/inglese)
- Possono essere personalizzate per contesto

### Layout Grid

Il layout usa `grid-cols-2` per mostrare le info in 2 colonne:

- Prima colonna: Atleta, Data Creazione
- Seconda colonna: PT, Difficoltà

### Limitazioni

- Non permette modifica (solo visualizzazione)
- Le funzioni di formattazione devono essere fornite dal parent
- Non mostra statistiche aggiuntive

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
