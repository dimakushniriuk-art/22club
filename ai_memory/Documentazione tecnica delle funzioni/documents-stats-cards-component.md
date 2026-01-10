# Componente: DocumentsStatsCards

## 📋 Descrizione

Componente per visualizzare 4 card statistiche documenti: validi, in scadenza, scaduti e totali. Calcola statistiche da array documenti e mostra con colori semantici e animazioni delay.

## 📁 Percorso File

`src/components/dashboard/documenti/documents-stats-cards.tsx`

## 🔧 Props

```typescript
interface DocumentsStatsCardsProps {
  documents: Document[]
}
```

### Dettaglio Props

- **`documents`** (Document[], required): Array documenti per calcolare statistiche

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Card`, `CardContent` da `@/components/ui`

### Types

- `Document` da `@/types/document`

## ⚙️ Funzionalità

### Core

1. **4 Card Statistiche**: Validi, in scadenza, scaduti, totali
2. **Calcolo Statistiche**: Filtra documenti per status e conta
3. **Colori Semantici**: Colori diversi per ogni tipo (verde, arancione, rosso, blu)
4. **Animazioni**: Delay progressivo per animazioni

### Card Visualizzate

1. **Validi**:
   - Valore: documenti con `status === 'valido'`
   - Colore: Verde (green-500)
   - Delay: 100ms

2. **In Scadenza**:
   - Valore: documenti con `status === 'in_scadenza'`
   - Colore: Arancione (orange-500)
   - Delay: 200ms

3. **Scaduti**:
   - Valore: documenti con `status === 'scaduto'`
   - Colore: Rosso (red-500)
   - Delay: 300ms

4. **Totali**:
   - Valore: `documents.length`
   - Colore: Blu (blue-500)
   - Delay: 400ms

### Funzionalità Avanzate

- **Calcolo Client-Side**: Filtra array e conta per ogni status
- **Gradient Backgrounds**: Gradienti colorati per ogni card
- **Hover Effects**: Border enhancement su hover
- **Animazioni Delay**: Delay progressivo (100ms, 200ms, 300ms, 400ms)

### UI/UX

- Grid responsive (1 colonna mobile, 4 desktop)
- Card con gradiente e border colorato
- Valori grandi e prominenti (text-2xl, bold)
- Label secondaria
- Colori semantici per ogni tipo

## 🎨 Struttura UI

```
div (grid 1/4 colonne, gap-4)
  └── Card (per ogni statistica, variant trainer)
      └── CardContent (p-4, text-center)
          ├── Valore (text-2xl, bold, colorato)
          └── Label (text-sm, text-secondary)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { DocumentsStatsCards } from '@/components/dashboard/documenti/documents-stats-cards'

function DocumentsPage() {
  const documents = [
    // ... array documenti
  ]

  return <DocumentsStatsCards documents={documents} />
}
```

## 🔍 Note Tecniche

### Calcolo Statistiche

```typescript
documents.filter((d) => d.status === 'valido').length
documents.filter((d) => d.status === 'in_scadenza').length
documents.filter((d) => d.status === 'scaduto').length
documents.length
```

### Colori

- **Validi**: green-500 (verde)
- **In Scadenza**: orange-500 (arancione)
- **Scaduti**: red-500 (rosso)
- **Totali**: blue-500 (blu)

### Limitazioni

- Calcolo client-side (potrebbe essere lento per molti documenti)
- Solo 4 statistiche (non estendibili facilmente)
- Status hardcoded (valido, in_scadenza, scaduto)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
