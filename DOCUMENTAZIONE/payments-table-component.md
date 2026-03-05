# Componente: PaymentsTable

## 📋 Descrizione

Componente tabella per visualizzare pagamenti. Mostra lista pagamenti con data, atleta, metodo, importo, lezioni, stato e azioni (visualizza, storna). Include empty state e formattazione valuta/date.

## 📁 Percorso File

`src/components/dashboard/pagamenti/payments-table.tsx`

## 🔧 Props

```typescript
interface PaymentsTableProps {
  payments: Payment[]
  onPaymentClick: (payment: Payment) => void
  onReversePayment: (payment: Payment) => void
}
```

### Dettaglio Props

- **`payments`** (Payment[], required): Array pagamenti da visualizzare
- **`onPaymentClick`** (function, required): Callback click pagamento (apre dettaglio)
- **`onReversePayment`** (function, required): Callback storna pagamento

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Badge`, `Button` da `@/components/ui`

### Icons

- `Calendar`, `User`, `Eye`, `RotateCcw` da `lucide-react`

### Types

- `Payment` da `@/types/payment`

## ⚙️ Funzionalità

### Core

1. **Tabella Pagamenti**: Visualizza pagamenti in formato tabella
2. **Formattazione Valuta**: Formatta importi in EUR (formato italiano)
3. **Formattazione Date**: Formatta date con ora (formato italiano)
4. **Azioni**: Bottoni per visualizzare e stornare pagamenti
5. **Empty State**: Messaggio quando nessun pagamento

### Colonne Tabella

- **Data**: Data e ora creazione con icona Calendar
- **Atleta**: Nome atleta con icona User
- **Metodo**: Metodo pagamento (testo)
- **Importo**: Importo formattato (rosso se negativo)
- **Lezioni**: Numero lezioni acquistate
- **Stato**: Badge (Attivo/Storno)
- **Azioni**: Bottoni visualizza e storna

### Funzionalità Avanzate

- **Click Riga**: Click su riga apre dettaglio
- **Stop Propagation**: Bottoni azioni fermano propagazione click
- **Storno Condizionale**: Bottone storna solo se `!is_reversal`
- **Colore Importo**: Rosso se importo negativo
- **Badge Stato**: Warning per storno, success per attivo

### UI/UX

- Card con gradiente background
- Tabella responsive con scroll orizzontale
- Hover effects su righe
- Icone per ogni colonna
- Empty state con emoji e messaggio

## 🎨 Struttura UI

```
Card (variant trainer)
  └── CardHeader
      └── CardTitle "Pagamenti (X)"
  └── CardContent
      └── table
          ├── thead
          │   └── tr
          │       └── th (per ogni colonna)
          └── tbody
              └── tr (per ogni pagamento, clickable)
                  ├── td Data (con icona)
                  ├── td Atleta (con icona)
                  ├── td Metodo
                  ├── td Importo (colorato se negativo)
                  ├── td Lezioni
                  ├── td Stato (badge)
                  └── td Azioni
                      ├── Button Visualizza
                      └── Button Storna (se !is_reversal)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { PaymentsTable } from '@/components/dashboard/pagamenti/payments-table'

function PaymentsPage() {
  const payments = [
    // ... array pagamenti
  ]

  return (
    <PaymentsTable
      payments={payments}
      onPaymentClick={(payment) => setSelectedPayment(payment)}
      onReversePayment={(payment) => handleReverse(payment)}
    />
  )
}
```

## 🔍 Note Tecniche

### Formattazione Valuta

```typescript
new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
}).format(amount)
```

### Formattazione Date

```typescript
new Date(dateString).toLocaleDateString('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
```

### Click Handling

- Click su riga: chiama `onPaymentClick`
- Click su bottone: `e.stopPropagation()` per evitare doppio click

### Limitazioni

- Tabella HTML nativa (non componente Table UI)
- Empty state generico (non personalizzabile)
- Solo 2 azioni (visualizza e storna)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
