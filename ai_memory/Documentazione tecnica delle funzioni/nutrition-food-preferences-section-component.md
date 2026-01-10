# Componente: NutritionFoodPreferencesSection

## 📋 Descrizione

Sezione modulare per alimenti preferiti e evitati. Gestisce array alimenti preferiti e alimenti evitati con add/remove. Utilizzata in `AthleteNutritionTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/nutrition/nutrition-food-preferences-section.tsx`

## 🔧 Props

```typescript
interface NutritionFoodPreferencesSectionProps {
  isEditing: boolean
  alimentiPreferiti: string[]
  alimentiEvitati: string[]
  newAlimentoPreferito: string
  newAlimentoEvitato: string
  nutrition: { alimenti_preferiti, alimenti_evitati } | null
  onAlimentoPreferitoAdd/Remove, onAlimentoEvitatoAdd/Remove, onNewAlimentoPreferitoChange, onNewAlimentoEvitatoChange
}
```

## ⚙️ Funzionalità

- Input + bottone aggiungi per alimenti preferiti
- Lista badge alimenti preferiti con rimozione
- Input + bottone aggiungi per alimenti evitati
- Lista badge alimenti evitati con rimozione
- Grid layout 2 colonne quando editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
