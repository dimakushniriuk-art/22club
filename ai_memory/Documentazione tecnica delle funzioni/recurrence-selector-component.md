# Componente: RecurrenceSelector

## 📋 Descrizione

Componente per selezionare e configurare la ricorrenza di un appuntamento. Supporta ricorrenze giornaliere, settimanali, mensili e annuali con opzioni avanzate.

## 📁 Percorso File

`src/components/appointments/recurrence-selector.tsx`

## 🔧 Props

```typescript
interface RecurrenceSelectorProps {
  value: RecurrenceConfig
  onChange: (config: RecurrenceConfig) => void
  startDate?: string // Data inizio appuntamento (YYYY-MM-DD)
}
```

### Dettaglio Props

- **`value`** (RecurrenceConfig, required): Configurazione ricorrenza corrente
- **`onChange`** (function, required): Callback quando cambia la configurazione
- **`startDate`** (string, optional): Data inizio appuntamento per calcoli

## 📦 Dipendenze

### UI Components

- `Button` da `@/components/ui/button`
- `Input` da `@/components/ui/input`
- `Label` da `@/components/ui/label`
- `Repeat`, `Calendar`, `X` da `lucide-react`

### Utilities

- `DAYS_OF_WEEK` da `@/lib/recurrence-utils`

### Types

- `RecurrenceConfig`, `RecurrenceType` da `@/lib/recurrence-utils`

## ⚙️ Funzionalità

### Core

1. **Selezione Tipo**: Scegli tipo ricorrenza (giornaliera, settimanale, etc.)
2. **Configurazione Intervallo**: Imposta intervallo (ogni N giorni/settimane)
3. **Giorni Settimana**: Seleziona giorni specifici per ricorrenza settimanale
4. **Fine Ricorrenza**: Configura data fine o numero occorrenze

### Tipi Ricorrenza

- **Nessuna**: Nessuna ricorrenza
- **Giornaliera**: Ogni N giorni
- **Settimanale**: Ogni N settimane, giorni specifici
- **Mensile**: Ogni N mesi, stesso giorno
- **Annuale**: Ogni anno, stessa data

### Opzioni Fine

- **Data Fine**: Ricorrenza fino a data specifica
- **Numero Occorrenze**: Ricorrenza per N volte
- **Nessuna Fine**: Ricorrenza infinita

### UI/UX

- Dropdown/popover per selezione tipo
- Input per intervallo
- Checkbox per giorni settimana
- Input date per fine ricorrenza
- Input numero per occorrenze
- Layout responsive

## 🎨 Struttura UI

```
Container
  ├── Button Trigger (mostra label ricorrenza)
  └── Popover/Dropdown (se aperto)
      ├── Opzioni Tipo
      │   ├── "Nessuna ricorrenza"
      │   ├── "Ogni giorno"
      │   ├── "Ogni settimana"
      │   ├── "Ogni mese"
      │   └── "Ogni anno"
      ├── Input Intervallo (se applicabile)
      ├── Selettore Giorni (se settimanale)
      │   └── Checkbox per ogni giorno
      └── Opzioni Fine
          ├── Radio "Data fine"
          │   └── Input date
          ├── Radio "Numero occorrenze"
          │   └── Input numero
          └── Radio "Nessuna fine"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { RecurrenceSelector } from '@/components/appointments/recurrence-selector'

function MyComponent() {
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({
    type: 'none',
  })

  return <RecurrenceSelector value={recurrence} onChange={setRecurrence} startDate="2025-02-05" />
}
```

## 🔍 Note Tecniche

### Gestione Stato

Il componente gestisce uno stato interno `isOpen` per controllare la visibilità del popover.

### Logica Mutua Esclusiva

- Se si seleziona "Data fine", `count` viene rimosso
- Se si seleziona "Numero occorrenze", `endDate` viene rimosso

### Formattazione Label

La label viene generata dinamicamente in base alla configurazione:

- "Nessuna ricorrenza" se `type === 'none'`
- "Ogni giorno" / "Ogni N giorni" se `type === 'daily'`
- "Ogni settimana: Lun, Mer, Ven" se `type === 'weekly'`
- etc.

### Limitazioni

- Non supporta ricorrenze complesse (es. "ogni primo lunedì del mese")
- Non valida date fine rispetto a data inizio
- Non supporta timezone

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
