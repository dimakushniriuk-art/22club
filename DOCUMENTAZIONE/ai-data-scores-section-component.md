# Componente: AIDataScoresSection

## 📋 Descrizione

Sezione modulare per score AI data. Gestisce score engagement e score progresso (0-100) con slider, input numerico e progress bar. Utilizzata in `AthleteAIDataTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/ai-data/ai-data-scores-section.tsx`

## 🔧 Props

```typescript
interface AIDataScoresSectionProps {
  isEditing: boolean
  formData: AthleteAIDataUpdate
  aiData: { score_engagement; score_progresso } | null
  onFormDataChange: (data: Partial<AthleteAIDataUpdate>) => void
}
```

## ⚙️ Funzionalità

- Slider + input score engagement (0-100)
- Progress bar visualizzazione score
- Slider + input score progresso (0-100)
- Grid layout 2 colonne
- Sanitizzazione input (0-100)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
