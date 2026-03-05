# Componente: PaymentsKPICards

## 📋 Descrizione

Componente per visualizzare 3 card KPI pagamenti: entrate mensili, lezioni vendute e pagamenti totali. Include formattazione valuta, badge colorati e animazioni con delay.

## 📁 Percorso File

`src/components/dashboard/pagamenti/payments-kpi-cards.tsx`

## 🔧 Props

```typescript
interface PaymentsKPICardsProps {
  totalRevenue: number
  totalLessons: number
  totalPayments: number
  totalReversals: number
}
```

### Dettaglio Props

- **`totalRevenue`** (number, required): Entrate totali mensili
- **`totalLessons`** (number, required): Lezioni vendute totali
- **`totalPayments`** (number, required): Numero pagamenti attivi
- **`totalReversals`** (number, required): Numero storni

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Badge` da `@/components/ui`

### Icons

- `TrendingUp`, `CreditCard`, `Euro` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **3 Card KPI**: Entrate mensili, lezioni vendute, pagamenti totali
2. **Formattazione Valuta**: Formatta entrate in EUR
3. **Badge Colorati**: Badge con colori semantici basati su valore
4. **Animazioni**: Delay progressivo per animazioni

### Card Visualizzate

1. **Entrate Mensili**:
   - Valore: `formatCurrency(totalRevenue)`
   - Icona: TrendingUp (verde)
   - Badge: Colore basato su valore (success/warning/error)
   - Info: Numero pagamenti

2. **Lezioni Vendute**:
   - Valore: `totalLessons`
   - Icona: CreditCard (blu)
   - Info: "Questo mese"

3. **Pagamenti Totali**:
   - Valore: `totalPayments + totalReversals`
   - Icona: Euro (viola)
   - Info: "Di cui X storni"

### Funzionalità Avanzate

- **Colori Dinamici Entrate**:
  - > = 1000: success (verde)
  - > = 500: warning (giallo)
  - < 500: error (rosso)
- **Animazioni Delay**: 100ms, 200ms, 300ms
- **Gradient Backgrounds**: Gradienti colorati per ogni card
- **Hover Effects**: Border enhancement su hover

### UI/UX

- Grid responsive (1 colonna mobile, 3 desktop)
- Card con gradiente e border colorato
- Icone grandi con background colorato
- Valori grandi e prominenti
- Badge informativi

## 🎨 Struttura UI

```
div (grid 1/3 colonne, gap-4)
  └── Card (per ogni KPI, variant trainer)
      └── CardContent (p-6)
          ├── div (flex justify-between)
          │   ├── div
          │   │   ├── Label (text-sm)
          │   │   └── Valore (text-2xl, bold)
          │   └── Icona (background colorato, rounded-full)
          └── Badge/Info (mt-2)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { PaymentsKPICards } from '@/components/dashboard/pagamenti/payments-kpi-cards'

function PaymentsPage() {
  return (
    <PaymentsKPICards
      totalRevenue={5000}
      totalLessons={120}
      totalPayments={45}
      totalReversals={2}
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

### Colori Entrate

```typescript
const getRevenueColor = (amount: number) => {
  if (amount >= 1000) return 'success'
  if (amount >= 500) return 'warning'
  return 'error'
}
```

### Limitazioni

- Soglie colori hardcoded (1000, 500)
- Solo 3 metriche (non estendibili facilmente)
- Animazioni delay fissi (non configurabili)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
