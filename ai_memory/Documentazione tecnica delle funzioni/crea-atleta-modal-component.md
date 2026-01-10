# Componente: CreaAtletaModal

## 📋 Descrizione

Modal per creare nuovi atleti. Gestisce creazione account (email/password), profilo atleta, validazione form completa e chiamata API `/api/athletes/create`.

## 📁 Percorso File

`src/components/dashboard/crea-atleta-modal.tsx`

## 🔧 Props

```typescript
interface CreaAtletaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`onSuccess`** (function, optional): Callback dopo successo

## 📦 Dipendenze

### React Hooks

- `useState` da `react`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` da `@/components/ui`
- `Button`, `Input` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`

### Icons

- `UserPlus`, `Loader2` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Creazione Atleta**: Chiama API `/api/athletes/create` per creare atleta
2. **Validazione Form**: Validazione client-side completa
3. **Gestione Errori**: Errori per campo e errore submit generale
4. **Reset Form**: Reset automatico dopo successo

### Campi Form

- **Nome**: Input obbligatorio
- **Cognome**: Input obbligatorio
- **Email**: Input obbligatorio (validazione formato)
- **Telefono**: Input opzionale (validazione formato)
- **Password**: Input obbligatorio (min 6 caratteri)
- **Conferma Password**: Input obbligatorio (deve corrispondere)
- **Stato**: Select (attivo, inattivo, sospeso)
- **Data Iscrizione**: Date picker (default: oggi)
- **Note**: Textarea opzionale

### Funzionalità Avanzate

- **Validazione Email**: Regex formato email
- **Validazione Password**: Minimo 6 caratteri, corrispondenza
- **Validazione Telefono**: Regex formato telefono (se fornito)
- **Errori per Campo**: Mostra errori specifici per ogni campo
- **Reset Errori**: Rimuove errori quando campo viene modificato

### Validazioni

- Nome obbligatorio
- Cognome obbligatorio
- Email obbligatoria e formato valido
- Password obbligatoria e min 6 caratteri
- Conferma password deve corrispondere
- Telefono formato valido (se fornito)

### UI/UX

- Modal responsive
- Form organizzato in sezioni
- Error messages inline per campo
- Loading state durante submit
- Reset form dopo successo

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   ├── DialogTitle (con icona UserPlus)
      │   └── DialogDescription
      ├── form
      │   ├── Error submit (se presente)
      │   ├── Input Nome (con errore)
      │   ├── Input Cognome (con errore)
      │   ├── Input Email (con errore)
      │   ├── Input Telefono (con errore)
      │   ├── Input Password (con errore)
      │   ├── Input Conferma Password (con errore)
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
import { CreaAtletaModal } from '@/components/dashboard/crea-atleta-modal'

function ClientsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <CreaAtletaModal
      open={showModal}
      onOpenChange={setShowModal}
      onSuccess={() => router.refresh()}
    />
  )
}
```

## 🔍 Note Tecniche

### API Call

```typescript
const response = await fetch('/api/athletes/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: formData.nome.trim(),
    cognome: formData.cognome.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim() || null,
    password: formData.password,
    stato: formData.stato,
    data_iscrizione: formData.data_iscrizione || null,
    note: formData.note.trim() || null,
  }),
})
```

### Validazione Regex

- **Email**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Telefono**: `/^[\d\s\+\-\(\)]+$/`

### Limitazioni

- Password non mostrata (sempre type="password")
- Nessuna validazione server-side lato client
- Data iscrizione default oggi (non configurabile facilmente)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
