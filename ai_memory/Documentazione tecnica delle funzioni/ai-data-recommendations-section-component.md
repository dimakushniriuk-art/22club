# Componente: AIDataRecommendationsSection

## 📋 Descrizione

Sezione modulare per raccomandazioni AI data. Visualizza array raccomandazioni con priorità (alta, media, bassa) e badge colorati. Utilizzata in `AthleteAIDataTab`. Solo visualizzazione (non editabile).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/ai-data/ai-data-recommendations-section.tsx`

## 🔧 Props

```typescript
interface AIDataRecommendationsSectionProps {
  raccomandazioni: Raccomandazione[]
  getPrioritaBadge: (priorita: 'alta' | 'media' | 'bassa') => { color: string; text: string }
}
```

## ⚙️ Funzionalità

- Lista card raccomandazioni con priorità badge
- Badge colorati per priorità (destructive/warning/secondary)
- Empty state (null se array vuoto)
- Solo visualizzazione (non editabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
