# Componente: ClientiEmptyState

## 📋 Descrizione

Componente empty state per pagina clienti. Mostra messaggio quando nessun cliente corrisponde ai filtri o quando non ci sono clienti. Include bottone per resettare filtri o invitare primo atleta.

## 📁 Percorso File

`src/components/dashboard/clienti/clienti-empty-state.tsx`

## 🔧 Props

```typescript
interface ClientiEmptyStateProps {
  searchTerm: string
  statoFilter: 'tutti' | 'attivo' | 'inattivo' | 'sospeso'
  totali: number
  onResetFilters: () => void
}
```

### Dettaglio Props

- **`searchTerm`** (string, required): Termine ricerca corrente
- **`statoFilter`** ('tutti' | 'attivo' | 'inattivo' | 'sospeso', required): Filtro stato corrente
- **`totali`** (number, required): Numero totale clienti nel database
- **`onResetFilters`** (function, required): Callback per resettare filtri

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### Next.js

- `Link` da `next/link`

### UI Components

- `Button` da `@/components/ui`

### Icons

- `Users`, `UserPlus` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Messaggi Dinamici**: Messaggio diverso in base a filtri e totali
2. **Reset Filtri**: Bottone per resettare filtri se ci sono clienti
3. **Invita Atleta**: Link per invitare primo atleta se nessun cliente

### Logica Messaggi

- **Se `totali > 0`**: "I filtri attuali non corrispondono a nessun cliente. Ci sono X clienti totali..."
- **Se filtri attivi e `totali === 0`**: "Prova a modificare i filtri di ricerca..."
- **Se nessun filtro e `totali === 0`**: "Inizia invitando i tuoi primi atleti..."

### Funzionalità Avanzate

- **Icona Grande**: Icona Users grande (h-12 w-12)
- **Messaggio Condizionale**: Messaggio cambia in base a stato
- **Bottone Reset**: Solo se `totali > 0`
- **Link Invita**: Solo se nessun filtro e `totali === 0`

### UI/UX

- Layout centrato verticale
- Icona prominente
- Messaggio chiaro e informativo
- Bottoni con stile gradiente
- Link a pagina invita atleta

## 🎨 Struttura UI

```
div (py-16, text-center)
  ├── Icona Users (h-12 w-12, text-teal-400)
  ├── h3 (titolo)
  ├── p (messaggio)
  ├── Button Reset (se totali > 0)
  └── Link Invita Atleta (se nessun filtro e totali === 0)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClientiEmptyState } from '@/components/dashboard/clienti/clienti-empty-state'

function ClientsPage() {
  return (
    <ClientiEmptyState
      searchTerm=""
      statoFilter="tutti"
      totali={0}
      onResetFilters={() => {
        setSearchTerm('')
        setStatoFilter('tutti')
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Logica Messaggi

```typescript
{
  totali > 0
    ? `I filtri attuali non corrispondono... Ci sono ${totali} clienti totali...`
    : searchTerm || statoFilter !== 'tutti'
      ? 'Prova a modificare i filtri...'
      : 'Inizia invitando i tuoi primi atleti...'
}
```

### Limitazioni

- Messaggi hardcoded (non configurabili)
- Link a `/dashboard/invita-atleta` hardcoded
- Solo un bottone alla volta (reset o invita)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
