# Componente: WorkoutWizardStep5

## 📋 Descrizione

Quinto e ultimo step del wizard per la creazione di schede di allenamento. Mostra un riepilogo completo di tutte le informazioni inserite prima del salvataggio finale.

## 📁 Percorso File

`src/components/workout/wizard-steps/workout-wizard-step-5.tsx`

## 🔧 Props

```typescript
interface WorkoutWizardStep5Props {
  wizardData: WorkoutWizardData
  athletes: Array<{ id: string; name: string; email: string }>
}
```

### Dettaglio Props

- **`wizardData`** (WorkoutWizardData, required): Dati completi del wizard da riepilogare
- **`athletes`** (array, required): Lista degli atleti (per mostrare nome atleta selezionato)

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Check`, `List`, `User`, `Calendar`, `Dumbbell` da `lucide-react`

### Types

- `WorkoutWizardData` da `@/types/workout`

## ⚙️ Funzionalità

### Core

1. **Riepilogo Scheda**: Mostra nome scheda, atleta selezionato, numero giorni e numero totale esercizi
2. **Note Aggiuntive**: Mostra le note se presenti
3. **Statistiche**: Calcola e mostra statistiche aggregate (giorni, esercizi totali)

### Calcoli

- **Totale Esercizi**: Somma di tutti gli esercizi di tutti i giorni
- **Atleta Selezionato**: Cerca l'atleta nella lista tramite `athlete_id`

### UI/UX

- Card principale con riepilogo informazioni
- Card separata per note (se presenti)
- Icone per ogni informazione
- Badge per contatori
- Layout pulito e leggibile

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header (titolo + descrizione)
  └── Riepilogo
      ├── Card "Riepilogo scheda"
      │   ├── Nome scheda (icona List)
      │   ├── Atleta (icona User)
      │   ├── Giorni (icona Calendar, Badge)
      │   └── Esercizi totali (icona Dumbbell, Badge)
      └── Card "Note aggiuntive" (se presenti)
          └── Testo note (whitespace-pre-wrap)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutWizardStep5 } from '@/components/workout/wizard-steps/workout-wizard-step-5'

function WizardComponent() {
  return <WorkoutWizardStep5 wizardData={wizardData} athletes={athletes} />
}
```

## 🔍 Note Tecniche

### Ricerca Atleta

- Cerca l'atleta nella lista `athletes` tramite `wizardData.athlete_id`
- Se non trovato, mostra "Non selezionato" in corsivo

### Calcolo Esercizi Totali

```typescript
const totalExercises = wizardData.days.reduce((total, day) => total + day.exercises.length, 0)
```

### Formattazione Note

- Utilizza `whitespace-pre-wrap` per preservare gli a capo nelle note

### Data Flow

- Il componente è read-only (non modifica dati)
- Mostra solo i dati ricevuti tramite props
- Il salvataggio viene gestito dal parent tramite pulsante nel footer

### Limitazioni

- Non mostra il dettaglio completo di ogni giorno (solo statistiche aggregate)
- Non permette modifiche (solo visualizzazione)
- Non mostra i parametri degli esercizi (solo conteggi)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
