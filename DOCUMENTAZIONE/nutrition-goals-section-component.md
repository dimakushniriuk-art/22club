# Componente: NutritionGoalsSection

## 📋 Descrizione

Sezione modulare per obiettivi nutrizionali. Gestisce obiettivo nutrizionale (dimagrimento, massa, mantenimento, performance, salute), calorie giornaliere target, dieta seguita (onnivora, vegetariana, vegana, keto, paleo, mediterranea, altro). Utilizzata in `AthleteNutritionTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/nutrition/nutrition-goals-section.tsx`

## 🔧 Props

```typescript
interface NutritionGoalsSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: { obiettivo_nutrizionale; calorie_giornaliere_target; dieta_seguita } | null
  onFormDataChange: (data: Partial<AthleteNutritionDataUpdate>) => void
}
```

## ⚙️ Funzionalità

- Select obiettivo nutrizionale (5 opzioni)
- Input calorie giornaliere target (number)
- Select dieta seguita (7 opzioni)
- Sanitizzazione input numerici

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
