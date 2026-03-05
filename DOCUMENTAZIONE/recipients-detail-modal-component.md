# RecipientsDetailModal Component

## Descrizione

Modal per visualizzare il dettaglio completo di tutti i destinatari di una comunicazione. Include statistiche aggregate, filtri per status, ricerca, e tabella scrollabile con tutte le informazioni dei destinatari (nome, email, telefono, tipo, stato, timestamp).

## Percorso File

`src/components/communications/recipients-detail-modal.tsx`

## Props

### Interface

```typescript
interface RecipientsDetailModalProps {
  isOpen: boolean
  onClose: () => void
  communicationId: string
  communicationTitle: string
}
```

### Props Dettagliate

- `isOpen`: `boolean` - **Obbligatorio** - Controlla la visibilità del modal
- `onClose`: `() => void` - **Obbligatorio** - Callback per chiudere il modal
- `communicationId`: `string` - **Obbligatorio** - ID della comunicazione di cui visualizzare i destinatari
- `communicationTitle`: `string` - **Obbligatorio** - Titolo della comunicazione (mostrato nella descrizione)

## Tipo Interno: Recipient

### Interface

```typescript
interface Recipient {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  recipient_type: 'push' | 'email' | 'sms'
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'
  sent_at: string | null
  delivered_at: string | null
  opened_at: string | null
  failed_at: string | null
  error_message: string | null
  created_at: string
}
```

## Dipendenze

### Componenti UI

- `@/components/ui` - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Button`

### Hooks

- `react` - `useState`, `useEffect`

### Librerie Esterne

- `lucide-react` - `Loader2`, `CheckCircle`, `XCircle`, `Clock`, `Mail`, `Search`

## Funzionalità

### Funzionalità Principali

1. **Fetch Automatico**: Carica destinatari all'apertura del modal
2. **Statistiche Aggregate**: 6 card con conteggi per ogni stato
3. **Filtri Status**: Filtra destinatari per status (all, pending, sent, delivered, opened, failed)
4. **Ricerca**: Cerca destinatari per nome, email o telefono
5. **Tabella Dettagliata**: Visualizza tutte le informazioni dei destinatari in tabella scrollabile

### Statistiche Aggregate

Il componente calcola e mostra:

- **Totali**: Numero totale di destinatari
- **In attesa**: Destinatari con status 'pending'
- **Inviati**: Destinatari con status 'sent'
- **Consegnati**: Destinatari con status 'delivered'
- **Aperti**: Destinatari con status 'opened'
- **Falliti**: Destinatari con status 'failed' o 'bounced'

Ogni statistica è visualizzata in una card colorata con bordo e background corrispondente allo stato.

### Filtri

- **Filtro Status**: Bottoni per filtrare per status specifico o 'all'
- **Ricerca**: Input di ricerca che filtra per:
  - Nome (case-insensitive)
  - Email (case-insensitive)
  - Telefono (case-insensitive)
- **Combinazione**: I filtri status e ricerca funzionano insieme (AND logic)

### Tabella Destinatari

Colonne visualizzate:

1. **Nome**: Nome completo destinatario
2. **Email**: Email destinatario (o '-' se null)
3. **Telefono**: Telefono destinatario (o '-' se null)
4. **Tipo**: Tipo destinatario (PUSH, EMAIL, SMS) in uppercase
5. **Stato**: Icona + label dello stato con colore corrispondente
6. **Inviato**: Timestamp invio (formattato) o '-'
7. **Consegnato**: Timestamp consegna (formattato) o '-'
8. **Aperto**: Timestamp apertura (formattato) o '-'

### Stati e Icone

Mapping status → icona + colore:

- `pending`: Clock (giallo)
- `sent`: Mail (blu)
- `delivered`: CheckCircle (verde)
- `opened`: CheckCircle (teal)
- `failed`: XCircle (rosso)
- `bounced`: XCircle (arancione)

### Formattazione Date

Funzione `formatDate` formatta le date in formato italiano:

- Formato: `DD/MM/YYYY, HH:MM`
- Se `dateString` è null, restituisce '-'

## Esempi d'Uso

```tsx
import { RecipientsDetailModal } from '@/components/communications'
import { useState } from 'react'

function CommunicationCard({ communication }: { communication: Communication }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setDetailsOpen(true)}>Visualizza Dettagli</Button>

      <RecipientsDetailModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        communicationId={communication.id}
        communicationTitle={communication.title}
      />
    </>
  )
}
```

## Note Tecniche

- **Fetch Automatico**: Chiama `/api/communications/recipients?communication_id={id}` quando il modal si apre
- **Reset State**: Resetta tutti gli stati (recipients, filtri, errori) quando il modal si chiude
- **Error Handling**: Gestisce errori di fetch con messaggio e bottone "Riprova"
- **Loading State**: Mostra spinner durante il caricamento
- **Empty State**: Mostra "Nessun destinatario trovato" quando i filtri non restituiscono risultati
- **Scrollable Table**: Tabella con overflow-auto per gestire liste lunghe
- **Sticky Header**: Header tabella rimane visibile durante lo scroll
- **Responsive**: Modal con max-width 5xl e max-height 90vh
- **Performance**: Filtraggio client-side (potrebbe essere ottimizzato con server-side filtering per liste molto grandi)

## API Integration

### Endpoint Utilizzato

```
GET /api/communications/recipients?communication_id={communicationId}
```

### Response Attesa

```typescript
{
  recipients: Recipient[]
  error?: string
}
```

## Limitazioni Note

- Il fetch avviene ogni volta che il modal si apre (non c'è caching)
- Il filtro "bounced" è incluso in "failed" nelle statistiche ma non ha bottone filtro dedicato
- La ricerca è case-insensitive ma non supporta caratteri speciali o regex
- La tabella potrebbe avere problemi di performance con liste molto grandi (>1000 destinatari)
- Non c'è paginazione per la tabella (tutti i destinatari vengono caricati)

## Stati del Componente

1. **Loading**: Spinner e messaggio "Caricamento destinatari..."
2. **Error**: Messaggio di errore e bottone "Riprova"
3. **Success**: Statistiche, filtri, ricerca e tabella con destinatari
4. **Empty (dopo filtri)**: "Nessun destinatario trovato" nella tabella

## Stato Componente

✅ **Completo** - Componente funzionante e utilizzato in produzione
