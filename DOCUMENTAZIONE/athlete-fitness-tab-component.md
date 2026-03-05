# Componente: AthleteFitnessTab

## 📋 Descrizione

Tab fitness per profilo atleta (vista PT). Visualizza e modifica dati fitness, obiettivi, esperienza, programmi di allenamento, attività precedenti, zone problematiche, infortuni pregressi. Utilizza sezioni modulari (FitnessExperienceGoalsSection, FitnessTrainingProgramSection, ecc.).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-fitness-tab.tsx`

## 🔧 Props

```typescript
interface AthleteFitnessTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- `useMemo` da `react`
- Custom hooks: `useAthleteFitness`, `useAthleteFitnessForm`

### UI Components

- `Button` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `Dumbbell`, `Edit`, `Save`, `X` da `lucide-react`

### Componenti Interni

- `FitnessExperienceGoalsSection`, `FitnessTrainingProgramSection`, `FitnessActivitiesZonesSection`, `FitnessInjuriesSection`, `FitnessNotesSection` da `./fitness`

## ⚙️ Funzionalità

### Core

1. **Gestione Dati Fitness**: Visualizza e modifica dati fitness completi
2. **Sezioni Modulari**: Organizza dati in sezioni (esperienza/obiettivi, programma, attività/zone, infortuni, note)
3. **Gestione Array**: Aggiungi/rimuovi elementi array (attività, zone, infortuni)
4. **Toggle Obiettivi**: Toggle obiettivi secondari e preferenze orario

### Sezioni

1. **Esperienza e Obiettivi**: Livello esperienza, obiettivi principali/secondari
2. **Programma Allenamento**: Tipo programma, frequenza, durata
3. **Attività e Zone**: Attività precedenti, zone problematiche
4. **Infortuni**: Storico infortuni pregressi
5. **Note**: Note aggiuntive

### Funzionalità Avanzate

- **Memoizzazione**: `useMemo` per liste array
- **Form Dinamico**: Aggiungi/rimuovi elementi array
- **Toggle Preferenze**: Toggle obiettivi secondari e preferenze orario
- **Gestione Infortuni**: Form per aggiungere infortuni

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
      ├── FitnessExperienceGoalsSection
      ├── FitnessTrainingProgramSection
      ├── FitnessActivitiesZonesSection
      ├── FitnessInjuriesSection
      └── FitnessNotesSection
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteFitnessTab } from '@/components/dashboard/athlete-profile/athlete-fitness-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteFitnessTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Memoizzazione Liste

```typescript
const attivitaList = useMemo(
  () => formData.attivita_precedenti || [],
  [formData.attivita_precedenti],
)
```

### Limitazioni

- Dipende da sezioni modulari (non standalone)
- Gestione array complessa

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
