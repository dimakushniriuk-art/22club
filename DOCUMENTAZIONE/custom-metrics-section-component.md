# Componente: CustomMetricsSection

## 📋 Descrizione

Sezione modulare per metriche custom smart tracking. Visualizza oggetto metriche custom come key-value pairs. Utilizzata in `AthleteSmartTrackingTab`. Solo visualizzazione (non editabile).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/smart-tracking/custom-metrics-section.tsx`

## 🔧 Props

```typescript
interface CustomMetricsSectionProps {
  metricaCustom: Record<string, unknown> | null
}
```

## ⚙️ Funzionalità

- Lista key-value pairs da oggetto metriche custom
- Formattazione key (replace underscore con spazio, capitalize)
- Empty state (null se oggetto vuoto)
- Solo visualizzazione (non editabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
