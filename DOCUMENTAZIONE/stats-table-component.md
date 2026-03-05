# Componente: StatsTable

## 📋 Descrizione

Componente tabella per visualizzare statistiche atleti. Supporta ricerca, ordinamento, selezione multipla, export e visualizzazione dettagliata di metriche atleti (entrate, lezioni, schede, misurazioni, foto).

## 📁 Percorso File

`src/components/dashboard/stats-table.tsx`

## 🔧 Props

```typescript
interface StatsTableProps {
  data: AthleteStats[]
  onExport: () => void
}

export interface AthleteStats {
  athlete_id: string
  nome_atleta: string
  email_atleta: string
  data_iscrizione: string
  entrate_totali: number
  lezioni_acquistate: number
  lezioni_utilizzate: number
  lezioni_rimanenti: number
  schede_assegnate: number
  schede_completate: number
  schede_attive: number
  misurazioni_totali: number
  ultima_misurazione: string
  foto_totali: number
  ultima_foto: string
  percentuale_completamento_schede: number
  percentuale_utilizzo_lezioni: number
}
```

### Dettaglio Props

- **`data`** (AthleteStats[], required): Array statistiche atleti
- **`onExport`** (function, required): Callback export dati

## 📦 Dipendenze

### React Hooks

- `useState` da `react`

### UI Components

- `Badge`, `Button`, `Input`, `Card`, `CardContent` da `@/components/ui`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` da `@/components/ui/table`

### Icons

- `Download`, `Search`, `ChevronUp`, `ChevronDown`, `Eye` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Tabella Statistiche**: Visualizza tutte le metriche atleti
2. **Ricerca**: Filtra per nome o email atleta
3. **Ordinamento**: Ordina per qualsiasi colonna (asc/desc)
4. **Selezione Multipla**: Seleziona più atleti per azioni bulk
5. **Export**: Bottone export dati

### Colonne Tabella

- Nome Atleta
- Email
- Data Iscrizione
- Entrate Totali
- Lezioni (Acquistate/Utilizzate/Rimanenti)
- Schede (Assegnate/Completate/Attive)
- Misurazioni (Totali/Ultima)
- Foto (Totali/Ultima)
- Percentuali (Completamento/Utilizzo)

### Funzionalità Avanzate

- **Ricerca Real-time**: Filtra mentre digiti
- **Ordinamento Multi-colonna**: Click header per ordinare
- **Selezione Multipla**: Checkbox per selezionare atleti
- **Select All**: Seleziona/deseleziona tutti
- **Export Button**: Bottone export con icona
- **Error Boundary**: Messaggio errore se dati mancanti

### Validazioni

- Dati array valido
- Ricerca case-insensitive
- Ordinamento per tipo (string/number)

### UI/UX

- Tabella responsive con scroll orizzontale
- Header con ricerca e export
- Checkbox per selezione
- Icone ordinamento (chevron up/down)
- Badge per valori percentuali
- Hover effects su righe

## 🎨 Struttura UI

```
Card
  └── CardContent
      ├── Header
      │   ├── Input Search
      │   └── Button Export
      └── Table
          ├── TableHeader
          │   └── TableRow
          │       ├── Checkbox Select All
          │       └── TableHead (per ogni colonna, clickable per sort)
          └── TableBody
              └── TableRow (per ogni atleta)
                  ├── Checkbox Select
                  └── TableCell (per ogni campo)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { StatsTable } from '@/components/dashboard/stats-table'

function StatisticsPage() {
  const athleteStats = [
    {
      athlete_id: '1',
      nome_atleta: 'Mario Rossi',
      email_atleta: 'mario@example.com',
      // ... altri campi
    },
    // ...
  ]

  return (
    <StatsTable
      data={athleteStats}
      onExport={() => {
        // Logica export
        console.log('Exporting data')
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Ordinamento

```typescript
type SortField = keyof AthleteStats
type SortDirection = 'asc' | 'desc'

const sortedData = [...filteredData].sort((a, b) => {
  const aValue = a[sortField]
  const bValue = b[sortField]

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  }

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
  }

  return 0
})
```

### Ricerca

- Case-insensitive
- Cerca in `nome_atleta` e `email_atleta`
- Filtra array in real-time

### Limitazioni

- Export callback deve essere implementato nel parent
- Ordinamento solo per una colonna alla volta
- Nessuna paginazione (mostra tutti i risultati)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
