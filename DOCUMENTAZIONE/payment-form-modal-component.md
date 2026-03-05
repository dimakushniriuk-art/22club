# Componente: PaymentFormModal

## 📋 Descrizione

Modal per registrare nuovi pagamenti. Gestisce inserimento pagamento, aggiornamento contatori lezioni (lesson_counters) e supporta diversi metodi di pagamento. Integrato con Supabase.

## 📁 Percorso File

`src/components/dashboard/payment-form-modal.tsx`

## 🔧 Props

```typescript
interface PaymentFormModalProps {
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

### Supabase

- `createClient` da `@/lib/supabase`

### Hooks

- `useClienti` da `@/hooks/use-clienti`
- `useToast` da `@/components/ui/toast`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` da `@/components/ui/dialog`
- `Button`, `Input`, `Label` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`

### Icons

- `CreditCard`, `Euro`, `Calendar`, `BookOpen`, `X`, `Loader2` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Registrazione Pagamento**: Inserisce record in tabella `payments`
2. **Aggiornamento Contatori**: Aggiorna o crea `lesson_counters` per atleta
3. **Metodi Pagamento**: Supporta contanti, bonifico, carta, paypal
4. **Validazione**: Validazione campi obbligatori e valori positivi

### Campi Form

- **Atleta**: Select obbligatorio (da useClienti)
- **Importo**: Input numerico obbligatorio (> 0)
- **Metodo Pagamento**: Select (contanti, bonifico, carta, paypal)
- **Lezioni Acquistate**: Input numerico obbligatorio (> 0)
- **Note**: Textarea opzionale

### Funzionalità Avanzate

- **Gestione Contatori**:
  - Se contatore esiste: incrementa `lessons_remaining`
  - Se non esiste: crea nuovo contatore
- **Data Automatica**: `payment_date` impostata automaticamente a oggi
- **Toast Notifications**: Success/error toast
- **Reset Form**: Reset automatico dopo successo

### Validazioni

- Atleta obbligatorio
- Importo > 0
- Lezioni acquistate > 0
- Utente autenticato

### UI/UX

- Modal responsive
- Form organizzato
- Loading state durante submit
- Error messages inline
- Toast notifications

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   └── DialogTitle
      ├── form
      │   ├── Error message (se presente)
      │   ├── Select Atleta
      │   ├── Input Importo
      │   ├── Select Metodo Pagamento
      │   ├── Input Lezioni Acquistate
      │   ├── Textarea Note
      │   └── DialogFooter
      │       ├── Button Cancel
      │       └── Button Submit
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { PaymentFormModal } from '@/components/dashboard/payment-form-modal'

function PaymentsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <PaymentFormModal
      open={showModal}
      onOpenChange={setShowModal}
      onSuccess={() => router.refresh()}
    />
  )
}
```

## 🔍 Note Tecniche

### Gestione Contatori

```typescript
// Se contatore esiste: update
if (existingCounter) {
  await supabase
    .from('lesson_counters')
    .update({
      lessons_remaining: (existingCounter.lessons_remaining || 0) + formData.lessons_purchased,
    })
    .eq('athlete_id', formData.athlete_id)
}
// Se non esiste: insert
else {
  await supabase.from('lesson_counters').insert([
    {
      athlete_id: formData.athlete_id,
      lessons_remaining: formData.lessons_purchased,
    },
  ])
}
```

### Limitazioni

- Data pagamento sempre oggi (non configurabile)
- Contatori gestiti solo per atleta (non per tipo lezione)
- Nessuna validazione duplicati pagamenti

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
