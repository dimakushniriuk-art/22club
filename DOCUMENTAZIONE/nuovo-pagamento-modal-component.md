# Componente: NuovoPagamentoModal

## 📋 Descrizione

Modal per registrare nuovi pagamenti con upload fattura PDF. Gestisce inserimento pagamento, aggiornamento contatori lezioni, upload file fattura su Supabase Storage e validazione file.

## 📁 Percorso File

`src/components/dashboard/nuovo-pagamento-modal.tsx`

## 🔧 Props

```typescript
interface NuovoPagamentoModalProps {
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

- `useState`, `useEffect`, `useCallback` da `react`

### Supabase

- `createClient` da `@/lib/supabase/client`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` da `@/components/ui`
- `Button`, `Input` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`
- `useToast` da `@/components/ui/toast`

### Types

- `Tables` da `@/types/supabase`
- `Cliente` da `@/types/cliente`

### Icons

- `Euro`, `Calendar`, `User`, `FileText`, `Loader2`, `X`, `Upload` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Registrazione Pagamento**: Inserisce record in tabella `payments`
2. **Upload Fattura**: Upload PDF su Supabase Storage
3. **Aggiornamento Contatori**: Aggiorna o crea `lesson_counters`
4. **Caricamento Atleti**: Carica lista atleti quando modal si apre

### Campi Form

- **Atleta**: Select obbligatorio (caricato da Supabase)
- **Data Pagamento**: Date picker (default: oggi)
- **Lezioni Acquistate**: Input numerico obbligatorio (>= 1)
- **Importo**: Input numerico obbligatorio (> 0)
- **Fattura PDF**: File input opzionale (max 10MB)

### Funzionalità Avanzate

- **Upload PDF**: Upload su bucket Supabase Storage
- **Preview PDF**: Preview fattura prima di upload
- **Validazione File**: Formato PDF, dimensione max 10MB
- **Gestione Contatori**: Incrementa o crea `lesson_counters`
- **Caricamento Atleti**: Carica atleti da `profiles` con role 'atleta'/'athlete'

### Validazioni

- Atleta obbligatorio
- Data pagamento obbligatoria
- Lezioni acquistate >= 1
- Importo > 0
- File PDF (se fornito): formato valido, max 10MB

### UI/UX

- Modal responsive
- Form organizzato
- Preview PDF
- Loading states (submit e upload)
- Error messages inline
- Toast notifications

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   ├── DialogTitle (con icona Euro)
      │   └── DialogDescription
      ├── form
      │   ├── Error message (se presente)
      │   ├── Select Atleta
      │   ├── Date picker Data Pagamento
      │   ├── Input Lezioni Acquistate
      │   ├── Input Importo
      │   ├── File input Fattura PDF
      │   ├── Preview PDF (se presente)
      │   └── DialogFooter
      │       ├── Button Cancel
      │       └── Button Submit
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { NuovoPagamentoModal } from '@/components/dashboard/nuovo-pagamento-modal'

function PaymentsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <NuovoPagamentoModal
      open={showModal}
      onOpenChange={setShowModal}
      onSuccess={() => router.refresh()}
    />
  )
}
```

## 🔍 Note Tecniche

### Caricamento Atleti

```typescript
const loadAthletes = useCallback(async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, cognome, email, role')
    .in('role', ['atleta', 'athlete'])
    .order('nome', { ascending: true })
  // Formatta come Cliente[]
}, [supabase])
```

### Upload PDF

```typescript
if (formData.invoice_file) {
  const fileName = `invoices/${formData.athlete_id}/${Date.now()}-${formData.invoice_file.name}`
  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(fileName, formData.invoice_file)
  // Salva URL nel payment record
}
```

### Validazione File

- Formato: `application/pdf`
- Dimensione: max 10MB (10 _ 1024 _ 1024 bytes)
- Preview: FileReader per preview base64

### Limitazioni

- Solo formato PDF (non altri formati)
- Upload sincrono (potrebbe essere lento per file grandi)
- Preview base64 (potrebbe essere pesante per file grandi)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
