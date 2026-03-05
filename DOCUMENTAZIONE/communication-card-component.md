# CommunicationCard Component

## Descrizione

Componente card per visualizzare una singola comunicazione con tutti i suoi dettagli, statistiche e azioni disponibili. Gestisce diversi stati della comunicazione (draft, sending, sent, failed) con UI e azioni specifiche per ciascuno stato.

## Percorso File

`src/components/communications/communication-card.tsx`

## Props

### Interface

```typescript
interface CommunicationCardProps {
  communication: Communication
  onSend: (id: string) => void
  onEdit?: (id: string) => void
  onReset?: (id: string) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
  getTipoIcon: (tipo: string) => JSX.Element
  getStatoBadge: (stato: string) => JSX.Element
  formatData: (dataString: string | null) => string
}
```

### Props Dettagliate

- `communication`: `Communication` - **Obbligatorio** - Oggetto comunicazione completo con tutti i dati
- `onSend`: `(id: string) => void` - **Obbligatorio** - Callback per inviare la comunicazione
- `onEdit`: `(id: string) => void` - **Opzionale** - Callback per modificare la comunicazione (mostrato solo per draft e failed)
- `onReset`: `(id: string) => void` - **Opzionale** - Callback per resettare lo stato della comunicazione (mostrato solo per sending)
- `onDelete`: `(id: string) => void` - **Opzionale** - Callback per eliminare la comunicazione (sempre visibile)
- `onViewDetails`: `(id: string) => void` - **Opzionale** - Callback per visualizzare dettagli destinatari (mostrato solo se ci sono recipients e status non è draft)
- `getTipoIcon`: `(tipo: string) => JSX.Element` - **Obbligatorio** - Funzione che restituisce l'icona per il tipo di comunicazione
- `getStatoBadge`: `(stato: string) => JSX.Element` - **Obbligatorio** - Funzione che restituisce il badge per lo stato
- `formatData`: `(dataString: string | null) => string` - **Obbligatorio** - Funzione per formattare le date

## Dipendenze

### Componenti UI

- `@/components/ui` - `Card`, `CardContent`, `Button`, `Badge`, `Progress`
- `@/components/ui/toast` - `useToast`

### Hooks

- `react` - `useState`, `useCallback`

### Tipi

- `@/hooks/use-communications` - `Communication` type

### Librerie Esterne

- `lucide-react` - `Bell`, `Mail`, `MessageSquare`, `Send`, `Users`, `CheckCircle`, `Calendar`, `AlertCircle`, `Loader2`, `Info`, `Eye`, `Trash2`

## Funzionalità

### Funzionalità Principali

1. **Visualizzazione Dettagli**: Mostra tipo, titolo, messaggio, stato, destinatari e statistiche
2. **Gestione Stati Multipli**: UI e azioni diverse per draft, sending, sent, failed
3. **Calcolo Destinatari Stimati**: Per comunicazioni draft, calcola il numero stimato di destinatari
4. **Statistiche**: Mostra delivery rate e open rate per comunicazioni inviate
5. **Progress Bar**: Visualizza progresso invio per comunicazioni in stato "sending"

### Funzionalità Avanzate

- **`fetchEstimatedRecipients`**: Funzione che chiama l'API `/api/communications/count-recipients` per calcolare il numero stimato di destinatari per draft senza recipients
- **Verifica Comunicazioni Bloccate**: Per stato "sending", verifica se la comunicazione è bloccata chiamando `/api/communications/check-stuck` prima di riprovare l'invio
- **Calcolo Metriche**:
  - Delivery rate: `(total_delivered / total_sent) * 100`
  - Open rate: `(total_opened / total_delivered) * 100`

### Stati Supportati

1. **draft**:
   - Mostra "Destinatari calcolati all'invio" o numero stimato
   - Azioni: Modifica (opzionale), Invia, Elimina
   - Bottone per calcolare destinatari stimati (se non già calcolato)

2. **sending**:
   - Mostra progress bar con percentuale inviati
   - Azioni: Riprova invio (con check stuck), Reset (opzionale), Elimina
   - Verifica automatica se comunicazione bloccata

3. **sent**:
   - Mostra statistiche: consegnati (con %), aperti (con %)
   - Azioni: Dettagli (se ci sono recipients), Elimina

4. **failed**:
   - Azioni: Modifica (opzionale), Riprova invio, Elimina

## Esempi d'Uso

```tsx
import { CommunicationCard } from '@/components/communications'
import type { Communication } from '@/hooks/use-communications'

function CommunicationsList({ communications }: { communications: Communication[] }) {
  const getTipoIcon = (tipo: string) => {
    // Logica per restituire icona in base al tipo
    return <Bell className="h-5 w-5" />
  }

  const getStatoBadge = (stato: string) => {
    // Logica per restituire badge in base allo stato
    return <Badge>{stato}</Badge>
  }

  const formatData = (dataString: string | null) => {
    if (!dataString) return '-'
    return new Date(dataString).toLocaleString('it-IT')
  }

  return (
    <div>
      {communications.map((comm) => (
        <CommunicationCard
          key={comm.id}
          communication={comm}
          onSend={handleSend}
          onEdit={handleEdit}
          onReset={handleReset}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          getTipoIcon={getTipoIcon}
          getStatoBadge={getStatoBadge}
          formatData={formatData}
        />
      ))}
    </div>
  )
}
```

## Note Tecniche

- **State Management**: Utilizza `useState` per gestire `estimatedRecipients` e `loadingEstimate`
- **Memoizzazione**: `fetchEstimatedRecipients` è memoizzato con `useCallback` per evitare chiamate duplicate
- **API Calls**:
  - `/api/communications/count-recipients` (POST) per calcolo destinatari stimati
  - `/api/communications/check-stuck` (POST) per verificare comunicazioni bloccate
- **Toast Notifications**: Utilizza `useToast` per notificare l'utente quando una comunicazione bloccata viene resettata
- **Confirmazioni**: Utilizza `confirm()` nativo per azioni distruttive (reset, delete)
- **Styling**: Card con gradiente, shadow e effetti hover per migliorare UX
- **Accessibilità**: Bottoni con title attributes per tooltip

## Limitazioni Note

- Il calcolo destinatari stimati viene fatto solo una volta (non si aggiorna automaticamente)
- La verifica comunicazioni bloccate avviene solo al click su "Riprova invio" per stato sending
- Le conferme utilizzano `confirm()` nativo (potrebbe essere sostituito con modal personalizzato)

## Stato Componente

✅ **Completo** - Componente funzionante e utilizzato in produzione
