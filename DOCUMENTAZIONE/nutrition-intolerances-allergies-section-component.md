# Componente: NutritionIntolerancesAllergiesSection

## 📋 Descrizione

Sezione modulare per intolleranze e allergie alimentari. Gestisce array intolleranze e allergie con add/remove. Utilizzata in `AthleteNutritionTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/nutrition/nutrition-intolerances-allergies-section.tsx`

## 🔧 Props

```typescript
interface NutritionIntolerancesAllergiesSectionProps {
  isEditing: boolean
  intolleranze: string[]
  allergie: string[]
  newIntolleranza: string
  newAllergia: string
  nutrition: { intolleranze_alimentari, allergie_alimentari } | null
  onIntolleranzaAdd/Remove, onAllergiaAdd/Remove, onNewIntolleranzaChange, onNewAllergiaChange
}
```

## ⚙️ Funzionalità

- Input + bottone aggiungi per intolleranze
- Lista badge intolleranze con rimozione
- Input + bottone aggiungi per allergie
- Lista badge allergie con rimozione
- Grid layout 2 colonne quando editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
