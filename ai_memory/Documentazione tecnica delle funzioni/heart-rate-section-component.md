# Componente: HeartRateSection

## 📋 Descrizione

Sezione modulare per battito cardiaco smart tracking. Gestisce battito cardiaco medio, max e min (bpm) con input numerici. Utilizzata in `AthleteSmartTrackingTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/smart-tracking/heart-rate-section.tsx`

## 🔧 Props

```typescript
interface HeartRateSectionProps {
  isEditing: boolean
  battitoCardiacoMedio: number | null
  battitoCardiacoMax: number | null
  battitoCardiacoMin: number | null
  onBattitoCardiacoMedioChange: (value: number | null) => void
  onBattitoCardiacoMaxChange: (value: number | null) => void
  onBattitoCardiacoMinChange: (value: number | null) => void
}
```

## ⚙️ Funzionalità

- Input battito cardiaco medio (bpm)
- Input battito cardiaco max (bpm)
- Input battito cardiaco min (bpm)
- Grid layout 3 colonne
- Sanitizzazione input numerici
- Visualizzazione read-only quando non editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
