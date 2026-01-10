# Componente: AllenamentoDettaglioModal

## 📋 Descrizione

Modal per visualizzare dettagli completi di un allenamento. Mostra informazioni atleta, PT, data, stato, esercizi, serie, ripetizioni, peso e note. Utilizza hook `useAllenamentoDettaglio` per caricare dati.

## 📁 Percorso File

`src/components/dashboard/allenamento-dettaglio-modal.tsx`

## 🔧 Props

```typescript
interface AllenamentoDettaglioModalProps {
  allenamentoId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### Dettaglio Props

- **`allenamentoId`** (string | null, required): ID allenamento da visualizzare
- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` da `@/components/ui/dialog`
- `Badge` da `@/components/ui/badge`
- `Card`, `CardContent` da `@/components/ui/card`
- `Spinner` da `@/components/ui/spinner`

### Icons

- `Calendar`, `Clock`, `TrendingUp`, `CheckCircle`, `FileText` da `lucide-react`

### Hooks

- `useAllenamentoDettaglio` da `@/hooks/use-allenamenti`

### Componenti Interni

- `ErrorState` da `./error-state`

### Utils

- `formatDate` (funzione locale)

## ⚙️ Funzionalità

### Core

1. **Dettagli Allenamento**: Mostra informazioni complete allenamento
2. **Stato Badge**: Badge colorato per stato (completato, in corso, programmato, saltato)
3. **Lista Esercizi**: Esercizi con serie, ripetizioni, peso, note
4. **Loading/Error States**: Gestione stati loading e errore

### Informazioni Visualizzate

- **Header**: Nome atleta, PT, data, stato
- **Dettagli**: Tipo allenamento, durata, difficoltà
- **Esercizi**: Lista completa con:
  - Nome esercizio
  - Serie e ripetizioni
  - Peso
  - Note esercizio

### Funzionalità Avanzate

- **Stato Badge**: 4 stati con icone e colori:
  - **completato**: Badge verde con CheckCircle
  - **in_corso**: Badge giallo con Clock
  - **programmato**: Badge blu con Calendar
  - **saltato**: Badge giallo senza icona
- **Formattazione Date**: Funzione `formatDate` per formato italiano
- **Scroll Content**: Modal con max-height e scroll per contenuti lunghi

### UI/UX

- Modal responsive (max-width 600px)
- Header con titolo e descrizione
- Card per informazioni principali
- Lista esercizi con separatori
- Loading spinner centrato
- Error state con messaggio

## 🎨 Struttura UI

```
Dialog
  └── DialogContent (max-h-[90vh], overflow-y-auto)
      ├── DialogHeader
      │   ├── DialogTitle
      │   └── DialogDescription
      ├── Loading/Error/Dettagli
      │   └── Card (se dettagli)
      │       ├── Header (atleta, PT, data, stato)
      │       └── Esercizi List
      │           └── Esercizio Item
      │               ├── Nome
      │               └── Dettagli (serie, ripetizioni, peso, note)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AllenamentoDettaglioModal } from '@/components/dashboard/allenamento-dettaglio-modal'

function SchedePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <AllenamentoDettaglioModal
      allenamentoId={selectedId}
      open={selectedId !== null}
      onOpenChange={(open) => !open && setSelectedId(null)}
    />
  )
}
```

## 🔍 Note Tecniche

### Hook useAllenamentoDettaglio

- Carica dati quando `allenamentoId` cambia
- Restituisce `{ dettaglio, loading, error }`
- `dettaglio` include `allenamento` e `esercizi`

### Formattazione Date

```typescript
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
```

### Limitazioni

- Richiede hook `useAllenamentoDettaglio` funzionante
- Dati devono essere nel formato atteso dal hook
- Modal non gestisce modifica (solo visualizzazione)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
