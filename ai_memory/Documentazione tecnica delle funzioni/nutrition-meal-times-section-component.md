# Componente: NutritionMealTimesSection

## 📋 Descrizione

Sezione modulare per preferenze orari pasti. Gestisce orari pasti (colazione, pranzo, cena) e array spuntini con add/remove. Utilizzata in `AthleteNutritionTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/nutrition/nutrition-meal-times-section.tsx`

## 🔧 Props

```typescript
interface NutritionMealTimesSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: { preferenze_orari_pasti } | null
  newSpuntino: string
  onOrarioPastoUpdate: (pasto: keyof PreferenzeOrariPasti, value: string | null) => void
  onSpuntinoAdd: (orario: string) => void
  onSpuntinoRemove: (index: number) => void
  onNewSpuntinoChange: (value: string) => void
}
```

## ⚙️ Funzionalità

- Input orario colazione (time)
- Input orario pranzo (time)
- Input orario cena (time)
- Input + bottone aggiungi per spuntini
- Lista badge spuntini con rimozione

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
