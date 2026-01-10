# Componente: NutritionNotesSection

## 📋 Descrizione

Sezione modulare per note nutrizionali. Textarea editabile per note aggiuntive nutrizione (max 2000 caratteri). Utilizzata in `AthleteNutritionTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/nutrition/nutrition-notes-section.tsx`

## 🔧 Props

```typescript
interface NutritionNotesSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: { note_nutrizionali } | null
  onFormDataChange: (data: Partial<AthleteNutritionDataUpdate>) => void
}
```

## ⚙️ Funzionalità

- Textarea editabile quando editing
- Visualizzazione read-only quando non editing
- Sanitizzazione input (max 2000 caratteri)
- Empty state se nessuna nota

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
