# Componente: SleepSection

## 📋 Descrizione

Sezione modulare per sonno smart tracking. Gestisce ore sonno (number) e qualità sonno (ottima, buona, media, scarsa) con select. Utilizzata in `AthleteSmartTrackingTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/smart-tracking/sleep-section.tsx`

## 🔧 Props

```typescript
interface SleepSectionProps {
  isEditing: boolean
  oreSonno: number | null
  qualitaSonno: QualitaSonnoEnum | null
  onOreSonnoChange: (value: number | null) => void
  onQualitaSonnoChange: (value: QualitaSonnoEnum | null) => void
}
```

## ⚙️ Funzionalità

- Input ore sonno (number)
- Select qualità sonno (4 opzioni: ottima, buona, media, scarsa)
- Grid layout 2 colonne
- Sanitizzazione input numerici
- Visualizzazione read-only quando non editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
