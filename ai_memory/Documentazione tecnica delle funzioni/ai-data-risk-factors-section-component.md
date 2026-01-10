# Componente: AIDataRiskFactorsSection

## 📋 Descrizione

Sezione modulare per fattori di rischio AI data. Visualizza array fattori di rischio come badge rossi. Utilizzata in `AthleteAIDataTab`. Solo visualizzazione (non editabile).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/ai-data/ai-data-risk-factors-section.tsx`

## 🔧 Props

```typescript
interface AIDataRiskFactorsSectionProps {
  fattoriRischio: string[]
}
```

## ⚙️ Funzionalità

- Lista badge fattori di rischio (variant destructive)
- Empty state (null se array vuoto)
- Solo visualizzazione (non editabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
