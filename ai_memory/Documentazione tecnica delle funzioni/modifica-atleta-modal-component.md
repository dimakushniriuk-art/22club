# Componente: ModificaAtletaModal

## 📋 Descrizione

Modal per modificare atleti esistenti. Popola form con dati atleta, gestisce aggiornamento via API `/api/athletes/[id]` e validazione form. Non modifica password (solo dati profilo).

## 📁 Percorso File

`src/components/dashboard/modifica-atleta-modal.tsx`

## 🔧 Props

```typescript
interface ModificaAtletaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  athlete: Cliente | null
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`onSuccess`** (function, optional): Callback dopo successo
- **`athlete`** (Cliente | null, required): Atleta da modificare (null chiude modal)

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` da `@/components/ui`
- `Button`, `Input` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`
- `useToast` da `@/components/ui/toast`

### Types

- `Cliente` da `@/types/cliente`

### Icons

- `Edit2`, `Loader2` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Modifica Atleta**: Chiama API `PUT /api/athletes/[id]` per aggiornare
2. **Popolamento Form**: Popola form con dati atleta quando `athlete` o `open` cambiano
3. **Validazione Form**: Validazione client-side completa
4. **Gestione Errori**: Errori per campo e errore submit generale

### Campi Form

- **Nome**: Input obbligatorio
- **Cognome**: Input obbligatorio
- **Email**: Input obbligatorio (validazione formato)
- **Telefono**: Input opzionale (validazione formato)
- **Stato**: Select (attivo, inattivo, sospeso)
- **Data Iscrizione**: Date picker
- **Note**: Textarea opzionale

### Funzionalità Avanzate

- **Sincronizzazione Props**: `useEffect` popola form quando `athlete` o `open` cambiano
- **Validazione Email**: Regex formato email
- **Validazione Telefono**: Regex formato telefono (se fornito)
- **Errori per Campo**: Mostra errori specifici per ogni campo
- **Reset Errori**: Rimuove errori quando campo viene modificato
- **Toast Notifications**: Success/error toast

### Validazioni

- Nome obbligatorio
- Cognome obbligatorio
- Email obbligatoria e formato valido
- Telefono formato valido (se fornito)
- Atleta valido (id presente)

### UI/UX

- Modal responsive
- Form organizzato
- Error messages inline per campo
- Loading state durante submit
- Toast notifications

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   ├── DialogTitle (con icona Edit2)
      │   └── DialogDescription
      ├── form
      │   ├── Error submit (se presente)
      │   ├── Input Nome (con errore)
      │   ├── Input Cognome (con errore)
      │   ├── Input Email (con errore)
      │   ├── Input Telefono (con errore)
      │   ├── Select Stato
      │   ├── Date picker Data Iscrizione
      │   ├── Textarea Note
      │   └── DialogFooter
      │       ├── Button Cancel
      │       └── Button Submit
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ModificaAtletaModal } from '@/components/dashboard/modifica-atleta-modal'

function ClientsPage() {
  const [selectedAthlete, setSelectedAthlete] = useState<Cliente | null>(null)

  return (
    <ModificaAtletaModal
      open={selectedAthlete !== null}
      onOpenChange={(open) => !open && setSelectedAthlete(null)}
      athlete={selectedAthlete}
      onSuccess={() => router.refresh()}
    />
  )
}
```

## 🔍 Note Tecniche

### Popolamento Form

```typescript
useEffect(() => {
  if (athlete && open) {
    setFormData({
      nome: athlete.nome || '',
      cognome: athlete.cognome || '',
      email: athlete.email || '',
      phone: athlete.phone || '',
      stato: (athlete.stato as 'attivo' | 'inattivo' | 'sospeso') || 'attivo',
      data_iscrizione: athlete.data_iscrizione
        ? new Date(athlete.data_iscrizione).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      note: athlete.note || '',
    })
  }
}, [athlete, open])
```

### API Call

```typescript
const response = await fetch(`/api/athletes/${athlete.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: formData.nome.trim(),
    cognome: formData.cognome.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim() || null,
    stato: formData.stato,
    data_iscrizione: formData.data_iscrizione || null,
    note: formData.note.trim() || null,
  }),
})
```

### Limitazioni

- Non modifica password (solo dati profilo)
- Nessuna validazione server-side lato client
- Data iscrizione convertita da ISO a date picker format

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
