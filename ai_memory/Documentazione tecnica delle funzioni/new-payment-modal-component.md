# Componente: NewPaymentModal

## 📋 Descrizione

Modal per creare nuovo pagamento. Form completo con selezione atleta, importo, metodo pagamento, lezioni e note. Utilizza overlay custom (non Dialog standard) e simula salvataggio.

## 📁 Percorso File

`src/components/dashboard/pagamenti/new-payment-modal.tsx`

## 🔧 Props

```typescript
interface NewPaymentModalProps {
  onClose: () => void
  onSave: (payment: Payment) => void
}
```

### Dettaglio Props

- **`onClose`** (function, required): Callback chiusura modal
- **`onSave`** (function, required): Callback salvataggio pagamento

## 📦 Dipendenze

### React Hooks

- `useState` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button`, `Input` da `@/components/ui`
- `SimpleSelect` da `@/components/ui`

### Icons

- `Euro` da `lucide-react`

### Types

- `Payment` da `@/types/payment`

## ⚙️ Funzionalità

### Core

1. **Form Pagamento**: Form completo per creare pagamento
2. **Validazione**: Validazione campi obbligatori
3. **Simulazione Salvataggio**: Simula salvataggio con delay 1s
4. **Mock Data**: Crea Payment object con dati mock

### Campi Form

- **Atleta**: Select obbligatorio (mock options)
- **Importo**: Input numerico obbligatorio (step 0.01)
- **Metodo Pagamento**: Select obbligatorio (Contanti, Bonifico, Carta, PayPal)
- **Numero Lezioni**: Input numerico obbligatorio
- **Note**: Input opzionale

### Funzionalità Avanzate

- **Overlay Custom**: Overlay con backdrop blur (non Dialog standard)
- **Loading State**: Loading durante salvataggio
- **Mock Options**: Opzioni atleti hardcoded (mock)
- **Payment Creation**: Crea Payment object con ID generato e dati mock

### Validazioni

- Atleta obbligatorio
- Importo obbligatorio
- Metodo obbligatorio
- Lezioni obbligatorio

### UI/UX

- Modal centrato con overlay blur
- Card con max-width
- Form organizzato
- Loading state durante submit
- Bottoni annulla/salva

## 🎨 Struttura UI

```
div (fixed inset-0, overlay blur)
  └── Card (max-w-md, centrato)
      ├── CardHeader
      │   └── CardTitle "Nuovo Pagamento"
      └── CardContent
          └── form (space-y-4)
              ├── SimpleSelect Atleta
              ├── Input Importo (con icona Euro)
              ├── SimpleSelect Metodo
              ├── Input Lezioni
              ├── Input Note
              └── div (bottoni, flex gap-2)
                  ├── Button Annulla
                  └── Button Salva
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { NewPaymentModal } from '@/components/dashboard/pagamenti/new-payment-modal'

function PaymentsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <NewPaymentModal
      onClose={() => setShowModal(false)}
      onSave={(payment) => {
        // Salva pagamento
        console.log('Saving payment', payment)
        setShowModal(false)
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Mock Data

```typescript
const newPayment: Payment = {
  id: `payment-${Date.now()}`,
  athlete_id: athleteId,
  athlete_name: 'Mario Rossi', // Mock
  amount: parseFloat(amount),
  method_text: method,
  lessons_purchased: parseInt(lessons),
  created_by_staff_id: 'staff-1', // Mock
  created_by_staff_name: 'Sofia Bianchi', // Mock
  created_at: new Date().toISOString(),
  is_reversal: false,
  ref_payment_id: null,
}
```

### Simulazione Salvataggio

```typescript
await new Promise((resolve) => setTimeout(resolve, 1000))
```

### Limitazioni

- Mock data hardcoded (atleti, staff)
- Simulazione salvataggio (non chiama API reale)
- Opzioni atleti mock (non carica da database)
- Overlay custom (non usa Dialog standard)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
