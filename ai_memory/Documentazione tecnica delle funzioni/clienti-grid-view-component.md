# Componente: ClientiGridView

## 📋 Descrizione

Componente per visualizzare clienti in vista griglia. Mostra lista clienti come card in grid responsive utilizzando ClienteCard component.

## 📁 Percorso File

`src/components/dashboard/clienti/clienti-grid-view.tsx`

## 🔧 Props

```typescript
interface ClientiGridViewProps {
  clienti: Cliente[]
  total: number
}
```

### Dettaglio Props

- **`clienti`** (Cliente[], required): Array clienti da visualizzare
- **`total`** (number, required): Numero totale clienti (per header)

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `ClienteCard` da `@/components/dashboard/cliente-card`

### Types

- `Cliente` da `@/types/cliente`

### Icons

- `User` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Vista Griglia**: Grid responsive con card clienti
2. **Header**: Titolo con icona e conteggio totale
3. **Card Rendering**: Renderizza ClienteCard per ogni cliente

### Funzionalità Avanzate

- **Grid Responsive**: 1 colonna mobile, 2 tablet, 3 desktop
- **Header Informazioni**: Mostra totale clienti
- **Spacing**: Gap tra card

### UI/UX

- Layout grid responsive
- Header con icona e conteggio
- Card ben spaziate
- Padding container

## 🎨 Struttura UI

```
div (p-6)
  ├── Header
  │   ├── Icona User
  │   └── Titolo "Lista Clienti (X)"
  └── div (grid 1/2/3 colonne, gap-4)
      └── ClienteCard (per ogni cliente)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClientiGridView } from '@/components/dashboard/clienti/clienti-grid-view'

function ClientsPage() {
  const clienti = [
    // ... array clienti
  ]

  return <ClientiGridView clienti={clienti} total={clienti.length} />
}
```

## 🔍 Note Tecniche

### Grid Layout

- Mobile: `grid-cols-1`
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-3`

### Limitazioni

- Solo visualizzazione (nessuna azione)
- Grid fisso (non configurabile)
- Dipende da ClienteCard per funzionalità

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
