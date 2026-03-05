# CommunicationsList Component

## Descrizione

Componente lista che gestisce la visualizzazione di tutte le comunicazioni con paginazione, stati di loading e empty state. Integra il componente `CommunicationCard` per visualizzare ogni singola comunicazione.

## Percorso File

`src/components/communications/communications-list.tsx`

## Props

### Interface

```typescript
interface CommunicationsListProps {
  communications: Communication[]
  totalCount?: number | null
  currentPage?: number
  totalPages?: number
  itemsPerPage?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
  loading: boolean
  onNewCommunication: () => void
  onSend: (id: string) => void
  onEdit?: (id: string) => void
  onReset?: (id: string) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
  onNextPage?: () => void
  onPrevPage?: () => void
  onPageChange?: (page: number) => void
  getTipoIcon: (tipo: string) => JSX.Element
  getStatoBadge: (stato: string) => JSX.Element
  formatData: (dataString: string | null) => string
}
```

### Props Dettagliate

- `communications`: `Communication[]` - **Obbligatorio** - Array di comunicazioni da visualizzare
- `loading`: `boolean` - **Obbligatorio** - Indica se i dati sono in caricamento
- `onNewCommunication`: `() => void` - **Obbligatorio** - Callback per creare una nuova comunicazione
- `onSend`: `(id: string) => void` - **Obbligatorio** - Callback per inviare una comunicazione
- `totalCount`: `number | null` - **Opzionale** - Numero totale di comunicazioni (per paginazione)
- `currentPage`: `number` - **Opzionale** (default: 1) - Pagina corrente
- `totalPages`: `number` - **Opzionale** (default: 1) - Numero totale di pagine
- `itemsPerPage`: `number` - **Opzionale** (default: 10) - Numero di elementi per pagina
- `hasNextPage`: `boolean` - **Opzionale** (default: false) - Indica se esiste una pagina successiva
- `hasPrevPage`: `boolean` - **Opzionale** (default: false) - Indica se esiste una pagina precedente
- `onEdit`: `(id: string) => void` - **Opzionale** - Callback per modificare una comunicazione
- `onReset`: `(id: string) => void` - **Opzionale** - Callback per resettare una comunicazione
- `onDelete`: `(id: string) => void` - **Opzionale** - Callback per eliminare una comunicazione
- `onViewDetails`: `(id: string) => void` - **Opzionale** - Callback per visualizzare dettagli destinatari
- `onNextPage`: `() => void` - **Opzionale** - Callback per andare alla pagina successiva
- `onPrevPage`: `() => void` - **Opzionale** - Callback per andare alla pagina precedente
- `onPageChange`: `(page: number) => void` - **Opzionale** - Callback per cambiare pagina
- `getTipoIcon`: `(tipo: string) => JSX.Element` - **Obbligatorio** - Funzione che restituisce l'icona per il tipo
- `getStatoBadge`: `(stato: string) => JSX.Element` - **Obbligatorio** - Funzione che restituisce il badge per lo stato
- `formatData`: `(dataString: string | null) => string` - **Obbligatorio** - Funzione per formattare le date

## Dipendenze

### Componenti UI

- `@/components/ui` - `Card`, `CardContent`, `Button`

### Componenti Locali

- `./communication-card` - `CommunicationCard`

### Tipi

- `@/hooks/use-communications` - `Communication` type

### Librerie Esterne

- `lucide-react` - `Loader2`, `Plus`, `ChevronLeft`, `ChevronRight`

## Funzionalità

### Funzionalità Principali

1. **Gestione Stati**: Tre stati distinti (loading, empty, lista)
2. **Rendering Lista**: Mappa ogni comunicazione in un `CommunicationCard`
3. **Paginazione**: Controlli per navigare tra le pagine con indicatori
4. **Empty State**: Messaggio e call-to-action quando non ci sono comunicazioni

### Stati del Componente

1. **Loading State**:
   - Mostra spinner animato
   - Messaggio "Caricamento comunicazioni..."
   - Card con variant "trainer"

2. **Empty State**:
   - Emoji 📭 e messaggio "Nessuna comunicazione trovata"
   - Descrizione esplicativa
   - Bottone "Crea comunicazione" che triggera `onNewCommunication`

3. **Lista State**:
   - Renderizza tutte le comunicazioni usando `CommunicationCard`
   - Mostra controlli paginazione se `totalCount > 0`
   - Indicatore "Mostrando X - Y di Z comunicazioni"

### Paginazione

- **Indicatore Range**: Mostra "Mostrando X - Y di Z comunicazioni" con calcolo automatico
- **Controlli Navigazione**:
  - Bottone "Precedente" (disabilitato se `!hasPrevPage || loading`)
  - Indicatore "Pagina X di Y"
  - Bottone "Successiva" (disabilitato se `!hasNextPage || loading`)
- **Styling**: Card separata per controlli paginazione con gradiente

## Esempi d'Uso

```tsx
import { CommunicationsList } from '@/components/communications'
import type { Communication } from '@/hooks/use-communications'

function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => prev - 1)
  }

  const getTipoIcon = (tipo: string) => {
    // Logica per icona tipo
    return <Bell className="h-5 w-5" />
  }

  const getStatoBadge = (stato: string) => {
    // Logica per badge stato
    return <Badge>{stato}</Badge>
  }

  const formatData = (dataString: string | null) => {
    if (!dataString) return '-'
    return new Date(dataString).toLocaleString('it-IT')
  }

  return (
    <CommunicationsList
      communications={communications}
      loading={loading}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={Math.ceil((totalCount || 0) / 10)}
      hasNextPage={currentPage < Math.ceil((totalCount || 0) / 10)}
      hasPrevPage={currentPage > 1}
      onNewCommunication={() => setModalOpen(true)}
      onSend={handleSend}
      onEdit={handleEdit}
      onReset={handleReset}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
      onNextPage={handleNextPage}
      onPrevPage={handlePrevPage}
      getTipoIcon={getTipoIcon}
      getStatoBadge={getStatoBadge}
      formatData={formatData}
    />
  )
}
```

## Note Tecniche

- **Componente Presentazionale**: Non gestisce fetch dati, solo visualizzazione
- **Calcolo Range**: Utilizza `Math.min()` per calcolare correttamente il range visualizzato
- **Props Default**: Utilizza valori di default per props opzionali (currentPage: 1, totalPages: 1, itemsPerPage: 10)
- **Styling Coerente**: Utilizza Card con variant "trainer" per coerenza visiva
- **Accessibilità**: Bottoni disabilitati quando appropriato, indicatori chiari
- **Performance**: Renderizza solo le comunicazioni della pagina corrente (gestito dal parent)

## Limitazioni Note

- La paginazione è gestita dal parent component (questo componente è solo presentazionale)
- Non gestisce direttamente il fetch dei dati
- I controlli paginazione sono sempre visibili se `totalCount > 0`, anche se non ci sono pagine multiple

## Stato Componente

✅ **Completo** - Componente funzionante e utilizzato in produzione
