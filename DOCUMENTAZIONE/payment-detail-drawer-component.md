# Componente: PaymentDetailDrawer

## 📋 Descrizione

Componente drawer per visualizzare dettagli completi di un pagamento. Mostra informazioni pagamento, riferimento storno (se presente) e azione storna. Drawer laterale destro.

## 📁 Percorso File

`src/components/dashboard/pagamenti/payment-detail-drawer.tsx`

## 🔧 Props

```typescript
interface PaymentDetailDrawerProps {
  payment: Payment | null
  open: boolean
  onClose: () => void
  onReverse: (payment: Payment) => void
}
```

### Dettaglio Props

- **`payment`** (Payment | null, required): Pagamento da visualizzare (null chiude drawer)
- **`open`** (boolean, required): Stato apertura drawer
- **`onClose`** (function, required): Callback chiusura drawer
- **`onReverse`** (function, required): Callback storna pagamento

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Drawer`, `DrawerContent` da `@/components/ui`
- `Badge`, `Button` da `@/components/ui`

### Icons

- `RotateCcw` da `lucide-react`

### Types

- `Payment` da `@/types/payment`

## ⚙️ Funzionalità

### Core

1. **Dettagli Pagamento**: Mostra tutte le informazioni pagamento
2. **Riferimento Storno**: Mostra ID pagamento originale se è storno
3. **Azione Storna**: Bottone per stornare pagamento (solo se non è già storno)
4. **Formattazione**: Formatta valuta e date

### Informazioni Visualizzate

- **Stato**: Badge Attivo/Storno
- **Atleta**: Nome atleta
- **Importo**: Importo formattato (rosso se negativo)
- **Metodo**: Metodo pagamento
- **Lezioni**: Numero lezioni acquistate
- **Data**: Data e ora creazione
- **Registrato da**: Nome staff che ha registrato
- **Riferimento Storno**: ID pagamento originale (se storno)

### Funzionalità Avanzate

- **Render Condizionale**: Restituisce null se `payment === null`
- **Storno Condizionale**: Bottone storna solo se `!is_reversal`
- **Formattazione Valuta**: Formato EUR italiano
- **Formattazione Date**: Formato italiano con ora

### UI/UX

- Drawer laterale destro
- Layout organizzato in sezioni
- Badge stato prominente
- Informazioni in formato chiave-valore
- Bottone storna con stile pericoloso

## 🎨 Struttura UI

```
Drawer (side="right")
  └── DrawerContent
      └── div (space-y-6)
          ├── Sezione Info Pagamento
          │   ├── Header (titolo + badge stato)
          │   └── div (space-y-3)
          │       ├── Atleta (key-value)
          │       ├── Importo (key-value, colorato)
          │       ├── Metodo (key-value)
          │       ├── Lezioni (key-value)
          │       ├── Data (key-value)
          │       └── Registrato da (key-value)
          ├── Riferimento Storno (se is_reversal)
          │   └── ID pagamento originale
          └── Azioni
              └── Button Storna (se !is_reversal)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { PaymentDetailDrawer } from '@/components/dashboard/pagamenti/payment-detail-drawer'

function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  return (
    <PaymentDetailDrawer
      payment={selectedPayment}
      open={selectedPayment !== null}
      onClose={() => setSelectedPayment(null)}
      onReverse={(payment) => handleReverse(payment)}
    />
  )
}
```

## 🔍 Note Tecniche

### Formattazione Valuta

Stesso formato di PaymentsTable (EUR, formato italiano).

### Formattazione Date

Stesso formato di PaymentsTable (data + ora, formato italiano).

### Limitazioni

- Solo visualizzazione (non modifica)
- Bottone storna sempre presente se non è storno (non configurabile)
- Drawer sempre a destra (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
