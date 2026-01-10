# Componente: PaymentsExportMenu

## 📋 Descrizione

Componente dropdown menu per esportare pagamenti. Supporta esportazione CSV e PDF utilizzando utility `exportPaymentsToCSV` e `exportPaymentsToPDF`. Disabilitato se nessun pagamento.

## 📁 Percorso File

`src/components/dashboard/pagamenti/payments-export-menu.tsx`

## 🔧 Props

```typescript
interface PaymentsExportMenuProps {
  payments: Payment[]
  disabled?: boolean
}
```

### Dettaglio Props

- **`payments`** (Payment[], required): Array pagamenti da esportare
- **`disabled`** (boolean, optional): Disabilita bottone (default: false)

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `Button` da `@/components/ui`

### Icons

- `Download`, `FileSpreadsheet`, `FileText` da `lucide-react`

### Utils

- `exportPaymentsToCSV`, `exportPaymentsToPDF` da `@/lib/export-payments`

### Types

- `Payment` da `@/types/payment`

## ⚙️ Funzionalità

### Core

1. **Export CSV**: Chiama `exportPaymentsToCSV(payments)`
2. **Export PDF**: Chiama `exportPaymentsToPDF(payments)`
3. **Disabled State**: Disabilitato se `disabled === true` o `payments.length === 0`

### Funzionalità Avanzate

- **Icona Download**: Icona visibile nel bottone
- **Menu Items con Icone**: Icone FileSpreadsheet (CSV) e FileText (PDF)
- **Auto-Disable**: Disabilitato automaticamente se nessun pagamento
- **Accessibilità**: ARIA label per bottone

### UI/UX

- Bottone outline con icona
- Menu dropdown allineato a destra
- Menu items con icona e testo
- Stato disabilitato visibile

## 🎨 Struttura UI

```
DropdownMenu
  └── DropdownMenuTrigger
      └── Button (variant outline, size sm)
          ├── Download icon
          └── "Export"
  └── DropdownMenuContent (align end)
      ├── DropdownMenuItem (CSV)
      │   ├── FileSpreadsheet icon
      │   └── "Esporta come CSV"
      └── DropdownMenuItem (PDF)
          ├── FileText icon
          └── "Esporta come PDF"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { PaymentsExportMenu } from '@/components/dashboard/pagamenti/payments-export-menu'

function PaymentsPage() {
  const payments = [
    // ... array pagamenti
  ]

  return <PaymentsExportMenu payments={payments} />
}
```

## 🔍 Note Tecniche

### Export Functions

- **CSV**: `exportPaymentsToCSV(payments)` - genera file CSV
- **PDF**: `exportPaymentsToPDF(payments)` - genera file PDF

### Disabled Logic

```typescript
disabled={disabled || payments.length === 0}
```

### Limitazioni

- Solo 2 formati (CSV e PDF)
- Utility export devono essere implementate
- Menu items non configurabili (hardcoded)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
