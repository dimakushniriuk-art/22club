# Componente: AthleteMotivationalTab

## 📋 Descrizione

Tab motivazionale per profilo atleta (vista PT). Visualizza e modifica dati motivazionali, motivazioni principali/secondarie, ostacoli percepiti, preferenze comunicazione, storico abbandoni, note motivazionali. Utilizza sezioni modulari (MotivationalMainSection, MotivationalMotivationsObstaclesSection, ecc.).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-motivational-tab.tsx`

## 🔧 Props

```typescript
interface AthleteMotivationalTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- `useMemo` da `react`
- Custom hooks: `useAthleteMotivational`, `useAthleteMotivationalForm`

### UI Components

- `Button` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `Target`, `Edit`, `Save`, `X` da `lucide-react`

### Componenti Interni

- `MotivationalMainSection`, `MotivationalMotivationsObstaclesSection`, `MotivationalPreferencesSection`, `MotivationalAbandonmentsSection`, `MotivationalNotesSection` da `./motivational`

## ⚙️ Funzionalità

### Core

1. **Gestione Dati Motivazionali**: Visualizza e modifica dati motivazionali completi
2. **Sezioni Modulari**: Organizza dati in sezioni (principale, motivazioni/ostacoli, preferenze, abbandoni, note)
3. **Gestione Array**: Aggiungi/rimuovi elementi array (motivazioni secondarie, ostacoli, abbandoni)
4. **Toggle Preferenze**: Toggle preferenze comunicazione

### Sezioni

1. **Principale**: Motivazione principale, livello motivazione
2. **Motivazioni e Ostacoli**: Motivazioni secondarie, ostacoli percepiti
3. **Preferenze**: Preferenze comunicazione
4. **Abbandoni**: Storico abbandoni
5. **Note**: Note motivazionali

### Funzionalità Avanzate

- **Memoizzazione**: `useMemo` per liste array
- **Form Dinamico**: Aggiungi/rimuovi elementi array
- **Toggle Preferenze**: Toggle preferenze comunicazione
- **Gestione Abbandoni**: Form per aggiungere abbandoni

### UI/UX

- Header con titolo e bottone modifica
- Grid layout con sezioni
- Form inline per array items
- Bottoni salva/annulla

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header + Button Modifica
  └── Grid (2 colonne)
      ├── MotivationalMainSection
      ├── MotivationalMotivationsObstaclesSection
      ├── MotivationalPreferencesSection
      ├── MotivationalAbandonmentsSection
      └── MotivationalNotesSection
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteMotivationalTab } from '@/components/dashboard/athlete-profile/athlete-motivational-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteMotivationalTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Memoizzazione Liste

```typescript
const motivazioniList = useMemo(
  () => formData.motivazioni_secondarie || [],
  [formData.motivazioni_secondarie],
)
```

### Limitazioni

- Dipende da sezioni modulari (non standalone)
- Gestione array complessa

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
