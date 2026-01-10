# Componente: AIDataPatternsSection

## 📋 Descrizione

Sezione modulare per pattern rilevati AI data. Visualizza array pattern rilevati con tipo, frequenza e descrizione. Utilizzata in `AthleteAIDataTab`. Solo visualizzazione (non editabile).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/ai-data/ai-data-patterns-section.tsx`

## 🔧 Props

```typescript
interface AIDataPatternsSectionProps {
  patternRilevati: PatternRilevato[]
}
```

## ⚙️ Funzionalità

- Lista card pattern con tipo badge, frequenza e descrizione
- Empty state (null se array vuoto)
- Solo visualizzazione (non editabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
