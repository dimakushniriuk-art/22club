# CommunicationsHeader Component

## Descrizione

Componente header per la sezione comunicazioni. Fornisce il titolo della sezione, una descrizione e un bottone per creare una nuova comunicazione.

## Percorso File

`src/components/communications/communications-header.tsx`

## Props

### Interface

```typescript
interface CommunicationsHeaderProps {
  onNewCommunication: () => void
}
```

### Props Dettagliate

- `onNewCommunication`: `() => void` - **Obbligatorio** - Callback chiamato quando l'utente clicca sul bottone "Nuova Comunicazione"

## Dipendenze

### Componenti UI

- `@/components/ui` - `Button`

### Librerie Esterne

- `lucide-react` - `Plus` (icona)

## Funzionalità

### Funzionalità Principali

1. **Visualizzazione Header**: Mostra il titolo "Comunicazioni" e una descrizione
2. **Bottone Nuova Comunicazione**: Bottone con gradiente blu-indigo che triggera la creazione di una nuova comunicazione
3. **Responsive Design**: Layout adattivo con flex-col su mobile e flex-row su desktop

### Struttura UI

- Titolo principale con dimensioni responsive (text-2xl sm:text-3xl lg:text-4xl)
- Descrizione secondaria
- Bottone con gradiente e effetti hover/shadow

## Esempi d'Uso

```tsx
import { CommunicationsHeader } from '@/components/communications'

function CommunicationsPage() {
  const handleNewCommunication = () => {
    // Logica per aprire modal creazione comunicazione
    setModalOpen(true)
  }

  return (
    <div>
      <CommunicationsHeader onNewCommunication={handleNewCommunication} />
      {/* Resto del contenuto */}
    </div>
  )
}
```

## Note Tecniche

- Componente puramente presentazionale (no stato interno)
- Utilizza Tailwind CSS per styling con classi responsive
- Bottone con gradiente personalizzato e animazioni di transizione
- Design coerente con il sistema di design dell'applicazione (dark mode, palette blu-indigo)

## Stato Componente

✅ **Completo** - Componente funzionante e utilizzato in produzione
