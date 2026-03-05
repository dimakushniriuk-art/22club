# CommunicationsSearch Component

## Descrizione

Componente barra di ricerca per filtrare le comunicazioni. Fornisce un input con icona di ricerca integrata e styling coerente con il design system.

## Percorso File

`src/components/communications/communications-search.tsx`

## Props

### Interface

```typescript
interface CommunicationsSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}
```

### Props Dettagliate

- `searchTerm`: `string` - **Obbligatorio** - Valore corrente del termine di ricerca
- `onSearchChange`: `(value: string) => void` - **Obbligatorio** - Callback chiamato quando l'utente modifica il termine di ricerca

## Dipendenze

### Componenti UI

- `@/components/ui` - `Card`, `CardContent`, `Input`

### Librerie Esterne

- `lucide-react` - `Search` (icona)

## Funzionalità

### Funzionalità Principali

1. **Input Ricerca**: Campo di input con placeholder "Cerca comunicazione..."
2. **Icona Ricerca**: Icona integrata nell'input tramite prop `leftIcon`
3. **Styling Avanzato**: Card con gradiente, backdrop blur e effetti hover

### Struttura UI

- Card con variant "trainer" e gradiente blu
- Input con icona di ricerca a sinistra
- Effetti visivi: gradiente overlay, shadow, border animato

## Esempi d'Uso

```tsx
import { CommunicationsSearch } from '@/components/communications'
import { useState } from 'react'

function CommunicationsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div>
      <CommunicationsSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      {/* Lista comunicazioni filtrate */}
    </div>
  )
}
```

## Note Tecniche

- Componente controllato (controlled component) - il valore è gestito dal parent
- Utilizza Card component con variant "trainer" per styling coerente
- Input supporta prop `leftIcon` per icona integrata
- Design con gradiente e effetti visivi per migliorare UX
- Responsive e accessibile

## Stato Componente

✅ **Completo** - Componente funzionante e utilizzato in produzione
