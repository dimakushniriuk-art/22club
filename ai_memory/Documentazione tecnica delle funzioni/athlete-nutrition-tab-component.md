# Componente: AthleteNutritionTab

## 📋 Descrizione

Tab nutrizione per profilo atleta (vista PT). Visualizza e modifica dati nutrizionali, obiettivi calorici, macronutrienti, intolleranze/allergie, preferenze alimentari, orari pasti, spuntini, note. Utilizza sezioni modulari (NutritionGoalsSection, NutritionMacronutrientsSection, ecc.).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-nutrition-tab.tsx`

## 🔧 Props

```typescript
interface AthleteNutritionTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- Custom hooks: `useAthleteNutrition`, `useAthleteNutritionForm`

### UI Components

- `Button` da `@/components/ui`
- `useToast` da `@/components/ui/toast`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `Utensils`, `Edit`, `Save`, `X` da `lucide-react`

### Componenti Interni

- `NutritionGoalsSection`, `NutritionMacronutrientsSection`, `NutritionIntolerancesAllergiesSection`, `NutritionFoodPreferencesSection`, `NutritionMealTimesSection`, `NutritionNotesSection` da `./nutrition`

## ⚙️ Funzionalità

### Core

1. **Gestione Dati Nutrizionali**: Visualizza e modifica dati nutrizionali completi
2. **Sezioni Modulari**: Organizza dati in sezioni (obiettivi, macronutrienti, intolleranze, preferenze, pasti, note)
3. **Gestione Array**: Aggiungi/rimuovi elementi array (intolleranze, allergie, preferenze, spuntini)
4. **Aggiornamento Macronutrienti**: Update macronutrienti e orari pasti

### Sezioni

1. **Obiettivi**: Obiettivi calorici, dieta
2. **Macronutrienti**: Proteine, carboidrati, grassi
3. **Intolleranze e Allergie**: Lista intolleranze e allergie
4. **Preferenze Alimentari**: Preferenze cibo
5. **Orari Pasti**: Orari pasti e spuntini
6. **Note**: Note aggiuntive

### Funzionalità Avanzate

- **Update Macronutrienti**: Funzione per aggiornare macronutrienti
- **Update Orario Pasto**: Funzione per aggiornare orari pasti
- **Gestione Spuntini**: Aggiungi/rimuovi spuntini
- **Toast Notifications**: Notifiche success/error

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
      ├── NutritionGoalsSection
      ├── NutritionMacronutrientsSection
      ├── NutritionIntolerancesAllergiesSection
      ├── NutritionFoodPreferencesSection
      ├── NutritionMealTimesSection
      └── NutritionNotesSection
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteNutritionTab } from '@/components/dashboard/athlete-profile/athlete-nutrition-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteNutritionTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Update Macronutrienti

```typescript
updateMacronutrienti: (data) => {
  setFormData({
    ...formData,
    macronutrienti: { ...formData.macronutrienti, ...data },
  })
}
```

### Limitazioni

- Dipende da sezioni modulari (non standalone)
- Gestione array complessa

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
