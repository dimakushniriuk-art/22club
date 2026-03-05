# NewCommunicationModal Component

## Descrizione

Modal completo per creare o modificare una comunicazione. Include form per tipo, titolo, messaggio, filtri destinatari, schedulazione e componente interno `AthleteSelector` per selezione atleti specifici. Gestisce validazione SMS (limite 160 caratteri) e due modalità di salvataggio (bozza o invio immediato).

## Percorso File

`src/components/communications/new-communication-modal.tsx`

## Props

### Interface

```typescript
interface NewCommunicationModalProps {
  isOpen: boolean
  onClose: () => void
  isEditing?: boolean
  formType: 'push' | 'email' | 'sms' | 'all'
  formTitle: string
  formMessage: string
  formRecipientFilter: 'all' | 'atleti' | 'custom'
  formSelectedAthletes: string[]
  formScheduled: boolean
  formScheduledDate: string
  formLoading: boolean
  recipientCount: number | null
  onFormTypeChange: (type: 'push' | 'email' | 'sms' | 'all') => void
  onFormTitleChange: (title: string) => void
  onFormMessageChange: (message: string) => void
  onFormRecipientFilterChange: (filter: 'all' | 'atleti' | 'custom') => void
  onFormSelectedAthletesChange: (athletes: string[]) => void
  onFormScheduledChange: (scheduled: boolean) => void
  onFormScheduledDateChange: (date: string) => void
  onCreateDraft: () => void
  onCreateAndSend: () => void
}
```

### Props Dettagliate

- `isOpen`: `boolean` - **Obbligatorio** - Controlla la visibilità del modal
- `onClose`: `() => void` - **Obbligatorio** - Callback per chiudere il modal
- `isEditing`: `boolean` - **Opzionale** (default: false) - Indica se si sta modificando una comunicazione esistente
- `formType`: `'push' | 'email' | 'sms' | 'all'` - **Obbligatorio** - Tipo di comunicazione selezionato
- `formTitle`: `string` - **Obbligatorio** - Titolo della comunicazione
- `formMessage`: `string` - **Obbligatorio** - Messaggio della comunicazione
- `formRecipientFilter`: `'all' | 'atleti' | 'custom'` - **Obbligatorio** - Filtro destinatari selezionato
- `formSelectedAthletes`: `string[]` - **Obbligatorio** - Array di ID atleti selezionati (usato quando filter è 'custom')
- `formScheduled`: `boolean` - **Obbligatorio** - Indica se la comunicazione è programmata
- `formScheduledDate`: `string` - **Obbligatorio** - Data/ora programmata (formato datetime-local)
- `formLoading`: `boolean` - **Obbligatorio** - Indica se è in corso un'operazione (salvataggio/invio)
- `recipientCount`: `number | null` - **Obbligatorio** - Numero di destinatari per i filtri 'all' e 'atleti'
- `onFormTypeChange`: `(type: 'push' | 'email' | 'sms' | 'all') => void` - **Obbligatorio** - Handler per cambio tipo
- `onFormTitleChange`: `(title: string) => void` - **Obbligatorio** - Handler per cambio titolo
- `onFormMessageChange`: `(message: string) => void` - **Obbligatorio** - Handler per cambio messaggio
- `onFormRecipientFilterChange`: `(filter: 'all' | 'atleti' | 'custom') => void` - **Obbligatorio** - Handler per cambio filtro destinatari
- `onFormSelectedAthletesChange`: `(athletes: string[]) => void` - **Obbligatorio** - Handler per cambio atleti selezionati
- `onFormScheduledChange`: `(scheduled: boolean) => void` - **Obbligatorio** - Handler per cambio schedulazione
- `onFormScheduledDateChange`: `(date: string) => void` - **Obbligatorio** - Handler per cambio data programmata
- `onCreateDraft`: `() => void` - **Obbligatorio** - Callback per salvare come bozza
- `onCreateAndSend`: `() => void` - **Obbligatorio** - Callback per creare e inviare immediatamente

## Componente Interno: AthleteSelector

### Interface

```typescript
interface AthleteSelectorProps {
  selectedAthletes: string[]
  onSelectionChange: (athletes: string[]) => void
}
```

### Funzionalità

- **Fetch Atleti**: Carica lista atleti da `/api/communications/list-athletes` al mount
- **Ricerca**: Filtra atleti per nome o email in tempo reale
- **Selezione Multipla**: Checkbox per selezionare/deselezionare atleti
- **Conteggio**: Mostra numero atleti selezionati e bottone "Deseleziona tutto"
- **Loading State**: Spinner durante caricamento atleti
- **Empty State**: Messaggio quando non ci sono atleti disponibili o trovati

### Dipendenze AthleteSelector

- `react` - `useState`, `useEffect`
- `@/components/ui` - `Input`, `Checkbox`, `Button`
- `lucide-react` - `Loader2`, `Search`

## Dipendenze

### Componenti UI

- `@/components/ui` - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Button`, `Input`, `Textarea`, `Checkbox`

### Hooks

- `react` - `useState`, `useEffect` (per AthleteSelector)

### Librerie Esterne

- `lucide-react` - `Bell`, `Mail`, `MessageSquare`, `Send`, `Users`, `Loader2`, `Search`, `UserCheck`

## Funzionalità

### Funzionalità Principali

1. **Selezione Tipo**: 4 opzioni (Push, Email, SMS, Tutti) con icone e selezione visiva
2. **Filtri Destinatari**: 3 opzioni (Tutti gli utenti, Solo atleti, Atleti specifici) con conteggio
3. **Form Input**: Titolo e messaggio con validazione
4. **Schedulazione**: Checkbox per programmare invio con input datetime-local
5. **Azioni**: Salva bozza o Invia ora

### Validazione

- **Titolo**: Obbligatorio (non può essere vuoto)
- **Messaggio**: Obbligatorio (non può essere vuoto)
- **SMS**: Limite 160 caratteri con:
  - Messaggio di errore dinamico se superato
  - Helper text con contatore caratteri
  - Disabilitazione bottoni se superato il limite

### Stati e Comportamenti

- **Loading State**: Bottoni disabilitati e spinner durante `formLoading`
- **Validazione Bottoni**: Disabilitati se:
  - `formLoading === true`
  - `!formTitle.trim()`
  - `!formMessage.trim()`
  - `formType === 'sms' && formMessage.length > 160`
- **Titolo Dinamico**: "Nuova Comunicazione" o "Modifica Comunicazione" in base a `isEditing`
- **Conteggio Destinatari**: Mostrato dinamicamente per filtri 'all' e 'atleti'

### UI/UX Features

- **Grid Selezione Tipo**: 4 bottoni in grid con stato attivo evidenziato
- **Bottoni Destinatari**: Layout flex con conteggio dinamico
- **AthleteSelector Condizionale**: Mostrato solo quando `formRecipientFilter === 'custom'`
- **Input Schedulazione**: Mostrato solo quando `formScheduled === true`
- **Footer Azioni**: 3 bottoni (Annulla, Salva bozza, Invia ora)

## Esempi d'Uso

```tsx
import { NewCommunicationModal } from '@/components/communications'
import { useState } from 'react'

function CommunicationsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formType, setFormType] = useState<'push' | 'email' | 'sms' | 'all'>('push')
  const [formTitle, setFormTitle] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formRecipientFilter, setFormRecipientFilter] = useState<'all' | 'atleti' | 'custom'>('all')
  const [formSelectedAthletes, setFormSelectedAthletes] = useState<string[]>([])
  const [formScheduled, setFormScheduled] = useState(false)
  const [formScheduledDate, setFormScheduledDate] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)

  const handleCreateDraft = async () => {
    setFormLoading(true)
    try {
      // Logica salvataggio bozza
      await saveDraft({ type: formType, title: formTitle, message: formMessage, ... })
      setModalOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleCreateAndSend = async () => {
    setFormLoading(true)
    try {
      // Logica creazione e invio
      await createAndSend({ type: formType, title: formTitle, message: formMessage, ... })
      setModalOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <NewCommunicationModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      formType={formType}
      formTitle={formTitle}
      formMessage={formMessage}
      formRecipientFilter={formRecipientFilter}
      formSelectedAthletes={formSelectedAthletes}
      formScheduled={formScheduled}
      formScheduledDate={formScheduledDate}
      formLoading={formLoading}
      recipientCount={recipientCount}
      onFormTypeChange={setFormType}
      onFormTitleChange={setFormTitle}
      onFormMessageChange={setFormMessage}
      onFormRecipientFilterChange={setFormRecipientFilter}
      onFormSelectedAthletesChange={setFormSelectedAthletes}
      onFormScheduledChange={setFormScheduled}
      onFormScheduledDateChange={setFormScheduledDate}
      onCreateDraft={handleCreateDraft}
      onCreateAndSend={handleCreateAndSend}
    />
  )
}
```

## Note Tecniche

- **Componente Controllato**: Tutti i valori del form sono controllati dal parent (controlled components)
- **State Management**: Il componente non gestisce stato interno (tranne AthleteSelector)
- **Validazione Client-Side**: Validazione SMS con feedback immediato
- **API Integration**: AthleteSelector chiama `/api/communications/list-athletes` per fetch atleti
- **Responsive**: Modal con max-width 2xl, layout adattivo
- **Accessibilità**: Label associati, input con placeholder, bottoni con stati disabled appropriati
- **Performance**: AthleteSelector carica atleti solo quando necessario (quando filter è 'custom')

## Limitazioni Note

- Il componente è completamente controllato dal parent (no stato interno per form)
- La validazione è solo client-side (validazione server-side gestita dal parent)
- AthleteSelector carica tutti gli atleti disponibili (potrebbe essere ottimizzato con paginazione per liste grandi)
- Il formato datetime-local potrebbe avere problemi di timezone (gestito dal parent)

## Stato Componente

✅ **Completo** - Componente funzionante e utilizzato in produzione
