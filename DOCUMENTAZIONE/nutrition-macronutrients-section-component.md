# Componente: NutritionMacronutrientsSection

## 📋 Descrizione

Sezione modulare per macronutrienti target. Gestisce proteine, carboidrati, grassi (in grammi) con input numerici. Utilizzata in `AthleteNutritionTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/nutrition/nutrition-macronutrients-section.tsx`

## 🔧 Props

```typescript
interface NutritionMacronutrientsSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: { macronutrienti_target } | null
  onMacronutrientiUpdate: (field: keyof MacronutrientiTarget, value: number | null) => void
}
```

## ⚙️ Funzionalità

- Input proteine (g) con min/max
- Input carboidrati (g) con min/max
- Input grassi (g) con min/max
- Visualizzazione read-only quando non editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
