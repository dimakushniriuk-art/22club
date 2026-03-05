# Componente: AIDataPredictionsSection

## 📋 Descrizione

Sezione modulare per predizioni performance AI data. Visualizza array predizioni performance con metrica, data target, confidenza e valore predetto. Utilizzata in `AthleteAIDataTab`. Solo visualizzazione (non editabile).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/ai-data/ai-data-predictions-section.tsx`

## 🔧 Props

```typescript
interface AIDataPredictionsSectionProps {
  predizioniPerformance: PredizionePerformance[]
}
```

## ⚙️ Funzionalità

- Lista card predizioni con metrica, data target, badge confidenza e valore predetto
- Formattazione data target
- Empty state (null se array vuoto)
- Solo visualizzazione (non editabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
