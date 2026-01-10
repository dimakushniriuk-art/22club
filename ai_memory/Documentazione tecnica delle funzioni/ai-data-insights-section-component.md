# Componente: AIDataInsightsSection

## 📋 Descrizione

Sezione modulare per insights aggregati AI data. Visualizza oggetto insights aggregati come key-value pairs. Utilizzata in `AthleteAIDataTab`. Solo visualizzazione (non editabile).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/ai-data/ai-data-insights-section.tsx`

## 🔧 Props

```typescript
interface AIDataInsightsSectionProps {
  insightsAggregati: Record<string, unknown>
}
```

## ⚙️ Funzionalità

- Lista key-value pairs da oggetto insights
- Formattazione key (replace underscore con spazio, capitalize)
- Formattazione value (JSON stringify se oggetto)
- Empty state (null se oggetto vuoto)
- Solo visualizzazione (non editabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
